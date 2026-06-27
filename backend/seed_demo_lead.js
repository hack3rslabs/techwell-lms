const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Seeding demo lead...');

    const superAdmin = await prisma.user.findFirst({
        where: { role: 'SUPER_ADMIN' }
    });

    if (!superAdmin) {
        console.error('No super admin found to assign demo');
        return;
    }

    const lead = await prisma.lead.create({
        data: {
            name: 'Alice Smith (Sample Demo)',
            email: 'alicedemo@example.com',
            phone: '9876543210',
            source: 'Demo Request',
            status: 'NEW',
            leadType: 'TRAINING',
            courseName: 'Full Stack Development',
            college: 'Tech University',
            qualification: 'B.Tech',
            notes: '[Demo Scheduled]\nCourse: Full Stack Development\nYear of Passout: 2024'
        }
    });

    await prisma.demoSchedule.create({
        data: {
            leadId: lead.id,
            assignedTo: superAdmin.id,
            scheduledAt: new Date(Date.now() + 86400000), // Tomorrow
            status: 'SCHEDULED',
            notes: 'Course: Full Stack Development\nQualification: B.Tech\nPassout: 2024'
        }
    });

    console.log('Sample demo lead created:', lead.id);
}

main().catch(e => {
    console.error(e);
    process.exit(1);
}).finally(async () => {
    await prisma.$disconnect();
});
