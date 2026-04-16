const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate, authorize, checkPermission, optionalAuth } = require('../middleware/auth');
const axios = require('axios');
const nodemailer = require('nodemailer');

const router = express.Router();
const prisma = new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL } } });

/**
 * @route   GET /api/email/config
 * @desc    Get all email configurations
 * @access  Private/Admin
 */
router.get('/config', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), async (req, res, next) => {
    try {
        const configs = await prisma.emailIntegration.findMany({
            orderBy: { updatedAt: 'desc' }
        });

        // Mask secrets
        const masked = configs.map(c => ({
            ...c,
            pass: c.pass ? '****' : null,
            privateKey: c.privateKey ? '****' : null,
            apiKey: c.apiKey ? '****' : null
        }));

        res.json(masked);
    } catch (error) {
        next(error);
    }
});

/**
 * @route   POST /api/email/config
 * @desc    Add or Update email configuration
 * @access  Private/Admin
 */
router.post('/config', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), async (req, res, next) => {
    try {
        const {
            id, provider, name,
            host, port, user, pass, fromEmail,
            serviceId, templateId, publicKey, privateKey, apiKey
        } = req.body;

        const data = {
            provider,
            name: name || provider,
            host,
            port: parseInt(port) || 587,
            user,
            fromEmail,
            serviceId,
            templateId,
            publicKey,
            apiKey
        };

        // Only update secrets if provided (not masked)
        if (pass && pass !== '****') data.pass = pass;
        if (privateKey && privateKey !== '****') data.privateKey = privateKey;

        let config;
        if (id) {
            config = await prisma.emailIntegration.update({
                where: { id },
                data
            });
        } else {
            config = await prisma.emailIntegration.create({
                data
            });
        }

        res.json(config);
    } catch (error) {
        next(error);
    }
});

/**
 * @route   PUT /api/email/config/:id/activate
 * @desc    Set active email provider
 * @access  Private/Admin
 */
router.put('/config/:id/activate', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), async (req, res, next) => {
    try {
        // Deactivate all others
        await prisma.emailIntegration.updateMany({
            data: { isActive: false }
        });

        // Activate target
        const config = await prisma.emailIntegration.update({
            where: { id: req.params.id },
            data: { isActive: true }
        });

        res.json(config);
    } catch (error) {
        next(error);
    }
});

/**
 * @route   POST /api/email/test
 * @desc    Test email configuration
 * @access  Private/Admin
 */
router.post('/test', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), async (req, res, next) => {
    try {
        const { id, toEmail } = req.body;

        const config = await prisma.emailIntegration.findUnique({
            where: { id }
        });

        if (!config) return res.status(404).json({ error: 'Configuration not found' });

        if (config.provider === 'EMAILJS') {
            // Send via EmailJS REST API
            const emailJsData = {
                service_id: config.serviceId,
                template_id: config.templateId,
                user_id: config.publicKey,
                accessToken: config.privateKey,
                template_params: {
                    to_email: toEmail,
                    subject: 'Test Email from Techwell',
                    message: 'This is a test email to verify your EmailJS configuration.',
                    to_name: 'Admin'
                }
            };

            await axios.post('https://api.emailjs.com/api/v1.0/email/send', emailJsData);

        } else if (config.provider === 'SMTP') {
            // Send via Nodemailer
            const transporter = nodemailer.createTransport({
                host: config.host,
                port: config.port,
                secure: config.port === 465, // true for 465, false for other ports
                auth: {
                    user: config.user,
                    pass: config.pass
                }
            });

            await transporter.sendMail({
                from: config.fromEmail || config.user,
                to: toEmail,
                subject: 'Test Email from Techwell',
                text: 'This is a test email to verify your SMTP configuration.',
            });
        } else {
            return res.status(400).json({ error: 'Provider not implemented for testing yet' });
        }

        res.json({ success: true, message: 'Test email sent successfully' });

    } catch (error) {
        console.error('Email Test Error:', error.response?.data || error.message);
        res.status(500).json({
            error: 'Failed to send test email',
            details: error.response?.data || error.message
        });
    }
});

module.exports = router;
