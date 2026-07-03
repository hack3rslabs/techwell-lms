const express = require('express');
const { PrismaClient, Prisma } = require('@prisma/client');
const { authenticate, authorize, checkPermission, optionalAuth } = require('../middleware/auth');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { z } = require('zod');
const router = express.Router();
const prisma = new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL } } });

const manualCashPaymentSchema = z.object({
    studentId: z.string().min(1, 'studentId is required'),
    courseId: z.string().min(1, 'courseId is required'),
    additionalCourseIds: z.array(z.string().min(1)).optional(),
    amount: z.preprocess((value) => {
        if (value === '' || value === null || value === undefined) return undefined;
        return typeof value === 'string' ? Number(value) : value;
    }, z.number().finite().nonnegative().optional()),
    paymentMethod: z.enum(['CASH', 'ONLINE', 'RAZORPAY', 'STRIPE']).optional(),
    orderId: z.string().trim().optional(),
    status: z.enum(['SUCCESS', 'FAILED', 'PENDING']).optional(),
});

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
            studentsCount,
            coursesCount,
            enrollmentsCount,
            interviewsCount,
            revenueData
        ] = await Promise.all([
            // Only count users if permitted, else 0
            rules.manageUsers ? prisma.user.count({
                where: req.user.instituteId ? { instituteId: req.user.instituteId } : {}
            }) : Promise.resolve(0),
            // Count students: include institute-specific students AND global students (instituteId is null)
            rules.manageUsers ? prisma.user.count({
                where: {
                    role: 'STUDENT',
                    ...(req.user.instituteId ? { OR: [{ instituteId: req.user.instituteId }, { instituteId: null }] } : {})
                }
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
                course: { select: { id: true, title: true } }
            }
        });

        res.json({
            users: usersCount,
            students: studentsCount,
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
router.get('/courses/pending', authenticate, checkPermission('SYSTEM_LOGS'), async (req, res, next) => {
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
                course: { select: { id: true, id: true, title: true, price: true } },
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
        const { search, course, batchId, status, page = 1, limit = 50 } = req.query;
        const skip = (Number(page) - 1) * Number(limit);

        const where = {
            role: 'STUDENT',
            // If the admin is scoped to an institute, include both institute-specific students
            // and global students (where instituteId is null). This mirrors how user counts
            // are presented in the Users module and prevents missing global students.
            ...(req.user.instituteId ? { OR: [{ instituteId: req.user.instituteId }, { instituteId: null }] } : {})
        };

        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
                { phone: { contains: search, mode: 'insensitive' } },
            ];
        }

        if (status) {
            where.isActive = status === 'ACTIVE' ? true : false;
        }

        if (course) {
            where.enrollments = {
                some: { courseId: course }
            };
        }

        if (batchId) {
            where.enrollments = {
                some: { batchId: batchId }
            };
        }

        const enrollmentWhere = {};
        if (course) enrollmentWhere.courseId = course;
        if (batchId) enrollmentWhere.batchId = batchId;

        const [studentUsers, total] = await Promise.all([
            prisma.user.findMany({
                where,
                select: {
                    id: true,
                    name: true,
                    email: true,
                    phone: true,
                    avatar: true,
                    qualification: true,
                    college: true,
                    plan: true,
                    role: true,
                    createdAt: true,
                    updatedAt: true,
                    isActive: true,
            enrollments: {
                        where: enrollmentWhere,
                        select: {
                            id: true,
                            courseId: true,
                            progress: true,
                            status: true,
                            enrolledAt: true,
                            completedAt: true,
                            course: {
                                select: { id: true, id: true, title: true, category: true, price: true, discountPrice: true, thumbnail: true }
                            }
                        },
                        orderBy: { enrolledAt: 'desc' }
                    },
                    payments: {
                        where: { status: 'SUCCESS' },
                        select: { id: true, courseId: true, status: true, paymentMethod: true }
                    }
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: Number(limit),
            }),
            prisma.user.count({ where })
        ]);

        const students = studentUsers.map(user => {
            const primaryEnrollment = user.enrollments[0] || null;

            return {
            id: user.id,
            userId: user.id,
            courseId: primaryEnrollment?.courseId || null,
            name: user.name,
            email: user.email,
            phone: user.phone,
            qualification: user.qualification,
            progress: primaryEnrollment?.progress || 0,
            enrollmentStatus: primaryEnrollment?.status || 'ACTIVE',
            status: user.isActive ? 'ACTIVE' : 'INACTIVE',
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            course: primaryEnrollment?.course || null,
            paymentDone: primaryEnrollment
                ? user.payments.some(payment => payment.courseId === primaryEnrollment.courseId)
                : false,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                avatar: user.avatar,
                qualification: user.qualification,
                college: user.college,
                plan: user.plan,
                createdAt: user.createdAt,
                enrollments: user.enrollments
            }
            };
        });

        // Course list is also used by the manual payment dialog when a student has no enrollment yet.
        const courses = await prisma.course.findMany({
            where: req.user.instituteId ? { instituteId: req.user.instituteId } : {},
            select: { id: true, id: true, title: true, category: true, price: true, discountPrice: true },
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
// router.get('/students', authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'STAFF'), async (req, res, next) => {
//     try {
//         const { search, course, status, page = 1, limit = 50 } = req.query;
//         const skip = (Number(page) - 1) * Number(limit);

//         // Build filter for enrollments
//         const where = {};
        
//         if (status) {
//             where.status = status;
//         }

//         if (search) {
//             where.user = {
//                 OR: [
//                     { name: { contains: search, mode: 'insensitive' } },
//                     { email: { contains: search, mode: 'insensitive' } },
//                     { phone: { contains: search, mode: 'insensitive' } },
//                 ]
//             };
//         }

//         if (course) {
//             where.courseId = course;
//         }

//         const [enrollmentRecords, total] = await Promise.all([
//             prisma.enrollment.findMany({
//                 where,
//                 include: {
//                     course: {
//                         select: { id: true, id: true, title: true, category: true, price: true, thumbnail: true }
//                     },
//                     user: {
//                         select: {
//                             id: true,
//                             name: true,
//                             email: true,
//                             phone: true,
//                             avatar: true,
//                             qualification: true,
//                             college: true,
//                             plan: true,
//                             createdAt: true,
//                         }
//                     }
//                 },
//                 orderBy: { enrolledAt: 'desc' },
//                 skip,
//                 take: Number(limit),
//             }),
//             prisma.enrollment.count({ where })
//         ]);

//         // Map the Enrollment data to the structure the frontend expects 
//         // (Frontend expects top level name, email, phone etc if it came from request, but mainly user object)
//         const students = enrollmentRecords.map(e => ({
//             id: e.id,
//             userId: e.userId,
//             courseId: e.courseId,
//             name: e.user.name,
//             email: e.user.email,
//             phone: e.user.phone,
//             qualification: e.user.qualification,
//             status: e.status,
//             createdAt: e.enrolledAt,
//             updatedAt: e.enrolledAt,
//             course: e.course,
//             user: {
//                 ...e.user,
//                 enrollments: [e] // Pass the current enrollment in the array so frontend progress works
//             }
//         }));

//         // Get distinct courses for the filter dropdown
//         const courses = await prisma.course.findMany({
//             where: {
//                 enrollments: {
//                     some: {}
//                 }
//             },
//             select: { id: true, id: true, title: true },
//             orderBy: { title: 'asc' }
//         });

//         res.json({
//             students,
//             courses,
//             pagination: {
//                 total,
//                 page: Number(page),
//                 limit: Number(limit),
//                 totalPages: Math.ceil(total / Number(limit))
//             }
//         });
//     } catch (error) {
//         next(error);
//     }
// });

/**
 * @route   GET /api/admin/audit-logs
 * @desc    Get all system audit logs across the entire platform
 * @access  Private/Admin
 */
router.get('/audit-logs', authenticate, checkPermission('SYSTEM_LOGS'), async (req, res, next) => {
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

// GET /api/admin/transactions
router.get('/transactions', authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'STAFF'), async (req, res) => {
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
                        id: true, title: true
                    }
                }
            }
        });

        // Fetch titles for additionalCourseIds
        const allAdditionalIds = [...new Set(payments.flatMap(p => p.additionalCourseIds || []))];
        const additionalCourses = await prisma.course.findMany({
            where: { id: { in: allAdditionalIds } },
            select: { id: true, id: true, title: true }
        });
        
        const courseMap = new Map(additionalCourses.map(c => [c.id, c.title]));

        const enrichedPayments = payments.map(payment => {
            const courses = [];
            if (payment.course) {
                courses.push({ id: payment.course.id, title: payment.course.title });
            }
            
            (payment.additionalCourseIds || []).forEach(id => {
                courses.push({
                    id,
                    title: courseMap.get(id) || 'Unknown Course'
                });
            });

            return {
                ...payment,
                courses
            };
        });

        res.json(enrichedPayments);
    } catch (error) {
        console.error("Fetch All Payments Error:", error);
        res.status(500).json({ error: "Failed to fetch transactions" });
    }
});

