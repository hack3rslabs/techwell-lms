const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const router = express.Router();
const prisma = new PrismaClient();

// Configure storage for profile pictures
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = 'uploads/avatars';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        // Create unique filename: user-id-timestamp.ext
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'avatar-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// File filter to accept only images
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('Only images (JPEG, PNG, GIF) are allowed!'));
    }
};

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: fileFilter
});

/**
 * @route   POST /api/users/profile-image
 * @desc    Upload profile picture
 * @access  Private
 */
router.post('/profile-image', authenticate, upload.single('avatar'), async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No image file uploaded' });
        }

        const avatarUrl = `/uploads/avatars/${req.file.filename}`;

        // Update user profile with new avatar URL
        const user = await prisma.user.update({
            where: { id: req.user.id },
            data: { avatar: avatarUrl },
            select: { id: true, name: true, email: true, avatar: true }
        });

        res.json({
            message: 'Profile picture updated successfully',
            avatar: avatarUrl,
            user
        });
    } catch (error) {
        // Cleanup file if DB update fails
        if (req.file) {
            fs.unlinkSync(req.file.path);
        }
        next(error);
    }
});

/**
 * @route   GET /api/users/me
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/me', authenticate, async (req, res, next) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                avatar: true,
                phone: true,
                createdAt: true,
                hasUnlimitedInterviews: true,
                interviewLimit: true
            }
        });
        res.json(user);
    } catch (error) {
        next(error);
    }
});

/**
 * @route   PUT /api/users/profile
 * @desc    Update user profile details
 * @access  Private
 */
router.put('/profile', authenticate, async (req, res, next) => {
    try {
        const { name, phone } = req.body;

        const user = await prisma.user.update({
            where: { id: req.user.id },
            data: { name, phone },
            select: { id: true, name: true, email: true, phone: true, avatar: true }
        });

        res.json(user);
    } catch (error) {
        next(error);
    }
});

/**
 * @route   PATCH /api/users/:id/approve
 * @desc    Approve/Reject Employer (Admin)
 * @access  Private (Admin)
 */
router.patch('/:id/approve', authenticate, async (req, res, next) => {
    try {
        if (req.user.role !== 'SUPER_ADMIN' && req.user.role !== 'ADMIN') {
            return res.status(403).json({ error: 'Access denied' });
        }

        const { status, notes } = req.body; // APPROVED, REJECTED
        const { id } = req.params;

        const employerProfile = await prisma.employerProfile.update({
            where: { userId: id },
            data: {
                status,
                verificationNotes: notes,
                documentsVerified: status === 'APPROVED'
            }
        });

        // Update User role if approved to ensure they have access?
        // Actually, role is already 'EMPLOYER', status controls visibility.

        res.json(employerProfile);
    } catch (error) {
        next(error);
    }
});

/**
 * @route   GET /api/users/:id/activity
 * @desc    Get user audit logs (360 View)
 * @access  Private (Admin)
 */
router.get('/:id/activity', authenticate, async (req, res, next) => {
    try {
        if (req.user.role !== 'SUPER_ADMIN' && req.user.role !== 'ADMIN') {
            return res.status(403).json({ error: 'Access denied' });
        }

        const activity = await prisma.auditLog.findMany({
            where: { performedBy: req.params.id },
            orderBy: { timestamp: 'desc' },
            take: 50
        });

        res.json(activity);
    } catch (error) {
        next(error);
    }
});

module.exports = router;
