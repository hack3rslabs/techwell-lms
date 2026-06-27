const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { authenticate, checkPermission } = require('../middleware/auth');

/**
 * @route   GET /api/events
 * @desc    Get all events
 * @access  Public
 */
router.get('/', async (req, res, next) => {
    try {
        const events = await prisma.event.findMany({
            orderBy: { date: 'asc' }
        });
        res.json(events);
    } catch (error) {
        next(error);
    }
});

/**
 * @route   POST /api/events
 * @desc    Create a new event
 * @access  Private/Admin
 */
router.post('/', authenticate, checkPermission('LEADS'), async (req, res, next) => {
    try {
        const { title, description, imageUrl, type, date, time, location, status, seatsTotal, iconName, customFormFields } = req.body;

        const event = await prisma.event.create({
            data: {
                title,
                description,
                imageUrl,
                type,
                date: new Date(date),
                time,
                location,
                status,
                seatsTotal: parseInt(seatsTotal, 10),
                iconName,
                customFormFields: customFormFields ? (typeof customFormFields === 'string' ? JSON.parse(customFormFields) : customFormFields) : []
            }
        });

        res.status(201).json(event);
    } catch (error) {
        next(error);
    }
});

/**
 * @route   PUT /api/events/:id
 * @desc    Update an event
 * @access  Private/Admin
 */
router.put('/:id', authenticate, checkPermission('LEADS'), async (req, res, next) => {
    try {
        const { id } = req.params;
        const { title, description, imageUrl, type, date, time, location, status, seatsTotal, iconName, customFormFields } = req.body;

        const event = await prisma.event.update({
            where: { id },
            data: {
                title,
                description,
                imageUrl,
                type,
                date: date ? new Date(date) : undefined,
                time,
                location,
                status,
                seatsTotal: seatsTotal ? parseInt(seatsTotal, 10) : undefined,
                iconName,
                customFormFields: customFormFields ? (typeof customFormFields === 'string' ? JSON.parse(customFormFields) : customFormFields) : undefined
            }
        });

        res.json(event);
    } catch (error) {
        next(error);
    }
});

/**
 * @route   DELETE /api/events/:id
 * @desc    Delete an event
 * @access  Private/Admin
 */
router.delete('/:id', authenticate, checkPermission('LEADS'), async (req, res, next) => {
    try {
        const { id } = req.params;
        await prisma.event.delete({
            where: { id }
        });
        res.json({ message: 'Event deleted successfully' });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
