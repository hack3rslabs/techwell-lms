const express = require('express');
const { PrismaClient } = require('@prisma/client');
const AICore = require('../../../ai-core');
const router = express.Router();

const prisma = new PrismaClient();

// Vapi Webhook Endpoint (Receives Server URL Events)
router.post('/vapi', async (req, res) => {
  try {
    const { message } = req.body;

    // Vapi sends a 'end-of-call-report' message when the call is completed
    if (message && message.type === 'end-of-call-report') {
      const callData = message.call;
      // We assume the lead ID or phone was passed in the assistantOverrides context during call initiation
      const leadContext = callData.assistantOverrides?.variableValues?.context;
      
      let leadId = null;
      if (leadContext) {
        try {
          const parsedContext = JSON.parse(leadContext);
          leadId = parsedContext.leadId || parsedContext.id;
        } catch (e) {
          console.warn('[Vapi Webhook] Could not parse context to find leadId');
        }
      }

      // If we don't have leadId from context, try matching by phone number
      if (!leadId && callData.customer?.number) {
        const lead = await prisma.lead.findFirst({
          where: { phone: callData.customer.number }
        });
        if (lead) leadId = lead.id;
      }

      if (leadId) {
        // Log the call summary to the lead notes
        const existingLead = await prisma.lead.findUnique({ where: { id: leadId } });
        if (existingLead) {
          const newNote = `[AI Telecaller Summary]\nCall Duration: ${callData.endedAt ? new Date(callData.endedAt).getTime() - new Date(callData.startedAt).getTime() : 'Unknown'}ms\nSummary: ${message.summary || 'No summary provided.'}\nTranscript: ${message.transcript || 'No transcript.'}`;
          
          await prisma.lead.update({
            where: { id: leadId },
            data: {
              notes: existingLead.notes ? `${existingLead.notes}\n\n${newNote}` : newNote,
              // We could tentatively set status to FOLLOW_UP, but let's let the AI Workflow decide that
            }
          });
          
          await prisma.leadActivityLog.create({
              data: {
                  leadId: leadId,
                  actionType: 'VAPI_CALL_COMPLETED',
                  notes: newNote,
                  performedBy: 'SYSTEM_AI'
              }
          });

          // Trigger AI Workflow to process the outcome
          AICore.trackEvent('lead.call_completed', 'VAPI_WEBHOOK', {
            leadId,
            summary: message.summary,
            transcript: message.transcript,
            endedReason: message.endedReason
          }).catch(err => console.error('[AICore Webhook] Failed to track lead.call_completed:', err));
        }
      }
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('[Vapi Webhook Error]:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
