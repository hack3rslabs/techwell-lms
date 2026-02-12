const axios = require('axios');

async function testRBAC() {
    const adminEmail = 'admin@techwell.com'; // Super Admin
    const password = 'password123';
    let token;

    try {
        // 1. Login
        console.log('Logging in...');
        const loginRes = await axios.post('http://localhost:5001/api/auth/login', {
            email: adminEmail,
            password: password
        });
        token = loginRes.data.token;
        console.log('Login successful. Token acquired.');

        // 2. List Permissions
        console.log('\nFetching Permissions...');
        const permRes = await axios.get('http://localhost:5001/api/rbac/permissions', {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log(`Found ${permRes.data.length} permissions.`);

        // 3. Create a Role
        console.log('\nCreating "Junior Admin" Role...');
        const roleRes = await axios.post('http://localhost:5001/api/rbac/roles', {
            name: `Junior Admin ${Date.now()}`,
            description: 'Can view users and courses',
            permissions: ['VIEW_USERS', 'VIEW_COURSES']
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Role Created:', roleRes.data.name);

        // 4. List Roles
        console.log('\nListing Roles...');
        const rolesRes = await axios.get('http://localhost:5001/api/rbac/roles', {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log(`Found ${rolesRes.data.length} roles.`);

    } catch (error) {
        console.error('RBAC Test Failed:', error.response ? error.response.data : error.message);
    }
}

testRBAC();
