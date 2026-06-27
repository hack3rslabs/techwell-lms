const axios = require('axios');
async function test() {
    try {
        // We'll just fetch directly from DB to see if courseId exists
        const { PrismaClient } = require('@prisma/client');
        const prisma = new PrismaClient();
        const batches = await prisma.batch.findMany();
        console.log("Batches count:", batches.length);
        if (batches.length > 0) {
            console.log("Sample batch courseId:", batches[0].courseId);
        }
        await prisma.$disconnect();
    } catch(e) {
        console.error(e);
    }
}
test();
