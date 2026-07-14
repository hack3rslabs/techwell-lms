const express = require('express');
const router = express.Router();
const careerHubController = require('../controllers/career-hub.controller');
const { verifyToken } = require('../middleware/auth'); // Require authentication

// Protect all career hub routes
router.use(verifyToken);

router.post('/ats-analyze', careerHubController.analyzeATS);
router.post('/linkedin-analyze', careerHubController.analyzeLinkedIn);

module.exports = router;
