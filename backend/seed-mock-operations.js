const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedOperations() {
    try {
        console.log("Seeding mock operations data...");
        
        // 1. Create some New Leads
        const leadsData = [
            { name: 'John Doe', email: 'john.doe@example.com', source: 'Facebook Ads', status: 'NEW' },
            { name: 'Alice Smith', email: 'alice@example.com', source: 'Google Search', status: 'CONTACTED' },
            { name: 'Robert Johnson', email: 'robert@example.com', source: 'Referral', status: 'INTERESTED' }
        ];

        for (const lead of leadsData) {
            await prisma.lead.create({ data: lead });
        }
        console.log("✅ Created mock leads");

        // 2. Fetch the first user (student) to enroll them in a course to show as "In Training"
        const student = await prisma.user.findFirst({ where: { role: 'STUDENT' } });
        const course = await prisma.course.findFirst();
        
        if (student && course) {
            // Check if enrollment already exists
            const existingEnrollment = await prisma.enrollment.findUnique({
                where: { userId_courseId: { userId: student.id, courseId: course.id } }
            });
            
            if (!existingEnrollment) {
                await prisma.enrollment.create({
                    data: {
                        userId: student.id,
                        courseId: course.id,
                        progress: 45
                    }
                });
                console.log("✅ Enrolled mock student to show in training");
            }
        }

        // 3. Create Candidate Profiles for Placement Ready and Hired
        const candidates = [
            { name: 'Emma Wilson', category: 'Software Development', atsScore: 85, status: 'SCREENING', experienceLevel: 'FRESHER' },
            { name: 'Michael Brown', category: 'Data Science', atsScore: 92, status: 'SCREENING', experienceLevel: 'FRESHER' },
            { name: 'Sophia Davis', category: 'Cloud Computing', atsScore: 78, status: 'HIRED', experienceLevel: 'FRESHER' }
        ];

        for (const cand of candidates) {
            // we skip creating user/lead links for mock simplicity, just the profile
            await prisma.candidateProfile.create({ data: cand });
        }
        console.log("✅ Created mock candidate profiles (Placement Ready & Hired)");

        console.log("🎉 Operations Mock Seed Complete!");
    } catch (error) {
        console.error("Error seeding operations data:", error);
    } finally {
        await prisma.$disconnect();
    }
}

seedOperations();
