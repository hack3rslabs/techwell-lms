const { PrismaClient } = require('./backend/node_modules/@prisma/client'); 
const prisma = new PrismaClient(); 
async function addMockCert() { 
    let user = await prisma.user.findFirst({ where: { role: 'STUDENT' }});
    let course = await prisma.course.findFirst();
    if (!user || !course) return console.log('no user/course');
    
    let enrollment = await prisma.enrollment.findFirst({ where: { userId: user.id, courseId: course.id }});
    if (!enrollment) {
        enrollment = await prisma.enrollment.create({ data: { userId: user.id, courseId: course.id, status: 'COMPLETED' }});
    }

    const exists = await prisma.certificate.findUnique({ where: { uniqueId: 'CERT-2026-00001' } });
    if (!exists) {
        await prisma.certificate.create({ 
            data: { 
                uniqueId: 'CERT-2026-00001', 
                userId: user.id, 
                courseId: course.id, 
                enrollmentId: enrollment.id,
                studentName: 'John Doe', 
                courseName: 'Advanced JavaScript', 
                courseCategory: 'Programming', 
                issueDate: new Date('2026-01-15'), 
                isValid: true, 
                status: 'ISSUED' 
            }
        }); 
        console.log('Mock cert added');
    } else {
        console.log('Mock cert already exists');
    }
} 
addMockCert().catch(console.error).finally(() => prisma.$disconnect());
