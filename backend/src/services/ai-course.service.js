/**
 * AI Course Generation Service
 * Uses Google Gemini (Google AI Studio) to generate comprehensive course curriculums.
 */
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const generateCourseStructure = async (topic, difficulty) => {
    if (!process.env.GEMINI_API_KEY) {
        console.warn("Gemini API Key missing. Falling back to mock.");
        return mockGenerate(topic, difficulty);
    }

    try {
        const prompt = `Act as an expert curriculum designer and subject matter expert.
Create a comprehensive professional course structure for the topic: "${topic}".
Difficulty Level: ${difficulty}.

The output MUST be valid JSON strictly following this schema:
{
    "title": "Engaging Course Title",
    "description": "2-3 sentence marketing description",
    "category": "Technology/Business/Design/etc",
    "difficulty": "${difficulty}",
    "price": Number (approximate market price in INR, e.g. 4999),
    "discountPrice": Number (slightly lower than price),
    "courseCode": "Short alphanumeric code (e.g. REACT-101)",
    "jobRoles": ["Role 1", "Role 2"],
    "bannerUrl": "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80",
    "modules": [
        {
            "title": "Module Title",
            "description": "Brief description",
            "orderIndex": 0,
            "lessons": [
                {
                    "title": "Lesson Title",
                    "content": "Detailed educational content in Markdown format. Should be at least 3-4 paragraphs.",
                    "videoUrl": "https://www.youtube.com/watch?v=dummy (or a relevant real link if known)",
                    "duration": Number (estimated seconds, e.g. 600 for 10 mins),
                    "order": 0,
                    "quizzes": [
                        {
                            "question": "Multiple choice question",
                            "options": ["Option A", "Option B", "Option C", "Option D"],
                            "correctAnswer": "Option A"
                        }
                    ]
                }
            ]
        }
    ]
}

Requirements:
1. Generate at least 4 Modules.
2. Each Module must have at least 3 Lessons.
3. Include at least 1 Quiz per Module (attached to the last lesson).
4. "bannerUrl" should be a relevant Unsplash ID (keep the provided one as fallback if unsure).
5. "videoUrl" should be a valid-looking YouTube URL.
6. "content" MUST be rich markdown text.
7. Return ONLY the JSON object, no markdown code blocks.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text().trim().replace(/```json|```/gi, '');
        const courseData = JSON.parse(text);
        return courseData;

    } catch (error) {
        console.error("Gemini Course Generation Error:", error);
        // Fallback to mock on error
        return mockGenerate(topic, difficulty);
    }
};

const mockGenerate = (topic, difficulty) => {
    const level = difficulty || 'BEGINNER';
    const modules = [];

    // Module 1: Introduction
    modules.push({
        title: `Introduction to ${topic}`,
        description: `Get started with the basics of ${topic}`,
        orderIndex: 0,
        lessons: [
            {
                title: `What is ${topic}?`,
                content: `### Overview\n\n${topic} is a transformative technology that enables...\n\n### Key Concepts\n- Concept 1\n- Concept 2`,
                videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
                duration: 300,
                order: 0
            },
            {
                title: `Setting up your environment`,
                content: `### Installation\n\n1. Download the installer...\n2. Run the setup wizard...\n\n\`\`\`bash\nnpm install ${topic.toLowerCase()}\n\`\`\``,
                videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
                duration: 600,
                order: 1
            }
        ]
    });

    return {
        title: `Mastering ${topic} (Fallback)`,
        description: `Generated (Mock) because AI service is unavailable.`,
        category: 'Technology',
        difficulty: level,
        price: 2999,
        discountPrice: 1999,
        courseCode: `${topic.substring(0, 3).toUpperCase()}-101`,
        jobRoles: [`${topic} Developer`],
        bannerUrl: "https://images.unsplash.com/photo-1587620962725-abab7fe55159?w=800&q=80",
        modules
    };
}

module.exports = {
    generateCourseStructure
};
