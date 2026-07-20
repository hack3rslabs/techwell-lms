const express = require('express');
const { z } = require('zod');
const { PrismaClient } = require('@prisma/client');
const { authenticate, authorize, checkPermission, optionalAuth } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL } } });

console.log('Loading Course Routes...');

/**
 * @route   GET /api/courses/my/enrolled
 * @desc    Get user's enrolled courses
 * @access  Private
 */
router.get('/my/enrolled', authenticate, async (req, res, next) => {
    try {
        // Get all enrollments for this user
        const enrollments = await prisma.enrollment.findMany({
            where: { userId: req.user.id },
            include: { course: true },
            orderBy: { enrolledAt: 'desc' }
        });

        // Get all successful payments for this user
        const successfulPayments = await prisma.payment.findMany({
            where: {
                userId: req.user.id,
                status: { in: ['SUCCESS', 'success', 'captured', 'CAPTURED'] }
            },
            select: { courseId: true }
        });

        const paidCourseIds = new Set(successfulPayments.map(p => p.courseId));
        const enrollmentCourseIds = new Set(enrollments.map(e => e.courseId));

        // Combine logic: 
        // 1. Show existing ACTIVE/COMPLETED enrollments
        // 2. Show ANY enrollment that has a successful payment record (even if status is PENDING/null)
        // 3. Show FREE courses that are ACTIVE
        const filteredEnrollments = enrollments.filter(e => {
            // Safety check: if course was deleted but enrollment remains
            if (!e.course) return false;

            const isActive = ['ACTIVE', 'COMPLETED'].includes(e.status?.toUpperCase());
            const isPaid = paidCourseIds.has(e.courseId);

            // Check if free
            const effectivePrice = e.course.discountPrice !== null ? Number(e.course.discountPrice) : Number(e.course.price);
            const isFree = effectivePrice <= 0;

            return isPaid || isActive || isFree;
        });

        // Healing: If there's a successful payment but NO enrollment record at all,
        // we should ideally show it. We'll add it to the response so the student sees it.
        const missingPaidEnrollments = [];
        for (const paymentCourseId of paidCourseIds) {
            // Skip if no courseId (e.g. bundle payment or other type)
            if (!paymentCourseId) continue;

            if (!enrollmentCourseIds.has(paymentCourseId)) {
                const course = await prisma.course.findUnique({ where: { id: paymentCourseId } });
                if (course) {
                    missingPaidEnrollments.push({
                        id: `missing_${paymentCourseId}`,
                        userId: req.user.id,
                        courseId: paymentCourseId,
                        status: 'ACTIVE',
                        progress: 0,
                        course: course,
                        enrolledAt: new Date()
                    });
                }
            }
        }

        const finalResults = [...filteredEnrollments, ...missingPaidEnrollments];

        res.json({ enrollments: finalResults });
    } catch (error) {
        next(error);
    }
});

/**
 * @route   GET /api/courses/my/created
 * @desc    Get courses created by the instructor
 * @access  Private/Instructor
 */
