const { Client } = require('pg');
require('dotenv').config();

async function test() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
    });

    try {
        await client.connect();
        console.log('✅ Connected to Techwell-LMS successfully!');
        
        await client.query('CREATE TABLE IF NOT EXISTS test_table (id serial primary key, name text)');
        console.log('✅ Created test_table successfully!');
        
        await client.query('DROP TABLE test_table');
        console.log('✅ Dropped test_table successfully!');
        
    } catch (err) {
        console.error('❌ Permission error:', err.message);
    } finally {
        await client.end();
    }
}

test();
