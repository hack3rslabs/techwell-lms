const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const permissions = [
    { code: 'MANAGE_USERS', name: 'Manage Users', module: 'USERS' },
    { code: 'VIEW_USERS', name: 'View Users', module: 'USERS' },
    { code: 'MANAGE_COURSES', name: 'Manage Courses', module: 'COURSES' },
    { code: 'VIEW_COURSES', name: 'View Courses', module: 'COURSES' },
    { code: 'PUBLISH_COURSE', name: 'Publish Course', module: 'COURSES' },
    { code: 'VIEW_FINANCE', name: 'View Finance', module: 'FINANCE' },
    { code: 'MANAGE_TICKETS', name: 'Manage Tickets', module: 'TICKETS' },
    { code: 'VIEW_TICKETS', name: 'View Tickets', module: 'TICKETS' },
    { code: 'MANAGE_ROLES', name: 'Manage Roles', module: 'SETTINGS' },
    { code: 'MANAGE_SETTINGS', name: 'Manage Settings', module: 'SETTINGS' },
];

const roles = [
    {
        name: 'Super Admin',
        isSystem: true,
        permissions: permissions.map(p => p.code) // All permissions
    },
    {
        name: 'Admin',
        isSystem: true,
        permissions: permissions.map(p => p.code).filter(p => p !== 'MANAGE_ROLES')
    },
    {
        name: 'Institute Admin',
        isSystem: true,
        permissions: ['MANAGE_USERS', 'VIEW_USERS', 'MANAGE_COURSES', 'VIEW_COURSES', 'VIEW_FINANCE', 'MANAGE_TICKETS', 'VIEW_TICKETS']
    },
    {
        name: 'Instructor',
        isSystem: true,
        permissions: ['VIEW_COURSES', 'MANAGE_COURSES', 'VIEW_TICKETS']
    },
    {
        name: 'Student',
        isSystem: true,
        permissions: ['VIEW_COURSES', 'VIEW_TICKETS']
    },
    {
        name: 'Support Staff',
        isSystem: false,
        permissions: ['VIEW_USERS', 'MANAGE_TICKETS', 'VIEW_TICKETS', 'VIEW_COURSES']
    }
];

async function seed() {
    console.log('Seeding Permissions...');
    for (const p of permissions) {
        await prisma.systemPermission.upsert({
            where: { code: p.code },
            update: p,
            create: p
        });
    }

    console.log('Seeding Roles...');
    for (const r of roles) {
        await prisma.systemRole.upsert({
            where: { name: r.name },
            update: { permissions: r.permissions },
            create: {
                name: r.name,
                isSystem: r.isSystem,
                permissions: r.permissions
            }
        });
    }

    // Link existing Super Admin to System Role
    const superAdminRole = await prisma.systemRole.findUnique({ where: { name: 'Super Admin' } });
    if (superAdminRole) {
        await prisma.user.updateMany({
            where: { role: 'SUPER_ADMIN' },
            data: { systemRoleId: superAdminRole.id }
        });
        console.log('Linked Super Admins to System Role.');
    }

    console.log('Seeding Complete.');
}

seed()
    .catch((e) => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
