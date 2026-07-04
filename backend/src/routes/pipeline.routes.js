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

module.exports = router;
