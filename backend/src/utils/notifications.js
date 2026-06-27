/**
 * Utility functions for sending automated notifications.
 * Currently mocks the integration by logging to the console.
 * Replace with actual integration (e.g., Nodemailer, SendGrid, Twilio) once API keys are available.
 */

const sendDemoEmail = async (studentName, studentEmail, scheduledTime, meetingLink) => {
    console.log(`\n======================================================`);
    console.log(`[EMAIL DISPATCH] To: ${studentEmail}`);
    console.log(`Subject: Your Demo Session is Confirmed!`);
    console.log(`Body:`);
    console.log(`Hi ${studentName},`);
    console.log(`Your demo session is scheduled for ${new Date(scheduledTime).toLocaleString()}.`);
    console.log(`Please join using this meeting link: ${meetingLink}`);
    console.log(`We look forward to speaking with you!`);
    console.log(`======================================================\n`);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return true;
};

const sendDemoWhatsApp = async (studentName, studentPhone, scheduledTime, meetingLink) => {
    console.log(`\n======================================================`);
    console.log(`[WHATSAPP DISPATCH] To: ${studentPhone}`);
    console.log(`Message:`);
    console.log(`Hi ${studentName}! 🚀 Your Techwell demo is confirmed for ${new Date(scheduledTime).toLocaleString()}.`);
    console.log(`Join here: ${meetingLink}`);
    console.log(`See you soon!`);
    console.log(`======================================================\n`);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return true;
};

module.exports = {
    sendDemoEmail,
    sendDemoWhatsApp
};
