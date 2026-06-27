const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const payrollController = require('../controllers/payroll.controller');

const router = express.Router();

// HR and Super Admins only
router.use(authenticate);
router.use(authorize('SUPER_ADMIN', 'HR'));

// Get staff roster with attendance stats
router.get('/roster', payrollController.getStaffRoster);

// Process payroll (upsert)
router.post('/process', payrollController.processPayroll);

// Mark as paid
router.patch('/:id/pay', payrollController.markAsPaid);

module.exports = router;
