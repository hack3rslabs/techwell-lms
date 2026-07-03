const cron = require('node-cron');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL } } });

const initMessageCron = () => {
  // Run every minute
  cron.schedule('* * * * *', async () => {
    try {
      const now = new Date();
      
      // 1. Publish scheduled messages
      const scheduledMessages = await prisma.adminMessage.findMany({
        where: {
          isPublished: false,
          scheduledFor: {
            lte: now
          }
        }
      });

      if (scheduledMessages.length > 0) {
        await prisma.adminMessage.updateMany({
          where: {
            id: {
              in: scheduledMessages.map(m => m.id)
            }
          },
          data: {
            isPublished: true
          }
        });
        console.log(`[Cron] Published ${scheduledMessages.length} scheduled messages.`);
      }

      // 2. Delete expired messages
      const expiredMessages = await prisma.adminMessage.findMany({
        where: {
          expiresAt: {
            lte: now
          }
        }
      });

      if (expiredMessages.length > 0) {
        await prisma.adminMessage.deleteMany({
          where: {
            id: {
              in: expiredMessages.map(m => m.id)
            }
          }
        });
        console.log(`[Cron] Deleted ${expiredMessages.length} expired messages.`);
      }

    } catch (error) {
      console.error('[Cron] Error running message cron jobs:', error);
    }
  });
  
  console.log('Message Cron initialized');
};

module.exports = initMessageCron;
