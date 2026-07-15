const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate, authorize, checkPermission, optionalAuth } = require('../middleware/auth');
const csv = require('csv-parser');
const fs = require('fs');
const multer = require('multer');
const bcrypt = require('bcryptjs');
const { sendEmail } = require('../utils/emailSender');
const { sendDemoEmail, sendDemoWhatsApp } = require('../utils/notifications');
const AICore = require('../ai-core');

const router = express.Router();
const prisma = new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL } } });
const upload = multer({ dest: 'uploads/temp/' });

/**
 * @route   GET /api/leads
 * @desc    Get all leads with filtering
 * @access  Private/Admin
 */
router.get('/', authenticate, checkPermission('LEADS'), async (req, res, next) => {
    try {
        const { status, source, leadType, assignedTo, startDate, endDate, college, location, experienceLevel, interestedRole, courseName, companyName, name, email, phone, district, pinCode, qualification, referralName, dob, franchiseId } = req.query;

        const where = {};
        if (status && status !== 'ALL') where.status = status;
        if (source && source !== 'ALL') where.source = source;
        if (leadType && leadType !== 'ALL') where.leadType = leadType;
        if (experienceLevel && experienceLevel !== 'ALL') where.experienceLevel = experienceLevel;
        if (interestedRole) where.interestedRole = { contains: interestedRole, mode: 'insensitive' };
        if (courseName) where.courseName = { contains: courseName, mode: 'insensitive' };
        if (companyName) where.companyName = { contains: companyName, mode: 'insensitive' };
        if (college) where.college = { contains: college, mode: 'insensitive' };
        if (location) where.location = { contains: location, mode: 'insensitive' };
        if (name) where.name = { contains: name, mode: 'insensitive' };
        if (email) where.email = { contains: email, mode: 'insensitive' };
        if (phone) where.phone = { contains: phone };
        if (district) where.district = { contains: district, mode: 'insensitive' };
        if (pinCode) where.pinCode = { contains: pinCode };
        if (qualification) where.qualification = { contains: qualification, mode: 'insensitive' };
        if (referralName) where.referralName = { contains: referralName, mode: 'insensitive' };
        
        if (dob) {
            const startOfDay = new Date(dob);
            startOfDay.setHours(0,0,0,0);
            const endOfDay = new Date(dob);
            endOfDay.setHours(23,59,59,999);
            where.dob = { gte: startOfDay, lte: endOfDay };
        }
        
        // RBAC filtering
        if (req.user.role === 'FRANCHISE_ADMIN') {
            where.franchiseId = req.user.franchiseId;
            if (assignedTo && assignedTo !== 'ALL') {
                where.assignedTo = assignedTo;
            }
        } else {
            const canViewAll = req.user.role === 'SUPER_ADMIN' || req.user.permissions.includes('VIEW_ALL_LEADS') || req.user.permissions.includes('ALL');
            if (!canViewAll) {
                // If user has a department (e.g., RECRUITMENT, TRAINING, CONSULTANCY), they can see leads of that type
                // Assuming department maps to leadType
                if (req.user.department) {
                    where.leadType = req.user.department;
                } else {
                    where.assignedTo = req.user.email || req.user.name;
                }
            } else if (assignedTo && assignedTo !== 'ALL') {
                where.assignedTo = assignedTo;
            }
            if (franchiseId && franchiseId !== 'ALL') {
                where.franchiseId = franchiseId === 'UNASSIGNED' ? null : franchiseId;
            }
        }

        if (startDate && endDate) {
            where.createdAt = {
                gte: new Date(startDate),
                lte: new Date(endDate)
            };
        }

        let leads = await prisma.lead.findMany({
            where,
            orderBy: { updatedAt: 'desc' },
            include: {
                _count: {
                    select: { tasks: true }
                },
                demoSchedules: {
                    orderBy: { scheduledAt: 'desc' }
                }
            }
        });

        const canSeeUnmasked = req.user.role === 'SUPER_ADMIN' || req.user.permissions.includes('UNMASKED_LEADS') || req.user.permissions.includes('ALL');
        
        if (!canSeeUnmasked) {
            leads = leads.map(l => {
                let maskedPhone = l.phone ? '+91 ****' + l.phone.slice(-4) : l.phone;
                let maskedEmail = l.email ? l.email.substring(0, 3) + '****@' + (l.email.split('@')[1] || '') : l.email;
                return { ...l, phone: maskedPhone, email: maskedEmail, isMasked: true };
            });
        }

        res.json(leads);
    } catch (error) {
        next(error);
    }
});


