const express = require('express');
const { authenticate } = require('../middleware/auth');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const router = express.Router();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * @route   POST /api/linkedin/analyze
 * @desc    Analyze a LinkedIn profile text for a target role
 * @access  Private (Student)
 */
router.post('/analyze', authenticate, async (req, res, next) => {
    try {
        const { profileText, targetRole } = req.body;

        if (!profileText || !targetRole) {
            return res.status(400).json({ error: 'profileText and targetRole are required.' });
        }

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `
        You are an expert LinkedIn Profile Optimizer and Tech Career Coach.
        I will provide you with a user's LinkedIn profile text (usually copy-pasted 'About' and 'Experience' sections) and their target role.
        Analyze their profile and return a JSON object with EXACTLY this structure:
        {
            "headlineScore": <number 0-100>,
            "summaryScore": <number 0-100>,
            "suggestedHeadline": "<string containing a highly optimized LinkedIn headline>",
            "suggestions": [<array of string sentences giving actionable advice to improve the profile for the target role>]
        }

        Do not include markdown blocks, just return raw valid JSON.

        === TARGET ROLE ===
        ${targetRole}

        === LINKEDIN PROFILE ===
        ${profileText}
        `;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        const cleanJson = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();
        const data = JSON.parse(cleanJson);

        res.json({ success: true, data });
    } catch (error) {
        console.error('LinkedIn Analyzer Error:', error);
        res.status(500).json({ error: 'Failed to analyze LinkedIn profile' });
    }
});

module.exports = router;
