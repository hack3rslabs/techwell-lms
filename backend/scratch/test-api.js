const axios = require('axios');

async function test() {
    try {
        const res = await axios.get('http://localhost:5000/api/rbac/features');
        console.log('Features status:', res.status);
        console.log('Features count:', res.data.length);
    } catch (error) {
        console.error('Error fetching features:', error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        }
    }
}

test();
