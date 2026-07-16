
const express = require('express');
const router = express.Router();
const galleryController = require('../controllers/galleryController');
const { authenticate, authorize, checkPermission, optionalAuth } = require('../middleware/auth');

// Public access for footer
router.get('/', galleryController.getGalleryImages);

// Admin access for management
router.post('/', authenticate, checkPermission('GALLERY', 'write'), galleryController.addGalleryImage);
router.delete('/', authenticate, checkPermission('GALLERY', 'write'), galleryController.deleteGalleryImage);

module.exports = router;
