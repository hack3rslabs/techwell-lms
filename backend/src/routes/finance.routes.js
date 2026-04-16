const express = require('express');
const { authenticate, authorize, checkPermission, optionalAuth } = require('../middleware/auth');
const { PrismaClient } = require('@prisma/client');
const router = express.Router();
const prisma = new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL } } });

// GET /api/finance/stats - Dashboard Data
router.get('/stats', authenticate, authorize(['SUPER_ADMIN', 'ADMIN']), async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        let dateFilter = {};
        if (startDate && endDate) {
            dateFilter = {
                createdAt: {
                    gte: new Date(startDate),
                    lte: new Date(endDate)
                }
            };
        }

        // 1. Calculate Total Income (Successful Payments)
        const incomeAgg = await prisma.payment.aggregate({
            _sum: { amount: true },
            where: {
                status: 'SUCCESS',
                ...dateFilter
            }
        });

        // 2. Calculate Total Expenses
        const expenseAgg = await prisma.expense.aggregate({
            _sum: { amount: true },
            where: {
                // For expenses, date field is 'date' or 'createdAt'. We used 'date' in schema.
                // Wait, schema has 'date' field. But filter above used 'createdAt'. 
                // Let's adjust filter for expenses.
                date: startDate && endDate ? {
                    gte: new Date(startDate),
                    lte: new Date(endDate)
                } : undefined
            }
        });

        const totalIncome = incomeAgg._sum.amount || 0;
        const totalExpenses = expenseAgg._sum.amount || 0;
        const profit = totalIncome - totalExpenses;

        res.json({
            totalIncome,
            totalExpenses,
            profit
        });

    } catch (error) {
        console.error("Finance Stats Error:", error);
        res.status(500).json({ error: "Failed to fetch stats" });
    }
});

// GET /api/finance/expenses - List
router.get('/expenses', authenticate, authorize(['SUPER_ADMIN', 'ADMIN']), async (req, res) => {
    try {
        const expenses = await prisma.expense.findMany({
            orderBy: { date: 'desc' },
            take: 100 // Limit for now
        });
        res.json(expenses);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch expenses" });
    }
});

// POST /api/finance/expenses - Create
router.post('/expenses', authenticate, authorize(['SUPER_ADMIN', 'ADMIN']), async (req, res) => {
    try {
        const { title, amount, category, description, date } = req.body;

        const expense = await prisma.expense.create({
            data: {
                title,
                amount: parseFloat(amount),
                category,
                description,
                date: date ? new Date(date) : new Date(),
                createdBy: req.user.id
            }
        });

        res.json(expense);
    } catch (error) {
        res.status(500).json({ error: "Failed to create expense" });
    }
});

// DELETE /api/finance/expenses/:id
router.delete('/expenses/:id', authenticate, authorize(['SUPER_ADMIN', 'ADMIN']), async (req, res) => {
    try {
        await prisma.expense.delete({
            where: { id: req.params.id }
        });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: "Failed to delete expense" });
    }
});

module.exports = router;
