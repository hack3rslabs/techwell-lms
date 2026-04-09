const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL } } });
const { getStudentCourseView } = require('./lms.service');

const getEnrollmentAccessWhere = (currentUser) => {
    if (currentUser.role === 'ADMIN') {
        return {};
    }

    if (currentUser.role === 'INSTITUTE_ADMIN') {
        return currentUser.instituteId
            ? { course: { instituteId: currentUser.instituteId } }
            : {};
    }

    return {
        OR: [
            { course: { instructorId: currentUser.id } },
            { batch: { instructorId: currentUser.id } }
        ]
    };
};

/**
 * Get Trainer Dashboard Stats
 */
const getTrainerStats = async (instructorId) => {
    // 1. Get Assigned Batches
    const batches = await prisma.batch.findMany({
        where: { instructorId },
        include: {
            enrollments: true
        }
    });

    const totalStudents = batches.reduce((acc, batch) => acc + batch.enrollments.length, 0);
    const activeBatches = batches.length;

    // 2. Pending Evaluations (Assignments)
    // Find lessons created by this instructor (via Course -> Module -> Lesson)
    // Then find submissions for those lessons that are PENDING
    const pendingEvaluations = await prisma.assignmentSubmission.count({
        where: {
            status: 'PENDING',
            lesson: {
                module: {
                    course: {
                        instructorId
                    }
                }
            }
        }
    });

    // 3. Calculate Completion Rate (Average progress)
    const enrollments = batches.flatMap(batch => batch.enrollments);
    const totalProgress = enrollments.reduce((acc, curr) => acc + (curr.progress || 0), 0);
    const completionRate = enrollments.length > 0 ? Math.round(totalProgress / enrollments.length) : 0;

    return {
        totalStudents,
        activeBatches,
        pendingEvaluations,
        completionRate
    };
};

/**
 * Get Assigned Batches with Details
 */
const getTrainerBatches = async (instructorId) => {
    return prisma.batch.findMany({
        where: { instructorId },
        include: {
            course: {
                select: { title: true, thumbnail: true }
            },
            _count: {
                select: { enrollments: true }
            }
        },
        orderBy: { createdAt: 'desc' }
    });
};

/**
 * Get Students across all batches or specific batch
 */
const getTrainerStudents = async (currentUser, batchId = null) => {
    const whereClause = {
        ...getEnrollmentAccessWhere(currentUser),
        status: { in: ['ACTIVE', 'COMPLETED'] }
    };

    if (batchId) {
        whereClause.batchId = batchId;
    }

    const enrollments = await prisma.enrollment.findMany({
        where: whereClause,
        include: {
            user: {
                select: { id: true, name: true, email: true, avatar: true }
            },
            course: {
                select: { id: true, title: true }
            }
        },
        orderBy: [
            { enrolledAt: 'desc' }
        ]
    });

    const studentsMap = new Map();

    for (const enrollment of enrollments) {
        if (!studentsMap.has(enrollment.user.id)) {
            studentsMap.set(enrollment.user.id, {
                id: enrollment.user.id,
                name: enrollment.user.name,
                email: enrollment.user.email,
                avatar: enrollment.user.avatar,
                enrollments: []
            });
        }

        studentsMap.get(enrollment.user.id).enrollments.push({
            course: {
                id: enrollment.course.id,
                title: enrollment.course.title
            },
            progress: enrollment.progress || 0,
            completedAt: enrollment.completedAt
        });
    }

    return Array.from(studentsMap.values()).sort((a, b) => a.name.localeCompare(b.name));
};

/**
 * Get Single Student Detailed Progress
 */
const getStudentDetailedProgress = async (currentUser, studentId, courseId) => {
    // Verify trainer/admin access to this student/course via course ownership, institute scope, or batch
    const hasAccess = await prisma.enrollment.findFirst({
        where: {
            userId: studentId,
            courseId: courseId,
            status: { in: ['ACTIVE', 'COMPLETED'] },
            ...getEnrollmentAccessWhere(currentUser)
        }
    });

    if (!hasAccess) throw new Error('Unauthorized access to student data');

    const [student, courseView] = await Promise.all([
        prisma.user.findUnique({
            where: { id: studentId },
            select: { name: true, email: true }
        }),
        getStudentCourseView(studentId, courseId)
    ]);

    if (!student) {
        throw new Error('Student not found');
    }

    const modules = courseView.modules.map((module) => {
        const completedLessons = module.lessons.filter((lesson) => lesson.isCompleted).length;
        const totalLessons = module.lessons.length;

        return {
            title: module.title,
            progress: totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0,
            lessons: module.lessons.map((lesson) => ({
                title: lesson.title,
                completed: lesson.isCompleted,
                score: lesson.lastScore
            }))
        };
    });

    return {
        student,
        course: {
            title: courseView.title
        },
        overallProgress: courseView.userProgress,
        modules
    };
};

module.exports = {
    getTrainerStats,
    getTrainerBatches,
    getTrainerStudents,
    getStudentDetailedProgress
};
