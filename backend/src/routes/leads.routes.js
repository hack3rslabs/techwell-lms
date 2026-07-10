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
            // Franchise Admins only see leads assigned to them or unassigned leads in their franchise
            if (assignedTo && assignedTo !== 'ALL') {
                where.assignedTo = assignedTo;
            }
        } else {
            const canViewAll = req.user.role === 'SUPER_ADMIN' || req.user.permissions.includes('VIEW_ALL_LEADS') || req.user.permissions.includes('ALL');
            if (!canViewAll) {
                where.assignedTo = req.user.email || req.user.name;
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
 * @desc    Get lead counts for sidebar badges
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

        const [totalCount, unreadCount] = await Promise.all([
            prisma.lead.count(),
            prisma.lead.count({ where: unreadWhere })
        ]);

        res.json({
            totalCount,
            unreadCount,
            hasUnread: unreadCount > 0,
            lastSeenAt: currentUser?.leadLastSeenAt || null
        });
    } catch (error) {
        next(error);
    }
});

/**
 * @route   POST /api/leads/mark-seen
 * @desc    Mark leads as seen for the current admin
 * @access  Private/Admin
 */
router.post('/mark-seen', authenticate, checkPermission('LEADS'), async (req, res, next) => {
    try {
        const seenAt = new Date();

        await prisma.user.update({
            where: { id: req.user.id },
            data: { leadLastSeenAt: seenAt }
        });

        res.json({
            success: true,
            seenAt
        });
    } catch (error) {
        next(error);
    }
});

/**
 * @route   POST /api/leads/capture
 * @desc    Public endpoint to capture leads from the website (Shared Interest button)
 * @access  Public
 */
