const cron = require('node-cron');
const { PrismaClient } = require('@prisma/client');
const AICore = require('../../ai-core');
const prisma = new PrismaClient();

function initFollowUpCron() {
  // Run every day at 10:00 AM
  // "0 10 * * *"
  cron.schedule('0 10 * * *', async () => {
    console.log('[Cron Job] Running daily lead follow-up task...');
    
    try {
      // Find all leads that need follow up
      const leadsToFollowUp = await prisma.lead.findMany({
        where: {
          OR: [
            { status: 'FOLLOW_UP' },
            { status: 'INTERESTED' },
            { status: 'CONTACTED' }
          ]
        },
        take: 100 // Process in batches if necessary
      });

      console.log(`[Cron Job] Found ${leadsToFollowUp.length} leads requiring follow-up.`);

      for (const lead of leadsToFollowUp) {
        // Trigger the AI Workflow engine
        // The workflow configured for 'lead.daily_followup' will take over,
        // using the AI Persona to read the lead's notes/history and draft an SMS/WhatsApp.
        try {
          await AICore.trackEvent('lead.daily_followup', 'CRON_SCHEDULER', {
            leadId: lead.id,
            ...lead
          });
          console.log(`[Cron Job] Queued follow-up for Lead ID: ${lead.id}`);
        } catch (err) {
          console.error(`[Cron Job] Failed to queue follow-up for Lead ID: ${lead.id}`, err);
        }
      }

    } catch (error) {
      console.error('[Cron Job Error] Failed to run daily follow-up task:', error);
    }
  });
  
  console.log('[Cron Job] Daily lead follow-up task scheduled.');
}

module.exports = initFollowUpCron;
