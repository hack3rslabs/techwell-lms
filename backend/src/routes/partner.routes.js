const express = require('express');
const { getAllPartners } = require('../controllers/partner.controller');

const router = express.Router();

// Public route to fetch all partners
router.get('/', getAllPartners);

module.exports = router;
