const axios = require('axios');

const API_URL = 'http://127.0.0.1:5000/api';

async function testAIInterview() {
    try {
        console.log('--- Starting AI Interview Test ---');

        // 1. Login
        console.log('\n[1] Logging in...');
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: 'superadmin@techwell.co.in',
            password: 'password123'
        });
        const cookies = loginRes.headers['set-cookie'];
        const axiosConfig = { headers: { 'Cookie': cookies } };

        // 2. Create Interview
        console.log('\n[2] Creating Interview...');
        const createRes = await axios.post(`${API_URL}/interviews`, {
            domain: "Software Engineering",
            role: "Frontend Developer",
            difficulty: "INTERMEDIATE",
            duration: 15
        }, axiosConfig);
        const interviewId = createRes.data.interview.id;
        console.log(`✅ Interview created: ${interviewId}`);

        // 3. Start Interview
        console.log('\n[3] Starting Interview...');
        await axios.patch(`${API_URL}/interviews/${interviewId}/start`, {}, axiosConfig);
        console.log(`✅ Interview started`);

        // 4. Get Next Question
        console.log('\n[4] Getting First Question...');
        const q1Res = await axios.post(`${API_URL}/interviews/${interviewId}/next-question`, {}, axiosConfig);
        const q1 = q1Res.data.question;
        console.log(`✅ Q1 received: ${q1.question} (Type: ${q1.type})`);

        // 5. Submit Response
        console.log('\n[5] Submitting Response...');
        const r1Res = await axios.post(`${API_URL}/interviews/${interviewId}/response`, {
            questionId: q1.id,
            answer: "I have 5 years of experience with React."
        }, axiosConfig);
        console.log(`✅ R1 submitted. Score: ${r1Res.data.evaluation.score}. Feedback: ${r1Res.data.evaluation.briefFeedback}`);

        console.log('\n--- AI Interview Test Completed Successfully! ---');

    } catch (error) {
        console.error('\n❌ Test Failed:');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', JSON.stringify(error.response.data, null, 2));
        } else {
            console.error('Message:', error.message);
        }
    }
}

testAIInterview();
