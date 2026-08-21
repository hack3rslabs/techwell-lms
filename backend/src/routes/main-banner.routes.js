const express = require('express');
const bannerController = require('../controllers/main-banner.controller');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/active', bannerController.getActiveBanners);

// Admin routes
router.use(authenticate);
router.use(authorize('SUPER_ADMIN', 'ADMIN'));

router
    .route('/')
    .get(bannerController.getAllBanners)
    .post(bannerController.createBanner);

router
    .route('/:id')
    .put(bannerController.updateBanner)
    .delete(bannerController.deleteBanner);

module.exports = router;
