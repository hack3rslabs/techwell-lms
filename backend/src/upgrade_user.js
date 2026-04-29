const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function upgrade() {
    const email = 'venukoyyana808@gmail.com';
    console.log(`🚀 Upgrading ${email} to SUPER_ADMIN...`);

    // 1. Find the Super Admin system role
    const superAdminRole = await prisma.systemRole.findFirst({
        where: { name: { contains: 'Super Admin', mode: 'insensitive' } }
    });

    if (!superAdminRole) {
        console.log('❌ ERROR: Super Admin role not found in database. Please run seed first.');
        return;
    }

    // 2. Update the user
    const updatedUser = await prisma.user.update({
        where: { email: email },
        data: {
            role: 'SUPER_ADMIN',
            systemRoleId: superAdminRole.id
        }
    });

    console.log(`✅ SUCCESS: ${updatedUser.email} is now a SUPER_ADMIN linked to "${superAdminRole.name}".`);
}

upgrade()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
