const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function resetPassword() {
    try {
        const hashedPassword = await bcrypt.hash('password123', 10);
        const email = 'inst_admin@test.com';

        const user = await prisma.user.update({
            where: { email },
            data: {
                password: hashedPassword,
                isActive: true
            }
        });

        console.log(`Password reset for ${user.email} to 'password123'`);
    } catch (e) {
        console.error('Error resetting password:', e);
    } finally {
        await prisma.$disconnect();
    }
}

resetPassword();
