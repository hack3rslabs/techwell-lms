const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixTestUsers() {
    try {
        console.log('Fetching system roles...');
        const employerRole = await prisma.systemRole.findFirst({ where: { name: 'Employer' } });
        const instituteRole = await prisma.systemRole.findFirst({ where: { name: 'Institute Admin' } });
        const franchiseRole = await prisma.systemRole.findFirst({ where: { name: 'Franchise Admin' } });

        console.log('Updating Employer...');
        if (employerRole) {
            await prisma.user.updateMany({
                where: { role: 'EMPLOYER', systemRoleId: null },
                data: { systemRoleId: employerRole.id }
            });
            console.log('Updated Employers successfully.');
        } else {
            console.log('Employer system role not found.');
        }

        console.log('Updating Institute Admin...');
        if (instituteRole) {
            await prisma.user.updateMany({
                where: { role: 'INSTITUTE_ADMIN', systemRoleId: null },
                data: { systemRoleId: instituteRole.id }
            });
            console.log('Updated Institute Admins successfully.');
        } else {
            console.log('Institute Admin system role not found.');
        }

        console.log('Updating Franchise Admin...');
        if (franchiseRole) {
            await prisma.user.updateMany({
                where: { role: 'FRANCHISE_ADMIN', systemRoleId: null },
                data: { systemRoleId: franchiseRole.id }
            });
            console.log('Updated Franchise Admins successfully.');
        } else {
            console.log('Franchise Admin system role not found.');
        }

        console.log('Test users fix completed.');
    } catch (e) {
        console.error('Error fixing users:', e);
    } finally {
        await prisma.$disconnect();
    }
}

fixTestUsers();
