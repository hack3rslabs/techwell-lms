const express = require('express');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { authenticate, checkPermission } = require('../middleware/auth');

const router = express.Router();

// GET /api/crm/customers
router.get('/customers', authenticate, checkPermission('CENTRAL_CRM'), async (req, res) => {
  try {
    let { search, page = 1, limit = 10 } = req.query;
    if (search !== undefined) search = Array.isArray(search) ? search[0] : String(search);

    const skip = (page - 1) * limit;

    let where = {};
    if (search) {
      where = {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { phone: { contains: search } }
        ]
      };
    }

    const customers = await prisma.customer.findMany({
      where,
      skip: parseInt(skip),
      take: parseInt(limit),
      orderBy: { updatedAt: 'desc' }
    });

    const total = await prisma.customer.count({ where });

    res.json({
      success: true,
      data: customers,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/crm/customers/:id/360-view
router.get('/customers/:id/360-view', authenticate, checkPermission('CENTRAL_CRM'), async (req, res) => {
  try {
    const { id } = req.params;

    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        users: {
          include: {
            enrollments: { include: { course: true } },
            applications: { include: { job: true } },
            tickets: true
          }
        },
        leads: {
          include: {
            activityLogs: true,
            whatsappLogs: true
          }
        },
        candidateProfiles: true,
        pipelines: { include: { pipeline: true, stage: true } },
        callLogs: true,
        proposals: true,
        invoices: true
      }
    });

    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    res.json({ success: true, data: customer });
  } catch (error) {
    console.error('Error fetching customer 360 view:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/crm/customers/merge
router.post('/customers/merge', authenticate, checkPermission('CENTRAL_CRM', 'write'), async (req, res) => {
  try {
    const { primaryId, secondaryIds } = req.body;
    // Feature flag: Customer merging is temporarily disabled until data retention policies are finalized.
    res.status(501).json({ success: false, message: 'Customer merge functionality is not implemented yet.' });
  } catch (error) {
    console.error('Error merging customers:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
