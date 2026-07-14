const express = require('express');
const router = express.Router();
const franchiseController = require('../controllers/franchise.controller');
const { authenticate, authorize, checkPermission } = require('../middleware/auth');

// Hybrid auth for Franchise routes: allows FRANCHISE_ADMIN natively, or STAFF/ADMIN via RBAC
const franchiseAuth = (accessType = 'read') => {
    return (req, res, next) => {
        if (req.user?.role === 'FRANCHISE_ADMIN' || req.user?.role === 'SUPER_ADMIN') {
            return next();
        }
        return checkPermission('FRANCHISES', accessType)(req, res, next);
    };
};

// Public or Franchise Applicant routes
router.post('/public-request', franchiseController.publicFranchiseRequest);
router.post('/register', franchiseController.registerFranchise);

// Protected routes (For Super Admin and Franchise Admin)
router.use(authenticate);

// Dashboard stats
router.get('/stats', franchiseAuth('read'), franchiseController.getFranchiseStats);
router.get('/:id/dashboard', franchiseAuth('read'), franchiseController.getFranchiseDashboard);
router.get('/:id/leads', franchiseAuth('read'), franchiseController.getFranchiseLeads);

// CRUD
router.get('/', franchiseAuth('read'), franchiseController.getAllFranchises);
// Marketing Resources (Must be before /:id)
router.get('/resources', franchiseAuth('read'), franchiseController.getResources);
router.post('/resources', franchiseAuth('create'), franchiseController.addResource);

// Offline Payment & Ledger (Must be before /:id)
router.post('/offline-payment', franchiseAuth('create'), franchiseController.recordOfflinePayment);

router.get('/:id', franchiseAuth('read'), franchiseController.getFranchiseById);
router.put('/:id', franchiseAuth('update'), franchiseController.updateFranchise);
router.delete('/:id', franchiseAuth('delete'), franchiseController.deleteFranchise);

// Verification docs
router.post('/:id/verification', franchiseAuth('create'), franchiseController.uploadVerificationDocs);
router.put('/:id/verification/status', franchiseAuth('update'), franchiseController.updateVerificationStatus);

// Agreements
router.get('/:id/agreement', franchiseAuth('read'), franchiseController.getAgreement);
router.post('/:id/agreement/accept', franchiseAuth('update'), franchiseController.acceptAgreement);

// Subscription
router.get('/:id/subscription', franchiseAuth('read'), franchiseController.getSubscriptionDetails);
router.post('/:id/subscription', franchiseAuth('create'), franchiseController.addSubscription);

// Revenue
router.get('/:id/revenue', franchiseAuth('read'), franchiseController.getRevenueDetails);



module.exports = router;
