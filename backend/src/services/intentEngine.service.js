const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Intent Engine Service
 * Rule-based classification of user intent based on behavior events
 */

class IntentEngine {
    /**
     * Calculate intent scores based on behavior events
     * @param {string} sessionId - Browser session ID
     * @returns {Promise<Object>} Intent scores and classification
     */
    async calculateIntent(sessionId) {
        try {
            // Fetch all events for this session
            const events = await prisma.aIBehaviorEvent.findMany({
                where: { sessionId },
                orderBy: { createdAt: 'asc' }
            });

            if (events.length === 0) {
                return this._getDefaultIntent(sessionId);
            }

            // Initialize scores
            let scores = {
                interview: 0,
                course: 0,
                job: 0
            };

            // Rule-based scoring
            events.forEach(event => {
                const { eventType, eventData } = event;

                // Page view scoring
                if (eventType === 'PAGE_VIEW') {
                    const page = eventData.page || '';

                    if (page.includes('/interview') || page.includes('/ai-interview')) {
                        scores.interview += 10;
                    }
                    if (page.includes('/courses') || page.includes('/course/')) {
                        scores.course += 10;
                    }
                    if (page.includes('/jobs') || page.includes('/career')) {
                        scores.job += 10;
                    }
                    if (page.includes('/pricing')) {
                        scores.interview += 3;
                        scores.course += 3;
                    }
                }

                // Time on page scoring (engagement)
                if (eventType === 'TIME_ON_PAGE') {
                    const duration = eventData.duration || 0;
                    const page = eventData.page || '';

                    if (duration > 30) { // More than 30 seconds
                        if (page.includes('/interview')) scores.interview += 5;
                        if (page.includes('/courses')) scores.course += 5;
                        if (page.includes('/jobs')) scores.job += 5;
                    }
                }

                // CTA click scoring (strong signal)
                if (eventType === 'CTA_CLICK') {
                    const ctaId = eventData.ctaId || '';

                    if (ctaId.includes('interview') || ctaId.includes('ai-mock')) {
                        scores.interview += 20;
                    }
                    if (ctaId.includes('course') || ctaId.includes('enroll')) {
                        scores.course += 20;
                    }
                    if (ctaId.includes('job') || ctaId.includes('apply')) {
                        scores.job += 20;
                    }
                }

                // Scroll depth scoring (engagement)
                if (eventType === 'SCROLL') {
                    const depth = eventData.scrollDepth || 0;
                    const page = eventData.page || '';

                    if (depth > 75) { // Scrolled more than 75%
                        if (page.includes('/interview')) scores.interview += 3;
                        if (page.includes('/courses')) scores.course += 3;
                        if (page.includes('/jobs')) scores.job += 3;
                    }
                }
            });

            // Determine primary intent
            const maxScore = Math.max(scores.interview, scores.course, scores.job);
            let primaryIntent = 'BROWSING';

            if (maxScore >= 15) {
                if (scores.interview === maxScore) primaryIntent = 'INTERVIEW_FOCUSED';
                else if (scores.course === maxScore) primaryIntent = 'COURSE_FOCUSED';
                else if (scores.job === maxScore) primaryIntent = 'JOB_FOCUSED';
            }

            // Calculate confidence (0-1)
            const totalScore = scores.interview + scores.course + scores.job;
            const confidence = totalScore > 0 ? maxScore / totalScore : 0;

            return {
                sessionId,
                primaryIntent,
                interviewScore: scores.interview,
                courseScore: scores.course,
                jobScore: scores.job,
                confidence: Math.round(confidence * 100) / 100,
                eventCount: events.length
            };
        } catch (error) {
            console.error('[IntentEngine] Error calculating intent:', error);
            return this._getDefaultIntent(sessionId);
        }
    }

    /**
     * Save or update user intent in database
     * @param {Object} intentData - Intent calculation result
     * @returns {Promise<Object>} Saved intent record
     */
    async saveIntent(intentData) {
        try {
            const { sessionId, ...data } = intentData;

            return await prisma.userIntent.upsert({
                where: { sessionId },
                update: {
                    ...data,
                    updatedAt: new Date()
                },
                create: {
                    sessionId,
                    ...data
                }
            });
        } catch (error) {
            console.error('[IntentEngine] Error saving intent:', error);
            throw error;
        }
    }

    /**
     * Get intent for a session (calculate if not exists)
     * @param {string} sessionId - Browser session ID
     * @returns {Promise<Object>} User intent
     */
    async getIntent(sessionId) {
        try {
            // Check if intent already calculated
            let intent = await prisma.userIntent.findUnique({
                where: { sessionId }
            });

            // If not, calculate and save
            if (!intent) {
                const calculated = await this.calculateIntent(sessionId);
                intent = await this.saveIntent(calculated);
            }

            return intent;
        } catch (error) {
            console.error('[IntentEngine] Error getting intent:', error);
            return this._getDefaultIntent(sessionId);
        }
    }

    /**
     * Record popup response
     * @param {string} sessionId - Browser session ID
     * @param {string} response - User's popup selection
     * @returns {Promise<Object>} Updated intent
     */
    async recordPopupResponse(sessionId, response) {
        try {
            return await prisma.userIntent.update({
                where: { sessionId },
                data: {
                    popupShown: true,
                    popupResponse: response,
                    updatedAt: new Date()
                }
            });
        } catch (error) {
            console.error('[IntentEngine] Error recording popup response:', error);
            throw error;
        }
    }

    /**
     * Get default intent for new sessions
     * @private
     */
    _getDefaultIntent(sessionId) {
        return {
            sessionId,
            primaryIntent: 'BROWSING',
            interviewScore: 0,
            courseScore: 0,
            jobScore: 0,
            confidence: 0,
            eventCount: 0
        };
    }
}

module.exports = new IntentEngine();
