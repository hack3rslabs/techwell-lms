const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const permissions = [
    { name: 'Dashboard Access', code: 'DASHBOARD', module: 'General' },
    { name: 'Welcome Page', code: 'WELCOME', module: 'General' },
    { name: 'User Management', code: 'USERS', module: 'General' },
    { code: 'COURSES', name: 'Course Management', module: 'ADMIN' },
    { code: 'FINANCE', name: 'Financial Management', module: 'ADMIN' },
    { code: 'TICKETS', name: 'Support Tickets', module: 'ADMIN' },
    { code: 'SETTINGS', name: 'System Settings', module: 'ADMIN' },
    { code: 'LEADS', name: 'Leads & CRM', module: 'ADMIN' },
    { code: 'BLOGS', name: 'Blog Management', module: 'ADMIN' },
    { code: 'CERTIFICATES', name: 'Certificates', module: 'ADMIN' },
    { code: 'REPORTS', name: 'Reports & Analytics', module: 'ADMIN' },
    { code: 'SYSTEM_LOGS', name: 'System Logs', module: 'ADMIN' },
];

const roles = [
    {
        name: 'Super Admin',
        permissions: permissions.map(p => p.code)
    },
    {
        name: 'Admin',
        permissions: permissions.map(p => p.code)
    },
    {
        name: 'Institute Admin',
        permissions: ['WELCOME', 'DASHBOARD', 'USERS', 'COURSES', 'FINANCE', 'TICKETS', 'LEADS']
    },
    {
        name: 'Instructor',
        permissions: ['WELCOME', 'DASHBOARD', 'COURSES', 'TICKETS']
    },
    {
        name: 'Student',
        permissions: ['WELCOME', 'COURSES', 'TICKETS']
    },
    {
        name: 'Staff',
        permissions: ['WELCOME', 'DASHBOARD', 'USERS', 'COURSES', 'TICKETS']
    },
    {
        name: 'Employer',
        permissions: ['WELCOME', 'DASHBOARD', 'USERS', 'COURSES']
    }
];

async function main() {
    console.log('🌱 Starting RBAC-Only seed...');

    // 1. Seed Features
    console.log('  - Seeding Features...');
    for (const p of permissions) {
        await prisma.systemFeature.upsert({
            where: { code: p.code },
            update: { name: p.name, module: p.module },
            create: {
                name: p.name,
                code: p.code,
                module: p.module
            }
        });
    }

    // 2. Seed Roles
    console.log('  - Seeding Roles...');
    for (const r of roles) {
        const dbRole = await prisma.systemRole.upsert({
            where: { name: r.name },
            update: { isSystem: true },
            create: {
                name: r.name,
                isSystem: true,
                description: `${r.name} system role`
            }
        });

        // 3. Link Permissions to Roles
        for (const p of permissions) {
            const hasPermission = r.permissions.includes(p.code);
            const feature = await prisma.systemFeature.findUnique({ where: { code: p.code } });
            
            await prisma.rolePermission.upsert({
                where: {
                    roleId_featureId: {
                        roleId: dbRole.id,
                        featureId: feature.id
                    }
                },
                update: {
                    canRead: hasPermission,
                    canWrite: hasPermission,
                    isDisabled: !hasPermission
                },
                create: {
                    roleId: dbRole.id,
                    featureId: feature.id,
                    canRead: hasPermission,
                    canWrite: hasPermission,
                    isDisabled: !hasPermission
                }
            });
        }
    }

    // 4. Link Existing Super Admins (Emergency Fix)
    const superAdminRole = await prisma.systemRole.findUnique({ where: { name: 'Super Admin' } });
    if (superAdminRole) {
        await prisma.user.updateMany({
            where: { role: 'SUPER_ADMIN', systemRoleId: null },
            data: { systemRoleId: superAdminRole.id }
        });
        console.log('  - Linked existing Super Admins to the system role.');
    }

    console.log('✅ RBAC Seeding completed successfully!');
}

main()
    .catch((e) => {
        console.error('❌ Seed error:', e.message);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
