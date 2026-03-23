const express = require('express');
const { PrismaClient } = require('@prisma/client');
const router = express.Router();

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

// List of personal email domains to reject
const PERSONAL_EMAIL_DOMAINS = [
  'gmail.com',
  'yahoo.com',
  'hotmail.com',
  'outlook.com',
  'aol.com',
  'mail.com',
  'windows.live.com',
  'yandex.com',
  'protonmail.com',
  'icloud.com',
  'mail.ru',
];

/**
 * Validate if email is a business email (not personal)
 * @param {string} email - Email to validate
 * @returns {boolean} - True if business email, false if personal
 */
function isBusinessEmail(email) {
  if (!email || !email.includes('@')) {
    return false;
  }

  const domain = email.split('@')[1].toLowerCase();

  // Reject if it's a known personal domain
  if (PERSONAL_EMAIL_DOMAINS.includes(domain)) {
    return false;
  }

  return true;
}

/**
 * POST /api/employer-requests
 * Create a new employer request
 * Body: { name, designation, email, phone? }
 */
router.post('/', async (req, res) => {
  try {
    const { name, designation, email, phone } = req.body;

    // Validation
    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Name is required',
      });
    }

    if (!designation || !designation.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Designation is required',
      });
    }

    if (!email || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Email is required',
      });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format',
      });
    }

    // Business email validation
    if (!isBusinessEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please use your company email address. Personal email domains (Gmail, Yahoo, Outlook, etc.) are not accepted.',
      });
    }

    // Check for duplicate pending request from same email
    const existingRequest = await prisma.employerRequest.findFirst({
      where: {
        email: email.toLowerCase(),
        status: 'PENDING',
      },
    });

    if (existingRequest) {
      return res.status(400).json({
        success: false,
        message: 'You already have a pending employer request. Please wait for admin approval.',
      });
    }

    // Create the employer request
    const employerRequest = await prisma.employerRequest.create({
      data: {
        name: name.trim(),
        designation: designation.trim(),
        email: email.toLowerCase(),
        phone: phone ? phone.trim() : null,
        status: 'PENDING',
      },
    });

    console.log(`[Employer Request Created] ID: ${employerRequest.id}, Email: ${employerRequest.email}`);

    res.status(201).json({
      success: true,
      message: 'Employer request submitted successfully. Admin will review and contact you soon.',
      data: {
        id: employerRequest.id,
        status: employerRequest.status,
      },
    });
  } catch (error) {
    console.error('[Employer Request Error]:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to submit employer request',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

/**
 * GET /api/employer-requests?status=PENDING
 * List employer requests (Admin only)
 * Query: ?status=PENDING|APPROVED|REJECTED (optional)
 */
router.get('/', async (req, res) => {
  try {
    const { status } = req.query;

    const where = status ? { status } : {};

    const requests = await prisma.employerRequest.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        designation: true,
        email: true,
        phone: true,
        status: true,
        adminNotes: true,
        rejectionReason: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.json({
      success: true,
      data: requests,
    });
  } catch (error) {
    console.error('[Employer Requests List Error]:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch employer requests',
    });
  }
});

/**
 * GET /api/employer-requests/:id
 * Get single employer request details
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const request = await prisma.employerRequest.findUnique({
      where: { id },
    });

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Employer request not found',
      });
    }

    res.json({
      success: true,
      data: request,
    });
  } catch (error) {
    console.error('[Get Employer Request Error]:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch employer request',
    });
  }
});

/**
 * PUT /api/employer-requests/:id/approve
 * Approve an employer request (Admin only)
 * This creates an EmployerProfile and user account
 */
router.put('/:id/approve', async (req, res) => {
  try {
    const { id } = req.params;
    const { adminNotes } = req.body;

    const request = await prisma.employerRequest.findUnique({
      where: { id },
    });

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Employer request not found',
      });
    }

    if (request.status !== 'PENDING') {
      return res.status(400).json({
        success: false,
        message: `Cannot approve a request that is already ${request.status}`,
      });
    }

    // Update the request status
    const updatedRequest = await prisma.employerRequest.update({
      where: { id },
      data: {
        status: 'APPROVED',
        adminNotes: adminNotes || null,
      },
    });

    console.log(`[Employer Request Approved] ID: ${id}, Email: ${request.email}`);

    res.json({
      success: true,
      message: 'Employer request approved successfully',
      data: updatedRequest,
    });
  } catch (error) {
    console.error('[Approve Employer Request Error]:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to approve employer request',
    });
  }
});

/**
 * PUT /api/employer-requests/:id/reject
 * Reject an employer request
 */
router.put('/:id/reject', async (req, res) => {
  try {
    const { id } = req.params;
    const { rejectionReason } = req.body;

    if (!rejectionReason || !rejectionReason.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Rejection reason is required',
      });
    }

    const request = await prisma.employerRequest.findUnique({
      where: { id },
    });

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Employer request not found',
      });
    }

    if (request.status !== 'PENDING') {
      return res.status(400).json({
        success: false,
        message: `Cannot reject a request that is already ${request.status}`,
      });
    }

    const updatedRequest = await prisma.employerRequest.update({
      where: { id },
      data: {
        status: 'REJECTED',
        rejectionReason: rejectionReason.trim(),
      },
    });

    console.log(`[Employer Request Rejected] ID: ${id}, Email: ${request.email}`);

    res.json({
      success: true,
      message: 'Employer request rejected',
      data: updatedRequest,
    });
  } catch (error) {
    console.error('[Reject Employer Request Error]:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to reject employer request',
    });
  }
});

module.exports = router;
