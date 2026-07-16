const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate, authorize } = require('../middleware/auth');
const router = express.Router();
const prisma = new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL } } });

/**
 * @route   GET /api/assessments
 * @desc    List available assessments
 * @access  Private
 */
router.get('/', authenticate, async (req, res, next) => {
    try {
        const isAdmin = ['ADMIN', 'SUPER_ADMIN'].includes(req.user.role);

        let where = {};
        if (isAdmin) {
            // Admins see all
        } else if (req.user.role !== 'STUDENT') {
            // Employers, trainers, staff see their own and published ones
            where.OR = [
                { employerId: req.user.id },
                { isPublished: true }
            ];
        } else {
            // Students see only published
            where.isPublished = true;
        }

        const assessments = await prisma.assessment.findMany({
            where,
            include: {
                employer: { select: { name: true, employerProfile: true } },
                _count: { select: { questions: true, attempts: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(assessments);
    } catch (error) {
        next(error);
    }
});

/**
 * @route   POST /api/assessments
 * @desc    Create a new assessment
 * @access  Private (Employer/Admin/Trainer/Staff)
 */
router.post('/', authenticate, authorize('EMPLOYER', 'ADMIN', 'SUPER_ADMIN', 'INSTRUCTOR', 'STAFF', 'FRANCHISE_TRAINER', 'FRANCHISE_STAFF'), async (req, res, next) => {
    try {
        const { title, description, type, duration, passingScore, isPublished } = req.body;
        const assessment = await prisma.assessment.create({
            data: {
                title,
                description,
                type: type || 'MCQ',
                duration: duration || 60,
                passingScore: passingScore || 50,
                employerId: req.user.id,
                isPublished: isPublished || false
            }
        });
        res.status(201).json(assessment);
    } catch (error) {
        next(error);
    }
});

/**
 * @route   POST /api/assessments/:id/questions
 * @desc    Add a question to an assessment
 * @access  Private (Employer/Admin/Trainer/Staff)
 */
router.post('/:id/questions', authenticate, authorize('EMPLOYER', 'ADMIN', 'SUPER_ADMIN', 'INSTRUCTOR', 'STAFF', 'FRANCHISE_TRAINER', 'FRANCHISE_STAFF'), async (req, res, next) => {
    try {
        const { id } = req.params;
        const { text, type, options, correctAnswer, marks } = req.body;
        
        // verify ownership
        const assessment = await prisma.assessment.findUnique({ where: { id } });
        if (!assessment) return res.status(404).json({ error: 'Assessment not found' });
        if (assessment.employerId !== req.user.id && !['ADMIN', 'SUPER_ADMIN'].includes(req.user.role)) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        const question = await prisma.assessmentQuestion.create({
            data: {
                assessmentId: id,
                text,
                type: type || 'MCQ',
                options: options || [],
                correctAnswer,
                marks: marks || 1
            }
        });
        res.status(201).json(question);
    } catch (error) {
        next(error);
    }
});

/**
 * @route   GET /api/assessments/:id
 * @desc    Get assessment details (hides answers if Student)
 * @access  Private
 */
router.get('/:id', authenticate, async (req, res, next) => {
    try {
        const { id } = req.params;
        const isStudent = req.user.role === 'STUDENT';

        const assessment = await prisma.assessment.findUnique({
            where: { id },
            include: { questions: true }
        });

        if (!assessment) return res.status(404).json({ error: 'Not found' });

        // Hide answers for students
        if (isStudent) {
            assessment.questions = assessment.questions.map(q => {
                const { correctAnswer, ...safeQ } = q;
                return safeQ;
            });
        }

        res.json(assessment);
    } catch (error) {
        next(error);
    }
});

/**
 * @route   POST /api/assessments/:id/start
 * @desc    Start an assessment attempt
 * @access  Private (Student)
 */
router.post('/:id/start', authenticate, authorize('STUDENT'), async (req, res, next) => {
    try {
        const { id } = req.params;
        
        const existing = await prisma.assessmentAttempt.findFirst({
            where: { assessmentId: id, userId: req.user.id, status: 'IN_PROGRESS' }
        });

        if (existing) {
            return res.json(existing);
        }

        const attempt = await prisma.assessmentAttempt.create({
            data: {
                assessmentId: id,
                userId: req.user.id,
                status: 'IN_PROGRESS'
            }
        });
        res.status(201).json(attempt);
    } catch (error) {
        next(error);
    }
});

/**
 * @route   POST /api/assessments/:id/submit
 * @desc    Submit assessment attempt
 * @access  Private (Student)
 */
router.post('/:id/submit', authenticate, authorize('STUDENT'), async (req, res, next) => {
    try {
        const { id } = req.params;
        const { responses, proctorLogs } = req.body; // responses: { questionId: "answer" }

        const attempt = await prisma.assessmentAttempt.findFirst({
            where: { assessmentId: id, userId: req.user.id, status: 'IN_PROGRESS' }
        });

        if (!attempt) return res.status(400).json({ error: 'No active attempt found' });

        const assessment = await prisma.assessment.findUnique({
            where: { id },
            include: { questions: true }
        });

        let score = 0;
        let maxScore = 0;

        // Auto-grade MCQs
        assessment.questions.forEach(q => {
            if (q.type === 'MCQ') {
                maxScore += q.marks;
                if (responses && responses[q.id] === q.correctAnswer) {
                    score += q.marks;
                }
            }
        });

        // Calculate percentage for MCQ portions
        const finalScore = maxScore > 0 ? (score / maxScore) * 100 : 0;

        const updated = await prisma.assessmentAttempt.update({
            where: { id: attempt.id },
            data: {
                status: 'COMPLETED',
                completedAt: new Date(),
                score: finalScore,
                responses: responses || {},
                proctorLogs: proctorLogs || []
            }
        });

        res.json(updated);
    } catch (error) {
        next(error);
    }
});

/**
 * @route   POST /api/assessments/:id/send
 * @desc    Send an assessment link via email to a candidate
 * @access  Private (Employer)
 */
router.post('/:id/send', authenticate, authorize('EMPLOYER'), async (req, res, next) => {
    try {
        const { id } = req.params;
        const { candidateEmail, candidateName } = req.body;
        
        if (!candidateEmail) return res.status(400).json({ error: 'Candidate email is required' });

        const assessment = await prisma.assessment.findUnique({
            where: { id }
        });

        if (!assessment || assessment.employerId !== req.user.id) {
            return res.status(403).json({ error: 'Assessment not found or not authorized' });
        }

        const { sendEmail } = require('../utils/emailSender');
        
        const assessmentLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/student/assessments/${id}`;
        
        const textContent = `Hi ${candidateName || 'Candidate'},\n\nYou have been invited to complete the "${assessment.title}" assessment.\n\nPlease click the link below to start:\n${assessmentLink}\n\nBest of luck!`;
        const htmlContent = `
            <h3>Assessment Invitation</h3>
            <p>Hi ${candidateName || 'Candidate'},</p>
            <p>You have been invited to complete the <strong>"${assessment.title}"</strong> assessment.</p>
            <p><a href="${assessmentLink}" style="padding: 10px 15px; background-color: #4f46e5; color: white; text-decoration: none; border-radius: 5px;">Start Assessment</a></p>
            <p>Or use this direct link: <br> ${assessmentLink}</p>
            <br>
            <p>Best of luck!</p>
        `;

        const sent = await sendEmail({
            to: candidateEmail,
            subject: `Invitation: ${assessment.title} Assessment`,
            text: textContent,
            html: htmlContent
        });

        // Even if actual sending fails (e.g. SMTP not configured), we mock it for development
        if (!sent) {
            console.log(`[MOCK EMAIL] To: ${candidateEmail} | Subject: Invitation: ${assessment.title}`);
            console.log(`[MOCK EMAIL] Link: ${assessmentLink}`);
        }

        res.status(200).json({ success: true, message: 'Assessment sent successfully' });
    } catch (error) {
        next(error);
    }
});

/**
 * @route   POST /api/assessments/:id/generate-ai
 * @desc    Generate MCQs using AI
 * @access  Private (Employer/Admin/Trainer/Staff)
 */
router.post('/:id/generate-ai', authenticate, authorize('EMPLOYER', 'ADMIN', 'SUPER_ADMIN', 'INSTRUCTOR', 'STAFF', 'FRANCHISE_TRAINER', 'FRANCHISE_STAFF'), async (req, res, next) => {
    try {
        const { id } = req.params;
        const { topic, count } = req.body;
        
        if (!topic) return res.status(400).json({ error: 'Topic is required' });

        const assessment = await prisma.assessment.findUnique({ where: { id } });
        if (!assessment) return res.status(404).json({ error: 'Assessment not found' });

        // Basic authorization check
        const isOwner = assessment.employerId === req.user.id;
        const isAdmin = ['ADMIN', 'SUPER_ADMIN'].includes(req.user.role);
        if (!isOwner && !isAdmin) {
            // Technically a staff/trainer could generate for an assessment they didn't create, 
            // but for safety we'll require them to be the creator unless they are an admin.
            return res.status(403).json({ error: 'Not authorized to modify this assessment' });
        }

        const numQuestions = count || 5;

        // Use Google Generative AI
        const { GoogleGenerativeAI } = require('@google/generative-ai');
        
        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({ error: 'GEMINI_API_KEY is not configured.' });
        }

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const prompt = `You are an expert technical interviewer. Generate exactly ${numQuestions} multiple-choice questions about "${topic}".
        Return the result as a strict JSON array of objects. Do not include markdown code blocks or any other text.
        Each object must match this schema:
        {
            "text": "The question text",
            "type": "MCQ",
            "options": ["Option A", "Option B", "Option C", "Option D"],
            "correctAnswer": "The exact string from options that is correct",
            "marks": 1
        }`;

        const result = await model.generateContent(prompt);
        let textResult = result.response.text();
        
        // Clean markdown if present
        textResult = textResult.replace(/```json/gi, '').replace(/```/g, '').trim();
        
        let parsedQuestions = [];
        try {
            parsedQuestions = JSON.parse(textResult);
        } catch (e) {
            return res.status(500).json({ error: 'Failed to parse AI response.', raw: textResult });
        }

        // Insert questions into database
        const createdQuestions = [];
        for (const q of parsedQuestions) {
            const inserted = await prisma.assessmentQuestion.create({
                data: {
                    assessmentId: id,
                    text: q.text,
                    type: 'MCQ',
                    options: q.options,
                    correctAnswer: q.correctAnswer,
                    marks: parseInt(q.marks) || 1
                }
            });
            createdQuestions.push(inserted);
        }

        res.status(201).json({ success: true, count: createdQuestions.length, questions: createdQuestions });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
