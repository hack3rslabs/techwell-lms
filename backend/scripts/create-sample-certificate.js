const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL } } });

async function createSample() {
    try {
        console.log('Fetching/Creating mock course and student...');
        
        // Find or create student
        let student = await prisma.user.findFirst({ where: { role: 'STUDENT' } });
        if (!student) {
            console.log('No student found. Creating a mock student...');
            student = await prisma.user.create({
                data: {
                    name: 'Alex Mercer',
                    email: 'alex.mercer@gmail.com',
                    password: 'MockPassword123!',
                    role: 'STUDENT',
                    emailVerified: true
                }
            });
        }

        // Find or create course
        let course = await prisma.course.findFirst();
        if (!course) {
            console.log('No course found. Creating a mock course...');
            const instructor = await prisma.user.findFirst({ where: { role: 'INSTRUCTOR' } }) 
                || await prisma.user.findFirst({ where: { role: 'SUPER_ADMIN' } });
            
            course = await prisma.course.create({
                data: {
                    title: 'Advanced DevOps & Cloud Infrastructure',
                    description: 'Master AWS, Terraform, Docker, and CI/CD pipelines',
                    price: 299,
                    category: 'Cloud Engineering',
                    isPublished: true,
                    instructorId: instructor.id,
                    duration: 40
                }
            });
        }

        // Find or create enrollment
        let enrollment = await prisma.enrollment.findFirst({
            where: { userId: student.id, courseId: course.id }
        });
        if (!enrollment) {
            console.log('Creating enrollment record...');
            enrollment = await prisma.enrollment.create({
                data: {
                    userId: student.id,
                    courseId: course.id,
                    status: 'COMPLETED'
                }
            });
        }

        // Check if certificate already exists
        const uniqueId = 'TW-2026-99999';
        const existing = await prisma.certificate.findUnique({
            where: { uniqueId }
        });

        if (existing) {
            console.log(`Sample certificate already exists with ID: ${uniqueId}`);
            return;
        }

        // Find default template
        const template = await prisma.certificateTemplate.findFirst({
            where: { isDefault: true }
        });

        // Create sample certificate
        const cert = await prisma.certificate.create({
            data: {
                uniqueId,
                userId: student.id,
                courseId: course.id,
                enrollmentId: enrollment.id,
                studentName: student.name,
                courseName: course.title,
                courseCategory: course.category || 'General',
                grade: 'A+',
                score: 98,
                templateId: template?.id || null,
                signatoryName: 'Dr. Sarah Jenkins',
                signatoryTitle: 'Chancellor of Academy Board',
                issueDate: new Date(),
                verificationUrl: `/certificates/verify/${uniqueId}`
            }
        });

        console.log('\n==================================================');
        console.log('✅ Sample Certificate Successfully Created!');
        console.log(`- Registration ID: ${cert.uniqueId}`);
        console.log(`- Student Name:   ${cert.studentName}`);
        console.log(`- Course Name:    ${cert.courseName}`);
        console.log(`- View/Print URL:  /certificate/${cert.uniqueId}`);
        console.log(`- Verify URL:      /verify (Search for: ${cert.uniqueId})`);
        console.log('==================================================\n');

    } catch (error) {
        console.error('Failed to create sample certificate:', error);
    } finally {
        await prisma.$disconnect();
    }
}

createSample();
