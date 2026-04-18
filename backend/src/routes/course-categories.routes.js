const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { authenticate, authorize, checkPermission, optionalAuth } = require('../middleware/auth');

const prisma = new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL } } });

// ── PUBLIC: Get all active categories ──────────────────────────────────────
router.get('/', async (req, res, next) => {
    try {
        const categories = await prisma.courseCategory.findMany({
            where: { isActive: true },
            orderBy: { orderIndex: 'asc' },
            select: {
                id: true,
                name: true,
                slug: true,
                description: true,
                icon: true,
                color: true,
                orderIndex: true,
                _count: { select: { courses: true } }
            }
        });
        res.json({ categories });
    } catch (error) {
        next(error);
    }
});

// ── ADMIN: Get ALL categories (including inactive) ──────────────────────────
router.get('/admin', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), async (req, res, next) => {
    try {
        const categories = await prisma.courseCategory.findMany({
            orderBy: { orderIndex: 'asc' },
            include: {
                _count: { select: { courses: true } }
            }
        });
        res.json({ categories });
    } catch (error) {
        next(error);
    }
});

// ── ADMIN: Create category ───────────────────────────────────────────────────
router.post('/', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), async (req, res, next) => {
    try {
        const { name, slug, description, icon, color, isActive, orderIndex } = req.body;

        const nameStr = typeof name === 'string' ? name : '';
        const slugStr = typeof slug === 'string' ? slug : '';
        const descStr = typeof description === 'string' ? description : '';
        const iconStr = typeof icon === 'string' ? icon : '';
        const colorStr = typeof color === 'string' ? color : '#6366f1';

        if (!nameStr || nameStr.trim().length < 2) {
            return res.status(400).json({ error: 'Category name must be at least 2 characters' });
        }
        if (!slugStr || slugStr.trim().length < 2) {
            return res.status(400).json({ error: 'Slug is required' });
        }

        const category = await prisma.courseCategory.create({
            data: {
                name: nameStr.trim(),
                slug: slugStr.trim().toLowerCase().replace(/\s+/g, '-'),
                description: descStr.trim() || null,
                icon: iconStr.trim() || null,
                color: colorStr || '#6366f1',
                isActive: isActive !== undefined ? Boolean(isActive) : true,
                orderIndex: orderIndex !== undefined ? Number(orderIndex) : 0,
            }
        });

        res.status(201).json({ category, message: 'Category created successfully' });
    } catch (error) {
        if (error.code === 'P2002') {
            return res.status(409).json({ error: 'A category with this name or slug already exists' });
        }
        next(error);
    }
});

// ── ADMIN: Update category ───────────────────────────────────────────────────
router.put('/:id', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, slug, description, icon, color, isActive, orderIndex } = req.body;

        const existing = await prisma.courseCategory.findUnique({ where: { id } });
        if (!existing) {
            return res.status(404).json({ error: 'Category not found' });
        }

        const category = await prisma.courseCategory.update({
            where: { id },
            data: {
                ...(name !== undefined && typeof name === 'string' && { name: name.trim() }),
                ...(slug !== undefined && typeof slug === 'string' && { slug: slug.trim().toLowerCase().replace(/\s+/g, '-') }),
                ...(description !== undefined && { description: typeof description === 'string' ? description.trim() || null : null }),
                ...(icon !== undefined && { icon: typeof icon === 'string' ? icon.trim() || null : null }),
                ...(color !== undefined && typeof color === 'string' && { color }),
                ...(isActive !== undefined && { isActive: Boolean(isActive) }),
                ...(orderIndex !== undefined && { orderIndex: Number(orderIndex) }),
            }
        });

        res.json({ category, message: 'Category updated successfully' });
    } catch (error) {
        if (error.code === 'P2002') {
            return res.status(409).json({ error: 'A category with this name or slug already exists' });
        }
        next(error);
    }
});

// ── ADMIN: Delete category ───────────────────────────────────────────────────
router.delete('/:id', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), async (req, res, next) => {
    try {
        const { id } = req.params;

        const existing = await prisma.courseCategory.findUnique({
            where: { id },
            include: { _count: { select: { courses: true } } }
        });

        if (!existing) {
            return res.status(404).json({ error: 'Category not found' });
        }

        if (existing._count.courses > 0) {
            return res.status(409).json({
                error: `Cannot delete category with ${existing._count.courses} course(s). Reassign courses first.`
            });
        }

        await prisma.courseCategory.delete({ where: { id } });
        res.json({ message: 'Category deleted successfully' });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
