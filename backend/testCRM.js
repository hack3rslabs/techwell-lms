const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
    console.log("=== TECHWELL CRM TELE-SALES SIMULATION ===\n");

    console.log("1. Simulating External Lead Import (e.g. from Facebook Ads)");
    const lead = await prisma.lead.create({
        data: {
            name: "John Doe",
            email: `johndoe${Date.now()}@example.com`,
            phone: "+918888888888",
            source: "Facebook Ads",
            leadType: "TRAINING",
            notes: "Interested in Full Stack Developer course",
            status: "NEW"
        }
    });
    console.log(`✅ Lead Created: ${lead.name} (${lead.status}) from ${lead.source}`);

    // Wait 1 second
    await new Promise(r => setTimeout(r, 1000));

    console.log("\n2. Simulating Telecaller Activity (Calling the Lead)");
    
    // Telecaller logs the call
    await prisma.leadActivityLog.create({
        data: {
            leadId: lead.id,
            actionType: 'CALL_MADE',
            notes: 'Spoke to John, he wants to see the course syllabus.',
            performedBy: 'Telecaller_Agent_1'
        }
    });

    // Telecaller updates status to CONTACTED
    const updatedLead = await prisma.lead.update({
        where: { id: lead.id },
        data: {
            status: 'CONTACTED',
            notes: lead.notes + "\n\n[Telecaller Note]: Spoke to John, he wants to see the course syllabus."
        }
    });

    console.log(`✅ Call Logged in Activity History!`);
    console.log(`✅ Lead Pipeline Status Updated to: ${updatedLead.status}`);

    console.log("\n3. Simulating Telecaller Follow-up Automation Trigger");
    // Telecaller moves lead to INTERESTED
    const finalLead = await prisma.lead.update({
        where: { id: lead.id },
        data: { status: 'INTERESTED' }
    });
    
    console.log(`✅ Lead Pipeline Status Updated to: ${finalLead.status}`);
    
    const { sendEmail } = require('./src/utils/emailSender');
    console.log("➡️ Triggering Automated Follow-Up Email Module...");
    await sendEmail({
        to: finalLead.email,
        subject: 'Excited to have you interested in Techwell!',
        text: `Hi ${finalLead.name},\nWe are thrilled you are interested in Techwell!`,
        html: `<h2>Hi ${finalLead.name}!</h2><p>We are thrilled you are interested in Techwell!</p>`
    });

    console.log("\n=== SIMULATION COMPLETE ===");
    console.log("Open http://localhost:3000/admin/leads in your browser to view this lead in the UI!");
}

run()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
