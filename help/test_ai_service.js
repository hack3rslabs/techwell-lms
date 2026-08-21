const aiService = require('./src/services/ai.service');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testAIService() {
    try {
        console.log('Testing aiService.generateNextQuestion...');
        // Create dummy interview
        const user = await prisma.user.findFirst({ where: { role: 'SUPER_ADMIN' } });
        const interview = await prisma.interview.create({
            data: {
                domain: "Software Engineering",
                role: "Frontend Developer",
                mode: "FULL",
                userId: user.id,
                status: "SCHEDULED",
                duration: 30
            }
        });

        console.log('Created Interview:', interview.id);

        // Add 5 dummy questions to move to TECHNICAL phase
        for(let i=1; i<=2; i++) {
            await prisma.interviewQuestion.create({
                data: {
                    interviewId: interview.id,
                    question: "HR Dummy " + i,
                    type: "HR",
                    order: i
                }
            });
        }

        console.log('Testing generateNextQuestion for TECHNICAL phase...');
        const techQ = await aiService.generateNextQuestion(interview.id);
        console.log('Tech Q Generated:', techQ);

    } catch (e) {
        console.error('Error:', e);
    } finally {
        await prisma.$disconnect();
    }
}
testAIService();