/**
 * @route   GET /api/leads/counts
 * @desc    Get lead counts for sidebar badges and tabs
 * @access  Private/Admin
 */
router.get('/counts', authenticate, checkPermission('LEADS'), async (req, res, next) => {
    try {
        const currentUser = await prisma.user.findUnique({
            where: { id: req.user.id },
            select: { leadLastSeenAt: true }
        });

        const unreadWhere = currentUser?.leadLastSeenAt
            ? { createdAt: { gt: currentUser.leadLastSeenAt } }
            : {};

        // Fetch counts grouped by status
        const groupedCounts = await prisma.lead.groupBy({
            by: ['status'],
            _count: {
                id: true,
            },
        });

        const statusCounts = {};
        groupedCounts.forEach(item => {
            statusCounts[item.status] = item._count.id;
        });

        const [totalCount, unreadCount] = await Promise.all([
            prisma.lead.count(),
            prisma.lead.count({ where: unreadWhere })
        ]);

        res.json({
            totalCount,
            unreadCount,
            hasUnread: unreadCount > 0,
            lastSeenAt: currentUser?.leadLastSeenAt || null,
            statusCounts
        });
    } catch (error) {
        next(error);
    }
});


/**
 * @route   GET /api/leads/analytics
 * @desc    Get advanced analytics for dashboard
 * @access  Private/Admin
 */
router.get('/analytics', authenticate, checkPermission('LEADS'), async (req, res, next) => {
    try {
        const { startDate, endDate } = req.query;

        // Date filter if provided
        const dateFilter = (startDate && endDate) ? {
            createdAt: {
                gte: new Date(startDate),
                lte: new Date(endDate)
            }
        } : {};

        const [
            totalLeads,
            leadsByStatus,
            leadsBySource,
            leadsByCollege,
            leadsByLocation,
            revenue
        ] = await Promise.all([
            prisma.lead.count({ where: dateFilter }),
            prisma.lead.groupBy({
                by: ['status'],
                _count: true,
                where: dateFilter
            }),
            prisma.lead.groupBy({
                by: ['source'],
                _count: true,
                where: dateFilter
            }),
            prisma.lead.groupBy({
                by: ['college'],
                _count: true,
                where: { ...dateFilter, college: { not: null } },
                orderBy: { _count: { id: 'desc' } },
                take: 5
            }),
            prisma.lead.groupBy({
                by: ['location'],
                _count: true,
                where: { ...dateFilter, location: { not: null } },
                orderBy: { _count: { id: 'desc' } },
                take: 5
            }),
            prisma.payment.aggregate({
                where: { status: 'SUCCESS' }, // Add date filter here if needed
                _sum: { amount: true }
            })
        ]);

        res.json({
            summary: {
                totalLeads,
                totalRevenue: revenue._sum.amount || 0
            },
            charts: {
                status: leadsByStatus,
                source: leadsBySource,
                college: leadsByCollege,
                location: leadsByLocation
            }
        });

    } catch (error) {
        next(error);
    }
});

/**
 * @route   DELETE /api/leads/:id
 * @desc    Delete a lead
 * @access  Private/Admin
 */
router.delete('/:id', authenticate, checkPermission('LEADS'), async (req, res, next) => {
    try {
        await prisma.lead.delete({
            where: { id: req.params.id }
        });
        res.json({ message: 'Lead deleted successfully' });
    } catch (error) {
        next(error);
    }
});

// ============= MARKETING INTEGRATIONS =============

/**
 * @route   GET /api/leads/integrations
 * @desc    Get configured lead sources
 * @access  Private/Admin
 */
