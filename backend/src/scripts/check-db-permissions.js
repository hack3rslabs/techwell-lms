const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
    connectionString: process.env.DATABASE_URL
});

async function run() {
    try {
        await client.connect();
        console.log('Connected to database successfully.');
        
        const userRes = await client.query('SELECT current_user');
        console.log('Current User:', userRes.rows[0].current_user);

        const permRes = await client.query(`
            SELECT has_schema_privilege(current_user, 'public', 'CREATE') as can_create
        `);
        console.log('--- PERMISSION CHECK ---');
        console.log('CAN_CREATE_ON_PUBLIC:', permRes.rows[0].can_create);
        console.log('------------------------');

        const tableRes = await client.query(`
            SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname = 'public'
        `);
        console.log('--- TABLES IN PUBLIC SCHEMA ---');
        if (tableRes.rows.length === 0) {
            console.log('No tables found.');
        } else {
            tableRes.rows.forEach(r => console.log('-', r.tablename));
        }
        console.log('-------------------------------');

        if (permRes.rows[0].can_create) {
            console.log('SUCCESS: You have permission to create tables in the public schema.');
        } else {
            console.log('WARNING: You do NOT have permission to create tables in the public schema.');
            console.log('You may need to run: GRANT ALL ON SCHEMA public TO ' + userRes.rows[0].current_user + ';');
        }

    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await client.end();
    }
}

run();
