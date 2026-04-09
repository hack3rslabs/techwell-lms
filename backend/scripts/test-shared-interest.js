const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

async function testSharedInterestCapture() {
    try {
        console.log('\n=== Testing Shared Interest → Leads Capture ===\n');

        const testData = {
            name: 'Test Student ' + Date.now(),
            email: 'teststudent' + Date.now() + '@techwell.co.in',
            phone: '9999999999',
            qualification: 'Bachelor of Technology',
            courseId: 'test-course-id',
            courseTitle: 'Web Development Bootcamp'
        };

        console.log('Request Data:', testData);
        console.log('\nSending POST request to /api/leads/capture...\n');

        const response = await axios.post(`${API_URL}/leads/capture`, testData, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        console.log('Response Status:', response.status);
        console.log('Response Data:', response.data);
        console.log('\n✅ Success! Lead captured with ID:', response.data.leadId);

        // Verify lead was created
        console.log('\nVerifying lead in database...');
        console.log('Check /admin/leads page and filter by "Website Interest" source');
        console.log('New lead email:', testData.email);

    } catch (error) {
        console.error('❌ Error:', {
            status: error.response?.status,
            message: error.response?.data?.error || error.message,
            fullError: error.response?.data || error
        });
        process.exit(1);
    }
}

testSharedInterestCapture();
