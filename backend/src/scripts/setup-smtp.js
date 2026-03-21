/**
 * Setup SMTP Configuration
 * Usage: node setup-smtp.js <host> <port> <user> <pass> <fromEmail>
 */
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const [,, host, port, user, pass, fromEmail] = process.argv;

if (!host || !port || !user || !pass) {
  console.log('Usage: node setup-smtp.js <host> <port> <user> <pass> [fromEmail]');
  process.exit(1);
}

async function setup() {
  try {
    // Deactivate others
    await prisma.emailIntegration.updateMany({
      data: { isActive: false }
    });

    const config = await prisma.emailIntegration.upsert({
      where: { id: 'manual-smtp-setup' }, // Use a fixed ID or check if one exists
      update: {
        provider: 'SMTP',
        name: 'Manual SMTP',
        host,
        port: parseInt(port),
        user,
        pass,
        fromEmail: fromEmail || user,
        isActive: true
      },
      create: {
        id: 'manual-smtp-setup',
        provider: 'SMTP',
        name: 'Manual SMTP',
        host,
        port: parseInt(port),
        user,
        pass,
        fromEmail: fromEmail || user,
        isActive: true
      }
    });

    console.log('Successfully configured SMTP:');
    console.log(JSON.stringify({
      id: config.id,
      provider: config.provider,
      host: config.host,
      port: config.port,
      user: config.user,
      isActive: config.isActive
    }, null, 2));

  } catch (error) {
    console.error('Error setting up SMTP:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

setup();
