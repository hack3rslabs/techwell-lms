const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { z } = require('zod');
const { PrismaClient } = require('@prisma/client');
const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 requests per windowMs for auth routes
    message: { error: 'Too many authentication attempts, please try again after 15 minutes.' },
    standardHeaders: true,
    legacyHeaders: false,
});

const router = express.Router();
const prisma = new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL } } });
const { authenticate } = require('../middleware/auth');
const twoFactorService = require('../services/twoFactor.service');

// Validation schemas
const passwordComplexityRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

const registerSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string()
        .min(8, 'Password must be at least 8 characters')
        .regex(passwordComplexityRegex, 'Password must contain at least one uppercase, lowercase, number and special character'),
    name: z.string().min(2, 'Name must be at least 2 characters'),
    phone: z.string().refine(val => !val || /^[6-9]\d{9}$/.test(val), 'Must be a valid 10-digit Indian mobile number').optional(),
    referredByCode: z.string().optional(),
    role: z.enum(['STUDENT', 'EMPLOYER', 'INSTITUTE_ADMIN']).default('STUDENT')
});

const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required')
});

// In-memory store for pending registrations (OTP verification)
const pendingRegistrations = new Map();
// In-memory store for password resets (OTP verification)
const passwordResets = new Map();
const OTP_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes

// In-memory store for account lockouts
const loginAttempts = new Map();
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes

// Use crypto.randomInt for cryptographically secure OTP (OWASP A02: Cryptographic Failures)
const crypto = require('crypto');
function generateOtp() {
    return crypto.randomInt(100000, 999999).toString();
}

