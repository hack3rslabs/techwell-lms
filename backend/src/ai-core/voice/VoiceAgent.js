const { GoogleGenerativeAI } = require('@google/generative-ai');

/**
 * Local Voice Agent Pipeline
 * 
 * Handles the conversational loop:
 * 1. Takes transcribed text from the caller.
 * 2. Processes it through Google Gemini LLM.
 * 3. Returns the text response (which gets passed to TTS).
 */

class VoiceAgent {
    constructor() {
        if (!process.env.GEMINI_API_KEY) {
            console.warn('[Voice Agent] Warning: GEMINI_API_KEY is not set. Conversational AI will not work.');
        }
        
        this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'dummy_key');
        this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        this.conversationHistory = [];
    }

    startNewCall(callerId) {
        console.log(`[Voice Agent] Initializing new AI conversation for ${callerId}`);
        this.conversationHistory = [
            {
                role: "user",
                parts: [{ text: "System Prompt: You are Techwell's AI Admissions Counselor answering a phone call. Keep your responses short, conversational, and helpful. Do not use markdown formatting since this will be spoken out loud." }]
            },
            {
                role: "model",
                parts: [{ text: "Understood. I am ready to assist." }]
            }
        ];
    }

    async processUserInput(transcribedText) {
        console.log(`[Voice Agent] Caller says: "${transcribedText}"`);
        
        this.conversationHistory.push({
            role: "user",
            parts: [{ text: transcribedText }]
        });

        try {
            const chat = this.model.startChat({
                history: this.conversationHistory,
            });

            const result = await chat.sendMessage(transcribedText);
            const aiResponse = result.response.text();
            
            console.log(`[Voice Agent] AI Response: "${aiResponse}"`);
            
            this.conversationHistory.push({
                role: "model",
                parts: [{ text: aiResponse }]
            });

            return aiResponse;
        } catch (error) {
            console.error('[Voice Agent] Gemini API Error:', error.message);
            return "I'm sorry, I am having trouble connecting to my brain right now.";
        }
    }

    // ---------------------------------------------------------
    // HARDWARE AUDIO HOOKS (Architecture)
    // ---------------------------------------------------------
    
    /**
     * In a full local setup, you run a background process (like SoX or a C++ binary) 
     * that records the microphone, uses a Voice Activity Detector (VAD) to find when they stop speaking, 
     * sends it to a Speech-to-Text API, and calls processUserInput().
     */
    async simulateAudioLoop(audioBuffer) {
        // 1. Send `audioBuffer` to Google Speech-to-Text API or OpenAI Whisper API
        const simulatedTranscription = "Hello, I am interested in the AI automation course.";
        
        // 2. Get AI Response
        const aiResponseText = await this.processUserInput(simulatedTranscription);
        
        // 3. Send `aiResponseText` to Google Text-to-Speech API or ElevenLabs API
        // const ttsAudioBuffer = await ElevenLabs.synthesize(aiResponseText);
        
        // 4. Play `ttsAudioBuffer` through the Dongle's Speaker device.
        console.log(`[Voice Agent] (Simulated) Playing TTS Audio through Dongle Speaker...`);
    }
}

module.exports = new VoiceAgent();
