const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL } } });

// ─────────────────────────────────────────────
// ADMIN ROUTES
// ─────────────────────────────────────────────

// GET /api/coupons — Get all coupons (admin)
router.get('/', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), async (req, res) => {
    try {
        const coupons = await prisma.coupon.findMany({
            orderBy: { createdAt: 'desc' }
        });

        const now = new Date();

        // Enrich each coupon with course titles and computed status
        const enriched = await Promise.all(coupons.map(async (coupon) => {
            let courseTitles = [];
            if (coupon.courseIds && coupon.courseIds.length > 0) {
                const courses = await prisma.course.findMany({
                    where: { id: { in: coupon.courseIds } },
                    select: { id: true, title: true }
                });
                courseTitles = courses;
            }
            const isExpired = new Date(coupon.expiryDate) < now;
            return {
                ...coupon,
                courses: courseTitles,
                status: isExpired ? 'EXPIRED' : (coupon.isActive ? 'ACTIVE' : 'INACTIVE')
            };
        }));

        res.json({ coupons: enriched });
    } catch (error) {
        console.error('Get Coupons Error:', error);
        res.status(500).json({ error: 'Failed to fetch coupons' });
    }
});

// POST /api/coupons — Create coupon (admin)
router.post('/', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), async (req, res) => {
    try {
        const { couponName, discountPercentage, expiryDate, courseIds = [] } = req.body;

        // Validation
        if (!couponName || typeof couponName !== 'string' || couponName.trim() === '') {
            return res.status(400).json({ error: 'Coupon name is required' });
        }
        if (!discountPercentage || discountPercentage < 1 || discountPercentage > 100) {
            return res.status(400).json({ error: 'Discount percentage must be between 1 and 100' });
        }
        if (!expiryDate) {
            return res.status(400).json({ error: 'Expiry date is required' });
        }
        if (new Date(expiryDate) <= new Date()) {
            return res.status(400).json({ error: 'Expiry date must be in the future' });
        }

        const normalizedName = couponName.trim().toUpperCase();

        const coupon = await prisma.coupon.create({
            data: {
                couponName: normalizedName,
                discountPercentage: parseInt(discountPercentage),
                expiryDate: new Date(expiryDate),
                courseIds: Array.isArray(courseIds) ? courseIds : [],
                isActive: true
            }
        });

        res.status(201).json({ coupon, message: 'Coupon created successfully' });
    } catch (error) {
        if (error.code === 'P2002') {
            return res.status(409).json({ error: 'A coupon with this name already exists' });
        }
        console.error('Create Coupon Error:', error);
        res.status(500).json({ error: 'Failed to create coupon' });
    }
});

// PUT /api/coupons/:id — Update coupon (admin)
router.put('/:id', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), async (req, res) => {
    try {
        const { id } = req.params;
        const { couponName, discountPercentage, expiryDate, courseIds, isActive } = req.body;

        const existing = await prisma.coupon.findUnique({ where: { id } });
        if (!existing) {
            return res.status(404).json({ error: 'Coupon not found' });
        }

        const updateData = {};

        if (couponName !== undefined) {
            if (typeof couponName !== 'string' || couponName.trim() === '') {
                return res.status(400).json({ error: 'Coupon name cannot be empty' });
            }
            updateData.couponName = couponName.trim().toUpperCase();
        }
        if (discountPercentage !== undefined) {
            if (discountPercentage < 1 || discountPercentage > 100) {
                return res.status(400).json({ error: 'Discount percentage must be between 1 and 100' });
            }
            updateData.discountPercentage = parseInt(discountPercentage);
        }
        if (expiryDate !== undefined) {
            updateData.expiryDate = new Date(expiryDate);
        }
        if (courseIds !== undefined) {
            updateData.courseIds = Array.isArray(courseIds) ? courseIds : [];
        }
        if (isActive !== undefined) {
            updateData.isActive = Boolean(isActive);
        }

        const updated = await prisma.coupon.update({
            where: { id },
            data: updateData
        });

        res.json({ coupon: updated, message: 'Coupon updated successfully' });
    } catch (error) {
        if (error.code === 'P2002') {
            return res.status(409).json({ error: 'A coupon with this name already exists' });
        }
        console.error('Update Coupon Error:', error);
        res.status(500).json({ error: 'Failed to update coupon' });
    }
});

// DELETE /api/coupons/:id — Delete coupon (admin)
router.delete('/:id', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), async (req, res) => {
    try {
        const { id } = req.params;

        const existing = await prisma.coupon.findUnique({ where: { id } });
        if (!existing) {
            return res.status(404).json({ error: 'Coupon not found' });
        }

        await prisma.coupon.delete({ where: { id } });
        res.json({ message: 'Coupon deleted successfully' });
    } catch (error) {
        console.error('Delete Coupon Error:', error);
        res.status(500).json({ error: 'Failed to delete coupon' });
    }
});

// ─────────────────────────────────────────────
// USER ROUTE — Validate coupon at checkout
// ─────────────────────────────────────────────

// POST /api/coupons/validate — Validate a coupon for a specific course
router.post('/validate', authenticate, async (req, res) => {
    try {
        const { couponName, courseId, originalPrice } = req.body;

        if (!couponName || !courseId) {
            return res.status(400).json({ error: 'Coupon name and course ID are required' });
        }

        // Case-insensitive lookup
        const coupon = await prisma.coupon.findFirst({
            where: {
                couponName: {
                    equals: couponName.trim().toUpperCase(),
                    mode: 'insensitive'
                }
            }
        });

        if (!coupon) {
            return res.status(404).json({ valid: false, error: 'Invalid coupon code. Please check and try again.' });
        }

        if (!coupon.isActive) {
            return res.status(400).json({ valid: false, error: 'This coupon is no longer active.' });
        }

        const now = new Date();
        if (new Date(coupon.expiryDate) < now) {
            return res.status(400).json({ valid: false, error: 'This coupon has expired.' });
        }

        if (coupon.courseIds.length > 0 && !coupon.courseIds.includes(courseId)) {
            return res.status(400).json({ valid: false, error: 'This coupon is not applicable for the selected course.' });
        }

        const price = Number(originalPrice) || 0;
        const discountAmount = parseFloat(((price * coupon.discountPercentage) / 100).toFixed(2));
        const finalPrice = parseFloat((price - discountAmount).toFixed(2));

        return res.json({
            valid: true,
            couponId: coupon.id,
            couponName: coupon.couponName,
            discountPercentage: coupon.discountPercentage,
            discountAmount,
            finalPrice,
            message: `Coupon applied! You save ₹${discountAmount} (${coupon.discountPercentage}% off)`
        });
    } catch (error) {
        console.error('Validate Coupon Error:', error);
        res.status(500).json({ valid: false, error: 'Coupon validation failed. Please try again.' });
    }
});

module.exports = router;
