const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate, authorize, checkPermission, optionalAuth } = require('../middleware/auth');
const router = express.Router();
const prisma = new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL } } });

/**
 * @route   GET /api/employers/profile
 * @desc    Get current employer profile
 * @access  Private (Employer)
 */
router.get('/profile', authenticate, authorize('EMPLOYER'), async (req, res, next) => {
    try {
        const profile = await prisma.employerProfile.findUnique({
            where: { userId: req.user.id }
        });
        if (!profile) return res.status(404).json({ error: 'Profile not found' });
        res.json(profile);
    } catch (error) {
        next(error);
    }
});

/**
 * @route   PUT /api/employers/profile
 * @desc    Update employer profile
 * @access  Private (Employer)
 */
router.put('/profile', authenticate, authorize('EMPLOYER'), async (req, res, next) => {
    try {
        const { companyName, website, description, logo, location, industry, companySize } = req.body;

        const profile = await prisma.employerProfile.upsert({
            where: { userId: req.user.id },
            update: { companyName, website, description, logo, location, industry, companySize },
            create: {
                userId: req.user.id,
                companyName, mobile: "N/A", website, description, logo, location, industry, companySize,
                status: 'PENDING'
            }
        });

        res.json(profile);
    } catch (error) {
        next(error);
    }
});

/**
 * @route   POST /api/employers/register
 * @desc    Register as new Employer (creates User + Profile)
 * @access  Public
 */
router.post('/register', async (req, res, next) => {
    try {
        const { email, password, name, companyName, phone } = req.body;

        // 1. Create User
        // Note: Password hashing should be done here or reuse auth service logic.
        // For simplicity/consistency, we often use the central Auth register. 
        // THIS ROUTE MIGHT BE REDUNDANT if we modify standard register.
        // Let's assume standard register handles User creation, and this handles profile?
        // OR: We create a specific endpoint that does both transactional.

        // Re-using Auth Login is better. Let's redirect users to Main Register 
        // OR create a specific endpoint that sets Role=EMPLOYER immediately.

        // Using direct Prisma for custom flow:
        const bcrypt = require('bcryptjs');
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) return res.status(400).json({ error: 'Email already exists' });

        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await prisma.$transaction(async (tx) => {
            const user = await tx.user.create({
                data: {
                    email,
                    password: hashedPassword,
                    name,
                    role: 'EMPLOYER',
                    phone
                }
            });

            const profile = await tx.employerProfile.create({
                data: {
                    userId: user.id,
                    companyName,
                    status: 'PENDING'
                }
            });

            return { user, profile };
        });

        res.status(201).json({ message: 'Employer registered successfully. Pending approval.', userId: result.user.id });
    } catch (error) {
        next(error);
    }
});

/**
 * @route   GET /api/employers/pending
 * @desc    List pending employers
 * @access  Private (Super Admin)
 */
router.get('/pending', authenticate, authorize('SUPER_ADMIN'), async (req, res, next) => {
    try {
        const employers = await prisma.employerProfile.findMany({
            where: { status: 'PENDING' },
            include: { user: { select: { email: true, name: true, phone: true } } }
        });
        res.json(employers);
    } catch (error) {
        next(error);
    }
});

/**
 * @route   PUT /api/employers/:id/status
 * @desc    Approve/Reject employer
 * @access  Private (Super Admin)
 */
router.put('/:id/status', authenticate, authorize('SUPER_ADMIN'), async (req, res, next) => {
    try {
        const { status } = req.body; // APPROVED / REJECTED
        const profile = await prisma.employerProfile.update({
            where: { id: req.params.id },
            data: { status }
        });

        // Optional: Send email notification

        res.json(profile);
    } catch (error) {
        next(error);
    }
});

module.exports = router;
