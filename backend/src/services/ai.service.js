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
        try {
            console.log(`[generateNextQuestion] Starting for interview: ${interviewId}`);
            
            const interview = await prisma.interview.findUnique({
                where: { id: interviewId },
                include: { questions: true }
            });

            if (!interview) {
                console.error(`[generateNextQuestion] Interview not found: ${interviewId}`);
                throw new Error('Interview not found');
            }

            const questionCount = interview.questions.length;
            const existingQuestionTexts = interview.questions.map(q => q.question);

            const settings = await prisma.interviewSettings.findFirst() || {
                adaptiveDifficulty: true,
                escalationThreshold: 75,
                initialDifficulty: 'INTERMEDIATE',
                maxQuestions: 10,
                hrQuestionRatio: 3
            };

            console.log(`[generateNextQuestion] Interview found with ${questionCount} existing questions`);

            if (questionCount >= settings.maxQuestions) {
                console.log(`[generateNextQuestion] Max questions reached: ${questionCount}/${settings.maxQuestions}`);
                return null; // End Interview
            }

            let avatarRole = 'Technical';
            let difficulty = interview.difficulty;

            // Adaptive Difficulty Logic
            if (settings.adaptiveDifficulty && previousResponse && previousResponse.score) {
                if (previousResponse.score >= settings.escalationThreshold) {
                    if (difficulty === 'BEGINNER') difficulty = 'INTERMEDIATE';
                    else if (difficulty === 'INTERMEDIATE') difficulty = 'ADVANCED';
                } else if (previousResponse.score < 50) {
                    if (difficulty === 'ADVANCED') difficulty = 'INTERMEDIATE';
                    else if (difficulty === 'INTERMEDIATE') difficulty = 'BEGINNER';
                }
            }

            // HR Question Check
            if ((questionCount + 1) % settings.hrQuestionRatio === 0) {
                avatarRole = 'HR';
                console.log(`[generateNextQuestion] HR round detected`);
            }

            let questionText = "";
            let type = avatarRole === 'HR' ? 'BEHAVIORAL' : 'TECHNICAL';

            // Try Knowledge Base first
            try {
                const kbCount = await prisma.knowledgeBase.count({
                    where: {
                        domain: avatarRole === 'HR' ? 'HR' : interview.domain,
                        difficulty: difficulty,
                        content: {
                            notIn: existingQuestionTexts
                        }
                    }
                });

                console.log(`[generateNextQuestion] Found ${kbCount} NEW KB questions for domain: ${interview.domain}, difficulty: ${difficulty}`);

                const kbQuestion = kbCount > 0 ? await prisma.knowledgeBase.findFirst({
                    where: {
                        domain: avatarRole === 'HR' ? 'HR' : interview.domain,
                        difficulty: difficulty,
                        content: {
                            notIn: existingQuestionTexts
                        }
                    },
                    take: 1,
                    skip: kbCount > 5 ? Math.floor(Math.random() * 5) : (kbCount > 0 ? Math.floor(Math.random() * kbCount) : 0)
                }) : null;

                if (kbQuestion && Math.random() > 0.3) {
                    console.log(`[generateNextQuestion] Using KB question`);
                    questionText = kbQuestion.content;
                } else {
                    console.log(`[generateNextQuestion] Will generate question with AI`);
                    throw new Error('Using AI generation'); // Force AI generation
                }
            } catch (kbError) {
                // Generate with Gemini
                try {
                    console.log(`[generateNextQuestion] Attempting AI generation...`);
                    
                    // Fetch Resume Text if available
                    let resumeText = null;
                    if (interview.resumeUrl) {
                        console.log(`[generateNextQuestion] Extracting resume from: ${interview.resumeUrl}`);
                        resumeText = await this.extractTextFromPDF(interview.resumeUrl);
                        if (resumeText) {
                            console.log(`[generateNextQuestion] Resume extracted: ${resumeText.length} chars`);
                        } else {
                            console.warn(`[generateNextQuestion] Resume extraction returned null`);
                        }
                    }

                    const prompt = `You are a professional AI Technical Interviewer. 
Your goal is to conduct a highly personalized interview based on the candidate's resume.

Candidate Resume Context:
"""
${resumeText || "No resume content available."}
"""

Target Role: ${interview.role}
Target Technology: ${interview.technology || interview.domain}
Difficulty: ${difficulty}

Core Task:
Generate exactly ONE (1) technical interview question for the next step of the interview.

Focus heavily on:
1. Specific Skills mentioned in the resume.
2. Projects the candidate has worked on.
3. Their professional Experience.

Current Interview Progress:
- Questions Asked So Far: ${questionCount}
- Questions Already Asked (IMPORTANT: DO NOT REPEAT THESE):
${existingQuestionTexts.map((q, i) => `  ${i + 1}. ${q}`).join('\n')}

- Previous Candidate Answer: "${previousResponse?.transcript || 'None'}"

Instructions:
- Generate exactly ONE (1) NEW technical interview question that follows naturally from the previous topic BUT is not identical to any previous questions.
- Keep the question concise and professional (max 40 words).
- If resume content is available, tailor the question to a specific project or skill found there.
- Ensure the question is different in substance and wording from the "Questions Already Asked" list above.
- Return ONLY the question text. Do not include any prefix like "Interviewer:" or numbering.`;

                    console.log(`[generateNextQuestion] Sending prompt to Gemini...`);
                    const result = await model.generateContent(prompt);
                    const response = await result.response;
                    questionText = response.text().trim();
                    console.log(`[generateNextQuestion] AI generated question: ${questionText.substring(0, 50)}...`);
                } catch (geminiError) {
                    console.error(`[generateNextQuestion] Gemini error:`, geminiError.message);
                    // Fallback to Static Bank
                    console.log(`[generateNextQuestion] Using fallback question bank`);
                    const bank = avatarRole === 'HR'
                        ? QUESTION_BANK.HR
                        : (QUESTION_BANK['IT'][difficulty] || QUESTION_BANK['IT']['BEGINNER']);
                    questionText = bank[Math.floor(Math.random() * bank.length)];
                    console.log(`[generateNextQuestion] Fallback question: ${questionText}`);
                }
            }

            console.log(`[generateNextQuestion] Success: Generated question of type ${type}`);
            return {
                question: questionText || "Tell me about a challenging project you've worked on.",
                type: type,
                avatarRole: avatarRole,
                avatarId: avatarRole === 'HR' ? 'hr-1' : 'tech-1',
                difficulty: difficulty
            };
        } catch (error) {
            console.error(`[generateNextQuestion] CRITICAL ERROR:`, error.message, error.stack);
            // Return a safe fallback question
            return {
                question: "Tell me about yourself and your background in this field.",
                type: 'TECHNICAL',
                avatarRole: 'Technical',
                avatarId: 'tech-1',
                difficulty: 'BEGINNER'
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
                feedback: "No response detected. Please ensure you answer the question or write code.",
                sentiment: "NEGATIVE",
                missingKeywords: []
            };
        }

        try {
            const prompt = `You are an expert interviewer evaluating a candidate's answer.\n\nQuestion: "${questionData?.question || 'Unknown Question'}"\nContext/Type: ${questionData?.type || 'General'}\n\nCandidate Answer: "${responseText || ''}"\n${code ? `Candidate Code:\n${code}\n` : ''}\n\nTask: Evaluate the answer heavily on technical accuracy, clarity, and depth.\n\nReturn EXACTLY a JSON object in this format (no markdown blocks, no extra text):\n{\n    "score": (0-100 integer),\n    "feedback": "2-3 sentences of constructive feedback.",\n    "sentiment": "POSITIVE" | "NEUTRAL" | "NEGATIVE",\n    "missingKeywords": ["concept1", "concept2"],\n    "foundKeywords": ["concept3", "concept4"]\n}`;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text().trim().replace(/```json|```/gi, '');
            return JSON.parse(text);
        } catch (error) {
            console.error("Gemini Evaluation Error (Falling back to heuristic):", error);
            return this.evaluateResponseHeuristic(responseText, code);
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
            const prompt = `You are an AI Technical Interviewer.
Analyze the following Background/Resume/Job Description:
"""
${context.substring(0, 4000)}
"""

Task:
Generate exactly ${count} technical interview questions tailored to this context for a ${difficulty} level ${role} role.

Focus on:
- Skills mentioned in the text
- Projects and accomplishments
- Relative experience

Output Requirements:
- Return ONLY a JSON array of objects.
- Keys: "topic", "content", "answer", "difficulty", "type".
- "type" should be "TECHNICAL".

JSON Format:
[
    {
        "topic": "Topic name",
        "content": "Question text",
        "answer": "Ideal model answer",
        "difficulty": "${difficulty}",
        "type": "TECHNICAL"
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
