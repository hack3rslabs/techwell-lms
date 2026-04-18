const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate, authorize, checkPermission, optionalAuth } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL } } });

/**
 * @route   GET /api/avatars
 * @desc    Get all avatars
 * @access  Private/Admin
 */
router.get('/', authenticate, async (req, res, next) => {
    try {
        const avatars = await prisma.avatar.findMany({
            orderBy: { createdAt: 'desc' }
        });
        res.json({ avatars });
    } catch (error) {
        next(error);
    }
});

/**
 * @route   POST /api/avatars
 * @desc    Create new avatar
 * @access  Private/Admin
 */
router.post('/', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), async (req, res, next) => {
    try {
        const { name, role, personality, avatarUrl, voiceId, gender, provider } = req.body;

        const avatar = await prisma.avatar.create({
            data: {
                name,
                role,
                personality,
                avatarUrl,
                voiceId,
                gender: gender || 'MALE',
                provider: provider || 'ELEVEN_LABS'
            }
        });

        res.status(201).json({ message: 'Avatar created', avatar });
    } catch (error) {
        next(error);
    }
});

/**
 * @route   PUT /api/avatars/:id
 * @desc    Update avatar
 * @access  Private/Admin
 */
router.put('/:id', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), async (req, res, next) => {
    try {
        const { name, role, personality, avatarUrl, voiceId, isActive, gender, provider } = req.body;

        const avatar = await prisma.avatar.update({
            where: { id: req.params.id },
            data: {
                name,
                role,
                personality,
                avatarUrl,
                voiceId,
                isActive,
                gender,
                provider
            }
        });

        res.json({ message: 'Avatar updated', avatar });
    } catch (error) {
        next(error);
    }
});

/**
 * @route   DELETE /api/avatars/:id
 * @desc    Delete avatar
 * @access  Private/Admin
 */
router.delete('/:id', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), async (req, res, next) => {
    try {
        await prisma.avatar.delete({
            where: { id: req.params.id }
        });

        res.json({ message: 'Avatar deleted' });
    } catch (error) {
        next(error);
    }
});

/**
 * @route   PATCH /api/avatars/:id/toggle
 * @desc    Toggle avatar active status
 * @access  Private/Admin
 */
router.patch('/:id/toggle', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), async (req, res, next) => {
    try {
        const avatar = await prisma.avatar.findUnique({
            where: { id: req.params.id }
        });

        if (!avatar) {
            return res.status(404).json({ error: 'Avatar not found' });
        }

        const updated = await prisma.avatar.update({
            where: { id: req.params.id },
            data: { isActive: !avatar.isActive }
        });

        res.json({ message: 'Avatar status toggled', avatar: updated });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
