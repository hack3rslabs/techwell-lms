const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { authenticate, checkPermission } = require('../middleware/auth');
const router = express.Router();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

/**
 * Helper to call Gemini securely
 */
async function callGemini(prompt, systemInstruction = "You are an expert AI Blog Writer and SEO Executive.") {
    if (!process.env.GEMINI_API_KEY) {
        throw new Error("GEMINI_API_KEY is not configured.");
    }
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        systemInstruction: { role: "system", parts: [{ text: systemInstruction }] }
    });
    return result.response.text();
}

/**
 * @route   POST /api/ai/blog/seo
 * @desc    Generate SEO fields (Title, Meta Description, Keywords, Schema)
 */
router.post('/seo', authenticate, checkPermission('BLOGS'), async (req, res) => {
    try {
        const { content, title } = req.body;
        if (!content) return res.status(400).json({ error: "Content is required to generate SEO data." });

        const prompt = `Analyze this blog post and generate SEO metadata. 
Title: ${title || 'Not provided'}
Content snippet: ${String(content || "").substring(0, 3000)}

Return EXACTLY a JSON object with this structure:
{
    "metaTitle": "Highly clickable SEO title (max 60 chars)",
    "metaDescription": "Compelling meta description (max 155 chars)",
    "keywords": ["array", "of", "relevant", "seo", "keywords"],
    "slug": "url-friendly-slug-with-keywords",
    "faqSchema": {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
            {"@type": "Question", "name": "...", "acceptedAnswer": {"@type": "Answer", "text": "..."}}
        ]
    }
}
Do NOT wrap the JSON in markdown formatting block (\`\`\`json). Return strictly the raw JSON.`;

        const responseText = await callGemini(prompt);
        const seoData = JSON.parse(String(responseText || '').trim().replace(/^```json|```$/gi, ''));
        res.json(seoData);
    } catch (error) {
        console.error("AI SEO Error:", error);
        res.status(500).json({ error: "Failed to generate SEO metadata." });
    }
});

/**
 * @route   POST /api/ai/blog/rewrite
 * @desc    Rewrite, Grammar Check, or Summarize Content
 */
router.post('/rewrite', authenticate, checkPermission('BLOGS'), async (req, res) => {
    try {
        const { text, mode } = req.body; // mode: 'GRAMMAR', 'REWRITE', 'SUMMARY', 'EXPAND'
        if (!text) return res.status(400).json({ error: "Text is required." });

        let instruction = "You are a professional editor.";
        if (mode === 'GRAMMAR') instruction = "Fix all grammar, spelling, and punctuation errors. Preserve the original tone and HTML formatting. Return only the corrected text.";
        if (mode === 'REWRITE') instruction = "Rewrite the provided text to be more engaging and professional. Preserve HTML formatting. Return only the rewritten text.";
        if (mode === 'SUMMARY') instruction = "Provide a concise 2-3 sentence summary of the provided text. No HTML formatting.";
        if (mode === 'EXPAND') instruction = "Expand on the provided text, adding professional context and detail. Preserve HTML formatting.";

        const prompt = `Task: ${instruction}\n\nText:\n${text}`;
        
        const responseText = await callGemini(prompt);
        res.json({ result: String(responseText || '').trim() });
    } catch (error) {
        console.error("AI Rewrite Error:", error);
        res.status(500).json({ error: "Failed to process text." });
    }
});

/**
 * @route   POST /api/ai/blog/score
 * @desc    Get Readability & Content SEO Score
 */
router.post('/score', authenticate, checkPermission('BLOGS'), async (req, res) => {
    try {
        const { content } = req.body;
        if (!content) return res.status(400).json({ error: "Content is required." });

        const prompt = `Analyze this blog post content for Readability and SEO structure.
Return EXACTLY a JSON object:
{
    "score": 85, // 0-100 overall score
    "readability": "8th Grade Level",
    "improvements": [
        "Use shorter sentences.",
        "Add more H2 headings."
    ]
}
Content snippet: ${String(content || "").substring(0, 2000)}
Do NOT wrap the JSON in markdown formatting block. Return strictly the raw JSON.`;

        const responseText = await callGemini(prompt);
        const scoreData = JSON.parse(String(responseText || '').trim().replace(/^```json|```$/gi, ''));
        res.json(scoreData);
    } catch (error) {
        console.error("AI Score Error:", error);
        res.status(500).json({ error: "Failed to analyze content score." });
    }
});

module.exports = router;
