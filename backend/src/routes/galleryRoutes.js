
const express = require('express');
const router = express.Router();
const galleryController = require('../controllers/galleryController');
const { authenticate, authorize } = require('../middleware/auth');

// Public access for footer
router.get('/', galleryController.getGalleryImages);

// Admin access for management
router.post('/', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), galleryController.addGalleryImage);
router.delete('/', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), galleryController.deleteGalleryImage);

module.exports = router;
