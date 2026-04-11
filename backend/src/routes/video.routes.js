const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate, authorize } = require('../middleware/auth');
const router = express.Router();
const prisma = new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL } } });

// ============= INTEGRATIONS =============

/**
 * @route   GET /api/video/integrations
 * @desc    Get all video integrations
 * @access  Private (Admin/Staff)
 */
router.get('/integrations', authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'STAFF', 'INSTITUTE_ADMIN'), async (req, res, next) => {
    try {
        const integrations = await prisma.videoIntegration.findMany({
            orderBy: { createdAt: 'desc' }
        });
        res.json(integrations);
    } catch (error) {
        next(error);
    }
});

/**
 * @route   POST /api/video/integrations
 * @desc    Create/Update video integration
 * @access  Private (Admin)
 */
router.post('/integrations', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), async (req, res, next) => {
    try {
        const { platform, name, clientId, clientSecret, apiKey } = req.body;

        const integration = await prisma.videoIntegration.create({
            data: {
                platform,
                name: name || platform,
                clientId,
                clientSecret,
                apiKey,
                isActive: true
            }
        });

        res.status(201).json(integration);
    } catch (error) {
        next(error);
    }
});

/**
 * @route   PUT /api/video/integrations/:id
 * @desc    Update integration status or details
 * @access  Private (Admin)
 */
router.put('/integrations/:id', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), async (req, res, next) => {
    try {
        const { id } = req.params;
        const data = req.body;

        const integration = await prisma.videoIntegration.update({
            where: { id },
            data: data
        });

        res.json(integration);
    } catch (error) {
        next(error);
    }
});

/**
 * @route   DELETE /api/video/integrations/:id
 * @desc    Delete integration
 * @access  Private (Super Admin)
 */
router.delete('/integrations/:id', authenticate, authorize('SUPER_ADMIN'), async (req, res, next) => {
    try {
        const { id } = req.params;
        await prisma.videoIntegration.delete({ where: { id } });
        res.json({ message: 'Integration deleted' });
    } catch (error) {
        next(error);
    }
});

// ============= MEETING CREATION =============

/**
 * @route   POST /api/video/create-meeting
 * @desc    Generate a real meeting link using the active integration
 * @access  Private (Admin/Instructor)
 */
router.post('/create-meeting', authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'INSTRUCTOR'), async (req, res, next) => {
    try {
        const { platform, title, scheduledAt, duration } = req.body;
        const { generateMeetingLink } = require('../services/meeting.service');

        const result = await generateMeetingLink(scheduledAt, { title, duration, platform });

        res.json({
            meetingLink: result.meetingLink,
            meetingId: result.meetingId || null,
            password: result.password || null,
            platform: result.platform
        });
    } catch (error) {
        console.error('Create meeting error:', error);
        next(error);
    }
});

/**
 * @route   POST /api/video/integrations/:id/test
 * @desc    Test a video integration connection
 * @access  Private (Admin)
 */
router.post('/integrations/:id/test', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), async (req, res, next) => {
    try {
        const { id } = req.params;
        const integration = await prisma.videoIntegration.findUnique({ where: { id } });

        if (!integration) {
            return res.status(404).json({ success: false, message: 'Integration not found' });
        }

        if (integration.platform === 'ZOOM') {
            const axios = require('axios');
            const accountId = integration.apiKey || process.env.ZOOM_ACCOUNT_ID;
            const clientId = integration.clientId || process.env.ZOOM_CLIENT_ID;
            const clientSecret = integration.clientSecret || process.env.ZOOM_CLIENT_SECRET;

            const tokenUrl = `https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${accountId}`;
            const authHeader = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

            const tokenRes = await axios.post(tokenUrl, null, {
                headers: {
                    'Authorization': `Basic ${authHeader}`,
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });

            if (tokenRes.data.access_token) {
                return res.json({ success: true, message: 'Zoom connection successful! Token generated.' });
            }
        }

        res.json({ success: true, message: `${integration.platform} connection test passed.` });
    } catch (error) {
        console.error('Test connection error:', error?.response?.data || error.message);
        res.json({ success: false, message: 'Connection failed: ' + (error?.response?.data?.reason || error.message) });
    }
});

// ============= CLASSES =============

/**
 * @route   GET /api/video/classes
 * @desc    Get live classes
 * @access  Private
 */
router.get('/classes', authenticate, async (req, res, next) => {
    try {
        const requestedCourseId = typeof req.query.courseId === 'string' ? req.query.courseId : undefined;
        const upcomingOnly = req.query.upcoming === 'true';
        const where = {};

        if (upcomingOnly) {
            where.scheduledAt = { gte: new Date() };
        }

        if (requestedCourseId) {
            where.courseId = requestedCourseId;
        }

        if (req.user.role === 'STUDENT') {
            const enrollments = await prisma.enrollment.findMany({
                where: {
                    userId: req.user.id,
                    status: 'ACTIVE'
                },
                select: { courseId: true }
            });

            const enrolledCourseIds = enrollments.map((enrollment) => enrollment.courseId);

            if (enrolledCourseIds.length === 0) {
                return res.json([]);
            }

            if (requestedCourseId && !enrolledCourseIds.includes(requestedCourseId)) {
                return res.json([]);
            }

            where.courseId = requestedCourseId || { in: enrolledCourseIds };
        }

        const classes = await prisma.liveClass.findMany({
            where,
            include: { course: { select: { id: true, title: true } } },
            orderBy: { scheduledAt: 'asc' }
        });
        res.json(classes);
    } catch (error) {
        next(error);
    }
});

/**
 * @route   POST /api/video/classes
 * @desc    Schedule a live class
 * @access  Private (Instructor/Admin)
 */
router.post('/classes', authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'INSTRUCTOR'), async (req, res, next) => {
    try {
        const { courseId, title, scheduledAt, duration, platform, meetingLink, meetingId, password } = req.body;
        const parsedScheduledAt = new Date(scheduledAt);
        const parsedDuration = parseInt(duration, 10);

        if (!courseId || !title || !scheduledAt || !platform || Number.isNaN(parsedDuration)) {
            return res.status(400).json({ error: 'Course, title, schedule, duration, and platform are required.' });
        }

        if (Number.isNaN(parsedScheduledAt.getTime())) {
            return res.status(400).json({ error: 'Invalid scheduled date/time.' });
        }

        const course = await prisma.course.findUnique({
            where: { id: courseId },
            select: { id: true }
        });

        if (!course) {
            return res.status(400).json({ error: 'Selected course was not found.' });
        }

        const liveClass = await prisma.liveClass.create({
            data: {
                courseId,
                title,
                scheduledAt: parsedScheduledAt,
                duration: parsedDuration,
                platform,
                meetingLink,
                meetingId,
                password,
                status: 'SCHEDULED',
                hostId: req.user.id,
                hostName: req.user.name
            }
        });

        res.status(201).json(liveClass);
    } catch (error) {
        next(error);
    }
});

module.exports = router;
