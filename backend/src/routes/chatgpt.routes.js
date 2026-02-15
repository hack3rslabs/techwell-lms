const express = require('express');
const router = express.Router();
const OpenAI = require('openai');

// Initialize OpenAI
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

/**
 * @route   POST /api/chatgpt
 * @desc    Chat with ChatGPT (OpenAI API)
 * @access  Public
 */
router.post('/', async (req, res) => {
    try {
        const { messages } = req.body;

        if (!messages || !Array.isArray(messages)) {
            return res.status(400).json({ error: 'Messages array is required' });
        }

        if (!process.env.OPENAI_API_KEY) {
            return res.status(500).json({ error: 'OpenAI API key not configured' });
        }

        // Call OpenAI ChatGPT API
        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini", // or "gpt-4" for better quality
            messages: [
                {
                    role: "system",
                    content: `You are Techwell GPT, the official AI assistant for Techwell (training, placement, and career platform).
Your role:
- Guide students about courses, careers, interviews, and placements
- Explain Techwell services clearly and professionally
- Help with platform usage, admissions, and learning paths
- Be concise, accurate, and practical
- If the user shows interest in joining, suggest counseling politely
- Never hallucinate fees, placements, or guarantees
- If you don’t know something, say so and suggest contacting Techwell support
Tone: Professional, supportive, business-focused.`
                },
                ...messages
            ],
            temperature: 0.7,
            max_tokens: 500,
        });

        res.json({ message: completion.choices[0].message.content });

    } catch (error) {
        console.error('OpenAI Error:', error);

        // Fallback for Quota Exceeded or other API errors
        if (error.status === 429 || error.code === 'insufficient_quota') {
            return res.status(429).json({
                error: "I'm currently updating my knowledge base. Please try again in 5 minutes.",
                fallback: true
            });
        }

        if (error.status === 401) {
            return res.status(401).json({
                error: 'Invalid API key'
            });
        }

        res.status(500).json({
            error: 'Failed to get response from AI',
            details: error.message
        });
    }
});

module.exports = router;
