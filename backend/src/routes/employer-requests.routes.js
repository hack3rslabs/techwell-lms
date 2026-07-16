const express = require('express');
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const { z } = require('zod');
const { authenticate, authorize } = require('../middleware/auth');
const { sendEmail } = require('../utils/emailSender');

const router = express.Router();
const prisma = new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL } } });

const ADMIN_ROLES = ['SUPER_ADMIN', 'ADMIN'];
const ACTIONABLE_STATUSES = ['PENDING', 'CANCELLED_APPROVAL'];
const PERSONAL_EMAIL_DOMAINS = new Set([
    'gmail.com',
    'googlemail.com',
    'yahoo.com',
    'yahoo.co.in',
    'hotmail.com',
    'outlook.com',
    'live.com',
    'msn.com',
    'aol.com',
    'mail.com',
    'icloud.com',
    'me.com',
    'proton.me',
    'protonmail.com',
    'yandex.com',
    'zoho.com',
]);

const employerRequestSchema = z.object({
    companyName: z.string().trim().min(2, 'Company name is required').max(160),
    employerName: z.string().trim().min(2, 'Employer name is required').max(120),
    email: z.string().trim().email('Invalid email format').transform(value => value.toLowerCase()),
    phone: z.string().trim().min(7, 'Phone number is required').max(30),
    website: z.string().trim().url('Website must be a valid URL'),
    address: z.string().trim().min(5, 'Business address is required').max(500),
    password: z.string().min(8, 'Password must be at least 8 characters').max(128),
    confirmPassword: z.string(),
}).superRefine((data, ctx) => {
    const domain = data.email.split('@')[1]?.toLowerCase();
    if (!domain || PERSONAL_EMAIL_DOMAINS.has(domain)) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['email'],
            message: 'Please use a business email address.',
        });
    }

    if (data.password !== data.confirmPassword) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['confirmPassword'],
            message: 'Password and confirm password must match.',
        });
    }
});

function requestSelect() {
    return {
        id: true,
        employerName: true,
        companyName: true,
        email: true,
        phone: true,
        website: true,
        address: true,
        status: true,
        adminNotes: true,
        rejectionReason: true,
        approvedUserId: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
    };
}

function httpError(status, message) {
    const error = new Error(message);
    error.status = status;
    return error;
}

/**
 * POST /api/employer-requests
 * Public employer request submission. No login account is created here.
 */
router.post('/', async (req, res, next) => {
    try {
        const data = employerRequestSchema.parse(req.body);

        const [existingUser, existingRequest] = await Promise.all([
            prisma.user.findFirst({
                where: { email: { equals: data.email, mode: 'insensitive' } },
                select: { id: true },
            }),
            prisma.employerRequest.findFirst({
                where: { email: { equals: data.email, mode: 'insensitive' } },
                select: { id: true },
            }),
        ]);

        if (existingUser || existingRequest) {
            return res.status(409).json({ success: false, message: 'Email already exists or request is pending.' });
        }

        const activationCode = Math.floor(100000 + Math.random() * 900000).toString();
        const passwordHash = await bcrypt.hash(data.password, 12);
        
        const employerRequest = await prisma.employerRequest.create({
            data: {
                employerName: data.employerName,
                companyName: data.companyName,
                email: data.email,
                phone: data.phone,
                website: data.website,
                address: data.address,
                passwordHash,
                status: 'PENDING',
                activationCode,
                emailVerified: false,
            },
            select: requestSelect(),
        });

        // Send OTP email
        await sendEmail({
            to: data.email,
            subject: 'Verify your Techwell Employer Registration',
            text: `Hello ${data.employerName},\n\nYour OTP for Techwell Employer Registration is: ${activationCode}\n\nPlease enter this code to verify your business email address.\n\nThank you,\nTechwell Team`,
            html: `<p>Hello ${data.employerName},</p><p>Your OTP for Techwell Employer Registration is: <strong>${activationCode}</strong></p><p>Please enter this code to verify your business email address.</p><p>Thank you,<br/>Techwell Team</p>`
        });

        return res.status(201).json({
            success: true,
            message: 'Employer request submitted successfully. Please check your email for the verification code.',
            data: { email: employerRequest.email }, // Return minimal data for OTP step
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({
                success: false,
                message: error.issues[0]?.message || 'Invalid employer request.',
                details: error.issues,
            });
        }
        if (error.code === 'P2002') {
            return res.status(409).json({ success: false, message: 'Email already exists.' });
        }
        return next(error);
    }
});

/**
 * POST /api/employer-requests/verify-otp
 * Verifies the OTP sent to the employer's email.
 */
router.post('/verify-otp', async (req, res, next) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({ success: false, message: 'Email and OTP are required.' });
        }

        const request = await prisma.employerRequest.findFirst({
            where: { email: { equals: email, mode: 'insensitive' } }
        });

        if (!request) {
            return res.status(404).json({ success: false, message: 'Registration request not found.' });
        }

        if (request.activationCode !== otp) {
            return res.status(400).json({ success: false, message: 'Invalid or expired OTP.' });
        }

        await prisma.employerRequest.update({
            where: { id: request.id },
            data: { 
                emailVerified: true,
                activationCode: null // clear OTP after successful verification
            }
        });

        return res.json({
            success: true,
            message: 'Email verified successfully. Please wait for admin approval.',
        });
    } catch (error) {
        return next(error);
    }
});

