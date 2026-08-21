const express = require('express');
const router = express.Router();
const faqController = require('../controllers/faq.controller');
const { authenticate } = require('../middleware/auth');
const { adminRoleCheck } = require('../middleware/roleCheck');


// Public route to get FAQs
router.get('/', faqController.getAllFaqs);

// Admin-only routes for FAQ management
router.post(
  '/', 
  authenticate, 
  adminRoleCheck(['ADMIN', 'SUPER_ADMIN', 'STAFF']), 
  faqController.createFaq
);

router.put(
  '/:id', 
  authenticate, 
  adminRoleCheck(['ADMIN', 'SUPER_ADMIN', 'STAFF']), 
  faqController.updateFaq
);

router.delete(
  '/:id', 
  authenticate, 
  adminRoleCheck(['ADMIN', 'SUPER_ADMIN', 'STAFF']), 
  faqController.deleteFaq
);

module.exports = router;
