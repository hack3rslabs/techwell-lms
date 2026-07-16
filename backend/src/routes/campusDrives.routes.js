const express = require('express');
const router = express.Router();
const driveController = require('../controllers/campusDrives.controller');
const { authenticate, authorize } = require('../middleware/auth');

// Super Admin Routes
router.get('/admin/all', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), driveController.getAdminDrives);

// Employer Routes
router.post('/request', authenticate, authorize('EMPLOYER', 'SUPER_ADMIN', 'ADMIN', 'INSTITUTE_OWNER', 'FRANCHISE_OWNER', 'COLLEGE_ADMIN'), driveController.createCampusDrive);
router.get('/employer', authenticate, authorize('EMPLOYER', 'SUPER_ADMIN', 'ADMIN', 'INSTITUTE_OWNER', 'FRANCHISE_OWNER', 'COLLEGE_ADMIN'), driveController.getEmployerDrives);
router.patch('/:driveId/pipeline/:studentId', authenticate, authorize('EMPLOYER', 'SUPER_ADMIN', 'ADMIN', 'INSTITUTE_OWNER', 'FRANCHISE_OWNER', 'COLLEGE_ADMIN'), driveController.updatePipelineStatus);

// Institute Admin Routes
router.get('/institute', authenticate, authorize('INSTITUTE_ADMIN', 'INSTITUTE_OWNER', 'COLLEGE_ADMIN'), driveController.getInstituteDrives);
router.patch('/:driveId/status', authenticate, authorize('INSTITUTE_ADMIN', 'INSTITUTE_OWNER', 'COLLEGE_ADMIN'), driveController.updateDriveStatus);
router.post('/:driveId/invite', authenticate, authorize('INSTITUTE_ADMIN', 'INSTITUTE_OWNER', 'COLLEGE_ADMIN'), driveController.inviteStudents);
router.post('/:driveId/match', authenticate, authorize('INSTITUTE_ADMIN', 'INSTITUTE_OWNER', 'COLLEGE_ADMIN', 'SUPER_ADMIN', 'ADMIN'), driveController.matchStudents);

// Student Routes
router.get('/my-drives', authenticate, authorize('STUDENT'), driveController.getMyDrives);
router.post('/:driveId/apply', authenticate, authorize('STUDENT'), driveController.applyToDrive);

module.exports = router;
