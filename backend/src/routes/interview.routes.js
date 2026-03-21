const express = require('express');
const { z } = require('zod');
const { PrismaClient } = require('@prisma/client');
const { authenticate, authorize } = require('../middleware/auth');
const aiService = require('../services/ai.service');

const router = express.Router();
const prisma = new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL } } });

// Validation schemas
const createInterviewSchema = z.object({
    domain: z.string().min(2, 'Domain is required'),
    company: z.string().optional(),
    role: z.string().min(2, 'Role is required'),
    jobDescription: z.string().optional(),
    difficulty: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']).default('INTERMEDIATE'),
    panelCount: z.number().min(1).max(5).default(1),
    scheduledAt: z.string().optional().nullable(),
    duration: z.number().default(30),
    selectedAvatars: z.array(z.string()).optional(),
    technology: z.string().optional(),
    resumeUrl: z.string().optional(),
    jobDescription: z.string().optional()
});

/**
 * @route   GET /api/interviews
 * @desc    Get user's interviews
 * @access  Private
 */
router.get('/', authenticate, async (req, res, next) => {
    try {
        const { status, page = 1, limit = 10 } = req.query;

        const where = { userId: req.user.id };
        if (status) where.status = status;

        const [interviews, total] = await Promise.all([
            prisma.interview.findMany({
                where,
                select: {
                    id: true,
                    domain: true,
                    company: true,
                    role: true,
                    difficulty: true,
                    panelCount: true,
                    status: true,
                    scheduledAt: true,
                    completedAt: true,
                    createdAt: true,
                    evaluation: {
                        select: {
                            overallScore: true
                        }
                    }
                },
                skip: (Number(page) - 1) * Number(limit),
                take: Number(limit),
                orderBy: { createdAt: 'desc' }
            }),
            prisma.interview.count({ where })
        ]);

        res.json({
            interviews,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / Number(limit))
            }
        });
    } catch (error) {
        next(error);
    }
});

/**
 * @route   GET /api/interviews/user/:userId
 * @desc    Get interviews for a specific user (Recruiter/Admin)
 * @access  Private (Employer/Admin)
 */
router.get('/user/:userId', authenticate, authorize('EMPLOYER', 'RECRUITER', 'ADMIN', 'SUPER_ADMIN'), async (req, res, next) => {
    try {
        const { userId } = req.params;
        const { page = 1, limit = 10 } = req.query;

        const [interviews, total] = await Promise.all([
            prisma.interview.findMany({
                where: { userId },
                select: {
                    id: true,
                    domain: true,
                    role: true,
                    difficulty: true,
                    status: true,
                    createdAt: true,
                    evaluation: { select: { overallScore: true } }
                },
                skip: (Number(page) - 1) * Number(limit),
                take: Number(limit),
                orderBy: { createdAt: 'desc' }
            }),
            prisma.interview.count({ where: { userId } })
        ]);

        res.json({
            interviews,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / Number(limit))
            }
        });
    } catch (error) {
        next(error);
    }
});

/**
 * @route   GET /api/interviews/:id
 * @desc    Get interview details
 * @access  Private
 */
router.get('/:id', authenticate, async (req, res, next) => {
    try {
        const { role, id: userId } = req.user;
        const interviewId = req.params.id;

        const where = { id: interviewId };

        // If not admin/recruiter, restrict to own data
        if (!['ADMIN', 'SUPER_ADMIN', 'EMPLOYER', 'RECRUITER'].includes(role)) {
            where.userId = userId;
        }

        const interview = await prisma.interview.findFirst({
            where,
            include: {
                questions: {
                    orderBy: { order: 'asc' },
                    include: {
                        response: true
                    }
                },
                evaluation: true,
                user: { select: { name: true, email: true, avatar: true } } // Include user details for recruiters
            }
        });

        if (!interview) {
            return res.status(404).json({ error: 'Interview not found' });
        }

        res.json({ interview });
    } catch (error) {
        console.error(`[Interview API Error] at ${req.originalUrl}:`, error);
        next(error);
    }
});

/**
 * @route   GET /api/interviews/:id/report
 * @desc    Get or generate interview report
 * @access  Private
 */
