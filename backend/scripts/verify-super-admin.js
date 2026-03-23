const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function verifySuperAdmin() {
  try {
    const user = await prisma.user.findUnique({
      where: { email: 'venukoyyana908@gmail.com' },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (user) {
      console.log('\n✅ SUPER_ADMIN User Found!\n');
      console.log('User Details:');
      console.log('='.repeat(50));
      console.log(`ID: ${user.id}`);
      console.log(`Email: ${user.email}`);
      console.log(`Name: ${user.name}`);
      console.log(`Role: ${user.role}`);
      console.log(`Is Active: ${user.isActive}`);
      console.log(`Email Verified: ${user.emailVerified}`);
      console.log(`Created At: ${user.createdAt}`);
      console.log(`Updated At: ${user.updatedAt}`);
      console.log('='.repeat(50));
    } else {
      console.log('❌ User not found!');
    }
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

verifySuperAdmin();
