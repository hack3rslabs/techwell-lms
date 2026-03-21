const express = require('express');
const { z } = require('zod');
const { PrismaClient } = require('@prisma/client');
const { authenticate, authorize, optionalAuth } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL } } });

console.log('Loading Course Routes...');

// Validation schemas
const createCourseSchema = z.object({
    title: z.string().min(3, 'Title must be at least 3 characters'),
    description: z.string().min(10, 'Description must be at least 10 characters'),
    thumbnail: z.string().url().optional(),
    category: z.string().min(2),
    difficulty: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']).default('BEGINNER'),
    price: z.number().min(0).default(0),
    discountPrice: z.number().min(0).default(0),
    courseCode: z.string().optional(),
    jobRoles: z.array(z.string()).optional(),
    bannerUrl: z.string().url().optional(),
    // Course Types
    courseType: z.enum(['RECORDED', 'LIVE', 'HYBRID']).default('RECORDED'),
    liveSchedule: z.any().optional(),
    hybridConfig: z.any().optional(),
    // Interview Integration
    hasInterviewPrep: z.boolean().default(false),
    interviewPrice: z.number().min(0).default(0),
    bundlePrice: z.number().min(0).default(0)
});

/**
 * @route   DELETE /api/courses/:id
 * @desc    Delete a course
 * @access  Private/Admin/Instructor
 */
router.delete('/:id', authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'INSTRUCTOR'), async (req, res, next) => {
    console.log(`[DEBUG] Attempting to delete course: ${req.params.id} by user: ${req.user.id}`);
    try {
        const courseId = req.params.id;
        const userId = req.user.id;
        const userRole = req.user.role;

        const course = await prisma.course.findUnique({
            where: { id: courseId }
        });

        if (!course) {
            console.log(`[DEBUG] Course not found: ${courseId}`);
            return res.status(404).json({ error: 'Course not found' });
        }

        // Only allow admins or the creator (instructor) to delete
        if (!['SUPER_ADMIN', 'ADMIN'].includes(userRole) && course.instructorId !== userId) {
            console.log(`[DEBUG] Access denied for user: ${userId} role: ${userRole}`);
            return res.status(403).json({ error: 'Access denied. You can only delete your own courses.' });
        }

        await prisma.course.delete({
            where: { id: courseId }
        });

        console.log(`[DEBUG] Course deleted successfully: ${courseId}`);
        res.json({ message: 'Course deleted successfully' });
    } catch (error) {
        console.error('[DEBUG] Delete course error:', error);
        next(error);
    }
});

/**
 * @route   GET /api/courses
 * @desc    Get all published courses
 * @access  Public
 */
router.get('/', optionalAuth, async (req, res, next) => {
    try {
        const { category, difficulty, search, page = 1, limit = 12 } = req.query;

        const where = {};

        // If NOT admin, only show published
        // But if admin, they might want to see all?
        // Actually, the public (students) use this endpoint. 
        // Admin usually wants a separate endpoint or a flag.
        // Let's keep this as public catalog mostly, but allows admins to see all if they pass ?all=true?
        // Or better: Admins use a different way? 
        // "AdminCoursesPage" uses this endpoint.

        const isAdmin = req.user && ['SUPER_ADMIN', 'ADMIN'].includes(req.user.role);

        if (!isAdmin) {
            where.isPublished = true;
        }

        if (category) where.category = category;
        if (difficulty) where.difficulty = difficulty;
        if (search) {
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } }
            ];
        }

        const [courses, total] = await Promise.all([
            prisma.course.findMany({
                where,
                select: {
                    id: true,
                    title: true,
                    description: true,
                    thumbnail: true,
                    category: true,
                    difficulty: true,
                    price: true,
                    isPublished: true, // Add this
                    _count: {
                        select: {
                            modules: true,
                            enrollments: true
                        }
                    }
                },
                skip: (Number(page) - 1) * Number(limit),
                take: Number(limit),
                orderBy: { createdAt: 'desc' }
            }),
            prisma.course.count({ where })
        ]);

        let coursesWithEnrollment = courses;
        if (req.user && courses.length > 0) {
            const courseIds = courses.map(c => c.id);
            const enrollments = await prisma.enrollment.findMany({
                where: {
                    userId: req.user.id,
                    courseId: { in: courseIds }
                },
                select: { courseId: true }
            });
            const enrolledCourseIds = new Set(enrollments.map(e => e.courseId));
            coursesWithEnrollment = courses.map((c) => ({
                ...c,
                isEnrolled: enrolledCourseIds.has(c.id)
            }));
        } else {
            coursesWithEnrollment = courses.map((c) => ({ ...c, isEnrolled: false }));
        }

        res.json({
            courses: coursesWithEnrollment,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / Number(limit))
            }
        });
    } catch (error) {
        next(error);
    }
});

