const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
    connectionString: process.env.DATABASE_URL
});

async function run() {
    try {
        await client.connect();
        const res = await client.query(`
            SELECT tablename FROM pg_catalog.pg_tables 
            WHERE schemaname = 'public' 
            ORDER BY tablename
        `);
        console.log('TOTAL TABLES:', res.rows.length);
        console.log('--- TABLES ---');
        res.rows.forEach(r => console.log(r.tablename));
        console.log('--------------');
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await client.end();
    }
}

run();
