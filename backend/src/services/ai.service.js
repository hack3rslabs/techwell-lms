const { PrismaClient } = require('@prisma/client');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const prisma = new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL } } });
const pdf = require('pdf-parse');
const fs = require('fs');
const path = require('path');

// Initialize Gemini
const GEMINI_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_KEY) {
    console.error('CRITICAL ERROR: GEMINI_API_KEY is not defined in the environment variables!');
}
const genAI = new GoogleGenerativeAI(GEMINI_KEY || 'MISSING_KEY');
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Mock Question Bank (Fallback if AI generation fails)
const QUESTION_BANK = {
    'IT': {
        'BEGINNER': [
            "What is the difference between let, const, and var?",
            "Explain the concept of REST APIs.",
            "What is GIT and why do we use it?"
        ],
        'INTERMEDIATE': [
            "Explain the Event Loop in JavaScript.",
            "How does database indexing work?",
            "What are Microservices and how do they differ from Monoliths?"
        ],
        'ADVANCED': [
            "Design a scalable system for a real-time chat application.",
            "Explain how you would handle race conditions in a distributed system.",
            "Discuss the CAP theorem and its implications in database selection."
        ]
    },
    'HR': [
        "Tell me about a time you handled a conflict in your team.",
        "Why do you want to join this company?",
        "Where do you see yourself in 5 years?"
    ]
};

class AIService {
    constructor() {
        this.TOPIC_KEYWORDS = {
            'REACT': ['component', 'state', 'props', 'hooks', 'virtual dom', 'jsx', 'lifecycle', 'render'],
            'NODE': ['event loop', 'async', 'await', 'callback', 'stream', 'module', 'npm', 'middleware'],
            'DATABASE': ['sql', 'nosql', 'index', 'query', 'transaction', 'normalization', 'schema', 'acid'],
            'SYSTEM_DESIGN': ['scalability', 'load balancer', 'caching', 'database', 'microservices', 'latency', 'throughput'],
            'BEHAVIORAL': ['situation', 'task', 'action', 'result', 'communication', 'team', 'conflict', 'learned']
        };
    }

    /**
     * Utility to extract text from a PDF file (local or remote URL)
     */
    async extractTextFromPDF(resumeUrl) {
        if (!resumeUrl) {
            console.log('[PDF Extract] No resume URL provided');
            return null;
        }

        try {
            let dataBuffer;

            // Handle HTTP/HTTPS URLs (remote files)
            if (resumeUrl.startsWith('http://') || resumeUrl.startsWith('https://')) {
                console.log(`[PDF Extract] Downloading from remote URL: ${resumeUrl}`);
                try {
                    const response = await fetch(resumeUrl, { timeout: 10000 });
                    if (!response.ok) {
                        console.warn(`[PDF Extract] Failed to download - HTTP ${response.status}`);
                        return null;
                    }
                    const buffer = await response.arrayBuffer();
                    dataBuffer = Buffer.from(buffer);
                    console.log(`[PDF Extract] Downloaded ${dataBuffer.length} bytes from remote URL`);
                } catch (fetchError) {
                    console.warn(`[PDF Extract] Failed to fetch remote PDF:`, fetchError.message);
                    return null;
                }
            } else {
                // Handle local filesystem paths
                const absolutePath = path.isAbsolute(resumeUrl)
                    ? resumeUrl
                    : path.join(__dirname, '../../', resumeUrl);

                console.log(`[PDF Extract] Attempting to read local file: ${absolutePath}`);

                if (!fs.existsSync(absolutePath)) {
                    console.warn(`[PDF Extract] File not found at path: ${absolutePath}`);
                    return null;
                }

                dataBuffer = fs.readFileSync(absolutePath);
                console.log(`[PDF Extract] Read ${dataBuffer.length} bytes from local file`);
            }

            // Parse PDF
            console.log('[PDF Extract] Parsing PDF content...');
            const data = await pdf(dataBuffer);
            const extractedText = data.text || '';

            if (!extractedText || extractedText.trim().length === 0) {
                console.warn('[PDF Extract] PDF parsing returned empty text');
                return null;
            }

            console.log(`[PDF Extract] Successfully extracted ${extractedText.length} characters from PDF`);
            return extractedText.substring(0, 5000); // Limit to 5000 chars for API efficiency
        } catch (error) {
            console.error(`[PDF Extract] Error extracting PDF:`, error.message, error.stack);
            return null;
        }
    }

