const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate, checkPermission } = require('../middleware/auth');

const prisma = new PrismaClient();
const router = express.Router();

/**
 * @route   GET /api/analytics/dashboard
 * @desc    Get system-wide analytics for Admin dashboard
 * @access  Private/Admin
 */
router.get('/dashboard', authenticate, checkPermission('ALL'), async (req, res, next) => {
    try {
        // Fetch raw stats
        const totalUsers = await prisma.user.count({ where: { role: 'STUDENT' } });
        const totalCourses = await prisma.course.count();
        const totalBatches = await prisma.batch.count({ where: { isActive: true } });
        
        // Aggregate Revenue (from Payments)
        const payments = await prisma.payment.findMany({
            where: { status: 'SUCCESS' },
            select: { amount: true, createdAt: true }
        });
        
        const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);

        // Group revenue by month for the chart
        const revenueByMonth = {};
        payments.forEach(p => {
            const date = new Date(p.createdAt);
            const month = date.toLocaleString('default', { month: 'short', year: 'numeric' });
            if (!revenueByMonth[month]) revenueByMonth[month] = 0;
            revenueByMonth[month] += p.amount;
        });

        const revenueChart = Object.keys(revenueByMonth).map(month => ({
            name: month,
            revenue: revenueByMonth[month]
        }));

        res.json({
            stats: {
                totalStudents: totalUsers,
                activeCourses: totalCourses,
                activeBatches: totalBatches,
                totalRevenue
            },
            charts: {
                revenueData: revenueChart
            }
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
