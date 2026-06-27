const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate, checkPermission } = require('../middleware/auth');
const cache = require('../services/cache.service');

const router = express.Router();
const prisma = new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL } } });

/**
 * @route   GET /api/products
 * @desc    Get all active products
 * @access  Public
 */
router.get('/', cache.middleware('products', 60000), async (req, res, next) => {
    try {
        const products = await prisma.product.findMany({
            where: { isActive: true },
            orderBy: { createdAt: 'desc' }
        });
        res.json(products);
    } catch (error) {
        next(error);
    }
});

/**
 * @route   GET /api/products/admin/all
 * @desc    Get all products including inactive for Admin CMS
 * @access  Private (Super Admin / Admin)
 */
router.get('/admin/all', authenticate, checkPermission('CMS'), async (req, res, next) => {
    try {
        const products = await prisma.product.findMany({
            orderBy: { createdAt: 'desc' }
        });
        res.json(products);
    } catch (error) {
        next(error);
    }
});

/**
 * @route   GET /api/products/:slug
 * @desc    Get a single product by slug
 * @access  Public
 */
router.get('/:slug', cache.middleware('product', 60000), async (req, res, next) => {
    try {
        const product = await prisma.product.findUnique({
            where: { slug: req.params.slug }
        });
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.json(product);
    } catch (error) {
        next(error);
    }
});

/**
 * @route   POST /api/products
 * @desc    Create a new product
 * @access  Private (Super Admin / Admin)
 */
router.post('/', authenticate, checkPermission('CMS'), async (req, res, next) => {
    try {
        const { name, slug, description, category, price, features, screenshots, brochureUrl, demoUrl, isActive } = req.body;

        if (!name || !slug || !description || !category) {
            return res.status(400).json({ error: 'Required fields are missing' });
        }

        const product = await prisma.product.create({
            data: {
                name,
                slug,
                description,
                category,
                price: price ? parseFloat(price) : null,
                features: features || [],
                screenshots: screenshots || [],
                brochureUrl,
                demoUrl,
                isActive: isActive !== undefined ? isActive : true
            }
        });

        // Invalidate product cache
        cache.invalidate('products:');

        res.status(201).json(product);
    } catch (error) {
        next(error);
    }
});

/**
 * @route   PUT /api/products/:id
 * @desc    Update a product
 * @access  Private (Super Admin / Admin)
 */
router.put('/:id', authenticate, checkPermission('CMS'), async (req, res, next) => {
    try {
        const { name, slug, description, category, price, features, screenshots, brochureUrl, demoUrl, isActive } = req.body;

        const product = await prisma.product.update({
            where: { id: req.params.id },
            data: {
                name,
                slug,
                description,
                category,
                price: price ? parseFloat(price) : null,
                features,
                screenshots,
                brochureUrl,
                demoUrl,
                isActive
            }
        });

        // Invalidate product cache
        cache.invalidate('products:');
        cache.invalidate('product:');

        res.json(product);
    } catch (error) {
        next(error);
    }
});

/**
 * @route   DELETE /api/products/:id
 * @desc    Delete a product
 * @access  Private (Super Admin / Admin)
 */
router.delete('/:id', authenticate, checkPermission('CMS'), async (req, res, next) => {
    try {
        await prisma.product.delete({
            where: { id: req.params.id }
        });

        // Invalidate product cache
        cache.invalidate('products:');
        cache.invalidate('product:');

        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
