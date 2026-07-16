/**
 * WhatsApp Business API Service (Mock)
 * Simulates sending WhatsApp messages for notifications.
 * Can be replaced with Twilio or Meta Graph API later.
 */
class WhatsAppService {
    static async sendTemplateMessage(phone, templateName, variables) {
        if (!phone) return false;

        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));

        console.log(`\n=========================================`);
        console.log(`💬 [WHATSAPP MESSAGE SENT]`);
        console.log(`📱 To: ${phone}`);
        console.log(`📄 Template: ${templateName}`);
        console.log(`📊 Variables:`, variables);
        console.log(`=========================================\n`);

        return true;
    }

    static async notifyJobApplication(phone, userName, jobTitle, companyName) {
        return this.sendTemplateMessage(phone, 'job_application_received', {
            userName,
            jobTitle,
            companyName
        });
    }

    static async notifyInterviewScheduled(phone, userName, companyName, time) {
        return this.sendTemplateMessage(phone, 'interview_scheduled', {
            userName,
            companyName,
            time
        });
    }
}

module.exports = WhatsAppService;
