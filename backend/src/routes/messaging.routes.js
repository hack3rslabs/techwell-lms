const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate, checkPermission } = require('../middleware/auth');
const { sendEmail } = require('../utils/emailSender');
const { sendWhatsAppMessage } = require('../utils/whatsappAgent');

const prisma = new PrismaClient();
const router = express.Router();

/**
 * @route   POST /api/messaging/bulk
 * @desc    Send bulk messages to users via email and/or WhatsApp
 * @access  Private/Admin
 */
router.post('/bulk', authenticate, checkPermission('USERS'), async (req, res, next) => {
    try {
        const { userIds, channels, subject, message } = req.body;

        if (!Array.isArray(userIds) || userIds.length === 0) {
            return res.status(400).json({ error: 'userIds array is required and must not be empty' });
        }
        if (!Array.isArray(channels) || channels.length === 0) {
            return res.status(400).json({ error: 'channels array is required (EMAIL, WHATSAPP)' });
        }
        if (!message) {
            return res.status(400).json({ error: 'message content is required' });
        }

        const users = await prisma.user.findMany({
            where: { id: { in: userIds } },
            select: { id: true, name: true, email: true, phone: true }
        });

        let emailCount = 0;
        let whatsappCount = 0;

        for (const user of users) {
            // Replace simple placeholder
            const personalizedMessage = message.replace(/{{name}}/g, user.name);

            if (channels.includes('EMAIL') && user.email) {
                sendEmail({
                    to: user.email,
                    subject: subject || 'Message from Techwell LMS',
                    text: personalizedMessage,
                    html: `<p>${personalizedMessage.replace(/\n/g, '<br/>')}</p>`
                }).catch(err => console.error(`[Bulk Messaging] Failed to send email to ${user.email}`));
                emailCount++;
            }

            if (channels.includes('WHATSAPP') && user.phone) {
                sendWhatsAppMessage(user.phone, personalizedMessage)
                    .catch(err => console.error(`[Bulk Messaging] Failed to send WA to ${user.phone}`));
                whatsappCount++;
            }
        }

        res.status(200).json({
            success: true,
            message: `Bulk message dispatch initiated.`,
            stats: {
                usersSelected: userIds.length,
                emailsQueued: emailCount,
                whatsappQueued: whatsappCount
            }
        });

    } catch (error) {
        next(error);
    }
});

module.exports = router;
