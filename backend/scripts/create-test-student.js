const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createTestStudent() {
    try {
        console.log('Creating test student user...');

        // Hash password
        const hashedPassword = await bcrypt.hash('student123', 10);

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email: 'student@techwell.com' }
        });

        if (existingUser) {
            console.log('User already exists, updating...');

            // Update existing user
            const user = await prisma.user.update({
                where: { email: 'student@techwell.com' },
                data: {
                    password: hashedPassword,
                    role: 'STUDENT',
                    hasUnlimitedInterviews: true,
                    name: 'Test Student',
                    dob: '2000-01-01',
                    qualification: 'B.Tech Computer Science',
                    college: 'Test University'
                }
            });

            console.log('✅ Test student updated successfully!');
            console.log('Plan: Pro (Unlimited Interviews)');
        } else {
            // Create new user
            const user = await prisma.user.create({
                data: {
                    email: 'student@techwell.com',
                    password: hashedPassword,
                    name: 'Test Student',
                    role: 'STUDENT',
                    hasUnlimitedInterviews: true,
                    dob: '2000-01-01',
                    qualification: 'B.Tech Computer Science',
                    college: 'Test University'
                }
            });

            console.log('✅ Test student created successfully!');
            console.log('Plan: Pro (Unlimited Interviews)');
        }

    } catch (error) {
        console.error('Error creating test student:', error);
    } finally {
        await prisma.$disconnect();
    }
}

createTestStudent();
