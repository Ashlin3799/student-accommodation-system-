const express = require('express');
const router = express.Router();

// Mock data to test frontend before Purva finishes the MongoDB schema
const mockApplications = [
  { id: '1', studentName: 'John Doe', roomRequested: 'Room 101', status: 'Pending', date: '2026-09-08' },
  { id: '2', studentName: 'Jane Smith', roomRequested: 'Room 204', status: 'Pending', date: '2026-09-08' }
];

// GET endpoint to fetch all submitted room applications
router.get('/applications', (req, res) => {
  res.json({ success: true, data: mockApplications });
});

// PATCH endpoint to approve or reject an application
router.patch('/applications/:id/status', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const app = mockApplications.find(item => item.id === id);
  if (app) {
    app.status = status;
    return res.json({ success: true, message: `Application ${status}`, data: app });
  }

 res.status()(404).json({ success: false, message: 'Application not found' });
});
module.exports = router;