const express = require('express');
const { z } = require('zod');
const { PrismaClient } = require('@prisma/client');
const { authenticate, authorize, checkPermission } = require('../middleware/auth');

const multer = require('multer');
const path = require('path');
const fs = require('fs');

const router = express.Router();
const prisma = new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL } } });

// Configure storage for profile pictures
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = 'uploads/avatars';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'avatar-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if (mimetype && extname) return cb(null, true);
        cb(new Error('Only images (JPEG, PNG, GIF) are allowed!'));
    }
});

// Validation schema
const updateProfileSchema = z.object({
    name: z.string().min(2).optional(),
    phone: z.string().optional(),
    avatar: z.string().url().optional()
});

const createUserSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    name: z.string().min(2, 'Name must be at least 2 characters'),
    roleId: z.string().optional(),
    role: z.enum(['STUDENT', 'INSTRUCTOR', 'EMPLOYER', 'ADMIN', 'SUPER_ADMIN', 'STAFF', 'INSTITUTE_ADMIN']).default('STUDENT'),
    phone: z.string().optional()
});

/**
 * @route   POST /api/users/profile-image
 * @desc    Upload profile picture
 * @access  Private
 */
router.post('/profile-image', authenticate, upload.single('avatar'), async (req, res, next) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'No image file uploaded' });
        const avatarUrl = `/uploads/avatars/${req.file.filename}`;
        const user = await prisma.user.update({
            where: { id: req.user.id },
            data: { avatar: avatarUrl },
            select: { id: true, name: true, email: true, avatar: true }
        });
        res.json({ message: 'Profile picture updated', avatar: avatarUrl, user });
    } catch (error) {
        if (req.file) fs.unlinkSync(req.file.path);
        next(error);
    }
});

/**
 * @route   GET /api/users/me
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/me', authenticate, async (req, res, next) => {
    try {
        const hasInterviewAccess = await prisma.enrollment.findFirst({
            where: { userId: req.user.id, hasInterviewAccess: true, status: 'ACTIVE' }
        });

        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            select: {
                id: true, email: true, name: true, role: true, plan: true,
                avatar: true, phone: true, emailVerified: true, createdAt: true,
                _count: { select: { enrollments: true, interviews: true } }
            }
        });

        res.json({
            user: {
                ...user,
                permissions: req.user.permissions || [],
                hasUnlimitedInterviews: true // Forced true for testing
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
            select: { id: true, email: true, name: true, role: true, avatar: true, phone: true }
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
router.get('/', authenticate, checkPermission('MANAGE_USERS'), async (req, res, next) => {
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
                    id: true, email: true, name: true, role: true, isActive: true, createdAt: true,
                    employerProfile: { select: { status: true } },
                    payments: { select: { amount: true, status: true }, where: { status: 'SUCCESS' } }
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
            payments: undefined
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
 * @route   GET /api/users/:id/activity
 * @desc    Get user activity logs (Admin only)
 * @access  Private/Admin
 */
router.get('/:id/activity', authenticate, checkPermission('MANAGE_USERS'), async (req, res, next) => {
    try {
        const activity = await prisma.auditLog.findMany({
            where: { performedBy: req.params.id },
            orderBy: { timestamp: 'desc' },
            take: 50
        });
        res.json(activity);
    } catch (error) {
        next(error);
    }
});

/**
 * @route   PATCH /api/users/:id/status
 * @desc    Activate/Deactivate user (Admin only)
 * @access  Private/Admin
 */
