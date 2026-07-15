const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const maintenanceMiddleware = async (req, res, next) => {
    try {
        // Skip for auth, admin, and settings routes
        if (req.originalUrl.includes('/api/auth/') || 
            req.originalUrl.includes('/api/admin/') || 
            req.originalUrl.includes('/api/settings/')) {
            return next();
        }

        // Get system settings
        let settings = await prisma.systemSettings.findUnique({
            where: { id: 'default' }
        });

        if (settings && settings.isMaintenanceMode) {
            return res.status(503).json({
                error: 'Service Unavailable',
                message: 'The system is currently undergoing maintenance. Please try again later.',
                isMaintenanceMode: true
            });
        }

        next();
    } catch (error) {
        console.error('Maintenance Middleware Error:', error);
        next();
    }
};

module.exports = { maintenanceMiddleware };
