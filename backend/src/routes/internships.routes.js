const { Router } = require('express');
const { getMyInternship, submitDailyLog, getAllInternships, assignMentor } = require('../controllers/internships.controller.js');
const { authenticate: requireAuth, authorize: requireRole } = require('../middleware/auth.js');

const router = Router();

// Student Routes
router.get('/me', requireAuth, getMyInternship);
router.post('/logs', requireAuth, submitDailyLog);

// Admin Routes
router.get('/', requireAuth, requireRole(['ADMIN', 'SUPER_ADMIN']), getAllInternships);
router.put('/:enrollmentId/mentor', requireAuth, requireRole(['ADMIN', 'SUPER_ADMIN']), assignMentor);

module.exports = router;
