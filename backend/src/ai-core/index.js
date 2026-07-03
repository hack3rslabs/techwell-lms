const eventBus = require('./event-bus/EventBus');
const workflowEngine = require('./workflow-engine/WorkflowEngine');
const agentFleet = require('./agents/AgentFleet');

/**
 * The Techwell AI Platform (Core Layer)
 * 
 * This module orchestrates all AI-driven automation, event routing,
 * and agent interactions across the platform.
 */
const AICore = {
  EventBus: eventBus,
  WorkflowEngine: workflowEngine,
  AgentFleet: agentFleet,

  /**
   * Main integration point for platform events
   */
  async trackEvent(eventType, source, payload) {
    return this.EventBus.publish(eventType, source, payload);
  }
};

module.exports = AICore;