/**
 * GET /api/employer-requests
 * Admin list. Requests are never deleted after an action.
 */
router.get('/', authenticate, authorize(...ADMIN_ROLES), async (req, res, next) => {
    try {
        const allowedStatuses = ['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED_APPROVAL'];
        const status = typeof req.query.status === 'string' ? req.query.status : null;

        if (status && !allowedStatuses.includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid employer request status.' });
        }

        const requests = await prisma.employerRequest.findMany({
            where: status ? { status } : undefined,
            orderBy: { createdAt: 'desc' },
            select: requestSelect(),
        });

        return res.json({ success: true, data: requests });
    } catch (error) {
        return next(error);
    }
});

router.get('/:id', authenticate, authorize(...ADMIN_ROLES), async (req, res, next) => {
    try {
        const request = await prisma.employerRequest.findUnique({
            where: { id: req.params.id },
            select: requestSelect(),
        });

        if (!request) {
            return res.status(404).json({ success: false, message: 'Employer request not found.' });
        }

        return res.json({ success: true, data: request });
    } catch (error) {
        return next(error);
    }
});

/**
 * PUT /api/employer-requests/:id/approve
 * Creates the employer account on first approval, or re-enables it after cancellation.
 */
router.put('/:id/approve', authenticate, authorize(...ADMIN_ROLES), async (req, res, next) => {
    try {
        const adminNotes = typeof req.body.adminNotes === 'string' ? req.body.adminNotes.trim() : null;

        const result = await prisma.$transaction(async tx => {
            const request = await tx.employerRequest.findUnique({ where: { id: req.params.id } });
            if (!request) throw httpError(404, 'Employer request not found.');
            if (!ACTIONABLE_STATUSES.includes(request.status)) {
                throw httpError(400, `Cannot approve a request with status ${request.status}.`);
            }

            let user = request.approvedUserId
                ? await tx.user.findUnique({ where: { id: request.approvedUserId } })
                : null;

            if (!user) {
                const emailOwner = await tx.user.findFirst({
                    where: { email: { equals: request.email, mode: 'insensitive' } },
                });
                if (emailOwner) {
                    throw httpError(409, 'Email already exists.');
                }

                user = await tx.user.create({
                    data: {
                        email: request.email,
                        password: request.passwordHash,
                        name: request.employerName,
                        phone: request.phone,
                        role: 'EMPLOYER',
                        isActive: true,
                        emailVerified: true,
                    },
                });
            } else {
                if (user.email !== request.email || user.role !== 'EMPLOYER') {
                    throw httpError(409, 'Email already exists.');
                }

                user = await tx.user.update({
                    where: { id: user.id },
                    data: {
                        password: request.passwordHash,
                        name: request.employerName,
                        phone: request.phone,
                        isActive: true,
                        emailVerified: true,
                    },
                });
            }

            await tx.employerProfile.upsert({
                where: { userId: user.id },
                update: {
                    companyName: request.companyName,
                    website: request.website,
                    location: request.address,
                    status: 'APPROVED',
                },
                create: {
                    userId: user.id,
                    companyName: request.companyName,
                    website: request.website,
                    location: request.address,
                    status: 'APPROVED',
                },
            });

            const updatedRequest = await tx.employerRequest.update({
                where: { id: request.id },
                data: {
                    status: 'APPROVED',
                    approvedUserId: user.id,
                    adminNotes: adminNotes || null,
                    rejectionReason: null,
                },
                select: requestSelect(),
            });

            return { request: updatedRequest, userId: user.id };
        });

        return res.json({
            success: true,
            message: 'Employer request approved and login access enabled.',
            data: result,
        });
    } catch (error) {
        return next(error);
    }
});

