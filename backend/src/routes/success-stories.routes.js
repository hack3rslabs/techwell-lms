const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const router = express.Router();
const prisma = new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL } } });

// Configure Multer for local uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../../uploads/success-stories');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, 'story-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const fileTypes = /jpeg|jpg|png|gif|webp/;
        const mimeType = fileTypes.test(file.mimetype);
        const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
        if (mimeType && extname) {
            return cb(null, true);
        }
        cb(new Error('Only images are allowed'));
    }
});

/**
 * @route   GET /api/success-stories
 * @desc    Get all active success stories
 * @access  Public
 */
router.get('/', async (req, res, next) => {
    try {
        const stories = await prisma.successStory.findMany({
            where: { isActive: true },
            orderBy: [{ order: 'asc' }, { createdAt: 'desc' }]
        });
        res.json(stories);
    } catch (error) {
        next(error);
    }
});

/**
 * @route   GET /api/success-stories/admin
 * @desc    Get all success stories (including inactive)
 * @access  Private (Admin)
 */
router.get('/admin', authenticate, async (req, res, next) => {
    try {
        const stories = await prisma.successStory.findMany({
            orderBy: [{ order: 'asc' }, { createdAt: 'desc' }]
        });
        res.json(stories);
    } catch (error) {
        next(error);
    }
});

/**
 * @route   POST /api/success-stories
 * @desc    Create a new success story
 * @access  Private (Admin)
 */
router.post('/', authenticate, upload.single('image'), async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'Image file is required' });
        }

        const { url, altText, isActive, order } = req.body;
        const imagePath = `/uploads/success-stories/${req.file.filename}`;

        const story = await prisma.successStory.create({
            data: {
                imagePath,
                url: url || null,
                altText: altText || 'Success Story',
                isActive: isActive === 'true' || isActive === true,
                order: order ? parseInt(order) : 0
            }
        });

        res.status(201).json(story);
    } catch (error) {
        next(error);
    }
});

/**
 * @route   PUT /api/success-stories/:id
 * @desc    Update a success story
 * @access  Private (Admin)
 */
router.put('/:id', authenticate, upload.single('image'), async (req, res, next) => {
    try {
        const { id } = req.params;
        const { url, altText, isActive, order } = req.body;

        const updateData = {
            url: url || null,
            altText: altText || 'Success Story',
        };

        if (isActive !== undefined) updateData.isActive = isActive === 'true' || isActive === true;
        if (order !== undefined) updateData.order = parseInt(order);

        if (req.file) {
            updateData.imagePath = `/uploads/success-stories/${req.file.filename}`;
            
            // Delete old file
            const oldStory = await prisma.successStory.findUnique({ where: { id } });
            if (oldStory && oldStory.imagePath) {
                const oldPath = path.join(__dirname, '../../', oldStory.imagePath);
                if (fs.existsSync(oldPath)) {
                    fs.unlinkSync(oldPath);
                }
            }
        }

        const story = await prisma.successStory.update({
            where: { id },
            data: updateData
        });

        res.json(story);
    } catch (error) {
        next(error);
    }
});

/**
 * @route   DELETE /api/success-stories/:id
 * @desc    Delete a success story
 * @access  Private (Admin)
 */
router.delete('/:id', authenticate, async (req, res, next) => {
    try {
        const { id } = req.params;
        
        const story = await prisma.successStory.findUnique({ where: { id } });
        if (!story) {
            return res.status(404).json({ error: 'Story not found' });
        }

        if (story.imagePath) {
            const oldPath = path.join(__dirname, '../../', story.imagePath);
            if (fs.existsSync(oldPath)) {
                fs.unlinkSync(oldPath);
            }
        }

        await prisma.successStory.delete({ where: { id } });
        res.json({ message: 'Story deleted successfully' });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