router.post('/capture', async (req, res, next) => {
    try {
        const { 
            name, email, phone, qualification, courseId, courseTitle, 
            inquiryType, subject, message,
            source: inputSource, leadType: inputLeadType, location,
            experienceLevel, currentCTC, expectedCTC, noticePeriod,
            interestedRole, companyName, resumeUrl, skills, notes: inputNotes,
            district, pinCode, referralName, campaignId, eventId
        } = req.body;
        console.log('[Shared Interest→Leads] Received request:', req.body);

        if (!name || !email) {
            console.warn('[Shared Interest→Leads] Missing required fields - Name or Email');
            return res.status(400).json({ error: 'Name and email are required' });
        }

        let notes = inputNotes || (courseTitle ? `Interested in course: ${courseTitle}` : 'General Inquiry');
        let source = inputSource || 'Website Interest';

        if (inquiryType) {
            source = inquiryType.toUpperCase();
            notes = `[Inquiry Type: ${inquiryType}] Subject: ${subject || 'N/A'}\nMessage: ${message || 'N/A'}`;
        }

        console.log('[Shared Interest→Leads] Creating lead with notes:', notes);

        let leadType = inputLeadType || 'GENERAL';
        if (courseId) leadType = 'TRAINING';
        if (inquiryType === 'job') leadType = 'JOB_ENQUIRY';
        if (inquiryType === 'software') leadType = 'SOFTWARE_REQUEST';
        if (inquiryType === 'service') leadType = 'SERVICE_REQUEST';

        // Check for deduplication
        const existingLead = await prisma.lead.findFirst({
            where: {
                OR: [
                    { email: email },
                    { phone: phone || 'NONE_EXISTS' }
                ]
            }
        });

        if (existingLead) {
            console.log('[Shared Interest→Leads] Lead exists. Updating notes instead of duplicate.');
            const lead = await prisma.lead.update({
                where: { id: existingLead.id },
                data: {
                    notes: `${existingLead.notes}\n\n[New ${leadType} Request] Source: ${source}\nNotes: ${notes}`,
                    resumeUrl: resumeUrl || existingLead.resumeUrl,
                    experienceLevel: experienceLevel || existingLead.experienceLevel,
                    location: location || existingLead.location,
                    interestedRole: interestedRole || existingLead.interestedRole,
                    district: district || existingLead.district,
                    pinCode: pinCode || existingLead.pinCode,
                    referralName: referralName || existingLead.referralName,
                    campaignId: campaignId || existingLead.campaignId
                }
            });
            await prisma.leadActivityLog.create({
                data: {
                    leadId: lead.id,
                    actionType: 'NEW_REQUEST_MERGED',
                    notes: `A new request from ${source} was merged into this lead.`,
                    performedBy: 'SYSTEM'
                }
            });
            return res.status(200).json({ success: true, message: 'Existing lead updated', leadId: lead.id, leadStatus: lead.status });
        }

        // Always create a new lead for every interest/enrollment as requested
        console.log('[Shared Interest→Leads] Creating new lead...');

        // GEO-FENCED LEAD ROUTING LOGIC
        let assignedFranchiseId = null;
        if (location || district || pinCode) {
            const matchedFranchise = await prisma.franchise.findFirst({
                where: {
                    status: 'ACTIVE',
                    OR: [
                        { pincode: pinCode || 'NONE_EXISTS_PIN' },
                        { city: { equals: location || 'NONE_EXISTS_LOC', mode: 'insensitive' } },
                        { district: { equals: district || 'NONE_EXISTS_DIST', mode: 'insensitive' } }
                    ]
                }
            });
            if (matchedFranchise) {
                assignedFranchiseId = matchedFranchise.id;
                notes = `${notes}\n\n[Auto-Routed to Franchise: ${matchedFranchise.name}]`;
            }
        }

        const lead = await prisma.lead.create({
            data: {
                name,
                email,
                phone: phone || null,
                qualification: qualification || null,
                source,
                leadType,
                notes,
                courseId: courseId || null,
                courseName: courseTitle || null,
                status: 'NEW',
                location: location || null,
                experienceLevel: experienceLevel || null,
                currentCTC: currentCTC || null,
                expectedCTC: expectedCTC || null,
                noticePeriod: noticePeriod || null,
                interestedRole: interestedRole || null,
                companyName: companyName || null,
                resumeUrl: resumeUrl || null,
                district: district || null,
                pinCode: pinCode || null,
                referralName: referralName || null,
                campaignId: campaignId || null,
                franchiseId: assignedFranchiseId,
                eventId: eventId || null
            }
        });
        notifyNewLead(lead);
        notifyNewLead(lead);
        console.log('[Shared Interest→Leads] Lead created successfully:', { id: lead.id, email: lead.email, source });
 
        // Trigger AI Workflow Background Task
        AICore.trackEvent('lead.created', 'CRM', { leadId: lead.id, ...lead })
            .catch(err => console.error('[AICore] Failed to track lead.created event:', err.message));

        // Trigger automated welcome WhatsApp alert if phone number is present
        if (phone) {
            const { sendWhatsAppMessage } = require('../utils/whatsappAgent');
            sendWhatsAppMessage(phone, `Hi *${name}*! Thank you for expressing interest in *${courseTitle || 'Techwell Programs'}*. A career counselor will get in touch with you shortly on WhatsApp to help you get started. 🚀`)
                .catch(err => console.error('[WhatsApp Auto-Reply Failed]:', err.message));
        }

        // Auto-Reply (Lead Follow-up Automation)
        sendEmail({
            to: email,
            subject: 'Welcome to Techwell - Your Journey Begins!',
            text: `Hi ${name},\n\nThank you for exploring Techwell. We have received your interest and a career counselor will be in touch shortly.\n\nBest Regards,\nTechwell Team`,
            html: `<div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                    <h2 style="color: #1469E2;">Welcome to Techwell, ${name}!</h2>
                    <p>Thank you for expressing interest in our career programs.</p>
                    <p>We are dedicated to helping you land your dream job in tech.</p>
                    <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
                    <p><strong>Next Steps:</strong></p>
                    <ul>
                        <li>Our team will review your profile.</li>
                        <li>You will receive a call/message within 24 hours.</li>
                        <li>Explore our <a href="https://techwell.co.in/courses">Free Courses</a> in the meantime.</li>
                    </ul>
                    <br/>
                    <p>Best Regards,<br/><strong>The Techwell Team</strong></p>
                    </div>`
        }).catch(err => console.error('[Shared Interest→Leads] Auto-Reply Failed:', err.message));

        res.status(200).json({ success: true, message: 'Shared interest captured and added to Leads', leadId: lead.id, leadStatus: lead.status });
        console.log('[Shared Interest→Leads] Response sent successfully - Lead ID:', lead.id);
    } catch (error) {
        // Just log the error, don't crash because this is a public form
        console.error('[Shared Interest→Leads] Error:', {
            message: error.message,
            code: error.code,
            stack: error.stack
        });
        res.status(500).json({ error: 'Failed to capture interest: ' + error.message });
    }
});

