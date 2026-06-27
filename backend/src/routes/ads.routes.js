const express = require('express');
const { getAds, getActiveAds, createAd, deleteAd, recordView, recordClick } = require('../controllers/ads.controller');
const { authenticate, checkPermission } = require('../middleware/auth');

const router = express.Router();

// Public route to fetch active ads
router.get('/active', getActiveAds);
router.post('/:id/view', recordView);
router.post('/:id/click', recordClick);

// Admin routes
router.get('/', authenticate, checkPermission('MARKETING'), getAds);
router.post('/', authenticate, checkPermission('MARKETING'), createAd);
router.delete('/:id', authenticate, checkPermission('MARKETING'), deleteAd);

module.exports = router;
