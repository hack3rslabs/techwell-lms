const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createSuperAdmin() {
    try {
        console.log('Connecting to database...');
        
        // Find the "Super Admin" system role
        const superAdminRole = await prisma.systemRole.findFirst({
            where: { name: 'Super Admin' }
        });

        if (!superAdminRole) {
            throw new Error('Super Admin system role not found in the database. Please run your seed script first.');
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash('T3chwell@10', 12);
        const email = 'uttam@techwell.co.in';

        // Check if user already exists
        let user = await prisma.user.findUnique({
            where: { email }
        });

        if (user) {
            console.log(`User ${email} already exists. Upgrading to Super Admin...`);
            user = await prisma.user.update({
                where: { email },
                data: {
                    password: hashedPassword,
                    role: 'SUPER_ADMIN',
                    systemRoleId: superAdminRole.id,
                    isActive: true,
                    emailVerified: true
                }
            });
        } else {
            console.log(`Creating new user ${email}...`);
            user = await prisma.user.create({
                data: {
                    email,
                    password: hashedPassword,
                    name: 'Uttam Techwell',
                    role: 'SUPER_ADMIN',
                    systemRoleId: superAdminRole.id,
                    isActive: true,
                    emailVerified: true
                }
            });
        }

        console.log('\n✅ Successfully created/updated the Super Admin account!');
        console.log(`Email: ${user.email}`);
        console.log(`Role: ${user.role}`);

    } catch (error) {
        console.error('❌ Error creating Super Admin:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

createSuperAdmin();
