const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate, authorize } = require('../middleware/auth');
const bcrypt = require('bcryptjs');
const { z } = require('zod');
const router = express.Router();
const prisma = new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL } } });

/**
 * @route   GET /api/admin/stats
 * @desc    Get platform-wide statistics for Admin Dashboard
 * @access  Private/Admin
 */
router.get('/stats', authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'INSTITUTE_ADMIN', 'STAFF'), async (req, res, next) => {
    try {
        const permissions = req.user.permissions || [];
        const rules = {
            viewFinance: req.user.role === 'SUPER_ADMIN' || permissions.includes('VIEW_FINANCE'),
            manageUsers: req.user.role === 'SUPER_ADMIN' || permissions.includes('MANAGE_USERS'),
            // Basic stats are visible to all staff
        };

        const [
            usersCount,
            coursesCount,
            enrollmentsCount,
            interviewsCount,
            revenueData
        ] = await Promise.all([
            // Only count users if permitted, else 0
            rules.manageUsers ? prisma.user.count({
                where: req.user.instituteId ? { instituteId: req.user.instituteId } : {}
            }) : Promise.resolve(0),
            prisma.course.count({
                where: req.user.instituteId ? { instituteId: req.user.instituteId } : {}
            }),
            prisma.enrollment.count({
                where: req.user.instituteId ? { course: { instituteId: req.user.instituteId } } : {}
            }),
            prisma.interview.count({
                where: req.user.instituteId ? { user: { instituteId: req.user.instituteId } } : {}
            }),
            // Only agg revenue if permitted, else 0
            rules.viewFinance ? prisma.payment.aggregate({
                _sum: { amount: true },
                where: {
                    status: 'SUCCESS',
                    ...(req.user.instituteId ? { course: { instituteId: req.user.instituteId } } : {})
                }
            }) : Promise.resolve({ _sum: { amount: 0 } })
        ]);

        // Get recent enrollments for chart/list
        const recentEnrollments = await prisma.enrollment.findMany({
            take: 5,
            orderBy: { enrolledAt: 'desc' },
            include: {
                user: { select: { name: true, email: true } },
                course: { select: { title: true } }
            }
        });

        res.json({
            users: usersCount,
            courses: coursesCount,
            enrollments: enrollmentsCount,
            interviews: interviewsCount,
            revenue: revenueData._sum.amount || 0,
            recentActivity: recentEnrollments
        });
    } catch (error) {
        next(error);
    }
});

/**
 * @route   GET /api/admin/courses/pending
 * @desc    Get courses pending review or in specific status
 * @access  Private/Admin
 */
router.get('/courses/pending', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), async (req, res, next) => {
    try {
        const { status = 'IN_REVIEW' } = req.query;

        const whereClause = status === 'ALL'
            ? {}
            : { publishStatus: status };

        const courses = await prisma.course.findMany({
            where: whereClause,
            orderBy: { updatedAt: 'desc' },
            include: {
                _count: {
                    select: { modules: true, enrollments: true }
                }
            }
        });

        res.json({ courses });
    } catch (error) {
        next(error);
    }
});

/**
 * @route   PATCH /api/admin/courses/:id/approve
 * @desc    Approve a course and set to PUBLISHED
 * @access  Private/Admin
 */
router.patch('/courses/:id/approve', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), async (req, res, next) => {
    try {
        const { id } = req.params;
        const { notes } = req.body;

        const course = await prisma.course.update({
            where: { id },
            data: {
                publishStatus: 'PUBLISHED',
                isPublished: true,
                publishedAt: new Date(),
                reviewNotes: notes || null
            }
        });

        res.json({ message: 'Course approved and published', course });
    } catch (error) {
        next(error);
    }
});

/**
 * @route   PATCH /api/admin/courses/:id/reject
 * @desc    Reject a course and send it back to DRAFT
 * @access  Private/Admin
 */
router.patch('/courses/:id/reject', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), async (req, res, next) => {
    try {
        const { id } = req.params;
        const { notes } = req.body;

        if (!notes) {
            return res.status(400).json({ error: 'Rejection notes are required' });
        }

        const course = await prisma.course.update({
            where: { id },
            data: {
                publishStatus: 'DRAFT',
                reviewNotes: notes
            }
        });

        res.json({ message: 'Course rejected and returned to draft', course });
    } catch (error) {
        next(error);
    }
});

/**
 * @route   PATCH /api/admin/courses/:id/archive
 * @desc    Archive a published course
 * @access  Private/Admin
 */
router.patch('/courses/:id/archive', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), async (req, res, next) => {
    try {
        const { id } = req.params;

        const course = await prisma.course.update({
            where: { id },
            data: {
                publishStatus: 'ARCHIVED',
                isPublished: false
            }
        });

        res.json({ message: 'Course archived', course });
    } catch (error) {
        next(error);
    }
});

/**
 * @route   POST /api/admin/staff
 * @desc    Create a Staff or Institute Admin user with specific permissions
 * @access  Private/Admin
 */
router.post('/staff', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), async (req, res, next) => {
    try {
        const { name, email, password, role, permissions, phone } = req.body;

        // Basic validation
        if (!email || !password || !name || !role) {
            return res.status(400).json({ error: 'Name, email, password, and role are required' });
        }

        // Validate Role (Must be STAFF, INSTITUTE_ADMIN, or INSTRUCTOR)
        // Prevent creating SUPER_ADMINs via this route for safety
        const allowedRoles = ['STAFF', 'INSTITUTE_ADMIN', 'INSTRUCTOR', 'ADMIN', 'EMPLOYER'];
        if (!allowedRoles.includes(role)) {
            return res.status(400).json({ error: 'Invalid role assignment' });
        }

        // Check if user exists
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            return res.status(400).json({ error: 'Email already registered' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Create user
        const newUser = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                phone,
                role, // Assign selected role
                permissions: permissions || [], // Assign JSON permissions array
                isActive: true,
                emailVerified: true // Admin created users are verified by default
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                permissions: true
            }
        });

        // If Employer, create default profile
        if (role === 'EMPLOYER') {
            await prisma.employerProfile.create({
                data: {
                    userId: newUser.id,
                    companyName: name + " (Company)", // Default company name
                    status: 'APPROVED', // Auto-approve admin-created employers
                    industry: 'Unspecified',
                    location: 'Remote'
                }
            });
        }

        res.status(201).json({
            message: 'User created successfully',
            user: newUser
        });
    } catch (error) {
        next(error);
    }
});
/**
 * @route   GET /api/admin/enrollments
 * @desc    Get all active enrollments
 * @access  Private/Admin
 */
router.get('/enrollments', authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'STAFF'), async (req, res, next) => {
    try {
        const enrollments = await prisma.enrollment.findMany({
            include: {
                course: { select: { id: true, title: true, price: true } },
                user: { select: { id: true, name: true, email: true, phone: true } }
            },
            orderBy: { enrolledAt: 'desc' }
        });
        res.json({ enrollments });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
