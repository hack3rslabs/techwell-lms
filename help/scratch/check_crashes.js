
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkAllUsers() {
    try {
        const users = await prisma.user.findMany({ take: 50 });
        console.log(`Checking ${users.length} users...`);

        for (const user of users) {
            try {
                const enrollments = await prisma.enrollment.findMany({
                    where: { userId: user.id },
                    include: { course: true }
                });

                const successfulPayments = await prisma.payment.findMany({
                    where: {
                        userId: user.id,
                        status: { in: ['SUCCESS', 'success', 'captured', 'CAPTURED'] }
                    }
                });

                const paidCourseIds = new Set(successfulPayments.map(p => p.courseId));

                const filtered = enrollments.filter(e => {
                    if (!e.course) return false; // Safety check I should have added
                    const isActive = ['ACTIVE', 'COMPLETED'].includes(e.status?.toUpperCase());
                    const isPaid = paidCourseIds.has(e.courseId);
                    const effectivePrice = e.course.discountPrice !== null ? Number(e.course.discountPrice) : Number(e.course.price);
                    const isFree = effectivePrice <= 0;
                    return isPaid || isActive || isFree;
                });
                
            } catch (err) {
                console.log(`CRASH for user ${user.email}: ${err.message}`);
            }
        }
        console.log('Check complete.');
    } catch (error) {
        console.error(error);
    } finally {
        await prisma.$disconnect();
    }
}

checkAllUsers();