router.get('/my/created', authenticate, async (req, res, next) => {
    try {
        if (!['INSTRUCTOR', 'ADMIN', 'SUPER_ADMIN'].includes(req.user.role) && !req.user.permissions?.includes('MANAGE_COURSES')) {
            return res.status(403).json({ error: 'Access denied' });
        }
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


// Validation schemas
const createCourseSchema = z.object({
    title: z.string().min(3, 'Title must be at least 3 characters'),
    description: z.string().min(10, 'Description must be at least 10 characters'),
    thumbnail: z.string().optional(),
    category: z.string().min(2),
    difficulty: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']).default('BEGINNER'),
    duration: z.number().int().min(0).default(0),
    price: z.number().min(0).default(0),
    discountPrice: z.number().min(0).default(0),
    courseCode: z.string().optional(),
    mandatoryCourseIds: z.array(z.string()).optional().default([]),
    suggestedCourseIds: z.array(z.string()).optional().default([]),
    jobRoles: z.array(z.string()).optional(),
    bannerUrl: z.string().optional(),
    // Course Types
    courseType: z.enum(['RECORDED', 'LIVE', 'HYBRID']).default('RECORDED'),
    liveSchedule: z.any().optional(),
    hybridConfig: z.any().optional(),
    // Interview Integration
    hasInterviewPrep: z.boolean().default(false),
    interviewPrice: z.number().min(0).default(0),
    bundlePrice: z.number().min(0).default(0),
    // New Marketing / Details fields
    jobPrep: z.boolean().optional(),
    fakeEnrolledCount: z.number().optional(),
    fakeRating: z.number().optional(),
    requireAdmissionFee: z.boolean().optional(),
    admissionFee: z.number().optional(),
    slug: z.string().optional(),
    seoTitle: z.string().optional(),
    metaDescription: z.string().optional(),
    targetKeywords: z.array(z.string()).optional(),
    faqs: z.any().optional(),
    careerOpportunities: z.any().optional(),
    salaryInsights: z.any().optional(),
    projects: z.any().optional(),
    prerequisites: z.any().optional(),
    learningOutcomes: z.any().optional(),
    toolsCovered: z.array(z.string()).optional()
});

/**
 * @route   DELETE /api/courses/:id
 * @desc    Delete a course
 * @access  Private/Admin/Instructor
 */
router.delete('/:id', authenticate, async (req, res, next) => {
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

        // Only allow users with MANAGE_COURSES permission or the creator (instructor) to delete
        const hasPermission = ['SUPER_ADMIN', 'ADMIN'].includes(req.user.role) || (req.user.rolePermissions?.COURSES?.canCreate || req.user.rolePermissions?.COURSES?.canUpdate) || req.user.permissions?.includes('ALL');
        if (!hasPermission && course.instructorId !== userId) {
            console.log(`[DEBUG] Access denied for user: ${userId} role: ${userRole}`);
            return res.status(403).json({ error: 'Access denied. You do not have permission to delete this course.' });
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
 * @route   GET /api/courses/list/all
 * @desc    Get all courses for dropdown selection
 * @access  Private
 */
router.get('/list/all', authenticate, async (req, res, next) => {
    try {
        const courses = await prisma.course.findMany({
            select: {
                id: true,
                title: true
            },
            orderBy: {
                title: 'asc'
            }
        });

        res.json({ courses });
    } catch (error) {
        next(error);
    }
});

/**
 * @route   GET /api/courses/manage/all
 * @desc    Get all courses for the admin course management screen
 * @access  Private/Admin or user with course read access
 */
router.get('/manage/all', authenticate, async (req, res, next) => {
    try {
        const hasCourseAccess =
            ['SUPER_ADMIN', 'ADMIN'].includes(req.user.role)
            || req.user.rolePermissions?.COURSES?.canRead
            || req.user.rolePermissions?.COURSES?.canCreate || req.user.rolePermissions?.COURSES?.canUpdate
            || req.user.permissions?.includes('ALL')
            || req.user.permissions?.includes('MANAGE_COURSES');

        if (!hasCourseAccess) {
            return res.status(403).json({ error: 'Access denied.' });
        }

        let { search, status = 'ALL', page = 1, limit = 24 } = req.query;
    if (search !== undefined) search = Array.isArray(search) ? search[0] : String(search);
    if (status !== undefined) status = Array.isArray(status) ? status[0] : String(status);

        const pageNum = Math.max(parseInt(page, 10) || 1, 1);
        const limitNum = Math.min(Math.max(parseInt(limit, 10) || 24, 1), 100);
        const where = {};

        if (status === 'PUBLISHED') where.isPublished = true;
        if (status === 'DRAFT') where.isPublished = false;

        if (typeof search === 'string' && String(search || '').trim()) {
            const query = String(search || '').trim();
            where.OR = [
                { title: { contains: query, mode: 'insensitive' } },
                { description: { contains: query, mode: 'insensitive' } },
                { category: { contains: query, mode: 'insensitive' } },
                { courseCode: { contains: query, mode: 'insensitive' } }
            ];
        }

        const [courses, total] = await Promise.all([
            prisma.course.findMany({
                where,
                include: {
                    _count: {
                        select: {
                            modules: true,
                            enrollments: true
                        }
                    }
                },
                orderBy: { createdAt: 'desc' },
                skip: (pageNum - 1) * limitNum,
                take: limitNum
            }),
            prisma.course.count({ where })
        ]);

        return res.json({
            courses,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                pages: Math.max(Math.ceil(total / limitNum), 1)
            }
        });
    } catch (error) {
        return next(error);
    }
});

/**
 * @route   GET /api/courses
 * @desc    Get all published courses
 * @access  Public
 */
router.get('/', optionalAuth, async (req, res, next) => {
    try {
        console.log('[COURSES GET] Fetching courses...');
        let { category, difficulty, search, page = 1, limit = 12 } = req.query;
    if (category !== undefined) category = Array.isArray(category) ? category[0] : String(category);
    if (difficulty !== undefined) difficulty = Array.isArray(difficulty) ? difficulty[0] : String(difficulty);
    if (search !== undefined) search = Array.isArray(search) ? search[0] : String(search);


        const where = {};

        // Robust parsing of page and limit to prevent NaN values crashing Prisma
        let pageNum = parseInt(page, 10);
        let limitNum = parseInt(limit, 10);
        if (isNaN(pageNum) || pageNum < 1) pageNum = 1;
        if (isNaN(limitNum) || limitNum < 1) limitNum = 12;

        const isAdmin = req.user && ['SUPER_ADMIN', 'ADMIN'].includes(req.user.role);

        if (!isAdmin) {
            where.isPublished = true;
        }

        // Clean query parameters to avoid Prisma database errors
        if (category && category !== 'ALL' && category !== 'undefined' && category !== 'null' && String(category || '').trim() !== '') {
            where.category = category;
        }

        const validDifficulties = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'];
        if (difficulty && validDifficulties.includes(String(difficulty || "").toUpperCase())) {
            where.difficulty = String(difficulty || "").toUpperCase();
        }

        if (search && String(search || '').trim() !== '') {
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } }
            ];
        }

        console.log('[COURSES GET] Query params:', { category, difficulty, search, pageNum, limitNum });
        console.log('[COURSES GET] Where clause:', where);

        const [courses, total] = await Promise.all([
            prisma.course.findMany({
                where,
                include: {
                    _count: {
                        select: {
                            modules: true,
                            enrollments: true
                        }
                    }
                },
                skip: (pageNum - 1) * limitNum,
                take: limitNum,
                orderBy: { createdAt: 'desc' }
            }),
            prisma.course.count({ where })
        ]);

        console.log(`[COURSES GET] Found ${courses.length} courses, total: ${total}`);

        let coursesWithEnrollment = courses;
        if (req.user && courses.length > 0) {
            try {
                const courseIds = courses.map(c => c.id);
                const enrollments = await prisma.enrollment.findMany({
                    where: {
                        userId: req.user.id,
                        courseId: { in: courseIds }
                    },
                    include: { course: { select: { id: true, price: true } } }
                });

                const enrolledCourseIds = new Set(
                    enrollments
                        .filter(e => ['ACTIVE', 'COMPLETED'].includes(e.status))
                        .map(e => e.courseId)
                );

                coursesWithEnrollment = courses.map((c) => ({
                    ...c,
                    isEnrolled: enrolledCourseIds.has(c.id)
                }));
            } catch (enrollErr) {
                console.error('[COURSES GET] Failed to fetch enrollments for user:', enrollErr);
                // Fallback gracefully without crash if database enrollment relation check fails
                coursesWithEnrollment = courses.map((c) => ({ ...c, isEnrolled: false }));
            }
        } else {
            coursesWithEnrollment = courses.map((c) => ({ ...c, isEnrolled: false }));
        }

        res.json({
            courses: coursesWithEnrollment,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                pages: Math.ceil(total / limitNum)
            }
        });
    } catch (error) {
        console.error('[COURSES GET] Error fetching courses:', error);
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

        const loadRelatedCourses = async (ids) => {
            if (!Array.isArray(ids) || Array.isArray(ids) ? ids.length : 0 === 0) {
                return [];
            }
            return await prisma.course.findMany({
                where: {
                    id: { in: ids }
                },
                select: {
                    id: true,
                    title: true,
                    price: true,
                    discountPrice: true,
                    bannerUrl: true,
                    duration: true,
                    difficulty: true
                }
            });
        };

        const suggestedCourses = await loadRelatedCourses(course.suggestedCourseIds || []);
        const mandatoryCourses = await loadRelatedCourses(course.mandatoryCourseIds || []);

        // Check if user is enrolled AND paid (if not free)
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

            if (enrollment) {
                isEnrolled = ['ACTIVE', 'COMPLETED'].includes(enrollment.status);
            }
        }

        res.json({
            course: {
                ...course,
                suggestedCourses,
                mandatoryCourses
            },
            isEnrolled
        });
    } catch (error) {
        next(error);
    }
});



