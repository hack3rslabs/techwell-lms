const express = require('express');
const { z } = require('zod');
const { PrismaClient } = require('@prisma/client');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL } } });

const createBatchSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    batchCode: z.string().min(2, "Batch Code must be at least 2 characters"),
    courseId: z.string().min(1, "Course is required"),
    instructorId: z.string().min(1, "Instructor is required"),
    startDate: z.string().optional().nullable(),
    endDate: z.string().optional().nullable(),
    description: z.string().optional().nullable(),
    maxStudents: z.number().int().optional().nullable(),
    studentIds: z.array(z.string()).optional()
});

const updateBatchSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters").optional(),
    batchCode: z.string().min(2, "Batch Code must be at least 2 characters").optional(),
    courseId: z.string().optional(),
    instructorId: z.string().optional(),
    startDate: z.string().optional().nullable(),
    endDate: z.string().optional().nullable(),
    description: z.string().optional().nullable(),
    maxStudents: z.number().int().optional().nullable(),
    studentIds: z.array(z.string()).optional()
});

/**
 * @route   GET /api/batches
 * @desc    Get all batches
 * @access  Private/Admin
 */
router.get('/', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), async (req, res, next) => {
    try {
        const { page = 1, limit = 20, search } = req.query;
        const where = {};
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { batchCode: { contains: search, mode: 'insensitive' } }
            ];
        }

        const [batches, total] = await Promise.all([
            prisma.batch.findMany({
                where,
                include: {
                    course: { select: { id: true, title: true } },
                    instructor: { select: { id: true, name: true, email: true } },
                    _count: { select: { students: true } }
                },
                skip: (Number(page) - 1) * Number(limit),
                take: Number(limit),
                orderBy: { createdAt: 'desc' }
            }),
            prisma.batch.count({ where })
        ]);

        res.json({
            batches,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / Number(limit))
            }
        });
    } catch (error) {
        next(error);
    }
});

/**
 * @route   GET /api/batches/:id
 * @desc    Get single batch details
 * @access  Private/Admin
 */
router.get('/:id', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), async (req, res, next) => {
    try {
        const batch = await prisma.batch.findUnique({
            where: { id: req.params.id },
            include: {
                course: { select: { id: true, title: true } },
                instructor: { select: { id: true, name: true, email: true } },
                students: {
                    include: {
                        user: { select: { id: true, name: true, email: true, avatar: true } }
                    }
                }
            }
        });

        if (!batch) {
            return res.status(404).json({ error: 'Batch not found' });
        }

        res.json({ batch });
    } catch (error) {
        next(error);
    }
});

/**
 * @route   POST /api/batches
 * @desc    Create a new batch
 * @access  Private/Admin
 */
router.post('/', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), async (req, res, next) => {
    try {
        const validatedData = createBatchSchema.parse(req.body);

        const existingBatch = await prisma.batch.findUnique({
            where: { batchCode: validatedData.batchCode }
        });

        if (existingBatch) {
            return res.status(400).json({ error: 'Batch Code already exists' });
        }

        const { studentIds, ...batchData } = validatedData;
        
        if (batchData.startDate) batchData.startDate = new Date(batchData.startDate);
        if (batchData.endDate) batchData.endDate = new Date(batchData.endDate);

        const batch = await prisma.batch.create({
            data: {
                ...batchData,
                students: {
                    create: (studentIds || []).map(id => ({
                        userId: id
                    }))
                }
            },
            include: {
                _count: { select: { students: true } }
            }
        });

        res.status(201).json({ message: 'Batch created successfully', batch });
    } catch (error) {
        next(error);
    }
});

/**
 * @route   PUT /api/batches/:id
 * @desc    Update a batch
 * @access  Private/Admin
 */
router.put('/:id', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), async (req, res, next) => {
    try {
        const validatedData = updateBatchSchema.parse(req.body);

        if (validatedData.batchCode) {
            const existingBatch = await prisma.batch.findUnique({
                where: { batchCode: validatedData.batchCode }
            });
            if (existingBatch && existingBatch.id !== req.params.id) {
                return res.status(400).json({ error: 'Batch Code already exists' });
            }
        }

        const { studentIds, ...batchData } = validatedData;
        
        if (batchData.startDate) batchData.startDate = new Date(batchData.startDate);
        if (batchData.endDate) batchData.endDate = new Date(batchData.endDate);

        // Process student IDs update if provided
        let studentsUpdate = undefined;
        if (studentIds) {
            // First delete all existing mappings for this batch
            await prisma.batchStudent.deleteMany({
                where: { batchId: req.params.id }
            });
            // Then we will recreate them via update
            studentsUpdate = {
                create: studentIds.map(id => ({
                    userId: id
                }))
            };
        }

        const batch = await prisma.batch.update({
            where: { id: req.params.id },
            data: {
                ...batchData,
                ...(studentsUpdate && { students: studentsUpdate })
            },
            include: {
                _count: { select: { students: true } }
            }
        });

        res.json({ message: 'Batch updated successfully', batch });
    } catch (error) {
        next(error);
    }
});

/**
 * @route   DELETE /api/batches/:id
 * @desc    Delete a batch
 * @access  Private/Admin
 */
router.delete('/:id', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), async (req, res, next) => {
    try {
        await prisma.batch.delete({
            where: { id: req.params.id }
        });
        res.json({ message: 'Batch deleted successfully' });
    } catch (error) {
        if (error.code === 'P2025') {
            return res.status(404).json({ error: 'Batch not found' });
        }
        next(error);
    }
});

module.exports = router;
