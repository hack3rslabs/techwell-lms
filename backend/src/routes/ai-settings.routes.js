const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate, authorize, checkPermission, optionalAuth } = require('../middleware/auth');
const router = express.Router();
const prisma = new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL } } });

/**
 * @route   GET /api/ai-settings
 * @desc    Get current AI Interview settings
 * @access  Private (Admin/Instructor)
 */
router.get('/', authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'INSTRUCTOR'), async (req, res, next) => {
    try {
        // Fetch the first settings record, or create default if none exists
        let settings = await prisma.interviewSettings.findFirst();

        if (!settings) {
            settings = await prisma.interviewSettings.create({
                data: {
                    adaptiveDifficulty: true,
                    escalationThreshold: 75,
                    initialDifficulty: 'INTERMEDIATE',
                    maxQuestions: 10,
                    hrQuestionRatio: 3
                }
            });
        }

        res.json(settings);
    } catch (error) {
        next(error);
    }
});

/**
 * @route   PUT /api/ai-settings
 * @desc    Update AI Interview settings
 * @access  Private (Admin)
 */
router.put('/', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), async (req, res, next) => {
    try {
        const { adaptiveDifficulty, escalationThreshold, initialDifficulty, maxQuestions, hrQuestionRatio } = req.body;

        // Upsert logic: Update first record or create new
        const existing = await prisma.interviewSettings.findFirst();

        let settings;
        if (existing) {
            settings = await prisma.interviewSettings.update({
                where: { id: existing.id },
                data: {
                    adaptiveDifficulty,
                    escalationThreshold,
                    initialDifficulty,
                    maxQuestions,
                    hrQuestionRatio
                }
            });
        } else {
            settings = await prisma.interviewSettings.create({
                data: {
                    adaptiveDifficulty,
                    escalationThreshold,
                    initialDifficulty,
                    maxQuestions,
                    hrQuestionRatio
                }
            });
        }

        res.json({ message: 'Settings updated', settings });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
