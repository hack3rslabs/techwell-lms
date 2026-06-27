const express = require('express');
const { authenticate } = require('../middleware/auth');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const router = express.Router();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * @route   POST /api/ats-checker/analyze
 * @desc    Analyze a resume against a Job Description
 * @access  Private (Student)
 */
router.post('/analyze', authenticate, async (req, res, next) => {
    try {
        const { resumeText, jobDescription } = req.body;

        if (!resumeText || !jobDescription) {
            return res.status(400).json({ error: 'resumeText and jobDescription are required.' });
        }

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `
        You are an expert ATS (Applicant Tracking System) software and Senior Technical Recruiter.
        I will provide you with a Resume and a Job Description. 
        Analyze the resume strictly against the JD and return a JSON object with EXACTLY this structure:
        {
            "score": <number between 0-100 representing the match percentage>,
            "matchingKeywords": [<array of important strings found in both>],
            "missingKeywords": [<array of important strings found in JD but missing from resume>],
            "recommendations": [<array of string sentences giving actionable advice to improve the resume for this specific JD>]
        }

        Do not include markdown blocks, just return raw valid JSON.

        === RESUME ===
        ${resumeText}

        === JOB DESCRIPTION ===
        ${jobDescription}
        `;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        const cleanJson = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();
        const data = JSON.parse(cleanJson);

        res.json({ success: true, data });
    } catch (error) {
        console.error('ATS Checker Error:', error);
        res.status(500).json({ error: 'Failed to analyze resume' });
    }
});

module.exports = router;
