const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { authenticate, checkPermission } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure Multer for event image uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../../uploads/events');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, 'event-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (req, file, cb) => {
        const allowed = /jpeg|jpg|png|gif|webp/;
        if (allowed.test(file.mimetype) && allowed.test(path.extname(file.originalname).toLowerCase())) {
            return cb(null, true);
        }
        cb(new Error('Only image files are allowed (jpg, png, gif, webp)'));
    }
});

/**
 * @route   POST /api/events/upload-image
 * @desc    Upload an event banner image
 * @access  Private/Admin
 */
router.post('/upload-image', authenticate, checkPermission('LEADS'), upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No image file provided' });
    }
    const imageUrl = `/uploads/events/${req.file.filename}`;
    res.json({ imageUrl });
});

/**
 * @route   GET /api/events
 * @desc    Get all events
 * @access  Public
 */
router.get('/', async (req, res, next) => {
    try {
        const events = await prisma.event.findMany({
            where: { isApproved: true },
            orderBy: { date: 'asc' }
        });
        res.json(events);
    } catch (error) {
        next(error);
    }
});

/**
 * @route   GET /api/events/all
 * @desc    Get all events (admin only)
 * @access  Private/Admin
 */
router.get('/all', authenticate, checkPermission('LEADS'), async (req, res, next) => {
    try {
        const events = await prisma.event.findMany({
            orderBy: { date: 'asc' }
        });
        res.json(events);
    } catch (error) {
        next(error);
    }
});

/**
 * @route   POST /api/events
 * @desc    Create a new event
 * @access  Private/Admin
 */
router.post('/', authenticate, checkPermission('LEADS'), async (req, res, next) => {
    try {
        const { title, description, imageUrl, type, date, time, location, status, seatsTotal, iconName, customFormFields, generateCertificate, certificateTemplateId } = req.body;

        const event = await prisma.event.create({
            data: {
                title,
                description,
                imageUrl,
                type,
                date: new Date(date),
                time,
                location,
                status,
                seatsTotal: parseInt(seatsTotal, 10),
                iconName,
                customFormFields: customFormFields ? (typeof customFormFields === 'string' ? JSON.parse(customFormFields) : customFormFields) : [],
                generateCertificate: generateCertificate || false,
                certificateTemplateId: certificateTemplateId || null
            }
        });

        res.status(201).json(event);
    } catch (error) {
        next(error);
    }
});

/**
 * @route   PUT /api/events/:id/approve
 * @desc    Approve an event (Manager check)
 * @access  Private/Admin
 */
router.put('/:id/approve', authenticate, checkPermission('MANAGER'), async (req, res, next) => {
    try {
        const { id } = req.params;
        const { isApproved } = req.body; // true or false

        const event = await prisma.event.update({
            where: { id },
            data: {
                isApproved: isApproved,
                approvedById: isApproved ? req.user.id : null
            }
        });

        res.json({ success: true, event });
    } catch (error) {
        next(error);
    }
});

/**
 * @route   PUT /api/events/:id
 * @desc    Update an event
 * @access  Private/Admin
 */
router.put('/:id', authenticate, checkPermission('LEADS'), async (req, res, next) => {
    try {
        const { id } = req.params;
        const { title, description, imageUrl, type, date, time, location, status, seatsTotal, iconName, customFormFields, generateCertificate, certificateTemplateId } = req.body;

        const event = await prisma.event.update({
            where: { id },
            data: {
                title,
                description,
                imageUrl,
                type,
                date: date ? new Date(date) : undefined,
                time,
                location,
                status,
                seatsTotal: seatsTotal ? parseInt(seatsTotal, 10) : undefined,
                iconName,
                customFormFields: customFormFields ? (typeof customFormFields === 'string' ? JSON.parse(customFormFields) : customFormFields) : undefined,
                generateCertificate: generateCertificate !== undefined ? generateCertificate : undefined,
                certificateTemplateId: certificateTemplateId !== undefined ? certificateTemplateId : undefined
            }
        });

        res.json(event);
    } catch (error) {
        next(error);
    }
});

/**
 * @route   DELETE /api/events/:id
 * @desc    Delete an event
 * @access  Private/Admin
 */
router.delete('/:id', authenticate, checkPermission('LEADS'), async (req, res, next) => {
    try {
        const { id } = req.params;
        await prisma.event.delete({
            where: { id }
        });
        res.json({ message: 'Event deleted successfully' });
    } catch (error) {
        next(error);
    }
});

/**
 * @route   POST /api/events/:id/generate-certificates
 * @desc    Generate certificates for event attendees
 * @access  Private/Admin
 */
router.post('/:id/generate-certificates', authenticate, checkPermission('LEADS'), async (req, res, next) => {
    try {
        const { id } = req.params;
        const event = await prisma.event.findUnique({
            where: { id }
        });

        if (!event) return res.status(404).json({ error: 'Event not found' });
        if (!event.generateCertificate) return res.status(400).json({ error: 'Certificate generation not enabled for this event' });
        if (!event.certificateTemplateId) return res.status(400).json({ error: 'No certificate template selected for this event' });

        const leads = await prisma.lead.findMany({
            where: { eventId: id }
        });

        if (!leads.length) return res.status(400).json({ error: 'No attendees found for this event' });

        const template = await prisma.certificateTemplate.findUnique({
            where: { id: event.certificateTemplateId }
        });

        if (!template) return res.status(404).json({ error: 'Certificate template not found' });

        const crypto = require('crypto');
        const generateCertificateId = async () => {
            const prefix = 'EVT';
            const randomBytes = crypto.randomBytes(3).toString('hex').toUpperCase();
            return `${prefix}-${randomBytes}`;
        };

        const certificates = [];
        let skipped = 0;

        for (const lead of leads) {
            // Check if certificate already generated for this lead
            const existing = await prisma.certificate.findFirst({
                where: { 
                    referenceId: event.id,
                    regId: lead.phone || lead.email 
                }
            });

            if (existing) {
                skipped++;
                continue;
            }

            const uniqueId = await generateCertificateId();
            
            // Create a secure hash
            const hashPayload = `${uniqueId}:${lead.name}:${event.title}:${new Date().toISOString()}`;
            const credentialHash = crypto.createHash('sha256').update(hashPayload).digest('hex');

            const cert = await prisma.certificate.create({
                data: {
                    uniqueId,
                    userId: null,
                    regId: lead.phone || lead.email || uniqueId,
                    referenceId: event.id,
                    referenceType: event.type === 'webinar' ? 'WEBINAR' : 'EVENT',
                    studentName: lead.name,
                    courseName: event.title,
                    courseCategory: event.type,
                    purpose: template.purpose || 'EVENT_PARTICIPATION',
                    templateId: template.id,
                    issueDate: new Date(),
                    verificationUrl: `/verify/${uniqueId}`, // Updated verification URL
                    credentialHash,
                    status: 'ISSUED',
                    isValid: true,
                    instituteId: 'default'
                }
            });

            certificates.push(cert);
        }

        res.json({
            message: `Generated ${certificates.length} certificates. Skipped ${skipped} already existing.`,
            generated: certificates.length,
            skipped
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
