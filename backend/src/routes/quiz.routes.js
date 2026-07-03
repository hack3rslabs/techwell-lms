const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate, authorize, checkPermission } = require('../middleware/auth');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const router = express.Router();
const prisma = new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL } } });

const GEMINI_KEY = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(GEMINI_KEY || 'MISSING_KEY');

/**
 * @route   GET /api/quizzes/lesson/:lessonId
 * @desc    Get all quizzes for a specific lesson
 * @access  Private
 */
router.get('/lesson/:lessonId', authenticate, async (req, res) => {
    try {
        const quizzes = await prisma.quiz.findMany({
            where: { lessonId: req.params.lessonId },
            orderBy: { createdAt: 'asc' }
        });
        res.json(quizzes);
    } catch (error) {
        console.error("Fetch Quizzes Error:", error);
        res.status(500).json({ error: 'Failed to fetch quizzes' });
    }
});

/**
 * @route   POST /api/quizzes/generate
 * @desc    AI Generate Quiz for a Lesson based on topic
 * @access  Private (Admin/Instructor)
 */
router.post('/generate', authenticate, authorize('ADMIN', 'SUPER_ADMIN', 'INSTRUCTOR'), checkPermission('COURSES'), async (req, res) => {
    try {
        const { lessonId, topic, count } = req.body;
        
        if (!lessonId || !topic) {
            return res.status(400).json({ error: 'lessonId and topic are required' });
        }

        const numQuestions = count || 5;

        if (!GEMINI_KEY) {
            // Mock response for local development without API Key
            const mockQuizzes = Array.from({ length: numQuestions }).map((_, i) => ({
                question: `Mock generated question ${i + 1} about ${topic}?`,
                options: ["Option A", "Option B", "Option C", "Option D"],
                correctAnswer: "Option A",
                explanation: `This is a mock explanation for question ${i + 1}.`
            }));
            
            return res.json({ generated: mockQuizzes });
        }

        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const prompt = `
You are an expert educator. Generate ${numQuestions} multiple-choice questions for a lesson about: "${topic}".
Format the output STRICTLY as a JSON array of objects. Do NOT wrap in markdown \`\`\`json blocks.
Each object must have:
- "question": string
- "options": array of 4 strings
- "correctAnswer": string (must exactly match one of the options)
- "explanation": string (brief explanation of why it's correct)
`;

        const result = await model.generateContent(prompt);
        const cleanJson = result.response.text().replace(/\`\`\`json/gi, '').replace(/\`\`\`/g, '').trim();
        const generatedData = JSON.parse(cleanJson);

        // Save generated quizzes to DB
        const savedQuizzes = await Promise.all(
            generatedData.map(q => 
                prisma.quiz.create({
                    data: {
                        lessonId,
                        question: q.question,
                        options: q.options,
                        correctAnswer: q.correctAnswer,
                        explanation: q.explanation
                    }
                })
            )
        );

        res.json({ generated: savedQuizzes });
    } catch (error) {
        console.error("AI Quiz Generation Error:", error);
        res.status(500).json({ error: 'Failed to generate quizzes via AI' });
    }
});

/**
 * @route   DELETE /api/quizzes/:id
 * @desc    Delete a quiz
 * @access  Private (Admin/Instructor)
 */
router.delete('/:id', authenticate, authorize('ADMIN', 'SUPER_ADMIN', 'INSTRUCTOR'), checkPermission('COURSES'), async (req, res) => {
    try {
        await prisma.quiz.delete({
            where: { id: req.params.id }
        });
        res.json({ success: true, message: 'Quiz deleted' });
    } catch (error) {
        console.error("Delete Quiz Error:", error);
        res.status(500).json({ error: 'Failed to delete quiz' });
    }
});

module.exports = router;
