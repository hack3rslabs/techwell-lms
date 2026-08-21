const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

const USERS = {
    'SUPER ADMIN': { email: 'admin@techwell.co.in', role: 'SUPER_ADMIN', password: 'password123' },
    'INSTRUCTOR': { email: 'instructor@techwell.co.in', role: 'INSTRUCTOR', password: 'password123' },
    'STUDENT': { email: 'student@techwell.co.in', role: 'STUDENT', password: 'password123' },
    'EMPLOYER': { email: 'employer@techwell.co.in', role: 'EMPLOYER', password: 'password123' }
};

async function testLogin(roleName, user) {
    try {
        const res = await axios.post(`${API_URL}/auth/login`, {
            email: user.email,
            password: user.password
        });
        
        if (res.data && res.data.token && res.data.user.role === user.role) {
            console.log(`[PASS] Login successful for ${roleName}. Role verified: ${res.data.user.role}`);
            return res.data.token;
        } else {
            console.error(`[FAIL] Login for ${roleName} succeeded but role mismatch. Expected ${user.role}, got ${res.data?.user?.role}`);
            return null;
        }
    } catch (err) {
        console.error(`[FAIL] Login failed for ${roleName}:`, err.response?.data?.message || err.message);
        return null;
    }
}

async function testProtectedRoute(name, url, token, expectedStatus) {
    try {
        const res = await axios.get(url, { headers: { Authorization: `Bearer ${token}` } });
        if (expectedStatus === 200 || expectedStatus === 201) {
            console.log(`[PASS] Access granted to ${name} as expected.`);
        } else {
            console.error(`[FAIL] Access GRANTED to ${name} but expected ${expectedStatus}. Status: ${res.status}`);
        }
    } catch (err) {
        const status = err.response?.status;
        if (status === expectedStatus || status === 401 || status === 403) {
            console.log(`[PASS] Access correctly denied (Status ${status}) to ${name} as expected.`);
        } else {
            console.error(`[FAIL] Access denied to ${name} with wrong status. Expected ${expectedStatus}, got ${status}. Msg: ${err.response?.data?.message || err.message}`);
        }
    }
}

async function runTests() {
    console.log("--- STARTING E2E RBAC TESTS ---");
    const tokens = {};
    
    for (const [name, user] of Object.entries(USERS)) {
        tokens[name] = await testLogin(name, user);
    }
    
    console.log("\n--- TESTING ADMIN ROUTES ---");
    if (tokens['SUPER ADMIN']) await testProtectedRoute('Admin endpoint (Admin User)', `${API_URL}/admin/stats`, tokens['SUPER ADMIN'], 200);
    if (tokens['STUDENT']) await testProtectedRoute('Admin endpoint (Student User)', `${API_URL}/admin/stats`, tokens['STUDENT'], 403);
    
    console.log("\n--- TESTING INSTRUCTOR ROUTES ---");
    if (tokens['INSTRUCTOR']) await testProtectedRoute('Staff endpoint (Instructor User)', `${API_URL}/staff/monitoring`, tokens['INSTRUCTOR'], 200);
    if (tokens['STUDENT']) await testProtectedRoute('Staff endpoint (Student User)', `${API_URL}/staff/monitoring`, tokens['STUDENT'], 403);
    
    console.log("\n--- END OF TESTS ---");
}

runTests();