/**
 * @route   GET /api/courses/my/created
 * @desc    Get courses created by the instructor
 * @access  Private/Instructor
 */
router.get('/my/created', authenticate, authorize('INSTRUCTOR', 'ADMIN', 'SUPER_ADMIN'), async (req, res, next) => {
    try {
        const courses = await prisma.course.findMany({
            where: { instructorId: req.user.id },
            orderBy: { createdAt: 'desc' },
            include: {
                _count: { select: { modules: true, enrollments: true } }
            }
        });
        res.json({ courses });
    } catch (error) {
        next(error);
    }
});

/**
 * @route   GET /api/courses/:id
 * @desc    Get course details with modules
 * @access  Public
 */
router.get('/:id', optionalAuth, async (req, res, next) => {
    try {
        const course = await prisma.course.findUnique({
            where: { id: req.params.id },
            include: {
                modules: {
                    orderBy: { orderIndex: 'asc' },
                    include: {
                        lessons: {
                            orderBy: { order: 'asc' },
                            select: {
                                id: true,
                                title: true,
                                duration: true,
                                order: true
                            }
                        }
                    }
                },
                _count: {
                    select: { enrollments: true }
                }
            }
        });

        if (!course) {
            return res.status(404).json({ error: 'Course not found' });
        }

        // Check if user is enrolled
        let isEnrolled = false;
        if (req.user) {
            const enrollment = await prisma.enrollment.findUnique({
                where: {
                    userId_courseId: {
                        userId: req.user.id,
                        courseId: course.id
                    }
                }
            });
            isEnrolled = !!enrollment;
        }

        res.json({ course, isEnrolled });
    } catch (error) {
        next(error);
    }
});



/**
 * @route   PATCH /api/courses/:id/status
 * @desc    Update course publish status (Draft, Review, Published)
 * @access  Private/Admin
 */
router.patch('/:id/status', authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'INSTRUCTOR'), async (req, res, next) => {
    try {
        const { status } = req.body;
        // status enum: DRAFT, IN_REVIEW, PUBLISHED, ARCHIVED

        const updateData = {
            publishStatus: status,
        };

        if (status === 'PUBLISHED') {
            updateData.isPublished = true;
            updateData.publishedAt = new Date();
        } else if (status === 'IN_REVIEW') {
            updateData.submittedForReviewAt = new Date();
        } else {
            updateData.isPublished = false;
        }

        const course = await prisma.course.update({
            where: { id: req.params.id },
            data: updateData
        });

        res.json({ message: 'Course status updated', course });
    } catch (error) {
        next(error);
    }
});

/**
 * @route   POST /api/courses
 * @desc    Create a new course (Admin/Instructor only)
 * @access  Private/Admin
 */
router.post('/', authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'INSTRUCTOR'), async (req, res, next) => {
    try {
        // Pre-process empty strings to null/undefined
        const body = { ...req.body };
        ['courseCode', 'bannerUrl', 'thumbnail'].forEach(field => {
            if (body[field] === '') body[field] = undefined;
        });

        const validatedData = createCourseSchema.parse(body);

        const course = await prisma.course.create({
            data: {
                ...validatedData,
                price: validatedData.price,
                discountPrice: validatedData.discountPrice,
                instructorId: req.user.id
            }
        });

        res.status(201).json({ message: 'Course created', course });
    } catch (error) {
        next(error);
    }
});

/**
 * @route   PUT /api/courses/:id
 * @desc    Update course basic details
 * @access  Private/Admin/Instructor
 */
router.put('/:id', authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'INSTRUCTOR'), async (req, res, next) => {
    try {
        const body = { ...req.body };
        ['courseCode', 'bannerUrl', 'thumbnail'].forEach(field => {
            if (body[field] === '') body[field] = undefined;
        });

        // Use partial schema for updates
        const updateSchema = createCourseSchema.partial();
        const validatedData = updateSchema.parse(body);

        const course = await prisma.course.update({
            where: { id: req.params.id },
            data: {
                ...validatedData,
                price: validatedData.price,
                discountPrice: validatedData.discountPrice
            }
        });

        res.json({ message: 'Course updated', course });
    } catch (error) {
        next(error);
    }
});

/**
 * @route   POST /api/courses/:id/enroll
 * @desc    Enroll in a course
 * @access  Private
 */
