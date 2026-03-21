const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
    try {
        const roles = await prisma.systemRole.findMany();
        console.log('--- System Roles ---');
        console.log(JSON.stringify(roles, null, 2));

        const permissions = await prisma.systemPermission.findMany();
        console.log('\n--- System Permissions ---');
        console.log(`Count: ${permissions.length}`);
    } catch (err) {
        console.error(err);
    } finally {
        await prisma.$disconnect();
    }
}

check();
