const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function diagnose() {
    console.log('🔍 Starting RBAC Diagnostic...');

    // 1. Check Features
    const featuresCount = await prisma.systemFeature.count();
    console.log(`- Features in DB: ${featuresCount}`);
    if (featuresCount === 0) {
        console.log('❌ ERROR: No features found. You must run "npx prisma db seed"');
    }

    // 2. Check Roles
    const roles = await prisma.systemRole.findMany();
    console.log(`- System Roles in DB: ${roles.length} (${roles.map(r => r.name).join(', ')})`);
    if (roles.length === 0) {
        console.log('❌ ERROR: No roles found. You must run "npx prisma db seed"');
    }

    // 3. Find "Super Admin" system role
    const superAdminRole = roles.find(r => r.name === 'Super Admin' || r.name === 'SUPER_ADMIN');
    if (!superAdminRole) {
        console.log('❌ ERROR: "Super Admin" system role not found in SystemRole table.');
    } else {
        console.log(`✅ Found Super Admin Role ID: ${superAdminRole.id}`);
        
        // 4. Check for users with missing systemRoleId
        const usersWithoutRole = await prisma.user.findMany({
            where: { systemRoleId: null },
            select: { id: true, email: true, role: true }
        });

        if (usersWithoutRole.length > 0) {
            console.log(`⚠️ Found ${usersWithoutRole.length} users with no System Role link. Fixing...`);
            
            for (const user of usersWithoutRole) {
                // Find matching system role
                let targetRole = roles.find(r => r.name.toUpperCase() === user.role.toUpperCase()) 
                                || roles.find(r => r.name.replace(' ', '').toUpperCase() === user.role.toUpperCase());
                
                if (targetRole) {
                    await prisma.user.update({
                        where: { id: user.id },
                        data: { systemRoleId: targetRole.id }
                    });
                    console.log(`   ✅ Linked ${user.email} (${user.role}) to System Role: ${targetRole.name}`);
                } else {
                    console.log(`   ❌ Could not find a matching System Role for user role: ${user.role}`);
                }
            }
        } else {
            console.log('✅ All users are correctly linked to System Roles.');
        }
    }

    console.log('🏁 Diagnostic complete.');
}

diagnose()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
