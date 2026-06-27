const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Revoking admin permissions from Student role...');
    
    // 1. Find the Student role
    const studentRole = await prisma.systemRole.findFirst({
        where: { name: { in: ['Student', 'STUDENT'] } }
    });

    if (!studentRole) {
        console.error('❌ ERROR: Student role not found.');
        process.exit(1);
    }

    console.log(`✅ Found Student Role ID: ${studentRole.id}`);

    // 2. Define features that are strictly ADMIN ONLY
    const adminFeatures = [
        'CMS', 
        'TEAM_MANAGEMENT', 
        'PRODUCTS', 
        'SERVICES', 
        'USERS', 
        'SYSTEM_SETTINGS',
        'SETTINGS'
    ];

    // 3. Find features in DB
    const features = await prisma.systemFeature.findMany({
        where: { code: { in: adminFeatures } }
    });

    console.log(`Found ${features.length} admin features to lock down.`);

    // 4. Update or Create explicitly disabled permissions
    for (const feature of features) {
        const permission = await prisma.rolePermission.upsert({
            where: {
                roleId_featureId: {
                    roleId: studentRole.id,
                    featureId: feature.id
                }
            },
            update: {
                canRead: false,
                canWrite: false,
                isDisabled: true
            },
            create: {
                roleId: studentRole.id,
                featureId: feature.id,
                canRead: false,
                canWrite: false,
                isDisabled: true
            }
        });
        console.log(`🔒 Locked feature [${feature.code}] for Student`);
    }

    console.log('✅ Student RBAC lockdown complete!');
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
