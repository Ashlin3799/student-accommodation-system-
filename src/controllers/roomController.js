const Room = require('../models/Room');

// GET /api/rooms
// Public, student-facing room catalogue
exports.getRooms = async (req, res) => {
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
    res.status(500).json({
      message: 'Failed to fetch rooms',
      error: err.message
    });
  }
};

// GET /api/rooms/:id
exports.getRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);

    if (!room) {
      return res.status(404).json({
        message: 'Room not found'
      });
    }

    res.json(room);
  } catch (err) {
    res.status(500).json({
      message: 'Failed to fetch room',
      error: err.message
    });
  }
};

// POST /api/rooms
exports.createRoom = async (req, res) => {
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
    if (err.code === 11000) {
      return res.status(409).json({
        message: 'Room number already exists'
      });
    }

    res.status(500).json({
      message: 'Failed to create room',
      error: err.message
    });
  }
};