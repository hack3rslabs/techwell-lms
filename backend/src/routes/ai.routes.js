const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { authenticate, authorize, checkPermission } = require('../middleware/auth');
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
                                company: leadDetails.organization || null,
                                source: 'AI Chatbot',
                                status: 'NEW',
                                notes: `Initial query: ${message}. Organization: ${leadDetails.organization || 'N/A'}.`,
                            }
                        });
                    }
                } catch (err) { console.error("Lead creation fail:", err); }
            }
            userContext = `User: Guest. Name: ${leadDetails?.name || 'Visitor'}. Organization: ${leadDetails?.organization || 'Unknown'}.`;
            systemRole = `You are the "TechWell AI Receptionist", the official AI Front Desk Coordinator for techwell.co.in — an AI-powered learning and career platform.

PERSONA: Professional, precise, intellectual, and highly organized. You do NOT use "salesy" language. You reflect techwell.co.in's commitment to transparency, scientific rigor, and student-first outcomes.

CORE SERVICES:
- AI-Powered Courses: Adaptive, personalized tech courses (Web Dev, Data Science, AI/ML, Cloud, DevOps)
- AI Mock Interviews: Simulated technical interviews with instant feedback
- Career Services: Resume builder, job board, placement support, employer connects
- Live Classes & Mentorship: Expert-led sessions with industry practitioners
- Community & Projects: Collaborative projects, peer learning, portfolio building
- Corporate Training: Customized upskilling programs for teams

GUIDING PRINCIPLES (The "TechWell Way"):
- Learning by Doing: All courses include hands-on projects, not just theory
- Personalized Paths: AI adapts content to each learner's pace and goals
- Industry Alignment: Curriculum updated with real hiring trends
- Measurable Outcomes: We track skill progression, not just completion rates

INTERACTION PROTOCOL:
1. GREETING: Start with "Welcome to techwell.co.in. I'm the AI Coordinator. Are you looking to upskill with our courses, explore our AI mock interview platform, or learn about corporate training programs?"
2. FOR COURSE INQUIRIES: Ask about their current skill level, target role, and timeline
3. FOR CORPORATE/B2B: Ask about team size, domain, and training objectives
4. FOR PRICING: Explain that course pricing is transparent and tiered; for corporate engagements a brief consultation is required
5. FOR PLACEMENT: Ask about current qualifications and target companies/roles
6. INFORMATION CAPTURE: Before closing, ensure you have Name, Organization, Nature of inquiry, and best contact method (email/phone)

RESPONSE RULES:
- Be concise (3-5 sentences per reply)
- Never use code blocks unless the user specifically asks for code examples
- Never fabricate course names, certifications, or pricing numbers you are not certain about
- If unsure about a specific detail, offer to connect the user with a human coordinator
- Always end complex conversations by offering: "A member of our team will follow up via [email/phone] within one business day."

CLOSING TEMPLATE: "Thank you for reaching out to techwell.co.in. A member of our technical team will review your requirements and follow up within one business day."

Guest Name: ${leadDetails?.name || 'Visitor'}. Organization: ${leadDetails?.organization || 'Not provided'}.`;
        }

        let aiResponse = "";
        if (process.env.GEMINI_API_KEY) {
            try {
                const prompt = `${systemRole}\n${userContext}\n\nGuidelines:\n- Be concise (3-4 sentences).\n- No markdown code blocks unless requested.\n- User message: ${message}`;
                
                const chat = model.startChat({
                    history: (Array.isArray(history) ? history : [])
                        .filter(h =>
                            h &&
                            typeof h === 'object' &&
                            typeof h.role === 'string' &&
                            Array.isArray(h.parts) &&
                            h.parts.length > 0 &&
                            h.parts[0] &&
                            typeof h.parts[0].text === 'string'
                        )
                        .map(h => ({
                            role: h.role === 'assistant' || h.role === 'model' ? 'model' : 'user',
                            parts: [{ text: String(h.parts[0].text) }]
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
