const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    // Add CMS feature to SystemFeature table
    const feature = await prisma.systemFeature.upsert({
        where: { code: 'CMS' },
        update: {
            name: 'CMS Manager',
            description: 'Manage website products, services, and content',
            module: 'Content'
        },
        create: {
            code: 'CMS',
            name: 'CMS Manager',
            description: 'Manage website products, services, and content',
            module: 'Content'
        }
    });
    console.log('✅ CMS feature added:', feature.id);

    // Also ensure SUPER_ADMIN role has this permission (it should have all by default, but let's be safe)
    const superAdminRole = await prisma.systemRole.findFirst({
        where: { name: { contains: 'Super' } }
    });

    if (superAdminRole) {
        await prisma.rolePermission.upsert({
            where: { roleId_featureId: { roleId: superAdminRole.id, featureId: feature.id } },
            update: { canRead: true, canWrite: true, isDisabled: false },
            create: { roleId: superAdminRole.id, featureId: feature.id, canRead: true, canWrite: true, isDisabled: false }
        });
        console.log('✅ SUPER_ADMIN role granted CMS permission');
    }

    await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
