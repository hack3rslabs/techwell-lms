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
                instituteId: true, // Support for institute Scoping
                isActive: true,
                systemRole: {
                    select: {
                        permissions: true,
                        name: true
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

        // Merge permissions from SystemRole if exists
        let permissions = new Set(user.permissions || []);
        if (user.systemRole && user.systemRole.permissions) {
            const rolePermissions = user.systemRole.permissions;
            if (Array.isArray(rolePermissions)) {
                rolePermissions.forEach(p => permissions.add(p));
            }
        }

        // Note: SUPER_ADMIN permissions are now governed by their SystemRole assignment.
        // No hardcoded 'ALL' bypass — edit the role's permissions in Admin > Roles & Permissions.

        req.user = {
            ...user,
            permissions: Array.from(permissions)
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
 * @param {string} requiredPermission - The permission string required
 */
const checkPermission = (requiredPermission) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Not authenticated' });
        }

        // Check for wildcard 'ALL' permission (assigned via SystemRole, not hardcoded)
        if (req.user.permissions && req.user.permissions.includes('ALL')) {
            return next();
        }

        const userPermissions = req.user.permissions || [];

        if (!userPermissions.includes(requiredPermission)) {
            return res.status(403).json({
                error: `Missing permission: ${requiredPermission}`
            });
        }

        next();
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
