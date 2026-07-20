const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { authenticate, checkPermission } = require('../middleware/auth');

/**
 * @route   PUT /api/crm/leads/bulk/assign
 * @desc    Bulk assign leads
 * @access  Private/Admin
 */
router.put('/assign', authenticate, checkPermission('LEADS'), async (req, res, next) => {
    try {
        const { leadIds, assignedToId } = req.body;
        if (!Array.isArray(leadIds) || !leadIds.length || !assignedToId) {
            return res.status(400).json({ error: 'leadIds and assignedToId are required' });
        }

        const result = await prisma.lead.updateMany({
            where: { id: { in: leadIds } },
            data: { assignedToId }
        });

        res.json({ success: true, count: result.count });
    } catch (error) {
        next(error);
    }
});

/**
 * @route   PUT /api/crm/leads/bulk/status
 * @desc    Bulk update lead statuses
 * @access  Private/Admin
 */
router.put('/status', authenticate, checkPermission('LEADS'), async (req, res, next) => {
    try {
        const { leadIds, status } = req.body;
        if (!Array.isArray(leadIds) || !leadIds.length || !status) {
            return res.status(400).json({ error: 'leadIds and status are required' });
        }

        const result = await prisma.lead.updateMany({
            where: { id: { in: leadIds } },
            data: { status }
        });

        res.json({ success: true, count: result.count });
    } catch (error) {
        next(error);
    }
});

/**
 * @route   DELETE /api/crm/leads/bulk
 * @desc    Bulk delete leads
 * @access  Private/Admin
 */
router.delete('/', authenticate, checkPermission('LEADS'), async (req, res, next) => {
    try {
        const { leadIds } = req.body;
        if (!Array.isArray(leadIds) || !leadIds.length) {
            return res.status(400).json({ error: 'leadIds are required' });
        }

        const result = await prisma.lead.deleteMany({
            where: { id: { in: leadIds } }
        });

        res.json({ success: true, count: result.count });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
