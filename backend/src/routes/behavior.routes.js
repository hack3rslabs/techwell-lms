const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const intentEngine = require('../services/intentEngine.service');
const behaviorAnalytics = require('../services/behaviorAnalytics.service');

const prisma = new PrismaClient();

// Feature flag check middleware
const checkFeatureFlag = (req, res, next) => {
    const isEnabled = process.env.ENABLE_BEHAVIOR_AI === 'true';
    if (!isEnabled) {
        return res.status(404).json({ error: 'Feature not enabled' });
    }
    next();
};

/**
 * POST /api/behavior/event
 * Track a behavior event (async, non-blocking)
 */
router.post('/event', checkFeatureFlag, async (req, res) => {
    try {
        const { sessionId, userId, eventType, eventData, userAgent, ipAddress } = req.body;

        // Validate required fields
        if (!sessionId || !eventType) {
            return res.status(400).json({ error: 'sessionId and eventType are required' });
        }

        // Create event asynchronously (fire and forget for performance)
        prisma.aIBehaviorEvent.create({
            data: {
                sessionId,
                userId: userId || null,
                eventType,
                eventData: eventData || {},
                userAgent: userAgent || req.headers['user-agent'],
                ipAddress: ipAddress || req.ip
            }
        }).catch(error => {
            // Log error but don't fail the request
            console.error('[Behavior] Error creating event:', error);
        });

        // Respond immediately (non-blocking)
        res.status(202).json({ success: true, message: 'Event queued' });
    } catch (error) {
        console.error('[Behavior] Error in event endpoint:', error);
        // Fail silently to not affect user experience
        res.status(202).json({ success: true, message: 'Event queued' });
    }
});

/**
 * POST /api/behavior/events/batch
 * Track multiple events in batch (more efficient)
 */
router.post('/events/batch', checkFeatureFlag, async (req, res) => {
    try {
        const { events } = req.body;

        if (!Array.isArray(events) || events.length === 0) {
            return res.status(400).json({ error: 'events array is required' });
        }

        // Validate and prepare events
        const validEvents = events
            .filter(e => e.sessionId && e.eventType)
            .map(e => ({
                sessionId: e.sessionId,
                userId: e.userId || null,
                eventType: e.eventType,
                eventData: e.eventData || {},
                userAgent: e.userAgent || req.headers['user-agent'],
                ipAddress: e.ipAddress || req.ip
            }));

        // Create events asynchronously
        prisma.aIBehaviorEvent.createMany({
            data: validEvents,
            skipDuplicates: true
        }).catch(error => {
            console.error('[Behavior] Error creating batch events:', error);
        });

        res.status(202).json({
            success: true,
            message: 'Events queued',
            count: validEvents.length
        });
    } catch (error) {
        console.error('[Behavior] Error in batch endpoint:', error);
        res.status(202).json({ success: true, message: 'Events queued' });
    }
});

/**
 * GET /api/behavior/intent
 * Get user intent classification for a session
 */
router.get('/intent', checkFeatureFlag, async (req, res) => {
    try {
        const { sessionId } = req.query;

        if (!sessionId) {
            return res.status(400).json({ error: 'sessionId is required' });
        }

        const intent = await intentEngine.getIntent(sessionId);
        res.json(intent);
    } catch (error) {
        console.error('[Behavior] Error getting intent:', error);
        res.status(500).json({ error: 'Failed to get intent' });
    }
});

/**
 * POST /api/behavior/popup-response
 * Record user's popup interaction
 */
router.post('/popup-response', checkFeatureFlag, async (req, res) => {
    try {
        const { sessionId, response } = req.body;

        if (!sessionId || !response) {
            return res.status(400).json({ error: 'sessionId and response are required' });
        }

        const intent = await intentEngine.recordPopupResponse(sessionId, response);
        res.json({ success: true, intent });
    } catch (error) {
        console.error('[Behavior] Error recording popup response:', error);
        res.status(500).json({ error: 'Failed to record response' });
    }
});

/**
 * GET /api/behavior/analytics/intent-distribution
 * Get intent distribution for admin dashboard
 */
router.get('/analytics/intent-distribution', checkFeatureFlag, async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const distribution = await behaviorAnalytics.getIntentDistribution({ startDate, endDate });
        res.json(distribution);
    } catch (error) {
        console.error('[Behavior] Error getting intent distribution:', error);
        res.status(500).json({ error: 'Failed to get analytics' });
    }
});

/**
 * GET /api/behavior/analytics/top-pages
 * Get most visited pages
 */
router.get('/analytics/top-pages', checkFeatureFlag, async (req, res) => {
    try {
        const { startDate, endDate, limit } = req.query;
        const pages = await behaviorAnalytics.getTopPages({
            startDate,
            endDate,
            limit: limit ? parseInt(limit) : 10
        });
        res.json(pages);
    } catch (error) {
        console.error('[Behavior] Error getting top pages:', error);
        res.status(500).json({ error: 'Failed to get analytics' });
    }
});

/**
 * GET /api/behavior/analytics/cta-performance
 * Get CTA click performance
 */
router.get('/analytics/cta-performance', checkFeatureFlag, async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const performance = await behaviorAnalytics.getCTAPerformance({ startDate, endDate });
        res.json(performance);
    } catch (error) {
        console.error('[Behavior] Error getting CTA performance:', error);
        res.status(500).json({ error: 'Failed to get analytics' });
    }
});

/**
 * GET /api/behavior/analytics/popup-stats
 * Get popup analytics
 */
router.get('/analytics/popup-stats', checkFeatureFlag, async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const stats = await behaviorAnalytics.getPopupAnalytics({ startDate, endDate });
        res.json(stats);
    } catch (error) {
        console.error('[Behavior] Error getting popup stats:', error);
        res.status(500).json({ error: 'Failed to get analytics' });
    }
});

/**
 * GET /api/behavior/analytics/time-on-page
 * Get time on page statistics
 */
router.get('/analytics/time-on-page', checkFeatureFlag, async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const stats = await behaviorAnalytics.getTimeOnPageStats({ startDate, endDate });
        res.json(stats);
    } catch (error) {
        console.error('[Behavior] Error getting time on page stats:', error);
        res.status(500).json({ error: 'Failed to get analytics' });
    }
});

module.exports = router;
