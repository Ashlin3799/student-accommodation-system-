const express = require('express');

const router = express.Router();

const complaintController = require('../controllers/complaintController');

// Submit complaint
router.post('/', complaintController.createComplaint);

// Get all complaints
router.get('/', complaintController.getAllComplaints);

// Get complaints for a specific student
router.get(
  '/student/:studentId',
  complaintController.getStudentComplaints
);

// Get single complaint
router.get('/:id', complaintController.getComplaintById);

// Update complaint status
router.patch(
  '/:id/status',
  complaintController.updateComplaintStatus
);

module.exports = router;