/**
 * @route   PATCH /api/courses/:id/status
 * @desc    Update course publish status (Draft, Review, Published)
 * @access  Private/Admin
 */
router.patch('/:id/status', authenticate, async (req, res, next) => {
    try {
        const courseId = req.params.id;
        const course = await prisma.course.findUnique({ where: { id: courseId } });

        if (!course) return res.status(404).json({ error: 'Course not found' });

        const hasManagePermission = ['SUPER_ADMIN', 'ADMIN'].includes(req.user.role) || req.user.rolePermissions?.COURSES?.canUpdate || req.user.permissions?.includes('ALL');
        const hasPublishPermission = ['SUPER_ADMIN', 'ADMIN'].includes(req.user.role) || req.user.rolePermissions?.COURSES?.canUpdate || req.user.permissions?.includes('ALL');
        const isOwner = course.instructorId === req.user.id;

        // Needs Manage or Publish permission, OR be the owner to request review/publish
        if (!hasManagePermission && !hasPublishPermission && !isOwner) {
            return res.status(403).json({ error: 'Missing permission to update course status' });
        }
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

        const updatedCourse = await prisma.course.update({
            where: { id: req.params.id },
            data: updateData
        });

        res.json({ message: 'Course status updated', course: updatedCourse });
    } catch (error) {
        next(error);
    }
});

