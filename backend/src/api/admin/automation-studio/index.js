const express = require('express');
const { PrismaClient } = require('@prisma/client');
const router = express.Router();

const prisma = new PrismaClient();

const webhooksRouter = require('./webhooks');
const knowledgeRouter = require('./knowledge');
const integrationsRouter = require('./integrations');

router.use('/webhooks', webhooksRouter);
router.use('/knowledge', knowledgeRouter);
router.use('/integrations', integrationsRouter);

// ---------------------------------------------------------
// WORKFLOWS
// ---------------------------------------------------------

// Create or update a workflow graph
router.post('/workflows', async (req, res) => {
  try {
    const { id, name, description, triggerType, triggerData, nodes, edges } = req.body;
    
    // Simplistic UPSERT strategy for demo
    const workflow = await prisma.aiWorkflow.upsert({
      where: { id: id || '' },
      update: {
        name, description, triggerType, triggerData,
        // In a real app, you'd carefully update nodes/edges or delete+recreate them
      },
      create: {
        name, description, triggerType, triggerData,
        nodes: { create: nodes },
        edges: { create: edges }
      },
      include: { nodes: true, edges: true }
    });

    res.json({ success: true, data: workflow });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// List all workflows
router.get('/workflows', async (req, res) => {
  try {
    const workflows = await prisma.aiWorkflow.findMany({
      include: {
        nodes: true,
        edges: true
      }
    });
    res.json({ success: true, data: workflows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ---------------------------------------------------------
// AGENT PERSONAS
// ---------------------------------------------------------

router.post('/agents', async (req, res) => {
  try {
    const { name, description, systemPrompt, model, provider, temperature } = req.body;
    
    const agent = await prisma.aiAgentPersona.create({
      data: { name, description, systemPrompt, model, provider, temperature }
    });

    res.json({ success: true, data: agent });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/agents', async (req, res) => {
  try {
    const agents = await prisma.aiAgentPersona.findMany();
    res.json({ success: true, data: agents });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ---------------------------------------------------------
// EXECUTION LOGS (Observability)
// ---------------------------------------------------------

router.get('/logs', async (req, res) => {
  try {
    const logs = await prisma.aiExecutionLog.findMany({
      orderBy: { startedAt: 'desc' },
      take: 50,
      include: {
        workflow: { select: { name: true } }
      }
    });
    res.json({ success: true, data: logs });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
