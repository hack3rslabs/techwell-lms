const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function test() {
  try {
    console.log('Listing Gemini models...');
    // Note: genAI doesn't have listModels, you usually use a fetch or a different client
    // But we can try just using 'gemini-1.5-flash' which SHOULD work.
    // Maybe it's a region issue or API key issue?
    // Actually, let's try 'gemini-pro' as a fallback.
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent("Say hello");
    console.log('Success!');
  } catch (err) {
    console.error('Error:', err.message);
  }
}

test();
