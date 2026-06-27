const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate, checkPermission } = require('../middleware/auth');
const { processIncomingMessage, sendWhatsAppMessage } = require('../utils/whatsappAgent');

const router = express.Router();
const prisma = new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL } } });

/**
 * @route   GET /api/whatsapp/webhook
 * @desc    Meta WhatsApp Webhook Verification Handshake
 * @access  Public
 */
router.get('/webhook', (req, res) => {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN || 'techwell_whatsapp_secret';

    if (mode && token) {
        if (mode === 'subscribe' && token === verifyToken) {
            console.log('[WhatsApp Webhook] Verification Handshake Successful');
            res.status(200).send(challenge);
        } else {
            console.warn('[WhatsApp Webhook] Handshake Failed: Token mismatch');
            res.sendStatus(403);
        }
    } else {
        res.sendStatus(400);
    }
});

/**
 * @route   POST /api/whatsapp/webhook
 * @desc    Meta WhatsApp Webhook Event Receiver
 * @access  Public
 */
router.post('/webhook', async (req, res) => {
    try {
        const body = req.body;
        console.log('[WhatsApp Webhook] Event payload received:', JSON.stringify(body));

        // Check if it's a message event
        if (body.object === 'whatsapp_business_account') {
            for (const entry of body.entry) {
                for (const change of entry.changes) {
                    if (change.field === 'messages') {
                        const value = change.value;
                        if (value.messages && value.messages.length > 0) {
                            const message = value.messages[0];
                            const phone = message.from; // Sender's phone number
                            
                            let messageText = '';
                            if (message.type === 'text') {
                                messageText = message.text.body;
                            } else if (message.type === 'button') {
                                messageText = message.button.text;
                            } else if (message.type === 'interactive') {
                                // Handles quick replies or list selectors
                                const type = message.interactive.type;
                                if (type === 'button_reply') {
                                    messageText = message.interactive.button_reply.title;
                                } else if (type === 'list_reply') {
                                    messageText = message.interactive.list_reply.title;
                                }
                            }

                            if (phone && messageText) {
                                // Trigger background execution so webhook returns 200 OK fast (as Meta expects)
                                processIncomingMessage(phone, messageText)
                                    .then(result => console.log('[WhatsApp Process] Finished:', result))
                                    .catch(err => console.error('[WhatsApp Process] Background Error:', err));
                            }
                        }
                    }
                }
            }
            return res.status(200).send('EVENT_RECEIVED');
        }

        res.sendStatus(404);
    } catch (error) {
        console.error('[WhatsApp Webhook] Processing Error:', error);
        res.sendStatus(500);
    }
});

/**
 * @route   GET /api/whatsapp/logs/:phone
 * @desc    Get chat log history for a lead / student
 * @access  Private/Admin
 */
router.get('/logs/:phone', authenticate, checkPermission('LEADS'), async (req, res, next) => {
    try {
        const logs = await prisma.whatsAppChatLog.findMany({
            where: { phone: req.params.phone },
            orderBy: { createdAt: 'asc' }
        });
        res.json(logs);
    } catch (error) {
        next(error);
    }
});

/**
 * @route   POST /api/whatsapp/send
 * @desc    Send a manual WhatsApp message to a lead / student
 * @access  Private/Admin
 */
router.post('/send', authenticate, checkPermission('LEADS'), async (req, res, next) => {
    try {
        const { phone, message } = req.body;

        if (!phone || !message) {
            return res.status(400).json({ error: 'Phone and message body are required' });
        }

        // Send via Meta Client
        const result = await sendWhatsAppMessage(phone, message);

        // Find associated lead to link
        const lead = await prisma.lead.findFirst({
            where: { phone: { contains: phone } }
        });

        // Log manual agent message
        await prisma.whatsAppChatLog.create({
            data: {
                phone,
                sender: 'AI_AGENT', // Handled by administrative agent/console
                message,
                leadId: lead?.id || null
            }
        });

        res.json({ success: true, result });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
