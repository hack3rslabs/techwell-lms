const { Client } = require('pg');
require('dotenv').config();

async function test() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
    });

    try {
        await client.connect();
        console.log('✅ Connected to database successfully!');
        
        const res = await client.query('SELECT table_name FROM information_schema.tables WHERE table_schema = \'public\'');
        console.log('Tables in public schema:', res.rows.map(r => r.table_name));
        
    } catch (err) {
        console.error('❌ Database connection error:', err.message);
    } finally {
        await client.end();
    }
}

test();
