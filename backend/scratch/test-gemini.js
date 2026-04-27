const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

async function test() {
  try {
    console.log('Testing Gemini API...');
    const result = await model.generateContent("Say hello");
    console.log('Success! Gemini says:', (await result.response).text());
    process.exit(0);
  } catch (err) {
    console.error('Gemini API Failed:', err);
    process.exit(1);
  }
}

test();