router.post('/:id/enroll', authenticate, async (req, res, next) => {
    try {
        const course = await prisma.course.findUnique({
            where: { id: req.params.id }
        });

        if (!course) {
            return res.status(404).json({ error: 'Course not found' });
        }

        if (!course.isPublished) {
            return res.status(400).json({ error: 'Course is not available' });
        }

        // Check if already enrolled
        const existingEnrollment = await prisma.enrollment.findUnique({
            where: {
                userId_courseId: {
                    userId: req.user.id,
                    courseId: course.id
                }
            }
        });

        if (existingEnrollment) {
            return res.status(400).json({ error: 'Already enrolled in this course' });
        }

        const enrollment = await prisma.enrollment.create({
            data: {
                userId: req.user.id,
                courseId: course.id
            }
        });

        res.status(201).json({ message: 'Enrolled successfully', enrollment });
    } catch (error) {
        next(error);
    }
});

/**
 * @route   GET /api/courses/my/enrolled
 * @desc    Get user's enrolled courses
 * @access  Private
 */
router.get('/my/enrolled', authenticate, async (req, res, next) => {
    try {
        const enrollments = await prisma.enrollment.findMany({
            where: { userId: req.user.id },
            include: {
                course: {
                    select: {
                        id: true,
                        title: true,
                        thumbnail: true,
                        category: true,
                        difficulty: true
                    }
                }
            },
            orderBy: { enrolledAt: 'desc' }
        });

        res.json({ enrollments });
    } catch (error) {
        next(error);
    }
});

const { generateCourseStructure } = require('../services/ai-course.service');

/**
 * @route   POST /api/courses/generate
 * @desc    Generate a course structure using JSON-based Gemini AI
 * @access  Private/Admin
 */
router.post('/generate', authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'INSTRUCTOR'), async (req, res, next) => {
    try {
        const { topic, difficulty } = req.body;
        if (!topic) return res.status(400).json({ error: 'Topic is required' });

        const courseData = await generateCourseStructure(topic, difficulty);
        res.json({ courseData });
    } catch (error) {
        next(error);
    }
});

/**
 * @route   PUT /api/courses/:id/curriculum
 * @desc    Update/Replace entire course curriculum (Modules + Lessons)
 * @access  Private/Admin
 */
router.put('/:id/curriculum', authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'INSTRUCTOR'), async (req, res, next) => {
    try {
        const { modules } = req.body;
        const courseId = req.params.id;

        // Non-destructive update strategy: Upsert
        // We iterate and update/create.
        // Missing items: For now, we don't delete to be ultra-safe with progress.
        // In a real LMS, we would mark them archived or soft-deleted.

        await prisma.$transaction(async (tx) => {
            for (const mod of modules) {
                // Upsert Module
                let moduleRecord;
                if (mod.id && mod.id.startsWith('mod_') === false) { // Check if valid ID
                    moduleRecord = await tx.module.upsert({
                        where: { id: mod.id },
                        update: {
                            title: mod.title,
                            description: mod.description,
                            orderIndex: mod.orderIndex,
                            isPublished: mod.isPublished !== undefined ? mod.isPublished : true // Default publish on save
                        },
                        create: {
                            courseId,
                            title: mod.title,
                            description: mod.description,
                            orderIndex: mod.orderIndex,
                            isPublished: true
                        }
                    });
                } else {
                    // Create new
                    moduleRecord = await tx.module.create({
                        data: {
                            courseId,
                            title: mod.title,
                            description: mod.description,
                            orderIndex: mod.orderIndex,
                            isPublished: true
                        }
                    });
                }

                // Upsert Lessons
                if (mod.lessons && mod.lessons.length > 0) {
                    for (const l of mod.lessons) {
                        const lessonData = {
                            title: l.title,
                            content: l.content, // Rich text or PDF url
                            videoUrl: l.videoUrl,
                            duration: l.duration,
                            order: l.order,
                            type: l.type || 'VIDEO',
                            isPublished: l.isPublished !== undefined ? l.isPublished : true,
                            isPreview: l.isPreview || false,
                            settings: l.settings || {}, // Quiz/Assignment config
                            moduleId: moduleRecord.id
                        };

                        if (l.id && l.id.startsWith('les_') === false) {
                            await tx.lesson.upsert({
                                where: { id: l.id },
                                update: lessonData,
                                create: lessonData
                            });
                            // If Quiz type, handle quizzes relation?
                            // Complex nested upsert. For V1 we assume standard lessons or separate quiz endpoints.
                            // If `l.quizzes` exists and type is QUIZ, we should handle it.
                            if (l.quizzes && l.quizzes.length > 0) {
                                // Simple re-create for quizzes as they don't have progress directly (LessonProgress has Score)
                                // Only IF we want to update questions.
                                // Better to use Granular Quiz Builder for editing questions to avoid complexity here.
                            }
                        } else {
                            await tx.lesson.create({
                                data: { ...lessonData, moduleId: moduleRecord.id }
                            });
                        }
                    }
                }
            }
        });

        res.json({ message: 'Curriculum updated successfully' });
    } catch (error) {
        next(error);
    }
});
const lmsService = require('../services/lms.service');