/**
 * @route   POST /api/leads/demo
 * @desc    Public endpoint to schedule a demo
 * @access  Public
 */
router.post('/demo', async (req, res, next) => {
    try {
        const {
            name, email, phone, courseName, courseId, scheduledAt,
            qualification, college, yearOfPassout
        } = req.body;

        if (!name || !email || !phone || !scheduledAt) {
            return res.status(400).json({ error: 'Name, email, phone, and scheduled time are required' });
        }

        const notes = `[Demo Scheduled]\nCourse: ${courseName || 'N/A'}\nTime: ${new Date(scheduledAt).toLocaleString()}\nYear of Passout: ${yearOfPassout || 'N/A'}`;

        let lead = await prisma.lead.findFirst({
            where: {
                OR: [
                    { email: email },
                    { phone: phone }
                ]
            }
        });

        if (lead) {
            lead = await prisma.lead.update({
                where: { id: lead.id },
                data: {
                    notes: `${lead.notes}\n\n${notes}`,
                    courseName: courseName || lead.courseName,
                    courseId: courseId || lead.courseId,
                    qualification: qualification || lead.qualification,
                    college: college || lead.college
                }
            });
        } else {
            lead = await prisma.lead.create({
                data: {
                    name,
                    email,
                    phone,
                    qualification: qualification || null,
                    college: college || null,
                    source: 'Demo Request',
                    leadType: 'TRAINING',
                    status: 'NEW',
                    courseName: courseName || null,
                    courseId: courseId || null,
                    notes
                }
            });
        notifyNewLead(lead);
        }

        // Try to create a DemoSchedule. Find a super admin to assign.
        const defaultAdmin = await prisma.user.findFirst({
            where: { role: 'SUPER_ADMIN' }
        });

        if (defaultAdmin) {
            await prisma.demoSchedule.create({
                data: {
                    leadId: lead.id,
                    assignedTo: defaultAdmin.id,
                    scheduledAt: new Date(scheduledAt),
                    notes: `Requested Course: ${courseName || 'Unknown'} | Year of Passout: ${yearOfPassout || 'N/A'}`
                }
            });
        }

        if (phone) {
            const { sendWhatsAppMessage } = require('../utils/whatsappAgent');
            sendWhatsAppMessage(phone, `Hi *${name}*! Your demo for *${courseName || 'Techwell Programs'}* has been scheduled for *${new Date(scheduledAt).toLocaleString()}*. Our team will share the meeting details shortly. 🚀`)
                .catch(err => console.error('[WhatsApp Auto-Reply Failed]:', err.message));
        }

        res.status(200).json({ success: true, message: 'Demo scheduled successfully', leadId: lead.id });
    } catch (error) {
        console.error('[Shared Interest→Leads] Error:', error);
        next(error);
    }
});

/**
 * @route   PUT /api/leads/:leadId/demo/:demoId/status
 * @desc    Update demo schedule status
 * @access  Private/Admin
 */