// POST /api/admin/transactions/manual-cash
// Allow STAFF to record manual cash payments as well (page is visible to STAFF)
router.post('/transactions/manual-cash', authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'STAFF'), async (req, res) => {
    const parsed = manualCashPaymentSchema.safeParse(req.body);

    if (!parsed.success) {
        return res.status(400).json({
            error: parsed.error.issues[0]?.message || 'Invalid payment request'
        });
    }

    const { studentId, courseId, additionalCourseIds = [], amount: requestedAmount, paymentMethod: requestedMethod, orderId: requestedOrderId, status: requestedStatus } = parsed.data;
    const selectedCourseIds = [...new Set([courseId, ...additionalCourseIds])];

    try {
        const payment = await prisma.$transaction(async (tx) => {
            const [student, selectedCourses, existingSuccessfulPayments] = await Promise.all([
                tx.user.findFirst({
                    where: {
                        id: studentId,
                        role: 'STUDENT',
                        ...(req.user.instituteId ? { OR: [{ instituteId: req.user.instituteId }, { instituteId: null }] } : {})
                    },
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                        qualification: true,
                        college: true,
                        dob: true,
                        isActive: true
                    }
                }),
                tx.course.findMany({
                    where: {
                        id: { in: selectedCourseIds },
                        ...(req.user.instituteId ? { instituteId: req.user.instituteId } : {})
                    },
                    select: { id: true, id: true, title: true, price: true, discountPrice: true }
                }),
                tx.payment.findMany({
                    where: {
                        userId: studentId,
                        status: 'SUCCESS',
                        OR: [
                            { courseId: { in: selectedCourseIds } },
                            { additionalCourseIds: { hasSome: selectedCourseIds } }
                        ]
                    },
                    select: { id: true, courseId: true, additionalCourseIds: true }
                })
            ]);

            if (!student) {
                const error = new Error('Student not found');
                error.statusCode = 404;
                throw error;
            }

            if (!student.isActive) {
                const error = new Error('Cannot record payment for an inactive student');
                error.statusCode = 400;
                throw error;
            }

            if (selectedCourses.length !== selectedCourseIds.length) {
                const error = new Error('One or more selected courses were not found');
                error.statusCode = 404;
                throw error;
            }

            if (existingSuccessfulPayments.length > 0) {
                const paidCourseIds = new Set();
                existingSuccessfulPayments.forEach(payment => {
                    paidCourseIds.add(payment.courseId);
                    (payment.additionalCourseIds || []).forEach(id => paidCourseIds.add(id));
                });
                const duplicateCourse = selectedCourses.find(course => paidCourseIds.has(course.id));
                const error = new Error(`Payment is already recorded for ${duplicateCourse?.title || 'one selected course'}`);
                error.statusCode = 409;
                throw error;
            }

            const courseById = new Map(selectedCourses.map(course => [course.id, course]));
            const orderedCourses = selectedCourseIds.map(id => courseById.get(id));
            const computedAmount = orderedCourses.reduce((sum, course) => {
                const courseAmount = Number(course.discountPrice && Number(course.discountPrice) > 0 ? course.discountPrice : course.price);
                return sum + courseAmount;
            }, 0);
            const amount = (typeof requestedAmount === 'number' && Number.isFinite(requestedAmount) && requestedAmount >= 0) ? requestedAmount : computedAmount;

            if (!Number.isFinite(amount) || amount < 0) {
                const error = new Error('Course amount is invalid');
                error.statusCode = 400;
                throw error;
            }

            const orderIdToUse = requestedOrderId && requestedOrderId.length > 0
                ? requestedOrderId
                : `cash_${Date.now()}_${crypto.randomBytes(6).toString('hex')}`;

            const paymentMethodToUse = requestedMethod || 'CASH';
            const statusToUse = requestedStatus || 'SUCCESS';

            const payment = await tx.payment.create({
                data: {
                    orderId: orderIdToUse,
                    paymentId: `cash_${crypto.randomUUID()}`,
                    amount,
                    currency: 'INR',
                    paymentMethod: paymentMethodToUse,
                    status: statusToUse,
                    userId: student.id,
                    courseId,
                    additionalCourseIds: selectedCourseIds.filter(id => id !== courseId)
                },
                include: {
                    user: { select: { name: true, email: true } },
                    course: { select: { id: true, title: true } }
                }
            });

            if (statusToUse === 'SUCCESS') {
                for (const selectedCourseId of selectedCourseIds) {
                    await tx.enrollment.upsert({
                        where: {
                            userId_courseId: {
                                userId: studentId,
                                courseId: selectedCourseId
                            }
                        },
                        update: { status: 'ACTIVE' },
                        create: {
                            userId: studentId,
                            courseId: selectedCourseId,
                            status: 'ACTIVE'
                        }
                    });
                }

                if (student.email) {
                    for (const selectedCourse of orderedCourses) {
                        await tx.lead.create({
                            data: {
                                name: student.name || 'Techwell Student',
                                email: student.email,
                                phone: student.phone || null,
                                qualification: student.qualification || null,
                                college: student.college || null,
                                dob: student.dob || null,
                                source: 'Course Enrollment',
                                status: 'CONVERTED',
                                notes: `Manual payment recorded for course: ${selectedCourse.title}`,
                                courseId: selectedCourse.id,
                                courseName: selectedCourse.title || 'Unknown Course'
                            }
                        });
                    }
                }
            }

            return payment;
        }, {
            isolationLevel: Prisma.TransactionIsolationLevel.Serializable
        });

        return res.status(201).json({
            message: 'Cash payment recorded successfully',
            transaction: payment
        });
    } catch (error) {
        const statusCode = error.statusCode || (error.code === 'P2034' ? 409 : 500);
        const message = error.code === 'P2034'
            ? 'Another payment is being recorded for this student and course. Please refresh and try again.'
            : error.message || 'Failed to record cash payment';

        console.error('Manual Cash Payment Error:', error);
        return res.status(statusCode).json({ error: message });
    }
});

