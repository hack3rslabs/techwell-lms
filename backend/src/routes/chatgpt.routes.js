const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

/**
 * @route   POST /api/chatgpt
 * @desc    Chat with AI (Gemini Migration)
 * @access  Public
 */
router.post('/', async (req, res) => {
    try {
        const { messages } = req.body;

        if (!messages || !Array.isArray(messages)) {
            return res.status(400).json({ error: 'Messages array is required' });
        }

        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({ error: 'Gemini API key not configured' });
        }

        // System prompt context
        const systemPrompt = `You are Techwell GPT, the official AI assistant for Techwell. Guide students about courses, careers, and placements professionally. Be concise and practical.`;

        // Start chat with history
        const chat = model.startChat({
            history: messages.slice(0, -1).map(m => ({
                role: m.role === 'assistant' || m.role === 'model' ? 'model' : 'user',
                parts: [{ text: m.content }]
            })),
        });

        const lastMessage = messages[messages.length - 1].content;
        const prompt = `${systemPrompt}\n\nUser: ${lastMessage}`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        
        res.json({ message: response.text().trim() });

    } catch (error) {
        console.error('Gemini Error:', error);
        res.status(500).json({
            error: 'Failed to get response from AI',
            details: error.message
        });
    }
});

module.exports = router;
