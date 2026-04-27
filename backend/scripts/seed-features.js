const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const features = [
    { name: 'Dashboard', code: 'DASHBOARD', module: 'General' },
    { name: 'Users & Roles', code: 'USERS', module: 'Management' },
    { name: 'Courses', code: 'COURSES', module: 'Academics' },
    { name: 'Certificates', code: 'CERTIFICATES', module: 'Academics' },
    { name: 'Students', code: 'STUDENTS', module: 'Academics' },
    { name: 'Employer Requests', code: 'EMPLOYERS', module: 'Job Portal' },
    { name: 'All Leads', code: 'LEADS', module: 'Management' },
    { name: 'Meetings', code: 'MEETINGS', module: 'General' },
    { name: 'Tasks', code: 'TASKS', module: 'General' },
    { name: 'Messages', code: 'MESSAGES', module: 'General' },
    { name: 'Blogs', code: 'BLOGS', module: 'Content' },
    { name: 'Gallery', code: 'GALLERY', module: 'Content' },
    { name: 'Skillcasts', code: 'SKILLCASTS', module: 'Content' },
    { name: 'Reviews', code: 'REVIEWS', module: 'Content' },
    { name: 'Library', code: 'LIBRARY', module: 'Academics' },
    { name: 'System Logs', code: 'SYSTEM_LOGS', module: 'Management' },
    { name: 'Settings', code: 'SETTINGS', module: 'Management' },
    { name: 'Analytics', code: 'ANALYTICS', module: 'Management' },
];

async function main() {
    console.log('Seeding features...');
    for (const feature of features) {
        await prisma.systemFeature.upsert({
            where: { code: feature.code },
            update: { name: feature.name, module: feature.module },
            create: feature,
        });
    }
    console.log('Seeding completed.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
