const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate, authorize, checkPermission } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL } } });

/**
 * @route   GET /api/operations/kanban
 * @desc    Fetch consolidated lifecycle data for Operations Kanban Board
 * @access  Private (Admin/Super Admin)
 */
router.get('/kanban', authenticate, authorize('ADMIN', 'SUPER_ADMIN', 'MANAGER'), checkPermission('OPERATIONS'), async (req, res, next) => {
    try {
        // 1. Fetch Leads (New & Interested)
        const leads = await prisma.lead.findMany({
            where: { 
                status: { in: ['NEW', 'CONTACTED', 'INTERESTED', 'QUALIFIED'] }
            },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                status: true,
                source: true,
                createdAt: true
            },
            orderBy: { createdAt: 'desc' },
            take: 20
        });

        // 2. Fetch Active Students (In Training)
        const students = await prisma.user.findMany({
            where: {
                role: 'STUDENT',
                enrollments: { some: {} } // Currently enrolled in something
            },
            select: {
                id: true,
                name: true,
                email: true,
                createdAt: true,
                enrollments: {
                    select: {
                        progress: true,
                        course: { select: { title: true } }
                    }
                }
            },
            orderBy: { createdAt: 'desc' },
            take: 20
        });

        // 3. Fetch Placement Ready Candidates
        const placementReady = await prisma.candidateProfile.findMany({
            where: {
                status: 'SCREENING',
                atsScore: { gte: 70 } // Good ATS score implies readiness
            },
            select: {
                id: true,
                name: true,
                category: true,
                atsScore: true,
                status: true,
                userId: true
            },
            orderBy: { atsScore: 'desc' },
            take: 20
        });

        // 4. Fetch Hired/Placed
        const hired = await prisma.candidateProfile.findMany({
            where: { status: 'HIRED' },
            select: {
                id: true,
                name: true,
                category: true,
                userId: true
            },
            take: 20
        });

        res.json({
            leads: (Array.isArray(leads) ? leads : []).map(l => ({ ...l, type: 'LEAD', stage: 'NEW_LEAD' })),
            students: (Array.isArray(students) ? students : []).map(s => ({ ...s, type: 'STUDENT', stage: 'IN_TRAINING' })),
            ready: placementReady.map(r => ({ ...r, type: 'CANDIDATE', stage: 'PLACEMENT_READY' })),
            hired: hired.map(h => ({ ...h, type: 'CANDIDATE', stage: 'HIRED' }))
        });

    } catch (error) {
        console.error("Operations Kanban Error:", error);
        res.status(500).json({ error: 'Failed to fetch operations data.' });
    }
});

/**
 * @route   GET /api/operations/kpis
 * @desc    Fetch KPIs for the Operations Command Center
 * @access  Private (Admin/Super Admin)
 */
router.get('/kpis', authenticate, authorize('ADMIN', 'SUPER_ADMIN', 'MANAGER'), checkPermission('OPERATIONS'), async (req, res, next) => {
    try {
        const totalLeads = await prisma.lead.count();
        const activeStudents = await prisma.user.count({ where: { role: 'STUDENT', enrollments: { some: {} } } });
        const placementReady = await prisma.candidateProfile.count({ where: { status: 'SCREENING', atsScore: { gte: 70 } } });
        const hiredCandidates = await prisma.candidateProfile.count({ where: { status: 'HIRED' } });

        // Calculate a dummy conversion rate for visual purposes if data is low
        const conversionRate = totalLeads > 0 ? ((activeStudents / totalLeads) * 100).toFixed(1) : 0;

        // Fetch actual revenue from successful payments
        const revenueAgg = await prisma.payment.aggregate({
            _sum: { amount: true },
            where: { status: 'SUCCESS' }
        });
        const totalRevenue = revenueAgg._sum.amount || 0;
        
        // Format revenue as currency
        const formattedRevenue = new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(totalRevenue);

        // Fetch actual active batches
        const activeBatchesCount = await prisma.batch.count({
            where: { status: { in: ['ACTIVE', 'UPCOMING'] } }
        });

        res.json({
            metrics: {
                totalLeads,
                activeStudents,
                placementReady,
                hiredCandidates,
                conversionRate: `${conversionRate}%`,
                monthlyRevenue: formattedRevenue,
                activeBatches: activeBatchesCount
            }
        });
    } catch (error) {
        console.error("Operations KPIs Error:", error);
        res.status(500).json({ error: 'Failed to fetch operations KPIs.' });
    }
});

module.exports = router;
