const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate, checkPermission } = require('../middleware/auth');
const cache = require('../services/cache.service');

const router = express.Router();
const prisma = new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL } } });

/**
 * @route   GET /api/services
 * @desc    Get all active services
 * @access  Public
 */
router.get('/', cache.middleware('services', 60000), async (req, res, next) => {
    try {
        const services = await prisma.service.findMany({
            where: { isActive: true },
            orderBy: { createdAt: 'desc' }
        });
        res.json(services);
    } catch (error) {
        next(error);
    }
});

/**
 * @route   GET /api/services/admin/all
 * @desc    Get all services including inactive for Admin CMS
 * @access  Private (Super Admin / Admin)
 */
router.get('/admin/all', authenticate, checkPermission('CMS'), async (req, res, next) => {
    try {
        const services = await prisma.service.findMany({
            orderBy: { createdAt: 'desc' }
        });
        res.json(services);
    } catch (error) {
        next(error);
    }
});

/**
 * @route   GET /api/services/:slug
 * @desc    Get a single service by slug
 * @access  Public
 */
router.get('/:slug', cache.middleware('service', 60000), async (req, res, next) => {
    try {
        const service = await prisma.service.findUnique({
            where: { slug: req.params.slug }
        });
        if (!service) {
            return res.status(404).json({ error: 'Service not found' });
        }
        res.json(service);
    } catch (error) {
        next(error);
    }
});

/**
 * @route   POST /api/services
 * @desc    Create a new service
 * @access  Private (Super Admin / Admin)
 */
router.post('/', authenticate, checkPermission('CMS'), async (req, res, next) => {
    try {
        const { name, slug, description, category, features, isActive } = req.body;

        if (!name || !slug || !description || !category) {
            return res.status(400).json({ error: 'Required fields are missing' });
        }

        const service = await prisma.service.create({
            data: {
                name,
                slug,
                description,
                category,
                features: features || [],
                isActive: isActive !== undefined ? isActive : true
            }
        });

        // Invalidate services cache
        cache.invalidate('services:');

        res.status(201).json(service);
    } catch (error) {
        next(error);
    }
});

/**
 * @route   PUT /api/services/:id
 * @desc    Update a service
 * @access  Private (Super Admin / Admin)
 */
router.put('/:id', authenticate, checkPermission('CMS'), async (req, res, next) => {
    try {
        const { name, slug, description, category, features, isActive } = req.body;

        const service = await prisma.service.update({
            where: { id: req.params.id },
            data: {
                name,
                slug,
                description,
                category,
                features,
                isActive
            }
        });

        // Invalidate services cache
        cache.invalidate('services:');
        cache.invalidate('service:');

        res.json(service);
    } catch (error) {
        next(error);
    }
});

/**
 * @route   DELETE /api/services/:id
 * @desc    Delete a service
 * @access  Private (Super Admin / Admin)
 */
router.delete('/:id', authenticate, checkPermission('CMS'), async (req, res, next) => {
    try {
        await prisma.service.delete({
            where: { id: req.params.id }
        });

        // Invalidate services cache
        cache.invalidate('services:');
        cache.invalidate('service:');

        res.json({ message: 'Service deleted successfully' });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
