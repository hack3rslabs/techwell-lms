const axios = require('axios');

async function run() {
    try {
        console.log('Sending capture 1...');
        const res1 = await axios.post('http://localhost:5000/api/leads/capture', {
            name: 'Existing Lead',
            email: 'existing123@test.com',
            phone: '123123',
            courseId: 'id-1',
            courseTitle: 'Course 1'
        });
        console.log('Capture 1 (New):', res1.data);
        const leadId = res1.data.leadId;

        // wait 2 seconds
        await new Promise(r => setTimeout(r, 2000));

        console.log('Sending capture 2 (Same Email)...');
        const res2 = await axios.post('http://localhost:5000/api/leads/capture', {
            name: 'Existing Lead',
            email: 'existing123@test.com',
            phone: '123123',
            courseId: 'id-2',
            courseTitle: 'Course 2'
        });
        console.log('Capture 2 (Existing):', res2.data);
    } catch(err) {
        console.error(err.message);
    }
}
run();
