const express = require('express');
const router = express.Router();
const consultingController = require('../controllers/consultingProjects.controller');
const { authenticate, checkPermission } = require('../middleware/auth');

// Apply protection to all routes below
router.use(authenticate);

// Main project routes
router.get('/', checkPermission('CONSULTANCY'), consultingController.getProjects);
router.post('/', checkPermission('CONSULTANCY', 'write'), consultingController.createProject);
router.get('/:id', checkPermission('CONSULTANCY'), consultingController.getProjectById);
router.put('/:id', checkPermission('CONSULTANCY', 'write'), consultingController.updateProject);
router.delete('/:id', checkPermission('CONSULTANCY', 'write'), consultingController.deleteProject);

// Nested routes for milestones and resources
router.post('/:projectId/milestones', checkPermission('CONSULTANCY', 'write'), consultingController.addMilestone);
router.post('/:projectId/resources', checkPermission('CONSULTANCY', 'write'), consultingController.addResource);

module.exports = router;
