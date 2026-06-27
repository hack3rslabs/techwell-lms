const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate } = require('../middleware/auth');
const router = express.Router();
const prisma = new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL } } });

/**
 * @route   GET /api/sales/templates
 * @desc    Get all active follow-up templates
 * @access  Private (Staff/Admin)
 */
router.get('/', authenticate, async (req, res, next) => {
    try {
        const templates = await prisma.followUpTemplate.findMany({
            where: { isActive: true },
            orderBy: { category: 'asc' }
        });
        res.json(templates);
    } catch (error) {
        next(error);
    }
});

/**
 * @route   POST /api/sales/templates
 * @desc    Create a new template
 * @access  Private (Admin)
 */
router.post('/', authenticate, async (req, res, next) => {
    try {
        if (req.user.role !== 'SUPER_ADMIN' && req.user.role !== 'ADMIN') {
            return res.status(403).json({ error: 'Permission denied' });
        }
        const template = await prisma.followUpTemplate.create({
            data: req.body
        });
        res.json(template);
    } catch (error) {
        next(error);
    }
});

module.exports = router;
