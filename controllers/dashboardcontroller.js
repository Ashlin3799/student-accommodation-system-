const Room = require('../src/models/Room');
const Application = require('../models/Application');
const Complaint = require('../models/Complaint');


const buildDateMatch = (startDate, endDate) => {
  const match = {};

  if (startDate || endDate) {
    match.createdAt = {};

    if (startDate) {
      const parsedStart = new Date(startDate);
      if (!Number.isNaN(parsedStart.getTime())) {
        match.createdAt.$gte = parsedStart;
      }
    }

    if (endDate) {
      const parsedEnd = new Date(endDate);
      if (!Number.isNaN(parsedEnd.getTime())) {
        // Treat the end date as inclusive of the whole day.
        parsedEnd.setHours(23, 59, 59, 999);
        match.createdAt.$lte = parsedEnd;
      }
    }

    if (Object.keys(match.createdAt).length === 0) {
      delete match.createdAt;
    }
  }

  return match;
};


const buildDateRange = (days, startDate, endDate) => {
  const dayKey = (d) => d.toISOString().slice(0, 10);

  let start;
  let end;

  if (startDate || endDate) {
    start = startDate ? new Date(startDate) : new Date(endDate);
    end = endDate ? new Date(endDate) : new Date();
  } else {
    end = new Date();
    start = new Date();
    start.setDate(start.getDate() - (Number(days) - 1));
  }

  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);

  const range = [];
  const cursor = new Date(start);

  while (cursor <= end) {
    range.push(dayKey(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }

  return range;
};

const getRoomStats = async () => {
  const result = await Room.aggregate([
    {
      $group: {
        _id: null,
        totalRooms: { $sum: 1 },
        totalCapacity: { $sum: '$capacity' },
        totalOccupied: { $sum: '$occupied' }
      }
    }
  ]);

  const stats = result[0] || {
    totalRooms: 0,
    totalCapacity: 0,
    totalOccupied: 0
  };

  const availableBeds = Math.max(
    stats.totalCapacity - stats.totalOccupied,
    0
  );

  const occupancyRate =
    stats.totalCapacity > 0
      ? Math.round((stats.totalOccupied / stats.totalCapacity) * 100)
      : 0;

  return {
    totalRooms: stats.totalRooms,
    totalCapacity: stats.totalCapacity,
    totalOccupied: stats.totalOccupied,
    availableBeds,
    occupancyRate
  };
};

const getApplicationStats = async (dateMatch = {}) => {
  const pipeline = [];

  if (Object.keys(dateMatch).length > 0) {
    pipeline.push({ $match: dateMatch });
  }

  pipeline.push({
    $group: {
      _id: '$status',
      count: { $sum: 1 }
    }
  });

  const result = await Application.aggregate(pipeline);

  const stats = {
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0
  };

  result.forEach((item) => {
    const status = String(item._id || '').toLowerCase();

    stats.total += item.count;

    if (status === 'pending') {
      stats.pending += item.count;
    } else if (status === 'approved') {
      stats.approved += item.count;
    } else if (status === 'rejected') {
      stats.rejected += item.count;
    }
  });

  return stats;
};

const getComplaintStats = async (dateMatch = {}) => {
  const pipeline = [];

  if (Object.keys(dateMatch).length > 0) {
    pipeline.push({ $match: dateMatch });
  }

  pipeline.push({
    $group: {
      _id: '$status',
      count: { $sum: 1 }
    }
  });

  const result = await Complaint.aggregate(pipeline);

  const stats = {
    total: 0,
    pending: 0,
    inProgress: 0,
    resolved: 0
  };

  result.forEach((item) => {
    const status = String(item._id || '').toLowerCase();

    stats.total += item.count;

    if (status === 'pending') {
      stats.pending += item.count;
    } else if (status === 'in progress') {
      stats.inProgress += item.count;
    } else if (status === 'resolved') {
      stats.resolved += item.count;
    }
  });

  return stats;
};

exports.getDashboardStats = async (req, res, next) => {
  try {
    const { startDate, endDate, category = 'all' } = req.query;
    const dateMatch = buildDateMatch(startDate, endDate);

    const includeRooms = category === 'all' || category === 'rooms';
    const includeApplications = category === 'all' || category === 'applications';
    const includeComplaints = category === 'all' || category === 'complaints';

    const [rooms, applications, complaints] = await Promise.all([
      includeRooms ? getRoomStats() : null,
      includeApplications ? getApplicationStats(dateMatch) : null,
      includeComplaints ? getComplaintStats(dateMatch) : null
    ]);

    const data = {};
    if (rooms) data.rooms = rooms;
    if (applications) data.applications = applications;
    if (complaints) data.complaints = complaints;

    res.status(200).json({
      success: true,
      message: 'Dashboard statistics retrieved successfully',
      filters: { startDate: startDate || null, endDate: endDate || null, category },
      data
    });
  } catch (error) {
    next(error);
  }
};


const getStatusTrend = async (Model, statusKeys, { days, startDate, endDate }) => {
  const dateMatch = buildDateMatch(startDate, endDate);

  // When no explicit range is given, fall back to the last N days.
  if (!dateMatch.createdAt) {
    const since = new Date();
    since.setDate(since.getDate() - (Number(days || 30) - 1));
    since.setHours(0, 0, 0, 0);
    dateMatch.createdAt = { $gte: since };
  }

  const pipeline = [
    { $match: dateMatch },
    {
      $group: {
        _id: {
          date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          status: '$status'
        },
        count: { $sum: 1 }
      }
    }
  ];

  const results = await Model.aggregate(pipeline);

  const labels = buildDateRange(days || 30, startDate, endDate);

  const series = {};
  statusKeys.forEach((key) => {
    series[key] = labels.map(() => 0);
  });

  results.forEach((row) => {
    const { date, status } = row._id;
    const labelIndex = labels.indexOf(date);
    if (labelIndex === -1) return;

    const matchedKey = statusKeys.find(
      (key) => key.toLowerCase() === String(status || '').toLowerCase()
    );
    if (matchedKey) {
      series[matchedKey][labelIndex] += row.count;
    }
  });

  return { labels, series };
};

exports.getDashboardTrends = async (req, res, next) => {
  try {
    const { days = 30, startDate, endDate } = req.query;
    const range = { days, startDate, endDate };

    const [applicationTrend, complaintTrend] = await Promise.all([
      getStatusTrend(Application, ['Pending', 'Approved', 'Rejected'], range),
      getStatusTrend(Complaint, ['Pending', 'In Progress', 'Resolved'], range)
    ]);

    res.status(200).json({
      success: true,
      message: 'Dashboard trends retrieved successfully',
      filters: { days: Number(days), startDate: startDate || null, endDate: endDate || null },
      data: {
        applications: applicationTrend,
        complaints: complaintTrend
      }
    });
  } catch (error) {
    next(error);
  }
};

// Exported for unit testing.
exports._internal = { buildDateMatch, buildDateRange, getStatusTrend };