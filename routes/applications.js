const express = require('express');
const router = express.Router();

const Application = require('../models/Application');
const { adjustRoomOccupancy } = require('../src/controllers/roomController');

const authMiddleware = require('../middleware/auth');
const roleMiddleware = require('../middleware/role');


// ============================================================
// STUDENT - Submit a new application
// POST /api/applications
// ============================================================
router.post(
  '/',
  authMiddleware,
  roleMiddleware('student'),
  async (req, res, next) => {
    try {
      const { studentId, studentName, roomId, roomTitle } = req.body;

      if (!studentId || !studentName || !roomId || !roomTitle) {
        return res.status(400).json({
          success: false,
          message: 'All fields are required.'
        });
      }

      // Make sure a student can only submit an application
      // for their own account.
      if (String(req.user.id || req.user.userId) !== String(studentId)) {
        return res.status(403).json({
          success: false,
          message: 'You can only submit an application for your own account.'
        });
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

      const newApplication = new Application({
        studentId,
        studentName,
        roomId,
        roomTitle
      });

      await newApplication.save();

      res.status(201).json(newApplication);

    } catch (err) {
      next(err);
    }
  }
);


// ============================================================
// STUDENT / ADMIN - Get student's current application status
// GET /api/applications/:studentId
// ============================================================
router.get(
  '/:studentId',
  authMiddleware,
  roleMiddleware('student', 'admin'),
  async (req, res, next) => {
    try {

      // Students can only access their own application.
      // Admins can access any student's application.
      if (
        req.user.role === 'student' &&
        String(req.user.id || req.user.userId) !== String(req.params.studentId)
      ) {
        return res.status(403).json({
          success: false,
          message: 'You can only view your own application.'
        });
      }

      const application = await Application.findOne({
        studentId: req.params.studentId
      }).sort({ createdAt: -1 });

      if (!application) {
        return res.status(404).json({
          success: false,
          message: 'No application found for this student.'
        });
      }

      res.json(application);

    } catch (err) {
      next(err);
    }
  }
);


// ============================================================
// ADMIN - Get all applications
// GET /api/applications
// ============================================================
router.get(
  '/',
  authMiddleware,
  roleMiddleware('admin'),
  async (req, res, next) => {
    try {
      const applications = await Application
        .find()
        .sort({ createdAt: -1 });

      res.json(applications);

    } catch (err) {
      next(err);
    }
  }
);


// ============================================================
// ADMIN - Approve / Reject application
// PATCH /api/applications/:id
// ============================================================
router.patch(
  '/:id',
  authMiddleware,
  roleMiddleware('admin'),
  async (req, res, next) => {
    try {
      const { status } = req.body;

      if (!['Approved', 'Rejected', 'Pending'].includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid status value.'
        });
      }

      const existing = await Application.findById(req.params.id);

      if (!existing) {
        return res.status(404).json({
          success: false,
          message: 'Application not found.'
        });
      }

      const previousStatus = existing.status;

      const updated = await Application.findByIdAndUpdate(
        req.params.id,
        {
          status,
          updatedAt: Date.now()
        },
        {
          new: true
        }
      );

      if (
        previousStatus !== 'Approved' &&
        status === 'Approved'
      ) {
        await adjustRoomOccupancy(updated.roomId, 1);

      } else if (
        previousStatus === 'Approved' &&
        status !== 'Approved'
      ) {
        await adjustRoomOccupancy(updated.roomId, -1);
      }

      res.json(updated);

    } catch (err) {
      next(err);
    }
  }
);


module.exports = router;