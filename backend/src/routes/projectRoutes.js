const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const { authenticate, checkPermission } = require('../middleware/auth');

// Define routes
router.get('/', authenticate, checkPermission('CONSULTANCY'), projectController.getAllProjects);
router.post('/', authenticate, checkPermission('CONSULTANCY', 'write'), projectController.createProject);
router.put('/:id', authenticate, checkPermission('CONSULTANCY', 'write'), projectController.updateProject);
router.delete('/:id', authenticate, checkPermission('CONSULTANCY', 'write'), projectController.deleteProject);

module.exports = router;
