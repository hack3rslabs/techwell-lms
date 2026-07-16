const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getAllPartners = async (req, res, next) => {
    try {
        // Fetch Franchises
        const franchises = await prisma.franchise.findMany({
            where: {
                // Return ACTIVE and SUSPENDED so they can be shown with badges
                status: { in: ['ACTIVE', 'SUSPENDED'] }
            },
            select: {
                id: true,
                name: true,
                franchiseType: true,
                city: true,
                state: true,
                logoUrl: true,
                website: true,
                status: true,
            }
        });

        // Fetch Institutes (Colleges)
        const institutes = await prisma.institute.findMany({
            where: {
                status: 'APPROVED' // Assuming APPROVED is the active state
            },
            select: {
                id: true,
                name: true,
                type: true,
                city: true,
                state: true,
                logoUrl: true,
                website: true,
            }
        });

        // Fetch Clients (Companies / Consultancies)
        const clients = await prisma.client.findMany({
            where: {
                isActive: true
            },
            select: {
                id: true,
                name: true,
                description: true,
                url: true
            }
        });

        res.status(200).json({
            success: true,
            data: {
                franchises,
                institutes,
                clients
            }
        });
    } catch (error) {
        next(error);
    }
};
