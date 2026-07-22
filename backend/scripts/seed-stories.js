const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const stories = [
    {
        imagePath: "https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&q=80&w=800",
        altText: "Aisha Sharma - SDE-1 at Microsoft",
        url: "https://microsoft.com",
        isActive: true,
        order: 1
    },
    {
        imagePath: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=800",
        altText: "Rohan Patel - Cyber Security Analyst at Palo Alto Networks",
        url: "https://paloaltonetworks.com",
        isActive: true,
        order: 2
    },
    {
        imagePath: "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&q=80&w=800",
        altText: "Priya Desai - Senior Product Manager at Atlassian",
        url: "https://atlassian.com",
        isActive: true,
        order: 3
    },
    {
        imagePath: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&q=80&w=800",
        altText: "Ananya Singh - DevOps Engineer at Amazon",
        url: "https://amazon.jobs",
        isActive: true,
        order: 4
    },
    {
        imagePath: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=800",
        altText: "Techwell 2025 Placement Drive Highlights",
        url: "/placements",
        isActive: true,
        order: 5
    },
    {
        imagePath: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=800",
        altText: "Aditya Verma - Data Scientist at Google",
        url: "https://careers.google.com",
        isActive: true,
        order: 6
    }
];

async function seed() {
    try {
        console.log("Seeding Success Stories...");
        // Clear existing just in case or just append
        await prisma.successStory.deleteMany();
        
        for (const story of stories) {
            await prisma.successStory.create({
                data: story
            });
        }
        console.log("Successfully inserted", stories.length, "premium success stories!");
    } catch (error) {
        console.error("Error seeding success stories:", error);
    } finally {
        await prisma.$disconnect();
    }
}

seed();