// Cleanup expired entries every 5 minutes
setInterval(() => {
    const now = Date.now();
    for (const [email, data] of pendingRegistrations) {
        if (now - data.createdAt > OTP_EXPIRY_MS) {
            pendingRegistrations.delete(email);
        }
    }
    for (const [email, data] of passwordResets) {
        if (now - data.createdAt > OTP_EXPIRY_MS) {
            passwordResets.delete(email);
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
            referredByCode: validatedData.referredByCode,
            role: validatedData.role,
            otp,
            createdAt: Date.now()
        });

        // Send OTP email
        const { sendOtpEmail } = require('../services/email.service');
        sendOtpEmail(validatedData.email, otp).catch(err => console.error('OTP email error:', err));

        // NOTE: OTP is NOT logged to stdout in production (OWASP A09: Security Logging Failures)
        // OTP is sent via email only. Never log sensitive auth tokens.
        if (process.env.NODE_ENV !== 'production') {
            console.log(`[OTP:DEV-ONLY] Code sent to ${validatedData.email}`);
        }

        res.status(200).json({
            message: 'OTP sent to your email',
            email: validatedData.email,
            devOtp: process.env.NODE_ENV !== 'production' ? otp : undefined
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
router.post('/verify-otp', authLimiter, async (req, res, next) => {
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

        // Resolve referral code
        let referredById = undefined;
        if (pending.referredByCode) {
            const referrer = await prisma.user.findUnique({
                where: { referralCode: pending.referredByCode }
            });
            if (referrer) {
                referredById = referrer.id;
            }
        }

        const crypto = require('crypto');
        const generatedReferralCode = 'REF-' + crypto.randomBytes(3).toString('hex').toUpperCase() + Math.floor(Math.random() * 1000);

        // OTP verified - create user
        const userData = {
            email: pending.email,
            password: pending.password,
            name: pending.name,
            phone: pending.phone || undefined,
            emailVerified: true,
            referralCode: generatedReferralCode,
            referredById: referredById,
            role: pending.role
        };

        if (pending.dob) {
            const parsedDate = new Date(pending.dob);
            if (!isNaN(parsedDate.getTime()) && parsedDate.getFullYear() > 1900 && parsedDate.getFullYear() < 2100) {
                userData.dob = parsedDate;
            }
        }
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

        // Initialize role-specific profiles
        if (user.role === 'EMPLOYER') {
            await prisma.employerProfile.create({
                data: {
                    userId: user.id,
                    companyName: pending.name, // Will be updated later by user
                    status: 'PENDING'
                }
            });
        } else if (user.role === 'INSTITUTE_ADMIN') {
            const institute = await prisma.institute.create({
                data: {
                    name: pending.name,
                    adminEmail: pending.email
                }
            });
            await prisma.user.update({
                where: { id: user.id },
                data: { instituteId: institute.id }
            });
        }

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
            { algorithm: 'HS256', expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
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
// OWASP A07: Rate-limit OTP resend to prevent flooding
router.post('/resend-otp', authLimiter, async (req, res, next) => {
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

        // OWASP A09: Never log OTP values in production
        if (process.env.NODE_ENV !== 'production') {
            console.log(`[OTP:DEV-ONLY] Resent to ${email}`);
        }

        res.status(200).json({
            message: 'OTP resent to your email',
            devOtp: process.env.NODE_ENV !== 'production' ? otp : undefined
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
router.post('/login', authLimiter, async (req, res, next) => {
    try {
        const validatedData = loginSchema.parse(req.body);

        // Check for lockout
        const attemptsData = loginAttempts.get(validatedData.email);
        if (attemptsData && attemptsData.count >= MAX_LOGIN_ATTEMPTS) {
            if (Date.now() - attemptsData.firstAttempt < LOCKOUT_DURATION_MS) {
                console.log(`Login blocked: Account locked for email ${validatedData.email}`);
                return res.status(429).json({ error: 'Account temporarily locked due to too many failed attempts. Try again later.' });
            } else {
                // Reset lockout if duration passed
                loginAttempts.delete(validatedData.email);
            }
        }

        // Find user
        const user = await prisma.user.findUnique({
            where: { email: validatedData.email },
            include: {
                systemRole: {
                    include: {
                        rolePermissions: {
                            include: {
                                feature: true
                            }
                        }
                    }
                }
            }
        });

        if (!user) {
            console.log(`Login failed: User not found for email ${validatedData.email}`);
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Check password
        const isPasswordValid = await bcrypt.compare(validatedData.password, user.password);

        if (!isPasswordValid) {
            console.log(`Login failed: Invalid password for user ${validatedData.email}`);
            
            // Record failed attempt
            const currentAttempts = loginAttempts.get(validatedData.email) || { count: 0, firstAttempt: Date.now() };
            currentAttempts.count += 1;
            loginAttempts.set(validatedData.email, currentAttempts);

            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Successful login, clear failed attempts
        loginAttempts.delete(validatedData.email);

        // Check if active
        if (!user.isActive) {
            console.log(`Login failed: Account inactive for user ${validatedData.email}`);
            return res.status(403).json({ error: 'Account is deactivated' });
        }

        // Format role permissions
        const rolePermissions = {};
        if (user.systemRole && user.systemRole.rolePermissions) {
            user.systemRole.rolePermissions.forEach(rp => {
                rolePermissions[rp.feature.code] = {
                    canRead: rp.canRead,
                    canWrite: rp.canWrite,
                    isDisabled: rp.isDisabled
                };
            });
        }

        // Check if 2FA is enabled
        if (user.twoFactorEnabled) {
            // Check for trusted device token
            let trustToken = req.headers['x-trust-token'];
            if (!trustToken && req.headers.cookie) {
                const match = req.headers.cookie.match(/trustToken=([^;]+)/);
                if (match) trustToken = match[1];
            }

            let isTrusted = false;
            if (trustToken) {
                const hashed = twoFactorService.hashToken(trustToken);
                const devices = Array.isArray(user.trustedDevices) ? user.trustedDevices : [];
                isTrusted = devices.some(d => d.tokenHash === hashed && new Date(d.expiresAt) > new Date());
            }

            if (!isTrusted) {
                const tempToken = jwt.sign(
                    { userId: user.id, isPending2FA: true },
                    process.env.JWT_SECRET,
                    { algorithm: 'HS256', expiresIn: '5m' }
                );

                return res.json({
                    message: 'Two-factor authentication required',
                    require2FA: true,
                    tempToken
                });
            }
        }

        // Generate a new session token for single active session
        const crypto = require('crypto');
        const sessionToken = crypto.randomBytes(32).toString('hex');
        
        await prisma.user.update({
            where: { id: user.id },
            data: { currentSessionToken: sessionToken }
        });

        // Generate token
        const token = jwt.sign(
            { userId: user.id, sessionToken },
            process.env.JWT_SECRET,
            { algorithm: 'HS256', expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        );

        res.json({
            message: 'Login successful',
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                permissions: user.permissions || [],
                rolePermissions: rolePermissions,
                systemRole: user.systemRole ? { name: user.systemRole.name } : null,
                hasUnlimitedInterviews: true,
                twoFactorEnabled: user.twoFactorEnabled
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
                { algorithm: 'HS256', expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
            );

            res.json({ token: newToken });
        } catch (error) {
            return res.status(401).json({ error: 'Invalid token' });
        }
    } catch (error) {
        next(error);
    }
});

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Step 1: Find user and send reset OTP
 * @access  Public
 */
router.post('/forgot-password', authLimiter, async (req, res, next) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }

        // Check if user exists
        const user = await prisma.user.findUnique({
            where: { email }
        });

        // OWASP A01 - User Enumeration: Always return success even if email not found
        // This prevents attackers from discovering valid email addresses
        if (!user) {
            // Simulate delay to prevent timing-based enumeration
            await new Promise(resolve => setTimeout(resolve, 300));
            return res.status(200).json({
                message: 'If this email is registered, you will receive a reset OTP shortly.'
            });
        }

        // Generate OTP
        const otp = generateOtp();

        // Store reset request
        passwordResets.set(email, {
            email,
            otp,
            createdAt: Date.now(),
            verified: false
        });

        // Send OTP email
        const { sendPasswordResetOtpEmail } = require('../services/email.service');
        sendPasswordResetOtpEmail(email, otp).catch(err => console.error('Reset OTP email error:', err));

        // OWASP A09: Never log OTP values in production
        if (process.env.NODE_ENV !== 'production') {
            console.log(`[RESET OTP:DEV-ONLY] Code sent to ${email}`);
        }

        res.status(200).json({
            message: 'If this email is registered, you will receive a reset OTP shortly.',
        });
    } catch (error) {
        next(error);
    }
});

/**
 * @route   POST /api/auth/verify-reset-otp
 * @desc    Step 2: Verify reset OTP
 * @access  Public
 */
router.post('/verify-reset-otp', authLimiter, async (req, res, next) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({ error: 'Email and OTP are required' });
        }

        const resetData = passwordResets.get(email);

        if (!resetData) {
            return res.status(400).json({ error: 'No pending reset request found.' });
        }

        // Check expiry
        if (Date.now() - resetData.createdAt > OTP_EXPIRY_MS) {
            passwordResets.delete(email);
            return res.status(400).json({ error: 'OTP has expired.' });
        }

        // Verify OTP
        if (resetData.otp !== otp.toString()) {
            return res.status(400).json({ error: 'Invalid OTP.' });
        }

        // OTP verified
        resetData.verified = true;
        passwordResets.set(email, resetData);

        res.status(200).json({
            message: 'OTP verified successfully'
        });
    } catch (error) {
        next(error);
    }
});

/**
 * @route   POST /api/auth/reset-password
 * @desc    Step 3: Update password
 * @access  Public
 */
router.post('/reset-password', async (req, res, next) => {
    try {
        const { email, otp, newPassword } = req.body;

        if (!email || !otp || !newPassword) {
            return res.status(400).json({ error: 'Email, OTP, and new password are required' });
        }

        if (newPassword.length < 8) {
            return res.status(400).json({ error: 'Password must be at least 8 characters' });
        }

        const resetData = passwordResets.get(email);

        if (!resetData || !resetData.verified || resetData.otp !== otp.toString()) {
            return res.status(400).json({ error: 'Verification failed. Please try again.' });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 12);

        // Update user
        await prisma.user.update({
            where: { email },
            data: { password: hashedPassword }
        });

        // Remove from memory
        passwordResets.delete(email);

        res.status(200).json({
            message: 'Password reset successful. You can now login with your new password.'
        });
    } catch (error) {
        next(error);
    }
});

/**
 * @route   POST /api/auth/2fa/setup
 * @desc    Generate TOTP secret and QR code URI
 * @access  Private
 */
router.post('/2fa/setup', authenticate, async (req, res, next) => {
    try {
        const userId = req.user.id;
        const secret = twoFactorService.generateSecret();
        const otpauthUri = twoFactorService.generateOtpauthUri(req.user.email, secret);
        const qrCodeUrl = await twoFactorService.generateQrCodeUrl(otpauthUri);

        const { encrypt } = require('../utils/encryption');

        // Store secret temporarily
        await prisma.user.update({
            where: { id: userId },
            data: { twoFactorTempSecret: encrypt(secret) }
        });

        res.json({
            secret,
            qrCodeUrl
        });
    } catch (error) {
        next(error);
    }
});

/**
 * @route   POST /api/auth/2fa/enable
 * @desc    Verify TOTP code and enable 2FA
 * @access  Private
 */
router.post('/2fa/enable', authenticate, async (req, res, next) => {
    try {
        const { code } = req.body;
        if (!code) {
            return res.status(400).json({ error: 'Verification code is required' });
        }

        const user = await prisma.user.findUnique({
            where: { id: req.user.id }
        });

        if (!user.twoFactorTempSecret) {
            return res.status(400).json({ error: '2FA setup has not been initiated' });
        }

        const isValid = await twoFactorService.verifyToken(code, user.twoFactorTempSecret);
        if (!isValid) {
            return res.status(400).json({ error: 'Invalid verification code' });
        }

        await prisma.user.update({
            where: { id: req.user.id },
            data: {
                twoFactorSecret: user.twoFactorTempSecret,
                twoFactorTempSecret: null,
                twoFactorEnabled: true
            }
        });

        // Trigger future email/SMS hooks
        await twoFactorService.sendFutureBackupMailConfirmation(req.user);

        res.json({
            message: 'Two-factor authentication enabled successfully'
        });
    } catch (error) {
        next(error);
    }
});

/**
 * @route   POST /api/auth/2fa/disable
 * @desc    Disable 2FA
 * @access  Private
 */
router.post('/2fa/disable', authenticate, async (req, res, next) => {
    try {
        await prisma.user.update({
            where: { id: req.user.id },
            data: {
                twoFactorEnabled: false,
                twoFactorSecret: null,
                twoFactorTempSecret: null
            }
        });

        res.json({
            message: 'Two-factor authentication disabled successfully'
        });
    } catch (error) {
        next(error);
    }
});

/**
 * @route   POST /api/auth/2fa/verify
 * @desc    Verify TOTP code during login
 * @access  Public (Limited by temp token)
 */
router.post('/2fa/verify', async (req, res, next) => {
    try {
        const { code, tempToken, trustDevice } = req.body;

        if (!code || !tempToken) {
            return res.status(400).json({ error: 'Verification code and temporary token are required' });
        }

        // Verify temporary token
        let decoded;
        try {
            decoded = jwt.verify(tempToken, process.env.JWT_SECRET);
        } catch (err) {
            return res.status(401).json({ error: 'Temporary session expired. Please log in again.' });
        }

        if (!decoded.isPending2FA) {
            return res.status(401).json({ error: 'Invalid authentication session' });
        }

        // Find user
        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            include: {
                systemRole: {
                    include: {
                        rolePermissions: {
                            include: {
                                feature: true
                            }
                        }
                    }
                }
            }
        });

        if (!user || !user.isActive) {
            return res.status(401).json({ error: 'User account is inactive or not found' });
        }

        // Verify code
        const isValid = await twoFactorService.verifyToken(code, user.twoFactorSecret);
        if (!isValid) {
            return res.status(400).json({ error: 'Invalid verification code' });
        }

        // Manage trusted devices
        let trustToken = null;
        if (trustDevice) {
            trustToken = twoFactorService.generateTrustToken();
            const tokenHash = twoFactorService.hashToken(trustToken);
            const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 Days

            const devices = Array.isArray(user.trustedDevices) ? user.trustedDevices : [];
            // Clean up expired devices to prevent size bloat
            const now = new Date();
            const cleanDevices = devices.filter(d => new Date(d.expiresAt) > now);
            cleanDevices.push({ tokenHash, expiresAt: expiresAt.toISOString() });

            await prisma.user.update({
                where: { id: user.id },
                data: { trustedDevices: cleanDevices }
            });
        }

        // Generate a new session token for single active session
        const crypto = require('crypto');
        const sessionToken = crypto.randomBytes(32).toString('hex');

        await prisma.user.update({
            where: { id: user.id },
            data: { currentSessionToken: sessionToken }
        });

        // Generate final access token
        const token = jwt.sign(
            { userId: user.id, sessionToken },
            process.env.JWT_SECRET,
            { algorithm: 'HS256', expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        );

        // Format role permissions
        const rolePermissions = {};
        if (user.systemRole && user.systemRole.rolePermissions) {
            user.systemRole.rolePermissions.forEach(rp => {
                rolePermissions[rp.feature.code] = {
                    canRead: rp.canRead,
                    canWrite: rp.canWrite,
                    isDisabled: rp.isDisabled
                };
            });
        }

        // Trigger future confirmation hooks
        await twoFactorService.sendFutureBackupMailConfirmation(user);
        await twoFactorService.sendFutureBackupMobileOTP(user);

        // Set secure HTTP-only cookie if trusted
        if (trustToken) {
            res.cookie('trustToken', trustToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
                sameSite: 'strict'
            });
        }

        res.json({
            message: 'Login successful',
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                permissions: user.permissions || [],
                rolePermissions: rolePermissions,
                systemRole: user.systemRole ? { name: user.systemRole.name } : null,
                hasUnlimitedInterviews: true,
                twoFactorEnabled: true
            },
            token,
            trustToken // also returned for clients without cookie access
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