router.get('/integrations', authenticate, checkPermission('LEADS'), async (req, res, next) => {
    try {
        // Mask secrets
        const integrations = await prisma.marketingIntegration.findMany({
            orderBy: { createdAt: 'desc' }
        });

        const safeData = integrations.map(i => ({
            ...i,
            accessToken: i.accessToken ? '****' : null,
            webhookSecret: i.webhookSecret ? '****' : null
        }));

        res.json(safeData);
    } catch (error) {
        next(error);
    }
});

/**
 * @route   POST /api/leads/integrations
 * @desc    Configure a lead source (Meta, Google, JustDial)
 * @access  Private/Admin
 */
router.post('/integrations', authenticate, checkPermission('LEADS'), async (req, res, next) => {
    try {
        const { platform, name, accessToken, pageId, accountId, webhookSecret } = req.body;

        const integration = await prisma.marketingIntegration.create({
            data: {
                platform,
                name: name || platform,
                accessToken,
                pageId,
                accountId,
                webhookSecret,
                isActive: true
            }
        });

        res.status(201).json({ message: 'Integration configured', id: integration.id });
    } catch (error) {
        next(error);
    }
});

/**
 * @route   GET /api/leads/webhook/meta
 * @desc    Meta (Facebook/Instagram) Verification Handshake
 * @access  Public
 */
