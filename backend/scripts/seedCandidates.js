const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Seeding candidate leads...');
    
    // Create a dummy user first
    const user = await prisma.user.create({
        data: {
            name: 'Priya Sharma',
            email: 'priya.sharma' + Date.now() + '@example.com',
            password: 'hashedpassword',
            role: 'STUDENT',
        }
    });

    const lead1 = await prisma.candidateProfile.create({
        data: {
            userId: user.id,
            name: 'Priya Sharma',
            email: user.email,
            phone: '+91 9876543210',
            skills: ['React', 'Node.js', 'TypeScript', 'MongoDB'],
            category: 'IT_FULL_STACK',
            atsScore: 85,
            readinessScore: 92,
            status: 'INTERVIEW_READY',
            interestType: 'JOB',
            experienceLevel: 'EXPERIENCED',
            currentCTC: '6 LPA',
            expectedCTC: '10 LPA',
            noticePeriod: '30 Days',
            interestedRole: 'Senior Full Stack Developer',
            paymentStatus: 'PREMIUM',
        }
    });

    // Create another dummy lead
    const lead2 = await prisma.candidateProfile.create({
        data: {
            name: 'Rahul Verma',
            email: 'rahul.v' + Date.now() + '@example.com',
            phone: '+91 8765432109',
            skills: ['Python', 'Django', 'SQL', 'AWS'],
            category: 'IT_PYTHON',
            atsScore: 65,
            readinessScore: 50,
            status: 'TRAINING',
            interestType: 'JOB',
            experienceLevel: 'FRESHER',
            expectedCTC: '4 LPA',
            noticePeriod: 'Immediate',
            interestedRole: 'Backend Python Developer',
            paymentStatus: 'UNPAID',
        }
    });

    console.log('Sample Candidates seeded:', { lead1: lead1.id, lead2: lead2.id });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
