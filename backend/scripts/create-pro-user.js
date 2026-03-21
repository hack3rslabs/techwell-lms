const { Client } = require('pg');
const bcrypt = require('bcryptjs');

async function createProUser() {
    // Database connection from .env
    const client = new Client({
        connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/techwell_lms'
    });

    try {
        await client.connect();
        console.log('Connected to database...');

        // Hash password
        const hashedPassword = await bcrypt.hash('student123', 10);

        // Check if user exists
        const checkResult = await client.query(
            'SELECT id FROM "User" WHERE email = $1',
            ['student@techwell.com']
        );

        if (checkResult.rows.length > 0) {
            // Update existing user
            await client.query(
                `UPDATE "User" 
         SET password = $1, 
             role = $2, 
             "hasUnlimitedInterviews" = $3,
             name = $4,
             dob = $5,
             qualification = $6,
             college = $7,
             "updatedAt" = NOW()
         WHERE email = $8`,
                [
                    hashedPassword,
                    'STUDENT',
                    true,
                    'Test Student',
                    '2000-01-01',
                    'B.Tech Computer Science',
                    'Test University',
                    'student@techwell.com'
                ]
            );
            console.log('✅ User updated successfully!');
        } else {
            // Create new user
            await client.query(
                `INSERT INTO "User" (
          id, email, password, name, role, "hasUnlimitedInterviews",
          dob, qualification, college, "createdAt", "updatedAt"
         ) VALUES (
          gen_random_uuid()::text, $1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW()
         )`,
                [
                    'student@techwell.com',
                    hashedPassword,
                    'Test Student',
                    'STUDENT',
                    true,
                    '2000-01-01',
                    'B.Tech Computer Science',
                    'Test University'
                ]
            );
            console.log('✅ User created successfully!');
        }

        // Verify
        const result = await client.query(
            'SELECT id, email, name, role, "hasUnlimitedInterviews" FROM "User" WHERE email = $1',
            ['student@techwell.com']
        );

        console.log('\n📋 User Details:');
        console.log('================');
        console.log('User status: Ready');
        console.log('\n✅ Pro user ready for testing!');

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await client.end();
    }
}

createProUser();
