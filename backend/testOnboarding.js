const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const AICore = require('./src/ai-core');

async function run() {
    console.log("--- 1. Seeding User & Course ---");
    const user = await prisma.user.create({
        data: {
            name: "New Student",
            email: `student${Date.now()}@techwell.co.in`,
            password: "hashedpassword",
            phone: "+911234567890"
        }
    });
    const course = await prisma.course.create({
        data: {
            title: "Test Course",
            slug: `test-course-${Date.now()}`,
            description: "Test",
            price: 0,
            isPublished: true,
            category: "TEST_CATEGORY",
            instructorId: user.id
        }
    });

    console.log("--- 2. Seeding Student Onboarding Workflow ---");
    const workflow = await prisma.aiWorkflow.create({
        data: {
            name: "Student Welcome Onboarding",
            status: "ACTIVE",
            triggerType: "EVENT",
            triggerData: { eventType: "student.enrolled" }
        }
    });
    
    // create nodes
    const triggerNode = await prisma.aiWorkflowNode.create({ data: { workflowId: workflow.id, type: 'TRIGGER', label: 'Student Enrolled' } });
    const aiNode = await prisma.aiWorkflowNode.create({ data: { workflowId: workflow.id, type: 'AI_REASON', label: 'Draft Welcome Email', config: { systemPrompt: "Write a welcoming email to the new student." } } });
    const actionNode = await prisma.aiWorkflowNode.create({ data: { workflowId: workflow.id, type: 'ACTION', label: 'Send Email', config: { actionType: "SEND_EMAIL" } } });

    await prisma.aiWorkflowEdge.createMany({
        data: [
            { workflowId: workflow.id, sourceNodeId: triggerNode.id, targetNodeId: aiNode.id },
            { workflowId: workflow.id, sourceNodeId: aiNode.id, targetNodeId: actionNode.id }
        ]
    });
    console.log(`Created Workflow ID: ${workflow.id}`);

    console.log("--- 3. Simulating Free Checkout (Calling Code directly) ---");
    
    // Simulate what payment.routes.js does
    const enrollment = await prisma.enrollment.upsert({
        where: {
            userId_courseId: {
                userId: user.id,
                courseId: course.id
            }
        },
        update: { status: 'ACTIVE' },
        create: {
            userId: user.id,
            courseId: course.id,
            status: 'ACTIVE'
        }
    });

    await AICore.trackEvent('student.enrolled', 'LMS_FREE_CHECKOUT', {
        userId: user.id,
        courseId: course.id,
        enrollment
    });

    console.log("Test Finished. Check above logs for EventBus and WorkflowEngine output.");
}

run()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
