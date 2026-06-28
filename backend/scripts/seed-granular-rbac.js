const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Seeding 30 Granular RBAC Permissions...');

    const granularFeatures = [
        { code: 'DASHBOARD', name: 'Dashboard', module: 'System' },
        { code: 'STAFF_PORTAL', name: 'Staff Portal', module: 'System' },
        { code: 'USERS_ROLES', name: 'Users & Roles', module: 'User Management' },
        { code: 'COURSES', name: 'Courses', module: 'Academics' },
        { code: 'COUPONS', name: 'Coupons', module: 'Academics' },
        { code: 'BATCHES', name: 'Batches', module: 'Academics' },
        { code: 'CENTRAL_CRM', name: 'Central CRM', module: 'Marketing & Sales' },
        { code: 'GLOBAL_DATA', name: 'Global Data', module: 'Marketing & Sales' },
        { code: 'MARKETING_HUB', name: 'Marketing Hub', module: 'Marketing & Sales' },
        { code: 'ADS_MANAGER', name: 'Ads Manager', module: 'Marketing & Sales' },
        { code: 'EVENTS', name: 'Events & Webinars', module: 'Marketing & Sales' },
        { code: 'STUDENTS', name: 'Students', module: 'User Management' },
        { code: 'TRANSACTIONS', name: 'Transactions', module: 'Finance' },
        { code: 'MESSAGES', name: 'Messages', module: 'Communication' },
        { code: 'BLOGS', name: 'Blogs', module: 'Content' },
        { code: 'CMS_MANAGER', name: 'CMS Manager', module: 'Content' },
        { code: 'PAGE_BUILDER', name: 'Page Builder', module: 'Content' },
        { code: 'GALLERY', name: 'Gallery', module: 'Content' },
        { code: 'LIBRARY', name: 'Library', module: 'Academics' },
        { code: 'CERTIFICATES', name: 'Certificates', module: 'Academics' },
        { code: 'MEETINGS', name: 'Meetings', module: 'Communication' },
        { code: 'AI_INTERVIEWS', name: 'AI Interviews', module: 'Academics' },
        { code: 'LIVE_CLASSES', name: 'Live Classes', module: 'Academics' },
        { code: 'TASKS', name: 'Tasks', module: 'Productivity' },
        { code: 'SKILLCASTS', name: 'Skillcasts', module: 'Academics' },
        { code: 'REVIEWS', name: 'Reviews', module: 'Academics' },
        { code: 'EMPLOYER_REQUESTS', name: 'Employer Requests', module: 'User Management' },
        { code: 'SETTINGS', name: 'System Settings', module: 'System' },
        { code: 'REPORTS', name: 'Reports & Analytics', module: 'System' },
        { code: 'SYSTEM_LOGS', name: 'System Logs', module: 'System' },
    ];

    // Seed SystemPermission (if used) and SystemFeature
    for (const f of granularFeatures) {
        // Upsert into SystemPermission for legacy fallback
        const existingSpByName = await prisma.systemPermission.findFirst({ where: { name: f.name } });
        if (existingSpByName && existingSpByName.code !== f.code) {
             await prisma.systemPermission.update({ where: { id: existingSpByName.id }, data: { name: f.name + ' (Old)' }});
        }
        await prisma.systemPermission.upsert({
            where: { code: f.code },
            update: { name: f.name, module: f.module },
            create: { code: f.code, name: f.name, module: f.module, description: `Access to ${f.name}` }
        });

        // Upsert into SystemFeature for new RolePermission mapping
        const existingSfByName = await prisma.systemFeature.findFirst({ where: { name: f.name } });
        if (existingSfByName && existingSfByName.code !== f.code) {
             await prisma.systemFeature.update({ where: { id: existingSfByName.id }, data: { name: f.name + ' (Old)' }});
        }
        await prisma.systemFeature.upsert({
            where: { code: f.code },
            update: { name: f.name, module: f.module },
            create: { code: f.code, name: f.name, module: f.module, description: `Access to ${f.name}` }
        });
    }
    console.log(`✅ Upserted ${granularFeatures.length} features.`);

    // Automatically grant all 30 features to Super Admin and Admin
    const rolesToUpdate = ['Super Admin', 'Admin'];
    
    for (const roleName of rolesToUpdate) {
        const role = await prisma.systemRole.findFirst({ where: { name: roleName } });
        if (role) {
            for (const f of granularFeatures) {
                const feature = await prisma.systemFeature.findUnique({ where: { code: f.code } });
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
            console.log(`✅ Granted all granular permissions to ${roleName}`);
        } else {
            console.warn(`⚠️ Role ${roleName} not found.`);
        }
    }
    console.log('🎉 Granular RBAC seeding complete!');
}

main().catch(e => {
    console.error(e);
    process.exit(1);
}).finally(async () => {
    await prisma.$disconnect();
});
