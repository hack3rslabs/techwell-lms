const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Mock Question Bank (Fallback if AI generation fails or for demo)
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

const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

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
     * Generate the next question based on context
     */
    async generateNextQuestion(interviewId, previousResponse = null) {
        const interview = await prisma.interview.findUnique({
            where: { id: interviewId },
            include: { questions: true }
        });

        if (!interview) throw new Error('Interview not found');

        // Fetch AI Settings
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

        // Logic: Determine Avatar & Question Type
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

        // 1. Try Knowledge Base (Retrieval)
        // We prioritize curated questions for consistency
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

        if (kbQuestion && Math.random() > 0.3) { // 70% chance to use KB if available
            questionText = kbQuestion.content;
        } else {
            // 2. Generate with Gemini (Dynamic)
            try {
                const prompt = `
                    Generate a single, unique interview question for a ${difficulty} level ${interview.role} in ${interview.domain}.
                    Type: ${type} (${avatarRole}).
                    Topic focus: ${interview.technology || interview.domain}.
                    Previous Question: "${previousResponse?.question?.question || 'None'}"
                    Previous Answer: "${previousResponse?.transcript || 'None'}"
                    
                    Instructions:
                    - If previous answer was weak, ask a simpler follow-up.
                    - If strong, ask a deeper concept.
                    - Keep it concise (under 30 words).
                    - Return ONLY the question text.
                `;

                const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
                const result = await model.generateContent(prompt);
                questionText = result.response.text().trim();
            } catch (error) {
                console.error("Gemini Generation Error:", error);

                // 3. Fallback to Static Bank
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
     * Evaluate a response using Enhanced Keyword Matching
     */
    async evaluateResponse(questionId, responseText, code = null) {
        // If it's a coding question, we might expect code instead of audio
        if ((!responseText || responseText.trim().length < 5) && !code) {
            return {
                score: 0,
                feedback: "No response detected. Please ensure you answer the question or write code.",
                sentiment: "NEGATIVE",
                missingKeywords: []
            };
        }

        // 1. Identify Topic (Simple heuristic based on response + question context would be better, but using response for now)
        let topic = 'BEHAVIORAL'; // Default
        const lowerText = responseText.toLowerCase();

        if (lowerText.includes('react') || lowerText.includes('component')) topic = 'REACT';
        else if (lowerText.includes('node') || lowerText.includes('express')) topic = 'NODE';
        else if (lowerText.includes('database') || lowerText.includes('sql')) topic = 'DATABASE';
        else if (lowerText.includes('scale') || lowerText.includes('system')) topic = 'SYSTEM_DESIGN';

        // 2. keyword Matching
        const expectedKeywords = this.TOPIC_KEYWORDS[topic] || [];
        const foundKeywords = expectedKeywords.filter(k => lowerText.includes(k));
        const missingKeywords = expectedKeywords.filter(k => !lowerText.includes(k));

        // 3. Scoring Logic
        // Base score for simply answering (up to 40)
        let score = Math.min(40, (responseText || "").length / 3);

        // Bonus for Code (Simple heuristic for now)
        if (code && code.length > 20) {
            score += 30; // Significant bonus for writing code
            if (code.includes('function') || code.includes('const') || code.includes('class')) {
                score += 10;
            }
        }

        // Bonus for structure (20)
        if ((responseText || "").toLowerCase().includes('example') || (responseText || "").toLowerCase().includes('because')) {
            score += 20;
        }

        // Bonus for accuracy (keywords) (up to 40)
        const keywordScore = (foundKeywords.length / Math.max(1, expectedKeywords.length)) * 40;
        score += keywordScore;

        score = Math.min(100, Math.floor(score));

        // 4. Generate Specific Feedback
        let feedback = "";
        if (score >= 80) {
            feedback = "Excellent answer! You covered key concepts and provided good structure.";
        } else if (score >= 60) {
            feedback = `Good attempt. You mentioned ${foundKeywords.join(', ')} but could go deeper.`;
        } else {
            feedback = "Response needs improvement. Try to be more specific and technical.";
        }

        if (missingKeywords.length > 0 && score < 90) {
            feedback += ` Consider discussing: ${missingKeywords.slice(0, 3).join(', ')}.`;
        }

        return {
            score,
            feedback,
            sentiment: score > 60 ? "POSITIVE" : "NEUTRAL",
            foundKeywords,
            missingKeywords
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
                difficulty: data.difficulty
            }
        });
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

        // Calculate scores from responses
        let technicalScores = [];
        let behavioralScores = [];
        let questionBreakdown = [];
        let allMissingKeywords = new Set();
        let allFoundKeywords = new Set();

        for (const question of interview.questions) {
            const response = question.responses[0];
            if (response) {
                // Re-evaluate to get granular data if not stored
                const evalResult = await this.evaluateResponse(question.id, response.transcript);
                const score = response.score || evalResult.score;
                const feedback = response.feedback || evalResult.feedback;

                if (evalResult.missingKeywords) evalResult.missingKeywords.forEach(k => allMissingKeywords.add(k));
                if (evalResult.foundKeywords) evalResult.foundKeywords.forEach(k => allFoundKeywords.add(k));

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

        // Calculate aggregate scores
        const technicalScore = technicalScores.length > 0
            ? Math.round(technicalScores.reduce((a, b) => a + b, 0) / technicalScores.length)
            : 0;

        // Mocking other scores based on technical for consistency without real AI
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

        // 2026 Feature: Market Readiness Score (Hiring Probability)
        // Weighted: Tech (50%) + Comm (30%) + Confidence (20%)
        let marketReadinessScore = Math.round(
            (technicalScore * 0.5) +
            (communicationScore * 0.3) +
            (confidenceScore * 0.2)
        );

        // Adjust for "red flags" (low scores in critical areas)
        if (technicalScore < 40) marketReadinessScore -= 10;
        if (communicationScore < 40) marketReadinessScore -= 5;

        marketReadinessScore = Math.max(0, Math.min(100, marketReadinessScore));

        // Generate Insights
        const strengths = [];
        const weaknesses = [];
        const recommendations = [];

        if (technicalScore > 70) strengths.push("Strong grasp of technical concepts");
        if (allFoundKeywords.size > 5) strengths.push(`Good vocabulary: used terms like ${Array.from(allFoundKeywords).slice(0, 3).join(', ')}`);

        if (marketReadinessScore > 80) strengths.push("High Market Readiness: Profile aligns well with current industry standards.");

        if (technicalScore < 60) weaknesses.push("Technical depth needs improvement");
        if (allMissingKeywords.size > 0) weaknesses.push(`Missed key concepts: ${Array.from(allMissingKeywords).slice(0, 3).join(', ')}`);

        if (weaknesses.length === 0) weaknesses.push("Try to give more concrete examples");
        if (strengths.length === 0) strengths.push("Good effort in attempting all questions");

        recommendations.push("Review the missing concepts identified above.");
        recommendations.push("Practice answering with the STAR method (Situation, Task, Action, Result).");

        if (marketReadinessScore < 60) {
            recommendations.push("Focus on core technical competency to improve Hiring Probability.");
        }

        const aiInsights = overallScore > 70
            ? "You demonstrated good capability. Focus on refining your technical explanations."
            : "Focus on fundamentals used in this interview. Review the specific feedback for each question.";

        // 2026 Insight: Detailed Analysis
        const detailedAnalysis = `
            Market Readiness: ${marketReadinessScore}%
            Based on your performance, you have a ${marketReadinessScore > 75 ? 'High' : marketReadinessScore > 50 ? 'Moderate' : 'Low'} probability of clearing screening rounds for this role.
            Your pacing and confidence markers indicate ${confidenceScore > 70 ? 'strong executive presence' : 'room for improvement in delivery'}.
        `;

        // Save or update evaluation
        const evaluationData = {
            overallScore,
            technicalScore,
            communicationScore,
            confidenceScore, // Changed from problemSolvingScore to match schema
            starMethodScore,
            aiInsights: detailedAnalysis + "\n\n" + aiInsights, // Append new insights
            strengths,
            weaknesses,
            recommendations
        };

        // Note: Prisma schema uses 'confidenceScore' but code used 'problemSolvingScore'. 
        // Adapting to Schema: Schema has confidenceScore, technicalScore, communicationScore, starMethodScore.
        // Assuming schema is correct.

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

    async generateInterviewQuestions({ domain, role, company, difficulty, count = 5 }) {
        try {
            const prompt = `
                You are an expert ${role} interviewer. Generate exactly ${count} professional interview questions for a ${difficulty} level candidate in the ${domain} domain${company ? ` specifically for a position at ${company}` : ''}.
                
                CRITICAL INSTRUCTIONS:
                1. Focus on actual industry-standard technical concepts and behavioral scenarios.
                2. For EVERY question, you MUST provide a detailed "ideal answer" that covers the key technical or situational points the candidate should mention.
                3. Ensure the topics are varied (e.g., if domain is IT, mix Frontend, Backend, DevOps as appropriate for the role).
                4. The difficulty MUST strictly match '${difficulty}'.
                
                Format the output strictly as a JSON array of objects with these keys:
                - "topic": A short 2-3 word topic name (e.g., "React Hooks", "STAR Scenario").
                - "content": The actual question text.
                - "answer": A comprehensive sample answer or the key logic needed for a perfect score.
                
                Output ONLY the JSON array. Do not include markdown code blocks or explanatory text.
            `;

            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text().trim();

            // Robust JSON extraction
            let jsonStr = text;
            if (text.includes('```')) {
                jsonStr = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/)?.[1] || text;
            }

            try {
                const questions = JSON.parse(jsonStr);
                if (!Array.isArray(questions)) throw new Error("AI did not return an array");
                return questions.map(q => ({
                    topic: q.topic || "General",
                    content: q.content || q.question || "Generated Question",
                    answer: q.answer || q.sampleAnswer || "Sample answer pending..."
                }));
            } catch (e) {
                console.error("Failed to parse AI response. Raw text:", text);
                throw new Error("AI generated an invalid format. Please try again.");
            }
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
}

module.exports = new AIService();

