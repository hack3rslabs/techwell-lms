const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

// Test user token (you'll need to capture a real token from login)
const testCourseData = {
    title: 'Test Course ' + Date.now(),
    description: 'This is a test course description that needs to be at least 10 characters',
    category: 'Programming',
    difficulty: 'BEGINNER',
    price: 0,
    discountPrice: 0,
    courseType: 'RECORDED',
    hasInterviewPrep: false,
    interviewPrice: 0,
    bundlePrice: 0
};

async function testCourseCreation() {
    try {
        // First, login to get a token
        console.log('🔐 Logging in as SUPER_ADMIN...');
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: 'venukoyyana908@gmail.com',
            password: 'Venu@95020'
        });
        
        const { token } = loginRes.data;
        console.log('✅ Login successful. Token:', token.substring(0, 20) + '...');
        
        // Now try to create a course
        console.log('\n📝 Creating course...');
        console.log('Course data:', JSON.stringify(testCourseData, null, 2));
        
        const courseRes = await axios.post(
            `${API_URL}/courses`,
            testCourseData,
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ Course created successfully!');
        console.log('Response:', JSON.stringify(courseRes.data, null, 2));
        
    } catch (error) {
        console.error('❌ Error occurred:');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', JSON.stringify(error.response.data, null, 2));
        } else {
            console.error('Message:', error.message);
        }
    }
}

testCourseCreation();
