const express = require('express');
const router = express.Router();
const consultancyAnalyticsController = require('../controllers/consultancyAnalytics.controller');
const { authenticate, authorize } = require('../middleware/auth');

// Protected: Super Admin only
router.get('/analytics', authenticate, authorize('SUPER_ADMIN'), consultancyAnalyticsController.getOverallAnalytics);
router.post('/coordination', authenticate, authorize('SUPER_ADMIN'), consultancyAnalyticsController.createCoordination);
router.get('/coordination', authenticate, authorize('SUPER_ADMIN'), consultancyAnalyticsController.getCoordinations);

module.exports = router;
