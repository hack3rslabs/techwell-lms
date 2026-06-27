require('dotenv').config();
const { processIncomingMessage } = require('./whatsappAgent');

/**
 * Mock simulator script to test WhatsApp AI Agent flow locally
 */
async function runSimulation() {
    console.log('=== START WHATSAPP AI AGENT SIMULATION ===');
    
    // Simulate user phone and messages
    const mockUserPhone = '+919999999999';
    const messages = [
        "Hello, I am interested in enrolling in a course.",
        "I want to learn DevOps. Do you have mock interviews?",
        "How do I build my ATS resume here?"
    ];

    for (const msg of messages) {
        console.log('\n----------------------------------------');
        console.log(`[USER SENT]: ${msg}`);
        
        try {
            const result = await processIncomingMessage(mockUserPhone, msg);
            console.log(`[AI AGENT REPLY]: ${result.reply}`);
            console.log(`[LINKED LEAD ID]: ${result.leadId}`);
        } catch (err) {
            console.error('[SIMULATION ERROR]:', err);
        }
    }
    
    console.log('\n=== END SIMULATION ===');
    process.exit(0);
}

runSimulation();
