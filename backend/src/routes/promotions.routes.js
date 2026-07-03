const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/promotions.controller');
const { authenticate, authorize } = require('../middleware/auth');

// ─── Public Delivery Routes (no auth required for guest campaigns) ─────────────
router.post('/deliver', ctrl.deliver);
router.post('/track', ctrl.track);

// ─── Admin Routes (authenticated) ────────────────────────────────────────────
router.use(authenticate);
router.use(authorize('SUPER_ADMIN', 'ADMIN', 'STAFF', 'MANAGER'));

router.get('/dashboard', ctrl.getDashboardStats);
router.get('/', ctrl.getAll);
router.post('/', ctrl.create);
router.get('/:id', ctrl.getById);
router.put('/:id', ctrl.update);
router.delete('/:id', ctrl.remove);
router.patch('/:id/status', ctrl.updateStatus);
router.get('/:id/analytics', ctrl.getAnalytics);

// ─── Media Library ────────────────────────────────────────────────────────────
router.get('/media/library', ctrl.getMedia);
router.post('/media/library', ctrl.createMedia);
router.delete('/media/library/:id', ctrl.deleteMedia);

module.exports = router;
