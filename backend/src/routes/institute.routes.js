const express = require('express');
const router = express.Router();
const instituteController = require('../controllers/institute.controller');
const { authenticate, authorize } = require('../middleware/auth');

// Public
router.post('/register', instituteController.registerInstitute);

// Protected: Super Admin only
router.get('/', authenticate, authorize('SUPER_ADMIN'), instituteController.getInstitutes);
router.patch('/:id/status', authenticate, authorize('SUPER_ADMIN'), instituteController.updateInstituteStatus);

// Protected: Institute Admin only
router.get('/my-institute', authenticate, authorize('INSTITUTE_ADMIN'), instituteController.getMyInstitute);
router.patch('/my-institute', authenticate, authorize('INSTITUTE_ADMIN'), instituteController.updateMyInstitute);

// Dashboard and Students
router.get('/:id/dashboard', authenticate, authorize('SUPER_ADMIN', 'INSTITUTE_ADMIN'), instituteController.getInstituteDashboard);
router.get('/:id/students', authenticate, authorize('SUPER_ADMIN', 'INSTITUTE_ADMIN'), instituteController.getInstituteStudents);
module.exports = router;
