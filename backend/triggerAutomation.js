const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const AICore = require('./src/ai-core');

async function run() {
    console.log("--- 1. Seeding test lead ---");
    const lead = await prisma.lead.create({
        data: {
            name: "Test User",
            email: `test${Date.now()}@techwell.co.in`,
            phone: "+919999999999",
            status: "INTERESTED",
            source: "WEBSITE",
            notes: "Interested in Data Science course"
        }
    });
    console.log(`Created Lead ID: ${lead.id}`);

    console.log("--- 2. Seeding AI Workflow ---");
    const workflow = await prisma.aiWorkflow.create({
        data: {
            name: "Lead Daily Follow-Up",
            status: "ACTIVE",
            triggerType: "EVENT",
            triggerData: { eventType: "lead.daily_followup" }
        }
    });

    const triggerNode = await prisma.aiWorkflowNode.create({ data: { workflowId: workflow.id, type: 'TRIGGER', label: 'Start' } });
    const aiNode = await prisma.aiWorkflowNode.create({ data: { workflowId: workflow.id, type: 'AI_REASON', label: 'Draft SMS', config: { systemPrompt: "Write a friendly follow-up SMS to a student interested in our tech courses." } } });
    const actionNode = await prisma.aiWorkflowNode.create({ data: { workflowId: workflow.id, type: 'ACTION', label: 'Send SMS', config: { actionType: "SEND_TWILIO_SMS" } } });

    await prisma.aiWorkflowEdge.createMany({
        data: [
            { workflowId: workflow.id, sourceNodeId: triggerNode.id, targetNodeId: aiNode.id },
            { workflowId: workflow.id, sourceNodeId: aiNode.id, targetNodeId: actionNode.id }
        ]
    });
    console.log(`Created Workflow ID: ${workflow.id}`);

    console.log("--- 3. Triggering follow-up event via EventBus ---");
    try {
        await AICore.trackEvent('lead.daily_followup', 'MANUAL_TEST', {
            leadId: lead.id,
            ...lead
        });
        console.log("Event tracking finished.");
    } catch (err) {
        console.error("Failed to trigger event", err);
    }
}

run()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
