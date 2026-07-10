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
        const where = { AND: [] };

        // Visibility rules
        if (!req.user || !['SUPER_ADMIN', 'ADMIN'].includes(req.user.role)) {
            where.AND.push({
                OR: [
                    { status: 'PUBLISHED' },
                    { status: 'SCHEDULED', scheduledPublishAt: { lte: new Date() } }
                ]
            });
        } else if (status && status !== 'ALL') {
            where.AND.push({ status: status === 'IN_REVIEW' ? 'REVIEW' : status });
        }

        if (search) {
            where.AND.push({
                OR: [
                    { title: { contains: search, mode: 'insensitive' } },
                    { content: { contains: search, mode: 'insensitive' } }
                ]
            });
        }
        
        if (category && category !== 'ALL') {
            where.AND.push({ category });
        }

        if (where.AND.length === 0) delete where.AND;

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
 * @route   GET /api/blogs/categories
 * @desc    Get all unique categories
 * @access  Public
 */
router.get('/categories', async (req, res, next) => {
    try {
        const categories = await prisma.blogPost.findMany({
            where: { category: { not: null, not: '' } },
            select: { category: true },
            distinct: ['category'],
        });
        const dynamicCategories = categories.map(c => c.category).filter(Boolean);
        
        // Ensure default predefined categories are always available
        const defaultCategories = [
            "Business Consulting",
            "IT Consulting",
            "Technology",
            "AI",
            "Software Development",
            "Cyber Security",
            "Cloud",
            "Digital Marketing",
            "Career Guidance"
        ];
        
        const combinedCategories = Array.from(new Set([...defaultCategories, ...dynamicCategories]));
        res.json(combinedCategories);
    } catch (error) {
        next(error);
    }
});

/**
 * @route   GET /api/blogs/analytics/summary
 * @desc    Get overall blog analytics for the admin dashboard
 * @access  Private/Admin
 */
router.get('/analytics/summary', authenticate, async (req, res, next) => {
    try {
        const [totalPosts, publishedPosts, draftPosts, topPosts, totalViews, totalLeads] = await Promise.all([
            prisma.blogPost.count(),
            prisma.blogPost.count({ where: { status: 'PUBLISHED' } }),
            prisma.blogPost.count({ where: { status: 'DRAFT' } }),
            prisma.blogPost.findMany({
                where: { status: 'PUBLISHED' },
                orderBy: { views: 'desc' },
                take: 5,
                select: { id: true, title: true, slug: true, views: true, ctr: true, leadsGenerated: true, category: true, publishedAt: true }
            }),
            prisma.blogPost.aggregate({ _sum: { views: true } }),
            prisma.blogPost.aggregate({ _sum: { leadsGenerated: true } }),
        ]);

        const categoryBreakdown = await prisma.blogPost.groupBy({
            by: ['category'],
            where: { status: 'PUBLISHED', category: { not: null } },
            _count: { _all: true },
            _sum: { views: true },
            orderBy: { _sum: { views: 'desc' } },
        });

        res.json({
            totalPosts,
            publishedPosts,
            draftPosts,
            totalViews: totalViews._sum.views || 0,
            totalLeads: totalLeads._sum.leadsGenerated || 0,
            topPosts,
            categoryBreakdown: categoryBreakdown.map(c => ({
                category: c.category || 'Uncategorized',
                posts: c._count._all,
                views: c._sum.views || 0
            }))
        });
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

        const isPubliclyVisible = 
            blog.status === 'PUBLISHED' || 
            (blog.status === 'SCHEDULED' && blog.scheduledPublishAt && new Date(blog.scheduledPublishAt) <= new Date());

        if (!isPubliclyVisible) {
            if (!req.user || !['SUPER_ADMIN', 'ADMIN'].includes(req.user.role)) {
                return res.status(404).json({ error: 'Post not found' });
            }
        }

        // Auto-increment views for public readers (not admin previews)
        if (isPubliclyVisible && (!req.user || !['SUPER_ADMIN', 'ADMIN'].includes(req.user?.role))) {
            prisma.blogPost.update({
                where: { id: blog.id },
                data: { views: { increment: 1 } }
            }).catch(() => {}); // Fire-and-forget, don't block response
        }

        res.json(blog);
    } catch (error) {
        next(error);
    }
});

/**
 * @route   POST /api/blogs/:id/click
 * @desc    Track a CTR click (e.g. from search results or CTA)
 * @access  Public
 */
router.post('/:id/click', async (req, res, next) => {
    try {
        await prisma.blogPost.update({
            where: { id: req.params.id },
            data: { ctr: { increment: 1 } }
        });
        res.json({ success: true });
    } catch (error) {
        next(error);
    }
});

/**
 * @route   GET /api/blogs/analytics/summary
 * @desc    Get overall blog analytics for the admin dashboard
 * @access  Private/Admin
 */
router.get('/analytics/summary', authenticate, async (req, res, next) => {
    try {
        const [totalPosts, publishedPosts, draftPosts, topPosts, totalViews, totalLeads] = await Promise.all([
            prisma.blogPost.count(),
            prisma.blogPost.count({ where: { status: 'PUBLISHED' } }),
            prisma.blogPost.count({ where: { status: 'DRAFT' } }),
            prisma.blogPost.findMany({
                where: { status: 'PUBLISHED' },
                orderBy: { views: 'desc' },
                take: 5,
                select: { id: true, title: true, slug: true, views: true, ctr: true, leadsGenerated: true, category: true, publishedAt: true }
            }),
            prisma.blogPost.aggregate({ _sum: { views: true } }),
            prisma.blogPost.aggregate({ _sum: { leadsGenerated: true } }),
        ]);

        // Category breakdown
        const categoryBreakdown = await prisma.blogPost.groupBy({
            by: ['category'],
            where: { status: 'PUBLISHED', category: { not: null } },
            _count: { _all: true },
            _sum: { views: true },
            orderBy: { _sum: { views: 'desc' } },
        });

        res.json({
            totalPosts,
            publishedPosts,
            draftPosts,
            totalViews: totalViews._sum.views || 0,
            totalLeads: totalLeads._sum.leadsGenerated || 0,
            topPosts,
            categoryBreakdown: categoryBreakdown.map(c => ({
                category: c.category || 'Uncategorized',
                posts: c._count._all,
                views: c._sum.views || 0
            }))
        });
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
        // Handle excerpt → summary alias from new editor
        if (body.excerpt && !body.summary) body.summary = body.excerpt;
        delete body.excerpt;
        
        // Handle custom slug override
        const customSlug = body.slug ? body.slug.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : null;
        delete body.slug;

        const data = createBlogSchema.parse(body);

        let slug = customSlug || data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
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
        // Handle excerpt → summary alias from new editor
        if (body.excerpt && !body.summary) body.summary = body.excerpt;
        delete body.excerpt;
        // Remove slug from update body — don't allow slug change on update to avoid broken links
        delete body.slug;
        
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
