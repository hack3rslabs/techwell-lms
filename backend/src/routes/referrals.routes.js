const express = require('express');
const { getMyReferrals, applyReferral, generateReferralCode, getAdminReferralStats } = require('../controllers/referrals.controller');
const { authenticate, checkPermission } = require('../middleware/auth');

const router = express.Router();

// Admin routes
router.get('/stats', authenticate, checkPermission('MARKETING'), getAdminReferralStats);

// Public/Student routes
router.post('/apply', applyReferral); // Apply on checkout

router.use(authenticate);
router.get('/me', getMyReferrals);
router.post('/generate', generateReferralCode); // Generate code if doesn't exist

module.exports = router;
