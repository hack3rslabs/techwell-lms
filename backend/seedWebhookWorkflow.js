const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seed() {
    console.log("Seeding a default 'Central CRM Sync' Workflow to make things simple...");
    
    // Check if it already exists
    const existing = await prisma.aiWorkflow.findFirst({
        where: { name: "Central CRM Sync (Auto-Forward Leads)" }
    });
    
    if (existing) {
        console.log("Workflow already exists!");
        return;
    }

    const workflow = await prisma.aiWorkflow.create({
        data: {
            name: "Central CRM Sync (Auto-Forward Leads)",
            status: "ACTIVE",
            triggerType: "EVENT",
            triggerData: { eventType: "lead_created" }
        }
    });
    
    const triggerNode = await prisma.aiWorkflowNode.create({ 
        data: { workflowId: workflow.id, type: 'TRIGGER', label: 'New Lead Captured' } 
    });
    
    const actionNode = await prisma.aiWorkflowNode.create({ 
        data: { 
            workflowId: workflow.id, 
            type: 'ACTION', 
            label: 'Push to Zapier/Make', 
            config: { 
                actionType: "PUSH_WEBHOOK",
                webhookUrl: "https://hook.us1.make.com/YOUR_WEBHOOK_ID_HERE"
            } 
        } 
    });

    await prisma.aiWorkflowEdge.create({ 
        data: { workflowId: workflow.id, sourceNodeId: triggerNode.id, targetNodeId: actionNode.id } 
    });

    console.log(`Successfully created Workflow ID: ${workflow.id}`);
    console.log("You can view and edit this in the Automation Studio UI!");
}

seed()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
