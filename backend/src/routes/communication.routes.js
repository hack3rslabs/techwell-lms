const express = require('express');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { sendEmail } = require('../services/email.service');

const router = express.Router();

// POST /api/crm/communicate/whatsapp
// Note: Currently functions as a manual logger for WhatsApp interactions. API integration pending.
router.post('/whatsapp', async (req, res) => {
  try {
    const { leadId, customerId, templateId, message } = req.body;
    
    const log = await prisma.communicationLog.create({
      data: {
        leadId: leadId || null,
        customerId: customerId || null,
        type: 'WHATSAPP',
        direction: 'OUTBOUND',
        status: 'SENT',
        content: message,
      }
    });

    res.json({ success: true, data: log });
  } catch (error) {
    console.error('Error logging WhatsApp:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/crm/communicate/email
router.post('/email', async (req, res) => {
  try {
    const { leadId, customerId, subject, body } = req.body;
    
    let targetEmail = null;
    if (leadId) {
      const lead = await prisma.lead.findUnique({ where: { id: leadId } });
      targetEmail = lead?.email;
    } else if (customerId) {
      const customer = await prisma.customer.findUnique({ where: { id: customerId } });
      targetEmail = customer?.email;
    }

    if (!targetEmail) {
      return res.status(400).json({ success: false, message: 'Target email not found for the provided Lead/Customer.' });
    }

    // Send real email via service
    const emailSent = await sendEmail(targetEmail, subject, body);
    
    if (!emailSent) {
       return res.status(500).json({ success: false, message: 'Failed to dispatch email via service.' });
    }
    
    const log = await prisma.communicationLog.create({
      data: {
        leadId: leadId || null,
        customerId: customerId || null,
        type: 'EMAIL',
        direction: 'OUTBOUND',
        status: 'SENT',
        content: `Subject: ${subject}\n\n${body}`,
      }
    });

    res.json({ success: true, data: log });
  } catch (error) {
    console.error('Error sending Email:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/crm/communicate/call
// Note: Currently functions as a manual logger for Call interactions. Click-to-call API integration pending.
router.post('/call', async (req, res) => {
  try {
    const { leadId, customerId, agentId } = req.body;
    
    const log = await prisma.communicationLog.create({
      data: {
        leadId: leadId || null,
        customerId: customerId || null,
        type: 'CALL',
        direction: 'OUTBOUND',
        status: 'INITIATED',
        content: `Call logged by agent ${agentId}`,
      }
    });

    res.json({ success: true, data: log });
  } catch (error) {
    console.error('Error logging Call:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
