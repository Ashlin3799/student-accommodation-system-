const Room = require('../models/Room');

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