    /**
     * Generate the next question based on context using Gemini
     */
    async generateNextQuestion(interviewId, previousResponse = null) {
        let isHrRound = false; // Define here to avoid ReferenceError in catch block
        try {
            console.log(`[generateNextQuestion] Starting for interview: ${interviewId}`);

            const interview = await prisma.interview.findUnique({
                where: { id: interviewId },
                include: {
                    questions: {
                        include: { response: true }
                    }
                }
            });

            if (!interview) {
                throw new Error('Interview not found');
            }

            const questionCount = interview.questions.length;
            const existingQuestions = interview.questions.map(q => ({
                text: q.question,
                type: q.type,
                score: q.response?.score
            }));

            const settings = await prisma.interviewSettings.findFirst() || {
                adaptiveDifficulty: true,
                escalationThreshold: 75,
                initialDifficulty: 'INTERMEDIATE',
                maxQuestions: 10,
                hrQuestionRatio: 3
            };

            if (questionCount >= settings.maxQuestions) {
                return null; // End Interview
            }

            let difficulty = interview.difficulty;
            // Adaptive Difficulty Logic
            if (settings.adaptiveDifficulty && previousResponse && previousResponse.score !== undefined) {
                if (previousResponse.score >= settings.escalationThreshold) {
                    if (difficulty === 'BEGINNER') difficulty = 'INTERMEDIATE';
                    else if (difficulty === 'INTERMEDIATE') difficulty = 'ADVANCED';
                } else if (previousResponse.score < 50) {
                    if (difficulty === 'ADVANCED') difficulty = 'INTERMEDIATE';
                    else if (difficulty === 'INTERMEDIATE') difficulty = 'BEGINNER';
                }
            }

            isHrRound = (questionCount + 1) % settings.hrQuestionRatio === 0;
            const avatarRole = isHrRound ? 'HR' : 'Technical';

            // Try gemini-1.5-flash, fallback to gemini-pro if needed
            let generativeModel;
            try {
                // Use a stable model name
                generativeModel = genAI.getGenerativeModel({ model: "gemini-pro" });
                console.log("[generateNextQuestion] Using gemini-pro model");
            } catch (e) {
                console.warn("[generateNextQuestion] Failed to get gemini-pro, trying gemini-1.5-flash");
                generativeModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            }

            // Extract resume text
            let resumeText = "";
            if (interview.resumeUrl) {
                try {
                    console.log(`[generateNextQuestion] Extracting text from resume: ${interview.resumeUrl}`);
                    const extracted = await this.extractTextFromPDF(interview.resumeUrl);
                    resumeText = extracted || "";
                } catch (pdfError) {
                    console.error(`[generateNextQuestion] PDF Extraction failed:`, pdfError);
                    resumeText = "Error extracting resume text.";
                }
            }

            const prompt = `You are an AI Technical Interviewer designed to conduct a dynamic and adaptive interview session.
Interview Duration: 30 minutes total.
Current Progress: Question ${questionCount + 1} of ${settings.maxQuestions}.
Candidate Role: ${interview.role}
Target Technology: ${interview.technology || interview.domain}
Current Difficulty: ${difficulty}

RULES:
1. STRICTLY avoid repeating any question or concept already covered.
2. COVER a wide range of topics relevant to the candidate's skills and resume.
3. ADJUST difficulty dynamically based on previous answers.
4. MIX different types of questions:
   - Conceptual questions
   - Coding/problem-solving questions
   - Scenario-based questions
   - Real-world application questions

RESUME CONTEXT:
${resumeText || "No resume provided."}

QUESTION HISTORY (DO NOT REPEAT CONCEPTS FROM THESE):
${existingQuestions.map((q, i) => `${i + 1}. [${q.type}] ${q.text} (Score: ${q.score || 'N/A'})`).join('\n')}

PREVIOUS FEEDBACK: "${previousResponse?.briefFeedback || 'None'}"

TASK:
Generate exactly ONE (1) NEW interview question.
If it's a technical round, focus on ${interview.technology || interview.domain}. 
If it's an HR round (${isHrRound}), focus on behavioral/scenario traits.

Return ONLY a JSON object in this format:
{
    "question": "The question text",
    "type": "TECHNICAL" | "BEHAVIORAL" | "SITUATIONAL" | "HR" | "CODING",
    "avatarRole": "${avatarRole}",
    "difficulty": "${difficulty}"
}
Note: 
- Use "TECHNICAL" for conceptual or coding questions.
- Use "BEHAVIORAL" or "SITUATIONAL" for behavioral/scenario questions.
- Use "CODING" ONLY if the question explicitly requires writing code.`;

            console.log(`[generateNextQuestion] Prompting Gemini for interview: ${interviewId}`);
            const result = await generativeModel.generateContent(prompt);
            const response = await result.response;
            const text = response.text();
            
            console.log(`[generateNextQuestion] Gemini raw response: ${text.substring(0, 100)}...`);

            // Robust JSON extraction
            let jsonStr = text.trim();
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                jsonStr = jsonMatch[0];
            } else {
                jsonStr = text.replace(/```json|```/gi, '').trim();
            }

            const aiResponse = JSON.parse(jsonStr);
            console.log(`[generateNextQuestion] Parsed AI response successfully`);

            // Map types to valid enum values to prevent Prisma errors
            const typeMap = {
                'CONCEPTUAL': 'TECHNICAL',
                'REAL_WORLD': 'TECHNICAL',
                'SCENARIO': 'SITUATIONAL',
                'TECHNICAL': 'TECHNICAL',
                'BEHAVIORAL': 'BEHAVIORAL',
                'SITUATIONAL': 'SITUATIONAL',
                'HR': 'HR',
                'CODING': 'CODING'
            };
            const finalType = typeMap[aiResponse.type?.toUpperCase()] || (isHrRound ? 'BEHAVIORAL' : 'TECHNICAL');

            return {
                question: aiResponse.question,
                type: finalType,
                avatarRole: aiResponse.avatarRole || avatarRole,
                avatarId: isHrRound ? 'hr-1' : 'tech-1',
                difficulty: aiResponse.difficulty || difficulty
            };
        } catch (error) {
            console.error(`[generateNextQuestion] Error:`, error);
            // Fallback that is safe from ReferenceErrors
            return {
                question: "Tell me about a challenging technical problem you solved recently.",
                type: isHrRound ? 'BEHAVIORAL' : 'SITUATIONAL',
                avatarRole: 'Technical',
                avatarId: 'tech-1',
                difficulty: 'INTERMEDIATE'
            };
        }
    }


    /**
     * Evaluate a response using Gemini
     */
    async evaluateResponse(questionId, responseText, code = null) {
        const questionData = await prisma.interviewQuestion.findUnique({
            where: { id: questionId }
        });

        if (!responseText && !code) {
            return {
                score: 0,
                feedback: "No response detected.",
                briefFeedback: "I didn't catch that. Could you please provide an answer?",
                sentiment: "NEGATIVE",
                missingKeywords: []
            };
        }

        try {
            const prompt = `Evaluate the following candidate response to an interview question.
            
Question: "${questionData?.question}"
Type: ${questionData?.type}

Candidate Answer: "${responseText || ''}"
${code ? `Candidate Code:\n${code}\n` : ''}

TASK:
1. Provide a technical score (0-100).
2. Provide constructive feedback for the final report.
3. Provide a "briefFeedback" - a single sentence (max 12 words) that I (the interviewer) will say to the candidate immediately before moving to the next question. It should be brief feedback on their answer.

Return ONLY a JSON object:
{
    "score": number,
    "feedback": "string",
    "briefFeedback": "string",
    "sentiment": "POSITIVE" | "NEUTRAL" | "NEGATIVE",
    "foundKeywords": [],
    "missingKeywords": []
}`;

            const result = await model.generateContent(prompt);
            const resText = (await result.response).text().trim().replace(/```json|```/gi, '');
            return JSON.parse(resText);
        } catch (error) {
            console.error("Evaluation Error:", error);
            return {
                score: 50,
                feedback: "AI evaluation unavailable.",
                briefFeedback: "Thanks for that explanation. Let's move on.",
                sentiment: "NEUTRAL",
                foundKeywords: [],
                missingKeywords: []
            };
        }
    }

    // Kept for fallback
    evaluateResponseHeuristic(responseText, code) {
        let score = Math.min(40, (responseText || "").length / 3);
        return {
            score: Math.min(70, Math.floor(score)),
            feedback: "AI service unavailable or error occurred. Score based on response depth.",
            sentiment: "NEUTRAL",
            foundKeywords: [],
            missingKeywords: []
        };
    }

    /**
     * Train the AI (Add to Knowledge Base)
     */
    async trainKnowledgeBase(data) {
        return await prisma.knowledgeBase.create({
            data: {
                domain: data.domain,
                topic: data.topic,
                content: data.content,
                difficulty: data.difficulty,
                answer: data.answer
            }
        });
    }

    /**
     * Generate questions from a specific Context (Job Description / Text) using Gemini
     */
    async generateQuestionsFromContext({ context, domain, role, difficulty, count = 5 }) {
        try {
            const prompt = `
You are an expert ${role} interviewer.

Generate exactly ${count} UNIQUE and NON-REPEATED interview questions for a ${difficulty} level candidate in the ${domain} domain ${company ? `for ${company}` : ''}.

Strict Rules:
- Each question MUST be different from the others.
- Avoid generic or commonly asked questions.
- Cover diverse topics (concepts, coding, debugging, system design, real-world scenarios).
- Do NOT repeat topics or patterns.
- Ensure questions feel like a real 30-minute interview progression.

Avoid questions similar to:
${JSON.stringify(previousQuestions)}

Output:
Return ONLY a JSON array with:
{
  "topic": "",
  "content": "",
  "answer": ""
}
        ]`;


            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text().trim().replace(/```json|```/gi, '');
            const parsed = JSON.parse(text);
            return Array.isArray(parsed) ? parsed : (parsed.questions || []);
        } catch (error) {
            console.error("Gemini Context Generation Error:", error);
            throw new Error("Failed to generate from context");
        }
    }

    /**
     * Generate interview questions using Gemini
     */
    async generateInterviewQuestions({ domain, role, company, difficulty, count = 5 }) {
        try {
            const prompt = `You are an expert ${role} interviewer. Generate exactly ${count} professional interview questions for a ${difficulty} level candidate in the ${domain} domain${company ? ` specifically for a position at ${company}` : ''}.\n\nInstructions:\n1. Focus on actual industry-standard technical concepts.\n2. Provide a detailed "ideal answer".\n3. Format strictly as a JSON array of objects with keys: "topic", "content", "answer".\n4. Return ONLY the JSON (no markdown).`;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text().trim().replace(/```json|```/gi, '');
            const parsed = JSON.parse(text);
            const questions = Array.isArray(parsed) ? parsed : (parsed.questions || []);

            return questions.map(q => ({
                topic: q.topic || "General",
                content: q.content || q.question || "Generated Question",
                answer: q.answer || q.sampleAnswer || "Sample answer pending..."
            }));
        } catch (error) {
            console.error("Gemini Generation Error:", error);
            // Fallback mock data
            return Array(count).fill(null).map((_, i) => ({
                topic: "Fallback Topic",
                content: `Sample ${difficulty} question for ${role} in ${domain} (ID: ${i + 1})`,
                answer: "Fallback sample answer.",
            }));
        }
    }

    /**
     * Generate comprehensive interview report
     */
    async generateDetailedReport(interviewId) {
        const interview = await prisma.interview.findUnique({
            where: { id: interviewId },
            include: {
                questions: {
                    include: { response: true }
                },
                evaluation: true,
                user: true
            }
        });

        if (!interview) throw new Error('Interview not found');

        let technicalScores = [];
        let behavioralScores = [];
        let questionBreakdown = [];

        for (const question of interview.questions) {
            const response = question.response;
            if (response) {
                const score = response.score || 0;
                const feedback = response.feedback || "No feedback recorded";

                questionBreakdown.push({
                    question: question.question,
                    type: question.type,
                    answer: response.transcript?.substring(0, 200) + (response.transcript?.length > 200 ? '...' : '') || '(No Answer)',
                    score,
                    feedback
                });

                if (question.type === 'TECHNICAL') {
                    technicalScores.push(score);
                } else {
                    behavioralScores.push(score);
                }
            } else {
                questionBreakdown.push({
                    question: question.question,
                    type: question.type,
                    answer: '(Skipped)',
                    score: 0,
                    feedback: 'Question was skipped.'
                });
                technicalScores.push(0);
            }
        }

        const technicalScore = technicalScores.length > 0
            ? Math.round(technicalScores.reduce((a, b) => a + b, 0) / technicalScores.length)
            : 0;

        const communicationScore = Math.min(100, technicalScore + 10);
        const confidenceScore = Math.min(100, technicalScore + 5);
        const starMethodScore = behavioralScores.length > 0
            ? Math.round(behavioralScores.reduce((a, b) => a + b, 0) / behavioralScores.length)
            : 50;

        const overallScore = Math.round(
            (technicalScore * 0.4) +
            (communicationScore * 0.25) +
            (confidenceScore * 0.2) +
            (starMethodScore * 0.15)
        );

        let marketReadinessScore = Math.round(
            (technicalScore * 0.5) +
            (communicationScore * 0.3) +
            (confidenceScore * 0.2)
        );

        if (technicalScore < 40) marketReadinessScore -= 10;
        if (communicationScore < 40) marketReadinessScore -= 5;
        marketReadinessScore = Math.max(0, Math.min(100, marketReadinessScore));

        const strengths = this.generateStrengths(technicalScore, communicationScore, confidenceScore, interview.domain);
        const weaknesses = this.generateWeaknesses(technicalScore, communicationScore, starMethodScore, interview.domain);
        const recommendations = this.generateRecommendations(technicalScore, starMethodScore, interview.domain);
        const aiInsights = this.generateAIInsights(interview.role, interview.domain, overallScore, technicalScore);

        const detailedAnalysis = `Market Readiness: ${marketReadinessScore}%\nBased on your performance, you have a ${marketReadinessScore > 75 ? 'High' : marketReadinessScore > 50 ? 'Moderate' : 'Low'} probability of clearing screening rounds for this role.\nYour pacing and confidence markers indicate ${confidenceScore > 70 ? 'strong executive presence' : 'room for improvement in delivery'}.`;

        const evaluationData = {
            overallScore,
            technicalScore,
            communicationScore,
            confidenceScore,
            starMethodScore,
            aiInsights: detailedAnalysis + "\n\n" + aiInsights,
            strengths,
            weaknesses,
            recommendations
        };

        let evaluation;
        if (interview.evaluation) {
            evaluation = await prisma.interviewEvaluation.update({
                where: { id: interview.evaluation.id },
                data: evaluationData
            });
        } else {
            evaluation = await prisma.interviewEvaluation.create({
                data: {
                    ...evaluationData,
                    interviewId
                }
            });
        }

        return {
            evaluation,
            questionBreakdown,
            interview: {
                id: interview.id,
                domain: interview.domain,
                role: interview.role,
                company: interview.company,
                difficulty: interview.difficulty,
                duration: interview.endTime && interview.startTime
                    ? Math.round((new Date(interview.endTime) - new Date(interview.startTime)) / 60000)
                    : 30
            }
        };
    }

    generateStrengths(techScore, commScore, confScore, domain) {
        const strengths = [];
        if (techScore >= 75) strengths.push(`Strong technical understanding of ${domain} concepts`);
        if (commScore >= 75) strengths.push("Clear and articulate communication");
        if (confScore >= 75) strengths.push("Confident presentation");
        strengths.push("Demonstrated problem-solving approach");
        return strengths;
    }

    generateWeaknesses(techScore, commScore, starScore, domain) {
        const weaknesses = [];
        if (techScore < 70) weaknesses.push("Could deepen technical knowledge in core areas");
        if (commScore < 70) weaknesses.push("Some responses could be more concise");
        if (starScore < 70) weaknesses.push("Use more specific STAR method examples");
        if (weaknesses.length === 0) weaknesses.push("Minor improvements in response pacing");
        return weaknesses;
    }

    generateRecommendations(techScore, starScore, domain) {
        const recommendations = [];
        if (techScore < 80) recommendations.push(`Practice more ${domain} system design questions`);
        if (starScore < 80) recommendations.push("Prepare more STAR stories for behavioral rounds");
        recommendations.push("Work on providing structured answers within 2 mins");
        return recommendations;
    }

    generateAIInsights(role, domain, overallScore, techScore) {
        if (overallScore >= 85) return `Outstanding! You show excellent potential as a ${role}.`;
        if (overallScore >= 70) return `Good job. Solid ${role} capabilities with room to grow technical depth.`;
        return `Potential identified, but focus on fundamentals and STAR method clarity.`;
    }
}

module.exports = new AIService();
