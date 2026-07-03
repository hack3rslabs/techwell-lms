const axios = require('axios');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL } } });

async function getWhatsAppConfig() {
    const config = await prisma.aiIntegration.findUnique({
        where: { provider: 'WHATSAPP' }
    });
    
    if (!config || !config.isActive) {
        throw new Error("WhatsApp integration is not configured or is inactive.");
    }
    
    return config.config; // { phoneNumberId, accessToken }
}

const whatsappWebClient = require('./whatsappWebClient');

async function sendWhatsAppMessage(to, body) {
    try {
        return await whatsappWebClient.sendMessage(to, body);
    } catch (error) {
        return { success: false, error: error.message };
    }
}

module.exports = {
    sendWhatsAppMessage
};
