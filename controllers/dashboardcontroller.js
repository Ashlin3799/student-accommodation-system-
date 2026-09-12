const Room = require('../src/models/Room');
const Application = require('../models/Application');
const Complaint = require('../models/Complaint');

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

const getApplicationStats = async () => {
  const result = await Application.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);

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

const getComplaintStats = async () => {
  const result = await Complaint.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);

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
    const [rooms, applications, complaints] = await Promise.all([
      getRoomStats(),
      getApplicationStats(),
      getComplaintStats()
    ]);

    res.status(200).json({
      success: true,
      message: 'Dashboard statistics retrieved successfully',
      data: {
        rooms,
        applications,
        complaints
      }
    });
  } catch (error) {
    next(error);
  }
};