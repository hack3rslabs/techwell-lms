const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function audit() {
    console.log('🧐 Auditing Super Admin Permissions (Fixing Field Names)...');

    // 1. Find the Welcome feature
    const welcomeFeature = await prisma.systemFeature.findUnique({
        where: { code: 'WELCOME' }
    });

    if (!welcomeFeature) {
        console.log('❌ ERROR: WELCOME feature not found.');
        return;
    }

    // 2. Find the Super Admin role
    const superAdminRole = await prisma.systemRole.findFirst({
        where: { name: { contains: 'Super Admin', mode: 'insensitive' } }
    });

    if (!superAdminRole) {
        console.log('❌ ERROR: Super Admin role not found.');
        return;
    }

    // 3. Ensure permission exists using correct field names (roleId, featureId)
    const permission = await prisma.rolePermission.upsert({
        where: {
            roleId_featureId: {
                roleId: superAdminRole.id,
                featureId: welcomeFeature.id
            }
        },
        update: { canRead: true, canWrite: true, isDisabled: false },
        create: {
            roleId: superAdminRole.id,
            featureId: welcomeFeature.id,
            canRead: true,
            canWrite: true,
            isDisabled: false
        }
    });

    console.log(`✅ SUCCESS: WELCOME permission granted to Super Admin.`);
}

audit()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