/**
 * @route   POST /api/courses
 * @desc    Create a new course (Admin/Instructor only)
 * @access  Private/Admin
 */
router.post('/', authenticate, async (req, res, next) => {
    const canCreate = ['SUPER_ADMIN', 'ADMIN', 'INSTRUCTOR'].includes(req.user.role) || req.user.rolePermissions?.COURSES?.canCreate || req.user.permissions?.includes('ALL');
    if (!canCreate) {
        return res.status(403).json({ error: 'Missing permission: MANAGE_COURSES' });
    }
    try {
        console.log('[DEBUG] POST /api/courses - Body received:', JSON.stringify(req.body, null, 2));

        // Pre-process empty strings to null/undefined
        const body = { ...req.body };
        ['courseCode', 'bannerUrl', 'thumbnail'].forEach(field => {
            if (body[field] === '') body[field] = undefined;
        });

        const validatedData = createCourseSchema.parse(body);

        // Remove undefined (optional) fields to avoid unique constraint issues
        const dataToCreate = {
            ...validatedData,
            price: validatedData.price,
            discountPrice: validatedData.discountPrice,
            instructorId: req.user.id
        };

        // Remove undefined optional fields
        Object.keys(dataToCreate).forEach(key => {
            if (dataToCreate[key] === undefined) {
                delete dataToCreate[key];
            }
        });

        console.log('[DEBUG] Prisma create data:', JSON.stringify(dataToCreate, null, 2));

        const course = await prisma.course.create({
            data: dataToCreate
        });

        console.log('[DEBUG] Course created with ID:', course.id);
        res.status(201).json({ message: 'Course created', course });
    } catch (error) {
        if (error.code === 'P2002') {
            const target = error.meta?.target || [];
            if (Array.isArray(target) && target.includes('courseCode')) {
                return res.status(400).json({ error: 'This course code is already in use. Please choose a unique code.' });
            }
            return res.status(400).json({ error: 'You already have a course with this title. Please choose a unique title for each of your courses.' });
        }
        console.error('[DEBUG] Course creation failed:', error.message);
        next(error);
    }
});

/**
 * @route   PUT /api/courses/:id
 * @desc    Update course basic details
 * @access  Private/Admin/Instructor
 */
