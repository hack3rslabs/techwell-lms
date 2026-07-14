const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate, authorize } = require('../middleware/auth');
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
        const { type, location, search, skills } = req.query;
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
router.get('/admin/listings', authenticate, authorize('EMPLOYER', 'ADMIN', 'SUPER_ADMIN'), async (req, res, next) => {
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
router.get('/my/listings', authenticate, authorize('EMPLOYER', 'ADMIN', 'SUPER_ADMIN'), requireApprovedEmployer, async (req, res, next) => {
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
router.get('/my/listings/:id', authenticate, authorize('EMPLOYER', 'ADMIN', 'SUPER_ADMIN'), requireApprovedEmployer, async (req, res, next) => {
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
 * @route   POST /api/jobs
 * @desc    Post a new job
 */
router.post('/', authenticate, authorize('EMPLOYER', 'ADMIN', 'SUPER_ADMIN'), requireApprovedEmployer, async (req, res, next) => {
    try {
        const { title, description, requirements, location, type, experience, salary, skills, clientName, shift, qualification, domain, expiresAt } = req.body;
        if (!title?.trim() || !description?.trim() || !location?.trim()) {
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

        const existing = await prisma.jobApplication.findUnique({
            where: { jobId_applicantId: { jobId, applicantId: req.user.id } }
        });
        if (existing) return res.status(400).json({ error: 'You have already applied to this job' });

        const application = await prisma.jobApplication.create({
            data: {
                jobId,
                applicantId: req.user.id,
                resumeUrl,
                coverLetter,
                status: 'APPLIED',
                statusHistory: [{ status: 'APPLIED', timestamp: new Date().toISOString(), note: 'Application submitted' }]
            }
        });
        res.status(201).json(application);
    } catch (error) {
        next(error);
    }
});

/**
 * @route   GET /api/jobs/:id/applications
 * @desc    Get applications for a job (Employer/Admin)
 */
router.get('/:id/applications', authenticate, authorize('EMPLOYER', 'ADMIN', 'SUPER_ADMIN'), async (req, res, next) => {
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
router.patch('/applications/:id/status', authenticate, authorize('EMPLOYER', 'ADMIN', 'SUPER_ADMIN'), async (req, res, next) => {
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
router.post('/applications/:appId/interviews', authenticate, authorize('EMPLOYER', 'ADMIN', 'SUPER_ADMIN'), async (req, res, next) => {
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
router.put('/interviews/:interviewId', authenticate, authorize('EMPLOYER', 'ADMIN', 'SUPER_ADMIN'), async (req, res, next) => {
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
router.post('/applications/:appId/offers', authenticate, authorize('EMPLOYER', 'ADMIN', 'SUPER_ADMIN'), async (req, res, next) => {
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
                    note: `Offer ${status.toLowerCase()} by candidate`,
                    changedBy: req.user.id
                }]
            }
        });

        res.json({ message: `Offer ${status.toLowerCase()} successfully` });
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
router.put('/:id', authenticate, authorize('EMPLOYER', 'ADMIN', 'SUPER_ADMIN'), requireApprovedEmployer, async (req, res, next) => {
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
router.delete('/:id', authenticate, authorize('EMPLOYER', 'ADMIN', 'SUPER_ADMIN'), requireApprovedEmployer, async (req, res, next) => {
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
