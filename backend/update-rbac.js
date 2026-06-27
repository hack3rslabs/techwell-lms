const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Seeding new permissions...');
    const permissions = [
        { code: 'CMS', name: 'CMS Manager', module: 'Content' },
        { code: 'TEAM_MANAGEMENT', name: 'Team Management', module: 'Content' },
        { code: 'PRODUCTS', name: 'Product Catalog', module: 'Content' },
        { code: 'SERVICES', name: 'Services Catalog', module: 'Content' },
    ];

    for (const p of permissions) {
        await prisma.systemPermission.upsert({
            where: { code: p.code },
            update: p,
            create: p
        });
        await prisma.systemFeature.upsert({
            where: { code: p.code },
            update: { name: p.name, module: p.module },
            create: { name: p.name, code: p.code, module: p.module }
        });
    }

    const rolesToUpdate = ['Super Admin', 'Admin'];
    
    for (const roleName of rolesToUpdate) {
        const role = await prisma.systemRole.findFirst({ where: { name: roleName } });
        if (role) {
            for (const p of permissions) {
                const feature = await prisma.systemFeature.findUnique({ where: { code: p.code } });
                if (feature) {
                    await prisma.rolePermission.upsert({
                        where: {
                            roleId_featureId: {
                                roleId: role.id,
                                featureId: feature.id
                            }
                        },
                        update: { canRead: true, canWrite: true, isDisabled: false },
                        create: {
                            roleId: role.id,
                            featureId: feature.id,
                            canRead: true,
                            canWrite: true,
                            isDisabled: false
                        }
                    });
                }
            }
            console.log(`Updated permissions for ${roleName}`);
        }
    }
    console.log('Done!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
