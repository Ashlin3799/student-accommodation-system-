const express = require('express');

const router = express.Router();

const dashboardController = require('../controllers/dashboardcontroller');
const authMiddleware = require('../middleware/auth');

router.get(
  '/stats',
  authMiddleware,
  (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    next();
  },
  dashboardController.getDashboardStats
);

module.exports = router;