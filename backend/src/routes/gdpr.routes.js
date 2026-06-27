const express = require('express');
const { getPreferences, updatePreferences, requestDeletion } = require('../controllers/gdpr.controller');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);

// Get current GDPR preferences
router.get('/preferences', getPreferences);

// Update preferences (e.g. newsletter subscription)
router.post('/preferences', updatePreferences);

// Request account deletion
router.post('/delete-request', requestDeletion);

module.exports = router;
