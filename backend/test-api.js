const axios = require('axios');
async function test() {
    try {
        const { PrismaClient } = require('@prisma/client');
        const prisma = new PrismaClient();
        const batches = await prisma.batch.findMany({
            include: {
                course: { select: { title: true } },
                instructor: { select: { name: true } },
                _count: { select: { enrollments: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
        console.log(batches[0]);
        await prisma.$disconnect();
    } catch(e) {
        console.error(e);
    }
}
test();
