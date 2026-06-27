const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkBatch() {
    try {
        const batch = await prisma.batch.findUnique({
            where: { batchCode: 'B-2026-06-001' }
        });
        if (!batch) {
             console.log("Batch not found.");
        } else {
             console.log("Batch by batchCode:", batch);
        }
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}
checkBatch();
