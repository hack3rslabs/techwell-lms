const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const sidebarFeatures = [
    { code: 'DASHBOARD', name: 'Dashboard Overview', module: 'Overview' },
    { code: 'EMPLOYER_REQUESTS', name: 'Employer Requests', module: 'Requests' },
    { code: 'CENTRAL_CRM', name: 'Central CRM', module: 'Tracking' },
    { code: 'REPORTS', name: 'Reports & Analytics', module: 'Tracking' },
    { code: 'REVIEWS', name: 'Reviews', module: 'Approve' },
    { code: 'CERTIFICATES', name: 'Certificates', module: 'Approve' },
    { code: 'SYSTEM_LOGS', name: 'System Logs', module: 'Monitoring' },
    { code: 'COURSES', name: 'Courses', module: 'Operations' },
    { code: 'BATCHES', name: 'Batches', module: 'Operations' },
    { code: 'EVENTS', name: 'Events & Webinars', module: 'Operations' },
    { code: 'LIVE_CLASSES', name: 'Live Classes', module: 'Operations' },
    { code: 'SKILLCASTS', name: 'Skillcasts', module: 'Operations' },
    { code: 'TASKS', name: 'Tasks', module: 'Operations' },
    { code: 'AI_INTERVIEWS', name: 'AI Interviews', module: 'Operations' },
    { code: 'AUTOMATION_STUDIO', name: 'Automation Studio', module: 'Operations' },
    { code: 'USERS_ROLES', name: 'Users & Roles', module: 'Administration' },
    { code: 'STUDENTS', name: 'Students', module: 'Administration' },
    { code: 'STAFF_PORTAL', name: 'Staff Portal', module: 'Administration' },
    { code: 'GLOBAL_DATA', name: 'Global Data', module: 'Administration' },
    { code: 'COUPONS', name: 'Coupons', module: 'Administration' },
    { code: 'TRANSACTIONS', name: 'Transactions', module: 'Administration' },
    { code: 'MESSAGES', name: 'Messages', module: 'Administration' },
    { code: 'MEETINGS', name: 'Meetings', module: 'Administration' },
    { code: 'CONSULTANCY', name: 'Consultancy', module: 'Administration' },
    { code: 'SETTINGS', name: 'System Settings', module: 'Administration' },
    { code: 'MARKETING_HUB', name: 'Marketing Hub', module: 'Deployments' },
    { code: 'ADS_MANAGER', name: 'Ads Manager', module: 'Deployments' },
    { code: 'BLOGS', name: 'Blogs', module: 'Deployments' },
    { code: 'CMS_MANAGER', name: 'CMS Manager', module: 'Deployments' },
    { code: 'PAGE_BUILDER', name: 'Page Builder', module: 'Deployments' },
    { code: 'GALLERY', name: 'Gallery', module: 'Deployments' },
    { code: 'LIBRARY', name: 'Library', module: 'Deployments' }
];

async function seedFeatures() {
    console.log('Seeding sidebar features...');
    for (const feature of sidebarFeatures) {
        // Find if name exists but with different code, and delete it to prevent unique constraint
        const existingByName = await prisma.systemFeature.findFirst({ where: { name: feature.name } });
        if (existingByName && existingByName.code !== feature.code) {
            await prisma.rolePermission.deleteMany({ where: { featureId: existingByName.id } });
            await prisma.systemFeature.delete({ where: { id: existingByName.id } });
        }

        await prisma.systemFeature.upsert({
            where: { code: feature.code },
            update: { name: feature.name, module: feature.module },
            create: { code: feature.code, name: feature.name, module: feature.module }
        });
        console.log(`Upserted: ${feature.code}`);
    }
    
    // Also ensure the SUPERADMIN role exists and has these features
    let superAdmin = await prisma.systemRole.findFirst({ where: { name: 'Super Admin' } });
    if (!superAdmin) {
        superAdmin = await prisma.systemRole.create({
            data: { name: 'Super Admin', description: 'Master administrator role', isSystem: true }
        });
    }

    const allFeatures = await prisma.systemFeature.findMany();
    for (const feat of allFeatures) {
        await prisma.rolePermission.upsert({
            where: {
                roleId_featureId: {
                    roleId: superAdmin.id,
                    featureId: feat.id
                }
            },
            update: { canRead: true, canWrite: true, isDisabled: false },
            create: { roleId: superAdmin.id, featureId: feat.id, canRead: true, canWrite: true, isDisabled: false }
        });
    }
    console.log('Granted all features to Super Admin.');

    console.log('Done!');
}

seedFeatures().catch(console.error).finally(() => prisma.$disconnect());
