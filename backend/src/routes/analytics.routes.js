const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL } } });
const { authenticate, authorize, checkPermission, optionalAuth } = require('../middleware/auth');

// GET /api/analytics/interviews
// Aggregates interview performance data
router.get('/interviews', authenticate, async (req, res) => {
    try {
        const userId = req.user.id;
        const isAdmin = ['ADMIN', 'SUPER_ADMIN'].includes(req.user.role);

        // Define filter: Admin sees all, Student sees their own
        const whereClause = isAdmin ? {} : { interview: { userId } };

        // 1. Fetch Evaluations
        const evaluations = await prisma.interviewEvaluation.findMany({
            where: whereClause,
            include: { interview: true },
            orderBy: { createdAt: 'asc' } // For trend line
        });

        if (evaluations.length === 0) {
            return res.json({
                radar: { tech: 0, comm: 0, conf: 0 },
                trend: [],
                weaknesses: [],
                totalInterviews: 0
            });
        }

        // 2. Calculate Averages for Radar Chart
        const totalDocs = evaluations.length;
        const sums = evaluations.reduce((acc, curr) => ({
            tech: acc.tech + curr.technicalScore,
            comm: acc.comm + curr.communicationScore,
            conf: acc.conf + curr.confidenceScore
        }), { tech: 0, comm: 0, conf: 0 });

        const radar = {
            tech: Math.round(sums.tech / totalDocs),
            comm: Math.round(sums.comm / totalDocs),
            conf: Math.round(sums.conf / totalDocs)
        };

        // 3. Score Trend (Last 10 interviews)
        const trend = evaluations.slice(-10).map(ev => ({
            date: new Date(ev.createdAt).toLocaleDateString(),
            score: ev.overallScore,
            id: ev.interviewId
        }));

        // 4. Weakness Heatmap (Aggregate tags)
        const weaknessMap = {};
        evaluations.forEach(ev => {
            const weaknesses = Array.isArray(ev.weaknesses) ? ev.weaknesses : [];
            weaknesses.forEach(w => {
                // Check if w is string or object (handles legacy data)
                const tag = typeof w === 'string' ? w : w.tag || 'General';
                weaknessMap[tag] = (weaknessMap[tag] || 0) + 1;
            });
        });

        // Convert map to sorted array
        const weaknessArray = Object.entries(weaknessMap)
            .map(([tag, count]) => ({ tag, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5); // Top 5

        res.json({
            radar,
            trend,
            weaknesses: weaknessArray,
            totalInterviews: totalDocs
        });

    } catch (error) {
        console.error('Analytics Error:', error);
        res.status(500).json({ error: 'Failed to fetch analytics' });
    }
});

// GET /api/analytics/benchmark
// Returns User's Avg Score vs Platform Avg
router.get('/benchmark', authenticate, async (req, res) => {
    try {
        const userId = req.user.id;

        // User Avg
        const userEval = await prisma.interviewEvaluation.aggregate({
            where: { interview: { userId } },
            _avg: { overallScore: true }
        });

        // Platform Avg (Global)
        const globalEval = await prisma.interviewEvaluation.aggregate({
            _avg: { overallScore: true }
        });

        res.json({
            userAvg: Math.round(userEval._avg.overallScore || 0),
            globalAvg: Math.round(globalEval._avg.overallScore || 0)
        });

    } catch (error) {
        console.error('Benchmark Error:', error);
        res.status(500).json({ error: 'Benchmark failed' });
    }
});

// GET /api/analytics/master-dashboard
// Aggregates total revenue, leads, active resources for Master Dashboard
router.get('/master-dashboard', authenticate, async (req, res) => {
    try {
        if (!['ADMIN', 'SUPER_ADMIN'].includes(req.user.role)) {
            return res.status(403).json({ error: 'Forbidden' });
        }

        // 1. Unified Revenue (Legacy + New SystemRevenueLog)
        const payments = await prisma.payment.aggregate({ _sum: { amount: true }, where: { status: 'COMPLETED' } });
        const consultingRev = await prisma.consultancyCoordination.aggregate({ _sum: { revenue: true } });
        const franchiseRev = await prisma.franchiseRevenue.aggregate({ _sum: { amount: true } });
        const leadRev = await prisma.lead.aggregate({ _sum: { revenueGenerated: true } });
        
        const systemRevenue = await prisma.systemRevenueLog.aggregate({ _sum: { amount: true }, where: { status: 'COMPLETED' } });
        
        const totalRevenue = (payments._sum.amount || 0) + 
                             (consultingRev._sum.revenue || 0) + 
                             (franchiseRev._sum.amount || 0) + 
                             (leadRev._sum.revenueGenerated || 0) +
                             (systemRevenue._sum.amount || 0);

        // 2. Global Leads
        const totalLeads = await prisma.lead.count();
        const convertedLeads = await prisma.lead.count({ where: { status: 'CONVERTED' } });

        // 3. Resources Overview
        const totalStudents = await prisma.user.count({ where: { role: 'STUDENT' } });
        const totalStaff = await prisma.user.count({ where: { role: { in: ['ADMIN', 'SUPER_ADMIN', 'STAFF', 'INSTRUCTOR', 'COUNSELLOR', 'TELE_SALES'] } } });
        const activeFranchises = await prisma.franchise.count({ where: { status: 'ACTIVE' } }); // Changed to ACTIVE as per model
        const activeProjects = await prisma.project.count({ where: { isPublished: true } });
        const activeCourses = await prisma.course.count({ where: { isPublished: true } });

        // 4. Recent Cashflow (Last 5 payments)
        const recentPayments = await prisma.payment.findMany({
            where: { status: 'COMPLETED' },
            orderBy: { createdAt: 'desc' },
            take: 5,
            include: { user: { select: { name: true } }, course: { select: { title: true } } }
        });

        res.json({
            revenue: {
                total: totalRevenue,
                breakdown: {
                    payments: payments._sum.amount || 0,
                    consulting: consultingRev._sum.revenue || 0,
                    franchise: franchiseRev._sum.amount || 0,
                    leads: leadRev._sum.revenueGenerated || 0,
                    universalLog: systemRevenue._sum.amount || 0
                }
            },
            pipeline: {
                totalLeads,
                convertedLeads,
                conversionRate: totalLeads > 0 ? ((convertedLeads / totalLeads) * 100).toFixed(1) : 0
            },
            resources: {
                totalStudents,
                totalStaff,
                activeFranchises,
                activeProjects,
                activeCourses
            },
            recentTransactions: recentPayments
        });

    } catch (error) {
        console.error('Master Dashboard Error:', error);
        res.status(500).json({ error: 'Failed to fetch master analytics' });
    }
});

module.exports = router;
