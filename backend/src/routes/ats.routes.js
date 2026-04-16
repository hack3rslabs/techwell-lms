const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate, authorize, checkPermission, optionalAuth } = require('../middleware/auth');
const router = express.Router();
const prisma = new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL } } });

// ============= PUBLIC ROUTES =============

/**
 * @route   POST /api/ats/apply/external
 * @desc    Apply for a job (External Candidate)
 * @access  Public
 */
router.post('/apply/external', async (req, res, next) => {
    try {
        const { jobId, name, email, phone, resumeUrl, coverLetter } = req.body;

        if (!jobId || !name || !email) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Check for existing application
        const existing = await prisma.jobApplication.findFirst({
            where: { jobId, externalEmail: email }
        });

        if (existing) {
            return res.status(400).json({ error: 'You have already applied for this job.' });
        }

        const application = await prisma.jobApplication.create({
            data: {
                jobId,
                source: 'EXTERNAL',
                externalName: name,
                externalEmail: email,
                externalPhone: phone,
                resumeUrl,
                coverLetter,
                status: 'APPLIED',
                statusHistory: [{ status: 'APPLIED', updatedBy: 'SYSTEM', timestamp: new Date() }]
            }
        });

        // Trigger Email (Async)
        // TODO: Call email service to log "APPLICATION_RECEIVED"

        res.status(201).json(application);
    } catch (error) {
        next(error);
    }
});

// ============= RECRUITER ROUTES =============

/**
 * @route   GET /api/ats/applications/detail/:id
 * @desc    Get single application details (Recruiter)
 * @access  Private (Employer)
 */
router.get('/applications/detail/:id', authenticate, authorize('EMPLOYER'), async (req, res, next) => {
    try {
        const { id } = req.params;
        const application = await prisma.jobApplication.findUnique({
            where: { id },
            include: {
                applicant: { select: { id: true, name: true, email: true, avatar: true, phone: true } },
                job: { select: { title: true, employerId: true } }
            }
        });

        if (!application || application.job.employerId !== req.user.id) {
            return res.status(403).json({ error: 'Access denied' });
        }

        res.json(application);
    } catch (error) {
        next(error);
    }
});

/**
 * @route   GET /api/ats/applications/:jobId
 * @desc    List applications with filters (Recruiter)
 * @access  Private (Employer)
 */
router.get('/applications/:jobId', authenticate, authorize('EMPLOYER'), async (req, res, next) => {
    try {
        const { jobId } = req.params;
        const { source, status, minScore, search } = req.query;

        const job = await prisma.job.findUnique({ where: { id: jobId } });
        if (!job || job.employerId !== req.user.id) return res.status(403).json({ error: 'Access denied' });

        const where = { jobId };

        if (source) where.source = source; // INTERNAL / EXTERNAL
        if (status) where.status = status;
        if (minScore) where.atsScore = { gte: parseFloat(minScore) };

        // Search logic (Internal Name OR External Name)
        if (search) {
            where.OR = [
                { applicant: { name: { contains: search, mode: 'insensitive' } } },
                { externalName: { contains: search, mode: 'insensitive' } }
            ];
        }

        const applications = await prisma.jobApplication.findMany({
            where,
            include: {
                applicant: { select: { id: true, name: true, email: true, avatar: true, phone: true } }, // Internal
                interviews: true
            },
            orderBy: { atsScore: 'desc' } // Default sort by ATS Score
        });

        res.json(applications);
    } catch (error) {
        next(error);
    }
});

/**
 * @route   PATCH /api/ats/status/:id
 * @desc    Update Status & Workflow (Recruiter)
 * @access  Private (Employer)
 */
router.patch('/status/:id', authenticate, authorize('EMPLOYER'), async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status, notes } = req.body;

        const application = await prisma.jobApplication.findUnique({
            where: { id },
            include: { job: true }
        });

        if (!application || application.job.employerId !== req.user.id) {
            return res.status(403).json({ error: 'Access denied' });
        }

        // Add to history
        const historyEntry = {
            status,
            updatedBy: req.user.id,
            timestamp: new Date(),
            notes
        };

        const existingHistory = application.statusHistory || [];

        // Update application
        const updated = await prisma.jobApplication.update({
            where: { id },
            data: {
                status,
                statusHistory: [...existingHistory, historyEntry]
            }
        });

        // Create Audit Log
        await prisma.auditLog.create({
            data: {
                entityType: 'APPLICATION',
                entityId: id,
                action: 'STATUS_CHANGE',
                performedBy: req.user.id,
                details: { oldStatus: application.status, newStatus: status, notes },
                applicationId: id
            }
        });

        res.json(updated);
    } catch (error) {
        next(error);
    }
});

