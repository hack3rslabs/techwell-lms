const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Migrating RolePermissions...');
    
    // Find all RolePermissions where canWrite is true
    const permissions = await prisma.rolePermission.findMany({
        where: { canWrite: true }
    });

    console.log(`Found ${permissions.length} permissions to migrate.`);

    for (const p of permissions) {
        await prisma.rolePermission.update({
            where: { id: p.id },
            data: {
                canCreate: true,
                canUpdate: true,
                canDelete: true,
            }
        });
    }

    console.log('Migration complete.');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
