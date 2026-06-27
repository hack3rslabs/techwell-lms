const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL } } });

exports.getAllCoupons = async (req, res) => {
    try {
        const coupons = await prisma.coupon.findMany({
            include: { courses: true },
            orderBy: { createdAt: 'desc' }
        });
        res.json(coupons);
    } catch (error) {
        console.error('Error fetching coupons:', error);
        res.status(500).json({ error: 'Failed to fetch coupons' });
    }
};

exports.createCoupon = async (req, res) => {
    try {
        const { code, discountPercent, expiryDate, courseIds } = req.body;
        
        const coupon = await prisma.coupon.create({
            data: {
                code,
                discountPercent: parseFloat(discountPercent),
                expiryDate: new Date(expiryDate),
                courses: {
                    connect: (courseIds || []).map(id => ({ id }))
                }
            },
            include: { courses: true }
        });
        
        res.status(201).json(coupon);
    } catch (error) {
        console.error('Error creating coupon:', error);
        res.status(500).json({ error: 'Failed to create coupon' });
    }
};

exports.deleteCoupon = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.coupon.delete({ where: { id } });
        res.json({ message: 'Coupon deleted successfully' });
    } catch (error) {
        console.error('Error deleting coupon:', error);
        res.status(500).json({ error: 'Failed to delete coupon' });
    }
};

exports.validateCoupon = async (req, res) => {
    try {
        const { code, courseId } = req.body;
        
        const coupon = await prisma.coupon.findUnique({
            where: { code },
            include: { courses: true }
        });

        if (!coupon) {
            return res.status(404).json({ error: 'Coupon not found' });
        }

        if (!coupon.isActive) {
            return res.status(400).json({ error: 'Coupon is inactive' });
        }

        if (new Date(coupon.expiryDate) < new Date()) {
            return res.status(400).json({ error: 'Coupon has expired' });
        }

        const isApplicable = coupon.courses.some(c => c.id === courseId);
        if (!isApplicable && coupon.courses.length > 0) {
            return res.status(400).json({ error: 'Coupon is not valid for this course' });
        }

        res.json(coupon);
    } catch (error) {
        console.error('Error validating coupon:', error);
        res.status(500).json({ error: 'Failed to validate coupon' });
    }
};