router.put('/:leadId/demo/:demoId/status', authenticate, checkPermission('LEADS'), async (req, res, next) => {
    try {
        const { leadId, demoId } = req.params;
        const { status } = req.body; // SCHEDULED, COMPLETED, NO_SHOW, CANCELLED

        const demo = await prisma.demoSchedule.update({
            where: { id: demoId },
            data: { status }
        });

        if (status === 'COMPLETED') {
            await prisma.lead.update({
                where: { id: leadId },
                data: { status: 'CONTACTED' }
            });
        }

        await prisma.leadActivityLog.create({
            data: {
                leadId: leadId,
                actionType: 'DEMO_STATUS_UPDATED',
                notes: `Demo status updated to ${status}.`,
                performedBy: req.user.id
            }
        });

        res.json({ success: true, demo });
    } catch (error) {
        next(error);
    }
});

/**
 * @route   PUT /api/leads/:leadId/demo/:demoId/meeting
 * @desc    Assign meeting link to a demo and optionally send notifications
 * @access  Private/Admin
 */
router.put('/:leadId/demo/:demoId/meeting', authenticate, checkPermission('LEADS'), async (req, res, next) => {
    try {
        const { leadId, demoId } = req.params;
        const { meetingLink, sendEmail: shouldSendEmail, sendWhatsApp: shouldSendWhatsApp } = req.body;

        if (!meetingLink) {
            return res.status(400).json({ error: 'meetingLink is required' });
        }

        // 1. Update the demo schedule
        const demo = await prisma.demoSchedule.update({
            where: { id: demoId },
            data: { meetingLink },
            include: { lead: true }
        });

        // 2. Send Notifications if requested
        const studentName = demo.lead.name;
        const studentEmail = demo.lead.email;
        const studentPhone = demo.lead.phone;
        const scheduledTime = demo.scheduledAt;

        let emailSent = false;
        let whatsappSent = false;

        if (shouldSendEmail && studentEmail) {
            emailSent = await sendDemoEmail(studentName, studentEmail, scheduledTime, meetingLink);
        }

        if (shouldSendWhatsApp && studentPhone) {
            whatsappSent = await sendDemoWhatsApp(studentName, studentPhone, scheduledTime, meetingLink);
        }

        // 3. Log Activity
        let notificationNotes = 'Meeting link assigned.';
        if (emailSent) notificationNotes += ' Email notification sent.';
        if (whatsappSent) notificationNotes += ' WhatsApp notification sent.';

        await prisma.leadActivityLog.create({
            data: {
                leadId: leadId,
                actionType: 'DEMO_MEETING_LINK_SENT',
                notes: notificationNotes,
                performedBy: req.user.id
            }
        });

        res.json({ success: true, demo, notifications: { emailSent, whatsappSent } });
    } catch (error) {
        console.error('[Demo Automation Error]', error);
        next(error);
    }
});

/**
 * @route   POST /api/leads

 * @desc    Create a new lead
 * @access  Private/Admin
 */
