const express = require('express');
const OpenAI = require('openai');
const { authenticate, authorize } = require('../middleware/auth');
const { PrismaClient } = require('@prisma/client');
const router = express.Router();
const prisma = new PrismaClient();

// Initialize OpenAI
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// Middleware to optionally authenticate (don't fail if no token)
const optionalAuth = (req, res, next) => {
    // Capture token from header if present
    const authHeader = req.headers['authorization'];
    if (authHeader) {
        authenticate(req, res, (err) => {
            // If valid token, req.user will be set. If invalid/expired, we treat as guest.
            if (err) {
                req.user = null;
            }
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
        // leadDetails: { name, email, phone } - Only required for FIRST Guest message
        const { message, history, leadDetails } = req.body;

        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        let userContext = "";
        let systemRole = "";

        // ==========================================
        // SCENARIO 1: LOGGED IN USER
        // ==========================================
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
            systemRole = `
            You are "TechWell Bot", a smart teaching assistant.
            - Answer course-specific questions based on their enrollment.
            - Provide technical guidance on the platform.
            - If stumped, refer to support ticket system.
            `;
        }

        // ==========================================
        // SCENARIO 2: GUEST (LEAD)
        // ==========================================
        else {
            // Check if we need to create a lead (only if details provided)
            if (leadDetails && leadDetails.name && (leadDetails.email || leadDetails.phone)) {
                try {
                    // Check if lead already exists (simple dedupe by email or phone)
                    let existingLead = null;
                    if (leadDetails.email) {
                        existingLead = await prisma.lead.findFirst({ where: { email: leadDetails.email } });
                    }

                    if (!existingLead) {
                        await prisma.lead.create({
                            data: {
                                name: leadDetails.name,
                                email: leadDetails.email || null,
                                phone: leadDetails.phone || null,
                                source: 'AI Chatbot',
                                status: 'NEW',
                                notes: `Initial query: ${message}`,
                                location: 'Auto-detected via Chat',
                            }
                        });
                        console.log("New Lead created from Chatbot:", leadDetails.name);
                    }
                } catch (err) {
                    console.error("Failed to create lead:", err);
                    // Continue chatting even if lead creation fails (don't block user)
                }
            }

            userContext = `User: Guest / Prospective Student. Name: ${leadDetails?.name || 'Visitor'}.`;
            systemRole = `
            You are Techwell GPT, the official AI assistant for Techwell.
            Your role:
            - Guide students about courses, careers, interviews, and placements
            - Explain Techwell services clearly and professionally
            - Help with platform usage, admissions, and learning paths
            - Be concise, accurate, and practical
            - If the user shows interest in joining, suggest counseling politely
            - Never hallucinate fees, placements, or guarantees
            - If you don’t know something, say so and suggest contacting Techwell support
            Tone: Professional, supportive, business-focused.
            `;
        }

        // ==========================================
        // AI GENERATION
        // ==========================================
        let aiResponse = "";

        if (process.env.OPENAI_API_KEY) {
            try {
                const messages = [
                    {
                        role: "system",
                        content: `${systemRole}\n${userContext}\n\nGuidelines:\n- Keep answers concise (max 3-4 sentences unless detailed explanation needed).\n- Use proper formatting (bullet points) if listing items.\n- Do NOT make up fake course prices if you don't know, just say "varies by course".`
                    }
                ];

                // Add history if provided
                if (history && Array.isArray(history)) {
                    history.forEach(h => {
                        if (h.role && h.parts && h.parts[0]) {
                            messages.push({
                                role: h.role === 'model' ? 'assistant' : 'user',
                                content: h.parts[0].text
                            });
                        }
                    });
                }

                messages.push({ role: "user", content: message });

                const completion = await openai.chat.completions.create({
                    model: "gpt-4o-mini",
                    messages: messages,
                    temperature: 0.7,
                    max_tokens: 500
                });

                aiResponse = completion.choices[0].message.content;
            } catch (aiError) {
                console.error("OpenAI Error:", aiError);
                aiResponse = "I'm having trouble connecting to my AI brain. Please try again!";
            }
        } else {
            console.warn("OPENAI_API_KEY missing");
            aiResponse = `[MOCK AI] Hello ${req.user ? req.user.name : (leadDetails?.name || 'Guest')}! I received: "${message}". I am simulating a response because the AI key is not configured.`;
        }

        res.json({ message: aiResponse });

    } catch (error) {
        console.error("AI Chat Error:", error);
        res.json({ message: "I'm having a brief brain freeze. Please type that again!" });
    }
});

