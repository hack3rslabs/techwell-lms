const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function grantAll() {
    console.log('👑 Granting ALL permissions to Super Admin...');

    const superAdminRole = await prisma.systemRole.findFirst({
        where: { name: { contains: 'Super Admin', mode: 'insensitive' } }
    });

    if (!superAdminRole) {
        console.log('❌ ERROR: Super Admin role not found.');
        return;
    }

    const allFeatures = await prisma.systemFeature.findMany();
    console.log(`- Found ${allFeatures.length} features.`);

    for (const feature of allFeatures) {
        await prisma.rolePermission.upsert({
            where: {
                roleId_featureId: {
                    roleId: superAdminRole.id,
                    featureId: feature.id
                }
            },
            update: { canRead: true, canWrite: true, isDisabled: false },
            create: {
                roleId: superAdminRole.id,
                featureId: feature.id,
                canRead: true,
                canWrite: true,
                isDisabled: false
            }
        });
    }

    console.log('✅ SUCCESS: Super Admin now has full access to all features.');
}

grantAll()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
