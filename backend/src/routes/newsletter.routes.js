const express = require('express');
const router = express.Router();
const newsletterController = require('../controllers/newsletter.controller');
const { authenticate: protect, authorize } = require('../middleware/auth');

// Apply protection to all newsletter routes
router.use(protect);
router.use(authorize('ADMIN', 'SUPERADMIN'));

router.get('/', newsletterController.getNewsletters);
router.post('/', newsletterController.createNewsletter);
router.get('/:id', newsletterController.getNewsletterById);
router.put('/:id', newsletterController.updateNewsletter);
router.delete('/:id', newsletterController.deleteNewsletter);
router.post('/:id/publish', newsletterController.publishNewsletter);

module.exports = router;
