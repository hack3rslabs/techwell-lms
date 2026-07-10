const express = require('express');
const router = express.Router();
const franchiseController = require('../controllers/franchise.controller');
const { authenticate, authorize } = require('../middleware/auth');

// Public or Franchise Applicant routes
router.post('/public-request', franchiseController.publicFranchiseRequest);
router.post('/register', franchiseController.registerFranchise);

// Protected routes (For Super Admin and Franchise Admin)
router.use(authenticate);

// Dashboard stats
router.get('/stats', authorize('SUPER_ADMIN', 'FRANCHISE_ADMIN'), franchiseController.getFranchiseStats);

// CRUD
router.get('/', authorize('SUPER_ADMIN'), franchiseController.getAllFranchises);
router.get('/:id', authorize('SUPER_ADMIN', 'FRANCHISE_ADMIN'), franchiseController.getFranchiseById);
router.put('/:id', authorize('SUPER_ADMIN', 'FRANCHISE_ADMIN'), franchiseController.updateFranchise);
router.delete('/:id', authorize('SUPER_ADMIN'), franchiseController.deleteFranchise);

// Verification docs
router.post('/:id/verification', authorize('SUPER_ADMIN', 'FRANCHISE_ADMIN'), franchiseController.uploadVerificationDocs);
router.put('/:id/verification/status', authorize('SUPER_ADMIN'), franchiseController.updateVerificationStatus);

// Agreements
router.get('/:id/agreement', authorize('SUPER_ADMIN', 'FRANCHISE_ADMIN'), franchiseController.getAgreement);
router.post('/:id/agreement/accept', authorize('FRANCHISE_ADMIN'), franchiseController.acceptAgreement);

// Subscription
router.get('/:id/subscription', authorize('SUPER_ADMIN', 'FRANCHISE_ADMIN'), franchiseController.getSubscriptionDetails);
router.post('/:id/subscription', authorize('SUPER_ADMIN'), franchiseController.addSubscription);

// Revenue
router.get('/:id/revenue', authorize('SUPER_ADMIN', 'FRANCHISE_ADMIN'), franchiseController.getRevenueDetails);

// Offline Payment & Ledger
router.post('/offline-payment', authorize('FRANCHISE_ADMIN'), franchiseController.recordOfflinePayment);

// Marketing Resources
router.get('/resources', authorize('SUPER_ADMIN', 'FRANCHISE_ADMIN'), franchiseController.getResources);
router.post('/resources', authorize('SUPER_ADMIN'), franchiseController.addResource);

module.exports = router;