/**
 * @route   POST /api/ats/score/:id
 * @desc    Calculate ATS Score (Mock Implementation)
 * @access  Private (Employer)
 */
router.post('/score/:id', authenticate, authorize('EMPLOYER'), async (req, res, next) => {
    try {
        const { id } = req.params;

        // In real app: Parse resumeUrl content -> Compare with Job Skills -> 0-100
        // Here: Random mock score for demo
        const score = Math.floor(Math.random() * (100 - 60 + 1)) + 60; // 60-100

        const updated = await prisma.jobApplication.update({
            where: { id },
            data: { atsScore: score }
        });

        res.json({ id, atsScore: score });
    } catch (error) {
        next(error);
    }
});

/**
 * @route   POST /api/ats/interviews
 * @desc    Schedule Interview
 * @access  Private (Employer)
 */
router.post('/interviews', authenticate, authorize('EMPLOYER'), async (req, res, next) => {
    try {
        const { applicationId, roundName, scheduledAt, interviewerId, duration, type } = req.body;

        // Get application details for email
        const application = await prisma.jobApplication.findUnique({
            where: { id: applicationId },
            include: {
                job: {
                    include: {
                        employer: {
                            include: { employerProfile: true }
                        }
                    }
                }
            }
        });

        if (!application) {
            return res.status(404).json({ error: 'Application not found' });
        }

        // Generate meeting link from configured integration
        const { generateMeetingLink } = require('../services/meeting.service');
        const { platform, meetingLink } = await generateMeetingLink(scheduledAt, {
            title: `Interview: ${application.job.title}`,
            duration: parseInt(duration) || 30
        });

        const interview = await prisma.jobInterview.create({
            data: {
                applicationId,
                roundName,
                roundType: type || 'TECHNICAL',
                scheduledAt: new Date(scheduledAt),
                interviewerId: interviewerId || req.user.id,
                duration: parseInt(duration) || 30,
                meetingLink: meetingLink
            }
        });

        // Update application status to INTERVIEW_SCHEDULED
        await prisma.jobApplication.update({
            where: { id: applicationId },
            data: { status: 'INTERVIEW_SCHEDULED' }
        });

        // Create Audit Log
        await prisma.auditLog.create({
            data: {
                entityType: 'INTERVIEW',
                entityId: interview.id,
                action: 'SCHEDULED',
                performedBy: req.user.id,
                details: { round: roundName, date: scheduledAt, platform, meetingLink },
                applicationId
            }
        });

        // Send email notification to applicant
        const { sendInterviewScheduledEmail } = require('../services/email.service');
        const companyName = application.job.employer.employerProfile?.companyName || 'Company';

        sendInterviewScheduledEmail(
            application.email,
            application.name,
            {
                jobTitle: application.job.title,
                companyName,
                roundName,
                scheduledAt,
                duration: parseInt(duration) || 30,
                meetingLink,
                platform
            }
        ).catch(err => console.error('Failed to send interview email:', err));

        res.status(201).json(interview);
    } catch (error) {
        next(error);
    }
});

/**
 * @route   GET /api/ats/export/:jobId
 * @desc    Export Applicants to CSV
 * @access  Private (Employer)
 */
