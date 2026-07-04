const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const axios = require('axios');
const agentFleet = require('../agents/AgentFleet');
const twilioProvider = require('../providers/twilio');
const vapiProvider = require('../providers/vapi');
const whatsappProvider = require('../providers/whatsapp');
const emailProvider = require('../providers/emailProvider');
const { generateAIResponse } = require('../rag/queryService');

class WorkflowEngine {
  /**
   * Start executing a workflow
   */
  async execute(workflow, eventLog) {
    console.log(`[WorkflowEngine] Starting execution of Workflow ID: ${workflow.id}`);
    
    // Create execution log
    const execution = await prisma.aiExecutionLog.create({
      data: {
        workflowId: workflow.id,
        eventId: eventLog?.id,
        status: 'RUNNING',
        inputData: eventLog?.payload || {},
      }
    });

    try {
      // Find the trigger node
      const triggerNode = workflow.nodes.find(n => n.type === 'TRIGGER');
      if (!triggerNode) {
        throw new Error('Workflow has no TRIGGER node');
      }

      let currentNode = triggerNode;
      let state = { event: eventLog?.payload };

      // Traverse the graph (Simplified linear traversal for now)
      // A robust engine would use BFS/DFS across the edges
      while (currentNode) {
        state = await this.processNode(currentNode, state);

        // Find next node based on edges
        const outgoingEdge = workflow.edges.find(e => e.sourceNodeId === currentNode.id);
        currentNode = outgoingEdge ? workflow.nodes.find(n => n.id === outgoingEdge.targetNodeId) : null;
      }

      // Mark execution as success
      await prisma.aiExecutionLog.update({
        where: { id: execution.id },
        data: {
          status: 'SUCCESS',
          outputData: state,
          completedAt: new Date()
        }
      });
      console.log(`[WorkflowEngine] Workflow ${workflow.id} completed successfully.`);

    } catch (error) {
      console.error(`[WorkflowEngine] Execution failed for workflow ${workflow.id}:`, error);
      await prisma.aiExecutionLog.update({
        where: { id: execution.id },
        data: {
          status: 'FAILED',
          error: error.message,
          completedAt: new Date()
        }
      });
    }
  }

  /**
   * Process a single node in the workflow
   */
  async processNode(node, state) {
    console.log(`[WorkflowEngine] Processing Node: ${node.label} (${node.type})`);
    
    switch (node.type) {
      case 'TRIGGER':
        // Just passes state through
        return state;
      
      case 'CONDITION':
        // Evaluate JS condition or simple matching
        return state;
        
      case 'AI_REASON':
        console.log(`[WorkflowEngine] Executing AI Reason with RAG`);
        // The user's message typically comes from the trigger event
        // E.g., for WhatsApp, it's state.event.body or state.event.data.message
        const userMessage = state.event?.body || state.event?.message || state.event?.data?.message || "Hello";
        
        const systemPrompt = node.config?.systemPrompt || "You are a helpful assistant.";
        
        // Execute the real RAG query
        const aiResult = await generateAIResponse(userMessage, systemPrompt);
        
        // Save the result back to state for the Action node to use
        return { ...state, aiOutput: { response: aiResult } };
        
      case 'ACTION':
        console.log(`[WorkflowEngine] Executing Action: ${node.config?.actionType}`);
        const actionType = node.config?.actionType;
        
        let result = null;
        if (actionType === 'SEND_TWILIO_SMS') {
            const to = state.event?.phone || state.event?.data?.phone;
            const body = state.aiOutput?.response || "Hello from Techwell AI!";
            if (to) {
                result = await twilioProvider.sendTwilioSMS(to, body);
            }
        } else if (actionType === 'SEND_WHATSAPP') {
            const to = state.event?.phone || state.event?.data?.phone;
            const body = state.aiOutput?.response || "Hello from Techwell AI!";
            if (to) {
                result = await whatsappProvider.sendWhatsAppMessage(to, body);
            }
        } else if (actionType === 'VAPI_CALL') {
            const to = state.event?.phone || state.event?.data?.phone;
            const name = state.event?.name || state.event?.data?.name || "Customer";
            if (to) {
                result = await vapiProvider.initiateVapiCall(to, name, state.event);
            }
        } else if (actionType === 'SEND_EMAIL') {
            const to = state.event?.email || state.event?.data?.email;
            const body = state.aiOutput?.response || "Hello from Techwell AI!";
            const subject = state.aiOutput?.subject || "Techwell Admissions";
            if (to) {
                result = await emailProvider.sendEmail(to, subject, body);
            }
        } else if (actionType === 'TWILIO_CALL') {
            const to = state.event?.phone || state.event?.data?.phone;
            // The AI Output could optionally specify a custom TwiML URL to play a specific message
            const twimlUrl = state.aiOutput?.twimlUrl || null; 
            if (to) {
                result = await twilioProvider.makeTwilioCall(to, twimlUrl);
            }
        } else if (actionType === 'PUSH_WEBHOOK') {
            const webhookUrl = node.config?.webhookUrl;
            if (webhookUrl) {
                try {
                    const response = await axios.post(webhookUrl, {
                        eventData: state.event,
                        aiSummary: state.aiOutput?.response || null,
                        timestamp: new Date().toISOString()
                    });
                    result = { status: response.status, data: response.data };
                    console.log(`[WorkflowEngine] Webhook pushed successfully to ${webhookUrl}`);
                } catch (err) {
                    console.error(`[WorkflowEngine] Webhook push failed:`, err.message);
                    result = { error: err.message };
                }
            }
        }
        
        return { ...state, actionResult: result };
        
      default:
        throw new Error(`Unknown node type: ${node.type}`);
    }
  }
}

module.exports = new WorkflowEngine();
