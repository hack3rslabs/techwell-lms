const express = require('express');
const { z } = require('zod');
const { PrismaClient } = require('@prisma/client');
const { authenticate, checkPermission, optionalAuth } = require('../middleware/auth');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const router = express.Router();
const prisma = new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL } } });
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || ''); // Requires env variable

// Validation Schemas
const createBlogSchema = z.object({
    title: z.string().min(5),
    content: z.string().min(20),
    summary: z.string().optional().or(z.literal('')),
    tags: z.any().optional(),
    category: z.string().optional().or(z.literal('')),
    status: z.enum(['DRAFT', 'IN_REVIEW', 'REVIEW', 'SEO_OPTIMIZATION', 'SCHEDULED', 'PUBLISHED', 'ARCHIVED']).default('DRAFT'),
    coverImage: z.string().url().optional().or(z.literal('')),
    metaTitle: z.string().optional().or(z.literal('')),
    metaDescription: z.string().optional().or(z.literal('')),
    canonicalUrl: z.string().url().optional().or(z.literal('')),
    keywords: z.any().optional(),
    readingTime: z.number().optional(),
    ctaSettings: z.any().optional(),
    scheduledPublishAt: z.string().datetime().optional().nullable().or(z.literal('')),
    autoArchiveAt: z.string().datetime().optional().nullable().or(z.literal('')),
});

/**
 * @route   GET /api/blogs
 * @desc    Get blogs
 * @access  Public / Private
 */
router.get('/', optionalAuth, async (req, res, next) => {
    try {
        const { status, search, category, page = 1, limit = 10 } = req.query;
        const where = {};

        // Visibility rules
        if (!req.user || !['SUPER_ADMIN', 'ADMIN'].includes(req.user.role)) {
            where.status = 'PUBLISHED';
        } else if (status) {
            where.status = status;
        }

        if (search) {
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { content: { contains: search, mode: 'insensitive' } }
            ];
        }
        
        if (category) {
            where.category = category;
        }

        const blogs = await prisma.blogPost.findMany({
            where,
            include: {
                author: { select: { name: true, avatar: true } },
                _count: { select: { comments: { where: { status: 'APPROVED' } } } }
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
        const blog = await prisma.blogPost.findFirst({
            where: { OR: [{ id: slugOrId }, { slug: slugOrId }] },
            include: { 
                author: { select: { name: true, avatar: true } },
                comments: { 
                    where: { status: 'APPROVED' }, 
                    orderBy: { createdAt: 'desc' },
                    include: { user: { select: { name: true, avatar: true } } }
                }
            }
        });

        if (!blog) return res.status(404).json({ error: 'Post not found' });

        if (blog.status !== 'PUBLISHED') {
            if (!req.user || !['SUPER_ADMIN', 'ADMIN'].includes(req.user.role)) {
                return res.status(404).json({ error: 'Post not found' });
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
router.post('/', authenticate, checkPermission('BLOGS'), async (req, res, next) => {
    try {
        const body = { ...req.body };
        if (body.coverImage === '') body.coverImage = undefined;
        if (body.canonicalUrl === '') body.canonicalUrl = undefined;
        if (body.scheduledPublishAt === '') body.scheduledPublishAt = null;
        if (body.autoArchiveAt === '') body.autoArchiveAt = null;
        
        const data = createBlogSchema.parse(body);

        let slug = data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
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
router.put('/:id', authenticate, checkPermission('BLOGS'), async (req, res, next) => {
    try {
        const { id } = req.params;
        const body = { ...req.body };
        if (body.coverImage === '') body.coverImage = undefined;
        if (body.canonicalUrl === '') body.canonicalUrl = undefined;
        if (body.scheduledPublishAt === '') body.scheduledPublishAt = null;
        if (body.autoArchiveAt === '') body.autoArchiveAt = null;
        
        const updateData = { ...body };
        if (updateData.status === 'PUBLISHED') updateData.publishedAt = new Date();

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
router.delete('/:id', authenticate, checkPermission('BLOGS'), async (req, res, next) => {
    try {
        await prisma.blogPost.delete({ where: { id: req.params.id } });
        res.json({ message: 'Blog post deleted' });
    } catch (error) {
        next(error);
    }
});

// ==========================================
// ENTERPRISE CMS ENDPOINTS
// ==========================================

/**
 * @route   POST /api/blogs/:id/versions
 * @desc    Auto-save blog version
 * @access  Private/Admin
 */
router.post('/:id/versions', authenticate, checkPermission('BLOGS'), async (req, res, next) => {
    try {
        const { id } = req.params;
        const { content, summary } = req.body;
        
        const version = await prisma.blogVersion.create({
            data: {
                blogPostId: id,
                content,
                summary
            }
        });
        // Optionally clean up old versions (keep last 10)
        res.status(201).json(version);
    } catch (error) {
        next(error);
    }
});

/**
 * @route   POST /api/blogs/:id/view
 * @desc    Increment view count
 * @access  Public
 */
router.post('/:id/view', async (req, res, next) => {
    try {
        const { id } = req.params;
        await prisma.blogPost.update({
            where: { id },
            data: { views: { increment: 1 } }
        });
        res.status(200).send();
    } catch (error) {
        next(error);
    }
});

/**
 * @route   POST /api/blogs/:id/click-cta
 * @desc    Increment CTA click / Lead count
 * @access  Public
 */
router.post('/:id/click-cta', async (req, res, next) => {
    try {
        const { id } = req.params;
        await prisma.blogPost.update({
            where: { id },
            data: { leadsGenerated: { increment: 1 } }
        });
        res.status(200).send();
    } catch (error) {
        next(error);
    }
});

/**
 * @route   POST /api/blogs/:id/comments
 * @desc    Add a comment
 * @access  Public / Private
 */
router.post('/:id/comments', optionalAuth, async (req, res, next) => {
    try {
        const { id } = req.params;
        const { content, guestName, guestEmail } = req.body;
        
        const data = {
            blogPostId: id,
            content,
            status: 'PENDING' // Requires moderation
        };

        if (req.user) {
            data.userId = req.user.id;
        } else {
            data.guestName = guestName;
            data.guestEmail = guestEmail;
        }

        const comment = await prisma.blogComment.create({ data });
        res.status(201).json({ message: 'Comment submitted for moderation.', comment });
    } catch (error) {
        next(error);
    }
});

/**
 * @route   POST /api/blogs/ai-assist
 * @desc    Generate AI Content / SEO
 * @access  Private/Admin
 */
router.post('/ai-assist', authenticate, checkPermission('BLOGS'), async (req, res, next) => {
    try {
        const { prompt, action } = req.body; 
        // actions: 'GENERATE_TITLE', 'GENERATE_OUTLINE', 'GENERATE_ARTICLE', 'SEO_METADATA'
        
        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({ error: 'AI capabilities are not configured (Missing GEMINI_API_KEY).' });
        }

        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        
        let systemPrompt = "You are an expert Techwell tech blog copywriter and SEO specialist.";
        if (action === 'SEO_METADATA') {
            systemPrompt += " Generate a JSON object with `metaTitle` (max 60 chars), `metaDescription` (max 155 chars), and `keywords` (array of strings) based on the provided content.";
        }
        
        const result = await model.generateContent([systemPrompt, prompt]);
        const responseText = result.response.text();
        
        res.json({ result: responseText });
    } catch (error) {
        console.error('AI Assistant Error:', error);
        res.status(500).json({ error: 'Failed to generate AI content.' });
    }
});

module.exports = router;
