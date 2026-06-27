const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL } } });

const auditMiddleware = async (req, res, next) => {
    // Only audit state-changing methods, or vital reads like exports
    const isExport = req.method === 'GET' && req.originalUrl.includes('/export');
    
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method) || isExport) {
        // We hook into the response 'finish' event to log after the action completes
        const originalSend = res.json;
        let responseBody;

        res.json = function (data) {
            responseBody = data;
            originalSend.apply(res, arguments);
        };

        res.on('finish', async () => {
            // Only log successful or client error codes (not server crashes)
            if (res.statusCode >= 200 && res.statusCode < 500) {
                try {
                    const userId = req.user ? req.user.id : (responseBody?.user?.id || 'ANONYMOUS');
                    const userRole = req.user ? req.user.role : (responseBody?.user?.role || null);

                    // Identify Entity
                    let entityType = 'SYSTEM';
                    let entityId = null;
                    let action = 'UNKNOWN';
                    let severity = 'INFO';

                    // Simple heuristics based on URL
                    if (req.baseUrl.includes('auth/login')) {
                        entityType = 'USER';
                        action = 'LOGIN';
                        entityId = responseBody?.user?.id;
                    } else if (req.baseUrl.includes('approvals')) {
                        entityType = 'USER';
                        action = 'APPROVE';
                        entityId = req.params.id;
                    } else if (req.baseUrl.includes('jobs')) {
                        entityType = 'JOB';
                        entityId = req.params.id || responseBody?.id;
                        action = req.method === 'POST' ? 'CREATE' : req.method === 'DELETE' ? 'DELETE' : 'UPDATE';
                    } else if (req.baseUrl.includes('applications')) {
                        entityType = 'APPLICATION';
                        entityId = req.params.id || responseBody?.id;
                        action = req.body.status ? 'STATUS_CHANGE' : 'UPDATE';
                    }

                    if (isExport) {
                        entityType = 'DATA_EXPORT';
                        action = 'EXPORT';
                        severity = 'WARNING';
                    }

                    if (res.statusCode === 401 || res.statusCode === 403) {
                        severity = 'CRITICAL';
                        action = 'UNAUTHORIZED_ACCESS';
                    }

                    // Mask sensitive data
                    const safeBody = { ...req.body };
                    if (safeBody.password) safeBody.password = '***';

                    await prisma.auditLog.create({
                        data: {
                            entityType,
                            entityId: entityId || 'N/A',
                            action,
                            method: req.method,
                            path: req.originalUrl,
                            ipAddress: req.ip || req.connection.remoteAddress,
                            userAgent: req.get('User-Agent'),
                            newValue: Object.keys(safeBody).length > 0 ? safeBody : null,
                            performedBy: userId,
                            userRole: userRole,
                            severity: severity,
                            details: res.statusCode >= 400 ? { error: responseBody } : { success: true }
                        }
                    });
                } catch (err) {
                    console.error("Audit Log Error:", err);
                }
            }
        });
    }
    next();
};

module.exports = auditMiddleware;
