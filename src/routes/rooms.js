const express = require('express');

const router = express.Router();

const {
  getRooms,
  getRoom,
  createRoom,
  updateRoom,
  deleteRoom
} = require('../controllers/roomController');

const authMiddleware = require('../../middleware/auth');
const roleMiddleware = require('../../middleware/role');


// ============================================================
// PUBLIC - Get all rooms
// GET /api/rooms
// ============================================================
router.get(
  '/',
  getRooms
);


// ============================================================
// PUBLIC - Get a single room
// GET /api/rooms/:id
// ============================================================
router.get(
  '/:id',
  getRoom
);


// ============================================================
// ADMIN - Create a room
// POST /api/rooms
// ============================================================
router.post(
  '/',
  authMiddleware,
  roleMiddleware('admin'),
  createRoom
);


// ============================================================
// ADMIN - Update a room
// PUT /api/rooms/:id
// ============================================================
router.put(
  '/:id',
  authMiddleware,
  roleMiddleware('admin'),
  updateRoom
);


// ============================================================
// ADMIN - Delete a room
// DELETE /api/rooms/:id
// ============================================================
router.delete(
  '/:id',
  authMiddleware,
  roleMiddleware('admin'),
  deleteRoom
);


module.exports = router;