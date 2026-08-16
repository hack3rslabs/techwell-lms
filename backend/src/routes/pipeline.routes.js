const express = require('express');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const router = express.Router();

// GET /api/crm/pipelines
router.get('/', async (req, res) => {
  try {
    const pipelines = await prisma.pipeline.findMany({
      include: {
        stages: {
          orderBy: { orderIndex: 'asc' }
        }
      }
    });
    res.json({ success: true, data: pipelines });
  } catch (error) {
    console.error('Error fetching pipelines:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/crm/pipelines/:id/board
router.get('/:id/board', async (req, res) => {
  try {
    const { id } = req.params;

    const pipeline = await prisma.pipeline.findUnique({
      where: { id },
      include: {
        stages: {
          orderBy: { orderIndex: 'asc' },
          include: {
            deals: {
              include: {
                customer: true
              }
            }
          }
        }
      }
    });

    if (!pipeline) {
      return res.status(404).json({ success: false, message: 'Pipeline not found' });
    }

    res.json({ success: true, data: pipeline });
  } catch (error) {
    console.error('Error fetching pipeline board:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/crm/pipelines/deals/move
router.post('/deals/move', async (req, res) => {
  try {
    const { dealId, targetStageId } = req.body;
    
    const updatedDeal = await prisma.pipelineDeal.update({
      where: { id: dealId },
      data: { stageId: targetStageId }
    });

    res.json({ success: true, data: updatedDeal });
  } catch (error) {
    console.error('Error moving deal:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/crm/pipelines/:id/deals
router.post('/:id/deals', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, value, customerId, stageId } = req.body;

    // Use provided stageId, or find the first stage in this pipeline
    let targetStageId = stageId;
    if (!targetStageId) {
      const firstStage = await prisma.pipelineStage.findFirst({
        where: { pipelineId: id },
        orderBy: { orderIndex: 'asc' }
      });
      if (!firstStage) {
        return res.status(400).json({ success: false, message: 'Pipeline has no stages' });
      }
      targetStageId = firstStage.id;
    }

    const newDeal = await prisma.pipelineDeal.create({
      data: {
        title,
        value: Number(value) || 0,
        customerId,
        pipelineId: id,
        stageId: targetStageId,
        probability: 50,
      }
    });

    res.json({ success: true, data: newDeal });
  } catch (error) {
    console.error('Error creating deal:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
