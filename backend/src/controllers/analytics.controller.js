const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getMasterAnalytics = async (req, res) => {
    try {
        let { startDate, endDate } = req.query;
    if (startDate !== undefined) startDate = Array.isArray(startDate) ? startDate[0] : String(startDate);
    if (endDate !== undefined) endDate = Array.isArray(endDate) ? endDate[0] : String(endDate);

        let dateFilter = {};
        if (startDate && endDate) {
            dateFilter = {
                createdAt: {
                    gte: new Date(startDate),
                    lte: new Date(endDate)
                }
            };
        }

        // Leads & Users
        const totalLeads = await prisma.lead.count({ where: dateFilter });
        const totalRegisteredUsers = await prisma.user.count({ where: { role: 'STUDENT', ...dateFilter } });

        // Placement Pipeline
        const jobsApplied = await prisma.jobApplication.count({ where: dateFilter });
        const pipelineGroups = await prisma.jobApplication.groupBy({
            by: ['status'],
            where: dateFilter,
            _count: { _all: true }
        });
        
        const placementMetrics = {
            totalApplied: jobsApplied,
            interviewScheduled: pipelineGroups.find(g => g.status === 'INTERVIEW')?.['_count']._all || 0,
            hired: pipelineGroups.find(g => g.status === 'HIRED')?.['_count']._all || 0,
            rejected: pipelineGroups.find(g => g.status === 'REJECTED')?.['_count']._all || 0,
        };

        // Campus Drives
        const campusApplications = await prisma.campusDriveStudent.groupBy({
            by: ['status'],
            where: dateFilter,
            _count: { _all: true }
        });

        // AI & Learning Metrics
        const certificatesIssued = await prisma.certificate.count({ where: dateFilter });
        const aiInterviewsEnrolled = await prisma.interview.count({ where: dateFilter });
        const resumesBuilt = await prisma.resume.count({ where: dateFilter });

        // Referrals
        const referralCounts = await prisma.user.groupBy({
            by: ['referredBy'],
            where: {
                referredBy: { not: null },
                ...dateFilter
            },
            _count: { _all: true },
            orderBy: {
                _count: {
                    referredBy: 'desc'
                }
            },
            take: 10
        });

        const topReferrersIds = referralCounts.map(r => r.referredBy);
        const topReferrersUsers = await prisma.user.findMany({
            where: { referralCode: { in: topReferrersIds } },
            select: { name: true, email: true, referralCode: true }
        });

        const topReferrers = referralCounts.map(r => {
            const user = topReferrersUsers.find(u => u.referralCode === r.referredBy);
            return {
                referralCode: r.referredBy,
                count: r._count._all,
                name: user ? user.name : 'Unknown',
                email: user ? user.email : 'Unknown'
            };
        });

        // Consultancy Analytics (Example: candidate distributions by location/domain)
        // If we want to group campus candidates by domain/targetRole
        const domainGroups = await prisma.campusDriveStudent.groupBy({
            by: ['targetRole'],
            where: { targetRole: { not: null }, ...dateFilter },
            _count: { _all: true },
            orderBy: {
                _count: { targetRole: 'desc' }
            },
            take: 10
        });

        res.json({
            summary: {
                totalLeads,
                totalRegisteredUsers,
                certificatesIssued,
                aiInterviewsEnrolled,
                resumesBuilt
            },
            placement: placementMetrics,
            campus: campusApplications.map(c => ({ status: c.status, count: c._count._all })),
            topReferrers,
            domains: domainGroups.map(d => ({ domain: d.targetRole, count: d._count._all }))
        });

    } catch (error) {
        console.error('Master Analytics Error:', error);
        res.status(500).json({ error: 'Failed to fetch master analytics' });
    }
};

module.exports = {
    getMasterAnalytics
};
