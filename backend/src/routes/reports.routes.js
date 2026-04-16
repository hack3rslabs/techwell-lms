const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate, authorize, checkPermission } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL } } });

/**
 * @route   GET /api/reports/business-summary
 * @desc    Get aggregated yearly/monthly business summary (CEO View)
 * @access  Private/Admin
 */
router.get('/business-summary', authenticate, checkPermission('VIEW_REPORTS'), async (req, res, next) => {
    try {
        const { year } = req.query;
        const targetYear = year ? parseInt(year) : new Date().getFullYear();

        const startDate = new Date(targetYear, 0, 1); // Jan 1st
        const endDate = new Date(targetYear, 11, 31, 23, 59, 59); // Dec 31st

        // 1. Revenue
        const revenue = await prisma.payment.aggregate({
            where: {
                status: 'SUCCESS',
                createdAt: { gte: startDate, lte: endDate },
                ...(req.user.instituteId ? { course: { instituteId: req.user.instituteId } } : {})
            },
            _sum: { amount: true }
        });

        // 2. User Growth
        const newUsers = await prisma.user.count({
            where: {
                createdAt: { gte: startDate, lte: endDate },
                ...(req.user.instituteId ? { instituteId: req.user.instituteId } : {})
            }
        });

        // 3. Lead Conversion
        // Leads are currently global/CRM based. If we want institute leads, we need Lead.instituteId
        // precise scoping might be needed later. For now, Institute Admins see 0 leads or all? 
        // Best to show 0 if not scoped, or scoped leads if added.
        // Assuming Leads are global for Recruiter/Admin for now unless Lead model has instituteId.
        // Checking schema... Lead model probably doesn't have it yet.
        // SAFE FALLBACK: If institute admin, show 0 for now to prevent data leak.
        const leadWhere = req.user.instituteId
            ? { id: 'nothing' } // Hack until Leads have instituteId
            : { createdAt: { gte: startDate, lte: endDate } };

        const totalLeads = await prisma.lead.count({ where: leadWhere });
        const convertedLeads = await prisma.lead.count({
            where: {
                status: 'CONVERTED',
                ...(req.user.instituteId ? { id: 'nothing' } : { createdAt: { gte: startDate, lte: endDate } })
            }
        });

        // 4. Monthly Revenue Breakdown
        const payments = await prisma.payment.findMany({
            where: {
                status: 'SUCCESS',
                createdAt: { gte: startDate, lte: endDate },
                ...(req.user.instituteId ? { course: { instituteId: req.user.instituteId } } : {})
            },
            select: { amount: true, createdAt: true }
        });

        const monthlyRevenue = Array(12).fill(0);
        payments.forEach(p => {
            const month = p.createdAt.getMonth();
            monthlyRevenue[month] += p.amount;
        });

        res.json({
            year: targetYear,
            totalRevenue: revenue._sum.amount || 0,
            userGrowth: newUsers,
            leadConversionRate: totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0,
            monthlyRevenue: monthlyRevenue.map((amount, index) => ({
                month: new Date(0, index).toLocaleString('default', { month: 'short' }),
                amount
            }))
        });
    } catch (error) {
        next(error);
    }
});

/**
 * @route   GET /api/reports/sales-performance
 * @desc    Get sales performance metrics vs targets
 * @access  Private/Admin
 */
router.get('/sales-performance', authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'INSTITUTE_ADMIN'), async (req, res, next) => {
    try {
        // Mock targets (In a real app, these would be in a DB table)
        const MONTHLY_TARGET = 500000;

        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const currentMonthSales = await prisma.payment.aggregate({
            where: {
                status: 'SUCCESS',
                createdAt: { gte: startOfMonth },
                ...(req.user.instituteId ? { course: { instituteId: req.user.instituteId } } : {})
            },
            _sum: { amount: true }
        });

        const achieved = currentMonthSales._sum.amount || 0;

        res.json({
            period: 'Current Month',
            target: MONTHLY_TARGET,
            achieved,
            percentage: (achieved / MONTHLY_TARGET) * 100,
            status: achieved >= MONTHLY_TARGET ? 'On Track' : 'Needs Attention'
        });
    } catch (error) {
        next(error);
    }
});

/**
 * @route   GET /api/reports/course-performance
 * @desc    Get top performing courses by revenue
 * @access  Private/Admin
 */
router.get('/course-performance', authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'INSTITUTE_ADMIN'), async (req, res, next) => {
    try {
        const topCourses = await prisma.course.findMany({
            take: 5,
            where: req.user.instituteId ? { instituteId: req.user.instituteId } : {},
            include: {
                _count: {
                    select: { enrollments: true }
                }
            },
            orderBy: {
                enrollments: { _count: 'desc' }
            }
        });

        // Calculate simplified revenue (price * enrollments)
        const performance = topCourses.map(course => ({
            id: course.id,
            title: course.title,
            enrollments: course._count.enrollments,
            estimatedRevenue: course._count.enrollments * Number(course.price || 0)
        }));

        res.json(performance);
    } catch (error) {
        next(error);
    }
});

/**
 * @route   GET /api/reports/employer
 * @desc    Get employer specific reports
 * @access  Private (Employer)
 */
router.get('/employer', authenticate, authorize('EMPLOYER'), async (req, res, next) => {
    try {
        const employerId = req.user.id;

        // 1. Job Stats
        const totalJobs = await prisma.job.count({ where: { employerId } });
        const activeJobs = await prisma.job.count({ where: { employerId, status: 'OPEN' } });

        // 2. Application Stats
        const jobs = await prisma.job.findMany({
            where: { employerId },
            select: { id: true }
        });
        const jobIds = jobs.map(j => j.id);

        const totalApplications = await prisma.jobApplication.count({
            where: { jobId: { in: jobIds } }
        });

        const hiredCount = await prisma.jobApplication.count({
            where: { jobId: { in: jobIds }, status: { in: ['HIRED', 'SELECTED'] } }
        });

        const rejectedCount = await prisma.jobApplication.count({
            where: { jobId: { in: jobIds }, status: 'REJECTED' }
        });

        // 3. Recent Applications
        const recentApplications = await prisma.jobApplication.findMany({
            where: { jobId: { in: jobIds } },
            orderBy: { createdAt: 'desc' },
            take: 10,
            include: {
                job: { select: { title: true } },
                applicant: { select: { name: true, email: true } }
            }
        });

        res.json({
            summary: {
                totalJobs,
                activeJobs,
                totalApplications,
                hiredCount,
                rejectedCount,
                interviewing: totalApplications - hiredCount - rejectedCount
            },
            recentApplications
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