router.post('/', authenticate, checkPermission('LEADS'), async (req, res, next) => {
    try {
        const { 
            name, email, phone, source, leadType, college, qualification, location, dob, notes,
            experienceLevel, currentCTC, expectedCTC, noticePeriod, interestedRole, companyName, skills, resumeUrl, courseName,
            district, pinCode, referralName, assignedTo, eventId
        } = req.body;

        // Check for deduplication
        if (email || phone) {
            const existingLead = await prisma.lead.findFirst({
                where: {
                    OR: [
                        { email: email || 'NONE_EXISTS' },
                        { phone: phone || 'NONE_EXISTS' }
                    ]
                }
            });

            if (existingLead) {
                const updatedNotes = `${existingLead.notes || ''}\n\n[New ${leadType || 'GENERAL'} Request] Source: ${source}\nNotes: ${notes || ''}`;
                
                const lead = await prisma.lead.update({
                    where: { id: existingLead.id },
                    data: {
                        notes: updatedNotes,
                        // Optionally update existing lead with new extended fields if they were missing before
                        experienceLevel: experienceLevel || existingLead.experienceLevel,
                        currentCTC: currentCTC || existingLead.currentCTC,
                        expectedCTC: expectedCTC || existingLead.expectedCTC,
                        noticePeriod: noticePeriod || existingLead.noticePeriod,
                        interestedRole: interestedRole || existingLead.interestedRole,
                        companyName: companyName || existingLead.companyName,
                        resumeUrl: resumeUrl || existingLead.resumeUrl,
                        courseName: courseName || existingLead.courseName,
                        district: district || existingLead.district,
                        pinCode: pinCode || existingLead.pinCode,
                        referralName: referralName || existingLead.referralName,
                        // If skills are provided, we could merge them, but for simplicity, we overwrite or keep existing
                        skills: skills && skills.length > 0 ? skills : existingLead.skills
                    }
                });
                await prisma.leadActivityLog.create({
                    data: {
                        leadId: lead.id,
                        actionType: 'NEW_REQUEST_MERGED',
                        notes: `A new manual request was merged into this lead.`,
                        performedBy: req.user ? (req.user.name || req.user.email) : 'Public Form'
                    }
                });
                return res.status(200).json(lead);
            }
        }

        const lead = await prisma.lead.create({
            data: {
                name,
                email,
                phone,
                source: source || 'Website',
                leadType: leadType || 'GENERAL',
                college,
                qualification,
                location,
                dob: dob ? new Date(dob) : null,
                notes,
                status: 'NEW',
                experienceLevel,
                currentCTC,
                expectedCTC,
                noticePeriod,
                interestedRole,
                companyName,
                skills: skills || [],
                resumeUrl,
                courseName,
                district,
                pinCode,
                referralName,
                assignedTo,
                franchiseId: req.user?.role === 'FRANCHISE_ADMIN' ? req.user.franchiseId : null,
                eventId: eventId || null
            }
        });
        notifyNewLead(lead);
        notifyNewLead(lead);

        // Trigger AI Workflow Background Task
        AICore.trackEvent('lead.created', 'CRM', { leadId: lead.id, ...lead })
            .catch(err => console.error('[AICore] Failed to track lead.created event:', err.message));

        // Trigger WhatsApp welcome if phone is present
        if (phone) {
            const { sendWhatsAppMessage } = require('../utils/whatsappAgent');
            sendWhatsAppMessage(phone, `Hi *${name}*! Welcome to Techwell LMS. A counselor has registered you as a career lead. Let us know how we can help you with courses or resume building. 📈`)
                .catch(err => console.error('[WhatsApp Manual Register Failed]:', err.message));
        }

        // Auto-Reply (Lead Follow-up Automation)
        if (email) {
            const { sendEmail } = require('../utils/emailSender');
            // Non-blocking email send
            sendEmail({
                to: email,
                subject: 'Welcome to Techwell - Your Journey Begins!',
                text: `Hi ${name},\n\nThank you for exploring Techwell. We have received your interest and a career counselor will be in touch shortly.\n\nBest Regards,\nTechwell Team`,
                html: `<div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                        <h2 style="color: #1469E2;">Welcome to Techwell, ${name}!</h2>
                        <p>Thank you for expressing interest in our career programs.</p>
                        <p>We are dedicated to helping you land your dream job in tech.</p>
                        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
                        <p><strong>Next Steps:</strong></p>
                        <ul>
                            <li>Our team will review your profile.</li>
                            <li>You will receive a call/message within 24 hours.</li>
                            <li>Explore our <a href="https://techwell.co.in/courses">Free Courses</a> in the meantime.</li>
                        </ul>
                        <br/>
                        <p>Best Regards,<br/><strong>The Techwell Team</strong></p>
                       </div>`
            }).catch(err => console.error('Auto-Reply Failed:', err.message));
        }

        res.status(201).json(lead);
    } catch (error) {
        next(error);
    }
});

/**
 * @route   PUT /api/leads/:id
 * @desc    Update lead status or details
 * @access  Private/Admin
 */