router.patch('/:id/status', authenticate, checkPermission('MANAGE_USERS'), async (req, res, next) => {
    try {
        const { isActive } = req.body;
        if (req.params.id === req.user.id) return res.status(400).json({ error: 'Cannot change your own status' });
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
 * @access  Private/Admin
 */
router.patch('/:id/approve', authenticate, checkPermission('MANAGE_USERS'), async (req, res, next) => {
    try {
        const { status, notes } = req.body;
        const employerProfile = await prisma.employerProfile.update({
            where: { userId: req.params.id },
            data: { status, verificationNotes: notes, documentsVerified: status === 'APPROVED' }
        });
        res.json(employerProfile);
    } catch (error) {
        next(error);
    }
});

/**
 * @route   DELETE /api/users/:id
 * @desc    Permanently delete user (Super Admin only)
 * @access  Private/SuperAdmin
 */
router.delete('/:id', authenticate, checkPermission('ALL'), async (req, res, next) => {
    try {
        const { id } = req.params;

        if (id === req.user.id) {
            return res.status(400).json({ error: 'Cannot delete your own account' });
        }

        const userToDelete = await prisma.user.findUnique({
            where: { id },
            select: { role: true }
        });

        if (!userToDelete) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Use a transaction to ensure all related data is cleaned up in the correct order
        await prisma.$transaction(async (tx) => {
            // 1. Clean up Job Interviews (as an interviewer)
            await tx.jobInterview.deleteMany({ where: { interviewerId: id } });

            // 2. Clean up Job Applications (as an applicant)
            // First clean up logs pointing to these applications
            const applicantApps = await tx.jobApplication.findMany({ where: { applicantId: id }, select: { id: true } });
            const applicantAppIds = applicantApps.map(a => a.id);
            if (applicantAppIds.length > 0) {
                await tx.auditLog.deleteMany({ where: { applicationId: { in: applicantAppIds } } });
                await tx.emailLog.deleteMany({ where: { applicationId: { in: applicantAppIds } } });
                await tx.jobApplication.deleteMany({ where: { applicantId: id } });
            }

            // 3. Clean up Job Applications for jobs posted by this user (Employer cleanup)
            const employerJobs = await tx.job.findMany({ where: { employerId: id }, select: { id: true } });
            const jobIds = employerJobs.map(j => j.id);
            if (jobIds.length > 0) {
                // Find all applications for these jobs
                const employerJobApps = await tx.jobApplication.findMany({ where: { jobId: { in: jobIds } }, select: { id: true } });
                const employerJobAppIds = employerJobApps.map(a => a.id);
                if (employerJobAppIds.length > 0) {
                    await tx.auditLog.deleteMany({ where: { applicationId: { in: employerJobAppIds } } });
                    await tx.emailLog.deleteMany({ where: { applicationId: { in: employerJobAppIds } } });
                    await tx.jobApplication.deleteMany({ where: { jobId: { in: jobIds } } });
                }
                await tx.job.deleteMany({ where: { employerId: id } });
            }

            // 4. Clean up Support Tickets & Messages
            await tx.ticketMessage.deleteMany({ where: { userId: id } });
            await tx.ticket.deleteMany({ where: { userId: id } });

            // 5. Clean up Tasks & Comments
            await tx.taskComment.deleteMany({ where: { userId: id } });
            await tx.task.deleteMany({ where: { OR: [{ assignedTo: id }, { createdBy: id }] } });

            // 6. Clean up Blog Posts
            await tx.blogPost.deleteMany({ where: { authorId: id } });

            // 7. Clean up AI Usage & Behavior Intelligence
            await tx.aIUsageLog.deleteMany({ where: { userId: id } });
            await tx.aIBehaviorEvent.deleteMany({ where: { userId: id } });
            await tx.userIntent.deleteMany({ where: { userId: id } });

            // 8. Clean up Financials & Logs
            await tx.payment.deleteMany({ where: { userId: id } });
            await tx.auditLog.deleteMany({ where: { performedBy: id } });
            await tx.auditLog.deleteMany({ where: { entityId: id, entityType: 'USER' } });

            // 9. Clean up sensitive profiles
            await tx.employerProfile.deleteMany({ where: { userId: id } });
            
            // 10. Clean up Library Bookmarks
            await tx.libraryBookmark.deleteMany({ where: { userId: id } });

            // 11. Finally delete the user record
            await tx.user.delete({ where: { id } });
        });

        res.json({ message: 'User permanently purged from the system' });
    } catch (error) {
        next(error);
    }
});

/**
 * @route   POST /api/users
 * @desc    Directly create a user (Admin only)
 * @access  Private/Admin
 */
router.post('/', authenticate, checkPermission('MANAGE_USERS'), async (req, res, next) => {
    try {
        const validatedData = createUserSchema.parse(req.body);
        const bcrypt = require('bcryptjs');

        // Check if user exists
        const existingUser = await prisma.user.findUnique({
            where: { email: validatedData.email }
        });

        if (existingUser) {
            return res.status(400).json({ error: 'Email already registered' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(validatedData.password, 12);

        // Determine Enum Role based on SystemRole name if roleId provided
        let enumRole = validatedData.role;
        if (validatedData.roleId) {
            const systemRole = await prisma.systemRole.findUnique({
                where: { id: validatedData.roleId }
            });

            if (systemRole) {
                const nameMap = {
                    'Super Admin': 'SUPER_ADMIN',
                    'Admin': 'ADMIN',
                    'Instructor': 'INSTRUCTOR',
                    'Student': 'STUDENT',
                    'Employer': 'EMPLOYER',
                    'Staff': 'STAFF',
                    'Institute Admin': 'INSTITUTE_ADMIN'
                };
                if (nameMap[systemRole.name]) {
                    enumRole = nameMap[systemRole.name];
                }
            }
        }

        const user = await prisma.user.create({
            data: {
                email: validatedData.email,
                password: hashedPassword,
                name: validatedData.name,
                phone: validatedData.phone,
                role: enumRole,
                systemRoleId: validatedData.roleId,
                emailVerified: true,
                isActive: true
            },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                systemRole: { select: { name: true } },
                createdAt: true
            }
        });

        res.status(201).json({
            message: 'User created successfully',
            user
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
