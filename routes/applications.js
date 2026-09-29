const express = require('express');
const router = express.Router();
const Application = require('../models/Application');
const { adjustRoomOccupancy } = require('../src/controllers/roomController');

// Submit a new application
router.post('/', async (req, res, next) => {
  try {
    const { studentId, studentName, roomId, roomTitle } = req.body;

    if (!studentId || !studentName || !roomId || !roomTitle) {
      return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    const existingActive = await Application.findOne({
      studentId,
      status: { $in: ['Pending', 'Approved'] }
    });

    if (existingActive) {
      return res.status(409).json({
        success: false,
        message: 'You already have an active application.'
      });
    }

    const newApplication = new Application({ studentId, studentName, roomId, roomTitle });
    await newApplication.save();

    res.status(201).json(newApplication);
  } catch (err) {
    next(err);
  }
});

// Get a student's current status
router.get('/:studentId', async (req, res, next) => {
  try {
    const application = await Application.findOne({ studentId: req.params.studentId }).sort({ createdAt: -1 });

    if (!application) {
      return res.status(404).json({ success: false, message: 'No application found for this student.' });
    }

    res.json(application);
  } catch (err) {
    next(err);
  }
});

// Get all applications (for admin)
router.get('/', async (req, res, next) => {
  try {
    const applications = await Application.find().sort({ createdAt: -1 });
    res.json(applications);
  } catch (err) {
    next(err);
  }
});

// Admin approve/reject
router.patch('/:id', async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!['Approved', 'Rejected', 'Pending'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value.' });
    }

    const existing = await Application.findById(req.params.id);

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Application not found.' });
    }

    const previousStatus = existing.status;

    const updated = await Application.findByIdAndUpdate(
      req.params.id,
      { status, updatedAt: Date.now() },
      { new: true }
    );

    if (previousStatus !== 'Approved' && status === 'Approved') {
      await adjustRoomOccupancy(updated.roomId, 1);
    } else if (previousStatus === 'Approved' && status !== 'Approved') {
      await adjustRoomOccupancy(updated.roomId, -1);
    }

    res.json(updated);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
