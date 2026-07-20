const { Router } = require('express');
const {
    getMyInternship,
    submitDailyLog,
    getAllInternships,
    assignMentor,
    getPrograms,
    createProgram,
    updateProgram,
    deleteProgram
} = require('../controllers/internships.controller.js');
const { authenticate: requireAuth, authorize: requireRole } = require('../middleware/auth.js');

const router = Router();

// --- Internship Programs (Admin) ---
router.get('/programs', requireAuth, requireRole(['ADMIN', 'SUPER_ADMIN']), getPrograms);
router.post('/programs', requireAuth, requireRole(['ADMIN', 'SUPER_ADMIN']), createProgram);
router.put('/programs/:id', requireAuth, requireRole(['ADMIN', 'SUPER_ADMIN']), updateProgram);
router.delete('/programs/:id', requireAuth, requireRole(['ADMIN', 'SUPER_ADMIN']), deleteProgram);

// --- Internship Enrollments (Admin) ---
router.get('/', requireAuth, requireRole(['ADMIN', 'SUPER_ADMIN']), getAllInternships);
router.put('/:enrollmentId/mentor', requireAuth, requireRole(['ADMIN', 'SUPER_ADMIN']), assignMentor);

// --- Student Routes ---
router.get('/me', requireAuth, getMyInternship);
router.post('/logs', requireAuth, submitDailyLog);

module.exports = router;
