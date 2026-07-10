const express = require('express');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { authenticate, checkPermission } = require('../middleware/auth');

const router = express.Router();

// GET /api/crm/tasks
router.get('/', authenticate, checkPermission('CENTRAL_CRM'), async (req, res) => {
  try {
    const { assignedToId } = req.query;
    let where = {};
    if (assignedToId) {
      where.assignedTo = assignedToId;
    }
    const tasks = await prisma.followUpTask.findMany({
      where,
      orderBy: { dueDate: 'asc' },
      include: {
        lead: { select: { id: true, name: true } },
        customer: { select: { id: true, name: true } }
      }
    });
    res.json({ success: true, data: tasks });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/crm/tasks
router.post('/', authenticate, checkPermission('CENTRAL_CRM', 'write'), async (req, res) => {
  try {
    const { leadId, customerId, title, description, dueDate, assignedToId } = req.body;
    const task = await prisma.followUpTask.create({
      data: {
        leadId: leadId || null,
        customerId: customerId || null,
        title,
        description,
        dueDate: new Date(dueDate),
        assignedTo: assignedToId || req.user.id
      }
    });
    res.json({ success: true, data: task });
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
