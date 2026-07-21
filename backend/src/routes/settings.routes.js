const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate, authorize, checkPermission, optionalAuth } = require('../middleware/auth');
const { encrypt, decrypt } = require('../utils/encryption');
const router = express.Router();
const prisma = new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL } } });

const SENSITIVE_FIELDS = [
    'razorpayKeySecret',
    'smtpPassword',
    'zoomClientSecret',
    'anthropicApiKey',
    'googleMeetApiKey',
    'msTeamsClientSecret',
    'n8nAuthToken',
    'openaiApiKey',
    'paypalSecretKey',
    'stripeSecretKey',
    'twilioAuthToken',
    'whatsappApiToken',
    'webhookSecret'
];
/**
 * @route   GET /api/settings/public
 * @desc    Get public settings (Name, Logo)
 * @access  Public
 */
router.get('/public', async (req, res, next) => {
    try {
        const settings = await prisma.systemSettings.upsert({
            where: { id: 'default' },
            update: {},
            create: {
                platformName: 'Techwell Academy'
            },
            select: {
                platformName: true,
                logoUrl: true,
                faviconUrl: true,
                primaryColor: true,
                supportEmail: true,
                phone: true,
                address: true,
                isMaintenanceMode: true,
                isTestMode: true,
                showOurTeam: true,
                showAffiliate: true,
                affiliateUrl: true,
                affiliateTitle: true
            }
        });
        res.json(settings);
    } catch (error) {
        next(error);
    }
});

/**
 * @route   GET /api/settings
 * @desc    Get all settings
 * @access  Private (Admin/Staff)
 */
router.get('/', authenticate, (req, res, next) => {
    if (req.user.role === 'SUPER_ADMIN' || req.user.permissions.includes('MANAGE_SETTINGS') || req.user.permissions.includes('ALL')) {
        return next();
    }
    return res.status(403).json({ error: 'Permission denied: MANAGE_SETTINGS required' });
}, async (req, res, next) => {
    try {
        const settings = await prisma.systemSettings.upsert({
            where: { id: 'default' },
            update: {},
            create: {
                platformName: 'Techwell Academy'
            }
        });

        // Decrypt sensitive fields before returning
        SENSITIVE_FIELDS.forEach(field => {
            if (settings[field] && settings[field].includes(':')) {
                const decrypted = decrypt(settings[field]);
                if (decrypted) settings[field] = decrypted;
            }
        });

        res.json(settings);
    } catch (error) {
        next(error);
    }
});

/**
 * @route   PUT /api/settings
 * @desc    Update settings
 * @access  Private (Admin with MANAGE_SETTINGS or Super Admin)
 */
router.put('/', authenticate, async (req, res, next) => {
    try {
        // Permission check
        const canManage = req.user.role === 'SUPER_ADMIN' || req.user.permissions.includes('MANAGE_SETTINGS') || req.user.permissions.includes('ALL');

        if (!canManage) {
            return res.status(403).json({ error: 'Permission denied: MANAGE_SETTINGS required' });
        }

        const data = req.body;

        // Prevent ID update
        delete data.id;
        delete data.updatedAt;

        // Encrypt sensitive fields
        SENSITIVE_FIELDS.forEach(field => {
            if (data[field]) {
                const encrypted = encrypt(data[field]);
                if (encrypted) data[field] = encrypted;
            }
        });

        const settings = await prisma.systemSettings.update({
            where: { id: 'default' },
            data: data
        });

        // Decrypt sensitive fields before returning the response
        SENSITIVE_FIELDS.forEach(field => {
            if (settings[field] && settings[field].includes(':')) {
                const decrypted = decrypt(settings[field]);
                if (decrypted) settings[field] = decrypted;
            }
        });

        res.json({ message: 'Settings updated', settings });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
