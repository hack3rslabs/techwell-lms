const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL } } });
const axios = require('axios'); // For triggering internal certificate API if needed

/**
 * Get the course structure for a student with Lock/Unlock status
 */
const getStudentCourseView = async (userId, courseId) => {
    // 1. Fetch Course Structure (Modules, Lessons)
    const course = await prisma.course.findUnique({
        where: { id: courseId },
        include: {
            modules: {
                where: { isPublished: true },
                orderBy: { orderIndex: 'asc' },
                include: {
                    lessons: {
                        where: { isPublished: true },
                        orderBy: { order: 'asc' },
                        include: {
                            progress: { where: { userId } }, // Get specific user's progress
                            quizzes: true
                        }
                    }
                }
            },
            instructor: { select: { name: true, email: true } },
            enrollments: { where: { userId } }
        }
    });

    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { role: true }
    });

    if (!course) throw new Error('Course not found');
    if (course.enrollments.length === 0) throw new Error('Not enrolled');

    // Check Enrollment status
    const enrollment = course.enrollments[0];
    if (!['ACTIVE', 'COMPLETED'].includes(enrollment.status)) {
        throw new Error('Access denied. Enrollment is not active.');
    }

    // 2. Calculate Locked Status & Progress
    let previousLessonCompleted = true; // First lesson is always unlocked
    let totalLessons = 0;
    let completedLessons = 0;

    const modulesWithStatus = course.modules.map(module => {
        // Module Level Logic (Optional: Lock module if previous module incomplete)
        // For now, we rely on Lesson flow

        const lessonsWithStatus = module.lessons.map(lesson => {
            const userProgress = lesson.progress[0];
            const isCompleted = userProgress?.completed || false;

            // Logic: Lesson is locked if previous is NOT completed AND it's not a preview
            const isLocked = !previousLessonCompleted && !lesson.isPreview;

            if (isCompleted) completedLessons++;
            totalLessons++;

            // For next iteration
            if (!isCompleted) previousLessonCompleted = false;

            return {
                id: lesson.id,
                title: lesson.title,
                type: lesson.type,
                duration: lesson.duration,
                videoUrl: lesson.videoUrl,
                content: lesson.content,
                isPublished: lesson.isPublished,
                isPreview: lesson.isPreview,
                settings: lesson.settings,
                resources: lesson.resources,
                isLocked,
                isCompleted,
                lastScore: userProgress?.score || null,
                timeSpent: userProgress?.timeSpent || 0
            };
        });

        return {
            id: module.id,
            title: module.title,
            description: module.description,
            orderIndex: module.orderIndex,
            lessons: lessonsWithStatus
        };
    });

    const courseProgress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

    return {
        ...course,
        modules: modulesWithStatus,
        userProgress: courseProgress,
        enrollmentStatus: course.enrollments[0].status
    };
};

/**
 * Mark lesson as complete and check for course completion
 */
const updateLessonProgress = async (userId, lessonId, data = {}) => {
    // 1. Get Lesson to find CourseId
    const lesson = await prisma.lesson.findUnique({
        where: { id: lessonId },
        include: { module: true }
    });

    if (!lesson) throw new Error('Lesson not found');
    const courseId = lesson.module.courseId;

    // 2. Upsert Progress
    const progress = await prisma.lessonProgress.upsert({
        where: { userId_lessonId: { userId, lessonId } },
        update: {
            completed: true,
            timeSpent: { increment: data.timeSpent || 0 },
            lastAccessedAt: new Date(),
            score: data.score // Update score if provided (for quizzes)
        },
        create: {
            userId,
            lessonId,
            completed: true,
            timeSpent: data.timeSpent || 0,
            score: data.score
        }
    });

    // 3. Recalculate Course Progress
    const courseStruct = await getStudentCourseView(userId, courseId);

    // 4. Check if Course is 100% Complete
    if (courseStruct.userProgress === 100) {
        // Update Enrollment
        const enrollment = await prisma.enrollment.findUnique({
            where: { userId_courseId: { userId, courseId } }
        });

        if (enrollment && enrollment.status !== 'COMPLETED') {
            await prisma.enrollment.update({
                where: { id: enrollment.id },
                data: { status: 'COMPLETED', completedAt: new Date(), progress: 100 }
            });

            // Auto-Generate Certificate
            // We can call the local route logic or helper
            // For now, simpler to just return a flag so Frontend can trigger the specific certificate route
            return { progress, courseCompleted: true, courseId };
        }
    } else {
        // Update progress % in enrollment
        await prisma.enrollment.update({
            where: { userId_courseId: { userId, courseId } },
            data: { progress: courseStruct.userProgress }
        });
    }

    return { progress, courseCompleted: false, courseId };
};

module.exports = {
    getStudentCourseView,
    updateLessonProgress
};
