
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkUserStatus(email) {
    try {
        const user = await prisma.user.findUnique({
            where: { email },
            include: {
                enrollments: {
                    include: { course: true }
                },
                payments: true
            }
        });

        if (!user) {
            console.log('User not found');
            return;
        }

        console.log('User ID:', user.id);
        console.log('User Name:', user.name);
        console.log('\nEnrollments:', JSON.stringify(user.enrollments, null, 2));
        console.log('\nPayments:', JSON.stringify(user.payments, null, 2));

    } catch (error) {
        console.error('Error checking user status:', error);
    } finally {
        await prisma.$disconnect();
    }
}

// Replace with the user's email if you know it, or we can list all users with payments
checkUserStatus(process.argv[2]);
