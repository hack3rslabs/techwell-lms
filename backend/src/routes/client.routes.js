const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate, checkPermission } = require('../middleware/auth');
const cache = require('../services/cache.service');

const router = express.Router();
const prisma = new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL } } });

/**
 * @route   GET /api/clients
 * @desc    Get all active clients
 * @access  Public
 */
router.get('/', cache.middleware('clients', 60000), async (req, res, next) => {
    try {
        const clients = await prisma.client.findMany({
            where: { isActive: true },
            orderBy: { createdAt: 'desc' }
        });
        res.json(clients);
    } catch (error) {
        next(error);
    }
});

/**
 * @route   GET /api/clients/admin/all
 * @desc    Get all clients including inactive for Admin CMS
 * @access  Private (Super Admin / Admin)
 */
router.get('/admin/all', authenticate, checkPermission('CMS'), async (req, res, next) => {
    try {
        const clients = await prisma.client.findMany({
            orderBy: { createdAt: 'desc' }
        });
        res.json(clients);
    } catch (error) {
        next(error);
    }
});

/**
 * @route   POST /api/clients
 * @desc    Create a new client
 * @access  Private (Super Admin / Admin)
 */
router.post('/', authenticate, checkPermission('CMS'), async (req, res, next) => {
    try {
        const { name, description, url, isActive } = req.body;

        if (!name) {
            return res.status(400).json({ error: 'Name is required' });
        }

        const client = await prisma.client.create({
            data: {
                name,
                description,
                url,
                isActive: isActive !== undefined ? isActive : true
            }
        });

        // Invalidate cache
        cache.invalidate('clients:');

        res.status(201).json(client);
    } catch (error) {
        next(error);
    }
});

/**
 * @route   PUT /api/clients/:id
 * @desc    Update a client
 * @access  Private (Super Admin / Admin)
 */
router.put('/:id', authenticate, checkPermission('CMS'), async (req, res, next) => {
    try {
        const { name, description, url, isActive } = req.body;

        const client = await prisma.client.update({
            where: { id: req.params.id },
            data: {
                name,
                description,
                url,
                isActive
            }
        });

        // Invalidate cache
        cache.invalidate('clients:');

        res.json(client);
    } catch (error) {
        next(error);
    }
});

/**
 * @route   DELETE /api/clients/:id
 * @desc    Delete a client
 * @access  Private (Super Admin / Admin)
 */
router.delete('/:id', authenticate, checkPermission('CMS'), async (req, res, next) => {
    try {
        await prisma.client.delete({
            where: { id: req.params.id }
        });

        // Invalidate cache
        cache.invalidate('clients:');

        res.json({ message: 'Client deleted successfully' });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
