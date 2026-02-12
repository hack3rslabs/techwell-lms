const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testScoping() {
    console.log('Testing Admin Scoping Logic...');

    // 1. Fetch Users
    const instAdmin = await prisma.user.findUnique({ where: { email: 'inst_admin@test.com' } });
    if (!instAdmin) throw new Error('Institute Admin not found (Seed failed?)');

    // Create a dummy Super Admin if not exists (or just query assuming one exists for test)
    // Actually, let's just use the query logic directly with the context.

    console.log(`\n--- Test Context ---\nUser: ${instAdmin.email}\nRole: ${instAdmin.role}\nInstituteId: ${instAdmin.instituteId}`);

    // 2. Simulate /api/admin/stats query for Institute Admin
    const rules = { manageUsers: true, viewFinance: true }; // Assume full perms
    const reqUser = instAdmin;

    console.log('\n--- Simulating Institute Admin Stats ---');
    const usersCount = await prisma.user.count({
        where: reqUser.instituteId ? { instituteId: reqUser.instituteId } : {}
    });
    console.log(`Scoped Users Count: ${usersCount} (Expected: >0 but <Total)`);

    const coursesCount = await prisma.course.count({
        where: reqUser.instituteId ? { instituteId: reqUser.instituteId } : {}
    });
    console.log(`Scoped Courses Count: ${coursesCount} (Expected: 1)`);

    // 3. Simulate Global Stats (Null InstituteId)
    console.log('\n--- Simulating Super Admin Stats ---');
    const globalReqUser = { ...instAdmin, instituteId: null, role: 'SUPER_ADMIN' };

    const globalUsersCount = await prisma.user.count({
        where: globalReqUser.instituteId ? { instituteId: globalReqUser.instituteId } : {}
    });
    console.log(`Global Users Count: ${globalUsersCount}`);

    const globalCoursesCount = await prisma.course.count({
        where: globalReqUser.instituteId ? { instituteId: globalReqUser.instituteId } : {}
    });
    console.log(`Global Courses Count: ${globalCoursesCount}`);

    if (usersCount < globalUsersCount && coursesCount < globalCoursesCount) {
        console.log('\n✅ SCOPING TEST PASSED: Institute data is a subset of Global data.');
    } else {
        console.log('\n❌ SCOPING TEST FAILED: Counts match or are unexpected.');
    }
}

testScoping()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
