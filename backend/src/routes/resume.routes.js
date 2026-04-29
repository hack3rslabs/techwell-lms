const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL } } });

/**
 * @route   GET /api/resume
 * @desc    Get the current user's saved resume data
 * @access  Private
 */
router.get('/', authenticate, async (req, res, next) => {
    try {
        const userId = req.user.id;
        
        const resume = await prisma.resume.findUnique({
            where: { userId }
        });

        if (!resume) {
            return res.status(200).json({ exists: false, resume: null });
        }

        return res.status(200).json({ exists: true, resume: resume.data });
    } catch (error) {
        next(error);
    }
});

/**
 * @route   POST /api/resume
 * @desc    Create or update the user's resume data
 * @access  Private
 */
router.post('/', authenticate, async (req, res, next) => {
    try {
        const userId = req.user.id;
        const resumeData = req.body;
        
        const upsertResume = await prisma.resume.upsert({
            where: {
                userId: userId,
            },
            update: {
                data: resumeData,
            },
            create: {
                userId: userId,
                data: resumeData,
            },
        });

        return res.status(200).json({ message: 'Resume synchronized successfully', resume: upsertResume.data });
    } catch (error) {
        next(error);
    }
});

/**
 * @route   POST /api/resume/enhance
 * @desc    Enhance resume data using AI Expert
 * @access  Private
 */
router.post('/enhance', authenticate, async (req, res, next) => {
    try {
        const resumeData = req.body;
        const { GoogleGenerativeAI } = require('@google/generative-ai');
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        let personaPrompt = "";
        
        switch (resumeData.template) {
            case "modern":
                personaPrompt = `Act as a Senior Technical Recruiter. Create an ATS-optimized result focusing on a Modern Tech persona (DevOps/IT). 
Rewrite the Professional Experience using the CAR method (Challenge, Action, Result). Ensure technical tools and skills are highlighted prominently.`;
                break;
            case "professional":
                personaPrompt = `Act as a Classic Corporate Recruiter (Management/Admin). Generate a high-parsing ATS resume with a clear hierarchy. 
Focus on categorizing skills into 'Technical' and 'Functional'. For the Experience section, rewrite bullet points to start with strong action verbs (e.g., 'Spearheaded,' 'Optimized,' 'Engineered').`;
                break;
            case "minimal":
                personaPrompt = `Act as an ATS Expert. Create a Skill-Centric resume optimized for Career Switchers. 
Focus heavily on the 'Technical Proficiencies' and group skills by domain (e.g., Security Tools, Frameworks, Scripting). Ensure all project descriptions clearly define the 'Tech Stack' used.`;
                break;
            case "ats1":
                personaPrompt = `Act as an Senior Corporate Recruiter and ATS Optimization Expert. Your mission is to generate a high-parsing, result-oriented resume data structure. 
Follow these guidelines for the 'ats1' layout:
- In Professional Experience, every bullet point must follow the 'Action Verb + Measured Task + Business Result' formula.
- Group the 'skills' into logical technical domains (e.g., Programming, Cloud, Tools).
- Use dense, keyword-rich language for the Professional Summary to ensure maximum ranking in Applicant Tracking Systems.`;
                break;
            case "executive":
                personaPrompt = `Act as an Executive Resume Writer. Your target remains senior leadership (C-suite, VPs, Directors).
Focus on:
- High-level strategic impact and multi-million dollar KPIs.
- Leadership, stakeholder management, and organizational transformation.
- A sophisticated, authoritative tone. Ensure bullet points highlight 'Lead,' 'Architected,' 'Spearheaded,' and 'Transformed'.`;
                break;
            case "creative":
                personaPrompt = `Act as a Creative Brand Strategist and Resume Expert. 
Focus on:
- Storytelling and personal branding within the Professional Summary.
- Highlighting unique value propositions beyond just technical skills.
- A modern, engaging, and innovative tone. Ensure project descriptions sound like 'Launch' and 'Brand Impact' stories.`;
                break;
            case "classic":
                personaPrompt = `Act as a senior corporate recruiter and ATS optimization expert. Your task is to generate a highly professional, ATS-compliant resume with a clean, traditional corporate format.
Follow these STRICT FORMAT RULES: No profile photo, No icons/graphics, No tables/columns, Plain text, single-column layout, Standard corporate headings only, Consistent spacing and alignment.
For Experience, follow CAR format: Action Verb + Responsibility + Tool/Skill + Measurable Result.`;
                break;
            default:
                personaPrompt = `Act as a Resume Expert. Refine this resume for clarity, professionalism, and industry-standard ATS keyword optimization.`;
                break;
        }

        const prompt = `${personaPrompt}

Your task is to refine the provided resume data to enhance its appeal and compatibility with Applicant Tracking Systems.

Rules:
- Maintain a professional tone throughout.
- Use industry-relevant keywords and phrases based on the requested persona.
- Ensure the resume is succinct and well-organized. 
- IMPORTANT: You MUST return the enhanced resume in EXACTLY the same JSON structure provided. Do not invent new fields. Output pure JSON without markdown wrappers (no \`\`\`json).

Original Resume Data (JSON):
${JSON.stringify(resumeData, null, 2)}
`;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        
        // Strip markdown if AI stubbornly includes it
        let cleanJson = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();
        const enhancedData = JSON.parse(cleanJson);

        return res.status(200).json({ enhancedResume: enhancedData });
    } catch (error) {
        console.error('Enhance Resume Error:', error);
        return res.status(500).json({ error: 'Failed to enhance resume' });
    }
});

module.exports = router;
