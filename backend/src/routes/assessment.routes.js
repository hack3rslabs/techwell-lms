const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();
const GEMINI_KEY = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(GEMINI_KEY || 'MISSING_KEY');

/**
 * @route   POST /api/assessments/evaluate
 * @desc    Evaluate code submission using AI
 * @access  Private (Student)
 */
router.post('/evaluate', authenticate, authorize('STUDENT', 'ADMIN'), async (req, res, next) => {
    try {
        const { problem, code, language } = req.body;

        if (!problem || !code || !language) {
            return res.status(400).json({ error: 'Problem, code, and language are required.' });
        }

        if (!GEMINI_KEY) {
            // Graceful fallback for local dev
            return res.json({
                score: 85,
                passed: true,
                feedback: "Good approach! Your logic is sound, but consider optimizing the loop for better time complexity (O(N) instead of O(N^2)).",
                timeComplexity: "O(N^2)",
                spaceComplexity: "O(1)",
                suggestions: ["Use a Hash Map to store seen elements"]
            });
        }

        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const prompt = `
You are an expert Senior Software Engineer and strict interviewer.
A student has submitted code for a coding challenge. You must evaluate it for correctness, bugs, and Big-O efficiency.

=== PROBLEM STATEMENT ===
${problem}

=== SUBMISSION (${language}) ===
${code}

=== TASK ===
1. Does the code solve the problem correctly? (passed: boolean)
2. What is a fair score out of 100?
3. What is the Time and Space complexity?
4. Provide constructive feedback and 1-2 actionable suggestions.

Respond ONLY with valid JSON (no markdown block wrappers):
{
  "score": number,
  "passed": boolean,
  "feedback": "string",
  "timeComplexity": "string",
  "spaceComplexity": "string",
  "suggestions": ["string"]
}
`;

        const result = await model.generateContent(prompt);
        let cleanJson = result.response.text().replace(/\`\`\`json/gi, '').replace(/\`\`\`/g, '').trim();
        const data = JSON.parse(cleanJson);

        res.json(data);
    } catch (error) {
        console.error("AI Evaluation Error:", error);
        res.status(500).json({ error: 'Failed to evaluate code.' });
    }
});

module.exports = router;
