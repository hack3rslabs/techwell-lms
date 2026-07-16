const express = require('express');
const router = express.Router();
const couponController = require('../controllers/coupon.controller');
const { authenticate, authorize } = require('../middleware/auth');

// Public route for validating coupon during checkout
router.post('/validate', authenticate, couponController.validateCoupon);

// Admin only routes
router.get('/', authenticate, checkPermission('COUPONS'), couponController.getAllCoupons);
router.post('/', authenticate, checkPermission('COUPONS'), couponController.createCoupon);
router.delete('/:id', authenticate, checkPermission('COUPONS'), couponController.deleteCoupon);

module.exports = router;
