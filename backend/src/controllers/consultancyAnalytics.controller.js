const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Super Admin: Get overall Consultancy & Placement Analytics
exports.getOverallAnalytics = async (req, res) => {
    try {
        const totalDrives = await prisma.campusDrive.count();
        const pendingDrives = await prisma.campusDrive.count({ where: { status: 'REQUESTED' } });
        
        const totalStudentsPlaced = await prisma.campusDriveStudent.count({ where: { status: 'OFFERED' } });

        const coordinations = await prisma.consultancyCoordination.findMany({
            select: { revenue: true }
        });
        const totalRevenue = coordinations.reduce((sum, item) => sum + item.revenue, 0);

        res.json({
            totalDrives,
            pendingDrives,
            totalStudentsPlaced,
            totalRevenue
        });
    } catch (error) {
        console.error('Analytics Error:', error);
        res.status(500).json({ error: 'Failed to fetch analytics' });
    }
};

// Super Admin: Create a consultancy coordination record
exports.createCoordination = async (req, res) => {
    try {
        const { employerId, instituteId, revenue, notes } = req.body;

        const record = await prisma.consultancyCoordination.create({
            data: {
                employerId,
                instituteId,
                techwellAdminId: req.user.id,
                revenue: parseFloat(revenue || 0),
                notes
            }
        });

        res.status(201).json({ message: 'Coordination record created', record });
    } catch (error) {
        res.status(500).json({ error: 'Failed to create record' });
    }
};

// Super Admin: Get all coordination records
exports.getCoordinations = async (req, res) => {
    try {
        const records = await prisma.consultancyCoordination.findMany({
            include: {
                employer: { select: { id: true, name: true, email: true } },
                institute: { select: { id: true, name: true } },
                techwellAdmin: { select: { id: true, name: true } }
            },
            orderBy: { createdAt: 'desc' }
        });

        res.json(records);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch records' });
    }
};