router.put('/:id', authenticate, async (req, res, next) => {
    try {
        console.log('[DEBUG] PUT /api/courses/ update for ID:', req.params.id.replace(/[\r\n]/g, ''), '- Body received:', JSON.stringify(req.body, null, 2));

        const course = await prisma.course.findUnique({ where: { id: req.params.id } });
        if (!course) return res.status(404).json({ error: 'Course not found' });

        const canUpdate = ['SUPER_ADMIN', 'ADMIN'].includes(req.user.role) ||
            req.user.rolePermissions?.COURSES?.canCreate ||
            req.user.rolePermissions?.COURSES?.canUpdate ||
            req.user.permissions?.includes('ALL') ||
            course.instructorId === req.user.id;

        if (!canUpdate) {
            return res.status(403).json({ error: 'Access denied' });
        }
        const body = { ...req.body };
        ['courseCode', 'bannerUrl', 'thumbnail'].forEach(field => {
            if (body[field] === '') body[field] = undefined;
        });

        // Use partial schema for updates
        const updateSchema = createCourseSchema.partial();
        const validatedData = updateSchema.parse(body);

        console.log(`[DEBUG] Prisma update data:`, JSON.stringify(validatedData, null, 2));

        const updatedCourse = await prisma.course.update({
            where: { id: req.params.id },
            data: {
                ...validatedData,
                price: validatedData.price,
                discountPrice: validatedData.discountPrice
            }
        });

        console.log('[DEBUG] Course updated with ID:', updatedCourse.id);
        res.json({ message: 'Course updated', course: updatedCourse });
    } catch (error) {
        if (error.code === 'P2002') {
            const target = error.meta?.target || [];
            if (Array.isArray(target) && target.includes('courseCode')) {
                return res.status(400).json({ error: 'This course code is already in use. Please choose a unique code.' });
            }
            return res.status(400).json({ error: 'You already have a course with this title. Please choose a unique title for each of your courses.' });
        }
        console.error('[DEBUG] Course update failed:', error.message);
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

        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            select: {
                name: true,
                email: true,
                phone: true,
                qualification: true,
                college: true,
                dob: true
            }
        });

        if (!user?.name || !user?.email) {
            return res.status(400).json({ error: 'Complete your profile before showing interest in a course.' });
        }

        const interestNote = `Interested in course: ${course.title}`;
        const existingLead = await prisma.lead.findFirst({
            where: { email: user.email }
        });

        // Always create a new lead for every interest/enrollment as requested
        const lead = await prisma.lead.create({
            data: {
                name: user.name,
                email: user.email,
                phone: user.phone || null,
                qualification: user.qualification || null,
                college: user.college || null,
                dob: user.dob || null,
                source: 'Course Enrollment',
                status: 'INTERESTED',
                notes: interestNote,
                courseId: course.id,
                courseName: course?.title || 'Unknown Course'
            }
        });

        res.status(200).json({
            message: 'Interest captured successfully. Our team can follow up from Leads.',
            leadId: lead.id
        });
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
router.post('/generate', authenticate, checkPermission('COURSES'), async (req, res, next) => {
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
router.put('/:id/curriculum', authenticate, async (req, res, next) => {
    try {
        const course = await prisma.course.findUnique({ where: { id: req.params.id } });
        if (!course) return res.status(404).json({ error: 'Course not found' });

        const canUpdate = ['SUPER_ADMIN', 'ADMIN'].includes(req.user.role) ||
            req.user.permissions?.includes('MANAGE_COURSES') ||
            req.user.permissions?.includes('ALL') ||
            course.instructorId === req.user.id;

        if (!canUpdate) {
            return res.status(403).json({ error: 'Access denied' });
        }
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
            },
            include: { course: true }
        });

        if (!enrollment) {
            return res.status(403).json({ error: 'Access denied. Not enrolled.' });
        }

        // Check Enrollment status
        if (!['ACTIVE', 'COMPLETED'].includes(enrollment.status)) {
            return res.status(403).json({ error: 'Access denied. Enrollment is not active.' });
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
            // Find Enrollment
            const enrollment = await prisma.enrollment.findFirst({
                where: { userId, courseId, status: 'ACTIVE' }
            });

            if (enrollment) {
                // Check for pending installments for this enrollment
                const pendingInstallments = await prisma.installment.count({
                    where: {
                        payment: {
                            enrollmentId: enrollment.id
                        },
                        status: 'PENDING'
                    }
                });

                if (pendingInstallments === 0) {
                    // Unlock AI Interview Access
                    await prisma.user.update({
                        where: { id: userId },
                        data: { hasAiInterviewAccess: true }
                    });
                    result.aiInterviewUnlocked = true;
                }
            }

            // Trigger Certificate Generation if not exists
            const existingCert = await prisma.certificate.findFirst({
                where: { userId, courseId }
            });

            if (!existingCert) {
                // Return flag to frontend to show "Claim Certificate" button
                result.certificateAvailable = true;
            }
        }

        res.json(result);
    } catch (error) {
        next(error);
    }
});

/**
 * @route   POST /api/courses/:courseId/heartbeat
 * @desc    Record student heartbeat (minutes spent connected)
 * @access  Private
 */
