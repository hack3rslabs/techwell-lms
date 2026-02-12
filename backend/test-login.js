const axios = require('axios');

async function testLogin() {
    try {
        console.log('Testing login API...');
        const response = await axios.post('http://localhost:5001/api/auth/login', {
            email: 'admin@techwell.com',
            password: 'password123'
        });
        console.log('Success!');
        console.log('Status:', response.status);
        console.log('Data:', response.data);
    } catch (error) {
        console.error('Login failed!');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        } else {
            console.error('Error:', error.message);
        }
    }
}

testLogin();