router.get('/:id/report', authenticate, async (req, res, next) => {
    try {
        const { role, id: userId } = req.user;
        const interviewId = req.params.id;

        const where = { id: interviewId };

        // If not admin/recruiter, restrict to own data
        if (!['ADMIN', 'SUPER_ADMIN', 'EMPLOYER', 'RECRUITER'].includes(role)) {
            where.userId = userId;
        }

        // Check interview exists and user has access
        const interview = await prisma.interview.findFirst({
            where,
            include: {
                evaluation: true
            }
        });

        if (!interview) {
            return res.status(404).json({ error: 'Interview not found' });
        }

        // Generate or retrieve report
        const report = await aiService.generateDetailedReport(interviewId);

        res.json({ report });
    } catch (error) {
        console.error(`[Interview API Error] at ${req.originalUrl}:`, error);
        next(error);
    }
});

/**
 * @route   POST /api/interviews
 * @desc    Create a new interview
 * @access  Private
 */
router.post('/', authenticate, async (req, res, next) => {
    try {
        const userId = req.user.id;
        const validatedData = createInterviewSchema.parse(req.body);

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { plan: true }
        });

        // Limit FREE users to 2 interviews per month - BYPASSED FOR TESTING
        /*
        if (user.plan === 'FREE') {
            const startOfMonth = new Date();
            startOfMonth.setDate(1);
            startOfMonth.setHours(0, 0, 0, 0);

            const interviewCount = await prisma.interview.count({
                where: {
                    userId: userId,
                    createdAt: {
                        gte: startOfMonth
                    }
                }
            });

            if (interviewCount >= 2) {
                return res.status(403).json({
                    error: 'Monthly limit reached',
                    message: 'Starter plan is limited to 2 AI interviews per month. Please upgrade to Pro for unlimited sessions.'
                });
            }
        }
        */

        const interview = await prisma.interview.create({
            data: {
                ...validatedData,
                userId: userId,
                status: 'SCHEDULED'
            }
        });

        res.status(201).json({ message: 'Interview scheduled', interview });
    } catch (error) {
        console.error(`[Interview API Error] at ${req.originalUrl}:`, error);
        next(error);
    }
});

/**
 * @route   PATCH /api/interviews/:id/start
 * @desc    Start an interview
 * @access  Private
 */
router.patch('/:id/start', authenticate, async (req, res, next) => {
    try {
        const interview = await prisma.interview.findFirst({
            where: {
                id: req.params.id,
                userId: req.user.id
            }
        });

        if (!interview) {
            console.log(`[Interview Start] Interview not found: ${req.params.id} for user: ${req.user.id}`);
            return res.status(404).json({ error: 'Interview not found' });
        }

        // Allow start if SCHEDULED or already IN_PROGRESS (idempotent)
        if (interview.status !== 'SCHEDULED' && interview.status !== 'IN_PROGRESS') {
            console.log(`[Interview Start] Invalid status: ${interview.status} for interview: ${interview.id}`);
            return res.status(400).json({ error: 'Interview cannot be started' });
        }

        const updated = await prisma.interview.update({
            where: { id: req.params.id },
            data: {
                status: 'IN_PROGRESS',
                startedAt: interview.startedAt || new Date()
            }
        });

        console.log(`[Interview Start] Success for interview: ${updated.id}`);
        res.json({ message: 'Interview started', interview: updated });
    } catch (error) {
        console.error(`[Interview API Error] at ${req.originalUrl}:`, error);
        next(error);
    }
});

/**
 * @route   PATCH /api/interviews/:id/complete
 * @desc    Complete an interview
 * @access  Private
 */
router.patch('/:id/complete', authenticate, async (req, res, next) => {
    try {
        const interview = await prisma.interview.findFirst({
            where: {
                id: req.params.id,
                userId: req.user.id
            }
        });

        if (!interview) {
            return res.status(404).json({ error: 'Interview not found' });
        }

        if (interview.status !== 'IN_PROGRESS') {
            return res.status(400).json({ error: 'Interview is not in progress' });
        }

        const updated = await prisma.interview.update({
            where: { id: req.params.id },
            data: {
                status: 'COMPLETED',
                completedAt: new Date()
            }
        });

        res.json({ message: 'Interview completed', interview: updated });
    } catch (error) {
        console.error(`[Interview API Error] at ${req.originalUrl}:`, error);
        next(error);
    }
});

/**
 * @route   GET /api/interviews/stats/summary
 * @desc    Get interview statistics for user
 * @access  Private
 */
