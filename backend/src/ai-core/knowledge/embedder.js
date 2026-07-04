const { GoogleGenerativeAI } = require('@google/generative-ai');

async function generateEmbedding(text) {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not set in the environment");
  }
  
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  // text-embedding-004 is the recommended model for general text embeddings
  const model = genAI.getGenerativeModel({ model: "text-embedding-004" });
  
  try {
    const result = await model.embedContent(text);
    return result.embedding.values;
  } catch (error) {
    console.error("[Embedder] Error generating embedding:", error.message);
    throw error;
  }
}

module.exports = {
  generateEmbedding
};
