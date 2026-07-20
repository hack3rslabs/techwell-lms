const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate, authorize, checkPermission, optionalAuth } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL } } });

/**
 * @route   GET /api/knowledge-base
 * @desc    Get all knowledge base entries
 * @access  Private/Admin
 */
router.get('/', authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'INSTRUCTOR'), async (req, res, next) => {
    try {
        let { domain, search, difficulty } = req.query;
    if (domain !== undefined) domain = Array.isArray(domain) ? domain[0] : String(domain);
    if (search !== undefined) search = Array.isArray(search) ? search[0] : String(search);
    if (difficulty !== undefined) difficulty = Array.isArray(difficulty) ? difficulty[0] : String(difficulty);


        const where = {};
        if (domain && domain !== 'all') where.domain = domain;
        if (difficulty && difficulty !== 'all') where.difficulty = difficulty;
        if (search) {
            where.OR = [
                { domain: { contains: search, mode: 'insensitive' } },
                { topic: { contains: search, mode: 'insensitive' } },
                { content: { contains: search, mode: 'insensitive' } }
            ];
        }

        const entries = await prisma.knowledgeBase.findMany({
            where,
            orderBy: { createdAt: 'desc' }
        });

        res.json({ entries });
    } catch (error) {
        next(error);
    }
});

/**
 * @route   POST /api/knowledge-base
 * @desc    Create new knowledge base entry
 * @access  Private/Admin
 */
router.post('/', authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'INSTRUCTOR'), async (req, res, next) => {
    try {
        const { domain, topic, content, answer, difficulty, status, type, codeSnippet, tags } = req.body;

        const entry = await prisma.knowledgeBase.create({
            data: {
                domain,
                answer,
                difficulty,
                type: type || 'TECHNICAL',
                codeSnippet,
                tags: typeof tags === 'string' ? String(tags || '').split(',').map(t => String(t || '').trim()).filter(Boolean) : tags,
                status: status || 'PUBLISHED'
            }
        });

        res.status(201).json({ message: 'Entry created', entry });
    } catch (error) {
        next(error);
    }
});

/**
 * @route   PUT /api/knowledge-base/:id
 * @desc    Update knowledge base entry
 * @access  Private/Admin
 */
router.put('/:id', authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'INSTRUCTOR'), async (req, res, next) => {
    try {
        const { domain, topic, content, answer, difficulty, status, type, codeSnippet, tags } = req.body;

        const entry = await prisma.knowledgeBase.update({
            where: { id: req.params.id },
            data: {
                domain,
                topic,
                content,
                difficulty,
                type,
                codeSnippet,
                tags: typeof tags === 'string' ? String(tags || '').split(',').map(t => String(t || '').trim()).filter(Boolean) : tags,
                status
            }
        });

        res.json({ message: 'Entry updated', entry });
    } catch (error) {
        next(error);
    }
});
/**
 * @route   DELETE /api/knowledge-base/:id
 * @desc    Delete knowledge base entry
 * @access  Private/Admin
 */
router.delete('/:id', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), async (req, res, next) => {
    try {
        await prisma.knowledgeBase.delete({
            where: { id: req.params.id }
        });

        res.json({ message: 'Entry deleted' });
    } catch (error) {
        next(error);
    }
});

/**
 * @route   GET /api/knowledge-base/stats
 * @desc    Get knowledge base statistics
 * @access  Private/Admin
 */
router.get('/stats', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), async (req, res, next) => {
    try {
        const [total, byDifficulty, byDomain] = await Promise.all([
            prisma.knowledgeBase.count(),
            prisma.knowledgeBase.groupBy({
                by: ['difficulty'],
                _count: { id: true }
            }),
            prisma.knowledgeBase.groupBy({
                by: ['domain'],
                _count: { id: true }
            })
        ]);

        res.json({
            total,
            byDifficulty: byDifficulty.reduce((acc, item) => {
                acc[item.difficulty] = item._count.id;
                return acc;
            }, {}),
            byDomain: byDomain.reduce((acc, item) => {
                acc[item.domain] = item._count.id;
                return acc;
            }, {})
        });
    } catch (error) {
        next(error);
    }
});

/**
 * @route   POST /api/knowledge-base/bulk-delete
 * @desc    Bulk delete knowledge base entries
 * @access  Private/Admin
 */
router.post('/bulk-delete', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), async (req, res, next) => {
    try {
        const { ids } = req.body;
        if (!ids || !Array.isArray(ids) || Array.isArray(ids) ? ids.length : 0 === 0) {
            return res.status(400).json({ error: 'No IDs provided' });
        }

        await prisma.knowledgeBase.deleteMany({
            where: { id: { in: ids } }
        });

        res.json({ message: `${Array.isArray(ids) ? ids.length : 0} entries deleted successfully` });
    } catch (error) {
        next(error);
    }
});

/**
 * @route   POST /api/knowledge-base/bulk-update
 * @desc    Bulk update knowledge base entries (e.g., change domain or difficulty)
 * @access  Private/Admin
 */
router.post('/bulk-update', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), async (req, res, next) => {
    try {
        const { ids, updates } = req.body; // updates: { domain: 'IT', difficulty: 'ADVANCED' }
        if (!ids || !Array.isArray(ids) || Array.isArray(ids) ? ids.length : 0 === 0) {
            return res.status(400).json({ error: 'No IDs provided' });
        }

        await prisma.knowledgeBase.updateMany({
            where: { id: { in: ids } },
            data: updates
        });

        res.json({ message: `${Array.isArray(ids) ? ids.length : 0} entries updated successfully` });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
