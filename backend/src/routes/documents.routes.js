const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate, checkPermission } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const router = express.Router();
const rateLimit = require('express-rate-limit');
const uploadLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10, message: { error: 'Too many uploads' } });

const prisma = new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL } } });

// Configure Multer for local uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../../uploads/admin-documents');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, 'doc-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 25 * 1024 * 1024 }, // 25MB limit
    fileFilter: (req, file, cb) => {
        const fileTypes = /pdf/;
        const mimeType = fileTypes.test(file.mimetype);
        const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
        if (mimeType && extname) {
            return cb(null, true);
        }
        cb(new Error('Only PDF files are allowed'));
    }
});

/**
 * @route   GET /api/documents
 * @desc    Get all secure documents
 * @access  Private (Admin)
 */
router.get('/', authenticate, checkPermission('ADMIN'), async (req, res, next) => {
    try {
        const documents = await prisma.adminDocument.findMany({
            orderBy: { createdAt: 'desc' }
        });
        res.json(documents);
    } catch (error) {
        next(error);
    }
});

/**
 * @route   POST /api/documents
 * @desc    Upload a new secure document
 * @access  Private (Admin)
 */
router.post('/', authenticate, checkPermission('ADMIN'), uploadLimiter, upload.single('file'), async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'PDF file is required' });
        }

        const { name, description, category } = req.body;
        const filePath = `/uploads/admin-documents/${req.file.filename}`;

        const document = await prisma.adminDocument.create({
            data: {
                name: name || req.file.originalname,
                description: description || null,
                category: category || 'GENERAL',
                filePath,
                fileSize: req.file.size,
                uploadedBy: req.user.id
            }
        });

        res.status(201).json(document);
    } catch (error) {
        next(error);
    }
});

/**
 * @route   DELETE /api/documents/:id
 * @desc    Delete a secure document
 * @access  Private (Admin)
 */
router.delete('/:id', authenticate, checkPermission('ADMIN'), async (req, res, next) => {
    try {
        const { id } = req.params;
        
        const document = await prisma.adminDocument.findUnique({ where: { id } });
        if (!document) {
            return res.status(404).json({ error: 'Document not found' });
        }

        if (document.filePath) {
            const oldPath = path.join(__dirname, '../../', document.filePath);
            if (fs.existsSync(oldPath)) {
                fs.unlinkSync(oldPath);
            }
        }

        await prisma.adminDocument.delete({ where: { id } });
        res.json({ message: 'Document deleted successfully' });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