router.get('/stats/summary', authenticate, async (req, res, next) => {
    try {
        const [total, completed, avgScore] = await Promise.all([
            prisma.interview.count({ where: { userId: req.user.id } }),
            prisma.interview.count({ where: { userId: req.user.id, status: 'COMPLETED' } }),
            prisma.interviewEvaluation.aggregate({
                where: { interview: { userId: req.user.id } },
                _avg: { overallScore: true }
            })
        ]);

        res.json({
            stats: {
                total,
                completed,
                averageScore: avgScore._avg.overallScore || 0
            }
        });
    } catch (error) {
        console.error(`[Interview API Error] at ${req.originalUrl}:`, error);
        next(error);
    }
});

/**
 * @route   GET /api/interviews/job-interviews
     * @desc    Get HR scheduled interviews (ATS) for the user
     * @access  Private
     */
router.get('/job-interviews', authenticate, async (req, res, next) => {
    try {
        const interviews = await prisma.jobInterview.findMany({
            where: {
                application: {
                    applicantId: req.user.id
                },
                status: 'SCHEDULED' // Only future/scheduled ones
            },
            include: {
                application: {
                    include: {
                        job: {
                            include: {
                                employer: {
                                    include: { employerProfile: true }
                                }
                            }
                        }
                    }
                },
                interviewer: {
                    select: { name: true, email: true } // HR/Interviewer details
                }
            },
            orderBy: { scheduledAt: 'asc' }
        });
        res.json({ interviews });
    } catch (error) {
        console.error(`[Interview API Error] at ${req.originalUrl}:`, error);
        next(error);
    }
});

// ============= AI INTEGRATION =============

/**
 * @route   POST /api/interviews/:id/next-question
 * @desc    Generate next question based on context
 * @access  Private
 */
router.post('/:id/next-question', authenticate, async (req, res, next) => {
    try {
        const interview = await prisma.interview.findFirst({
            where: { id: req.params.id, userId: req.user.id }
        });

        if (!interview) return res.status(404).json({ error: 'Interview not found' });

        // Pass previous response for adaptive logic?
        // We need to fetch the last response for this interview to pass to AI service
        const lastResponse = await prisma.interviewResponse.findFirst({
            where: { interviewId: interview.id },
            orderBy: { respondedAt: 'desc' },
            include: { question: true }
        });

        const aiResponse = await aiService.generateNextQuestion(interview.id, lastResponse);

        if (!aiResponse) {
            // Mark as completed
            await prisma.interview.update({
                where: { id: interview.id },
                data: { status: 'COMPLETED', completedAt: new Date() }
            });
            return res.json({ message: 'Interview completed', completed: true });
        }

        // Store question in DB
        const question = await prisma.interviewQuestion.create({
            data: {
                interviewId: interview.id,
                question: aiResponse.question,
                type: aiResponse.type,
                avatarId: aiResponse.avatarId,
                avatarRole: aiResponse.avatarRole,
                order: (await prisma.interviewQuestion.count({ where: { interviewId: interview.id } })) + 1
            }
        });

        res.json({ question });
    } catch (error) {
        console.error(`[Interview API Error] at ${req.originalUrl}:`, error);
        next(error);
    }
});

/**
 * @route   POST /api/interviews/:id/response
 * @desc    Submit response and get evaluation
 * @access  Private
 */
router.post('/:id/response', authenticate, async (req, res, next) => {
    try {
        const { questionId, answer, code } = req.body;

        // Evaluate (Pass code if available)
        const evaluation = await aiService.evaluateResponse(questionId, answer, code);

        // Save response with evaluation
        const response = await prisma.interviewResponse.create({
            data: {
                interviewId: req.params.id,
                questionId,
                transcript: answer,
                code, // Save the code!
                score: evaluation.score,
                feedback: evaluation.feedback
            }
        });

        res.json({
            response,
            evaluation
        });
    } catch (error) {
        console.error(`[Interview API Error] at ${req.originalUrl}:`, error);
        next(error);
    }
});

/**
 * @route   POST /api/interviews/train
 * @desc    Admin: Add knowledge to AI
 * @access  Private (Admin)
 */
router.post('/train', authenticate, authorize(['ADMIN', 'SUPER_ADMIN']), async (req, res, next) => {
    try {
        const kb = await aiService.trainKnowledgeBase(req.body);
        res.status(201).json({ message: 'Knowledge base updated', kb });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
