const axios = require('axios');
const API_URL = 'http://localhost:5000/api';

async function test() {
    try {
        const coursesRes = await axios.get(`${API_URL}/courses`);
        const firstCourse = coursesRes.data.courses[0];
        console.log('Main List Item:', JSON.stringify({
            id: firstCourse.id,
            title: firstCourse.title,
            bannerUrl: firstCourse.bannerUrl,
            thumbnail: firstCourse.thumbnail
        }, null, 2));

        if (firstCourse) {
            const detailRes = await axios.get(`${API_URL}/courses/${firstCourse.id}`);
            console.log('Detail Item:', JSON.stringify({
                id: detailRes.data.course.id,
                title: detailRes.data.course.title,
                bannerUrl: detailRes.data.course.bannerUrl,
                thumbnail: detailRes.data.course.thumbnail
            }, null, 2));
        }
    } catch (e) {
        console.error('Error fetching course:', e.message);
    }
}

test();
