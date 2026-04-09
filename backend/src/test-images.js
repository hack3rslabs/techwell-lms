const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const courses = await prisma.course.findMany({
            select: {
                id: true,
                title: true,
                thumbnail: true,
                bannerUrl: true
            }
        });
        courses.forEach(c => {
            console.log(`Course: ${c.title}`);
            console.log(`  Thumbnail: ${c.thumbnail}`);
            console.log(`  BannerUrl: ${c.bannerUrl}`);
        });
    } catch (error) {
        console.error(error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
