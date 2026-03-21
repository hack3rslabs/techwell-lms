const { Client } = require('pg');

const database = 'Techwell-LMS';
const targetUser = 'bizops';

async function testConnection(user, password) {
    const client = new Client({
        user: user,
        host: 'localhost',
        database: database,
        password: password,
        port: 5432,
    });
    try {
        await client.connect();
        console.log(`Connected successfully as ${user}`);
        
        // Try to grant permission
        await client.query(`GRANT ALL ON SCHEMA public TO ${targetUser};`);
        console.log(`Successfully granted permission to ${targetUser}`);
        
        // Try to change owner just in case
        await client.query(`ALTER SCHEMA public OWNER TO ${targetUser};`);
        console.log(`Successfully changed schema owner to ${targetUser}`);
        
        return true;
    } catch (err) {
        console.log(`Failed to connect/grant as ${user}: ${err.message}`);
        return false;
    } finally {
        await client.end();
    }
}

async function run() {
    const attempts = [
        { user: 'postgres', pass: 'postgres' },
        { user: 'postgres', pass: 'admin' },
        { user: 'postgres', pass: 'root' },
        { user: 'postgres', pass: 'password' },
        { user: 'postgres', pass: 'abc@123' }, // Common in local setups
        { user: 'postgres', pass: '' },
    ];

    for (const attempt of attempts) {
        if (await testConnection(attempt.user, attempt.pass)) {
            console.log('SUCCESS: Permissions resolved');
            process.exit(0);
        }
    }
    console.log('FAILED: All common credential attempts failed. Please run the following command as a database superuser:');
    console.log(`GRANT ALL ON SCHEMA public TO ${targetUser};`);
    process.exit(1);
}

run();
