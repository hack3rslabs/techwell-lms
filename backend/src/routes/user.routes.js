const express = require('express');
const { z } = require('zod');
const { PrismaClient } = require('@prisma/client');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Validation schema
const updateProfileSchema = z.object({
    name: z.string().min(2).optional(),
    phone: z.string().optional(),
    avatar: z.string().url().optional()
});

/**
 * @route   GET /api/users/me
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/me', authenticate, async (req, res, next) => {
    try {
        // Check for interview access
        const hasInterviewAccess = await prisma.enrollment.findFirst({
            where: {
                userId: req.user.id,
                hasInterviewAccess: true,
                status: 'ACTIVE'
            }
        });

        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                plan: true,
                avatar: true,
                phone: true,
                emailVerified: true,
                createdAt: true,
                _count: {
                    select: {
                        enrollments: true,
                        interviews: true
                    }
                }
            }
        });

        res.json({
            user: {
                ...user,
                hasUnlimitedInterviews: !!hasInterviewAccess || user.role === 'SUPER_ADMIN' || user.role === 'ADMIN' // Admins get free access
            }
        });
    } catch (error) {
        next(error);
    }
});

/**
 * @route   PUT /api/users/me
 * @desc    Update current user profile
 * @access  Private
 */
router.put('/me', authenticate, async (req, res, next) => {
    try {
        const validatedData = updateProfileSchema.parse(req.body);

        const user = await prisma.user.update({
            where: { id: req.user.id },
            data: validatedData,
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                avatar: true,
                phone: true
            }
        });

        res.json({ message: 'Profile updated', user });
    } catch (error) {
        next(error);
    }
});

/**
 * @route   GET /api/users
 * @desc    Get all users (Admin only)
 * @access  Private/Admin
 */
router.get('/', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), async (req, res, next) => {
    try {
        const { page = 1, limit = 20, role, search } = req.query;

        const where = {};
        if (role) where.role = role;
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } }
            ];
        }

        const [usersRaw, total] = await Promise.all([
            prisma.user.findMany({
                where,
                select: {
                    id: true,
                    email: true,
                    name: true,
                    role: true,
                    isActive: true,
                    createdAt: true,
                    employerProfile: {
                        select: { status: true }
                    },
                    payments: {
                        select: { amount: true, status: true },
                        where: { status: 'SUCCESS' }
                    }
                },
                skip: (Number(page) - 1) * Number(limit),
                take: Number(limit),
                orderBy: { createdAt: 'desc' }
            }),
            prisma.user.count({ where })
        ]);

        const users = usersRaw.map(u => ({
            ...u,
            totalPaid: u.payments.reduce((sum, p) => sum + p.amount, 0),
            payments: undefined // Remove detailed array to keep response light
        }));

        res.json({
            users,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / Number(limit))
            }
        });
    } catch (error) {
        next(error);
    }
});

/**
 * @route   PATCH /api/users/:id/status
 * @desc    Activate/Deactivate user (Admin only)
 * @access  Private/Admin
 */
router.patch('/:id/status', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), async (req, res, next) => {
    try {
        const { isActive } = req.body;

        // Prevent self-deactivation
        if (req.params.id === req.user.id) {
            return res.status(400).json({ error: 'Cannot change your own status' });
        }

        const user = await prisma.user.update({
            where: { id: req.params.id },
            data: { isActive: Boolean(isActive) },
            select: { id: true, email: true, isActive: true }
        });

        res.json({ message: `User ${isActive ? 'activated' : 'deactivated'}`, user });
    } catch (error) {
        next(error);
    }
});

/**
 * @route   PATCH /api/users/:id/approve
 * @desc    Approve/Reject Employer (Admin)
 * @access  Private (Admin)
 */
router.patch('/:id/approve', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), async (req, res, next) => {
    try {
        const { status, notes } = req.body; // APPROVED, REJECTED
        const { id } = req.params;

        const employerProfile = await prisma.employerProfile.update({
            where: { userId: id },
            data: {
                status,
                verificationNotes: notes,
                documentsVerified: status === 'APPROVED'
            }
        });

        res.json(employerProfile);
    } catch (error) {
        next(error);
    }
});

module.exports = router;
