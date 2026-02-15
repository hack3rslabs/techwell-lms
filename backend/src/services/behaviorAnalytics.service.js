const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Behavior Analytics Service
 * Aggregates and analyzes user behavior data for admin dashboard
 */

class BehaviorAnalytics {
    /**
     * Get top user intents distribution
     * @param {Object} filters - Date range, etc.
     * @returns {Promise<Array>} Intent distribution
     */
    async getIntentDistribution(filters = {}) {
        try {
            const { startDate, endDate } = filters;

            const where = {};
            if (startDate || endDate) {
                where.createdAt = {};
                if (startDate) where.createdAt.gte = new Date(startDate);
                if (endDate) where.createdAt.lte = new Date(endDate);
            }

            const intents = await prisma.userIntent.groupBy({
                by: ['primaryIntent'],
                where,
                _count: {
                    primaryIntent: true
                }
            });

            return intents.map(item => ({
                intent: item.primaryIntent,
                count: item._count.primaryIntent
            }));
        } catch (error) {
            console.error('[BehaviorAnalytics] Error getting intent distribution:', error);
            return [];
        }
    }

    /**
     * Get most visited pages
     * @param {Object} filters - Date range, limit
     * @returns {Promise<Array>} Page visit stats
     */
    async getTopPages(filters = {}) {
        try {
            const { startDate, endDate, limit = 10 } = filters;

            const where = { eventType: 'PAGE_VIEW' };
            if (startDate || endDate) {
                where.createdAt = {};
                if (startDate) where.createdAt.gte = new Date(startDate);
                if (endDate) where.createdAt.lte = new Date(endDate);
            }

            const events = await prisma.aIBehaviorEvent.findMany({
                where,
                select: {
                    eventData: true
                }
            });

            // Count page visits
            const pageCounts = {};
            events.forEach(event => {
                const page = event.eventData?.page || 'unknown';
                pageCounts[page] = (pageCounts[page] || 0) + 1;
            });

            // Sort and limit
            return Object.entries(pageCounts)
                .map(([page, count]) => ({ page, count }))
                .sort((a, b) => b.count - a.count)
                .slice(0, limit);
        } catch (error) {
            console.error('[BehaviorAnalytics] Error getting top pages:', error);
            return [];
        }
    }

    /**
     * Get CTA click performance
     * @param {Object} filters - Date range
     * @returns {Promise<Array>} CTA click stats
     */
    async getCTAPerformance(filters = {}) {
        try {
            const { startDate, endDate } = filters;

            const where = { eventType: 'CTA_CLICK' };
            if (startDate || endDate) {
                where.createdAt = {};
                if (startDate) where.createdAt.gte = new Date(startDate);
                if (endDate) where.createdAt.lte = new Date(endDate);
            }

            const events = await prisma.aIBehaviorEvent.findMany({
                where,
                select: {
                    eventData: true
                }
            });

            // Count CTA clicks
            const ctaCounts = {};
            events.forEach(event => {
                const ctaId = event.eventData?.ctaId || 'unknown';
                ctaCounts[ctaId] = (ctaCounts[ctaId] || 0) + 1;
            });

            return Object.entries(ctaCounts)
                .map(([ctaId, clicks]) => ({ ctaId, clicks }))
                .sort((a, b) => b.clicks - a.clicks);
        } catch (error) {
            console.error('[BehaviorAnalytics] Error getting CTA performance:', error);
            return [];
        }
    }

    /**
     * Get popup analytics
     * @param {Object} filters - Date range
     * @returns {Promise<Object>} Popup stats
     */
    async getPopupAnalytics(filters = {}) {
        try {
            const { startDate, endDate } = filters;

            const where = {};
            if (startDate || endDate) {
                where.createdAt = {};
                if (startDate) where.createdAt.gte = new Date(startDate);
                if (endDate) where.createdAt.lte = new Date(endDate);
            }

            const [totalSessions, popupsShown, responses] = await Promise.all([
                prisma.userIntent.count({ where }),
                prisma.userIntent.count({ where: { ...where, popupShown: true } }),
                prisma.userIntent.groupBy({
                    by: ['popupResponse'],
                    where: { ...where, popupResponse: { not: null } },
                    _count: { popupResponse: true }
                })
            ]);

            return {
                totalSessions,
                popupsShown,
                showRate: totalSessions > 0 ? (popupsShown / totalSessions * 100).toFixed(2) : 0,
                responses: responses.map(r => ({
                    response: r.popupResponse,
                    count: r._count.popupResponse
                }))
            };
        } catch (error) {
            console.error('[BehaviorAnalytics] Error getting popup analytics:', error);
            return { totalSessions: 0, popupsShown: 0, showRate: 0, responses: [] };
        }
    }

    /**
     * Get average time on page stats
     * @param {Object} filters - Date range
     * @returns {Promise<Array>} Time on page stats
     */
    async getTimeOnPageStats(filters = {}) {
        try {
            const { startDate, endDate } = filters;

            const where = { eventType: 'TIME_ON_PAGE' };
            if (startDate || endDate) {
                where.createdAt = {};
                if (startDate) where.createdAt.gte = new Date(startDate);
                if (endDate) where.createdAt.lte = new Date(endDate);
            }

            const events = await prisma.aIBehaviorEvent.findMany({
                where,
                select: {
                    eventData: true
                }
            });

            // Calculate average time per page
            const pageStats = {};
            events.forEach(event => {
                const page = event.eventData?.page || 'unknown';
                const duration = event.eventData?.duration || 0;

                if (!pageStats[page]) {
                    pageStats[page] = { total: 0, count: 0 };
                }
                pageStats[page].total += duration;
                pageStats[page].count += 1;
            });

            return Object.entries(pageStats)
                .map(([page, stats]) => ({
                    page,
                    avgTime: Math.round(stats.total / stats.count),
                    visits: stats.count
                }))
                .sort((a, b) => b.avgTime - a.avgTime);
        } catch (error) {
            console.error('[BehaviorAnalytics] Error getting time on page stats:', error);
            return [];
        }
    }
}

module.exports = new BehaviorAnalytics();
