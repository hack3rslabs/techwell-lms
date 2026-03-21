const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { z } = require('zod');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL } } });

// Validation schemas
const registerSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    name: z.string().min(2, 'Name must be at least 2 characters'),
    phone: z.string().optional()
});

const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required')
});

// In-memory store for pending registrations (OTP verification)
const pendingRegistrations = new Map();
const OTP_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes

function generateOtp() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// Cleanup expired entries every 5 minutes
setInterval(() => {
    const now = Date.now();
    for (const [email, data] of pendingRegistrations) {
        if (now - data.createdAt > OTP_EXPIRY_MS) {
            pendingRegistrations.delete(email);
        }
    }
}, 5 * 60 * 1000);

/**
 * @route   POST /api/auth/register
 * @desc    Step 1: Validate data, send OTP to email
 * @access  Public
 */
router.post('/register', async (req, res, next) => {
    try {
        const validatedData = registerSchema.parse(req.body);

        // Check if user exists
        const existingUser = await prisma.user.findUnique({
            where: { email: validatedData.email }
        });

        if (existingUser) {
            return res.status(400).json({ error: 'Email already registered' });
        }

        // Generate OTP
        const otp = generateOtp();

        // Hash password
        const hashedPassword = await bcrypt.hash(validatedData.password, 12);

        // Store pending registration
        pendingRegistrations.set(validatedData.email, {
            email: validatedData.email,
            password: hashedPassword,
            name: validatedData.name,
            phone: validatedData.phone,
            dob: req.body.dob,
            qualification: req.body.qualification,
            college: req.body.college,
            otp,
            createdAt: Date.now()
        });

        // Send OTP email
        const { sendOtpEmail } = require('../services/email.service');
        sendOtpEmail(validatedData.email, otp).catch(err => console.error('OTP email error:', err));

        console.log(`[OTP] Code for ${validatedData.email}: ${otp}`);

        res.status(200).json({
            message: 'OTP sent to your email',
            email: validatedData.email
        });
    } catch (error) {
        next(error);
    }
});

/**
 * @route   POST /api/auth/verify-otp
 * @desc    Step 2: Verify OTP and create user account
 * @access  Public
 */
router.post('/verify-otp', async (req, res, next) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({ error: 'Email and OTP are required' });
        }

        const pending = pendingRegistrations.get(email);

        if (!pending) {
            return res.status(400).json({ error: 'No pending registration found. Please register again.' });
        }

        // Check expiry
        if (Date.now() - pending.createdAt > OTP_EXPIRY_MS) {
            pendingRegistrations.delete(email);
            return res.status(400).json({ error: 'OTP has expired. Please register again.' });
        }

        // Verify OTP
        if (pending.otp !== otp.toString()) {
            return res.status(400).json({ error: 'Invalid OTP. Please try again.' });
        }

        // OTP verified - create user
        const userData = {
            email: pending.email,
            password: pending.password,
            name: pending.name,
            phone: pending.phone || undefined,
            emailVerified: true
        };

        if (pending.dob) userData.dob = new Date(pending.dob);
        if (pending.qualification) userData.qualification = pending.qualification;
        if (pending.college) userData.college = pending.college;

        const user = await prisma.user.create({
            data: userData,
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                createdAt: true
            }
        });

        const userWithAccess = {
            ...user,
            hasUnlimitedInterviews: true
        };

        // Remove from pending
        pendingRegistrations.delete(email);

        // Generate token
        const token = jwt.sign(
            { userId: user.id },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        );

        // Send Welcome Email
        const { sendWelcomeEmail } = require('../services/email.service');
        sendWelcomeEmail(user).catch(err => console.error('Email error:', err));

        res.status(201).json({
            message: 'Account created successfully',
            user: userWithAccess,
            token
        });
    } catch (error) {
        next(error);
    }
});

/**
 * @route   POST /api/auth/resend-otp
 * @desc    Resend OTP for pending registration
 * @access  Public
 */
router.post('/resend-otp', async (req, res, next) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }

        const pending = pendingRegistrations.get(email);

        if (!pending) {
            return res.status(400).json({ error: 'No pending registration found. Please register again.' });
        }

        // Generate new OTP and reset timer
        const otp = generateOtp();
        pending.otp = otp;
        pending.createdAt = Date.now();

        // Send OTP email
        const { sendOtpEmail } = require('../services/email.service');
        sendOtpEmail(email, otp).catch(err => console.error('OTP email error:', err));

        console.log(`[OTP] Resent code for ${email}: ${otp}`);

        res.status(200).json({
            message: 'OTP resent to your email'
        });
    } catch (error) {
        next(error);
    }
});

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post('/login', async (req, res, next) => {
    try {
        const validatedData = loginSchema.parse(req.body);

        // Find user
        const user = await prisma.user.findUnique({
            where: { email: validatedData.email }
        });

        if (!user) {
            console.log(`Login failed: User not found for email ${validatedData.email}`);
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Check password
        const isPasswordValid = await bcrypt.compare(validatedData.password, user.password);

        if (!isPasswordValid) {
            console.log(`Login failed: Invalid password for user ${validatedData.email}`);
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Check if active
        if (!user.isActive) {
            console.log(`Login failed: Account inactive for user ${validatedData.email}`);
            return res.status(403).json({ error: 'Account is deactivated' });
        }

        // Generate token
        const token = jwt.sign(
            { userId: user.id },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        );

        res.json({
            message: 'Login successful',
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                permissions: user.permissions || [],
                hasUnlimitedInterviews: true
            },
            token
        });
    } catch (error) {
        next(error);
    }
});

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh access token
 * @access  Private
 */
router.post('/refresh', async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'No token provided' });
        }

        const token = authHeader.split(' ')[1];

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET, { ignoreExpiration: true });

            // Check if user still exists
            const user = await prisma.user.findUnique({
                where: { id: decoded.userId },
                select: { id: true, isActive: true }
            });

            if (!user || !user.isActive) {
                return res.status(401).json({ error: 'User not found or inactive' });
            }

            // Generate new token
            const newToken = jwt.sign(
                { userId: user.id },
                process.env.JWT_SECRET,
                { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
            );

            res.json({ token: newToken });
        } catch (error) {
            return res.status(401).json({ error: 'Invalid token' });
        }
    } catch (error) {
        next(error);
    }
});

module.exports = router;
