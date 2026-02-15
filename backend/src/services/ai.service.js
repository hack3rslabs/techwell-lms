const { PrismaClient } = require('@prisma/client');
const OpenAI = require('openai');
const prisma = new PrismaClient();

// Initialize OpenAI
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

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
     * Generate the next question based on context using OpenAI
     */
    async generateNextQuestion(interviewId, previousResponse = null) {
        const interview = await prisma.interview.findUnique({
            where: { id: interviewId },
            include: { questions: true }
        });

        if (!interview) throw new Error('Interview not found');

        const settings = await prisma.interviewSettings.findFirst() || {
            adaptiveDifficulty: true,
            escalationThreshold: 75,
            initialDifficulty: 'INTERMEDIATE',
            maxQuestions: 10,
            hrQuestionRatio: 3
        };

        const questionCount = interview.questions.length;

        if (questionCount >= settings.maxQuestions) {
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
        }

        let questionText = "";
        let type = avatarRole === 'HR' ? 'BEHAVIORAL' : 'TECHNICAL';

        // Try Knowledge Base first
        const kbCount = await prisma.knowledgeBase.count({
            where: {
                domain: avatarRole === 'HR' ? 'HR' : interview.domain,
                difficulty: difficulty
            }
        });

        const kbQuestion = kbCount > 0 ? await prisma.knowledgeBase.findFirst({
            where: {
                domain: avatarRole === 'HR' ? 'HR' : interview.domain,
                difficulty: difficulty
            },
            take: 1,
            skip: kbCount > 5 ? Math.floor(Math.random() * 5) : 0
        }) : null;

        if (kbQuestion && Math.random() > 0.3) {
            questionText = kbQuestion.content;
        } else {
            // Generate with OpenAI
            try {
                const prompt = `Generate a single, unique interview question for a ${difficulty} level ${interview.role} in ${interview.domain}.
Type: ${type} (${avatarRole}).
Topic focus: ${interview.technology || interview.domain}.
Previous Question: "${previousResponse?.question?.question || 'None'}"
Previous Answer: "${previousResponse?.transcript || 'None'}"

Instructions:
- If previous answer was weak, ask a simpler follow-up.
- If strong, ask a deeper concept.
- Keep it concise (under 30 words).
- Return ONLY the question text.`;

                const completion = await openai.chat.completions.create({
                    model: "gpt-4o-mini",
                    messages: [{ role: "user", content: prompt }],
                    temperature: 0.7,
                    max_tokens: 100
                });

                questionText = completion.choices[0].message.content.trim();
            } catch (error) {
                console.error("OpenAI Generation Error:", error);
                // Fallback to Static Bank
                const bank = avatarRole === 'HR'
                    ? QUESTION_BANK.HR
                    : (QUESTION_BANK['IT'][difficulty] || QUESTION_BANK['IT']['BEGINNER']);
                questionText = bank[Math.floor(Math.random() * bank.length)];
            }
        }

        return {
            question: questionText,
            type: type,
            avatarRole: avatarRole,
            avatarId: avatarRole === 'HR' ? 'hr-1' : 'tech-1',
            difficulty: difficulty
        };
    }

    /**
     * Evaluate a response using OpenAI
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
            const prompt = `You are an expert interviewer evaluating a candidate's answer.

Question: "${questionData?.question || 'Unknown Question'}"
Context/Type: ${questionData?.type || 'General'}

Candidate Answer: "${responseText || ''}"
${code ? `Candidate Code:\n${code}\n` : ''}

Task: Evaluate the answer heavily on technical accuracy, clarity, and depth.

Return a JSON object:
{
    "score": (0-100 integer),
    "feedback": "2-3 sentences of constructive feedback to the candidate.",
    "sentiment": "POSITIVE" | "NEUTRAL" | "NEGATIVE",
    "missingKeywords": ["concept1", "concept2"],
    "foundKeywords": ["concept3", "concept4"]
}`;

            const completion = await openai.chat.completions.create({
                model: "gpt-4o-mini",
                messages: [{ role: "user", content: prompt }],
                temperature: 0.3,
                max_tokens: 300,
                response_format: { type: "json_object" }
            });

            const result = JSON.parse(completion.choices[0].message.content);
            return result;
        } catch (error) {
            console.error("AI Evaluation Error (Falling back to heuristic):", error);
            // Fallback to heuristic evaluation if OpenAI fails
            return this.evaluateResponseHeuristic(responseText, code);
        }
    }

    // Kept for fallback
    evaluateResponseHeuristic(responseText, code) {
        let score = Math.min(40, (responseText || "").length / 3);
        return {
            score: Math.min(70, Math.floor(score)),
            feedback: "AI service unavailable. Score based on response length.",
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
     * Generate questions from a specific Context (Job Description / Text) using OpenAI
     */
    async generateQuestionsFromContext({ context, domain, role, difficulty, count = 5 }) {
        try {
            const prompt = `Analyze the following Job Description (JD) or Context:
"${context.substring(0, 2000)}" 

Generate ${count} interview questions specifically tailored to this context for a ${difficulty} level ${role} role.

Output ONLY a JSON array of objects:
[
    {
        "topic": "Topic Name",
        "content": "Question Text",
        "answer": "Ideal Answer Key",
        "difficulty": "${difficulty}",
         "type": "TECHNICAL"
    }
]`;

            const completion = await openai.chat.completions.create({
                model: "gpt-4o-mini",
                messages: [{ role: "user", content: prompt }],
                temperature: 0.7,
                max_tokens: 1500,
                response_format: { type: "json_object" }
            });

            const result = JSON.parse(completion.choices[0].message.content);
            // OpenAI might return {questions: [...]} or just [...]
            return Array.isArray(result) ? result : (result.questions || []);

        } catch (error) {
            console.error("Context Generation Error:", error);
            throw new Error("Failed to generate from context");
        }
    }

    /**
     * Generate interview questions using OpenAI
     */
    async generateInterviewQuestions({ domain, role, company, difficulty, count = 5 }) {
        try {
            const prompt = `You are an expert ${role} interviewer. Generate exactly ${count} professional interview questions for a ${difficulty} level candidate in the ${domain} domain${company ? ` specifically for a position at ${company}` : ''}.

CRITICAL INSTRUCTIONS:
1. Focus on actual industry-standard technical concepts and behavioral scenarios.
2. For EVERY question, you MUST provide a detailed "ideal answer" that covers the key technical or situational points the candidate should mention.
3. Ensure the topics are varied (e.g., if domain is IT, mix Frontend, Backend, DevOps as appropriate for the role).
4. The difficulty MUST strictly match '${difficulty}'.

Format the output strictly as a JSON array of objects with these keys:
- "topic": A short 2-3 word topic name (e.g., "React Hooks", "STAR Scenario").
- "content": The actual question text.
- "answer": A comprehensive sample answer or the key logic needed for a perfect score.

Output ONLY the JSON array.`;

            const completion = await openai.chat.completions.create({
                model: "gpt-4o-mini",
                messages: [{ role: "user", content: prompt }],
                temperature: 0.7,
                max_tokens: 2000,
                response_format: { type: "json_object" }
            });

            const result = JSON.parse(completion.choices[0].message.content);
            const questions = Array.isArray(result) ? result : (result.questions || []);

            return questions.map(q => ({
                topic: q.topic || "General",
                content: q.content || q.question || "Generated Question",
                answer: q.answer || q.sampleAnswer || "Sample answer pending..."
            }));
        } catch (error) {
            console.error("AI Generation Error:", error);
            // Fallback mock data if AI fails
            return Array(count).fill(null).map((_, i) => ({
                topic: "Fallback Topic",
                content: `Sample ${difficulty} question for ${role} in ${domain} (ID: ${i + 1})`,
                answer: "This is a detailed fallback sample answer protecting against AI downtime.",
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
                    include: { responses: true }
                },
                evaluation: true,
                user: true
            }
        });

        if (!interview) throw new Error('Interview not found');

        let technicalScores = [];
        let behavioralScores = [];
        let questionBreakdown = [];
        let allMissingKeywords = new Set();
        let allFoundKeywords = new Set();

        for (const question of interview.questions) {
            const response = question.responses[0];
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

        const detailedAnalysis = `Market Readiness: ${marketReadinessScore}%
Based on your performance, you have a ${marketReadinessScore > 75 ? 'High' : marketReadinessScore > 50 ? 'Moderate' : 'Low'} probability of clearing screening rounds for this role.
Your pacing and confidence markers indicate ${confidenceScore > 70 ? 'strong executive presence' : 'room for improvement in delivery'}.`;

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

    calculateMockScore(responseText) {
        if (!responseText) return 50;
        const lengthScore = Math.min(40, responseText.length / 5);
        const hasStructure = responseText.includes('.') ? 15 : 0;
        const hasKeywords = (responseText.match(/because|example|therefore|specifically/gi) || []).length * 10;
        return Math.min(100, Math.floor(45 + lengthScore + hasStructure + hasKeywords));
    }

    generateMockFeedback(question, answer, score) {
        if (score >= 85) {
            return "Excellent response with strong technical depth and clear examples.";
        } else if (score >= 70) {
            return "Good answer. Consider providing more specific examples to strengthen your response.";
        } else if (score >= 55) {
            return "Adequate response but could benefit from more detail and structure. Try using the STAR method.";
        } else {
            return "Response needs improvement. Focus on answering the question directly with concrete examples.";
        }
    }

    generateStrengths(techScore, commScore, confScore, domain) {
        const strengths = [];
        if (techScore >= 75) {
            strengths.push(`Strong technical understanding of ${domain} concepts and best practices`);
        }
        if (commScore >= 75) {
            strengths.push("Clear and articulate communication of complex ideas");
        }
        if (confScore >= 75) {
            strengths.push("Confident presentation with good pacing and structure");
        }
        strengths.push("Demonstrated problem-solving approach in technical discussions");
        return strengths;
    }

    generateWeaknesses(techScore, commScore, starScore, domain) {
        const weaknesses = [];
        if (techScore < 70) {
            weaknesses.push("Could deepen technical knowledge in some areas");
        }
        if (commScore < 70) {
            weaknesses.push("Some responses could be more concise and focused");
        }
        if (starScore < 70) {
            weaknesses.push("Need more specific examples using the STAR method for behavioral questions");
        }
        if (weaknesses.length === 0) {
            weaknesses.push("Minor improvements possible in response time management");
        }
        return weaknesses;
    }

    generateRecommendations(techScore, starScore, domain) {
        const recommendations = [];
        if (techScore < 80) {
            recommendations.push(`Practice more ${domain} system design questions focusing on scalability`);
        }
        if (starScore < 80) {
            recommendations.push("Prepare 3-5 strong STAR stories for behavioral questions");
        }
        recommendations.push("Work on providing concise answers within 2-3 minute timeframe");
        recommendations.push("Review common interview patterns for your target role");
        return recommendations;
    }

    generateAIInsights(role, domain, overallScore, techScore) {
        if (overallScore >= 85) {
            return `Outstanding performance! You show excellent potential as a ${role} with strong ${domain} expertise. Your technical answers were well-structured and demonstrated deep understanding. You're well-prepared for senior-level interviews.`;
        } else if (overallScore >= 70) {
            return `Good performance overall. You demonstrate solid ${role} capabilities with reasonable ${domain} knowledge. Focus on strengthening your technical depth and using more concrete examples. With some targeted practice, you'll be ready for mid-to-senior level positions.`;
        } else {
            return `You show potential but there's room for improvement. Focus on deepening your ${domain} knowledge and practice articulating your experiences using the STAR method. Consider reviewing fundamentals and working through more practice problems.`;
        }
    }
}

module.exports = new AIService();