router.get('/export/:jobId', authenticate, authorize('EMPLOYER'), async (req, res, next) => {
    try {
        const { jobId } = req.params;

        const job = await prisma.job.findUnique({
            where: { id: jobId },
            include: { employer: true }
        });

        if (!job || job.employerId !== req.user.id) return res.status(403).json({ error: 'Access denied' });

        const applications = await prisma.jobApplication.findMany({
            where: { jobId },
            include: { applicant: true },
            orderBy: { createdAt: 'desc' }
        });

        // Manual CSV Generation
        const headers = ['Name', 'Email', 'Phone', 'Source', 'Status', 'ATS Score', 'Date Applied'];
        const rows = applications.map(app => {
            const name = app.source === 'INTERNAL' ? app.applicant?.name : app.externalName;
            const email = app.source === 'INTERNAL' ? app.applicant?.email : app.externalEmail;
            const phone = app.source === 'INTERNAL' ? app.applicant?.phone : app.externalPhone;

            return [
                name || 'N/A',
                email || 'N/A',
                phone || 'N/A',
                app.source,
                app.status,
                app.atsScore || 0,
                new Date(app.createdAt).toLocaleDateString()
            ].map(field => `"${String(field).replace(/"/g, '""')}"`).join(',');
        });

        const csvContent = [headers.join(','), ...rows].join('\n');

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="applicants-${jobId}.csv"`);
        res.status(200).send(csvContent);

    } catch (error) {
        next(error);
    }
});

// ============= CANDIDATE NOTES / TAGS / RATING =============

/**
 * @route   POST /api/ats/notes/:applicationId
 * @desc    Add a note to a candidate application
 * @access  Private (Employer)
 */
router.post('/notes/:applicationId', authenticate, authorize('EMPLOYER'), async (req, res, next) => {
    try {
        const { applicationId } = req.params;
        const { content, tags, rating } = req.body;

        const application = await prisma.jobApplication.findUnique({
            where: { id: applicationId },
            include: { job: true }
        });

        if (!application || application.job.employerId !== req.user.id) {
            return res.status(403).json({ error: 'Access denied' });
        }

        // Store notes in statusHistory as a note entry
        const noteEntry = {
            type: 'NOTE',
            content,
            tags: tags || [],
            rating: rating || null,
            addedBy: req.user.id,
            timestamp: new Date()
        };

        const existingHistory = application.statusHistory || [];

        const updated = await prisma.jobApplication.update({
            where: { id: applicationId },
            data: {
                statusHistory: [...existingHistory, noteEntry]
            }
        });

        // Create Audit Log
        await prisma.auditLog.create({
            data: {
                entityType: 'APPLICATION',
                entityId: applicationId,
                action: 'NOTE_ADDED',
                performedBy: req.user.id,
                details: { content, tags, rating },
                applicationId
            }
        });

        res.json(updated);
    } catch (error) {
        next(error);
    }
});

/**
 * @route   PATCH /api/ats/rate/:applicationId
 * @desc    Rate a candidate and add tags
 * @access  Private (Employer)
 */
router.patch('/rate/:applicationId', authenticate, authorize('EMPLOYER'), async (req, res, next) => {
    try {
        const { applicationId } = req.params;
        const { rating, tags } = req.body;

        const application = await prisma.jobApplication.findUnique({
            where: { id: applicationId },
            include: { job: true }
        });

        if (!application || application.job.employerId !== req.user.id) {
            return res.status(403).json({ error: 'Access denied' });
        }

        // Store rating/tags in existing history as metadata entry
        const rateEntry = {
            type: 'RATING',
            rating: parseInt(rating) || 0,
            tags: tags || [],
            addedBy: req.user.id,
            timestamp: new Date()
        };

        const existingHistory = application.statusHistory || [];

        const updated = await prisma.jobApplication.update({
            where: { id: applicationId },
            data: {
                statusHistory: [...existingHistory, rateEntry]
            }
        });

        res.json(updated);
    } catch (error) {
        next(error);
    }
});

// ============= INTERVIEW FEEDBACK =============

/**
 * @route   PATCH /api/ats/interviews/:interviewId/feedback
 * @desc    Submit interview feedback and result
 * @access  Private (Employer)
 */
router.patch('/interviews/:interviewId/feedback', authenticate, authorize('EMPLOYER'), async (req, res, next) => {
    try {
        const { interviewId } = req.params;
        const { feedback, score, result, status } = req.body;

        const interview = await prisma.jobInterview.findUnique({
            where: { id: interviewId },
            include: {
                application: { include: { job: true } }
            }
        });

        if (!interview || interview.application.job.employerId !== req.user.id) {
            return res.status(403).json({ error: 'Access denied' });
        }

        const updated = await prisma.jobInterview.update({
            where: { id: interviewId },
            data: {
                feedback: feedback || interview.feedback,
                score: score !== undefined ? parseInt(score) : interview.score,
                result: result || interview.result,
                status: status || 'COMPLETED'
            }
        });

        // Create Audit Log
        await prisma.auditLog.create({
            data: {
                entityType: 'INTERVIEW',
                entityId: interviewId,
                action: 'FEEDBACK_SUBMITTED',
                performedBy: req.user.id,
                details: { feedback, score, result },
                applicationId: interview.applicationId
            }
        });

        res.json(updated);
    } catch (error) {
        next(error);
    }
});

// ============= HIRING ANALYTICS =============

/**
 * @route   GET /api/ats/analytics
 * @desc    Get comprehensive hiring analytics
 * @access  Private (Employer)
 */
router.get('/analytics', authenticate, authorize('EMPLOYER'), async (req, res, next) => {
    try {
        const employerId = req.user.id;

        // Get all jobs for this employer
        const jobs = await prisma.job.findMany({
            where: { employerId },
            include: {
                applications: {
                    include: {
                        interviews: true
                    }
                }
            }
        });

        // Calculate funnel metrics
        const funnel = {
            applied: 0,
            screened: 0,
            shortlisted: 0,
            interviewScheduled: 0,
            interviewed: 0,
            selected: 0,
            hired: 0,
            rejected: 0
        };

        let totalTimeToHire = 0;
        let hireCount = 0;
        let internalCount = 0;
        let externalCount = 0;
        let totalAtsScore = 0;
        let scoredCount = 0;

        const jobStats = [];

        jobs.forEach(job => {
            const jobStat = {
                id: job.id,
                title: job.title,
                status: job.status,
                applications: job.applications.length,
                shortlisted: 0,
                interviewed: 0,
                hired: 0,
                rejected: 0,
                avgScore: 0
            };

            let jobTotalScore = 0;
            let jobScoredCount = 0;

            job.applications.forEach(app => {
                // Source tracking
                if (app.source === 'INTERNAL') internalCount++;
                else externalCount++;

                // ATS scoring
                if (app.atsScore > 0) {
                    totalAtsScore += app.atsScore;
                    scoredCount++;
                    jobTotalScore += app.atsScore;
                    jobScoredCount++;
                }

                // Funnel mapping
                funnel.applied++;
                if (['SCREENED', 'SHORTLISTED', 'INTERVIEW_PENDING', 'INTERVIEW_SCHEDULED', 'INTERVIEWED', 'INTERVIEW_COMPLETED', 'SELECTED', 'APPOINTED', 'HIRED'].includes(app.status)) funnel.screened++;
                if (['SHORTLISTED', 'INTERVIEW_PENDING', 'INTERVIEW_SCHEDULED', 'INTERVIEWED', 'INTERVIEW_COMPLETED', 'SELECTED', 'APPOINTED', 'HIRED'].includes(app.status)) {
                    funnel.shortlisted++;
                    jobStat.shortlisted++;
                }
                if (['INTERVIEW_SCHEDULED', 'INTERVIEWED', 'INTERVIEW_COMPLETED', 'SELECTED', 'APPOINTED', 'HIRED'].includes(app.status)) funnel.interviewScheduled++;
                if (['INTERVIEWED', 'INTERVIEW_COMPLETED', 'SELECTED', 'APPOINTED', 'HIRED'].includes(app.status)) {
                    funnel.interviewed++;
                    jobStat.interviewed++;
                }
                if (['SELECTED', 'APPOINTED', 'HIRED'].includes(app.status)) {
                    funnel.selected++;
                    funnel.hired++;
                    jobStat.hired++;

                    // Time-to-hire calculation
                    const created = new Date(app.createdAt);
                    const updated = new Date(app.updatedAt);
                    const days = Math.ceil((updated - created) / (1000 * 60 * 60 * 24));
                    totalTimeToHire += days;
                    hireCount++;
                }
                if (app.status === 'REJECTED') {
                    funnel.rejected++;
                    jobStat.rejected++;
                }
            });

            jobStat.avgScore = jobScoredCount > 0 ? Math.round(jobTotalScore / jobScoredCount) : 0;
            jobStats.push(jobStat);
        });

        const avgTimeToHire = hireCount > 0 ? Math.round(totalTimeToHire / hireCount) : 0;
        const avgAtsScore = scoredCount > 0 ? Math.round(totalAtsScore / scoredCount) : 0;

        res.json({
            summary: {
                totalJobs: jobs.length,
                activeJobs: jobs.filter(j => j.status === 'PUBLISHED' || j.status === 'OPEN').length,
                totalApplications: funnel.applied,
                hiredCount: funnel.hired,
                rejectedCount: funnel.rejected,
                avgTimeToHire,
                avgAtsScore,
                selectionRate: funnel.applied > 0 ? ((funnel.hired / funnel.applied) * 100).toFixed(1) : 0
            },
            funnel,
            sourceBreakdown: {
                internal: internalCount,
                external: externalCount
            },
            jobStats: jobStats.slice(0, 20)
        });
    } catch (error) {
        next(error);
    }
});

// ============= ACTIVITY FEED =============

/**
 * @route   GET /api/ats/activity
 * @desc    Get recent activity feed from audit logs
 * @access  Private (Employer)
 */
router.get('/activity', authenticate, authorize('EMPLOYER'), async (req, res, next) => {
    try {
        const { limit = 15 } = req.query;

        // Get recent audit logs for this employer's jobs
        const logs = await prisma.auditLog.findMany({
            where: {
                OR: [
                    { performedBy: req.user.id },
                    {
                        application: {
                            job: { employerId: req.user.id }
                        }
                    }
                ]
            },
            orderBy: { timestamp: 'desc' },
            take: parseInt(limit),
            include: {
                application: {
                    select: {
                        externalName: true,
                        externalEmail: true,
                        applicant: { select: { name: true, email: true } },
                        job: { select: { title: true } }
                    }
                }
            }
        });

        // Transform into activity feed items
        const activities = logs.map(log => {
            const candidateName = log.application?.applicant?.name || log.application?.externalName || 'Unknown';
            const jobTitle = log.application?.job?.title || 'Unknown Job';

            let message = '';
            let icon = 'info';

            switch (log.action) {
                case 'STATUS_CHANGE':
                    message = `${candidateName} moved to ${log.details?.newStatus} for ${jobTitle}`;
                    icon = 'status';
                    break;
                case 'SCHEDULED':
                    message = `Interview scheduled with ${candidateName} for ${jobTitle}`;
                    icon = 'interview';
                    break;
                case 'NOTE_ADDED':
                    message = `Note added for ${candidateName} on ${jobTitle}`;
                    icon = 'note';
                    break;
                case 'FEEDBACK_SUBMITTED':
                    message = `Interview feedback submitted for ${candidateName}`;
                    icon = 'feedback';
                    break;
                case 'CREATE':
                    message = `${candidateName} applied for ${jobTitle}`;
                    icon = 'apply';
                    break;
                default:
                    message = `${log.action} on ${log.entityType}`;
                    icon = 'info';
            }

            return {
                id: log.id,
                message,
                icon,
                action: log.action,
                entityType: log.entityType,
                timestamp: log.timestamp,
                details: log.details
            };
        });

        res.json(activities);
    } catch (error) {
        next(error);
    }
});

// ============= BULK ACTIONS =============

/**
 * @route   POST /api/ats/bulk-status
 * @desc    Bulk update application status
 * @access  Private (Employer)
 */
router.post('/bulk-status', authenticate, authorize('EMPLOYER'), async (req, res, next) => {
    try {
        const { applicationIds, status, notes } = req.body;

        if (!applicationIds || !Array.isArray(applicationIds) || applicationIds.length === 0) {
            return res.status(400).json({ error: 'applicationIds array is required' });
        }

        if (!status) {
            return res.status(400).json({ error: 'status is required' });
        }

        // Verify all applications belong to this employer
        const applications = await prisma.jobApplication.findMany({
            where: { id: { in: applicationIds } },
            include: { job: { select: { employerId: true } } }
        });

        const unauthorized = applications.filter(a => a.job.employerId !== req.user.id);
        if (unauthorized.length > 0) {
            return res.status(403).json({ error: 'Access denied: One or more applications do not belong to you' });
        }

        // Update all applications
        const historyEntry = {
            status,
            updatedBy: req.user.id,
            timestamp: new Date(),
            notes: notes || 'Bulk update'
        };

        const results = await Promise.all(
            applications.map(app => {
                const existingHistory = app.statusHistory || [];
                return prisma.jobApplication.update({
                    where: { id: app.id },
                    data: {
                        status,
                        statusHistory: [...existingHistory, historyEntry]
                    }
                });
            })
        );

        // Create audit logs
        await Promise.all(
            applicationIds.map(id =>
                prisma.auditLog.create({
                    data: {
                        entityType: 'APPLICATION',
                        entityId: id,
                        action: 'BULK_STATUS_CHANGE',
                        performedBy: req.user.id,
                        details: { newStatus: status, notes, bulkCount: applicationIds.length },
                        applicationId: id
                    }
                })
            )
        );

        res.json({ updated: results.length, status });
    } catch (error) {
        next(error);
    }
});

// ============= JOB MANAGEMENT ENHANCEMENTS =============

/**
 * @route   GET /api/ats/job-stats/:jobId
 * @desc    Get detailed stats for a specific job
 * @access  Private (Employer)
 */
router.get('/job-stats/:jobId', authenticate, authorize('EMPLOYER'), async (req, res, next) => {
    try {
        const { jobId } = req.params;

        const job = await prisma.job.findUnique({
            where: { id: jobId },
            include: {
                applications: {
                    include: {
                        interviews: true,
                        applicant: {
                            select: {
                                enrollments: {
                                    include: {
                                        course: { select: { title: true, skills: true } }
                                    }
                                },
                                interviews: {
                                    where: { status: 'COMPLETED' },
                                    select: { score: true }
                                }
                            }
                        }
                    }
                }
            }
        });

        if (!job || job.employerId !== req.user.id) {
            return res.status(403).json({ error: 'Access denied' });
        }

        // Build skill match data
        const jobSkills = (job.skills || '').split(',').map(s => s.trim().toLowerCase()).filter(Boolean);

        const candidates = job.applications.map(app => {
            const name = app.source === 'INTERNAL' ? app.applicant?.name : app.externalName;

            // Get AI interview scores
            const aiScores = app.applicant?.interviews?.map(i => i.score).filter(Boolean) || [];
            const avgAiScore = aiScores.length > 0 ? Math.round(aiScores.reduce((a, b) => a + b, 0) / aiScores.length) : null;

            // Get courses completed
            const courses = app.applicant?.enrollments?.map(e => e.course.title) || [];

            // Calculate skill match
            const candidateSkills = [];
            app.applicant?.enrollments?.forEach(e => {
                if (e.course.skills) {
                    const s = typeof e.course.skills === 'string' ? e.course.skills.split(',') : [];
                    candidateSkills.push(...s.map(sk => sk.trim().toLowerCase()));
                }
            });

            const matchedSkills = jobSkills.filter(s => candidateSkills.includes(s));
            const skillMatchPct = jobSkills.length > 0 ? Math.round((matchedSkills.length / jobSkills.length) * 100) : 0;

            // Determine fit level
            let fitLevel = 'NEEDS_REVIEW';
            if (skillMatchPct >= 70 && (avgAiScore === null || avgAiScore >= 60)) fitLevel = 'BEST_FIT';
            else if (skillMatchPct >= 40 || (avgAiScore && avgAiScore >= 50)) fitLevel = 'GOOD_FIT';

            return {
                applicationId: app.id,
                name,
                status: app.status,
                atsScore: app.atsScore,
                aiScore: avgAiScore,
                skillMatchPct,
                matchedSkills,
                courses: courses.slice(0, 3),
                fitLevel,
                source: app.source
            };
        });

        // Pipeline breakdown
        const pipeline = {};
        job.applications.forEach(app => {
            pipeline[app.status] = (pipeline[app.status] || 0) + 1;
        });

        res.json({
            job: {
                id: job.id,
                title: job.title,
                skills: jobSkills,
                status: job.status
            },
            totalApplications: job.applications.length,
            pipeline,
            candidates: candidates.sort((a, b) => {
                // Sort: BEST_FIT first, then by skill match %
                const fitOrder = { BEST_FIT: 0, GOOD_FIT: 1, NEEDS_REVIEW: 2 };
                if (fitOrder[a.fitLevel] !== fitOrder[b.fitLevel]) return fitOrder[a.fitLevel] - fitOrder[b.fitLevel];
                return b.skillMatchPct - a.skillMatchPct;
            })
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
