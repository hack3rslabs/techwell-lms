const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate, authorize, checkPermission } = require('../middleware/auth');
const router = express.Router();
const prisma = new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL } } });

// ================= PERMISSIONS =================

/**
 * @route   GET /api/rbac/permissions
 * @desc    Get all available system permissions
 * @access  Private/Admin
 */
router.get('/permissions', authenticate, checkPermission('MANAGE_ROLES'), async (req, res, next) => {
    try {
        const permissions = await prisma.systemPermission.findMany({
            orderBy: { module: 'asc' }
        });
        res.json(permissions);
    } catch (error) {
        next(error);
    }
});

// ================= ROLES =================

/**
 * @route   GET /api/rbac/roles
 * @desc    Get all system roles
 * @access  Private/Admin
 */
router.get('/roles', authenticate, (req, res, next) => {
    // Both role managers and user managers should be able to see roles
    const hasPermission = req.user.permissions.includes('ALL') ||
                          req.user.permissions.includes('MANAGE_ROLES') || 
                          req.user.permissions.includes('MANAGE_USERS');
                          
    if (hasPermission) {
        return next();
    }
    return res.status(403).json({ error: 'Missing permission: MANAGE_ROLES or MANAGE_USERS' });
}, async (req, res, next) => {
    try {
        const roles = await prisma.systemRole.findMany({
            orderBy: { name: 'asc' },
            include: {
                _count: { select: { users: true } }
            }
        });
        res.json(roles);
    } catch (error) {
        next(error);
    }
});

/**
 * @route   POST /api/rbac/roles
 * @desc    Create a new role
 * @access  Private/Admin
 */
router.post('/roles', authenticate, checkPermission('MANAGE_ROLES'), async (req, res, next) => {
    try {
        const { name, description, permissions } = req.body;

        if (!name) return res.status(400).json({ error: 'Role name is required' });

        const role = await prisma.systemRole.create({
            data: {
                name,
                description,
                permissions: permissions || [],
                isSystem: false // User created roles are not system roles
            }
        });

        res.status(201).json(role);
    } catch (error) {
        next(error);
    }
});

/**
 * @route   PUT /api/rbac/roles/:id
 * @desc    Update a role (permissions, name)
 * @access  Private/Admin
 */
router.put('/roles/:id', authenticate, checkPermission('MANAGE_ROLES'), async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, description, permissions } = req.body;

        // Check if role exists
        const existingRole = await prisma.systemRole.findUnique({ where: { id } });
        if (!existingRole) return res.status(404).json({ error: 'Role not found' });

        const updateData = { permissions };
        if (name) updateData.name = name;
        if (description !== undefined) updateData.description = description;

        const role = await prisma.systemRole.update({
            where: { id },
            data: updateData
        });

        res.json(role);
    } catch (error) {
        next(error);
    }
});

/**
 * @route   DELETE /api/rbac/roles/:id
 * @desc    Delete a role
 * @access  Private/Admin
 */
router.delete('/roles/:id', authenticate, checkPermission('MANAGE_ROLES'), async (req, res, next) => {
    try {
        const { id } = req.params;

        const role = await prisma.systemRole.findUnique({ where: { id } });
        if (!role) return res.status(404).json({ error: 'Role not found' });

        if (role.isSystem && !req.user.permissions.includes('ALL')) {
            return res.status(403).json({ error: 'Only users with ALL permission can delete system roles' });
        }

        // Check if assigned to users
        const userCount = await prisma.user.count({ where: { systemRoleId: id } });
        if (userCount > 0) {
            return res.status(400).json({ error: `Cannot delete role assigned to ${userCount} users. Reassign them first.` });
        }

        await prisma.systemRole.delete({ where: { id } });
        res.json({ message: 'Role deleted' });
    } catch (error) {
        next(error);
    }
});

// ================= USER ASSIGNMENT =================

/**
 * @route   POST /api/rbac/assign
 * @desc    Assign a role to a user
 * @access  Private/Admin
 */
router.post('/assign', authenticate, checkPermission('MANAGE_USERS'), async (req, res, next) => {
    try {
        const { userId, roleId } = req.body;

        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) return res.status(404).json({ error: 'User not found' });

        const role = await prisma.systemRole.findUnique({ where: { id: roleId } });
        if (!role) return res.status(404).json({ error: 'Role not found' });

        // Update User
        // If the role matches one of the Enums, we should probably sync user.role too for backward compat
        // But for now, just setting systemRoleId is enough as middleware handles it.
        await prisma.user.update({
            where: { id: userId },
            data: { systemRoleId: roleId }
        });

        res.json({ message: 'Role assigned successfully', user: { id: userId, role: role.name } });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
