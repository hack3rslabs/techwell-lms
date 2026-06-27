const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL } } });

/**
 * Helper: Ensure the special resume-builder course product exists in the DB
 */
const ensureResumeCourse = async () => {
    try {
        const existing = await prisma.course.findUnique({ where: { id: 'resume-builder' } });
        if (!existing) {
            // Find an instructor or super admin to assign to the course
            const instructor = await prisma.user.findFirst({ where: { role: 'INSTRUCTOR' } }) 
                || await prisma.user.findFirst({ where: { role: 'SUPER_ADMIN' } });
            
            if (!instructor) {
                console.warn("No instructor or admin found to assign to resume-builder course.");
                return;
            }
            
            await prisma.course.create({
                data: {
                    id: 'resume-builder',
                    title: 'ATS Resume Builder Unlock',
                    description: 'Unlock unlimited ATS resume builder access, downloads, and AI enhancement.',
                    price: 59,
                    category: 'General',
                    isPublished: true,
                    instructorId: instructor.id,
                    duration: 0
                }
            });
            console.log("✅ Seeded resume-builder course product");
        }
    } catch (e) {
        console.error("Failed to seed resume-builder course:", e);
    }
};

/**
 * Helper: Check if user has paid access to the resume builder
 * Paid access means enrolled in ANY course (paid or free) or has purchased the resume-builder unlock within 90 days (3 months).
 */
const checkResumeAccess = async (userId) => {
    await ensureResumeCourse();
    const enrollments = await prisma.enrollment.findMany({
        where: {
            userId,
            status: 'ACTIVE'
        }
    });

    const hasPaidCourse = enrollments.some(e => e.courseId !== 'resume-builder');
    if (hasPaidCourse) return true;

    const resumeEnrollment = enrollments.find(e => e.courseId === 'resume-builder');
    if (resumeEnrollment) {
        const enrolledAt = new Date(resumeEnrollment.enrolledAt);
        const now = new Date();
        const diffDays = Math.ceil(Math.abs(now.getTime() - enrolledAt.getTime()) / (1000 * 60 * 60 * 24));
        return diffDays <= 90; // valid for 90 days
    }

    return false;
};

/**
 * @route   GET /api/resume/check-access
 * @desc    Check if current user has paid access to the resume builder (with 3 months expiry check)
 * @access  Private
 */
router.get('/check-access', authenticate, async (req, res, next) => {
    try {
        await ensureResumeCourse();
        const userId = req.user.id;

        const enrollments = await prisma.enrollment.findMany({
            where: {
                userId,
                status: 'ACTIVE'
            },
            include: {
                course: true
            }
        });

        const hasPaidCourse = enrollments.some(e => e.courseId !== 'resume-builder');
        const resumeEnrollment = enrollments.find(e => e.courseId === 'resume-builder');
        
        let hasPaidResume = false;
        let isExpired = false;
        let daysRemaining = 0;

        if (resumeEnrollment) {
            const enrolledAt = new Date(resumeEnrollment.enrolledAt);
            const now = new Date();
            const diffDays = Math.ceil(Math.abs(now.getTime() - enrolledAt.getTime()) / (1000 * 60 * 60 * 24));
            if (diffDays <= 90) {
                hasPaidResume = true;
                daysRemaining = 90 - diffDays;
            } else {
                isExpired = true;
            }
        }

        const hasAccess = hasPaidCourse || hasPaidResume;

        return res.status(200).json({
            hasAccess,
            price: 59,
            hasPaidCourse,
            hasPaidResume,
            isExpired,
            daysRemaining,
            validityMonths: 3
        });
    } catch (error) {
        next(error);
    }
});

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
        const hasAccess = await checkResumeAccess(userId);
        if (!hasAccess) {
            return res.status(403).json({ 
                error: "Access Denied", 
                requiresPayment: true, 
                message: "Please unlock the Resume Builder or enroll in a course to save your progress." 
            });
        }

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

        // Update lead lifecycle stage
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { email: true, phone: true, name: true }
        });

        if (user) {
            const lead = await prisma.lead.findFirst({
                where: {
                    OR: [
                        user.email ? { email: user.email } : null,
                        user.phone ? { phone: { contains: user.phone } } : null
                    ].filter(Boolean)
                }
            });

            if (lead) {
                const wasBuilt = lead.resumeBuilt;
                await prisma.lead.update({
                    where: { id: lead.id },
                    data: {
                        lifecycleStage: 'RESUME_BUILT',
                        resumeBuilt: true
                    }
                });

                if (user.phone && !wasBuilt) {
                    const { sendWhatsAppMessage } = require('../utils/whatsappAgent');
                    sendWhatsAppMessage(user.phone, `Hi *${user.name}*! Congratulations on building your professional ATS resume at Techwell. 📄 Next, let us know if you want us to match you with active recruiter openings or start mock interview practices!`)
                        .catch(err => console.error('[WhatsApp Resume Built Notice Failed]:', err.message));
                }
            }
        }

        return res.status(200).json({ message: 'Resume synchronized successfully', resume: upsertResume.data });
    } catch (error) {
        next(error);
    }
});

/**
 * @route   POST /api/resume/enhance
 * @desc    Enhance resume data using AI Expert tailored to JD and designation
 * @access  Private
 */
router.post('/enhance', authenticate, async (req, res, next) => {
    try {
        const userId = req.user.id;
        const hasAccess = await checkResumeAccess(userId);
        if (!hasAccess) {
            return res.status(403).json({ 
                error: "Access Denied", 
                requiresPayment: true, 
                message: "Please unlock the Resume Builder or enroll in a course to enhance your resume." 
            });
        }

        const { resumeData, jd, designation } = req.body;
        if (!resumeData) {
            return res.status(400).json({ error: "resumeData is required" });
        }

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

        if (designation) {
            personaPrompt += `\nTarget Designation: "${designation}". Tailor the job titles, summary, and skills to match this role closely.`;
        }
        if (jd) {
            personaPrompt += `\nTarget Job Description (JD): "${jd}". Extract key technical and soft skills, tools, and experience requirements, and weave them into the summary, experience descriptions, and skills list to maximize the ATS score.`;
        }

        const prompt = `${personaPrompt}

Your task is to refine the provided resume data to enhance its appeal and compatibility with Applicant Tracking Systems.

Rules:
- Maintain a professional tone throughout.
- Use industry-relevant keywords and phrases based on the requested persona, JD, and designation.
- Ensure the resume is succinct and well-organized. 
- IMPORTANT: You MUST return the enhanced resume in EXACTLY the same JSON structure provided. Do not invent new fields. Output pure JSON without markdown wrappers (no \`\`\`json).

Original Resume Data (JSON):
${JSON.stringify(resumeData, null, 2)}
`;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        
        let cleanJson = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();
        const enhancedData = JSON.parse(cleanJson);

        return res.status(200).json({ enhancedResume: enhancedData });
    } catch (error) {
        console.error('Enhance Resume Error:', error);
        return res.status(500).json({ error: 'Failed to enhance resume' });
    }
});

module.exports = router;

