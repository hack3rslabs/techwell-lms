const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const count = await prisma.course.count();
        console.log('Total courses:', count);
        const courses = await prisma.course.findMany({
            orderBy: { createdAt: 'desc' },
            select: { id: true, title: true, isPublished: true }
        });
        console.log(JSON.stringify(courses, null, 2));
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
