const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

async function testRBACFlow() {
    try {
        console.log('--- Starting RBAC Flow Test ---');

        // 1. Login as Super Admin
        console.log('\n[1] Logging in as Super Admin...');
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: 'superadmin@techwell.co.in',
            password: 'password123'
        }, {
            headers: { 'Content-Type': 'application/json' }
        });
        
        // Extract cookies to maintain session since JWT is in httpOnly cookie
        const cookies = loginRes.headers['set-cookie'];
        const axiosConfig = {
            headers: {
                'Cookie': cookies,
                'Content-Type': 'application/json'
            }
        };
        console.log('✅ Super Admin login successful');

        // 2. Fetch Features to get the ID for 'USERS' and 'BLOGS'
        console.log('\n[2] Fetching System Features...');
        const featuresRes = await axios.get(`${API_URL}/rbac/features`, axiosConfig);
        const features = featuresRes.data;
        const usersFeature = features.find(f => f.code === 'USERS');
        const blogsFeature = features.find(f => f.code === 'BLOGS');
        
        if (!usersFeature || !blogsFeature) {
            throw new Error("Required features USERS or BLOGS not found in DB.");
        }
        console.log(`✅ Features found. USERS: ${usersFeature.id}, BLOGS: ${blogsFeature.id}`);

        // 3. Create a Custom Role (Content Manager)
        console.log('\n[3] Creating custom role "Content Manager"...');
        const rolePayload = {
            name: "Content Manager Test " + Date.now(),
            description: "Can manage blogs only.",
            permissions: [
                {
                    featureId: blogsFeature.id,
                    canRead: true,
                    canCreate: true,
                    canUpdate: true,
                    canDelete: false,
                    isDisabled: false
                }
            ]
        };
        
        const createRoleRes = await axios.post(`${API_URL}/rbac/roles`, rolePayload, axiosConfig);
        const customRole = createRoleRes.data.role || createRoleRes.data; 
        const roleId = customRole.id;
        console.log(`✅ Role created successfully with ID: ${roleId}`);

        // 4. Create a User with the Custom Role
        console.log('\n[4] Creating user with the "Content Manager" role...');
        const testUserEmail = `contentmanager_${Date.now()}@test.com`;
        const testUserPassword = `Password123!`;
        const createUserRes = await axios.post(`${API_URL}/users`, {
            email: testUserEmail,
            password: testUserPassword,
            name: "Content Manager",
            roleId: roleId
        }, axiosConfig);
        console.log(`✅ User created successfully: ${createUserRes.data.user.email}`);
        
        // 5. Test Access using the newly created User
        console.log('\n[5] Logging in as the new Content Manager...');
        const testUserLoginRes = await axios.post(`${API_URL}/auth/login`, {
            email: testUserEmail,
            password: testUserPassword
        });
        const testUserCookies = testUserLoginRes.headers['set-cookie'];
        const testUserConfig = {
            headers: {
                'Cookie': testUserCookies,
                'Content-Type': 'application/json'
            }
        };
        console.log('✅ Content Manager login successful');

        // 6. Test Access Control
        console.log('\n[6] Testing Access Control...');
        
        // Should FAIL to access /api/users
        try {
            await axios.get(`${API_URL}/users`, testUserConfig);
            console.error('❌ FAILURE: Content Manager should NOT be able to access Users list.');
        } catch (error) {
            if (error.response && error.response.status === 403) {
                console.log('✅ SUCCESS: Content Manager correctly blocked from accessing Users (403 Forbidden).');
            } else {
                console.error(`❌ FAILURE: Expected 403, got ${error.response?.status}`);
            }
        }
        
        // We assume blogs is protected by checkPermission('BLOGS'). 
        // If it isn't, this part might just succeed anyway. Let's try it.
        try {
            await axios.get(`${API_URL}/blogs`, testUserConfig);
            console.log('✅ SUCCESS: Content Manager successfully accessed Blogs.');
        } catch (error) {
            console.error(`❌ FAILURE: Content Manager could not access Blogs. Status: ${error.response?.status}`);
        }

        console.log('\n--- RBAC Flow Test Completed Successfully! ---');

    } catch (error) {
        console.error('\n❌ Test Failed:');
        if (error.response) {
            console.error(error.response.data);
        } else {
            console.error(error.message);
        }
    }
}

testRBACFlow();
