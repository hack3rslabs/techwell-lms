const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate } = require('../middleware/auth');
const router = express.Router();
const prisma = new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL } } });

/**
 * @route   GET /api/forum/categories
 * @desc    Get all forum categories with post counts
 * @access  Public
 */
router.get('/categories', async (req, res, next) => {
    try {
        const categories = await prisma.forumCategory.findMany({
            include: {
                _count: {
                    select: { posts: true }
                }
            },
            orderBy: { name: 'asc' }
        });
        res.json(categories);
    } catch (error) {
        next(error);
    }
});

/**
 * @route   GET /api/forum/posts
 * @desc    Get paginated posts, optionally filtered by category
 * @access  Public
 */
router.get('/posts', async (req, res, next) => {
    try {
        const { page = 1, limit = 20, category, search } = req.query;
        
        let where = {};
        if (category) {
            where.category = { slug: category };
        }
        if (search) {
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { content: { contains: search, mode: 'insensitive' } }
            ];
        }

        const posts = await prisma.forumPost.findMany({
            where,
            include: {
                author: {
                    select: { id: true, name: true, avatar: true }
                },
                category: true,
                _count: {
                    select: { comments: true }
                }
            },
            skip: (Number(page) - 1) * Number(limit),
            take: Number(limit),
            orderBy: [
                { isPinned: 'desc' },
                { createdAt: 'desc' }
            ]
        });

        const total = await prisma.forumPost.count({ where });

        res.json({
            posts,
            total,
            totalPages: Math.ceil(total / Number(limit)),
            currentPage: Number(page)
        });
    } catch (error) {
        next(error);
    }
});

/**
 * @route   GET /api/forum/posts/:slug
 * @desc    Get a single post by slug, with comments
 * @access  Public
 */
router.get('/posts/:slug', async (req, res, next) => {
    try {
        const { slug } = req.params;
        const post = await prisma.forumPost.update({
            where: { slug },
            data: {
                views: { increment: 1 }
            },
            include: {
                author: {
                    select: { id: true, name: true, avatar: true }
                },
                category: true,
                comments: {
                    include: {
                        author: {
                            select: { id: true, name: true, avatar: true }
                        }
                    },
                    orderBy: { createdAt: 'asc' }
                }
            }
        });

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        res.json(post);
    } catch (error) {
        next(error);
    }
});

/**
 * @route   POST /api/forum/posts
 * @desc    Create a new post
 * @access  Private
 */
router.post('/posts', authenticate, async (req, res, next) => {
    try {
        const { title, content, categoryId } = req.body;
        
        if (!title || !content || !categoryId) {
            return res.status(400).json({ message: 'Title, content, and category are required' });
        }

        // Generate slug from title
        let slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
        // Append random string to ensure uniqueness
        slug = `${slug}-${Math.random().toString(36).substring(2, 8)}`;

        const post = await prisma.forumPost.create({
            data: {
                title,
                content,
                slug,
                categoryId,
                authorId: req.user.id
            },
            include: {
                author: {
                    select: { id: true, name: true, avatar: true }
                },
                category: true
            }
        });

        res.status(201).json(post);
    } catch (error) {
        next(error);
    }
});

/**
 * @route   POST /api/forum/posts/:id/comments
 * @desc    Add a comment to a post
 * @access  Private
 */
router.post('/posts/:id/comments', authenticate, async (req, res, next) => {
    try {
        const { id } = req.params;
        const { content } = req.body;

        if (!content) {
            return res.status(400).json({ message: 'Comment content is required' });
        }

        const post = await prisma.forumPost.findUnique({ where: { id } });
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        const comment = await prisma.forumComment.create({
            data: {
                content,
                postId: id,
                authorId: req.user.id
            },
            include: {
                author: {
                    select: { id: true, name: true, avatar: true }
                }
            }
        });

        res.status(201).json(comment);
    } catch (error) {
        next(error);
    }
});

/**
 * @route   POST /api/forum/posts/:id/like
 * @desc    Like a post
 * @access  Private
 */
router.post('/posts/:id/like', authenticate, async (req, res, next) => {
    try {
        const { id } = req.params;
        // In a real app we'd track who liked what to prevent duplicate likes and allow unliking.
        // For simplicity and since we don't have a ForumLike model, we just increment.
        const post = await prisma.forumPost.update({
            where: { id },
            data: {
                likes: { increment: 1 }
            }
        });
        res.json({ message: 'Post liked', likes: post.likes });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
