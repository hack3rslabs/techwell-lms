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
router.use(authorize('SUPERADMIN', 'ADMIN', 'MANAGER'));

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
