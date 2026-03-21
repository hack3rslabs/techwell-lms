const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { authenticate, authorize } = require('../middleware/auth');
const { PrismaClient } = require('@prisma/client');
const router = express.Router();
const prisma = new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL } } });

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Middleware to optionally authenticate
const optionalAuth = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (authHeader) {
        authenticate(req, res, (err) => {
            if (err) req.user = null;
            next();
        });
    } else {
        req.user = null;
        next();
    }
};

/**
 * @route   POST /api/ai/chat
 * @desc    Chat with AI Assistant (Handles Auth & Guest/Lead)
 * @access  Public
 */
router.post('/chat', optionalAuth, async (req, res, next) => {
    try {
        const { message, history, leadDetails } = req.body;

        if (!message) return res.status(400).json({ error: 'Message is required' });

        let userContext = "";
        let systemRole = "";

        if (req.user) {
            const user = await prisma.user.findUnique({
                where: { id: req.user.id },
                include: {
                    enrollments: {
                        include: { course: { select: { title: true } } }
                    }
                }
            });

            const enrolledCourses = user.enrollments.map(e => e.course.title).join(', ');
            userContext = `User: ${user.name} (${user.role}). Enrolled in: ${enrolledCourses || 'None'}.`;
            systemRole = `You are "TechWell Bot", a smart teaching assistant. Answer course-specific questions, provide technical guidance, and refer to support if needed.`;
        } else {
            if (leadDetails && leadDetails.name && (leadDetails.email || leadDetails.phone)) {
                try {
                    let existingLead = null;
                    if (leadDetails.email) existingLead = await prisma.lead.findFirst({ where: { email: leadDetails.email } });
                    if (!existingLead) {
                        await prisma.lead.create({
                            data: {
                                name: leadDetails.name,
                                email: leadDetails.email || null,
                                phone: leadDetails.phone || null,
                                source: 'AI Chatbot',
                                status: 'NEW',
                                notes: `Initial query: ${message}`,
                            }
                        });
                    }
                } catch (err) { console.error("Lead creation fail:", err); }
            }
            userContext = `User: Guest. Name: ${leadDetails?.name || 'Visitor'}.`;
            systemRole = `You are Techwell GPT, the official AI assistant for Techwell. Guide students about courses, careers, and services clearly and professionally. Tone: supportive, business-focused.`;
        }

        let aiResponse = "";
        if (process.env.GEMINI_API_KEY) {
            try {
                const prompt = `${systemRole}\n${userContext}\n\nGuidelines:\n- Be concise (3-4 sentences).\n- No markdown code blocks unless requested.\n- User message: ${message}`;
                
                const chat = model.startChat({
                    history: (history || [])
                        .filter(h => h.role && h.parts && h.parts[0])
                        .map(h => ({
                            role: h.role === 'assistant' || h.role === 'model' ? 'model' : 'user',
                            parts: h.parts
                        })),
                });

                const result = await chat.sendMessage(message);
                const response = await result.response;
                aiResponse = response.text().trim();
            } catch (aiError) {
                console.error("Gemini Error:", aiError);
                aiResponse = "I'm having trouble connecting to my AI brain. Please try again!";
            }
        } else {
            aiResponse = `[MOCK AI] Hello ${req.user ? req.user.name : (leadDetails?.name || 'Guest')}! I am simulating a response because the AI key is not configured.`;
        }

        res.json({ message: aiResponse });
    } catch (error) {
        console.error("AI Chat Error:", error);
        res.json({ message: "I'm having a brief brain freeze. Please try again!" });
    }
});

/**
 * @route   POST /api/ai/draft-email
 */
router.post('/draft-email', authenticate, async (req, res) => {
    try {
        const { leadId, topic } = req.body;
        let context = "";
        if (leadId) {
            const lead = await prisma.lead.findUnique({ where: { id: leadId } });
            if (lead) context = `Lead: ${lead.name}, Source: ${lead.source}, Notes: ${lead.notes}`;
        }

        const prompt = `You are a professional sales manager at "TechWell". Draft a short, persuasive email.\nContext: ${context}\nTopic: ${topic || 'Follow up'}\n\nReturn EXACTLY a JSON: {"subject": "...", "body": "..."}`;

        if (!process.env.GEMINI_API_KEY) {
            return res.json({ subject: "Follow up", body: "Hello! We noticed your inquiry. How can we help?" });
        }

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text().trim().replace(/```json|```/gi, '');
        res.json(JSON.parse(text));
    } catch (error) {
        console.error("AI Draft Error:", error);
        res.status(500).json({ error: "Failed to draft email" });
    }
});

router.post('/send-email', authenticate, async (req, res) => {
    const { to, subject, body } = req.body;
    console.log(`[MOCK EMAIL SENT] To: ${to}, Sub: ${subject}`);
    setTimeout(() => res.json({ success: true, message: "Email sent successfully (Simulated)" }), 1000);
});

router.post('/generate-questions', authenticate, async (req, res) => {
    try {
        const { domain, role, company, difficulty, count } = req.body;
        const aiService = require('../services/ai.service');
        const questions = await aiService.generateInterviewQuestions({ domain, role, company, difficulty, count });
        res.json({ questions });
    } catch (error) { res.status(500).json({ error: 'Failed to generate questions' }); }
});

router.post('/generate-from-jd', authenticate, authorize(['ADMIN', 'SUPER_ADMIN']), async (req, res) => {
    try {
        const { context, domain, role, difficulty, count } = req.body;
        const aiService = require('../services/ai.service');
        const questions = await aiService.generateQuestionsFromContext({ context, domain, role, difficulty, count });
        res.json({ questions });
    } catch (error) { res.status(500).json({ error: 'Failed' }); }
});

module.exports = router;