/**
 * @route   POST /api/ai/draft-email
 * @desc    Generate a sales email based on lead info
 * @access  Private (Admins)
 */
router.post('/draft-email', authenticate, async (req, res) => {
    try {
        const { leadId, topic } = req.body;

        let context = "";
        if (leadId) {
            const lead = await prisma.lead.findUnique({ where: { id: leadId } });
            if (lead) {
                context = `Lead Name: ${lead.name}, Source: ${lead.source}, Notes: ${lead.notes}, Interest: ${lead.college || 'General'}`;
            }
        }

        const prompt = `
        You are a highly professional sales manager at "TechWell".
        Write a short, persuasive email to a potential student.
        
        Context:
        ${context}
        Topic: ${topic || 'Follow up on inquiry'}
        
        Format your response as valid JSON:
        {
          "subject": "Email Subject Line",
          "body": "Email Body Text (use \\n for new lines)"
        }
        `;

        if (!process.env.OPENAI_API_KEY) {
            return res.json({
                subject: "Follow up regarding your inquiry at TechWell",
                body: `Hello ${context ? context.split(',')[0].split(':')[1] : 'there'},\n\nI noticed you inquired about our courses. We have new batches starting soon!\n\nBest,\nTechWell Team`
            });
        }

        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.7,
            max_tokens: 300,
            response_format: { type: "json_object" }
        });

        const result = JSON.parse(completion.choices[0].message.content);
        res.json(result);

    } catch (error) {
        console.error("AI Draft Error:", error);

        // Fallback for Quota Exceeded
        if (error.status === 429 || error.code === 'insufficient_quota') {
            return res.json({
                subject: "Follow up regarding your inquiry at TechWell",
                body: `Hello ${context ? context.split(',')[0].split(':')[1] : 'there'},\n\nI noticed you inquired about our courses. We have new batches starting soon!\n\nBest,\nTechWell Team`,
                fallback: true
            });
        }

        res.status(500).json({ error: "Failed to draft email" });
    }
});

/**
 * @route   POST /api/ai/send-email (Simulated)
 */
router.post('/send-email', authenticate, async (req, res) => {
    const { to, subject, body } = req.body;
    console.log("======================================");
    console.log(`[MOCK EMAIL SENT]`);
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Body: ${body}`);
    console.log("======================================");

    // Simulate delay
    setTimeout(() => {
        res.json({ success: true, message: "Email sent successfully (Simulated)" });
    }, 1000);
});

// Generate Interview Questions (Admin)
router.post('/generate-questions', authenticate, async (req, res) => {
    try {
        const { domain, role, company, difficulty, count } = req.body;
        const aiService = require('../services/ai.service');

        const questions = await aiService.generateInterviewQuestions({
            domain,
            role,
            company,
            difficulty,
            count
        });

        res.json({ questions });
    } catch (error) {
        console.error('Generation Error:', error);
        res.status(500).json({ error: 'Failed to generate questions' });
    }
});

/**
 * @route   POST /api/ai/generate-from-jd
 * @desc    Generate questions from Job Description context
 * @access  Private (Admin)
 */
router.post('/generate-from-jd', authenticate, authorize(['ADMIN', 'SUPER_ADMIN']), async (req, res) => {
    try {
        const { context, domain, role, difficulty, count } = req.body;
        const aiService = require('../services/ai.service');

        const questions = await aiService.generateQuestionsFromContext({
            context,
            domain,
            role,
            difficulty,
            count
        });

        res.json({ questions });
    } catch (error) {
        console.error('JD Generation Error:', error);
        res.status(500).json({ error: 'Failed to generate from context' });
    }
});

module.exports = router;
