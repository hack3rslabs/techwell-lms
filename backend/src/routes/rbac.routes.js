const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate, checkPermission } = require('../middleware/auth');
const router = express.Router();
const prisma = new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL } } });

// ================= FEATURES =================

/**
 * @route   GET /api/rbac/features
 * @desc    Get all available system features
 * @access  Public (for Role Creation UI)
 */
router.get('/features', async (req, res, next) => {
    try {
        const features = await prisma.systemFeature.findMany({
            orderBy: [{ module: 'asc' }, { name: 'asc' }]
        });
        res.json(features);
    } catch (error) {
        next(error);
    }
});

// ================= ROLES =================
// Note: Roles are now FIXED per requirement. 
// Creation and Deletion of roles are disabled via API.

/**
 * @route   GET /api/rbac/roles
 * @desc    Get all system roles (excluding Student)
 * @access  Private/Admin
 */
router.get('/roles', authenticate, async (req, res, next) => {
    try {
        const roles = await prisma.systemRole.findMany({
            // Show all predefined roles
            include: {
                rolePermissions: {
                    include: {
                        feature: true
                    }
                },
                _count: { select: { users: true } }
            },
            orderBy: { name: 'asc' }
        });
        res.json(roles);
    } catch (error) {
        next(error);
    }
});

/**
 * @route   PUT /api/rbac/roles/:id
 * @desc    Update role permissions (Strict: Cannot change role name)
 * @access  Private/Admin
 */
router.put('/roles/:id', authenticate, checkPermission('SETTINGS'), async (req, res, next) => {
    try {
        const { id } = req.params;
        const { permissions, description } = req.body;

        const existingRole = await prisma.systemRole.findUnique({ where: { id } });
        if (!existingRole) return res.status(404).json({ error: 'Role not found' });
        if (existingRole.name.replace(/[^a-z0-9]/gi, '').toUpperCase() === 'SUPERADMIN') {
            return res.status(403).json({ error: 'Super Admin role permissions are protected and cannot be edited.' });
        }
        
        // Safety check: Don't allow renaming system roles via this endpoint
        // only description and permissions are allowed.

        const role = await prisma.$transaction(async (tx) => {
            const updatedRole = await tx.systemRole.update({
                where: { id },
                data: {
                    description // description is okay to update
                }
            });

            if (permissions && Array.isArray(permissions)) {
                // Delete existing permissions and recreate based on new configuration
                await tx.rolePermission.deleteMany({
                    where: { roleId: id }
                });

                await tx.rolePermission.createMany({
                    data: permissions.map(p => ({
                        roleId: id,
                        featureId: p.featureId,
                        canRead: p.canRead || false,
                        canWrite: p.canWrite || false,
                        isDisabled: p.isDisabled || false
                    }))
                });
            }

            return tx.systemRole.findUnique({
                where: { id },
                include: { rolePermissions: true }
            });
        });

        res.json(role);
    } catch (error) {
        next(error);
    }
});

/**
 * @route   POST /api/rbac/roles
 * @desc    Create a new custom role
 * @access  Private/Admin
 */
router.post('/roles', authenticate, checkPermission('USERS_ROLES'), async (req, res, next) => {
    try {
        const { name, description, permissions } = req.body;
        
        if (!name) return res.status(400).json({ error: 'Role name is required' });
        
        const existing = await prisma.systemRole.findUnique({ where: { name } });
        if (existing) return res.status(400).json({ error: 'Role name already exists' });

        const role = await prisma.$transaction(async (tx) => {
            const newRole = await tx.systemRole.create({
                data: {
                    name,
                    description,
                    isSystem: false
                }
            });

            if (permissions && Array.isArray(permissions)) {
                await tx.rolePermission.createMany({
                    data: permissions.map(p => ({
                        roleId: newRole.id,
                        featureId: p.featureId,
                        canRead: p.canRead || false,
                        canWrite: p.canWrite || false,
                        isDisabled: p.isDisabled || false
                    }))
                });
            }

            return tx.systemRole.findUnique({
                where: { id: newRole.id },
                include: { rolePermissions: true }
            });
        });

        res.status(201).json(role);
    } catch (error) {
        next(error);
    }
});

/**
 * @route   DELETE /api/rbac/roles/:id
 * @desc    Delete a custom role
 * @access  Private/Admin
 */
router.delete('/roles/:id', authenticate, checkPermission('USERS_ROLES'), async (req, res, next) => {
    try {
        const { id } = req.params;
        const role = await prisma.systemRole.findUnique({ where: { id } });
        
        if (!role) return res.status(404).json({ error: 'Role not found' });
        if (role.isSystem) return res.status(403).json({ error: 'Cannot delete system roles' });
        
        const userCount = await prisma.user.count({ where: { systemRoleId: id } });
        if (userCount > 0) return res.status(400).json({ error: 'Cannot delete role with assigned users. Reassign users first.' });

        await prisma.$transaction(async (tx) => {
            await tx.rolePermission.deleteMany({ where: { roleId: id } });
            await tx.systemRole.delete({ where: { id } });
        });
        
        res.json({ message: 'Role deleted successfully' });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
