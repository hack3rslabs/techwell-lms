const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { authenticate, authorize } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

const prisma = new PrismaClient();

// Configure multer for PDF uploads
const storage = multer.diskStorage({
    destination: async (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../../uploads/library');
        await fs.mkdir(uploadDir, { recursive: true });
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Only PDF files are allowed'));
        }
    }
});

// ============= CATEGORY ROUTES =============

// Get all categories
router.get('/categories', async (req, res) => {
    try {
        const categories = await prisma.libraryCategory.findMany({
            include: {
                domains: {
                    include: {
                        _count: {
                            select: { resources: true }
                        }
                    }
                }
            },
            orderBy: { order: 'asc' }
        });
        res.json(categories);
    } catch (error) {
        console.error('[Library] Error fetching categories:', error);
        res.status(500).json({ error: 'Failed to fetch categories' });
    }
});

// Create category
// Create category
router.post('/categories', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), async (req, res) => {
    try {
        const { name, description, icon, order } = req.body;

        const category = await prisma.libraryCategory.create({
            data: { name, description, icon, order: order || 0 }
        });

        res.json(category);
    } catch (error) {
        console.error('[Library] Error creating category:', error);
        res.status(500).json({ error: 'Failed to create category' });
    }
});

// Update category
// Update category
router.put('/categories/:id', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, icon, order } = req.body;

        const category = await prisma.libraryCategory.update({
            where: { id },
            data: { name, description, icon, order }
        });

        res.json(category);
    } catch (error) {
        console.error('[Library] Error updating category:', error);
        res.status(500).json({ error: 'Failed to update category' });
    }
});

// Delete category
// Delete category
router.delete('/categories/:id', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.libraryCategory.delete({ where: { id } });
        res.json({ success: true });
    } catch (error) {
        console.error('[Library] Error deleting category:', error);
        res.status(500).json({ error: 'Failed to delete category' });
    }
});

// ============= DOMAIN ROUTES =============

// Get domains (optionally filtered by category)
router.get('/domains', async (req, res) => {
    try {
        const { categoryId } = req.query;

        const domains = await prisma.libraryDomain.findMany({
            where: categoryId ? { categoryId } : undefined,
            include: {
                category: true,
                _count: {
                    select: { resources: true }
                }
            }
        });

        res.json(domains);
    } catch (error) {
        console.error('[Library] Error fetching domains:', error);
        res.status(500).json({ error: 'Failed to fetch domains' });
    }
});

// Create domain
// Create domain
router.post('/domains', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), async (req, res) => {
    try {
        const { name, description, categoryId } = req.body;

        const domain = await prisma.libraryDomain.create({
            data: { name, description, categoryId },
            include: { category: true }
        });

        res.json(domain);
    } catch (error) {
        console.error('[Library] Error creating domain:', error);
        res.status(500).json({ error: 'Failed to create domain' });
    }
});

// Update domain
// Update domain
router.put('/domains/:id', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description } = req.body;

        const domain = await prisma.libraryDomain.update({
            where: { id },
            data: { name, description }
        });

        res.json(domain);
    } catch (error) {
        console.error('[Library] Error updating domain:', error);
        res.status(500).json({ error: 'Failed to update domain' });
    }
});

// Delete domain
// Delete domain
router.delete('/domains/:id', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.libraryDomain.delete({ where: { id } });
        res.json({ success: true });
    } catch (error) {
        console.error('[Library] Error deleting domain:', error);
        res.status(500).json({ error: 'Failed to delete domain' });
    }
});

// ============= RESOURCE ROUTES =============

// Get resources (with filters)
router.get('/resources', async (req, res) => {
    try {
        const { domainId, type, search } = req.query;

        const where = {};
        if (domainId) where.domainId = domainId;
        if (type) where.type = type;
        if (search) {
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } }
            ];
        }

        const resources = await prisma.libraryResource.findMany({
            where,
            include: {
                domain: {
                    include: { category: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        res.json(resources);
    } catch (error) {
        console.error('[Library] Error fetching resources:', error);
        res.status(500).json({ error: 'Failed to fetch resources' });
    }
});

// Get single resource
router.get('/resources/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const resource = await prisma.libraryResource.update({
            where: { id },
            data: { views: { increment: 1 } },
            include: {
                domain: {
                    include: { category: true }
                }
            }
        });

        res.json(resource);
    } catch (error) {
        console.error('[Library] Error fetching resource:', error);
        res.status(500).json({ error: 'Failed to fetch resource' });
    }
});

// Create resource (PDF upload)
// Create resource (PDF upload)
router.post('/resources/pdf', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), upload.single('file'), async (req, res) => {
    try {
        const { title, description, domainId, createdBy } = req.body;

        if (!req.file) {
            return res.status(400).json({ error: 'PDF file is required' });
        }

        const resource = await prisma.libraryResource.create({
            data: {
                title,
                description,
                type: 'PDF',
                fileUrl: `/uploads/library/${req.file.filename}`,
                fileName: req.file.originalname,
                fileSize: req.file.size,
                domainId,
                createdBy
            },
            include: {
                domain: {
                    include: { category: true }
                }
            }
        });

        res.json(resource);
    } catch (error) {
        console.error('[Library] Error creating PDF resource:', error);
        res.status(500).json({ error: 'Failed to create PDF resource' });
    }
});

