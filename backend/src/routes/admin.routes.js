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

/**
 * @route   GET /api/admin/students
 * @desc    Get all students who were approved through enrollment requests,
 *          along with their enrollment and progress details
 * @access  Private/Admin
 */
router.get('/students', authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'STAFF'), async (req, res, next) => {
    try {
        const { search, course, status, page = 1, limit = 50 } = req.query;
        const skip = (Number(page) - 1) * Number(limit);

        // Build filter for enrollments
        const where = {};
        
        if (status) {
            where.status = status;
        }

        if (search) {
            where.user = {
                OR: [
                    { name: { contains: search, mode: 'insensitive' } },
                    { email: { contains: search, mode: 'insensitive' } },
                    { phone: { contains: search, mode: 'insensitive' } },
                ]
            };
        }

        if (course) {
            where.courseId = course;
        }

        const [enrollmentRecords, total] = await Promise.all([
            prisma.enrollment.findMany({
                where,
                include: {
                    course: {
                        select: { id: true, title: true, category: true, price: true, thumbnail: true }
                    },
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            phone: true,
                            avatar: true,
                            qualification: true,
                            college: true,
                            plan: true,
                            createdAt: true,
                        }
                    }
                },
                orderBy: { enrolledAt: 'desc' },
                skip,
                take: Number(limit),
            }),
            prisma.enrollment.count({ where })
        ]);

        // Map the Enrollment data to the structure the frontend expects 
        // (Frontend expects top level name, email, phone etc if it came from request, but mainly user object)
        const students = enrollmentRecords.map(e => ({
            id: e.id,
            userId: e.userId,
            courseId: e.courseId,
            name: e.user.name,
            email: e.user.email,
            phone: e.user.phone,
            qualification: e.user.qualification,
            status: e.status,
            createdAt: e.enrolledAt,
            updatedAt: e.enrolledAt,
            course: e.course,
            user: {
                ...e.user,
                enrollments: [e] // Pass the current enrollment in the array so frontend progress works
            }
        }));

        // Get distinct courses for the filter dropdown
        const courses = await prisma.course.findMany({
            where: {
                enrollments: {
                    some: {}
                }
            },
            select: { id: true, title: true },
            orderBy: { title: 'asc' }
        });

        res.json({
            students,
            courses,
            pagination: {
                total,
                page: Number(page),
                limit: Number(limit),
                totalPages: Math.ceil(total / Number(limit))
            }
        });
    } catch (error) {
        next(error);
    }
});

/**
 * @route   GET /api/admin/audit-logs
 * @desc    Get all system audit logs across the entire platform
 * @access  Private/Admin
 */
router.get('/audit-logs', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), async (req, res, next) => {
    try {
        const { search, action, entityType, page = 1, limit = 50 } = req.query;
        const skip = (Number(page) - 1) * Number(limit);

        const where = {};
        
        if (action) {
            where.action = action;
        }

        if (entityType) {
            where.entityType = entityType;
        }

        if (search) {
            where.OR = [
                { performedBy: { contains: search, mode: 'insensitive' } },
                { method: { contains: search, mode: 'insensitive' } },
                { path: { contains: search, mode: 'insensitive' } },
            ];
        }

        const [logs, total] = await Promise.all([
            prisma.auditLog.findMany({
                where,
                orderBy: { timestamp: 'desc' },
                skip,
                take: Number(limit)
            }),
            prisma.auditLog.count({ where })
        ]);
        
        // We need to resolve the user names for 'performedBy' since performedBy is a string ID
        // Often 'performedBy' could be 'SYSTEM' or an arbitrary ID
        const userIds = [...new Set(logs.map(log => log.performedBy).filter(id => id && id !== 'SYSTEM'))];
        let users = [];
        if (userIds.length > 0) {
            users = await prisma.user.findMany({
                where: { id: { in: userIds } },
                select: { id: true, name: true, email: true, role: true }
            });
        }
        
        const userMap = users.reduce((acc, user) => {
            acc[user.id] = user;
            return acc;
        }, {});

        const mappedLogs = logs.map(log => ({
            ...log,
            user: userMap[log.performedBy] || { name: log.performedBy, email: 'SYSTEM' } // fallback mapping
        }));

        res.json({
            logs: mappedLogs,
            pagination: {
                total,
                page: Number(page),
                limit: Number(limit),
                totalPages: Math.ceil(total / Number(limit))
            }
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
