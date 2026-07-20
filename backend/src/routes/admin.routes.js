const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate, authorize, checkPermission, optionalAuth } = require('../middleware/auth');
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
            leadsCount,
            upcomingFeesCount,
            campusDrivesCount,
            revenueData,
            activeTasksCount,
            activeTicketsCount,
            activeProjectsCount,
            franchisesCount,
            certificatesCount,
            activeEnrollmentsForFees
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
            prisma.lead.count(),
            prisma.installment.count({ where: { status: 'PENDING' } }),
            prisma.campusDrive.count(),
            // Only agg revenue if permitted, else 0
            rules.viewFinance ? prisma.payment.aggregate({
                _sum: { amount: true },
                where: {
                    status: 'SUCCESS',
                    ...(req.user.instituteId ? { course: { instituteId: req.user.instituteId } } : {})
                }
            }) : Promise.resolve({ _sum: { amount: 0 } }),
            // New: Team Workflow Metrics
            prisma.task.count({
                where: req.user.role === 'SUPER_ADMIN' ? { status: { in: ['PENDING', 'IN_PROGRESS'] } } : { assignedTo: req.user.id, status: { in: ['PENDING', 'IN_PROGRESS'] } }
            }),
            prisma.ticket.count({
                where: req.user.role === 'SUPER_ADMIN' ? { status: { in: ['OPEN', 'IN_PROGRESS'] } } : { assignedTo: req.user.id, status: { in: ['OPEN', 'IN_PROGRESS'] } }
            }),
            prisma.consultingProject.count({
                where: req.user.role === 'SUPER_ADMIN' ? { status: { notIn: ['DELIVERY', 'CANCELLED'] } } : { assigneeId: req.user.id, status: { notIn: ['DELIVERY', 'CANCELLED'] } }
            }),
            prisma.franchise.count(),
            prisma.certificate.count(),
            // Get all active enrollments with their course price and payments
            rules.viewFinance ? prisma.enrollment.findMany({
                where: {
                    status: 'ACTIVE',
                    ...(req.user.instituteId ? { course: { instituteId: req.user.instituteId } } : {})
                },
                include: {
                    course: { select: { price: true } },
                    user: {
                        include: {
                            payments: {
                                where: { status: 'SUCCESS' }
                            }
                        }
                    }
                }
            }) : Promise.resolve([])
        ]);

        // Calculate pending fees
        let totalPendingFees = 0;
        if (rules.viewFinance && activeEnrollmentsForFees && activeEnrollmentsForFees.length > 0) {
            activeEnrollmentsForFees.forEach(enrollment => {
                const coursePrice = Number(enrollment.course?.price || 0);
                // Sum up payments related to this course specifically (if possible, or just all successful payments if that's the logic)
                const payments = enrollment.user?.payments?.filter(p => p.courseId === enrollment.courseId) || [];
                const totalPaid = payments.reduce((sum, p) => sum + Number(p.amount || 0), 0);
                const pending = Math.max(0, coursePrice - totalPaid);
                totalPendingFees += pending;
            });
        }

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
            leads: leadsCount,
            upcomingFeesCount: upcomingFeesCount,
            campusDrives: campusDrivesCount,
            revenue: revenueData?._sum?.amount || 0,
            activeTasks: activeTasksCount,
            activeTickets: activeTicketsCount,
            activeProjects: activeProjectsCount,
            franchises: franchisesCount,
            certificates: certificatesCount,
            pendingFees: totalPendingFees,
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
router.get('/courses/pending', authenticate, checkPermission('SYSTEM_LOGS'), async (req, res, next) => {
    try {
        let { status = 'IN_REVIEW' } = req.query;
    if (status !== undefined) status = Array.isArray(status) ? status[0] : String(status);


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
router.patch('/courses/:id/approve', authenticate, checkPermission('SYSTEM_LOGS'), async (req, res, next) => {
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
router.patch('/courses/:id/reject', authenticate, checkPermission('SYSTEM_LOGS'), async (req, res, next) => {
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
router.patch('/courses/:id/archive', authenticate, checkPermission('SYSTEM_LOGS'), async (req, res, next) => {
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
router.post('/staff', authenticate, checkPermission('SYSTEM_LOGS'), async (req, res, next) => {
    try {
        // Strictly protect staff creation: Only SUPER_ADMIN and ADMIN are authorized
        if (req.user.role !== 'SUPER_ADMIN' && req.user.role !== 'ADMIN') {
            return res.status(403).json({ error: 'Access Denied: Only Admins and Super Admins are authorized to create staff users.' });
        }

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
 * @route   GET /api/admin/employers
 * @desc    Get all Employers for the Employer CRM
 * @access  Private/Admin
 */
router.get('/employers', authenticate, checkPermission('USERS'), async (req, res, next) => {
    try {
        const employers = await prisma.user.findMany({
            where: { role: 'EMPLOYER' },
            include: {
                employerProfile: true,
                _count: { select: { EmployerCampusDrives: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json({ employers });
    } catch (error) {
        next(error);
    }
});

/**
 * @route   GET /api/admin/enrollments
 * @desc    Get all active enrollments
 * @access  Private/Admin
 */
router.get('/enrollments', authenticate, checkPermission('STUDENTS'), async (req, res, next) => {
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
 * @route   PATCH /api/admin/enrollments/:id/status
 * @desc    Update enrollment status
 */

/**
 * @route   POST /api/admin/enrollments/manual
 * @desc    Manually enroll a student (Admin/Staff)
 * @access  Private (Admin/Staff)
 */
router.post('/enrollments/manual', authenticate, checkPermission('STUDENTS'), async (req, res, next) => {
    try {
        const { userId, courseId, batchId, paymentMethod, couponCode, amountPaid } = req.body;
        
        if (!userId || !courseId) {
            return res.status(400).json({ error: 'User and Course are required' });
        }

        const course = await prisma.course.findUnique({ where: { id: courseId } });
        if (!course) return res.status(404).json({ error: 'Course not found' });

        // Calculate discount if coupon exists
        let discountAmount = 0;
        let finalAmount = course.price;
        let appliedCouponId = null;

        if (couponCode) {
            const coupon = await prisma.coupon.findUnique({ where: { code: couponCode } });
            if (coupon && coupon.isActive && new Date(coupon.expiryDate) > new Date()) {
                if (coupon.discountType === 'PERCENTAGE') {
                    discountAmount = (course.price * coupon.discountValue) / 100;
                } else {
                    discountAmount = coupon.discountValue;
                }
                finalAmount = course.price - discountAmount;
                appliedCouponId = coupon.id;
            }
        }

        // We use the amount passed from frontend if provided and validated, or the calculated one
        const paymentAmount = amountPaid !== undefined ? parseFloat(amountPaid) : finalAmount;

        // Create Payment
        const payment = await prisma.payment.create({
            data: {
                orderId: `MANUAL_${Date.now()}_${String(userId || "").substring(0, 5)}`,
                amount: paymentAmount,
                status: 'COMPLETED',
                paymentMethod: paymentMethod || 'CASH', // CASH or ONLINE
                userId,
                courseId
            }
        });

        // Create Enrollment
        const enrollment = await prisma.enrollment.create({
            data: {
                userId,
                courseId,
                batchId: batchId || null,
                status: 'ACTIVE'
            },
            include: {
                user: true,
                course: true
            }
        });

        res.status(201).json({ 
            message: 'Enrollment successful', 
            enrollment,
            payment 
        });

    } catch (error) {
        console.error('Manual enrollment error:', error);
        next(error);
    }
});

router.patch('/enrollments/:id/status', authenticate, checkPermission('STUDENTS'), async (req, res, next) => {
    try {
        const { status } = req.body;
        const enrollment = await prisma.enrollment.update({
            where: { id: req.params.id },
            data: { status }
        });
        res.json({ enrollment });
    } catch (error) {
        next(error);
    }
});

/**
 * @route   GET /api/admin/students/available-for-batch
 * @desc    Get all students enrolled in a course who are not assigned to a batch
 * @access  Private/Admin
 */
router.get('/students/available-for-batch', authenticate, checkPermission('STUDENTS'), async (req, res, next) => {
    try {
        let { courseId } = req.query;
    if (courseId !== undefined) courseId = Array.isArray(courseId) ? courseId[0] : String(courseId);

        if (!courseId) {
            return res.status(400).json({ error: 'Course ID is required' });
        }

        const enrollments = await prisma.enrollment.findMany({
            where: {
                courseId,
                batchId: null,
                status: 'ACTIVE'
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                        location: true
                    }
                }
            },
            orderBy: {
                createdAt: 'asc' // FIFO
            }
        });

        const students = enrollments.map(e => ({
            id: e.user.id,
            userId: e.user.id,
            name: e.user.name,
            email: e.user.email,
            phone: e.user.phone,
            location: e.user.location,
            progress: e.progress,
            enrollmentStatus: e.status,
            enrollmentMode: e.enrollmentMode,
            enrollmentDate: e.createdAt
        }));

        res.json({ students });
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
router.get('/students', authenticate, checkPermission('STUDENTS'), async (req, res, next) => {
    try {
        let { search, course, status, page = 1, limit = 50 } = req.query;
    if (search !== undefined) search = Array.isArray(search) ? search[0] : String(search);
    if (course !== undefined) course = Array.isArray(course) ? course[0] : String(course);
    if (status !== undefined) status = Array.isArray(status) ? status[0] : String(status);

        const skip = (Number(page) - 1) * Number(limit);

        // Build filter for users
        const where = { role: 'STUDENT' };

        if (status) {
            where.isActive = status === 'ACTIVE';
        }

        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
                { phone: { contains: search, mode: 'insensitive' } },
            ];
        }

        if (course) {
            where.enrollments = {
                some: { courseId: course }
            };
        }

        const [usersRaw, total] = await Promise.all([
            prisma.user.findMany({
                where,
                include: {
                    enrollments: {
                        include: {
                            course: { select: { id: true, title: true, category: true, price: true, thumbnail: true } },
                            installments: true
                        }
                    },
                    payments: true
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: Number(limit),
            }),
            prisma.user.count({ where })
        ]);

        // Map the User data to the structure the frontend expects 
        const students = usersRaw.map(u => {
            const primaryEnrollment = u.enrollments[0];
            return {
                id: primaryEnrollment?.id || u.id,
                userId: u.id,
                courseId: primaryEnrollment?.courseId || null,
                name: u.name,
                email: u.email,
                phone: u.phone,
                location: u.location,
                qualification: u.qualification,
                status: u.isActive ? 'ACTIVE' : 'INACTIVE',
                createdAt: u.createdAt,
                updatedAt: u.createdAt,
                course: primaryEnrollment?.course || null,
                paymentDone: u.enrollments.length > 0,
                user: {
                    ...u,
                    enrollments: u.enrollments 
                }
            };
        });

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
router.get('/audit-logs', authenticate, checkPermission('SYSTEM_LOGS'), async (req, res, next) => {
    try {
        let { search, action, entityType, startDate, endDate, role, severity, ipAddress, page = 1, limit = 50 } = req.query;
    if (search !== undefined) search = Array.isArray(search) ? search[0] : String(search);
    if (action !== undefined) action = Array.isArray(action) ? action[0] : String(action);
    if (entityType !== undefined) entityType = Array.isArray(entityType) ? entityType[0] : String(entityType);
    if (startDate !== undefined) startDate = Array.isArray(startDate) ? startDate[0] : String(startDate);
    if (endDate !== undefined) endDate = Array.isArray(endDate) ? endDate[0] : String(endDate);
    if (role !== undefined) role = Array.isArray(role) ? role[0] : String(role);
    if (severity !== undefined) severity = Array.isArray(severity) ? severity[0] : String(severity);
    if (ipAddress !== undefined) ipAddress = Array.isArray(ipAddress) ? ipAddress[0] : String(ipAddress);

        const skip = (Number(page) - 1) * Number(limit);

        const where = {};

        if (action) {
            where.action = action;
        }

        if (entityType) {
            where.entityType = entityType;
        }

        if (startDate || endDate) {
            where.timestamp = {};
            if (startDate) where.timestamp.gte = new Date(startDate);
            if (endDate) where.timestamp.lte = new Date(endDate);
        }

        if (role) {
            where.userRole = role;
        }

        if (severity) {
            where.severity = severity;
        }

        if (ipAddress) {
            where.ipAddress = { contains: ipAddress, mode: 'insensitive' };
        }

        if (search) {
            where.OR = [
                { performedBy: { contains: search, mode: 'insensitive' } },
                { method: { contains: search, mode: 'insensitive' } },
                { path: { contains: search, mode: 'insensitive' } },
            ];
        }

        const [logs, total, severityGroups] = await Promise.all([
            prisma.auditLog.findMany({
                where,
                orderBy: { timestamp: 'desc' },
                skip,
                take: Number(limit)
            }),
            prisma.auditLog.count({ where }),
            prisma.auditLog.groupBy({
                by: ['severity'],
                _count: true,
                where
            })
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

        // Format summary
        const summary = {
            INFO: 0,
            WARNING: 0,
            CRITICAL: 0,
            TOTAL: total
        };

        severityGroups.forEach(group => {
            if (summary[group.severity] !== undefined) {
                summary[group.severity] = group._count;
            }
        });

        res.json({
            logs: mappedLogs,
            summary,
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

// GET /api/admin/transactions
router.get('/transactions', authenticate, checkPermission('TRANSACTIONS'), async (req, res) => {
    try {
        const payments = await prisma.payment.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                user: {
                    select: {
                        name: true,
                        email: true
                    }
                },
                course: {
                    select: {
                        title: true
                    }
                }
            }
        });

        res.json(payments);
    } catch (error) {
        console.error("Fetch All Payments Error:", error);
        res.status(500).json({ error: "Failed to fetch transactions" });
    }
});

/**
 * @route   POST /api/admin/reports/generate
 * @desc    Dynamic BI Report Generator
 * @access  Private/Admin
 */
router.post('/reports/generate', authenticate, checkPermission('REPORTS'), async (req, res, next) => {
    try {
        const { dataset, dimension, metric, startDate, endDate } = req.body;

        const dateFilter = {};
        if (startDate && endDate) {
            dateFilter.gte = new Date(startDate);
            dateFilter.lte = new Date(endDate);
        }

        let data = [];
        let summary = { total: 0 };

        // ---------------- LEADS ----------------
        if (dataset === 'LEADS') {
            const where = { createdAt: Object.keys(dateFilter).length ? dateFilter : undefined };
            summary.total = await prisma.lead.count({ where });

            if (dimension === 'STATUS') {
                const grouped = await prisma.lead.groupBy({
                    by: ['status'],
                    _count: true,
                    where
                });
                data = grouped.map(g => ({ name: g.status, value: g._count }));
            }
            else if (dimension === 'SOURCE') {
                const grouped = await prisma.lead.groupBy({
                    by: ['source'],
                    _count: true,
                    where
                });
                data = grouped.map(g => ({ name: g.source, value: g._count }));
            }
            else if (dimension === 'DATE') {
                // Grouping by Date in JS for simplicity
                const leads = await prisma.lead.findMany({ where, select: { createdAt: true } });
                const dateMap = {};
                leads.forEach(l => {
                    const date = l.createdAt.toISOString().split('T')[0];
                    dateMap[date] = (dateMap[date] || 0) + 1;
                });
                data = Object.keys(dateMap).sort().map(k => ({ name: k, value: dateMap[k] }));
            }
        }

        // ---------------- REVENUE ----------------
        else if (dataset === 'REVENUE') {
            const where = {
                createdAt: Object.keys(dateFilter).length ? dateFilter : undefined,
                status: 'SUCCESS'
            };
            const sumAgg = await prisma.payment.aggregate({ _sum: { amount: true }, where });
            summary.total = sumAgg._sum.amount || 0;

            if (dimension === 'DATE') {
                const payments = await prisma.payment.findMany({ where, select: { createdAt: true, amount: true } });
                const dateMap = {};
                payments.forEach(p => {
                    const date = p.createdAt.toISOString().split('T')[0];
                    dateMap[date] = (dateMap[date] || 0) + Number(p.amount);
                });
                data = Object.keys(dateMap).sort().map(k => ({ name: k, value: dateMap[k] }));
            }
            else if (dimension === 'COURSE') {
                const payments = await prisma.payment.findMany({ where, include: { course: true } });
                const courseMap = {};
                payments.forEach(p => {
                    const cName = p.course?.title || 'Unknown';
                    courseMap[cName] = (courseMap[cName] || 0) + Number(p.amount);
                });
                data = Object.keys(courseMap).map(k => ({ name: k, value: courseMap[k] }));
            }
        }

        // ---------------- ENROLLMENTS ----------------
        else if (dataset === 'ENROLLMENTS') {
            const where = { enrolledAt: Object.keys(dateFilter).length ? dateFilter : undefined };
            summary.total = await prisma.enrollment.count({ where });

            if (dimension === 'STATUS') {
                const grouped = await prisma.enrollment.groupBy({ by: ['status'], _count: true, where });
                data = grouped.map(g => ({ name: g.status, value: g._count }));
            }
            else if (dimension === 'COURSE') {
                const enrollments = await prisma.enrollment.findMany({ where, include: { course: true } });
                const courseMap = {};
                enrollments.forEach(e => {
                    const cName = e.course?.title || 'Unknown';
                    courseMap[cName] = (courseMap[cName] || 0) + 1;
                });
                data = Object.keys(courseMap).map(k => ({ name: k, value: courseMap[k] }));
            }
            else if (dimension === 'DATE') {
                const enrolls = await prisma.enrollment.findMany({ where, select: { enrolledAt: true } });
                const dateMap = {};
                enrolls.forEach(e => {
                    const date = e.enrolledAt.toISOString().split('T')[0];
                    dateMap[date] = (dateMap[date] || 0) + 1;
                });
                data = Object.keys(dateMap).sort().map(k => ({ name: k, value: dateMap[k] }));
            }
        }

        // ---------------- TASKS ----------------
        else if (dataset === 'TASKS') {
            const where = { createdAt: Object.keys(dateFilter).length ? dateFilter : undefined };
            summary.total = await prisma.task.count({ where });

            if (dimension === 'STATUS') {
                const grouped = await prisma.task.groupBy({ by: ['status'], _count: true, where });
                data = grouped.map(g => ({ name: g.status, value: g._count }));
            }
            else if (dimension === 'PRIORITY') {
                const grouped = await prisma.task.groupBy({ by: ['priority'], _count: true, where });
                data = grouped.map(g => ({ name: g.priority, value: g._count }));
            }
        }

        // ---------------- PAYROLL ----------------
        else if (dataset === 'PAYROLL') {
            const where = { createdAt: Object.keys(dateFilter).length ? dateFilter : undefined };
            const sumAgg = await prisma.staffPayroll.aggregate({ _sum: { netAmount: true }, where });
            summary.total = sumAgg._sum.netAmount || 0;

            if (dimension === 'STATUS') {
                const grouped = await prisma.staffPayroll.groupBy({ by: ['status'], _count: true, where });
                data = grouped.map(g => ({ name: g.status, value: g._count }));
            }
            else if (dimension === 'DATE') {
                const payrolls = await prisma.staffPayroll.findMany({ where, select: { createdAt: true, netAmount: true } });
                const dateMap = {};
                payrolls.forEach(p => {
                    const date = p.createdAt.toISOString().split('T')[0];
                    dateMap[date] = (dateMap[date] || 0) + Number(p.netAmount);
                });
                data = Object.keys(dateMap).sort().map(k => ({ name: k, value: dateMap[k] }));
            }
        }

        // ---------------- ATTENDANCE ----------------
        else if (dataset === 'ATTENDANCE') {
            const where = { createdAt: Object.keys(dateFilter).length ? dateFilter : undefined };
            summary.total = await prisma.staffAttendance.count({ where });

            if (dimension === 'STATUS') {
                const grouped = await prisma.staffAttendance.groupBy({ by: ['status'], _count: true, where });
                data = grouped.map(g => ({ name: g.status, value: g._count }));
            }
            else if (dimension === 'DATE') {
                const attendances = await prisma.staffAttendance.findMany({ where, select: { createdAt: true } });
                const dateMap = {};
                attendances.forEach(a => {
                    const date = a.createdAt.toISOString().split('T')[0];
                    dateMap[date] = (dateMap[date] || 0) + 1;
                });
                data = Object.keys(dateMap).sort().map(k => ({ name: k, value: dateMap[k] }));
            }
        }

        res.json({
            dataset,
            dimension,
            summary,
            data
        });

    } catch (error) {
        next(error);
    }
});

/**
 * @route   GET /api/admin/gdpr/requests
 * @desc    Get all users who requested data deletion
 * @access  Private/Admin
 */
router.get('/gdpr/requests', authenticate, checkPermission('SYSTEM_LOGS'), async (req, res, next) => {
    try {
        const users = await prisma.user.findMany({
            where: { deleteRequested: true },
            select: {
                id: true,
                name: true,
                email: true,
                deleteRequestDate: true,
                subscribedToNewsletter: true
            },
            orderBy: { deleteRequestDate: 'asc' }
        });
        res.json({ success: true, data: users });
    } catch (error) {
        next(error);
    }
});

/**
 * @route   GET /api/admin/gdpr/unsubscribed
 * @desc    Get all users who have unsubscribed from the newsletter
 * @access  Private/Admin
 */
router.get('/gdpr/unsubscribed', authenticate, checkPermission('SYSTEM_LOGS'), async (req, res, next) => {
    try {
        const users = await prisma.user.findMany({
            where: { subscribedToNewsletter: false },
            select: {
                id: true,
                name: true,
                email: true,
                updatedAt: true
            },
            orderBy: { updatedAt: 'desc' }
        });
        res.json({ success: true, data: users });
    } catch (error) {
        next(error);
    }
});


/**
 * @route   PATCH /api/admin/gdpr/requests/:id
 * @desc    Process a deletion request (mark inactive or delete)
 * @access  Private/Admin
 */
router.patch('/gdpr/requests/:id', authenticate, checkPermission('SYSTEM_LOGS'), async (req, res, next) => {
    try {
        const { action } = req.body; // 'PROCESS' or 'CANCEL'

        if (action === 'PROCESS') {
            await prisma.user.update({
                where: { id: req.params.id },
                data: {
                    isActive: false,
                    deleteRequested: false, // cleared
                    email: `deleted_${Date.now()}_${req.params.id}@deleted.com`,
                    name: 'Deleted User'
                }
            });
        } else if (action === 'CANCEL') {
            await prisma.user.update({
                where: { id: req.params.id },
                data: {
                    deleteRequested: false,
                    deleteRequestDate: null
                }
            });
        }

        res.json({ success: true, message: `Request ${action === 'PROCESS' ? 'processed' : 'cancelled'} successfully.` });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
