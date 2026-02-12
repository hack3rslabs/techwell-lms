const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const email = 'student@techwell.com';

    try {
        const user = await prisma.user.update({
            where: { email },
            data: {
                plan: 'PRO'
            }
        });
        console.log(`Successfully updated user ${email} to PRO plan.`);
    } catch (e) {
        if (e.code === 'P2025') {
            console.error(`User with email ${email} not found.`);
            // Try to create it if it doesn't exist? No, better to warn.
        } else {
            console.error(e);
        }
    } finally {
        await prisma.$disconnect();
    }
}

main();
