const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate, authorize, checkPermission, optionalAuth } = require('../middleware/auth');
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
        const { type, location } = req.query;
        const where = { status: 'OPEN' };

        if (type) where.type = type;
        if (location) where.location = { contains: location, mode: 'insensitive' };

        const jobs = await prisma.job.findMany({
            where,
            include: { employer: { select: { name: true, employerProfile: { select: { companyName: true, logo: true } } } } },
            orderBy: { createdAt: 'desc' }
        });
        res.json(jobs);
    } catch (error) {
        next(error);
    }
});

/**
 * @route   GET /api/jobs/:id
 * @desc    Get job details
 * @access  Public
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

router.get('/:id', async (req, res, next) => {
    try {
        const job = await prisma.job.findFirst({
            where: { id: req.params.id, status: { in: ['OPEN', 'PUBLISHED'] } },
            include: { employer: { select: { name: true, employerProfile: { select: { companyName: true, logo: true, description: true, website: true } } } } }
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
 * @access  Private (Approved Employer)
 */
router.post('/', authenticate, authorize('EMPLOYER', 'ADMIN', 'SUPER_ADMIN'), requireApprovedEmployer, async (req, res, next) => {
    try {
        const { title, description, requirements, location, type, experience, salary, skills, clientName, shift } = req.body;
        if (!title?.trim() || !description?.trim() || !location?.trim()) {
            return res.status(400).json({ error: 'Title, description, and location are required.' });
        }

        const job = await prisma.job.create({
            data: {
                title, description, requirements, location, type, experience, salary,
                skills, clientName, shift,
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
 * @desc    Apply for a job
 * @access  Private (Student)
 */
router.post('/:id/apply', authenticate, authorize('STUDENT'), async (req, res, next) => {
    try {
        const { resumeUrl, coverLetter } = req.body;
        const jobId = req.params.id;

        const existing = await prisma.jobApplication.findUnique({
            where: { jobId_applicantId: { jobId, applicantId: req.user.id } }
        });

        if (existing) return res.status(400).json({ error: 'Already applied' });

        const application = await prisma.jobApplication.create({
            data: {
                jobId,
                applicantId: req.user.id,
                resumeUrl,
                coverLetter
            }
        });

        res.status(201).json(application);
    } catch (error) {
        next(error);
    }
});

/**
 * @route   GET /api/employers/jobs
 * @desc    Get my posted jobs (Employer)
 * @access  Private (Employer)
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
 * @route   GET /api/jobs/:id/applications
 * @desc    Get applications for a job
 * @access  Private (Employer)
 */
router.get('/:id/applications', authenticate, authorize('EMPLOYER', 'ADMIN', 'SUPER_ADMIN'), requireApprovedEmployer, async (req, res, next) => {
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
                        name: true,
                        email: true,
                        avatar: true,
                        phone: true,
                        interviews: {
                            select: {
                                evaluation: {
                                    select: { overallScore: true, starMethodScore: true }
                                }
                            }
                        }
                    }
                }
            }
        });

        // Add calculated scores to response
        const enhancedApplications = applications.map(app => {
            const interviews = app.applicant?.interviews || [];
            let avgScore = 0;
            let avgStar = 0;

            if (interviews.length > 0) {
                const evaluatedInterviews = interviews.filter(i => i.evaluation);
                if (evaluatedInterviews.length > 0) {
                    const totalScore = evaluatedInterviews.reduce((sum, i) => sum + (i.evaluation.overallScore || 0), 0);
                    const totalStar = evaluatedInterviews.reduce((sum, i) => sum + (i.evaluation.starMethodScore || 0), 0);
                    avgScore = Math.round(totalScore / evaluatedInterviews.length);
                    avgStar = Math.round(totalStar / evaluatedInterviews.length);
                }
            }

            return {
                ...app,
                applicant: {
                    ...app.applicant,
                    aiScore: avgScore,
                    starScore: avgStar,
                    interviews: undefined // Hide raw data to keep response clean
                }
            };
        });

        res.json(enhancedApplications);
    } catch (error) {
        next(error);
    }
});

/**
 * @route   PATCH /api/jobs/applications/:id/status
 * @desc    Update application status (Employer)
 * @access  Private (Employer)
 */
router.patch('/applications/:id/status', authenticate, authorize('EMPLOYER', 'ADMIN', 'SUPER_ADMIN'), requireApprovedEmployer, async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // SHORTLISTED, INTERVIEW_PENDING, etc.
        const isAdmin = ['ADMIN', 'SUPER_ADMIN'].includes(req.user.role);

        // Verify ownership
        const application = await prisma.jobApplication.findUnique({
            where: { id },
            include: { job: true }
        });

        if (!application || (!isAdmin && application.job.employerId !== req.user.id)) {
            return res.status(403).json({ error: 'Access denied' });
        }

        const updated = await prisma.jobApplication.update({
            where: { id },
            data: { status }
        });

        res.json(updated);
    } catch (error) {
        next(error);
    }
});

/**
 * @route   GET /api/jobs/applications/me
 * @desc    Get my applications (Student)
 * @access  Private (Student)
 */
router.get('/applications/me', authenticate, authorize('STUDENT'), async (req, res, next) => {
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
                        employer: {
                            select: {
                                employerProfile: {
                                    select: { companyName: true, logo: true }
                                }
                            }
                        }
                    }
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
 * @route   PUT /api/jobs/:id
 * @desc    Update a job
 * @access  Private (Employer/Admin)
 */
router.put('/:id', authenticate, authorize('EMPLOYER', 'ADMIN', 'SUPER_ADMIN'), requireApprovedEmployer, async (req, res, next) => {
    try {
        const { id } = req.params;
        const isAdmin = ['ADMIN', 'SUPER_ADMIN'].includes(req.user.role);
        
        const job = await prisma.job.findUnique({ where: { id } });
        if (!job) return res.status(404).json({ error: 'Job not found' });
        if (!isAdmin && job.employerId !== req.user.id) return res.status(403).json({ error: 'Access denied' });

        const { title, description, requirements, location, type, experience, salary, skills, clientName, shift, status } = req.body;
        const allowedStatuses = ['DRAFT', 'OPEN', 'PUBLISHED', 'PAUSED', 'CLOSED', 'ARCHIVED'];
        if (status && !allowedStatuses.includes(status)) {
            return res.status(400).json({ error: 'Invalid job status.' });
        }

        const updatedJob = await prisma.job.update({
            where: { id },
            data: {
                title, description, requirements, location, type, experience, salary,
                skills, clientName, shift, status
            }
        });

        res.json(updatedJob);
    } catch (error) {
        next(error);
    }
});

/**
 * @route   DELETE /api/jobs/:id
 * @desc    Delete a job
 * @access  Private (Employer/Admin)
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

