const express = require('express');

const router = express.Router();

const complaintController = require('../controllers/complaintController');

const authMiddleware = require('../middleware/auth');
const roleMiddleware = require('../middleware/role');


// ============================================================
// STUDENT - Submit a complaint
// POST /api/complaints
// ============================================================
router.post(
  '/',
  authMiddleware,
  roleMiddleware('student'),
  complaintController.createComplaint
);


// ============================================================
// ADMIN - Get all complaints
// GET /api/complaints
// ============================================================
router.get(
  '/',
  authMiddleware,
  roleMiddleware('admin'),
  complaintController.getAllComplaints
);


// ============================================================
// STUDENT / ADMIN - Get complaints for a specific student
// GET /api/complaints/student/:studentId
// ============================================================
router.get(
  '/student/:studentId',
  authMiddleware,
  roleMiddleware('student', 'admin'),
  (req, res, next) => {

    // Students can only view their own complaints.
    // Admins can view any student's complaints.
    if (
      req.user.role === 'student' &&
      String(req.user.userId) !== String(req.params.studentId)
    ) {
      return res.status(403).json({
        success: false,
        message: 'You can only view your own complaints.'
      });
    }

    next();
  },
  complaintController.getStudentComplaints
);


// ============================================================
// STUDENT / ADMIN - Get a single complaint
// GET /api/complaints/:id
// ============================================================
router.get(
  '/:id',
  authMiddleware,
  roleMiddleware('student', 'admin'),
  complaintController.getComplaintById
);


// ============================================================
// ADMIN - Update complaint status
// PATCH /api/complaints/:id/status
// ============================================================
router.patch(
  '/:id/status',
  authMiddleware,
  roleMiddleware('admin'),
  complaintController.updateComplaintStatus
);


module.exports = router;