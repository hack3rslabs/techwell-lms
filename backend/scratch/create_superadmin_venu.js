const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    console.log('🚀 Creating Super Admin account...');

    const email = 'venukoyyana908@gmail.com';
    const password = 'Venu@95020';
    const name = 'Venu Super Admin';

    const hashedPassword = await bcrypt.hash(password, 12);

    try {
        const user = await prisma.user.upsert({
            where: { email },
            update: {
                password: hashedPassword,
                role: 'SUPER_ADMIN',
                isActive: true,
                emailVerified: true,
                name: name
            },
            create: {
                email,
                password: hashedPassword,
                name: name,
                role: 'SUPER_ADMIN',
                isActive: true,
                emailVerified: true
            }
        });

        console.log(`✅ User ${email} created/updated successfully.`);

        // Link to System Role
        const superAdminRole = await prisma.systemRole.findUnique({ where: { name: 'Super Admin' } });
        if (superAdminRole) {
            await prisma.user.update({
                where: { id: user.id },
                data: { systemRoleId: superAdminRole.id }
            });
            console.log('✅ Linked user to Super Admin System Role');
        } else {
            console.log('⚠️  Super Admin system role not found. Please run seed script first if needed.');
        }

    } catch (error) {
        console.error('❌ Error creating user:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
