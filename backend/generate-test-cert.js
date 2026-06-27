const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const email = 'c3hlabs@gmail.com';
    const courseTitle = 'Global Logic Basics';

    // 1. Find or Create User
    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
        user = await prisma.user.create({
            data: {
                name: 'C3H Labs Student',
                email: email,
                password: 'password123',
                role: 'STUDENT'
            }
        });
        console.log("Created user:", user.email);
    } else {
        console.log("Found user:", user.email);
    }

    // 2. Find or Create Course
    let course = await prisma.course.findFirst({ where: { title: courseTitle } });
    if (!course) {
        // Find instructor
        const instructor = await prisma.user.findFirst({ where: { role: 'INSTRUCTOR' } }) || user;
        
        course = await prisma.course.create({
            data: {
                title: courseTitle,
                description: 'A test course for Global Logic Basics',
                price: 0,
                instructorId: instructor.id,
                thumbnail: 'https://via.placeholder.com/150',
                published: true,
                slug: 'global-logic-basics-' + Date.now()
            }
        });
        console.log("Created course:", course.title);
    } else {
        console.log("Found course:", course.title);
    }

    // 3. Find or Create Enrollment
    let enrollment = await prisma.enrollment.findFirst({
        where: { userId: user.id, courseId: course.id }
    });
    if (!enrollment) {
        enrollment = await prisma.enrollment.create({
            data: {
                userId: user.id,
                courseId: course.id,
                progress: 100,
                status: 'COMPLETED',
                completedAt: new Date()
            }
        });
        console.log("Created enrollment");
    } else {
        await prisma.enrollment.update({
            where: { id: enrollment.id },
            data: { progress: 100, status: 'COMPLETED', completedAt: new Date() }
        });
        console.log("Updated enrollment to completed");
    }

    // 4. Create Certificate
    const uniqueId = 'TW-' + new Date().getFullYear() + '-' + Math.floor(10000 + Math.random() * 90000);
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 2);

    const certificate = await prisma.certificate.create({
        data: {
            uniqueId,
            userId: user.id,
            courseId: course.id,
            enrollmentId: enrollment.id,
            studentName: user.name,
            courseName: course.title,
            startDate: startDate,
            endDate: new Date(),
            signatoryName: "U Purushottama Rao",
            signatoryTitle: "Course Director",
            grade: "A+",
            score: 98
        }
    });

    console.log("=========================================");
    console.log(`Certificate Created Successfully!`);
    console.log(`Certificate ID: ${certificate.uniqueId}`);
    console.log(`View URL: http://localhost:3000/certificate/${certificate.uniqueId}`);
    console.log("=========================================");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
