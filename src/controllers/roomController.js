const Room = require('../models/Room');

// GET /api/rooms  — public, student-facing catalogue
exports.getRooms = async (req, res) => {
  try {
    const rooms = await Room.find().sort({ block: 1, roomNumber: 1 });
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch rooms', error: err.message });
  }
};

// GET /api/rooms/:id
exports.getRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ message: 'Room not found' });
    res.json(room);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch room', error: err.message });
  }
};

// POST /api/rooms — no auth on this branch yet; used to seed/manage test data
// for this card. Room Management's own create/edit/delete flow can replace
// this once that module's auth work is merged in.
exports.createRoom = async (req, res) => {
  try {
    const { roomNumber, block, capacity, pricePerSemester } = req.body;
    if (!roomNumber || !block || !capacity || !pricePerSemester) {
      return res.status(400).json({ message: 'roomNumber, block, capacity, pricePerSemester are required' });
    }
    const room = await Room.create({ roomNumber, block, capacity, pricePerSemester });
    res.status(201).json(room);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: 'Room number already exists' });
    }
    res.status(500).json({ message: 'Failed to create room', error: err.message });
  }
};