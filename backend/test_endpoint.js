const { PrismaClient } = require('@prisma/client');
const axios = require('axios');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function test() {
    const email = 'verify_test@example.com';
    try {
        // Ensure user exists
        let user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            const hashedPassword = await bcrypt.hash('password123', 12);
            user = await prisma.user.create({
                data: {
                    email,
                    password: hashedPassword,
                    name: 'Test User',
                    isActive: true
                }
            });
            console.log('Created test user');
        }

        console.log('--- Step 1: Forgot Password ---');
        const forgotRes = await axios.post('http://localhost:5000/api/auth/forgot-password', { email });
        console.log('Forgot Success:', forgotRes.data);

        // In a real scenario, we'd get the OTP from the email.
        // Since we are running on the same server, we can't easily access the in-memory Map.
        // But I can check the console logs of the backend.
        
    } catch (error) {
        console.error('Error:', error.response ? error.response.status : error.message, error.response ? error.response.data : '');
    } finally {
        await prisma.$disconnect();
    }
}

test();