router.get('/webhook/meta', async (req, res) => {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    // In a real app, verify 'token' against stored 'webhookSecret' in DB
    // For now, we accept any token matching 'techwell_meta_secret'
    if (mode && token) {
        if (token === 'techwell_meta_secret') {
            console.log('WEBHOOK_VERIFIED');
            // Prevent Reflected XSS by sanitizing challenge
            const sanitize = (str) => (str ? String(str).replace(/[<>"'&]/g, '') : '');
            res.status(200).type('text/plain').send(sanitize(challenge));
        } else {
            res.sendStatus(403);
        }
    } else {
        res.sendStatus(400);
    }
});

/**
 * @route   POST /api/leads/webhook/meta
 * @desc    Receive Leads from Meta (Facebook/Instagram)
 * @access  Public
 */
router.post('/webhook/meta', async (req, res) => {
    try {
        const body = req.body;

        if (body.object === 'page') {
            // Process each entry (leadgen)
            for (const entry of body.entry) {
                const changes = entry.changes;
                for (const change of changes) {
                    if (change.field === 'leadgen') {
                        const leadGenId = change.value.leadgen_id;
                        const pageId = change.value.page_id;
                        const formId = change.value.form_id;
                        const createdTime = change.value.created_time;

                        console.log(`[Meta Webhook] Received Lead ${leadGenId} from Page ${pageId}`);

                        // Here we would call Graph API to get lead details using leadGenId and our Access Token
                        // Since we don't have a real Token, we will simulate lead creation for the demo
                        // In production: const leadDetails = await fetch(`https://graph.facebook.com/v19.0/${leadGenId}?access_token=...`)

                        // Creating mock lead for demo
                        await prisma.lead.create({
                            data: {
                                name: `Meta Lead ${leadGenId.substring(0, 6)}`,
                                email: `user_${leadGenId}@facebook.com`,
                                source: 'META_ADS',
                                platform: 'META',
                                formId: formId,
                                adId: change.value.ad_id,
                                adGroupId: change.value.adgroup_id,
                                campaignId: change.value.campaign_id,
                                status: 'NEW',
                                notes: `Imported from Meta Lead Ads via Webhook at ${new Date(createdTime * 1000).toISOString()}`
                            }
                        });
                    }
                }
            }
            res.status(200).send('EVENT_RECEIVED');
        } else {
            res.sendStatus(404);
        }
    } catch (error) {
        console.error('Meta Webhook Error:', error);
        res.sendStatus(500);
    }
});

/**
 * @route   POST /api/leads/webhook/generic
 * @desc    Receive Leads from JustDial / Custom Sources
 * @access  Public (Protected by API Key in Header usually, or just valid Data)
 */
router.post('/webhook/generic', async (req, res) => {
    try {
        const { source, name, mobile, email, city, category, area } = req.body;

        // JustDial payload usually varies, we map common fields
        const leadName = name || 'Unknown Lead';
        const leadPhone = mobile || req.body.phone;
        const leadEmail = email || req.body.email_id;
        const leadSource = source || 'JustDial'; // Default

        const lead = await prisma.lead.create({
            data: {
                name: leadName,
                phone: leadPhone,
                email: leadEmail,
                location: city || area,
                source: leadSource.toUpperCase(),
                platform: 'JUSTDIAL',
                status: 'NEW',
                notes: `Interest: ${category || 'General'}. JSON: ${JSON.stringify(req.body)}`
            }
        });
        notifyNewLead(lead);
        notifyNewLead(lead);

        res.status(201).json({ success: true, leadId: lead.id });
    } catch (error) {
        console.error('Generic Webhook Error:', error);
        res.status(500).json({ error: 'Failed to ingest lead' });
    }
});


/**
 * @route   POST /api/leads/:id/convert
 * @desc    Convert Lead to Student (Create User Account)
 * @access  Private/Admin
 */
router.post('/:id/convert', authenticate, checkPermission('LEADS'), async (req, res, next) => {
    try {
        const { id } = req.params;
        const lead = await prisma.lead.findUnique({ where: { id } });

        if (!lead) {
            return res.status(404).json({ error: 'Lead not found' });
        }

        if (lead.status === 'CONVERTED') {
            return res.status(400).json({ error: 'Lead is already converted' });
        }

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({ where: { email: lead.email } });
        if (existingUser) {
            // Just link user? or Error?
            // For now, let's link and update status
            await prisma.lead.update({
                where: { id },
                data: { status: 'CONVERTED', notes: 'Linked to existing user account.' }
            });
            return res.status(200).json({ message: 'Lead linked to existing user successfully' });
        }

        // Create new student user
        const tempPassword = `Techwell@${Math.floor(1000 + Math.random() * 9000)}`;
        const hashedPassword = await bcrypt.hash(tempPassword, 10);

        const newUser = await prisma.user.create({
            data: {
                name: lead.name,
                email: lead.email,
                phone: lead.phone,
                password: hashedPassword,
                role: 'STUDENT',
                emailVerified: true, // Auto-verify since admin created it
                isActive: true
            }
        });

        // Update Lead status
        await prisma.lead.update({
            where: { id },
            data: { status: 'CONVERTED', notes: `Converted to Student User (ID: ${newUser.id}) on ${new Date().toLocaleDateString()}` }
        });

        // Send Email with credentials
        // Non-blocking
        sendEmail({
            to: newUser.email,
            subject: 'Welcome to Techwell - Your Student Account is Ready',
            text: `Hello ${newUser.name},\n\nYour student account has been created. Use the following credentials to login:\n\nEmail: ${newUser.email}\nPassword: ${tempPassword}\n\nPlease change your password after logging in.\n\nLogin URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}/login\n\nBest Regards,\nTechwell Team`,
            html: `<div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                    <h2 style="color: #1469E2;">Welcome to Techwell, ${newUser.name}!</h2>
                    <p>Your student account has been successfully created.</p>
                    <div style="background: #f4f6f8; padding: 15px; border-radius: 8px; margin: 20px 0;">
                        <p><strong>Login Credentials:</strong></p>
                        <p>Email: <strong>${newUser.email}</strong></p>
                        <p>Temporary Password: <strong>${tempPassword}</strong></p>
                    </div>
                    <p>Please <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/login">Login Here</a> and change your password immediately.</p>
                    <br/>
                    <p>Best Regards,<br/><strong>The Techwell Team</strong></p>
                   </div>`
        }).catch(err => console.error('Credential Email Failed:', err.message));

        res.status(200).json({ message: 'Lead converted to Student successfully', user: newUser });

    } catch (error) {
        next(error);
    }
});

/**
 * @route   GET /api/leads/stats/conversion
 * @desc    Get lead conversion stats by source and status
 * @access  Private
 */
router.get('/stats/conversion', authenticate, checkPermission('LEADS'), async (req, res, next) => {
    try {
        const sourceStats = await prisma.lead.groupBy({
            by: ['source'],
            _count: { id: true },
            _sum: { revenueGenerated: true }
        });

        const statusStats = await prisma.lead.groupBy({
            by: ['status'],
            _count: { id: true }
        });

        return res.status(200).json({ sourceStats, statusStats });
    } catch (error) {
        next(error);
    }
});

/**
 * @route   GET /api/leads/:id/activity
 * @desc    Get activity logs for a lead
 * @access  Private
 */
router.get('/:id/activity', authenticate, checkPermission('LEADS'), async (req, res, next) => {
    try {
        const logs = await prisma.leadActivityLog.findMany({
            where: { leadId: req.params.id },
            orderBy: { createdAt: 'desc' }
        });
        const reminders = await prisma.followUpReminder.findMany({
            where: { leadId: req.params.id },
            orderBy: { remindAt: 'asc' }
        });
        return res.status(200).json({ logs, reminders });
    } catch (error) {
        next(error);
    }
});

/**
 * @route   POST /api/leads/:id/activity
 * @desc    Log counselor/lead activity (CALL, NOTE, etc.)
 * @access  Private
 */
router.post('/:id/activity', authenticate, checkPermission('LEADS'), async (req, res, next) => {
    try {
        const { actionType, notes } = req.body;
        if (!actionType || !notes) {
            return res.status(400).json({ error: 'Action type and notes are required' });
        }

        const log = await prisma.leadActivityLog.create({
            data: {
                leadId: req.params.id,
                actionType,
                notes,
                performedBy: req.user.name || req.user.email
            }
        });

        return res.status(201).json({ message: 'Activity logged successfully', log });
    } catch (error) {
        next(error);
    }
});

/**
 * @route   POST /api/leads/:id/reminder
 * @desc    Schedule a follow-up reminder
 * @access  Private
 */
router.post('/:id/reminder', authenticate, checkPermission('LEADS'), async (req, res, next) => {
    try {
        const { title, remindAt } = req.body;
        if (!title || !remindAt) {
            return res.status(400).json({ error: 'Title and remindAt are required' });
        }

        const reminder = await prisma.followUpReminder.create({
            data: {
                leadId: req.params.id,
                title,
                remindAt: new Date(remindAt),
                isCompleted: false
            }
        });

        return res.status(201).json({ message: 'Reminder scheduled successfully', reminder });
    } catch (error) {
        next(error);
    }
});

/**
 * @route   POST /api/leads/:id/ai/summary
 * @desc    Generate AI summary for a lead
 * @access  Private
 */
router.post('/:id/ai/summary', authenticate, checkPermission('LEADS'), async (req, res, next) => {
    try {
        const lead = await prisma.lead.findUnique({
            where: { id: req.params.id },
            include: { activityLogs: true }
        });

        if (!lead) return res.status(404).json({ error: 'Lead not found' });

        const aiService = require('../services/ai.service');
        const aiInsight = await aiService.generateLeadSummary(lead);

        const updatedLead = await prisma.lead.update({
            where: { id: req.params.id },
            data: {
                aiSummary: aiInsight.summary,
                aiNextBestAction: aiInsight.nextBestAction,
                aiPriority: aiInsight.priority
            }
        });

        return res.json({ message: 'AI Summary generated', data: updatedLead });
    } catch (error) {
        next(error);
    }
});

/**
 * @route   POST /api/leads/:id/ai/draft-email
 * @desc    Draft an AI follow-up email
 * @access  Private
 */
router.post('/:id/ai/draft-email', authenticate, checkPermission('LEADS'), async (req, res, next) => {
    try {
        const { tone } = req.body;
        const lead = await prisma.lead.findUnique({
            where: { id: req.params.id },
            include: { activityLogs: true }
        });

        if (!lead) return res.status(404).json({ error: 'Lead not found' });

        const aiService = require('../services/ai.service');
        const draft = await aiService.draftLeadEmail(lead, tone || 'Professional');

        return res.json({ draft });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