// Create resource (Q&A content) - WITH AI INTEGRATION
// Create resource (Q&A content) - WITH AI INTEGRATION
router.post('/resources/qa', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), async (req, res) => {
    try {
        const { title, description, domainId, createdBy, content, syncToAI } = req.body;

        const resource = await prisma.libraryResource.create({
            data: {
                title,
                description,
                type: 'QA',
                content,
                domainId,
                createdBy
            },
            include: {
                domain: {
                    include: { category: true }
                }
            }
        });

        // If syncToAI is true, add Q&A pairs to AI training data
        if (syncToAI && content && content.questions) {
            for (const qa of content.questions) {
                try {
                    await prisma.aIInterviewQA.create({
                        data: {
                            question: qa.q,
                            answer: qa.a,
                            domain: resource.domain.name,
                            difficulty: 'MEDIUM', // Default
                            source: `Library: ${title}`
                        }
                    });
                } catch (error) {
                    console.error('[Library] Error syncing Q&A to AI:', error);
                    // Continue even if sync fails
                }
            }
        }

        res.json(resource);
    } catch (error) {
        console.error('[Library] Error creating Q&A resource:', error);
        res.status(500).json({ error: 'Failed to create Q&A resource' });
    }
});

// Update resource
// Update resource
router.put('/resources/:id', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, content } = req.body;

        const resource = await prisma.libraryResource.update({
            where: { id },
            data: { title, description, content }
        });

        res.json(resource);
    } catch (error) {
        console.error('[Library] Error updating resource:', error);
        res.status(500).json({ error: 'Failed to update resource' });
    }
});

// Delete resource
// Delete resource
router.delete('/resources/:id', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), async (req, res) => {
    try {
        const { id } = req.params;

        const resource = await prisma.libraryResource.findUnique({ where: { id } });

        // Delete file if it's a PDF
        if (resource && resource.type === 'PDF' && resource.fileUrl) {
            const filePath = path.join(__dirname, '../..', resource.fileUrl);
            try {
                await fs.unlink(filePath);
            } catch (error) {
                console.error('[Library] Error deleting file:', error);
            }
        }

        await prisma.libraryResource.delete({ where: { id } });
        res.json({ success: true });
    } catch (error) {
        console.error('[Library] Error deleting resource:', error);
        res.status(500).json({ error: 'Failed to delete resource' });
    }
});

// Download PDF
router.get('/download/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const resource = await prisma.libraryResource.findUnique({ where: { id } });

        if (!resource || resource.type !== 'PDF') {
            return res.status(404).json({ error: 'PDF not found' });
        }

        // Increment download count
        await prisma.libraryResource.update({
            where: { id },
            data: { downloads: { increment: 1 } }
        });

        const filePath = path.join(__dirname, '../..', resource.fileUrl);
        res.download(filePath, resource.fileName);
    } catch (error) {
        console.error('[Library] Error downloading file:', error);
        res.status(500).json({ error: 'Failed to download file' });
    }
});

// Search resources
router.get('/search', async (req, res) => {
    try {
        const { q } = req.query;

        if (!q) {
            return res.status(400).json({ error: 'Search query is required' });
        }

        const resources = await prisma.libraryResource.findMany({
            where: {
                OR: [
                    { title: { contains: q, mode: 'insensitive' } },
                    { description: { contains: q, mode: 'insensitive' } }
                ]
            },
            include: {
                domain: {
                    include: { category: true }
                }
            },
            take: 20
        });

        res.json(resources);
    } catch (error) {
        console.error('[Library] Error searching resources:', error);
        res.status(500).json({ error: 'Failed to search resources' });
    }
});

// ============= BOOKMARK ROUTES =============

// Toggle bookmark
// Toggle bookmark
router.post('/bookmarks/toggle', authenticate, async (req, res) => {
    try {
        const { userId, _resourceId } = req.body;
        const resourceId = req.body.resourceId || _resourceId;

        if (!userId || !resourceId) {
            return res.status(400).json({ error: 'User ID and Resource ID are required' });
        }

        const existing = await prisma.libraryBookmark.findUnique({
            where: {
                userId_resourceId: {
                    userId,
                    resourceId
                }
            }
        });

        if (existing) {
            await prisma.libraryBookmark.delete({
                where: {
                    userId_resourceId: {
                        userId,
                        resourceId
                    }
                }
            });
            res.json({ bookmarked: false });
        } else {
            await prisma.libraryBookmark.create({
                data: {
                    userId,
                    resourceId
                }
            });
            res.json({ bookmarked: true });
        }
    } catch (error) {
        console.error('[Library] Error toggling bookmark:', error);
        res.status(500).json({ error: 'Failed to toggle bookmark' });
    }
});

// Get user bookmarks
// Get user bookmarks
router.get('/bookmarks/:userId', authenticate, async (req, res) => {
    try {
        const { userId } = req.params;

        const bookmarks = await prisma.libraryBookmark.findMany({
            where: { userId },
            include: {
                resource: {
                    include: {
                        domain: {
                            include: { category: true }
                        }
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        res.json(bookmarks);
    } catch (error) {
        console.error('[Library] Error fetching bookmarks:', error);
        res.status(500).json({ error: 'Failed to fetch bookmarks' });
    }
});

module.exports = router;
