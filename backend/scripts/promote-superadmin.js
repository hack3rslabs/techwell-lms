const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
    console.log("Starting safe promotion process...");
    
    const emailsToPromote = ['superadmin@techwell.co.in', 'uttam@techwell.co.in'];
    const password = await bcrypt.hash('@dmin#098$$', 12); // Enforced secure password for super admins
    
    // Find the master Super Admin System Role
    const superAdminRole = await prisma.systemRole.findUnique({ where: { name: 'Super Admin' } });

    for (const email of emailsToPromote) {
        let user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            user = await prisma.user.create({
                data: {
                    email,
                    password,
                    name: 'Super Admin',
                    role: 'SUPER_ADMIN',
                    systemRoleId: superAdminRole?.id,
                    isActive: true,
                    emailVerified: true,
                }
            });
            console.log(`✅ SUCCESS: Created user ${email} as SUPER_ADMIN from scratch with requested password.`);
        } else {
            await prisma.user.update({
                where: { email },
                data: { 
                    role: 'SUPER_ADMIN', 
                    systemRoleId: superAdminRole?.id,
                    password: password // Enforce new password even if they exist
                }
            });
            console.log(`✅ SUCCESS: Promoted existing user ${email} to SUPER_ADMIN and updated password securely.`);
        }
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
