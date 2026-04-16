const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate, authorize, checkPermission, optionalAuth } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL } } });

/**
 * @route   GET /api/search
 * @desc    Global Search (Courses, Instructors) - Expandable to Blogs
 * @access  Public
 */
router.get('/', optionalAuth, async (req, res, next) => {
    try {
        const { q } = req.query;
        if (!q || q.length < 2) {
            return res.json({ courses: [], instructors: [] });
        }

        const [courses, instructors] = await Promise.all([
            prisma.course.findMany({
                where: {
                    isPublished: true,
                    OR: [
                        { title: { contains: q, mode: 'insensitive' } },
                        { description: { contains: q, mode: 'insensitive' } },
                        { category: { contains: q, mode: 'insensitive' } }
                    ]
                },
                take: 5,
                select: {
                    id: true,
                    title: true,
                    category: true,
                    thumbnail: true
                }
            }),
            prisma.user.findMany({
                where: {
                    role: { in: ['INSTRUCTOR', 'ADMIN'] },
                    OR: [
                        { name: { contains: q, mode: 'insensitive' } },
                        { bio: { contains: q, mode: 'insensitive' } }
                    ]
                },
                take: 3,
                select: {
                    id: true,
                    name: true,
                    avatar: true,
                    role: true
                }
            })
        ]);

        res.json({ courses, instructors });

    } catch (error) {
        next(error);
    }
});

module.exports = router;
