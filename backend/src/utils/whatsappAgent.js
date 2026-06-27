const { PrismaClient } = require('@prisma/client');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const axios = require('axios');

const prisma = new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL } } });

/**
 * Helper to send a text message via Meta WhatsApp Business Cloud API.
 * If credentials are not set, we mock the call successfully.
 */
async function sendWhatsAppMessage(toPhone, textMessage) {
    console.log(`[WhatsApp API Outgoing] Sending message to ${toPhone}: "${textMessage}"`);
    
    const whatsappToken = process.env.WHATSAPP_ACCESS_TOKEN;
    const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;

    if (!whatsappToken || !phoneId) {
        console.log('[WhatsApp API Outgoing] Credentials missing. Mocking success.');
        return { success: true, mock: true };
    }

    try {
        const url = `https://graph.facebook.com/v19.0/${phoneId}/messages`;
        const payload = {
            messaging_product: "whatsapp",
            recipient_type: "individual",
            to: toPhone,
            type: "text",
            text: {
                preview_url: false,
                body: textMessage
            }
        };

        const response = await axios.post(url, payload, {
            headers: {
                'Authorization': `Bearer ${whatsappToken}`,
                'Content-Type': 'application/json'
            }
        });

        console.log('[WhatsApp API Outgoing] Message sent successfully:', response.data);
        return { success: true, messageId: response.data?.messages?.[0]?.id };
    } catch (err) {
        console.error('[WhatsApp API Outgoing] Send failed:', err.response?.data || err.message);
        return { success: false, error: err.message };
    }
}

/**
 * WhatsApp AI Agent chat processor
 */
async function processIncomingMessage(phone, userMessage) {
    try {
        console.log(`[WhatsApp AI Agent] Processing message from ${phone}: "${userMessage}"`);

        // 1. Resolve or create Lead in database
        let lead = await prisma.lead.findFirst({
            where: { phone: { contains: phone } }
        });

        if (!lead) {
            console.log(`[WhatsApp AI Agent] Lead not found for phone ${phone}. Creating new lead...`);
            lead = await prisma.lead.create({
                data: {
                    name: `WhatsApp Lead (${phone.substring(phone.length - 4)})`,
                    phone: phone,
                    source: 'WHATSAPP',
                    status: 'NEW',
                    notes: 'Created automatically via incoming WhatsApp conversation.'
                }
            });
        }

        // 2. Query user/learning details if lead email is linked to a student
        let studentDetails = '';
        if (lead.email) {
            const user = await prisma.user.findUnique({
                where: { email: lead.email },
                include: {
                    enrollments: {
                        include: {
                            course: true
                        }
                    },
                    resume: true,
                    certificates: true
                }
            });

            if (user) {
                studentDetails = `
- Linked User Account: ${user.name} (Role: ${user.role})
- Active Enrollments: ${user.enrollments.map(e => `${e.course.title} (Progress: ${e.completedLessonsCount || 0} lessons)`).join(', ') || 'None'}
- Certificates Earned: ${user.certificates.map(c => c.courseTitle).join(', ') || 'None'}
- ATS Resume score: ${user.resume?.atsScore || 'Not built yet'}
`;
            }
        }

        // 3. Log the user's incoming message
        await prisma.whatsAppChatLog.create({
            data: {
                phone,
                sender: 'USER',
                message: userMessage,
                leadId: lead.id
            }
        });

        // 4. Fetch last 8 messages for context
        const historyLogs = await prisma.whatsAppChatLog.findMany({
            where: { phone },
            orderBy: { createdAt: 'desc' },
            take: 8
        });
        historyLogs.reverse();

        const historyPrompt = historyLogs.map(l => `${l.sender === 'USER' ? 'User' : 'Agent'}: ${l.message}`).join('\n');

        // 5. System instructions for AI Counselor
        const systemPrompt = `You are a helpful, professional, and career-focused AI counselor from Techwell LMS.
Techwell is a learning management system offering courses, practice quizzes, certificates, and an ATS resume builder (at 59 Rs for public users, free for enrolled students) to help students get jobs.

Student Context:
- Name: ${lead.name}
- Lifecycle Stage: ${lead.lifecycleStage}
- Qualification: ${lead.qualification || 'Not provided'}
- Interested Course: ${lead.courseName || 'None listed yet'}
- Revenue Generated: Rs. ${lead.revenueGenerated}
- Resume Built: ${lead.resumeBuilt ? 'Yes' : 'No'}
- Placement Status: ${lead.placementStatus || 'Seeking opportunities'}
${studentDetails}

Your Goal:
- Guide the student through their career journey (Learn -> Practice -> Get Certified -> Build ATS Resume -> Apply for Jobs).
- Help them enroll, answer questions, provide course info, or guide them to the resume builder.
- Keep replies brief, professional, and directly suited to WhatsApp (use *bold* for emphasis, bullet points where helpful). Keep responses under 150 words.
- Encourage them to proceed to the next step of their lifecycle (e.g. if they finished a course, encourage them to build their ATS resume; if they are new, tell them about courses).

Conversation History:
${historyPrompt}

Agent:`;

        // 6. Generate reply using Gemini
        const apiKey = process.env.GEMINI_API_KEY;
        let aiReply = "Thank you for messaging Techwell! Our career team will connect with you shortly.";

        if (apiKey) {
            try {
                const genAI = new GoogleGenerativeAI(apiKey);
                const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
                const result = await model.generateContent(systemPrompt);
                const text = result.response.text();
                if (text && text.trim()) {
                    aiReply = text.trim();
                }
            } catch (geminiErr) {
                console.error('[WhatsApp AI Agent] Gemini Generation failed:', geminiErr.message);
            }
        } else {
            console.warn('[WhatsApp AI Agent] GEMINI_API_KEY not configured. Using fallback reply.');
        }

        // 7. Save AI Agent's response to database
        await prisma.whatsAppChatLog.create({
            data: {
                phone,
                sender: 'AI_AGENT',
                message: aiReply,
                leadId: lead.id
            }
        });

        // 8. Deliver message back via WhatsApp
        await sendWhatsAppMessage(phone, aiReply);

        return { success: true, reply: aiReply, leadId: lead.id };
    } catch (error) {
        console.error('[WhatsApp AI Agent] Error handling incoming message:', error);
        return { success: false, error: error.message };
    }
}

module.exports = {
    sendWhatsAppMessage,
    processIncomingMessage
};