/**
 * @route   GET /api/courses/:id/learn
 * @desc    Get full course content for learning (Enrolled users only)
 * @access  Private
 */
router.get('/:id/learn', authenticate, async (req, res, next) => {
    try {
        const courseId = req.params.id;
        const userId = req.user.id;

        // Check Enrollment
        const enrollment = await prisma.enrollment.findUnique({
            where: {
                userId_courseId: { userId, courseId }
            }
        });

        if (!enrollment) {
            return res.status(403).json({ error: 'Access denied. Not enrolled.' });
        }

        // Use LMS Service to get structured view with Locks
        const courseData = await lmsService.getStudentCourseView(userId, courseId);
        res.json({ course: courseData });
    } catch (error) {
        next(error);
    }
});

/**
 * @route   POST /api/courses/:courseId/lessons/:lessonId/complete
 * @desc    Mark a lesson as complete & check for course completion
 * @access  Private
 */
router.post('/:courseId/lessons/:lessonId/complete', authenticate, async (req, res, next) => {
    try {
        const { courseId, lessonId } = req.params;
        const userId = req.user.id;
        const { timeSpent, score } = req.body;

        const result = await lmsService.updateLessonProgress(userId, lessonId, { timeSpent, score });

        if (result.courseCompleted) {
            // Trigger Certificate Generation if not exists
            const existingCert = await prisma.certificate.findFirst({
                where: { userId, courseId }
            });

            if (!existingCert) {
                // Return flag to frontend to show "Claim Certificate" button
                // Or call internal certificate generation logic here
            }
        }

        res.json(result);
    } catch (error) {
        next(error);
    }
});

// ============= TRAINER MANAGMENT ROUTES (GRANULAR) =============

/**
 * @route   POST /api/courses/:id/modules
 * @desc    Add a module to a course
 * @access  Private/Instructor
 */
router.post('/:id/modules', authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'INSTRUCTOR'), async (req, res, next) => {
    try {
        const { title, description, orderIndex } = req.body;
        const module = await prisma.module.create({
            data: {
                courseId: req.params.id,
                title,
                description,
                orderIndex: orderIndex || 0,
                isPublished: false // Draft by default
            }
        });
        res.status(201).json(module);
    } catch (error) {
        next(error);
    }
});

/**
 * @route   PUT /api/courses/modules/:moduleId
 * @desc    Update a module
 * @access  Private/Instructor
 */
router.put('/modules/:moduleId', authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'INSTRUCTOR'), async (req, res, next) => {
    try {
        const { title, description, orderIndex, isPublished } = req.body;
        const module = await prisma.module.update({
            where: { id: req.params.moduleId },
            data: { title, description, orderIndex, isPublished }
        });
        res.json(module);
    } catch (error) {
        next(error);
    }
});

/**
 * @route   POST /api/courses/modules/:moduleId/lessons
 * @desc    Add a lesson to a module
 * @access  Private/Instructor
 */
router.post('/modules/:moduleId/lessons', authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'INSTRUCTOR'), async (req, res, next) => {
    try {
        const { title, type, order } = req.body;
        const lesson = await prisma.lesson.create({
            data: {
                moduleId: req.params.moduleId,
                title,
                type: type || 'VIDEO',
                order: order || 0,
                isPublished: false // Draft
            }
        });
        res.status(201).json(lesson);
    } catch (error) {
        next(error);
    }
});

/**
 * @route   PUT /api/courses/lessons/:lessonId
 * @desc    Update a lesson (Content, Settings, Publish)
 * @access  Private/Instructor
 */
router.put('/lessons/:lessonId', authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'INSTRUCTOR'), async (req, res, next) => {
    try {
        const { title, content, videoUrl, duration, type, isPublished, isPreview, settings, resources } = req.body;
        const lesson = await prisma.lesson.update({
            where: { id: req.params.lessonId },
            data: {
                title, content, videoUrl, duration, type, isPublished, isPreview,
                settings, resources
            }
        });
        res.json(lesson);
    } catch (error) {
        next(error);
    }
});


module.exports = router;
