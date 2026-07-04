const twilio = require('twilio');
const express = require('express');
const VoiceResponse = require('twilio').twiml.VoiceResponse;
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL } } });

async function getTwilioConfig() {
    const config = await prisma.aiIntegration.findUnique({
        where: { provider: 'TWILIO' }
    });
    
    if (!config || !config.isActive) {
        throw new Error("Twilio integration is not configured or is inactive.");
    }
    
    return config.config; // { accountSid, authToken, fromNumber }
}

async function sendTwilioSMS(to, body) {
    try {
        const config = await getTwilioConfig();
        const client = twilio(config.accountSid, config.authToken);
        
        const message = await client.messages.create({
            body: body,
            from: config.fromNumber,
            to: to
        });
        
        console.log(`[Twilio Provider] SMS sent to ${to}. SID: ${message.sid}`);
        return { success: true, sid: message.sid };
    } catch (error) {
        console.error(`[Twilio Provider] Failed to send SMS:`, error.message);
        return { success: false, error: error.message };
    }
}

async function makeTwilioCall(to, twimlUrl) {
    try {
        const config = await getTwilioConfig();
        const client = twilio(config.accountSid, config.authToken);
        
        const call = await client.calls.create({
            from: config.fromNumber,
            to: to,
            url: twimlUrl || "http://demo.twilio.com/docs/voice.xml" // fallback to demo TwiML
        });
        
        console.log(`[Twilio Provider] Call initiated to ${to}. SID: ${call.sid}`);
        return { success: true, sid: call.sid };
    } catch (error) {
        console.error(`[Twilio Provider] Failed to initiate call:`, error.message);
        return { success: false, error: error.message };
    }
}

// Create an Express Router to handle Twilio Webhooks
const twilioRouter = express.Router();

// The endpoint that Twilio will hit when a call connects
twilioRouter.post('/voice', (req, res) => {
    // You can parse req.body to see who is calling or what the call status is
    const twiml = new VoiceResponse();
    
    // Play a message to the caller
    twiml.say('Hello from the Techwell AI Automation Platform! Your call is very important to us.');
    
    // Respond with XML
    res.type('text/xml');
    res.send(twiml.toString());
});

module.exports = {
    sendTwilioSMS,
    makeTwilioCall,
    twilioRouter
};
