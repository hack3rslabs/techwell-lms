const express = require('express');
const router = express.Router();
const approvalsController = require('../controllers/approvalsController');
const { authorize } = require('../middleware/auth');

// Public route for creating requests (e.g. from registration forms)
router.post('/', approvalsController.createApprovalRequest);

// Protected routes (Admin only)
router.get('/', authorize(['SUPER_ADMIN', 'ADMIN']), approvalsController.getApprovalRequests);
router.patch('/:id/status', authorize(['SUPER_ADMIN', 'ADMIN']), approvalsController.updateApprovalStatus);

module.exports = router;
