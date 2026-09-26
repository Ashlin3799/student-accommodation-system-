const Room = require('../models/Room');
// NOTE: Mongoose validation errors, duplicate-key errors (code 11000) and
// CastErrors are NOT formatted here — they're passed to next(err) and
// handled once, centrally, by middleware/errorhandler.js.

// GET /api/rooms
// Public, student-facing room catalogue
exports.getRooms = async (req, res, next) => {
  try {
    const {
      search,
      type,
      status,
      minPrice,
      maxPrice,
      sort
    } = req.query;

    const filter = {};

    // Filter by room type
    if (type) {
      filter.type = type;
    }

    // Filter by room status
    if (status) {
      filter.status = status;
    }

    // Filter by monthly price
    if (minPrice || maxPrice) {
      filter.pricePerMonth = {};

      if (minPrice) {
        filter.pricePerMonth.$gte = Number(minPrice);
      }

      if (maxPrice) {
        filter.pricePerMonth.$lte = Number(maxPrice);
      }
    }

    // Search room number, building or amenities
    if (search) {
      filter.$or = [
        { roomNumber: { $regex: search, $options: 'i' } },
        { building: { $regex: search, $options: 'i' } },
        { amenities: { $regex: search, $options: 'i' } }
      ];
    }

    // Sorting
    let sortOption = { createdAt: -1 };

    if (sort === 'price_asc') {
      sortOption = { pricePerMonth: 1 };
    } else if (sort === 'price_desc') {
      sortOption = { pricePerMonth: -1 };
    } else if (sort === 'oldest') {
      sortOption = { createdAt: 1 };
    } else if (sort === 'newest') {
      sortOption = { createdAt: -1 };
    }

    const rooms = await Room.find(filter).sort(sortOption);

    res.json(rooms);
  } catch (err) {
    next(err);
  }
};

// GET /api/rooms/:id
exports.getRoom = async (req, res, next) => {
  try {
    const room = await Room.findById(req.params.id);

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    res.json(room);
  } catch (err) {
    next(err);
  }
};

// POST /api/rooms
exports.createRoom = async (req, res, next) => {
  try {
    const {
      roomNumber,
      building,
      floor,
      type,
      capacity,
      occupied,
      pricePerMonth,
      currency,
      status,
      amenities,
      images,
      description
    } = req.body;

    if (
      !roomNumber ||
      !building ||
      floor === undefined ||
      !type ||
      !capacity ||
      pricePerMonth === undefined
    ) {
      return res.status(400).json({
        success: false,
        message:
          'roomNumber, building, floor, type, capacity and pricePerMonth are required'
      });
    }

    const room = await Room.create({
      roomNumber,
      building,
      floor,
      type,
      capacity,
      occupied: occupied || 0,
      pricePerMonth,
      currency: currency || 'USD',
      status: status || 'available',
      amenities: amenities || [],
      images: images || [],
      description: description || ''
    });

        res.status(201).json(room);
  } catch (err) {
    next(err);
  }
};

// PUT /api/rooms/:id
// Admin update — e.g. change status, price, capacity, occupied count.
// Only touches fields that are actually sent, so partial updates
// (like flipping a room to "maintenance") don't require resending
// the whole record.
exports.updateRoom = async (req, res, next) => {
  try {
    const allowedFields = [
      'roomNumber',
      'building',
      'floor',
      'type',
      'capacity',
      'occupied',
      'pricePerMonth',
      'currency',
      'status',
      'amenities',
      'images',
      'description'
    ];

    const updates = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid fields provided to update'
      });
    }

    if (
      updates.capacity !== undefined &&
      updates.occupied !== undefined &&
      Number(updates.occupied) > Number(updates.capacity)
    ) {
      return res.status(400).json({
        success: false,
        message: 'occupied cannot exceed capacity'
      });
    }

    const room = await Room.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true
    });

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    res.json(room);
  } catch (err) {
    next(err);
  }
};
// Adjust a room's occupied count by `delta` (+1 when an application is
// approved, -1 when a previously-approved application is rejected/reset).
// Clamped to [0, capacity] so it can never go negative or over-book a
// room. The Room schema's pre('save') hook takes care of flipping
// `status` between 'available' and 'occupied' as occupied changes.
// Used by the applications route — never called directly from a client.
exports.adjustRoomOccupancy = async (roomId, delta) => {
  if (!roomId) return null;

  let room;
  try {
    room = await Room.findById(roomId);
  } catch (err) {
    return null; // invalid/unknown room id — nothing to sync
  }

  if (!room) return null;

  const next = room.occupied + delta;
  room.occupied = Math.max(0, Math.min(next, room.capacity));

  await room.save();
  return room;
};

// DELETE /api/rooms/:id
exports.deleteRoom = async (req, res, next) => {
  try {
    const room = await Room.findByIdAndDelete(req.params.id);

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    res.json({
      success: true,
      message: 'Room deleted',
      room
    });
  } catch (err) {
    next(err);
  }
};