const { PrismaClient } = require('@prisma/client');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const prisma = new PrismaClient();

// Initialize Google AI with the environment variable
const genAI = process.env.GEMINI_API_KEY 
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null;

class AgentFleet {
  constructor() {
    console.log('🚀 AI AgentFleet Initialized');
  }

  /**
   * Run a specific AI task using a defined Persona
   * @param {string} personaId 
   * @param {string} taskPrompt 
   * @param {object} contextData 
   */
  async runAgentTask(personaId, taskPrompt, contextData) {
    try {
      // 1. Load Persona
      const persona = await prisma.aiAgentPersona.findUnique({
        where: { id: personaId }
      });

      if (!persona) {
        throw new Error(`Agent Persona ${personaId} not found`);
      }

      // 2. Prepare the prompt
      const systemContext = persona.systemPrompt || 'You are a helpful AI assistant.';
      const fullPrompt = `${systemContext}\n\nTask: ${taskPrompt}\n\nContext Data:\n${JSON.stringify(contextData, null, 2)}`;

      // 3. Execute based on provider (Focusing on Gemini for this implementation)
      if (persona.provider === 'google' && genAI) {
        const model = genAI.getGenerativeModel({ model: persona.model || 'gemini-1.5-pro' });
        const result = await model.generateContent(fullPrompt);
        return result.response.text();
      } else {
        // Fallback or other providers
        console.warn('[AgentFleet] Provider not supported or API key missing, returning mock response.');
        return `Mock AI response from ${persona.name} based on task: ${taskPrompt}`;
      }

    } catch (error) {
      console.error('[AgentFleet] Task execution failed:', error);
      throw error;
    }
  }
}

module.exports = new AgentFleet();
