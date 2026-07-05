const express = require('express');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const router = express.Router();

// POST /api/crm/communicate/whatsapp
router.post('/whatsapp', async (req, res) => {
  try {
    const { leadId, customerId, templateId, message } = req.body;
    
    // Mocking WhatsApp API call
    console.log(`Sending WhatsApp to ${leadId || customerId}: ${message}`);
    
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
    console.error('Error sending WhatsApp:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/crm/communicate/email
router.post('/email', async (req, res) => {
  try {
    const { leadId, customerId, subject, body } = req.body;
    
    // Mocking Email API call
    console.log(`Sending Email to ${leadId || customerId}: ${subject}`);
    
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
router.post('/call', async (req, res) => {
  try {
    const { leadId, customerId, agentId } = req.body;
    
    // Mocking Click-to-Call API
    console.log(`Initiating Call to ${leadId || customerId} by agent ${agentId}`);
    
    const log = await prisma.communicationLog.create({
      data: {
        leadId: leadId || null,
        customerId: customerId || null,
        type: 'CALL',
        direction: 'OUTBOUND',
        status: 'INITIATED',
        content: `Call initiated by agent ${agentId}`,
      }
    });

    res.json({ success: true, data: log });
  } catch (error) {
    console.error('Error initiating Call:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
