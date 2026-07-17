const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    const email = 'admin@techwell.co.in';
    const password = process.env.ADMIN_PASSWORD || Buffer.from('UGFzc3dvcmRAMTIz', 'base64').toString('utf8');
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    let user = await prisma.user.findUnique({ where: { email } });
    if (user) {
        await prisma.user.update({
            where: { email },
            data: { password: hashedPassword, role: 'SUPER_ADMIN' }
        });
        console.log('Updated user password');
    } else {
        await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                firstName: 'Uttam',
                lastName: 'Admin',
                name: 'Uttam Admin',
                role: 'SUPER_ADMIN',
                emailVerified: true
            }
        });
        console.log('Created user');
    }
}

main().catch(console.error).finally(() => prisma.$disconnect());
