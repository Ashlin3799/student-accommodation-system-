const express = require('express');

const router = express.Router();

const authMiddleware = require('../../middleware/auth');
const roleMiddleware = require('../../middleware/role');

const {
  getRooms,
  getArchivedRooms,
  getRoom,
  createRoom,
  updateRoom,
  deleteRoom,
  restoreRoom
} = require('../controllers/roomController');

const adminOnly = [
  authMiddleware,
  roleMiddleware('admin')
];

// ============================================================
// PUBLIC - Get all active rooms
// GET /api/rooms
// ============================================================

router.get(
  '/',
  getRooms
);

// ============================================================
// ADMIN - Get archived rooms
// GET /api/rooms/archived
// ============================================================

router.get(
  '/archived',
  ...adminOnly,
  getArchivedRooms
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
  ...adminOnly,
  createRoom
);

// ============================================================
// ADMIN - Update a room
// PUT /api/rooms/:id
// ============================================================

router.put(
  '/:id',
  ...adminOnly,
  updateRoom
);

// ============================================================
// ADMIN - Restore an archived room
// PATCH /api/rooms/:id/restore
// ============================================================

router.patch(
  '/:id/restore',
  ...adminOnly,
  restoreRoom
);

// ============================================================
// ADMIN - Delete/archive a room
// DELETE /api/rooms/:id
// ============================================================

router.delete(
  '/:id',
  ...adminOnly,
  deleteRoom
);

module.exports = router;