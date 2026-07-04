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

        const existingProfile = await prisma.employerProfile.findUnique({
            where: { userId: req.user.id }
        });
        if (!existingProfile || existingProfile.status !== 'APPROVED') {
            return res.status(403).json({ error: 'Employer approval is required.' });
        }

        const profile = await prisma.employerProfile.update({
            where: { userId: req.user.id },
            data: { companyName, website, description, logo, location, industry, companySize },
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
    return res.status(410).json({
        error: 'Employer registration now requires admin approval.',
        endpoint: '/api/employer-requests'
    });
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
