const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate, authorize } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const WhatsAppService = require('../utils/whatsapp');

const router = express.Router();
const prisma = new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL } } });

async function requireApprovedEmployer(req, res, next) {
    if (['ADMIN', 'SUPER_ADMIN'].includes(req.user.role)) return next();
    try {
        const profile = await prisma.employerProfile.findUnique({
            where: { userId: req.user.id },
            select: { status: true }
        });
        if (!profile || profile.status !== 'APPROVED') {
            return res.status(403).json({ error: 'Employer approval is required.' });
        }
        return next();
    } catch (error) {
        return next(error);
    }
}

/**
 * @route   GET /api/jobs
 * @desc    List public jobs
 * @access  Public
 */
router.get('/', async (req, res, next) => {
    try {
        let { type, location, search, skills } = req.query;
    if (type !== undefined) type = Array.isArray(type) ? type[0] : String(type);
    if (location !== undefined) location = Array.isArray(location) ? location[0] : String(location);
    if (search !== undefined) search = Array.isArray(search) ? search[0] : String(search);
    if (skills !== undefined) skills = Array.isArray(skills) ? skills[0] : String(skills);

        const where = { status: { in: ['OPEN', 'PUBLISHED'] } };
        if (type) where.type = type;
        if (location) where.location = { contains: location, mode: 'insensitive' };
        if (search) {
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
                { skills: { contains: search, mode: 'insensitive' } }
            ];
        }
        if (skills) {
            where.skills = { contains: skills, mode: 'insensitive' };
        }

        const jobs = await prisma.job.findMany({
            where,
            include: {
                employer: {
                    select: {
                        name: true,
                        employerProfile: { select: { companyName: true, logo: true, website: true } }
                    }
                },
                _count: { select: { applications: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(jobs);
    } catch (error) {
        next(error);
    }
});

/**
 * @route   GET /api/jobs/admin/listings
 * @desc    Admin: list all jobs
 * @access  Private (Admin, Employer)
 */
router.get('/admin/listings', authenticate, authorize('EMPLOYER', 'ADMIN', 'SUPER_ADMIN', 'STAFF', 'INSTITUTE_ADMIN', 'INSTRUCTOR', 'FRANCHISE_STAFF', 'FRANCHISE_TRAINER'), async (req, res, next) => {
    try {
        const isAdmin = ['ADMIN', 'SUPER_ADMIN'].includes(req.user.role);
        const where = isAdmin ? {} : { employerId: req.user.id };

        const jobs = await prisma.job.findMany({
            where,
            include: {
                employer: {
                    select: {
                        name: true,
                        employerProfile: { select: { companyName: true, logo: true } }
                    }
                },
                _count: { select: { applications: true } },
                applications: { select: { status: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(jobs);
    } catch (error) {
        next(error);
    }
});

/**
 * @route   GET /api/jobs/my/listings
 * @desc    Get my posted jobs (Employer)
 */
router.get('/my/listings', authenticate, authorize('EMPLOYER', 'ADMIN', 'SUPER_ADMIN', 'STAFF', 'INSTITUTE_ADMIN', 'INSTRUCTOR', 'FRANCHISE_STAFF', 'FRANCHISE_TRAINER'), requireApprovedEmployer, async (req, res, next) => {
    try {
        const isAdmin = ['ADMIN', 'SUPER_ADMIN'].includes(req.user.role);
        const where = isAdmin ? {} : { employerId: req.user.id };

        const jobs = await prisma.job.findMany({
            where,
            include: {
                _count: { select: { applications: true } },
                applications: { select: { status: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(jobs);
    } catch (error) {
        next(error);
    }
});

/**
 * @route   GET /api/jobs/my/listings/:id
 */
router.get('/my/listings/:id', authenticate, authorize('EMPLOYER', 'ADMIN', 'SUPER_ADMIN', 'STAFF', 'INSTITUTE_ADMIN', 'INSTRUCTOR', 'FRANCHISE_STAFF', 'FRANCHISE_TRAINER'), requireApprovedEmployer, async (req, res, next) => {
    try {
        const isAdmin = ['ADMIN', 'SUPER_ADMIN'].includes(req.user.role);
        const job = await prisma.job.findFirst({
            where: {
                id: req.params.id,
                ...(isAdmin ? {} : { employerId: req.user.id })
            },
            include: { _count: { select: { applications: true } } }
        });
        if (!job) return res.status(404).json({ error: 'Job not found' });
        return res.json(job);
    } catch (error) {
        return next(error);
    }
});

/**
 * @route   GET /api/jobs/applications/me
 * @desc    Get my applications (Student)
 */
router.get('/applications/me', authenticate, async (req, res, next) => {
    try {
        const applications = await prisma.jobApplication.findMany({
            where: { applicantId: req.user.id },
            include: {
                job: {
                    select: {
                        id: true,
                        title: true,
                        location: true,
                        type: true,
                        salary: true,
                        skills: true,
                        employer: {
                            select: {
                                name: true,
                                employerProfile: { select: { companyName: true, logo: true } }
                            }
                        }
                    }
                },
                interviews: {
                    orderBy: { scheduledAt: 'asc' }
                },
                offers: {
                    orderBy: { createdAt: 'desc' }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(applications);
    } catch (error) {
        next(error);
    }
});

/**
 * @route   GET /api/jobs/applications/:appId/timeline
 * @desc    Get full timeline for an application
 */
router.get('/applications/:appId/timeline', authenticate, async (req, res, next) => {
    try {
        const application = await prisma.jobApplication.findUnique({
            where: { id: req.params.appId },
            include: {
                job: {
                    select: {
                        id: true, title: true, location: true, type: true,
                        employer: {
                            select: {
                                name: true,
                                employerProfile: { select: { companyName: true, logo: true } }
                            }
                        }
                    }
                },
                applicant: { select: { name: true, email: true, avatar: true } },
                interviews: { orderBy: { scheduledAt: 'asc' } },
                offers: { orderBy: { createdAt: 'desc' } }
            }
        });
        if (!application) return res.status(404).json({ error: 'Application not found' });

        // Access check
        const isAdmin = ['ADMIN', 'SUPER_ADMIN'].includes(req.user.role);
        if (!isAdmin && application.applicantId !== req.user.id) {
            const job = await prisma.job.findUnique({ where: { id: application.jobId } });
            if (!job || job.employerId !== req.user.id) {
                return res.status(403).json({ error: 'Access denied' });
            }
        }

        res.json(application);
    } catch (error) {
        next(error);
    }
});

/**
 * @route   GET /api/jobs/:id
 * @desc    Get job details
 */
router.get('/:id', async (req, res, next) => {
    try {
        const job = await prisma.job.findFirst({
            where: { id: req.params.id, status: { in: ['OPEN', 'PUBLISHED'] } },
            include: {
                employer: {
                    select: {
                        name: true,
                        employerProfile: { select: { companyName: true, logo: true, description: true, website: true } }
                    }
                }
            }
        });
        if (!job) return res.status(404).json({ error: 'Job not found' });
        res.json(job);
    } catch (error) {
        next(error);
    }
});

/**
 * @route   GET /api/jobs/:id/match
 * @desc    Get AI-driven ATS match score for the current student
 */
router.get('/:id/match', authenticate, async (req, res, next) => {
    try {
        const job = await prisma.job.findUnique({ where: { id: req.params.id } });
        if (!job) return res.status(404).json({ error: 'Job not found' });

        const profile = await prisma.candidateProfile.findUnique({
            where: { userId: req.user.id }
        });

        if (!profile || !profile.resumeUrl) {
            return res.json({ matchScore: null, message: 'Please upload a resume in your profile to see ATS Match Score.' });
        }

        const AIService = require('../services/ai.service');
        const aiService = new AIService();

        const resumeText = await aiService.extractTextFromPDF(profile.resumeUrl);
        if (!resumeText) {
             return res.json({ matchScore: null, message: 'Could not extract text from your resume.' });
        }

        const prompt = `Act as an ATS (Applicant Tracking System). Compare this Candidate Resume to the Job Description and return a JSON evaluation.
        
        Job Title: ${job.title}
        Job Description: ${job.description}
        Job Skills: ${job.skills || 'Not specified'}

        Candidate Resume:
        ${resumeText}

        Return ONLY a JSON object:
        {
            "matchScore": 75,
            "matchedKeywords": ["string"],
            "missingKeywords": ["string"],
            "briefFeedback": "string"
        }`;

        const responseText = await aiService.generateWithAIProvider(prompt);
        let jsonStr = String(responseText || '').trim();
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) jsonStr = jsonMatch[0];
        
        try {
            const result = JSON.parse(jsonStr.replace(/```json|```/gi, '').trim());
            res.json(result);
        } catch(e) {
            res.json({ matchScore: 50, message: 'Error parsing AI response', matchedKeywords: [], missingKeywords: [] });
        }
    } catch (error) {
        next(error);
    }
});

/**
 * @route   POST /api/jobs
 * @desc    Post a new job
 */
router.post('/', authenticate, authorize('EMPLOYER', 'ADMIN', 'SUPER_ADMIN', 'STAFF', 'INSTITUTE_ADMIN', 'INSTRUCTOR', 'FRANCHISE_STAFF', 'FRANCHISE_TRAINER'), requireApprovedEmployer, async (req, res, next) => {
    try {
        const { title, description, requirements, location, type, experience, salary, skills, clientName, shift, qualification, domain, expiresAt } = req.body;
        if (!(typeof title === "string" ? title.trim() : "") || !(typeof description === "string" ? description.trim() : "") || !(typeof location === "string" ? location.trim() : "")) {
            return res.status(400).json({ error: 'Title, description, and location are required.' });
        }
        const job = await prisma.job.create({
            data: {
                title, description, requirements, location, type, experience, salary,
                skills, clientName, shift, qualification, domain,
                expiresAt: expiresAt ? new Date(expiresAt) : null,
                employerId: req.user.id,
                status: 'OPEN'
            }
        });
        res.status(201).json(job);
    } catch (error) {
        next(error);
    }
});

/**
 * @route   POST /api/jobs/:id/apply
 * @desc    Apply for a job (Student)
 */
router.post('/:id/apply', authenticate, async (req, res, next) => {
    try {
        const { resumeUrl, coverLetter } = req.body;
        const jobId = req.params.id;

        const job = await prisma.job.findUnique({ where: { id: jobId } });
        if (!job || !['OPEN', 'PUBLISHED'].includes(job.status)) {
            return res.status(404).json({ error: 'Job not found or not accepting applications' });
        }

        // If job has a linkedCourse, verify enrollment
        if (job.linkedCourseId) {
            const enrollment = await prisma.enrollment.findUnique({
                where: { userId_courseId: { userId: req.user.id, courseId: job.linkedCourseId } }
            });
            if (!enrollment) {
                return res.status(403).json({ error: 'You must enroll in the prerequisite course to apply.' });
            }
        }

        const existing = await prisma.jobApplication.findUnique({
            where: { jobId_applicantId: { jobId, applicantId: req.user.id } }
        });
        if (existing) return res.status(400).json({ error: 'You have already applied to this job' });

        // Find the best AI Interview Score for this student to attach to the application
        const bestInterview = await prisma.interview.findFirst({
            where: {
                userId: req.user.id,
                status: 'COMPLETED',
                evaluation: { isNot: null }
            },
            orderBy: {
                evaluation: { overallScore: 'desc' }
            },
            include: { evaluation: true }
        });

        const application = await prisma.jobApplication.create({
            data: {
                jobId,
                applicantId: req.user.id,
                resumeUrl,
                coverLetter,
                linkedInterviewId: bestInterview ? bestInterview.id : null,
                status: 'APPLIED',
                statusHistory: [{ status: 'APPLIED', timestamp: new Date().toISOString(), note: 'Application submitted' }]
            }
        });

        // WhatsApp Notification & XP Gamification
        try {
            const [applicant, jobDetails] = await Promise.all([
                prisma.user.findUnique({ where: { id: req.user.id }, select: { name: true, phone: true, xp: true, currentStreak: true } }),
                prisma.job.findUnique({ where: { id: jobId }, include: { employer: { select: { employerProfile: true } } } })
            ]);

            const companyName = jobDetails.employer?.employerProfile?.companyName || 'A Techwell Employer';
            
            // Notify via WhatsApp
            if (applicant.phone) {
                WhatsAppService.notifyJobApplication(applicant.phone, applicant.name, jobDetails.title, companyName);
            }

            // Gamification: Reward 50 XP for applying
            await prisma.user.update({
                where: { id: req.user.id },
                data: { xp: { increment: 50 } }
            });
        } catch (postError) {
            console.error("Post-application hooks failed:", postError);
        }

        res.status(201).json(application);
    } catch (error) {
        next(error);
    }
});

/**
 * @route   GET /api/jobs/:id/applications
 * @desc    Get applications for a job (Employer/Admin)
 */
router.get('/:id/applications', authenticate, authorize('EMPLOYER', 'ADMIN', 'SUPER_ADMIN', 'STAFF', 'INSTITUTE_ADMIN', 'INSTRUCTOR', 'FRANCHISE_STAFF', 'FRANCHISE_TRAINER'), async (req, res, next) => {
    try {
        const isAdmin = ['ADMIN', 'SUPER_ADMIN'].includes(req.user.role);
        const job = await prisma.job.findUnique({ where: { id: req.params.id } });

        if (!job) return res.status(404).json({ error: 'Job not found' });
        if (!isAdmin && job.employerId !== req.user.id) return res.status(403).json({ error: 'Access denied' });

        const applications = await prisma.jobApplication.findMany({
            where: { jobId: req.params.id },
            include: {
                applicant: {
                    select: {
                        id: true, name: true, email: true, avatar: true, phone: true,
                        interviews: {
                            select: { evaluation: { select: { overallScore: true, starMethodScore: true } } }
                        }
                    }
                },
                interviews: { orderBy: { scheduledAt: 'asc' } },
                offers: { orderBy: { createdAt: 'desc' }, take: 1 }
            },
            orderBy: { createdAt: 'desc' }
        });

        const enhancedApplications = applications.map(app => {
            const aiInterviews = app.applicant?.interviews || [];
            let avgScore = 0;
            if (aiInterviews.length > 0) {
                const evaluated = aiInterviews.filter(i => i.evaluation);
                if (evaluated.length > 0) {
                    avgScore = Math.round(evaluated.reduce((s, i) => s + (i.evaluation.overallScore || 0), 0) / evaluated.length);
                }
            }
            return { ...app, applicant: { ...app.applicant, aiScore: avgScore, interviews: undefined } };
        });

        res.json(enhancedApplications);
    } catch (error) {
        next(error);
    }
});

/**
 * @route   PATCH /api/jobs/applications/:id/status
 * @desc    Update application status (with history tracking)
 */
router.patch('/applications/:id/status', authenticate, authorize('EMPLOYER', 'ADMIN', 'SUPER_ADMIN', 'STAFF', 'INSTITUTE_ADMIN', 'INSTRUCTOR', 'FRANCHISE_STAFF', 'FRANCHISE_TRAINER'), async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status, note } = req.body;
        const isAdmin = ['ADMIN', 'SUPER_ADMIN'].includes(req.user.role);

        const application = await prisma.jobApplication.findUnique({
            where: { id },
            include: { job: true }
        });
        if (!application || (!isAdmin && application.job.employerId !== req.user.id)) {
            return res.status(403).json({ error: 'Access denied' });
        }

        // Append to status history
        const existingHistory = Array.isArray(application.statusHistory) ? application.statusHistory : [];
        const newHistory = [...existingHistory, { status, timestamp: new Date().toISOString(), note: note || '', changedBy: req.user.id }];

        const updated = await prisma.jobApplication.update({
            where: { id },
            data: { status, statusHistory: newHistory }
        });
        res.json(updated);
    } catch (error) {
        next(error);
    }
});

/**
 * @route   POST /api/jobs/applications/:appId/interviews
 * @desc    Schedule an interview round
 */
router.post('/applications/:appId/interviews', authenticate, authorize('EMPLOYER', 'ADMIN', 'SUPER_ADMIN', 'STAFF', 'INSTITUTE_ADMIN', 'INSTRUCTOR', 'FRANCHISE_STAFF', 'FRANCHISE_TRAINER'), async (req, res, next) => {
    try {
        const { appId } = req.params;
        const { roundName, roundType, scheduledAt, duration, meetingLink, location: loc, interviewerId } = req.body;

        if (!roundName || !scheduledAt) {
            return res.status(400).json({ error: 'Round name and scheduled time are required.' });
        }

        const application = await prisma.jobApplication.findUnique({ where: { id: appId }, include: { job: true } });
        const isAdmin = ['ADMIN', 'SUPER_ADMIN'].includes(req.user.role);
        if (!application || (!isAdmin && application.job.employerId !== req.user.id)) {
            return res.status(403).json({ error: 'Access denied' });
        }

        const interview = await prisma.jobInterview.create({
            data: {
                applicationId: appId,
                roundName,
                roundType: roundType || 'TECHNICAL',
                scheduledAt: new Date(scheduledAt),
                duration: duration || 30,
                meetingLink,
                location: loc,
                interviewerId: interviewerId || req.user.id,
                status: 'SCHEDULED'
            }
        });

        // Update application status to INTERVIEW_SCHEDULED
        const existingHistory = Array.isArray(application.statusHistory) ? application.statusHistory : [];
        await prisma.jobApplication.update({
            where: { id: appId },
            data: {
                status: 'INTERVIEW_SCHEDULED',
                statusHistory: [...existingHistory, {
                    status: 'INTERVIEW_SCHEDULED',
                    timestamp: new Date().toISOString(),
                    note: `${roundName} scheduled`,
                    changedBy: req.user.id
                }]
            }
        });

        res.status(201).json(interview);
    } catch (error) {
        next(error);
    }
});

/**
 * @route   PUT /api/jobs/interviews/:interviewId
 * @desc    Update interview (feedback, score, result)
 */
router.put('/interviews/:interviewId', authenticate, authorize('EMPLOYER', 'ADMIN', 'SUPER_ADMIN', 'STAFF', 'INSTITUTE_ADMIN', 'INSTRUCTOR', 'FRANCHISE_STAFF', 'FRANCHISE_TRAINER'), async (req, res, next) => {
    try {
        const { interviewId } = req.params;
        const { status, feedback, score, result, roundName, roundType, scheduledAt, duration, meetingLink, location: loc } = req.body;

        const interview = await prisma.jobInterview.update({
            where: { id: interviewId },
            data: {
                ...(status && { status }),
                ...(feedback && { feedback }),
                ...(score !== undefined && { score: parseInt(score) }),
                ...(result && { result }),
                ...(roundName && { roundName }),
                ...(roundType && { roundType }),
                ...(scheduledAt && { scheduledAt: new Date(scheduledAt) }),
                ...(duration && { duration: parseInt(duration) }),
                ...(meetingLink !== undefined && { meetingLink }),
                ...(loc !== undefined && { location: loc })
            }
        });

        // If interview completed, update application status
        if (result === 'PASSED') {
            const app = await prisma.jobApplication.findUnique({ where: { id: interview.applicationId } });
            if (app) {
                const existingHistory = Array.isArray(app.statusHistory) ? app.statusHistory : [];
                await prisma.jobApplication.update({
                    where: { id: interview.applicationId },
                    data: {
                        status: 'INTERVIEWED',
                        statusHistory: [...existingHistory, {
                            status: 'INTERVIEWED',
                            timestamp: new Date().toISOString(),
                            note: `${interview.roundName} - Passed`,
                            changedBy: req.user.id
                        }]
                    }
                });
            }
        }

        res.json(interview);
    } catch (error) {
        next(error);
    }
});

/**
 * @route   POST /api/jobs/applications/:appId/offers
 * @desc    Release an offer letter
 */
router.post('/applications/:appId/offers', authenticate, authorize('EMPLOYER', 'ADMIN', 'SUPER_ADMIN', 'STAFF', 'INSTITUTE_ADMIN', 'INSTRUCTOR', 'FRANCHISE_STAFF', 'FRANCHISE_TRAINER'), async (req, res, next) => {
    try {
        const { appId } = req.params;
        const { ctc, salaryBreakup, location: loc, reportingManager, reportingAddress, designation, department, doj, offerLetterUrl } = req.body;

        const application = await prisma.jobApplication.findUnique({ where: { id: appId }, include: { job: true } });
        const isAdmin = ['ADMIN', 'SUPER_ADMIN'].includes(req.user.role);
        if (!application || (!isAdmin && application.job.employerId !== req.user.id)) {
            return res.status(403).json({ error: 'Access denied' });
        }

        const offer = await prisma.jobOffer.create({
            data: {
                applicationId: appId,
                ctc,
                salaryBreakup,
                location: loc,
                reportingManager,
                reportingAddress,
                designation,
                department,
                doj: doj ? new Date(doj) : null,
                offerLetterUrl,
                status: 'RELEASED'
            }
        });

        // Update application status
        const existingHistory = Array.isArray(application.statusHistory) ? application.statusHistory : [];
        await prisma.jobApplication.update({
            where: { id: appId },
            data: {
                status: 'OFFER_RELEASED',
                statusHistory: [...existingHistory, {
                    status: 'OFFER_RELEASED',
                    timestamp: new Date().toISOString(),
                    note: `Offer released: ${ctc || ''}`,
                    changedBy: req.user.id
                }]
            }
        });

        res.status(201).json(offer);
    } catch (error) {
        next(error);
    }
});

/**
 * @route   PATCH /api/jobs/offers/:offerId/status
 * @desc    Accept / Decline offer (Student or Admin)
 */
router.patch('/offers/:offerId/status', authenticate, async (req, res, next) => {
    try {
        const { offerId } = req.params;
        const { status } = req.body; // ACCEPTED, DECLINED

        const offer = await prisma.jobOffer.findUnique({
            where: { id: offerId },
            include: {
                application: { include: { job: true } }
            }
        });
        if (!offer) return res.status(404).json({ error: 'Offer not found' });

        // Only the applicant or admin can accept/decline
        const isAdmin = ['ADMIN', 'SUPER_ADMIN'].includes(req.user.role);
        const isApplicant = offer.application.applicantId === req.user.id;
        if (!isAdmin && !isApplicant) return res.status(403).json({ error: 'Access denied' });

        await prisma.jobOffer.update({ where: { id: offerId }, data: { status } });

        // Update application status accordingly
        const appStatus = status === 'ACCEPTED' ? 'OFFER_ACCEPTED' : 'OFFER_DECLINED';
        const app = offer.application;
        const existingHistory = Array.isArray(app.statusHistory) ? app.statusHistory : [];
        await prisma.jobApplication.update({
            where: { id: app.id },
            data: {
                status: appStatus,
                statusHistory: [...existingHistory, {
                    status: appStatus,
                    timestamp: new Date().toISOString(),
                    note: `Offer ${String(status || '').toLowerCase()} by candidate`,
                    changedBy: req.user.id
                }]
            }
        });

        res.json({ message: `Offer ${String(status || '').toLowerCase()} successfully` });
    } catch (error) {
        next(error);
    }
});

/**
 * @route   POST /api/jobs/applications/:appId/feedback
 * @desc    Submit post-placement feedback and suggestions
 */
router.post('/applications/:appId/feedback', authenticate, async (req, res, next) => {
    try {
        const { appId } = req.params;
        const { joinedStatus, joiningDate, feedback, suggestions, rating } = req.body;

        const application = await prisma.jobApplication.findUnique({ where: { id: appId }, include: { job: true } });
        if (!application) return res.status(404).json({ error: 'Application not found' });

        const isAdmin = ['ADMIN', 'SUPER_ADMIN'].includes(req.user.role);
        const isEmployer = application.job.employerId === req.user.id;
        const isApplicant = application.applicantId === req.user.id;
        if (!isAdmin && !isEmployer && !isApplicant) return res.status(403).json({ error: 'Access denied' });

        // Update application status for onboarding
        const newStatus = joinedStatus === 'JOINED' ? 'JOINED' : 'NOT_JOINED';
        const existingHistory = Array.isArray(application.statusHistory) ? application.statusHistory : [];
        const updated = await prisma.jobApplication.update({
            where: { id: appId },
            data: {
                status: newStatus,
                statusHistory: [...existingHistory, {
                    status: newStatus,
                    timestamp: new Date().toISOString(),
                    note: feedback || `Candidate ${joinedStatus === 'JOINED' ? 'joined' : 'did not join'}`,
                    joiningDate: joiningDate || null,
                    suggestions: suggestions || null,
                    rating: rating || null,
                    changedBy: req.user.id
                }]
            }
        });

        res.json({ message: 'Feedback submitted successfully', application: updated });
    } catch (error) {
        next(error);
    }
});

/**
 * @route   PUT /api/jobs/:id
 * @desc    Update a job
 */
router.put('/:id', authenticate, authorize('EMPLOYER', 'ADMIN', 'SUPER_ADMIN', 'STAFF', 'INSTITUTE_ADMIN', 'INSTRUCTOR', 'FRANCHISE_STAFF', 'FRANCHISE_TRAINER'), requireApprovedEmployer, async (req, res, next) => {
    try {
        const { id } = req.params;
        const isAdmin = ['ADMIN', 'SUPER_ADMIN'].includes(req.user.role);

        const job = await prisma.job.findUnique({ where: { id } });
        if (!job) return res.status(404).json({ error: 'Job not found' });
        if (!isAdmin && job.employerId !== req.user.id) return res.status(403).json({ error: 'Access denied' });

        const { title, description, requirements, location, type, experience, salary, skills, clientName, shift, status, qualification, domain, expiresAt } = req.body;
        const allowedStatuses = ['DRAFT', 'OPEN', 'PUBLISHED', 'PAUSED', 'CLOSED', 'ARCHIVED'];
        if (status && !allowedStatuses.includes(status)) {
            return res.status(400).json({ error: 'Invalid job status.' });
        }

        const updatedJob = await prisma.job.update({
            where: { id },
            data: { title, description, requirements, location, type, experience, salary, skills, clientName, shift, status, qualification, domain, expiresAt: expiresAt ? new Date(expiresAt) : undefined }
        });
        res.json(updatedJob);
    } catch (error) {
        next(error);
    }
});

/**
 * @route   DELETE /api/jobs/:id
 * @desc    Delete a job
 */
router.delete('/:id', authenticate, authorize('EMPLOYER', 'ADMIN', 'SUPER_ADMIN', 'STAFF', 'INSTITUTE_ADMIN', 'INSTRUCTOR', 'FRANCHISE_STAFF', 'FRANCHISE_TRAINER'), requireApprovedEmployer, async (req, res, next) => {
    try {
        const { id } = req.params;
        const isAdmin = ['ADMIN', 'SUPER_ADMIN'].includes(req.user.role);

        const job = await prisma.job.findUnique({ where: { id } });
        if (!job) return res.status(404).json({ error: 'Job not found' });
        if (!isAdmin && job.employerId !== req.user.id) return res.status(403).json({ error: 'Access denied' });

        await prisma.job.delete({ where: { id } });
        res.json({ message: 'Job deleted successfully' });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
