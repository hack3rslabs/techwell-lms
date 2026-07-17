const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL } } });

/**
 * JWT Authentication Middleware
 * Verifies the token and attaches user to request
 */
const authenticate = async (req, res, next) => {
    try {
        let token;
        if (req.cookies && req.cookies.token) {
            token = req.cookies.token;
        } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return res.status(401).json({ error: 'No token provided' });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });

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
                currentSessionToken: true,
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

        // Single Active Session Check
        if (user.currentSessionToken && user.currentSessionToken !== decoded.sessionToken) {
            return res.status(401).json({ 
                error: 'Session expired. You logged in from another device.', 
                isSessionExpired: true 
            });
        }

        // Format permissions for easier lookup
        const rolePermissions = {};
        
        let systemRoleData = user.systemRole;
        if (!systemRoleData && user.role) {
            // Fallback for users missing systemRoleId
            const roleNameMap = {
                'EMPLOYER': 'Employer',
                'FRANCHISE_ADMIN': 'Franchise Admin',
                'INSTITUTE_ADMIN': 'Institute Admin',
                'STAFF': 'Staff',
                'SUPER_ADMIN': 'Super Admin'
            };
            const expectedName = roleNameMap[user.role];
            if (expectedName) {
                systemRoleData = await prisma.systemRole.findFirst({
                    where: { name: expectedName },
                    select: {
                        name: true,
                        rolePermissions: {
                            include: { feature: { select: { code: true } } }
                        }
                    }
                });
                
                // Also update the user record for future logins
                if (systemRoleData) {
                    const fallbackRole = await prisma.systemRole.findFirst({ where: { name: expectedName } });
                    if (fallbackRole) {
                        await prisma.user.update({
                            where: { id: user.id },
                            data: { systemRoleId: fallbackRole.id }
                        });
                    }
                }
            }
        }

        if (systemRoleData && systemRoleData.rolePermissions) {
            systemRoleData.rolePermissions.forEach(rp => {
                rolePermissions[rp.feature.code] = {
                    canRead: rp.canRead,
                    canCreate: rp.canCreate,
                    canUpdate: rp.canUpdate,
                    canDelete: rp.canDelete,
                    isDisabled: rp.isDisabled
                };
            });
        }

        req.user = {
            ...user,
            permissions: Array.isArray(user.permissions) ? user.permissions : [],
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

        // SUPER_ADMIN has god-mode access to all routes
        if (req.user.role === 'SUPER_ADMIN') {
            return next();
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

        // 1. Bypass check for Super Admins only
        if (req.user.role === 'SUPER_ADMIN') {
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

        // 2. Determine if we are checking for Read, Create, Update, or Delete
        // If accessType is not provided, we infer it from the HTTP method
        const methodMap = {
            'GET': 'read',
            'POST': 'create',
            'PUT': 'update',
            'PATCH': 'update',
            'DELETE': 'delete'
        };
        const requiredAccess = accessType || methodMap[req.method] || 'read';

        if (requiredAccess === 'create' && permissions.canCreate) return next();
        if (requiredAccess === 'update' && permissions.canUpdate) return next();
        if (requiredAccess === 'delete' && permissions.canDelete) return next();
        if (requiredAccess === 'read' && permissions.canRead) return next();

        return res.status(403).json({
            error: `Permission Denied: You do not have ${requiredAccess} access to the ${featureCode} module.`,
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
        const decoded = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });

        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                permissions: true,
                systemRole: {
                    select: {
                        name: true,
                        rolePermissions: {
                            include: {
                                feature: {
                                    select: { code: true }
                                }
                            }
                        }
                    }
                }
            }
        });

        if (user) {
            const rolePermissions = {};
            let systemRoleData = user.systemRole;
            if (!systemRoleData && user.role) {
                const roleNameMap = {
                    'EMPLOYER': 'Employer',
                    'FRANCHISE_ADMIN': 'Franchise Admin',
                    'INSTITUTE_ADMIN': 'Institute Admin',
                    'STAFF': 'Staff',
                    'SUPER_ADMIN': 'Super Admin'
                };
                const expectedName = roleNameMap[user.role];
                if (expectedName) {
                    systemRoleData = await prisma.systemRole.findFirst({
                        where: { name: expectedName },
                        select: {
                            name: true,
                            rolePermissions: {
                                include: { feature: { select: { code: true } } }
                            }
                        }
                    });
                }
            }

            if (systemRoleData && systemRoleData.rolePermissions) {
                systemRoleData.rolePermissions.forEach(rp => {
                    rolePermissions[rp.feature.code] = {
                        canRead: rp.canRead,
                        canCreate: rp.canCreate,
                        canUpdate: rp.canUpdate,
                        canDelete: rp.canDelete,
                        isDisabled: rp.isDisabled
                    };
                });
            }

            req.user = {
                ...user,
                permissions: Array.isArray(user.permissions) ? user.permissions : [],
                rolePermissions
            };
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
