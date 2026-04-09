const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const courses = await prisma.course.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            select: { id: true, title: true, bannerUrl: true, thumbnail: true }
        });
        console.log(JSON.stringify(courses, null, 2));
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
