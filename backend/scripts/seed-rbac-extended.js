const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const extendedRoles = [
    {
        name: 'Tele Sales',
        systemRole: 'TELE_SALES',
        features: ['DASHBOARD', 'CENTRAL_CRM', 'STUDENTS']
    },
    {
        name: 'Counsellor',
        systemRole: 'COUNSELLOR',
        features: ['DASHBOARD', 'CENTRAL_CRM', 'STUDENTS', 'CONSULTANCY']
    },
    {
        name: 'Demo User',
        systemRole: 'DEMO_USER',
        features: ['DASHBOARD']
    },
    {
        name: 'College Admin',
        systemRole: 'COLLEGE_ADMIN',
        features: ['DASHBOARD', 'STUDENTS', 'COURSES', 'BATCHES']
    },
    {
        name: 'Content Writer',
        systemRole: 'CONTENT_WRITER',
        features: ['DASHBOARD', 'BLOGS', 'CMS_MANAGER', 'PAGE_BUILDER', 'GALLERY', 'REVIEWS']
    },
    {
        name: 'Franchise Admin',
        systemRole: 'FRANCHISE_ADMIN',
        features: ['DASHBOARD', 'STUDENTS', 'COURSES', 'BATCHES']
    },
    {
        name: 'Institute Admin',
        systemRole: 'INSTITUTE_ADMIN',
        features: ['DASHBOARD', 'STUDENTS', 'COURSES', 'BATCHES']
    },
    {
        name: 'Employer',
        systemRole: 'EMPLOYER',
        features: ['DASHBOARD', 'MANAGE_EMPLOYER_REQUESTS']
    }
];

async function main() {
    console.log('Seeding Extended RBAC Roles and Permissions...');

    for (const roleDef of extendedRoles) {
        // Upsert the SystemRole
        const role = await prisma.systemRole.upsert({
            where: { name: roleDef.name },
            update: {},
            create: {
                name: roleDef.name,
                description: `System role for ${roleDef.name}`,
                isSystem: true
            }
        });

        // Grant permissions
        for (const featureCode of roleDef.features) {
            let feature = await prisma.systemFeature.findUnique({ where: { code: featureCode } });
            
            // Fallback: create feature if it doesn't exist (it should, but just in case)
            if (!feature) {
                feature = await prisma.systemFeature.create({
                    data: {
                        code: featureCode,
                        name: featureCode,
                        module: 'System'
                    }
                });
            }

            await prisma.rolePermission.upsert({
                where: {
                    roleId_featureId: {
                        roleId: role.id,
                        featureId: feature.id
                    }
                },
                update: { canRead: true, canCreate: true, canUpdate: true, canDelete: true, isDisabled: false },
                create: {
                    roleId: role.id,
                    featureId: feature.id,
                    canRead: true,
                    canCreate: true,
                    canUpdate: true,
                    canDelete: true,
                    isDisabled: false
                }
            });
        }
        console.log(`✅ Seeded role: ${roleDef.name} with ${roleDef.features.length} permissions.`);
    }

    console.log('🎉 Extended RBAC seeding complete!');
}

main().catch(e => {
    console.error(e);
    process.exit(1);
}).finally(async () => {
    await prisma.$disconnect();
});
