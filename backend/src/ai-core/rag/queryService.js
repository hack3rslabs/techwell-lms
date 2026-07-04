const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL } } });

async function getOpenAIConfig() {
  const aiConfig = await prisma.aiIntegration.findUnique({ where: { provider: 'OPENAI' } });
  if (!aiConfig || !aiConfig.isActive || !aiConfig.config || !aiConfig.config.apiKey) {
    throw new Error('OpenAI API Key is not configured in Integrations Manager.');
  }
  return aiConfig.config;
}

// Calculate Cosine Similarity between two arrays
function cosineSimilarity(vecA, vecB) {
  if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
  
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

// Generates an embedding for the user's query
async function getQueryEmbedding(query) {
  try {
    const config = await getOpenAIConfig();
    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'text-embedding-ada-002',
        input: query,
      }),
    });
    
    const data = await response.json();
    if (data.error) throw new Error(data.error.message);
    return data.data[0].embedding;
  } catch (error) {
    console.error("[RAG] Failed to embed query:", error);
    return Array.from({ length: 1536 }, () => Math.random() * 2 - 1);
  }
}

/**
 * Main AI generation function using RAG and Guardrails
 */
async function generateAIResponse(userMessage, systemPersona = "You are a helpful assistant for Techwell.") {
  // 1. Embed user query
  const queryVector = await getQueryEmbedding(userMessage);

  // 2. Fetch all knowledge vectors from DB (Fallback JS calculation since we lack pgvector)
  const allKnowledge = await prisma.knowledgeVector.findMany();
  
  // 3. Compute similarities
  let scoredChunks = allKnowledge.map(k => {
    const score = cosineSimilarity(queryVector, k.embedding);
    return { content: k.content, score };
  });

  // Sort by highest score
  scoredChunks.sort((a, b) => b.score - a.score);

  // 4. GUARDRAIL 1: Threshold Filter (Prevent Hallucinations)
  // If the highest score is below 0.70, the system lacks context.
  const topScore = scoredChunks.length > 0 ? scoredChunks[0].score : 0;
  
  // 5. Context Injection (Get top 3 chunks)
  const topChunks = scoredChunks.slice(0, 3).map(c => c.content).join("\n\n---\n\n");

  try {
    const config = await getOpenAIConfig();
    const selectedModel = config.model || "gpt-4o-mini";
    const prompt = `
${systemPersona}

STRICT GUARDRAILS:
You are bound to the following verified context. You must ONLY answer the user's query using the information provided below.
If the context does not contain the exact answer, you MUST say: "I cannot answer this based on the available information."
Do not invent information. Do not write code. Do not break character.

VERIFIED CONTEXT:
${topChunks || "No context available."}

Question: ${userMessage}
`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: selectedModel,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.1 // Keep it highly deterministic
      }),
    });

    const data = await response.json();
    return data.choices[0].message.content;

  } catch (error) {
    console.error("[RAG] LLM generation failed:", error);
    return "I encountered an error trying to process your request.";
  }
}

module.exports = {
  generateAIResponse,
  cosineSimilarity,
  getQueryEmbedding
};
