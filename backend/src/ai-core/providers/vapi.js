const axios = require('axios');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL } } });

async function getVapiConfig() {
    const config = await prisma.aiIntegration.findUnique({
        where: { provider: 'VAPI' }
    });
    
    if (!config || !config.isActive) {
        throw new Error("Vapi integration is not configured or is inactive.");
    }
    
    return config.config; // { apiKey, phoneNumberId, assistantId }
}

async function initiateVapiCall(to, leadName, contextData) {
    try {
        const config = await getVapiConfig();
        
        const response = await axios.post(
            'https://api.vapi.ai/call/phone',
            {
                phoneNumberId: config.phoneNumberId,
                assistantId: config.assistantId,
                customer: {
                    number: to,
                    name: leadName || "Customer"
                },
                assistantOverrides: {
                    variableValues: {
                        name: leadName || "Customer",
                        context: JSON.stringify(contextData)
                    }
                }
            },
            {
                headers: {
                    'Authorization': `Bearer ${config.apiKey}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log(`[Vapi Provider] Call initiated to ${to}. Call ID: ${response.data.id}`);
        return { success: true, callId: response.data.id };
    } catch (error) {
        console.error(`[Vapi Provider] Failed to initiate call:`, error.response?.data || error.message);
        return { success: false, error: error.response?.data || error.message };
    }
}

module.exports = {
    initiateVapiCall
};
