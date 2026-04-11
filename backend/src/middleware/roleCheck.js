/**
 * Role-based Access Control Middleware
 * Checks if user has required role(s)
 */

const adminRoleCheck = (allowedRoles = ['ADMIN']) => {
    return async (req, res, next) => {
        try {
            if (!req.user) {
                return res.status(401).json({ error: 'Unauthorized - No user found' });
            }

            // Check if user role is in allowed roles
            if (!allowedRoles.includes(req.user.role)) {
                return res.status(403).json({ 
                    error: 'Forbidden - Insufficient permissions',
                    userRole: req.user.role,
                    requiredRoles: allowedRoles
                });
            }

            next();
        } catch (error) {
            console.error('[ROLE CHECK] Error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    };
};

/**
 * Check if user is authenticated (already done by authenticateJWT)
 * This is a secondary check
 */
const requireAuth = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    next();
};

module.exports = {
    adminRoleCheck,
    requireAuth
};
