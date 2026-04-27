const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL } } });

/**
 * JWT Authentication Middleware
 * Verifies the token and attaches user to request
 */
const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'No token provided' });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                permissions: true,
                instituteId: true,
                isActive: true,
                systemRole: {
                    select: {
                        name: true,
                        rolePermissions: {
                            include: {
                                feature: {
                                    select: {
                                        code: true
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });

        if (!user) {
            return res.status(401).json({ error: 'User not found' });
        }

        if (!user.isActive) {
            return res.status(403).json({ error: 'Account is deactivated' });
        }

        // Format permissions for easier lookup
        const rolePermissions = {};
        if (user.systemRole && user.systemRole.rolePermissions) {
            user.systemRole.rolePermissions.forEach(rp => {
                rolePermissions[rp.feature.code] = {
                    canRead: rp.canRead,
                    canWrite: rp.canWrite,
                    isDisabled: rp.isDisabled
                };
            });
        }

        req.user = {
            ...user,
            rolePermissions
        };
        next();
    } catch (error) {
        next(error);
    }
};

/**
 * Role-Based Access Control Middleware
 * @param  {...string} roles - Allowed roles
 */
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Not authenticated' });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                error: 'You do not have permission to perform this action'
            });
        }

        next();
    };
};

/**
 * Permission-Based Access Control
 * @param {string} featureCode - The feature code to check (e.g., 'USERS', 'COURSES')
 * @param {string} accessType - Optional explicit check for 'read' or 'write'
 */
const checkPermission = (featureCode, accessType = null) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Not authenticated' });
        }

        // 1. Bypass check for Super Admins and Admins
        if (['SUPER_ADMIN', 'ADMIN'].includes(req.user.role)) {
            return next();
        }

        const permissions = req.user.rolePermissions?.[featureCode];

        // 1. If no permissions defined for this feature, or it's explicitly disabled
        if (!permissions || permissions.isDisabled) {
            return res.status(403).json({
                error: `Access Denied: You do not have permission for the ${featureCode} module.`,
                code: 'FORBIDDEN'
            });
        }

        // 2. Determine if we are checking for Read or Write
        // If accessType is not provided, we infer it from the HTTP method
        const requiredAccess = accessType || (req.method === 'GET' ? 'read' : 'write');

        if (requiredAccess === 'write') {
            if (permissions.canWrite) {
                return next();
            }
            return res.status(403).json({
                error: `Permission Denied: You do not have Write access to the ${featureCode} module.`,
                code: 'FORBIDDEN'
            });
        }

        // Default to Read check
        if (permissions.canRead || permissions.canWrite) {
            return next();
        }

        return res.status(403).json({
            error: `Permission Denied: You do not have Read access to the ${featureCode} module.`,
            code: 'FORBIDDEN'
        });
    };
};

/**
 * Optional authentication - attaches user if token present
 */
const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return next();
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            select: {
                id: true,
                email: true,
                name: true,
                role: true
            }
        });

        if (user) {
            req.user = user;
        }

        next();
    } catch (error) {
        // Token invalid, continue without user
        next();
    }
};

module.exports = {
    authenticate,
    authorize,
    checkPermission,
    optionalAuth
};
