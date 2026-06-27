const express = require('express');
const router = express.Router();
const teamController = require('../controllers/team.controller');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/public', teamController.getActiveTeamMembers);
router.get('/admin', authenticate, authorize('TEAM_MANAGEMENT'), teamController.getAllTeamMembers);
router.post('/admin', authenticate, authorize('TEAM_MANAGEMENT'), teamController.createTeamMember);
router.put('/admin/:id', authenticate, authorize('TEAM_MANAGEMENT'), teamController.updateTeamMember);
router.delete('/admin/:id', authenticate, authorize('TEAM_MANAGEMENT'), teamController.deleteTeamMember);

module.exports = router;
