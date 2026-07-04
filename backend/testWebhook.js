const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const express = require('express');
const AICore = require('./src/ai-core');

const MOCK_WEBHOOK_PORT = 9999;

async function run() {
    console.log("=== WEBHOOK CRM INTEGRATION TEST ===");

    // 1. Start a mock webhook receiver
    const app = express();
    app.use(express.json());
    
    let receivedPayload = null;
    
    app.post('/mock-webhook', (req, res) => {
        receivedPayload = req.body;
        console.log("\n🎯 [MOCK CRM WEBHOOK] Received POST request:");
        console.log(JSON.stringify(receivedPayload, null, 2));
        res.status(200).json({ success: true, message: "CRM Synced" });
    });

    const server = app.listen(MOCK_WEBHOOK_PORT, () => {
        console.log(`📡 Mock Webhook listening on http://localhost:${MOCK_WEBHOOK_PORT}/mock-webhook`);
    });

    // 2. Create the mock workflow in DB
    console.log("\n2. Seeding 'Push to CRM' Workflow...");
    const workflow = await prisma.aiWorkflow.create({
        data: {
            name: "Sync Leads to Salesforce",
            status: "ACTIVE",
            triggerType: "EVENT",
            triggerData: { eventType: "webhook.test.event" }
        }
    });
    
    const triggerNode = await prisma.aiWorkflowNode.create({ data: { workflowId: workflow.id, type: 'TRIGGER', label: 'Lead Arrived' } });
    const actionNode = await prisma.aiWorkflowNode.create({ data: { 
        workflowId: workflow.id, 
        type: 'ACTION', 
        label: 'Push to Webhook', 
        config: { 
            actionType: "PUSH_WEBHOOK",
            webhookUrl: `http://localhost:${MOCK_WEBHOOK_PORT}/mock-webhook`
        } 
    } });

    await prisma.aiWorkflowEdge.create({ data: { workflowId: workflow.id, sourceNodeId: triggerNode.id, targetNodeId: actionNode.id } });

    // 3. Trigger the EventBus
    console.log("\n3. Firing Event 'webhook.test.event'...");
    await AICore.trackEvent('webhook.test.event', 'TEST', { 
        name: "Test User", 
        email: "test@example.com", 
        source: "Website Form" 
    });

    // Wait a couple seconds for workflow engine to execute async
    await new Promise(resolve => setTimeout(resolve, 2000));

    if (receivedPayload) {
        console.log("\n✅ SUCCESS: The Workflow Engine successfully pushed data to the external Webhook URL!");
    } else {
        console.log("\n❌ FAILED: Webhook did not receive the payload.");
    }

    server.close();
}

run()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
