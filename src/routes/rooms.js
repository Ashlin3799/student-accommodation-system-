const express = require('express');
const router = express.Router();
const Room = require('../models/Room');
const {
  getRooms,
  getRoom,
  createRoom,
  updateRoom,
  deleteRoom
} = require('../controllers/roomController');

router.get('/', getRooms);
router.get('/:id', getRoom);
router.post('/', createRoom);
router.put('/:id', updateRoom);
router.delete('/:id', deleteRoom);

module.exports = router;