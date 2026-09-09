const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/auth');
const roleMiddleware = require('../middleware/role');

// Mock data to test frontend before Purva finishes the MongoDB schema
// TODO (Sprint 2): replace with real Application/Room models + occupancy sync
const mockApplications = [
  { id: '1', studentName: 'John Doe', roomRequested: 'Room 101', status: 'Pending', date: '2026-09-08' },
  { id: '2', studentName: 'Jane Smith', roomRequested: 'Room 204', status: 'Pending', date: '2026-09-08' }
];

const ALLOWED_STATUSES = ['Pending', 'Approved', 'Rejected'];

// GET endpoint to fetch all submitted room applications
router.get(
  '/applications',
  authMiddleware,
  roleMiddleware('admin'),
  (req, res) => {
    res.json({ success: true, data: mockApplications });
  }
);

// PATCH endpoint to approve or reject an application
router.patch(
  '/applications/:id/status',
  authMiddleware,
  roleMiddleware('admin'),
  (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !ALLOWED_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status must be one of: ${ALLOWED_STATUSES.join(', ')}`
      });
    }

    const app = mockApplications.find((item) => item.id === id);

    if (!app) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    app.status = status;

    return res.json({
      success: true,
      message: `Application ${status}`,
      data: app
    });
  }
);

module.exports = router;