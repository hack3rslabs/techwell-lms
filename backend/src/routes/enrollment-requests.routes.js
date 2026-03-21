const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate, authorize } = require('../middleware/auth');

const prisma = new PrismaClient();
const router = express.Router();

/**
 * @route   POST /api/enrollment-requests
 * @desc    Submit an enrollment request for a specific course
 * @access  Private (Student)
 */
router.post('/', authenticate, async (req, res, next) => {
    try {
        const { courseId, name, email, phone, qualification } = req.body;
        const userId = req.user.id;

        if (!courseId || !name || !email) {
            return res.status(400).json({ error: 'CourseId, Name, and Email are required' });
        }

        // Check if course exists
        const course = await prisma.course.findUnique({ where: { id: courseId } });
        if (!course) {
            return res.status(404).json({ error: 'Course not found' });
        }

        // Check if student is already enrolled directly (just in case)
        const existingEnrollment = await prisma.enrollment.findUnique({
            where: {
                userId_courseId: { userId, courseId }
            }
        });

        if (existingEnrollment) {
            return res.status(400).json({ error: 'You are already fully enrolled in this course.' });
        }

        // Check if there's already an existing request
        const existingRequest = await prisma.enrollmentRequest.findUnique({
            where: {
                userId_courseId: { userId, courseId }
            }
        });

        if (existingRequest) {
            if (existingRequest.status === 'REJECTED') {
                // Delete the old rejected request so the new submission has a fresh timestamp
                // and appears at the top of the admin's queue rather than being buried.
                await prisma.enrollmentRequest.delete({
                    where: { id: existingRequest.id }
                });
            } else {
                return res.status(400).json({ 
                    error: 'You have already requested enrollment for this course.',
                    request: existingRequest 
                });
            }
        }

        // Create new request
        const request = await prisma.enrollmentRequest.create({
            data: {
                userId,
                courseId,
                name,
                email,
                phone,
                qualification,
                status: 'PENDING'
            }
        });

        res.status(201).json({ message: 'Enrollment request submitted successfully.', request });
    } catch (error) {
        next(error);
    }
});

/**
 * @route   GET /api/enrollment-requests/my/:courseId
 * @desc    Get the current user's enrollment request for a course
 * @access  Private (Student)
 */
router.get('/my/:courseId', authenticate, async (req, res, next) => {
    try {
        const { courseId } = req.params;
        const userId = req.user.id;

        const request = await prisma.enrollmentRequest.findUnique({
            where: {
                userId_courseId: { userId, courseId }
            }
        });

        if (!request) {
            return res.json({ request: null });
        }

        res.json({ request });
    } catch (error) {
        next(error);
    }
});

/**
 * @route   GET /api/enrollment-requests
 * @desc    Get all enrollment requests (with course and user info)
 * @access  Private (Admin / Staff)
 */
router.get('/', authenticate, authorize('ADMIN', 'SUPER_ADMIN', 'STAFF'), async (req, res, next) => {
    try {
        const requests = await prisma.enrollmentRequest.findMany({
            include: {
                course: {
                    select: { id: true, title: true, price: true }
                },
                user: {
                    select: { id: true, name: true, email: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        res.json({ requests });
    } catch (error) {
        next(error);
    }
});

/**
 * @route   PUT /api/enrollment-requests/:id/status
 * @desc    Approve or reject an enrollment request
 * @access  Private (Admin / Staff)
 */
router.put('/:id/status', authenticate, authorize('ADMIN', 'SUPER_ADMIN', 'STAFF'), async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // 'APPROVED' or 'REJECTED'

        if (!['APPROVED', 'REJECTED'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status. Must be APPROVED or REJECTED.' });
        }

        const existingRequest = await prisma.enrollmentRequest.findUnique({
            where: { id }
        });

        if (!existingRequest) {
            return res.status(404).json({ error: 'Enrollment request not found' });
        }

        // Perform status update and enrollment handling within a transaction
        const result = await prisma.$transaction(async (tx) => {
            const request = await tx.enrollmentRequest.update({
                where: { id },
                data: { status }
            });

            if (status === 'APPROVED') {
                // Ensure enrollment exists or create it
                const existingEnrollment = await tx.enrollment.findUnique({
                    where: {
                        userId_courseId: {
                            userId: request.userId,
                            courseId: request.courseId
                        }
                    }
                });

                if (!existingEnrollment) {
                    await tx.enrollment.create({
                        data: {
                            userId: request.userId,
                            courseId: request.courseId
                        }
                    });
                }
            } else if (status === 'REJECTED') {
                // Delete existing enrollment if they were revoked
                await tx.enrollment.deleteMany({
                    where: {
                        userId: request.userId,
                        courseId: request.courseId
                    }
                });
            }

            return request;
        });

        res.json({ message: `Enrollment request ${status.toLowerCase()}`, request: result });
    } catch (error) {
        if (error.code === 'P2025') {
            return res.status(404).json({ error: 'Enrollment request not found' });
        }
        next(error);
    }
});

module.exports = router;
