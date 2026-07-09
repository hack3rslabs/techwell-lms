const express = require('express');
const router = express.Router();
const consultingController = require('../controllers/consultingProjects.controller');
const { authenticate, authorize } = require('../middleware/auth');

// Apply protection to all routes below
router.use(authenticate);
router.use(authorize('SUPER_ADMIN', 'ADMIN', 'STAFF'));

// Main project routes
router.get('/', consultingController.getProjects);
router.post('/', consultingController.createProject);
router.get('/:id', consultingController.getProjectById);
router.put('/:id', consultingController.updateProject);
router.delete('/:id', consultingController.deleteProject);

// Nested routes for milestones and resources
router.post('/:projectId/milestones', consultingController.addMilestone);
router.post('/:projectId/resources', consultingController.addResource);

module.exports = router;
