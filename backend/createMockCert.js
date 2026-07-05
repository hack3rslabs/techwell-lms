const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        let user = await prisma.user.findUnique({ where: { email: 'c3hlabs@gmail.com' } });
        if (!user) {
            user = await prisma.user.create({
                data: {
                    email: 'c3hlabs@gmail.com',
                    name: 'C3H Labs Test',
                    password: 'hashed_password', // Just mock
                    role: 'STUDENT'
                }
            });
            console.log('Created user:', user.email);
        }

        // Check if certificate already exists
        const certs = await prisma.certificate.findMany({ where: { userId: user.id } });
        if (certs.length > 0) {
            console.log('Certificate already exists with ID:', certs[0].uniqueId);
            return;
        }

        const cert = await prisma.certificate.create({
            data: {
                uniqueId: 'CERT-' + Math.random().toString(36).substring(2, 10).toUpperCase(),
                studentName: 'C3H Labs Tester',
                courseName: 'Full Stack Web Development Professional',
                courseCategory: 'ENGINEERING',
                issueDate: new Date(),
                grade: 'A+',
                signatoryName: 'John Doe',
                signatoryTitle: 'Director of Education',
                verificationUrl: 'http://localhost:3000/certificates/',
                userId: user.id
            }
        });
        
        // Update URL to include the ID
        await prisma.certificate.update({
            where: { id: cert.id },
            data: { verificationUrl: 'http://localhost:3000/certificates/' + cert.uniqueId }
        });

        console.log('Mock certificate created successfully!');
        console.log('Unique ID:', cert.uniqueId);
        console.log('URL: http://localhost:3000/certificates/' + cert.uniqueId);
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}
main();
