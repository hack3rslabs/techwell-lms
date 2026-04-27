const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  try {
    const interviews = await prisma.interview.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        questions: true
      }
    });
    console.log(JSON.stringify(interviews, null, 2));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

check();
