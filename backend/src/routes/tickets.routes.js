const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate, authorize, checkPermission } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const router = express.Router();
const prisma = new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL } } });

// Configure storage for ticket attachments
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = 'uploads/tickets';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'ticket-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

/**
 * @route   POST /api/tickets
 * @desc    Create a new support ticket
 * @access  Private
 */
router.post('/', authenticate, upload.single('attachment'), async (req, res, next) => {
    try {
        const { subject, description, priority, category } = req.body;
        const attachmentUrl = req.file ? `/uploads/tickets/${req.file.filename}` : null;

        const ticket = await prisma.ticket.create({
            data: {
                subject,
                description,
                priority: priority || 'MEDIUM',
                category: category || 'GENERAL',
                userId: req.user.id,
                messages: {
                    create: {
                        message: description,
                        attachmentUrl,
                        isStaffReply: false
                    }
                }
            },
            include: { messages: true }
        });

        res.status(201).json(ticket);
    } catch (error) {
        if (req.file) fs.unlinkSync(req.file.path);
        next(error);
    }
});

/**
 * @route   GET /api/tickets
 * @desc    Get all tickets (User gets own, Admin gets all)
 * @access  Private
 */
router.get('/', authenticate, checkPermission('VIEW_TICKETS'), async (req, res, next) => {
    try {
        const { status, priority, category } = req.query;
        let where = {};

        // If not admin or support staff, restrict to own tickets
        // We check for MANAGE_TICKETS permission to allow viewing all tickets
        const canManageTickets = req.user.permissions.includes('MANAGE_TICKETS') || req.user.permissions.includes('ALL');

        if (!canManageTickets) {
            where.userId = req.user.id;
        }

        if (status) where.status = status;
        if (priority) where.priority = priority;
        if (category) where.category = category;

        const tickets = await prisma.ticket.findMany({
            where,
            orderBy: { updatedAt: 'desc' },
            include: {
                user: { select: { name: true, email: true, role: true } },
                _count: { select: { messages: true } }
            }
        });

        res.json(tickets);
    } catch (error) {
        next(error);
    }
});

/**
 * @route   GET /api/tickets/:id
 * @desc    Get ticket details with messages
 * @access  Private
 */
router.get('/:id', authenticate, checkPermission('VIEW_TICKETS'), async (req, res, next) => {
    try {
        const ticket = await prisma.ticket.findUnique({
            where: { id: req.params.id },
            include: {
                messages: { orderBy: { createdAt: 'asc' } },
                user: { select: { id: true, name: true, email: true, avatar: true } }
            }
        });

        if (!ticket) return res.status(404).json({ error: 'Ticket not found' });

        // Access check
        const canManageTickets = req.user.permissions.includes('MANAGE_TICKETS') || req.user.permissions.includes('ALL');

        if (!canManageTickets && ticket.userId !== req.user.id) {
            return res.status(403).json({ error: 'Access denied' });
        }

        res.json(ticket);
    } catch (error) {
        next(error);
    }
});

/**
 * @route   POST /api/tickets/:id/reply
 * @desc    Add a reply to a ticket
 * @access  Private
 */
router.post('/:id/reply', authenticate, checkPermission('VIEW_TICKETS'), upload.single('attachment'), async (req, res, next) => {
    try {
        const { message } = req.body;
        const attachmentUrl = req.file ? `/uploads/tickets/${req.file.filename}` : null;

        // Check if user is staff/admin based on permissions
        const isStaff = req.user.permissions.includes('MANAGE_TICKETS') || req.user.permissions.includes('ALL');

        // Verify ticket exists
        const ticket = await prisma.ticket.findUnique({ where: { id: req.params.id } });
        if (!ticket) return res.status(404).json({ error: 'Ticket not found' });

        // Access check for reply
        if (!isStaff && ticket.userId !== req.user.id) {
            return res.status(403).json({ error: 'Access denied' });
        }

        // Create message
        const newMessage = await prisma.ticketMessage.create({
            data: {
                ticketId: ticket.id,
                message,
                attachmentUrl,
                isStaffReply: !!isStaff // Ensure boolean
            }
        });

        // Update ticket status if needed
        let updateData = { updatedAt: new Date() };
        if (isStaff && ticket.status === 'OPEN') {
            updateData.status = 'IN_PROGRESS';
            // If replied by staff and state was OPEN, move to IN_PROGRESS
        } else if (!isStaff && ticket.status === 'RESOLVED') {
            updateData.status = 'OPEN'; // Re-open if user replies
        } else if (!isStaff && ticket.status === 'WAITING_FOR_USER') {
            updateData.status = 'IN_PROGRESS'; // User replied back
        }

        await prisma.ticket.update({
            where: { id: ticket.id },
            data: updateData
        });

        res.json(newMessage);
    } catch (error) {
        if (req.file) fs.unlinkSync(req.file.path);
        next(error);
    }
});

/**
 * @route   PUT /api/tickets/:id/status
 * @desc    Update ticket status (Admin/Staff only)
 * @access  Private/Admin/Manager
 */
router.put('/:id/status', authenticate, checkPermission('MANAGE_TICKETS'), async (req, res, next) => {
    try {
        const { status, priority } = req.body;
        const ticket = await prisma.ticket.update({
            where: { id: req.params.id },
            data: { status, priority }
        });
        res.json(ticket);
    } catch (error) {
        next(error);
    }
});

/**
 * @route   PATCH /api/tickets/:id/assign
 * @desc    Assign ticket to staff
 * @access  Private/Admin/Manager
 */
router.patch('/:id/assign', authenticate, checkPermission('MANAGE_TICKETS'), async (req, res, next) => {
    try {
        const { assignedTo, internalNotes } = req.body;

        const data = {};
        if (assignedTo) data.assignedTo = assignedTo;
        if (internalNotes) data.internalNotes = internalNotes;

        const ticket = await prisma.ticket.update({
            where: { id: req.params.id },
            data
        });
        res.json(ticket);
    } catch (error) {
        next(error);
    }
});

module.exports = router;
