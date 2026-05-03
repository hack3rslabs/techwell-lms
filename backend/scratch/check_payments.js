
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkPayments() {
    try {
        const payments = await prisma.payment.findMany({
            include: {
                user: { select: { name: true, email: true } },
                course: { select: { title: true } }
            }
        });
        console.log(`Found ${payments.length} total payments.`);
        payments.forEach(p => {
            console.log(`ID: ${p.id}, Status: ${p.status}, Student: ${p.user?.name}, Course: ${p.course?.title}`);
        });
    } catch (error) {
        console.error(error);
    } finally {
        await prisma.$disconnect();
    }
}

checkPayments();
