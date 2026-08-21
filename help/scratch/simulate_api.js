
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function simulateApi(email) {
    try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return console.log('User not found');

        const userId = user.id;

        const enrollments = await prisma.enrollment.findMany({
            where: { userId: userId },
            include: { course: true },
            orderBy: { enrolledAt: 'desc' }
        });

        const successfulPayments = await prisma.payment.findMany({
            where: {
                userId: userId,
                status: { in: ['SUCCESS', 'success', 'captured', 'CAPTURED'] }
            },
            select: { courseId: true }
        });

        const paidCourseIds = new Set(successfulPayments.map(p => p.courseId));
        const enrollmentCourseIds = new Set(enrollments.map(e => e.courseId));

        const filteredEnrollments = enrollments.filter(e => {
            const isActive = ['ACTIVE', 'COMPLETED'].includes(e.status?.toUpperCase());
            const isPaid = paidCourseIds.has(e.courseId);
            
            const effectivePrice = e.course.discountPrice !== null ? Number(e.course.discountPrice) : Number(e.course.price);
            const isFree = effectivePrice <= 0;

            return isPaid || isActive || isFree;
        });

        const missingPaidEnrollments = [];
        for (const paymentCourseId of paidCourseIds) {
            if (!enrollmentCourseIds.has(paymentCourseId)) {
                const course = await prisma.course.findUnique({ where: { id: paymentCourseId } });
                if (course) {
                    missingPaidEnrollments.push({
                        id: `missing_${paymentCourseId}`,
                        userId: userId,
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
        console.log('FINAL RESULTS COUNT:', finalResults.length);
        finalResults.forEach(r => console.log(`  Course: ${r.course.title}, Status: ${r.status}`));

    } catch (error) {
        console.error(error);
    } finally {
        await prisma.$disconnect();
    }
}

simulateApi('mani39211@gmail.com');
