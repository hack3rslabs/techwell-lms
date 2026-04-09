const express = require('express');
const { z } = require('zod');
const { PrismaClient } = require('@prisma/client');
const { authenticate, authorize } = require('../middleware/auth');
const trainerService = require('../services/trainer.service');

const router = express.Router();
const prisma = new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL } } });

// ============= BATCH MANAGEMENT =============

/**
 * GET /api/trainer/batches
 * Get all batches assigned to the current instructor
 */
router.get('/batches', authenticate, authorize('INSTRUCTOR', 'ADMIN', 'INSTITUTE_ADMIN'), async (req, res, next) => {
    try {
        const batches = await trainerService.getTrainerBatches(req.user.id);
        res.json(batches);
    } catch (error) {
        next(error);
    }
});

/**
 * POST /api/trainer/batches
 * Create a new batch
 */
router.post('/batches', authenticate, authorize('INSTRUCTOR', 'ADMIN', 'INSTITUTE_ADMIN'), async (req, res, next) => {
    try {
        const { name, courseId, description, startDate, endDate, maxStudents } = req.body;

        // Verify course ownership
        const course = await prisma.course.findUnique({ where: { id: courseId } });
        if (!course || course.instructorId !== req.user.id) {
            return res.status(403).json({ error: 'Unauthorized: You can only create batches for your own courses' });
        }

        const batch = await prisma.batch.create({
            data: {
                name,
                courseId,
                instructorId: req.user.id,
                description,
                startDate: startDate ? new Date(startDate) : null,
                endDate: endDate ? new Date(endDate) : null,
                maxStudents: maxStudents ? parseInt(maxStudents) : null
            }
        });

        res.status(201).json(batch);
    } catch (error) {
        next(error);
    }
});

// ============= STUDENT PROGRESS =============

/**
 * GET /api/trainer/students
 * Get all students across batches or filter by batchId
 */
