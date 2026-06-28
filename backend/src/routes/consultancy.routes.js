const express = require('express');
const { 
    verifyInvitation, 
    submitAgreement, 
    getDashboardStats, 
    getInvitations, 
    createInvitation,
    updateInvitation,
    updateCandidateStatus 
} = require('../controllers/consultancy.controller');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// -------------------------------------------------------------
// PUBLIC ROUTES
// -------------------------------------------------------------
// Note: These don't require `authenticate` because they are accessed by external candidates via unique tokens.
router.get('/public/invite/:token', verifyInvitation);
router.post('/public/invite/:token/submit', submitAgreement);

// -------------------------------------------------------------
// ADMIN ROUTES (Protected)
// -------------------------------------------------------------
// Apply authentication and authorization for all routes below this line
router.use(authenticate);
router.use(authorize('SUPER_ADMIN', 'ADMIN'));

router.get('/dashboard', getDashboardStats);
router.get('/invitations', getInvitations);
router.post('/invitations', createInvitation);
router.put('/invitations/:id', updateInvitation);
router.patch('/candidates/:id/status', updateCandidateStatus);

module.exports = router;