// ============================================
// BATCH MANAGEMENT
// ============================================

/**
 * @route   GET /api/admin/batches
 * @desc    Get all batches with filters
 * @access  Private/Admin
 */
router.get('/batches', authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'STAFF'), async (req, res, next) => {
    try {
        const { search, courseId, page = 1, limit = 50 } = req.query;
        const skip = (Number(page) - 1) * Number(limit);

        let where = {};
        
        // Only filter by institute if user is not a SUPER_ADMIN
        if (req.user.role !== 'SUPER_ADMIN' && req.user.instituteId) {
            where.instituteId = req.user.instituteId;
        }

        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { batchCode: { contains: search, mode: 'insensitive' } },
            ];
        }

        if (courseId) {
            where.courseId = courseId;
        }

        const [batches, total] = await Promise.all([
            prisma.batch.findMany({
                where,
                include: {
                    course: { select: { title: true } },
                    _count: { select: { BatchStudent: true } }
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: Number(limit)
            }),
            prisma.batch.count({ where })
        ]);

        res.json({
            batches,
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
 * @route   POST /api/admin/batches
 * @desc    Create a new batch and assign students
 * @access  Private/Admin
 */
router.post('/batches', authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'STAFF'), async (req, res, next) => {
    try {
        const { name, courseId, studentIds = [] } = req.body;

        if (!name || !courseId) {
            return res.status(400).json({ error: 'Name and Course ID are required' });
        }

        // Generate unique 4-letter ID
        let batchCode = '';
        let isUnique = false;
        while (!isUnique) {
            batchCode = Math.random().toString(36).substring(2, 6).toUpperCase();
            // Ensure only letters
            batchCode = batchCode.replace(/[0-9]/g, () => String.fromCharCode(65 + Math.floor(Math.random() * 26)));
            
            const existing = await prisma.batch.findUnique({ where: { batchCode } });
            if (!existing) isUnique = true;
        }

        const batch = await prisma.$transaction(async (tx) => {
            const newBatch = await tx.batch.create({
                data: {
                    name,
                    batchCode,
                    courseId,
                    instituteId: req.user.instituteId || null,
                    instructorId: req.user.id, // defaulting to creator as instructor for now
                }
            });

            if (studentIds.length > 0) {
                // Create BatchStudent relationships
                await tx.batchStudent.createMany({
                    data: studentIds.map(userId => ({
                        id: `bs_${Math.random().toString(36).substring(2, 10)}`, // Manual ID generation
                        batchId: newBatch.id,
                        userId
                    })),
                    skipDuplicates: true
                });

                // Update enrollments if they exist for this course
                await tx.enrollment.updateMany({
                    where: {
                        userId: { in: studentIds },
                        courseId: courseId
                    },
                    data: {
                        batchId: newBatch.id
                    }
                });
            }

            return newBatch;
        });

        res.status(201).json({ message: 'Batch created successfully', batch });
    } catch (error) {
        next(error);
    }
});

/**
 * @route   POST /api/admin/batches/:id/complete
 * @desc    Mark a batch as completed and generate certificates for all students
 * @access  Private/Admin
 */
router.post('/batches/:id/complete', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), async (req, res, next) => {
    try {
        const { id } = req.params;

        // 1. Find batch and students
        const batch = await prisma.batch.findUnique({
            where: { id },
            include: {
                BatchStudent: {
                    include: { User: true }
                },
                course: true
            }
        });

        if (!batch) {
            return res.status(404).json({ error: 'Batch not found' });
        }

        if (batch.status === 'COMPLETED') {
            return res.status(400).json({ error: 'Batch is already completed' });
        }

        const students = batch.BatchStudent.map(bs => bs.User);
        
        if (students.length === 0) {
            // Just mark batch as completed if no students
            await prisma.batch.update({
                where: { id },
                data: { status: 'COMPLETED' }
            });
            return res.json({ message: 'Empty batch marked as completed' });
        }

            // 2. Perform updates in a transaction
        const result = await prisma.$transaction(async (tx) => {
            console.log(`[DEBUG] Completing batch ${id} for students:`, students.map(s => s.id));
            // Update Batch status
            await tx.batch.update({
                where: { id },
                data: { status: 'COMPLETED' }
            });

            // Update all enrollments to COMPLETED and fetch them to get IDs
            await tx.enrollment.updateMany({
                where: {
                    userId: { in: students.map(s => s.id) },
                    courseId: batch.courseId
                },
                data: {
                    status: 'COMPLETED',
                    progress: 100,
                    completedAt: new Date()
                }
            });

            const enrollments = await tx.enrollment.findMany({
                where: {
                    userId: { in: students.map(s => s.id) },
                    courseId: batch.courseId
                }
            });

            const enrollmentMap = new Map(enrollments.map(e => [e.userId, e.id]));

            // Get certificate settings for sequence
            let certSettings = await tx.certificateSettings.findFirst({
                where: { instituteId: 'default' }
            });

            if (!certSettings) {
                certSettings = await tx.certificateSettings.create({
                    data: { instituteId: 'default' }
                });
            }

            // Get default template
            const defaultTemplate = await tx.certificateTemplate.findFirst({
                where: { isDefault: true, isActive: true }
            });

            const certificates = [];
            let currentSequence = certSettings.currentSequence;

            for (const student of students) {
                const enrollmentId = enrollmentMap.get(student.id);
                if (!enrollmentId) continue;

                // Check if certificate already exists
                const existing = await tx.certificate.findFirst({
                    where: { userId: student.id, courseId: batch.courseId }
                });

                if (existing) continue;

                currentSequence++;
                
                // Format ID
                const year = certSettings.yearInId ? new Date().getFullYear() : '';
                const sequenceStr = String(currentSequence).padStart(certSettings.sequenceDigits, '0');
                const uniqueId = certSettings.yearInId
                    ? `${certSettings.prefix}-${year}-${sequenceStr}`
                    : `${certSettings.prefix}-${sequenceStr}`;

                // Calculate expiry
                let expiryDate = null;
                if (certSettings.defaultValidityMonths) {
                    expiryDate = new Date();
                    expiryDate.setMonth(expiryDate.getMonth() + certSettings.defaultValidityMonths);
                }

                // Create certificate record
                const cert = await tx.certificate.create({
                    data: {
                        uniqueId,
                        userId: student.id,
                        courseId: batch.courseId,
                        enrollmentId,
                        studentName: student.name,
                        courseName: batch.course.title,
                        courseCategory: batch.course.category,
                        templateId: defaultTemplate?.id,
                        signatureUrl: certSettings.defaultSignatureUrl,
                        signatoryName: certSettings.defaultSignatoryName || 'Director',
                        signatoryTitle: certSettings.defaultSignatoryTitle || 'Academic Director',
                        expiryDate,
                        verificationUrl: `/certificates/verify/${uniqueId}`
                    }
                });
                certificates.push(cert);
            }

            // Update final sequence
            await tx.certificateSettings.update({
                where: { id: certSettings.id },
                data: { currentSequence }
            });

            return { certificateCount: certificates.length };
        });

        res.json({
            message: `Batch completed successfully. ${result.certificateCount} certificates generated.`,
            status: 'COMPLETED'
        });
    } catch (error) {
        console.error('Batch Completion Error:', error);
        next(error);
    }
});

/**
 * @route   PUT /api/admin/batches/:id
 * @desc    Update a batch
 * @access  Private/Admin
 */
router.put('/batches/:id', authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'STAFF'), async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, instructorId, startDate, endDate, description, maxStudents } = req.body;

        const batch = await prisma.batch.update({
            where: { id },
            data: {
                name,
                instructorId,
                startDate: startDate ? new Date(startDate) : undefined,
                endDate: endDate ? new Date(endDate) : undefined,
                description,
                maxStudents: maxStudents ? Number(maxStudents) : undefined
            }
        });

        res.json({ message: 'Batch updated successfully', batch });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
