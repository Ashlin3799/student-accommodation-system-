const express = require('express');
const router = express.Router();
const Application = require('../models/Application');

// Submit a new application
router.post('/', async (req, res) => {
  try {
    const { studentId, studentName, roomId, roomTitle } = req.body;

    if (!studentId || !studentName || !roomId || !roomTitle) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    const existingActive = await Application.findOne({
      studentId,
      status: { $in: ['Pending', 'Approved'] }
    });

    if (existingActive) {
      return res.status(409).json({
        error: 'You already have an active application.'
      });
    }

    const newApplication = new Application({ studentId, studentName, roomId, roomTitle });
    await newApplication.save();

    res.status(201).json(newApplication);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error while submitting application.' });
  }
});

// Get a student's current status
router.get('/:studentId', async (req, res) => {
  try {
    const application = await Application.findOne({ studentId: req.params.studentId }).sort({ createdAt: -1 });

    if (!application) {
      return res.status(404).json({ message: 'No application found for this student.' });
    }

    res.json(application);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error while fetching status.' });
  }
});

// Get all applications (for admin)
router.get('/', async (req, res) => {
  try {
    const applications = await Application.find().sort({ createdAt: -1 });
    res.json(applications);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error while fetching applications.' });
  }
});

// Admin approve/reject
router.patch('/:id', async (req, res) => {
  try {
    const { status } = req.body;

    if (!['Approved', 'Rejected', 'Pending'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status value.' });
    }

    const updated = await Application.findByIdAndUpdate(
      req.params.id,
      { status, updatedAt: Date.now() },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ error: 'Application not found.' });
    }

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error while updating status.' });
  }
});

module.exports = router;