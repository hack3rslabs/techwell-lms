const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL } } });
const { authenticate, checkPermission } = require('../middleware/auth');
const moment = require('moment');

// Dynamic BI Engine Route
// Accepts ?metric=XXX & dimension=YYY & startDate=ZZZ & endDate=AAA
router.get('/', authenticate, checkPermission('ANALYTICS'), async (req, res) => {
    try {
        const { metric, dimension, startDate, endDate } = req.query;

        // Default Date Range: Last 30 Days if not provided
        const fromDate = startDate ? new Date(startDate) : moment().subtract(30, 'days').toDate();
        const toDate = endDate ? new Date(endDate) : new Date();

        let data = [];
        let title = '';

        if (metric === 'leads') {
            title = 'Total Leads';
            // Aggregation by Dimension
            if (dimension === 'status') {
                const grouped = await prisma.lead.groupBy({
                    by: ['status'],
                    where: { createdAt: { gte: fromDate, lte: toDate } },
                    _count: { _all: true }
                });
                data = grouped.map(g => ({ name: g.status || 'Unknown', value: g._count._all }));
            } 
            else if (dimension === 'source') {
                const grouped = await prisma.lead.groupBy({
                    by: ['source'],
                    where: { createdAt: { gte: fromDate, lte: toDate } },
                    _count: { _all: true }
                });
                data = grouped.map(g => ({ name: g.source || 'Organic', value: g._count._all }));
            }
            else if (dimension === 'time_daily') {
                // For daily, we fetch all and bucket them in JS (Prisma native daily grouping varies by DB)
                const leads = await prisma.lead.findMany({
                    where: { createdAt: { gte: fromDate, lte: toDate } },
                    select: { createdAt: true }
                });
                const buckets = {};
                leads.forEach(l => {
                    const dateStr = moment(l.createdAt).format('YYYY-MM-DD');
                    buckets[dateStr] = (buckets[dateStr] || 0) + 1;
                });
                // Sort and format
                data = Object.keys(buckets).sort().map(date => ({
                    name: moment(date).format('MMM DD'),
                    value: buckets[date]
                }));
            }
        } 
        else if (metric === 'revenue') {
            title = 'Total Revenue';
            if (dimension === 'time_daily') {
                const payments = await prisma.payment.findMany({
                    where: { 
                        paymentDate: { gte: fromDate, lte: toDate },
                        status: 'COMPLETED'
                    },
                    select: { amount: true, paymentDate: true }
                });
                const buckets = {};
                payments.forEach(p => {
                    const dateStr = moment(p.paymentDate).format('YYYY-MM-DD');
                    buckets[dateStr] = (buckets[dateStr] || 0) + p.amount;
                });
                data = Object.keys(buckets).sort().map(date => ({
                    name: moment(date).format('MMM DD'),
                    value: buckets[date]
                }));
            }
            else if (dimension === 'payment_method') {
                const payments = await prisma.payment.findMany({
                    where: { paymentDate: { gte: fromDate, lte: toDate }, status: 'COMPLETED' },
                    select: { amount: true, paymentMethod: true } // Assuming paymentMethod exists on model
                });
                const buckets = {};
                payments.forEach(p => {
                    const method = p.paymentMethod || 'Unknown';
                    buckets[method] = (buckets[method] || 0) + p.amount;
                });
                data = Object.keys(buckets).map(key => ({ name: key, value: buckets[key] }));
            }
        }
        else if (metric === 'enrollments') {
            title = 'Student Enrollments';
            if (dimension === 'course') {
                const enrolls = await prisma.enrollment.findMany({
                    where: { enrolledAt: { gte: fromDate, lte: toDate } },
                    include: { course: true }
                });
                const buckets = {};
                enrolls.forEach(e => {
                    const cName = e.course?.title || 'Unknown Course';
                    buckets[cName] = (buckets[cName] || 0) + 1;
                });
                data = Object.keys(buckets).map(key => ({ name: key, value: buckets[key] }));
            }
            else if (dimension === 'time_daily') {
                const enrolls = await prisma.enrollment.findMany({
                    where: { enrolledAt: { gte: fromDate, lte: toDate } },
                    select: { enrolledAt: true }
                });
                const buckets = {};
                enrolls.forEach(e => {
                    const dateStr = moment(e.enrolledAt).format('YYYY-MM-DD');
                    buckets[dateStr] = (buckets[dateStr] || 0) + 1;
                });
                data = Object.keys(buckets).sort().map(date => ({
                    name: moment(date).format('MMM DD'),
                    value: buckets[date]
                }));
            }
        }


        else if (metric === 'expenses') {
            title = 'Business Expenses';
            if (dimension === 'category') {
                const expenses = await prisma.expense.findMany({
                    where: { date: { gte: fromDate, lte: toDate } },
                    select: { amount: true, category: true }
                });
                const buckets = {};
                expenses.forEach(e => {
                    const cat = e.category || 'Uncategorized';
                    buckets[cat] = (buckets[cat] || 0) + e.amount;
                });
                data = Object.keys(buckets).map(key => ({ name: key, value: buckets[key] }));
            } else if (dimension === 'time_daily') {
                const expenses = await prisma.expense.findMany({
                    where: { date: { gte: fromDate, lte: toDate } },
                    select: { amount: true, date: true }
                });
                const buckets = {};
                expenses.forEach(e => {
                    const dateStr = moment(e.date).format('YYYY-MM-DD');
                    buckets[dateStr] = (buckets[dateStr] || 0) + e.amount;
                });
                data = Object.keys(buckets).sort().map(date => ({ name: moment(date).format('MMM DD'), value: buckets[date] }));
            }
        }
        else if (metric === 'profit_loss') {
            title = 'Profit & Loss (Net Margin)';
            if (dimension === 'time_daily') {
                const payments = await prisma.payment.findMany({
                    where: { paymentDate: { gte: fromDate, lte: toDate }, status: 'COMPLETED' },
                    select: { amount: true, paymentDate: true }
                });
                const expenses = await prisma.expense.findMany({
                    where: { date: { gte: fromDate, lte: toDate } },
                    select: { amount: true, date: true }
                });
                
                const buckets = {};
                // Add revenue
                payments.forEach(p => {
                    const dateStr = moment(p.paymentDate).format('YYYY-MM-DD');
                    if(!buckets[dateStr]) buckets[dateStr] = { revenue: 0, expense: 0, profit: 0 };
                    buckets[dateStr].revenue += p.amount;
                    buckets[dateStr].profit += p.amount;
                });
                // Subtract expenses
                expenses.forEach(e => {
                    const dateStr = moment(e.date).format('YYYY-MM-DD');
                    if(!buckets[dateStr]) buckets[dateStr] = { revenue: 0, expense: 0, profit: 0 };
                    buckets[dateStr].expense += e.amount;
                    buckets[dateStr].profit -= e.amount;
                });

                data = Object.keys(buckets).sort().map(date => ({
                    name: moment(date).format('MMM DD'),
                    revenue: buckets[date].revenue,
                    expense: buckets[date].expense,
                    value: buckets[date].profit // Use profit as the primary 'value' for generic rendering
                }));
            }
        }

        res.json({
            metric,
            dimension,
            title,
            data
        });
    } catch (error) {
        console.error("Studio Analytics Error:", error);
        res.status(500).json({ error: "Failed to generate BI data." });
    }
});

module.exports = router;