router.put('/:id', authenticate, checkPermission('LEADS'), async (req, res, next) => {
    try {
        const { status, assignedTo, notes, ...updateData } = req.body;

        const existingLead = await prisma.lead.findUnique({
            where: { id: req.params.id }
        });

        if (!existingLead) {
            return res.status(404).json({ error: 'Lead not found' });
        }

        // Prevent Franchise Admin from transferring leads to other franchises or taking unassigned leads
        if (req.user.role === 'FRANCHISE_ADMIN') {
            if (existingLead.franchiseId !== req.user.franchiseId) {
                return res.status(403).json({ error: 'Not authorized to update this lead' });
            }
            if (updateData.franchiseId) {
                delete updateData.franchiseId;
            }
        }

        const lead = await prisma.lead.update({
            where: { id: req.params.id },
            data: {
                ...updateData,
                status,
                assignedTo,
                notes
            }
        });

        // Automation: Trigger messages on status change
        if (status && status !== existingLead.status) {
            const { sendWhatsAppMessage } = require('../utils/whatsappAgent');
            const { sendEmail } = require('../utils/emailSender');

            if (status === 'CONTACTED' && lead.phone) {
                sendWhatsAppMessage(lead.phone, `Hi *${lead.name}*, our team tried reaching out regarding your inquiry. Please let us know a good time to connect! 📞`)
                    .catch(err => console.error('[WhatsApp Automation Failed]:', err.message));
            } else if (status === 'INTERESTED' && lead.email) {
                sendEmail({
                    to: lead.email,
                    subject: 'Excited to have you interested in Techwell!',
                    text: `Hi ${lead.name},\n\We are thrilled you are interested in Techwell! One of our senior counselors will be guiding you through the next steps shortly.\n\nBest Regards,\nTechwell Team`,
                    html: `<div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                            <h2 style="color: #1469E2;">Hi ${lead.name}!</h2>
                            <p>We are thrilled you are interested in Techwell!</p>
                            <p>One of our senior counselors will be guiding you through the next steps shortly.</p>
                            <br/>
                            <p>Best Regards,<br/><strong>The Techwell Team</strong></p>
                            </div>`
                }).catch(err => console.error('[Email Automation Failed]:', err.message));
            } else if (status === 'CONVERTED' && lead.phone) {
                sendWhatsAppMessage(lead.phone, `Congratulations *${lead.name}*! 🎉 Welcome aboard. Let's get started on your journey. 🚀`)
                    .catch(err => console.error('[WhatsApp Automation Failed]:', err.message));
            }
        }

        res.json(lead);
    } catch (error) {
        next(error);
    }
});

/**
 * @route   POST /api/leads/import
 * @desc    Import leads from CSV
 * @access  Private/Admin
 */
router.post('/import', authenticate, checkPermission('LEADS'), upload.single('file'), async (req, res, next) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No CSV file uploaded' });
    }

    const path = require('path');
    const safePath = path.resolve('uploads/temp', path.basename(req.file.path));

    const results = [];
    fs.createReadStream(safePath)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', async () => {
            try {
                // Bulk create leads
                // Supported CSV headers: Name, Email, Phone, Source, College, Location, Lead Type, Company Name, Qualification, Experience Level, Interested Role, Course Name
                const leadsToCreate = results.map(row => ({
                    name: row.Name || row.name,
                    email: row.Email || row.email || null,
                    phone: row.Phone || row.phone || null,
                    source: row.Source || row.source || 'Imported',
                    college: row.College || row.college || null,
                    location: row.Location || row.location || null,
                    leadType: row['Lead Type'] || row.leadType || row.lead_type || 'GENERAL',
                    companyName: row['Company Name'] || row.companyName || row.company_name || null,
                    qualification: row.Qualification || row.qualification || null,
                    experienceLevel: row['Experience Level'] || row.experienceLevel || row.experience_level || null,
                    interestedRole: row['Interested Role'] || row.interestedRole || row.interested_role || null,
                    courseName: row['Course Name'] || row.courseName || row.course_name || null,
                    notes: row.Notes || row.notes || null,
                    status: 'NEW'
                }));

                const createdCount = await prisma.lead.createMany({
                    data: leadsToCreate,
                    skipDuplicates: true
                });

                // Cleanup temp file
                fs.unlinkSync(safePath);

                res.json({ message: `Successfully imported ${createdCount.count} leads` });
            } catch (error) {
                next(error);
            }
        });
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
