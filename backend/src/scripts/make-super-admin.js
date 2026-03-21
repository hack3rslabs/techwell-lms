const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const email = 'venukoyyana908@gmail.com';
  const plainPassword = 'Venu@95020';
  const hashedPassword = await bcrypt.hash(plainPassword, 10);

  const existingUser = await prisma.user.findUnique({ where: { email } });
  
  if (existingUser) {
    await prisma.user.update({
      where: { email },
      data: { role: 'SUPER_ADMIN', password: hashedPassword }
    });
    console.log('User updated to SUPER_ADMIN.');
  } else {
    await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: 'Super Admin',
        role: 'SUPER_ADMIN',
        emailVerified: true
      }
    });
    console.log('User created as SUPER_ADMIN.');
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
