
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function debugMani() {
    try {
        const user = await prisma.user.findUnique({
            where: { email: 'mani39211@gmail.com' },
            include: {
                enrollments: {
                    include: { course: true }
                },
                payments: true
            }
        });

        console.log('USER:', user.email);
        console.log('PAYMENTS COUNT:', user.payments.length);
        user.payments.forEach(p => console.log(`  Payment: ${p.courseId}, Status: ${p.status}`));
        
        console.log('ENROLLMENTS COUNT:', user.enrollments.length);
        user.enrollments.forEach(e => console.log(`  Enrollment: ${e.courseId}, Status: ${e.status}, Course: ${e.course.title}`));

    } catch (error) {
        console.error(error);
    } finally {
        await prisma.$disconnect();
    }
}

debugMani();
