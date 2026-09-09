const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema(
  {
    roomNumber: {
      type: String,
      required: true,
      trim: true
    },
    block: {
      type: String,
      required: true,
      trim: true
    },
    capacity: {
      type: Number,
      required: true
    },
    occupied: {
      type: Number,
      default: 0
    },
    pricePerSemester: {
      type: Number,
      required: true
    },
    status: {
      type: String,
      enum: ['available', 'full', 'maintenance'],
      default: 'available'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Room', roomSchema);