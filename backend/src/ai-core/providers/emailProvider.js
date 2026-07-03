const nodemailer = require('nodemailer');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function getEmailConfig() {
  const integration = await prisma.aiIntegration.findUnique({
    where: { provider: 'SMTP' }
  });
  
  if (!integration || !integration.isActive || !integration.config) {
    throw new Error("SMTP Integration is not configured or inactive.");
  }
  
  return integration.config; // { host, port, user, pass, from }
}

async function sendEmail(to, subject, htmlBody) {
  try {
    const config = await getEmailConfig();
    
    const transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port || 587,
      secure: config.port === 465, 
      auth: {
        user: config.user,
        pass: config.pass
      }
    });

    const info = await transporter.sendMail({
      from: config.from || config.user,
      to: to,
      subject: subject,
      html: htmlBody
    });

    console.log(`[Email Provider] Sent email to ${to}. MessageId: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`[Email Provider] Failed to send email to ${to}:`, error.message);
    return { success: false, error: error.message };
  }
}

module.exports = {
  sendEmail
};
