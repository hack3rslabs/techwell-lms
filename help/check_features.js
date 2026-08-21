const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
    const features = await prisma.systemFeature.findMany({ select: { code: true } });
    console.log("Features:", features.map(f => f.code).join(', '));
}

run().catch(console.error).finally(() => prisma.$disconnect());
