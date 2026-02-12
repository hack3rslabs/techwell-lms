const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

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
const getTrainerStudents = async (instructorId, batchId = null) => {
    const whereClause = {
        batch: {
            instructorId
        }
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
                select: { title: true }
            },
            batch: {
                select: { name: true }
            }
        }
    });

    // Flatten logic
    return enrollments.map(e => ({
        studentId: e.user.id,
        name: e.user.name,
        email: e.user.email,
        avatar: e.user.avatar,
        courseName: e.course.title,
        batchName: e.batch?.name,
        progress: e.progress,
        status: e.status,
        enrolledAt: e.enrolledAt
    }));
};

/**
 * Get Single Student Detailed Progress
 */
const getStudentDetailedProgress = async (instructorId, studentId, courseId) => {
    // Verify instructor has access to this student/course via Batch
    const hasAccess = await prisma.enrollment.findFirst({
        where: {
            userId: studentId,
            courseId: courseId,
            batch: {
                instructorId
            }
        }
    });

    if (!hasAccess) throw new Error('Unauthorized access to student data');

    // Fetch Course Structure with Student Progress
    // We can reuse lms.service.getStudentCourseView but we need to see it as an instructor (read-only view of student's state)
    // Instead, let's fetch raw progress data
    const progressData = await prisma.lessonProgress.findMany({
        where: {
            userId: studentId,
            lesson: {
                module: {
                    courseId
                }
            }
        },
        include: {
            lesson: {
                select: { title: true, type: true, module: { select: { title: true } } }
            }
        }
    });

    // Submissions
    const submissions = await prisma.assignmentSubmission.findMany({
        where: {
            userId: studentId,
            lesson: {
                module: {
                    courseId
                }
            }
        },
        include: {
            lesson: true
        }
    });

    return {
        progress: progressData,
        submissions
    };
};

module.exports = {
    getTrainerStats,
    getTrainerBatches,
    getTrainerStudents,
    getStudentDetailedProgress
};
