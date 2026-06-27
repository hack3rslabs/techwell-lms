const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Seeding sample marketing leads...');

    const leads = [
        {
            name: "Rajesh Kumar",
            email: "rajesh.k@example.com",
            phone: "9876543210",
            source: "Meta Ads",
            leadType: "TRAINING",
            notes: "Interested in Full Stack Developer Bootcamp. Saw the summer discount ad.",
            status: "NEW",
            college: "IIT Delhi",
            location: "New Delhi",
            qualification: "B.Tech CS"
        },
        {
            name: "Sneha Reddy",
            email: "sneha.reddy@example.com",
            phone: "9123456789",
            source: "LinkedIn",
            leadType: "JOB_ENQUIRY",
            notes: "Looking for an internship in AI/ML. Has 6 months experience in Python.",
            status: "CONTACTED",
            college: "NIT Warangal",
            location: "Hyderabad",
            qualification: "M.Tech AI"
        },
        {
            name: "Global Tech Solutions",
            email: "admin@globaltech.com",
            phone: "9988776655",
            source: "Google Search",
            leadType: "SOFTWARE_REQUEST",
            notes: "Company needs a custom ERP solution built on Node.js and React.",
            status: "INTERESTED",
            location: "Bangalore",
        },
        {
            name: "Amit Patel",
            email: "amit.patel@business.com",
            phone: "9898989898",
            source: "JustDial",
            leadType: "SERVICE_REQUEST",
            notes: "Requires AMC for 50 computers and server maintenance.",
            status: "NEW",
            location: "Ahmedabad"
        },
        {
            name: "Priya Singh",
            email: "priya.s@example.com",
            phone: "9777777777",
            source: "WhatsApp Business API",
            leadType: "TRAINING",
            notes: "Wants brochure for Cyber Security course.",
            status: "QUALIFIED",
            college: "Delhi University",
            location: "Noida",
            qualification: "BCA"
        }
    ];

    for (const lead of leads) {
        await prisma.lead.create({
            data: lead
        });
        console.log(`Created lead: ${lead.name} (${lead.leadType})`);
    }

    console.log('Seeding completed successfully.');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
