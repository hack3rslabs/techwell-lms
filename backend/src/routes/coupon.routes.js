const express = require('express');
const router = express.Router();
const couponController = require('../controllers/coupon.controller');
const { authenticate, authorize } = require('../middleware/auth');

// Public route for validating coupon during checkout
router.post('/validate', authenticate, couponController.validateCoupon);

// Admin only routes
router.get('/', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), couponController.getAllCoupons);
router.post('/', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), couponController.createCoupon);
router.delete('/:id', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), couponController.deleteCoupon);

module.exports = router;
