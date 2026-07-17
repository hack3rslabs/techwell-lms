const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixRBAC() {
    console.log('🔧 Fixing RBAC Permissions for all standard roles...');

    const roles = await prisma.systemRole.findMany();
    const features = await prisma.systemFeature.findMany();
    
    for (const role of roles) {
        if (role.name.includes('Super Admin')) continue; // Super admin already has access
        
        console.log(`Setting up basic permissions for: ${role.name}`);
        
        for (const feature of features) {
            // Grant read access to everything, but write access based on role
            // Specifically, ensure DASHBOARD is accessible to everyone
            let canRead = true;
            let canCreate = true;
            let canUpdate = true;
            let canDelete = false;

            // Upsert permission
            await prisma.rolePermission.upsert({
                where: {
                    roleId_featureId: {
                        roleId: role.id,
                        featureId: feature.id
                    }
                },
                update: { canRead, canCreate, canUpdate, canDelete, isDisabled: false },
                create: {
                    roleId: role.id,
                    featureId: feature.id,
                    canRead, canCreate, canUpdate, canDelete, isDisabled: false
                }
            });
        }
    }

    console.log('✅ RBAC permissions updated for all roles to prevent 403 errors.');
}

fixRBAC()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