router.put('/:id/reject', authenticate, authorize(...ADMIN_ROLES), async (req, res, next) => {
    try {
        const rejectionReason = typeof req.body.rejectionReason === 'string'
            ? req.body.rejectionReason.trim()
            : '';

        if (!rejectionReason) {
            return res.status(400).json({ success: false, message: 'Rejection reason is required.' });
        }

        const updatedRequest = await prisma.$transaction(async tx => {
            const request = await tx.employerRequest.findUnique({ where: { id: req.params.id } });
            if (!request) throw httpError(404, 'Employer request not found.');
            if (!ACTIONABLE_STATUSES.includes(request.status)) {
                throw httpError(400, `Cannot reject a request with status ${request.status}.`);
            }

            if (request.approvedUserId) {
                await tx.user.updateMany({
                    where: { id: request.approvedUserId, role: 'EMPLOYER' },
                    data: { isActive: false },
                });
                await tx.employerProfile.updateMany({
                    where: { userId: request.approvedUserId },
                    data: { status: 'REJECTED' },
                });
            }

            return tx.employerRequest.update({
                where: { id: request.id },
                data: {
                    status: 'REJECTED',
                    rejectionReason,
                },
                select: requestSelect(),
            });
        });

        return res.json({
            success: true,
            message: 'Employer request rejected.',
            data: updatedRequest,
        });
    } catch (error) {
        return next(error);
    }
});

router.put('/:id/cancel-approval', authenticate, authorize(...ADMIN_ROLES), async (req, res, next) => {
    try {
        const updatedRequest = await prisma.$transaction(async tx => {
            const request = await tx.employerRequest.findUnique({ where: { id: req.params.id } });
            if (!request) throw httpError(404, 'Employer request not found.');
            if (request.status !== 'APPROVED') {
                throw httpError(400, 'Only approved employer requests can have approval cancelled.');
            }
            if (!request.approvedUserId) {
                throw httpError(409, 'Approved employer account is not linked to this request.');
            }

            await tx.user.updateMany({
                where: { id: request.approvedUserId, role: 'EMPLOYER' },
                data: { isActive: false },
            });
            await tx.employerProfile.updateMany({
                where: { userId: request.approvedUserId },
                data: { status: 'CANCELLED_APPROVAL' },
            });

            return tx.employerRequest.update({
                where: { id: request.id },
                data: { status: 'CANCELLED_APPROVAL' },
                select: requestSelect(),
            });
        });

        return res.json({
            success: true,
            message: 'Employer approval cancelled and login access disabled.',
            data: updatedRequest,
        });
    } catch (error) {
        return next(error);
    }
});

module.exports = router;
