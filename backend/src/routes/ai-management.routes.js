const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate, authorize } = require('../middleware/auth');
const router = express.Router();
const prisma = new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL } } });

/**
 * @route   GET /api/admin/ai-management/providers
 * @desc    Get all AI providers
 * @access  Private (Admin)
 */
router.get('/providers', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), async (req, res, next) => {
    try {
        const providers = await prisma.aIProvider.findMany({
            orderBy: { createdAt: 'desc' }
        });
        res.json(providers);
    } catch (error) {
        next(error);
    }
});

/**
 * @route   POST /api/admin/ai-management/providers
 * @desc    Add or Update an AI provider
 * @access  Private (Admin)
 */
router.post('/providers', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), async (req, res, next) => {
    try {
        const { provider, name, apiKey, model, isDefault, isActive } = req.body;

        if (!provider || !apiKey || !model) {
            return res.status(400).json({ error: 'Provider, API Key, and Model are required' });
        }

        // If setting this to default, unset others
        if (isDefault) {
            await prisma.aIProvider.updateMany({
                where: { isDefault: true },
                data: { isDefault: false }
            });
        }

        const existingProvider = await prisma.aIProvider.findFirst({
            where: { provider }
        });

        let savedProvider;
        if (existingProvider) {
            savedProvider = await prisma.aIProvider.update({
                where: { id: existingProvider.id },
                data: { name, apiKey, model, isDefault, isActive }
            });
        } else {
            savedProvider = await prisma.aIProvider.create({
                data: { name, provider, apiKey, model, isDefault, isActive }
            });
        }

        res.json({ message: 'AI Provider configured successfully', provider: savedProvider });
    } catch (error) {
        next(error);
    }
});

/**
 * @route   PATCH /api/admin/ai-management/providers/:id/toggle
 * @desc    Toggle AI provider default status
 * @access  Private (Admin)
 */
router.patch('/providers/:id/toggle', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), async (req, res, next) => {
    try {
        const { id } = req.params;
        
        await prisma.aIProvider.updateMany({
            where: { isDefault: true },
            data: { isDefault: false }
        });

        const provider = await prisma.aIProvider.update({
            where: { id },
            data: { isDefault: true, isActive: true }
        });

        res.json({ message: 'Active provider updated', provider });
    } catch (error) {
        next(error);
    }
});

/**
 * @route   DELETE /api/admin/ai-management/providers/:id
 * @desc    Delete an AI provider
 * @access  Private (Admin)
 */
router.delete('/providers/:id', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), async (req, res, next) => {
    try {
        await prisma.aIProvider.delete({
            where: { id: req.params.id }
        });
        res.json({ message: 'Provider deleted successfully' });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
