const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class EventBus {
  constructor() {
    this.subscribers = new Map();
    console.log('🚀 AI EventBus Initialized');
  }

  /**
   * Publish an event to the AI Event Bus
   * @param {string} eventType e.g., 'student.enrolled'
   * @param {string} source e.g., 'LMS'
   * @param {object} payload 
   */
  async publish(eventType, source, payload) {
    console.log(`[EventBus] Received event: ${eventType} from ${source}`);
    
    try {
      // 1. Log the event persistently in Postgres
      const eventLog = await prisma.platformEvent.create({
        data: {
          eventType,
          source,
          payload
        }
      });

      // 2. Trigger active workflows that listen for this event
      await this.triggerWorkflows(eventLog);

      // 3. Mark as processed (in a real system, do this after workflow completion)
      await prisma.platformEvent.update({
        where: { id: eventLog.id },
        data: { status: 'PROCESSED', processedAt: new Date() }
      });

    } catch (error) {
      console.error(`[EventBus] Error processing event ${eventType}:`, error);
    }
  }

  /**
   * Find and execute workflows triggered by this event
   */
  async triggerWorkflows(eventLog) {
    const workflows = await prisma.aiWorkflow.findMany({
      where: {
        status: 'ACTIVE',
        triggerType: 'EVENT'
      },
      include: {
        nodes: true,
        edges: true
      }
    });

    for (const workflow of workflows) {
      const triggerConfig = workflow.triggerData || {};
      // If the workflow listens for this specific event type
      if (triggerConfig.eventType === eventLog.eventType) {
        console.log(`[EventBus] Triggering Workflow ID: ${workflow.id} for event ${eventLog.eventType}`);
        const workflowEngine = require('../workflow-engine/WorkflowEngine');
        await workflowEngine.execute(workflow, eventLog);
      }
    }
  }
}

module.exports = new EventBus();
