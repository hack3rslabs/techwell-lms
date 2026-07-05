
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        await prisma.certificate.update({
            where: { uniqueId: 'TW-2026-92244' },
            data: {
                studentName: 'C3H Labs Tester',
                courseName: 'Full Stack Web Development Professional',
                signatoryName: 'John Doe',
                signatoryTitle: 'Director of Education',
                grade: 'A+'
            }
        });
        console.log('Certificate updated successfully!');
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}
main();