router.get('/students', authenticate, authorize('INSTRUCTOR', 'ADMIN', 'INSTITUTE_ADMIN'), async (req, res, next) => {
    try {
        const { batchId } = req.query;
        const students = await trainerService.getTrainerStudents(req.user, batchId);
        res.json(students);
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/trainer/students/:studentId/progress
 * Get detailed progress for a specific student in a specific course
 */
router.get('/students/:studentId/progress', authenticate, authorize('INSTRUCTOR', 'ADMIN', 'INSTITUTE_ADMIN'), async (req, res, next) => {
    try {
        const { studentId } = req.params;
        const { courseId } = req.query;

        if (!courseId) return res.status(400).json({ error: 'Course ID is required' });

        const progress = await trainerService.getStudentDetailedProgress(req.user, studentId, courseId);
        res.json(progress);
    } catch (error) {
        next(error);
    }
});

// ============= DASHBOARD STATS =============

/**
 * GET /api/trainer/stats
 */
router.get('/stats', authenticate, authorize('INSTRUCTOR', 'ADMIN', 'INSTITUTE_ADMIN'), async (req, res, next) => {
    try {
        const stats = await trainerService.getTrainerStats(req.user.id);
        res.json(stats);
    } catch (error) {
        next(error);
    }
});

// ============= ASSIGNMENT GRADING =============

/**
 * GET /api/trainer/assessments
 * Get all assignment submissions for courses taught by this instructor
 */
router.get('/assessments', authenticate, authorize('INSTRUCTOR', 'ADMIN', 'INSTITUTE_ADMIN'), async (req, res, next) => {
    try {
        const submissions = await prisma.assignmentSubmission.findMany({
            where: {
                lesson: {
                    module: {
                        course: {
                            instructorId: req.user.id
                        }
                    }
                }
            },
            include: {
                user: {
                    select: { id: true, name: true, email: true, avatar: true }
                },
                lesson: {
                    select: {
                        id: true,
                        title: true,
                        module: {
                            select: {
                                title: true,
                                course: {
                                    select: { title: true }
                                }
                            }
                        }
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        res.json(submissions);
    } catch (error) {
        next(error);
    }
});

/**
 * POST /api/trainer/assessments/grade
 * Grade a submission
 */
router.post('/assessments/grade', authenticate, authorize('INSTRUCTOR', 'ADMIN', 'INSTITUTE_ADMIN'), async (req, res, next) => {
    try {
        const { submissionId, grade, feedback, status } = req.body;

        // Verify ownership via lesson -> module -> course -> instructor
        const submission = await prisma.assignmentSubmission.findUnique({
            where: { id: submissionId },
            include: { lesson: { include: { module: { include: { course: true } } } } }
        });

        if (!submission) return res.status(404).json({ error: 'Submission not found' });

        if (submission.lesson.module.course.instructorId !== req.user.id) {
            return res.status(403).json({ error: 'Unauthorized to grade this submission' });
        }

        const updated = await prisma.assignmentSubmission.update({
            where: { id: submissionId },
            data: {
                grade: parseInt(grade),
                feedback,
                status: status || 'GRADED'
            }
        });

        // Trigger notification to student (Future enhancement)

        res.json(updated);
    } catch (error) {
        next(error);
    }
});

// ============= ANNOUNCEMENTS =============

/**
 * GET /api/trainer/announcements
 * Get all announcements created by this instructor
 */
router.get('/announcements', authenticate, authorize('INSTRUCTOR', 'ADMIN', 'INSTITUTE_ADMIN'), async (req, res, next) => {
    try {
        const announcements = await prisma.announcement.findMany({
            where: { instructorId: req.user.id },
            include: {
                course: { select: { title: true } },
                batch: { select: { name: true } }
            },
            orderBy: { createdAt: 'desc' }
        });

        res.json(announcements);
    } catch (error) {
        next(error);
    }
});

/**
 * POST /api/trainer/announcements
 * Create a new announcement
 */
router.post('/announcements', authenticate, authorize('INSTRUCTOR', 'ADMIN', 'INSTITUTE_ADMIN'), async (req, res, next) => {
    try {
        const { title, content, priority, courseId, batchId } = req.body;

        if (!title || !content) {
            return res.status(400).json({ error: 'Title and content are required' });
        }

        // Verify ownership if courseId or batchId is provided
        if (courseId) {
            const course = await prisma.course.findUnique({ where: { id: courseId } });
            if (!course || course.instructorId !== req.user.id) {
                return res.status(403).json({ error: 'Unauthorized: You can only announce to your own courses' });
            }
        }

        if (batchId) {
            const batch = await prisma.batch.findUnique({ where: { id: batchId } });
            if (!batch || batch.instructorId !== req.user.id) {
                return res.status(403).json({ error: 'Unauthorized: You can only announce to your own batches' });
            }
        }

        const announcement = await prisma.announcement.create({
            data: {
                title,
                content,
                priority: priority || 'NORMAL',
                instructorId: req.user.id,
                courseId: courseId || null,
                batchId: batchId || null
            }
        });

        res.status(201).json(announcement);
    } catch (error) {
        next(error);
    }
});

/**
 * DELETE /api/trainer/announcements/:id
 * Delete an announcement
 */
router.delete('/announcements/:id', authenticate, authorize('INSTRUCTOR', 'ADMIN', 'INSTITUTE_ADMIN'), async (req, res, next) => {
    try {
        const { id } = req.params;

        const announcement = await prisma.announcement.findUnique({ where: { id } });
        if (!announcement) {
            return res.status(404).json({ error: 'Announcement not found' });
        }

        if (announcement.instructorId !== req.user.id) {
            return res.status(403).json({ error: 'Unauthorized to delete this announcement' });
        }

        await prisma.announcement.delete({ where: { id } });

        res.json({ message: 'Announcement deleted' });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
