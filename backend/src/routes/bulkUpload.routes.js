const express = require('express');
const router = express.Router();
const bulkUploadController = require('../controllers/bulkUpload.controller');
const { authenticate, authorize } = require('../middleware/auth');

// Protected: Institute Admin only
router.post('/', authenticate, authorize('INSTITUTE_ADMIN'), bulkUploadController.bulkUploadStudents);
router.get('/logs', authenticate, authorize('INSTITUTE_ADMIN'), bulkUploadController.getUploadLogs);

module.exports = router;
