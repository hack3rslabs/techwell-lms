const express = require('express');
const { z } = require('zod');
const { PrismaClient } = require('@prisma/client');
const { authenticate, checkPermission, optionalAuth } = require('../middleware/auth');
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

        // If not admin/super_admin, force PUBLISHED
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
 * @route   POST /api/blogs/generate
 * @desc    Generate blog post content using AI
 * @access  Private
 */
router.post('/generate', authenticate, async (req, res, next) => {
    try {
        const { topic, keywords } = req.body;
        if (!topic) return res.status(400).json({ error: "Topic is required" });

        const { GoogleGenerativeAI } = require('@google/generative-ai');
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `Write an attractive, corporate-standard, and SEO-friendly blog post about: "${topic}".
Keywords to incorporate: ${keywords ? keywords.join(", ") : "none"}.
Please return the output as a JSON object with EXACTLY the following structure (no markdown wrappers, no \`\`\`json):
{
  "title": "A catchy, SEO-friendly headline",
  "summary": "A short, engaging meta summary of the blog post (under 160 characters)",
  "content": "Full detailed HTML/markdown content of the blog post, structured with subheadings, paragraphs, and lists."
}`;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        let cleanJson = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();
        const generated = JSON.parse(cleanJson);

        res.json(generated);
    } catch (error) {
        console.error("AI Blog Generation Error:", error);
        res.status(500).json({ error: "Failed to generate blog content" });
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

        const data = createBlogSchema.parse(body);

        // Generate Slug
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

/**
 * @route   POST /api/blogs/:id/like
 * @desc    Increment like count
 * @access  Public
 */
router.post('/:id/like', async (req, res, next) => {
    try {
        const { id } = req.params;
        const blog = await prisma.blogPost.update({
            where: { id },
            data: { likesCount: { increment: 1 } }
        });
        res.json({ likesCount: blog.likesCount });
    } catch (error) {
        next(error);
    }
});

/**
 * @route   POST /api/blogs/:id/share
 * @desc    Increment share count
 * @access  Public
 */
router.post('/:id/share', async (req, res, next) => {
    try {
        const { id } = req.params;
        const blog = await prisma.blogPost.update({
            where: { id },
            data: { sharesCount: { increment: 1 } }
        });
        res.json({ sharesCount: blog.sharesCount });
    } catch (error) {
        next(error);
    }
});

/**
 * @route   POST /api/blogs/:id/rate
 * @desc    Submit blog rating
 * @access  Public
 */
router.post('/:id/rate', async (req, res, next) => {
    try {
        const { id } = req.params;
        const { rating } = req.body;
        const val = Number(rating);
        if (Number.isNaN(val) || val < 1 || val > 5) {
            return res.status(400).json({ error: "Invalid rating" });
        }

        const blog = await prisma.blogPost.findUnique({ where: { id } });
        if (!blog) return res.status(404).json({ error: "Blog not found" });

        const newCount = blog.ratingCount + 1;
        const newAvg = ((blog.ratingAvg * blog.ratingCount) + val) / newCount;

        const updatedBlog = await prisma.blogPost.update({
            where: { id },
            data: {
                ratingAvg: newAvg,
                ratingCount: newCount
            }
        });

        res.json({ ratingAvg: updatedBlog.ratingAvg, ratingCount: updatedBlog.ratingCount });
    } catch (error) {
        next(error);
    }
});

/**
 * @route   POST /api/blogs/:id/comments
 * @desc    Add a comment to a blog post
 * @access  Private
 */
router.post('/:id/comments', authenticate, async (req, res, next) => {
    try {
        const { id } = req.params;
        const { content } = req.body;
        if (!content) return res.status(400).json({ error: "Content is required" });

        const comment = await prisma.blogComment.create({
            data: {
                blogPostId: id,
                userId: req.user.id,
                content
            },
            include: {
                user: { select: { name: true, avatar: true } }
            }
        });
        res.status(201).json(comment);
    } catch (error) {
        next(error);
    }
});

/**
 * @route   GET /api/blogs/:id/comments
 * @desc    Get comments for a blog post
 * @access  Public
 */
router.get('/:id/comments', async (req, res, next) => {
    try {
        const { id } = req.params;
        const comments = await prisma.blogComment.findMany({
            where: { blogPostId: id },
            include: {
                user: { select: { name: true, avatar: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(comments);
    } catch (error) {
        next(error);
    }
});

module.exports = router;
