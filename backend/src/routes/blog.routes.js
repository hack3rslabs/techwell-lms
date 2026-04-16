const express = require('express');
const { z } = require('zod');
const { PrismaClient } = require('@prisma/client');
const { authenticate, authorize, optionalAuth } = require('../middleware/auth');
const router = express.Router();
const prisma = new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL } } });

// Schema
const createBlogSchema = z.object({
    title: z.string().min(5),
    content: z.string().min(20),
    summary: z.string().optional(),
    tags: z.array(z.string()).optional(),
    category: z.string().optional(),
    status: z.enum(['DRAFT', 'IN_REVIEW', 'PUBLISHED', 'ARCHIVED']).default('DRAFT'),
    coverImage: z.string().url().optional().or(z.literal('')),
});

/**
 * @route   GET /api/blogs
 * @desc    Get blogs (Public: Published only, Admin: All)
 * @access  Public / Private
 */
router.get('/', optionalAuth, async (req, res, next) => {
    try {
        const { status, search, page = 1, limit = 10 } = req.query;
        const where = {};

        // If not admin, force PUBLISHED
        if (!req.user || !['SUPER_ADMIN', 'ADMIN'].includes(req.user.role)) {
            where.status = 'PUBLISHED';
        } else if (status) {
            where.status = status;
        }

        if (search) {
            where.OR = [
                { title: { contains: search } }, // Prisma explicit mode needed if SQL? Default is robust
                { content: { contains: search } }
            ];
        }

        const blogs = await prisma.blogPost.findMany({
            where,
            include: {
                author: { select: { name: true, avatar: true } }
            },
            orderBy: { createdAt: 'desc' },
            skip: (Number(page) - 1) * Number(limit),
            take: Number(limit)
        });

        const total = await prisma.blogPost.count({ where });

        res.json({ blogs, total, pages: Math.ceil(total / Number(limit)) });
    } catch (error) {
        next(error);
    }
});

/**
 * @route   GET /api/blogs/:slugOrId
 * @desc    Get single blog
 * @access  Public
 */
router.get('/:slugOrId', optionalAuth, async (req, res, next) => {
    try {
        const { slugOrId } = req.params;
        const where = {
            OR: [
                { id: slugOrId },
                { slug: slugOrId }
            ]
        };

        const blog = await prisma.blogPost.findFirst({
            where,
            include: { author: { select: { name: true, avatar: true } } }
        });

        if (!blog) return res.status(404).json({ error: 'Post not found' });

        // Visibility Check
        if (blog.status !== 'PUBLISHED') {
            if (!req.user || !['SUPER_ADMIN', 'ADMIN'].includes(req.user.role)) {
                return res.status(404).json({ error: 'Post not found' }); // Hide non-published
            }
        }

        res.json(blog);
    } catch (error) {
        next(error);
    }
});

/**
 * @route   POST /api/blogs
 * @desc    Create blog post
 * @access  Private/Admin
 */
router.post('/', authenticate, checkPermission('MANAGE_BLOGS'), async (req, res, next) => {
    try {
        const body = { ...req.body };
        if (body.coverImage === '') body.coverImage = undefined;

        const data = createBlogSchema.parse(body);

        // Generate Slug
        let slug = data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        // Ensure unique
        const existing = await prisma.blogPost.count({ where: { slug } });
        if (existing > 0) slug = `${slug}-${Date.now()}`;

        const blog = await prisma.blogPost.create({
            data: {
                ...data,
                slug,
                authorId: req.user.id,
                publishedAt: data.status === 'PUBLISHED' ? new Date() : null
            }
        });

        res.status(201).json(blog);
    } catch (error) {
        next(error);
    }
});

/**
 * @route   PUT /api/blogs/:id
 * @desc    Update blog post
 * @access  Private/Admin
 */
router.put('/:id', authenticate, checkPermission('MANAGE_BLOGS'), async (req, res, next) => {
    try {
        const { id } = req.params;
        const body = { ...req.body };
        if (body.coverImage === '') body.coverImage = undefined;

        // Partial validation or full? Assuming full update usually but let's allow partial manually
        // Only update fields present

        const updateData = { ...body };
        if (updateData.status === 'PUBLISHED') updateData.publishedAt = new Date();

        // If title changed, update slug? Usually bad for SEO. Let's keep slug stable unless explicitly requested.

        const blog = await prisma.blogPost.update({
            where: { id },
            data: updateData
        });

        res.json(blog);
    } catch (error) {
        next(error);
    }
});

/**
 * @route   DELETE /api/blogs/:id
 * @desc    Delete blog post
 * @access  Private/Admin
 */
router.delete('/:id', authenticate, checkPermission('MANAGE_BLOGS'), async (req, res, next) => {
    try {
        await prisma.blogPost.delete({ where: { id: req.params.id } });
        res.json({ message: 'Blog post deleted' });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