router.post('/:courseId/heartbeat', authenticate, async (req, res, next) => {
    try {
        const { courseId } = req.params;
        const userId = req.user.id;
        
        // Find enrollment and batch
        const enrollment = await prisma.enrollment.findFirst({
            where: { userId, courseId, status: 'ACTIVE' }
        });

        if (!enrollment || !enrollment.batchId) {
            return res.status(200).json({ message: 'Heartbeat ignored (no active batch)' });
        }

        // Use current date (start of day) for unique constraint
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Upsert attendance record for today
        await prisma.attendance.upsert({
            where: {
                batchId_userId_date: {
                    batchId: enrollment.batchId,
                    userId: userId,
                    date: today
                }
            },
            update: {
                minutesSpent: { increment: 1 },
                status: 'PRESENT'
            },
            create: {
                batchId: enrollment.batchId,
                userId: userId,
                date: today,
                status: 'PRESENT',
                minutesSpent: 1,
                notes: 'Auto-recorded via student portal heartbeat'
            }
        });

        res.status(200).json({ success: true });
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
router.post('/:id/modules', authenticate, async (req, res, next) => {
    try {
        const course = await prisma.course.findUnique({ where: { id: req.params.id } });
        if (!course) return res.status(404).json({ error: 'Course not found' });

        const canUpdate = ['SUPER_ADMIN', 'ADMIN'].includes(req.user.role) ||
            req.user.permissions?.includes('MANAGE_COURSES') ||
            req.user.permissions?.includes('ALL') ||
            course.instructorId === req.user.id;

        if (!canUpdate) return res.status(403).json({ error: 'Access denied' });
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
router.put('/modules/:moduleId', authenticate, async (req, res, next) => {
    try {
        const module = await prisma.module.findUnique({
            where: { id: req.params.moduleId },
            include: { course: true }
        });
        if (!module) return res.status(404).json({ error: 'Module not found' });

        const canUpdate = ['SUPER_ADMIN', 'ADMIN'].includes(req.user.role) ||
            req.user.permissions?.includes('MANAGE_COURSES') ||
            req.user.permissions?.includes('ALL') ||
            module.course.instructorId === req.user.id;

        if (!canUpdate) return res.status(403).json({ error: 'Access denied' });
        const { title, description, orderIndex, isPublished } = req.body;
        const updatedModule = await prisma.module.update({
            where: { id: req.params.moduleId },
            data: { title, description, orderIndex, isPublished }
        });
        res.json(updatedModule);
    } catch (error) {
        next(error);
    }
});

/**
 * @route   POST /api/courses/modules/:moduleId/lessons
 * @desc    Add a lesson to a module
 * @access  Private/Instructor
 */
router.post('/modules/:moduleId/lessons', authenticate, async (req, res, next) => {
    try {
        const module = await prisma.module.findUnique({
            where: { id: req.params.moduleId },
            include: { course: true }
        });
        if (!module) return res.status(404).json({ error: 'Module not found' });

        const canUpdate = ['SUPER_ADMIN', 'ADMIN'].includes(req.user.role) ||
            req.user.permissions?.includes('MANAGE_COURSES') ||
            req.user.permissions?.includes('ALL') ||
            module.course.instructorId === req.user.id;

        if (!canUpdate) return res.status(403).json({ error: 'Access denied' });
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
router.put('/lessons/:lessonId', authenticate, async (req, res, next) => {
    try {
        const lesson = await prisma.lesson.findUnique({
            where: { id: req.params.lessonId },
            include: { module: { include: { course: true } } }
        });
        if (!lesson) return res.status(404).json({ error: 'Lesson not found' });

        const canUpdate = ['SUPER_ADMIN', 'ADMIN'].includes(req.user.role) ||
            req.user.permissions?.includes('MANAGE_COURSES') ||
            req.user.permissions?.includes('ALL') ||
            lesson.module.course.instructorId === req.user.id;

        if (!canUpdate) return res.status(403).json({ error: 'Access denied' });
        const { title, content, videoUrl, duration, type, isPublished, isPreview, settings, resources } = req.body;
        const updatedLesson = await prisma.lesson.update({
            where: { id: req.params.lessonId },
            data: {
                title, content, videoUrl, duration, type, isPublished, isPreview,
                settings, resources
            }
        });
        res.json(updatedLesson);
    } catch (error) {
        next(error);
    }
});


module.exports = router;
