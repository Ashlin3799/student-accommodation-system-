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

const adminOnly = [authMiddleware, roleMiddleware('admin')];

// Public: student-facing catalogue
router.get('/', getRooms);

// Admin only. NOTE: '/archived' must be declared before '/:id'.
router.get('/archived', ...adminOnly, getArchivedRooms);

router.get('/:id', getRoom);
router.post('/', ...adminOnly, createRoom);
router.put('/:id', ...adminOnly, updateRoom);
router.patch('/:id/restore', ...adminOnly, restoreRoom);
router.delete('/:id', ...adminOnly, deleteRoom);

module.exports = router;