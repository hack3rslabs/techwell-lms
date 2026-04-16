const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate, authorize, checkPermission, optionalAuth } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL } } });

/**
 * @route   GET /api/portfolio/me/settings
 * @desc    Get current user's portfolio settings
 * @access  Private
 */
router.get('/me/settings', authenticate, async (req, res, next) => {
    try {
        // Return basic settings - can be extended with actual settings model
        res.json({
            portfolioPublic: true,
            showCertificates: true,
            showInterviews: true,
            headline: null,
            linkedinUrl: null,
            websiteUrl: null
        });
    } catch (error) {
        next(error);
    }
});

/**
 * @route   PUT /api/portfolio/me/settings
 * @desc    Update portfolio settings
 * @access  Private
 */
router.put('/me/settings', authenticate, async (req, res, next) => {
    try {
        const { portfolioPublic, showCertificates, showInterviews, headline, linkedinUrl } = req.body;

        // In real implementation, save to database
        res.json({
            message: 'Settings updated',
            settings: {
                portfolioPublic,
                showCertificates,
                showInterviews,
                headline,
                linkedinUrl
            }
        });
    } catch (error) {
        next(error);
    }
});

/**
 * @route   GET /api/portfolio/:username
 * @desc    Get public portfolio for a user
 * @access  Public
 */
router.get('/:username', async (req, res, next) => {
    try {
        const { username } = req.params;

        // Find user by username or ID
        const user = await prisma.user.findFirst({
            where: {
                OR: [
                    { id: username },
                    { email: username }
                ]
            },
            select: {
                id: true,
                name: true,
                email: true,
                profileCompleted: true
            }
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Get real certificates
        const certificates = await prisma.certificate.findMany({
            where: {
                userId: user.id,
                isValid: true
            },
            select: {
                id: true,
                uniqueId: true,
                courseName: true,
                courseCategory: true,
                issueDate: true,
                grade: true,
                previewUrl: true // Assuming we might add this or use template
            },
            orderBy: { issueDate: 'desc' }
        });

        // Get completed interviews
        const interviews = await prisma.interview.findMany({
            where: {
                userId: user.id,
                status: 'COMPLETED'
            },
            select: {
                id: true,
                domain: true,
                role: true,
                score: true,
                scheduledFor: true
            },
            orderBy: { scheduledFor: 'desc' }
        });

        const interviewAchievements = interviews.map(i => ({
            id: i.id,
            domain: i.domain,
            role: i.role,
            score: i.score || 0,
            completedAt: i.scheduledFor,
            isPublic: true
        }));

        // Calculate stats
        const totalScore = interviewAchievements.reduce((acc, i) => acc + i.score, 0);
        const avgScore = interviewAchievements.length > 0
            ? Math.round(totalScore / interviewAchievements.length)
            : 0;

        res.json({
            user: {
                id: user.id,
                name: user.name,
                headline: null, // Can be added to user model later
                portfolioPublic: true
            },
            certificates,
            interviewAchievements,
            stats: {
                totalCertificates: certificates.length,
                totalInterviews: interviewAchievements.length,
                averageScore: avgScore
            }
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
