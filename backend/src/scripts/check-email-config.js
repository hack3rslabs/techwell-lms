const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkConfig() {
  try {
    const config = await prisma.emailIntegration.findFirst({
      where: { isActive: true }
    });
    
    if (config) {
      console.log('ACTIVE_CONFIG_FOUND');
      console.log('Provider:', config.provider);
      console.log('Host:', config.host);
      console.log('Port:', config.port);
      console.log('User:', config.user);
      console.log('Pass:', config.pass ? 'SET (****)' : 'NOT SET');
    } else {
      console.log('NO_ACTIVE_CONFIG_FOUND');
    }
  } catch (error) {
    console.error('ERROR:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkConfig();
