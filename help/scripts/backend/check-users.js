const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.user.findFirst().then(u => {
    console.log('Found user:', u ? u.email : 'None');
    prisma.$disconnect();
});
