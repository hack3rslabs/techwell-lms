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

    // ─── Standard HR Question Bank ───────────────────────────────────────────
    HR_OPENING_QUESTIONS = [
        "Tell me about yourself and walk me through your background.",
        "Why are you interested in this role and what excites you most about it?",
        "What are your top 3 key strengths and how do they relate to this position?",
        "What motivates you in your career and keeps you driven?",
        "Why should we hire you? What value can you bring to this team?"
    ];

    HR_CLOSING_QUESTIONS = [
        "What is your biggest professional achievement so far?",
        "Where do you see yourself in the next 3 to 5 years?",
        "What are your salary expectations (current CTC and expected CTC)?",
        "What is your notice period and when can you join?",
        "Do you have any questions for us, the interviewer?"
    ];

    /**
     * Determine the interview phase based on question count and max questions
     * Phase: OPENING (first 5 HR), TECHNICAL (middle), CLOSING (last 5 HR)
     */
    getInterviewPhase(questionCount, maxQuestions) {
        const OPENING_COUNT = 5;
        const CLOSING_COUNT = 5;
        const technicalCount = Math.max(0, maxQuestions - OPENING_COUNT - CLOSING_COUNT);

        if (questionCount < OPENING_COUNT) {
            return { phase: 'OPENING', indexInPhase: questionCount };
        } else if (questionCount < OPENING_COUNT + technicalCount) {
            return { phase: 'TECHNICAL', indexInPhase: questionCount - OPENING_COUNT };
        } else {
            return { phase: 'CLOSING', indexInPhase: questionCount - OPENING_COUNT - technicalCount };
        }
    }

    /**
     * Get max questions based on interview duration (stored in interview.duration field)
     * 15min=5, 30min=10, 45min=15, 60min=20
     */
    getMaxQuestionsFromDuration(duration) {
        if (duration <= 15) return 5;
        if (duration <= 30) return 10;
        if (duration <= 45) return 15;
        return 20;
    }

    /**
     * Provider Factory: Routes AI generation to OpenAI, Ollama, or Gemini
     * based on user plan and available environment keys.
     */
    async generateWithAIProvider(prompt, interview = null, isEval = false) {
        const plan = interview?.user?.plan || 'FREE';
        const useOpenAI = process.env.OPENAI_API_KEY && (plan === 'PRO' || plan === 'ENTERPRISE' || isEval);
        const useOllama = process.env.OLLAMA_URL && plan === 'FREE';

        // 1. OpenAI (GPT-4o) for Premium Users or Evaluation
        if (useOpenAI) {
            console.log("[AI Provider Factory] Routing to OpenAI (GPT-4o)");
            try {
                const response = await fetch('https://api.openai.com/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
                    },
                    body: JSON.stringify({
                        model: 'gpt-4o-mini', // Using mini for speed/cost balance, can be gpt-4o
                        messages: [{ role: 'system', content: prompt }],
                        response_format: { type: "json_object" },
                        temperature: 0.7
                    })
                });
                
                if (response.ok) {
                    const data = await response.json();
                    return data.choices[0].message.content;
                } else {
                    console.error("[AI Provider] OpenAI API Error:", await response.text());
                }
            } catch (err) {
                console.error("[AI Provider] OpenAI Fetch Error:", err);
            }
        }

        // 2. Ollama (Local) for Free Users if configured
        if (useOllama) {
            console.log("[AI Provider Factory] Routing to local Ollama");
            try {
                const response = await fetch(`${process.env.OLLAMA_URL}/api/generate`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        model: process.env.OLLAMA_MODEL || 'llama3',
                        prompt: prompt,
                        stream: false,
                        format: 'json'
                    })
                });
                if (response.ok) {
                    const data = await response.json();
                    return data.response;
                }
            } catch (err) {
                console.error("[AI Provider] Ollama Fetch Error:", err);
            }
        }

        // 3. Fallback to Gemini (Flash for Basic, Pro for Premium)
        const geminiModel = (plan === 'PRO' || plan === 'ENTERPRISE') ? "gemini-1.5-pro" : "gemini-1.5-flash";
        console.log(`[AI Provider Factory] Routing to Gemini (${geminiModel})`);
        const generativeModel = genAI.getGenerativeModel({ model: geminiModel });
        const result = await generativeModel.generateContent(prompt);
        return (await result.response).text();
    }

    /**
     * Generate the next question based on structured phase engine
     * Phase: OPENING HR → TECHNICAL (adaptive) → CLOSING HR
     */
    async generateNextQuestion(interviewId, previousResponse = null) {
        let phase = 'TECHNICAL';
        try {
            console.log(`[generateNextQuestion] Starting for interview: ${interviewId}`);

            const interview = await prisma.interview.findUnique({
                where: { id: interviewId },
                include: {
                    questions: {
                        include: { response: true },
                        orderBy: { order: 'asc' }
                    },
                    user: {
                        select: { plan: true }
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

            // Determine max questions from duration
            const maxQuestions = this.getMaxQuestionsFromDuration(interview.duration || 30);
            console.log(`[generateNextQuestion] Q#${questionCount + 1} of ${maxQuestions} (${interview.duration}min)`);

            if (questionCount >= maxQuestions) {
                return null; // End Interview
            }

            // Determine phase
            const phaseInfo = this.getInterviewPhase(questionCount, maxQuestions);
            phase = phaseInfo.phase;
            const indexInPhase = phaseInfo.indexInPhase;

            console.log(`[generateNextQuestion] Phase: ${phase}, Index: ${indexInPhase}`);

            // ── OPENING PHASE: Use fixed HR bank questions ──────────────────
            if (phase === 'OPENING') {
                const hrQuestion = this.HR_OPENING_QUESTIONS[indexInPhase] ||
                    "Tell me about your background and experience.";
                return {
                    question: hrQuestion,
                    type: 'HR',
                    avatarRole: 'HR Manager',
                    avatarId: 'hr-manager',
                    phase: 'OPENING',
                    phaseLabel: `Opening Q${indexInPhase + 1}/5`
                };
            }

            // ── CLOSING PHASE: Use fixed closing HR questions ───────────────
            if (phase === 'CLOSING') {
                const hrQuestion = this.HR_CLOSING_QUESTIONS[indexInPhase] ||
                    "Do you have any questions for us?";
                return {
                    question: hrQuestion,
                    type: 'HR',
                    avatarRole: 'HR Manager',
                    avatarId: 'hr-manager',
                    phase: 'CLOSING',
                    phaseLabel: `Closing Q${indexInPhase + 1}/5`
                };
            }

            // ── TECHNICAL PHASE: AI-generated adaptive questions ────────────
            let difficulty = interview.difficulty || 'INTERMEDIATE';
            // Adaptive Difficulty Logic
            if (previousResponse && previousResponse.score !== undefined) {
                if (previousResponse.score >= 75) {
                    if (difficulty === 'BEGINNER') difficulty = 'INTERMEDIATE';
                    else if (difficulty === 'INTERMEDIATE') difficulty = 'ADVANCED';
                } else if (previousResponse.score < 50) {
                    if (difficulty === 'ADVANCED') difficulty = 'INTERMEDIATE';
                    else if (difficulty === 'INTERMEDIATE') difficulty = 'BEGINNER';
                }
            }

            // Extract resume text
            let resumeText = "";
            if (interview.resumeUrl) {
                try {
                    const extracted = await this.extractTextFromPDF(interview.resumeUrl);
                    resumeText = extracted || "";
                } catch (pdfError) {
                    console.error(`[generateNextQuestion] PDF Extraction failed:`, pdfError);
                }
            }

            // Determine if this is an HR behavioral question mid-tech round
            const technicalQuestionIndex = indexInPhase + 1;
            const isHrBehavioral = technicalQuestionIndex % 4 === 0; // Every 4th tech question = behavioral
            const questionType = isHrBehavioral ? 'BEHAVIORAL' : 'TECHNICAL';
            const avatarRole = isHrBehavioral ? 'HR Manager' : 'Tech Lead';

            const prompt = `You are an expert AI interviewer conducting a structured technical interview.

INTERVIEW CONTEXT:
- Candidate Role: ${interview.role}
- Domain/Industry: ${interview.domain}
- Core Technologies/Skills: ${interview.technology || interview.domain}
- Current Difficulty: ${difficulty}
- Interview Phase: TECHNICAL (Question ${technicalQuestionIndex} of the technical round)
- Question Type Needed: ${questionType}

CANDIDATE RESUME CONTEXT:
${resumeText || "No resume uploaded — generate questions based on the stated role and technologies."}

PREVIOUS QUESTION ASKED: "${previousResponse?.question?.question || 'None'}"
CANDIDATE'S EXACT ANSWER TO PREVIOUS QUESTION: "${previousResponse?.answer || 'None'}"

PREVIOUS QUESTIONS HISTORY (DO NOT REPEAT THESE TOPICS):
${existingQuestions.map((q, i) => `${i + 1}. [${q.type}] ${q.text} (Score: ${q.score || 'N/A'})`).join('\n')}

PREVIOUS ANSWER BRIEF FEEDBACK: "${previousResponse?.briefFeedback || 'None'}"

TASK:
${isHrBehavioral
    ? `Generate ONE behavioral/situational question relevant to the candidate's role. 
       Focus on: teamwork, handling pressure, problem solving, taking initiative, or handling failure.
       Example: "Describe a time when you had to solve a complex problem under tight deadlines..."`
    : `Decide whether to ask a NEW topic, or a FOLLOW-UP question based on the candidate's exact answer provided above.
       - Ask a FOLLOW-UP if their answer lacked depth, or if they mentioned a specific technology/scenario that warrants deeper probing. Keep follow-ups conversational (e.g. "You mentioned using Redis. How did you handle cache invalidation in that scenario?").
       - Ask a NEW topic if they perfectly answered the previous question, or if you have already asked a follow-up.
       - If asking a NEW topic, cover one of these areas (pick the LEAST covered so far): Core concepts, Problem-solving, System design, Best practices, Real-world scenarios.
       - Technology focus: ${interview.technology || interview.domain}`
}

Return ONLY a valid JSON object:
{
    "question": "The exact question text here",
    "type": "${questionType}",
    "avatarRole": "${avatarRole}",
    "difficulty": "${difficulty}",
    "topicArea": "Brief label of topic covered (e.g. 'React Hooks', 'System Design', 'Teamwork')",
    "isFollowUp": true/false
}`;

            console.log(`[generateNextQuestion] Requesting AI Generation for ${phase} phase`);
            const text = await this.generateWithAIProvider(prompt, interview);

            // Robust JSON extraction
            let jsonStr = text.trim();
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                jsonStr = jsonMatch[0];
            } else {
                jsonStr = text.replace(/```json|```/gi, '').trim();
            }

            const aiResponse = JSON.parse(jsonStr);
            console.log(`[generateNextQuestion] Generated TECHNICAL Q: ${aiResponse.question?.substring(0, 60)}...`);

            // Map types to valid Prisma enum values
            const typeMap = {
                'CONCEPTUAL': 'TECHNICAL', 'REAL_WORLD': 'TECHNICAL', 'SCENARIO': 'SITUATIONAL',
                'TECHNICAL': 'TECHNICAL', 'BEHAVIORAL': 'BEHAVIORAL', 'SITUATIONAL': 'SITUATIONAL',
                'HR': 'HR', 'CODING': 'CODING'
            };
            const finalType = typeMap[aiResponse.type?.toUpperCase()] || 'TECHNICAL';

            return {
                question: aiResponse.question,
                type: finalType,
                avatarRole: aiResponse.avatarRole || avatarRole,
                avatarId: isHrBehavioral ? 'hr-manager' : 'tech-lead',
                difficulty: aiResponse.difficulty || difficulty,
                phase: 'TECHNICAL',
                phaseLabel: aiResponse.isFollowUp ? `Follow-up Q${technicalQuestionIndex}` : `Technical Q${technicalQuestionIndex}`,
                topicArea: aiResponse.topicArea || interview.technology || interview.domain,
                isFollowUp: aiResponse.isFollowUp || false
            };
        } catch (error) {
            console.error(`[generateNextQuestion] Error:`, error);
            return {
                question: phase === 'CLOSING'
                    ? "Do you have any questions for us?"
                    : phase === 'OPENING'
                    ? "Tell me about yourself and your background."
                    : "Tell me about a challenging technical problem you solved recently.",
                type: (phase === 'OPENING' || phase === 'CLOSING') ? 'HR' : 'SITUATIONAL',
                avatarRole: (phase === 'OPENING' || phase === 'CLOSING') ? 'HR Manager' : 'Tech Lead',
                avatarId: (phase === 'OPENING' || phase === 'CLOSING') ? 'hr-manager' : 'tech-lead',
                phase: phase,
                phaseLabel: phase,
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

            const resText = await this.generateWithAIProvider(prompt, null, true);
            const jsonText = resText.trim().replace(/```json|```/gi, '');
            return JSON.parse(jsonText);
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
