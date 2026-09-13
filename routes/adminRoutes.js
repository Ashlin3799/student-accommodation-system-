const express = require('express');
const router = express.Router();
const Application = require('../models/Application'); // Real Mongoose Model

// GET all applications from MongoDB
router.get('/applications', async (req, res) => {
  try {
    const applications = await Application.find().sort({ createdAt: -1 });
    res.json({ success: true, data: applications });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// PATCH approve/reject status in MongoDB
router.patch('/applications/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const updated = await Application.findByIdAndUpdate(
      req.params.id,
      { status, updatedAt: Date.now() },
      { new: true }
    );
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }
    res.json({ success: true, message: `Application ${status}`, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;