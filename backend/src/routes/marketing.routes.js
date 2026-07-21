const express = require('express');
const router = require('express').Router();
const marketingController = require('../controllers/marketing.controller');
const { authenticate: protect, authorize } = require('../middleware/auth');

// Public routes for rendering landing pages and forms
router.post('/newsletter/subscribe', marketingController.subscribeNewsletter);

router.get('/landing-pages/public/:slug', marketingController.getLandingPageBySlug);
router.get('/forms/public/:id', marketingController.getFormById);
router.post('/landing-pages/views/:slug', marketingController.incrementPageViews);

// Protect all marketing admin routes
router.use(protect);
router.use(authorize('SUPER_ADMIN', 'ADMIN', 'MANAGER'));

const multer = require('multer');
const path = require('path');
const fs = require('fs');
const rateLimit = require('express-rate-limit');

const uploadLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10, message: { error: 'Too many uploads' } });

const uploadDir = path.join(__dirname, '../../uploads/marketing');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'asset-' + uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage });

router.post('/landing-pages/assets/upload', uploadLimiter, upload.single('image'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        const fileUrl = `${req.protocol}://${req.get('host')}/uploads/marketing/${req.file.filename}`;
        res.json({
            data: [
                {
                    src: fileUrl,
                    type: 'image'
                }
            ]
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Landing Pages
router.get('/landing-pages', marketingController.getLandingPages);
router.post('/landing-pages', marketingController.createLandingPage);
router.put('/landing-pages/:id', marketingController.updateLandingPage);
router.delete('/landing-pages/:id', marketingController.deleteLandingPage);

// Forms
router.get('/forms', marketingController.getForms);
router.post('/forms', marketingController.createForm);
router.delete('/forms/:id', marketingController.deleteForm);

// Campaigns
router.get('/campaigns', marketingController.getCampaigns);
router.post('/campaigns', marketingController.createCampaign);
router.delete('/campaigns/:id', marketingController.deleteCampaign);

module.exports = router;
