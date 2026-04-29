const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  try {
    console.log('Checking DB connection...');
    const users = await prisma.user.count();
    console.log(`Success! Users count: ${users}`);
    process.exit(0);
  } catch (err) {
    console.error('DB Connection Failed:', err);
    process.exit(1);
  }
}

check();
