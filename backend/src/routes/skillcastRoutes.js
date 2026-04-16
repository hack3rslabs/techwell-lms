
const express = require('express');
const router = express.Router();
const skillcastController = require('../controllers/skillcastController');
const { authenticate, authorize, checkPermission, optionalAuth } = require('../middleware/auth');

// Public routes
router.get('/', skillcastController.getAllSkillcasts);
router.get('/:id', skillcastController.getSkillcastById);

// Admin routes
router.post('/', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), skillcastController.createSkillcast);
router.put('/:id', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), skillcastController.updateSkillcast);
router.delete('/:id', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), skillcastController.deleteSkillcast);

module.exports = router;
