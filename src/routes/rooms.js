const express = require('express');
const router = express.Router();
const Room = require('../models/Room');
const { getRooms, getRoom, createRoom } = require('../controllers/roomController');

router.get('/', getRooms);
router.get('/:id', getRoom);
router.post('/', createRoom);

module.exports = router;