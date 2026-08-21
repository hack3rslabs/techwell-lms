const nodemailer = require('nodemailer');
const axios = require('axios');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL } } });

const sendEmail = async ({ to, subject, text, html, templateParams }) => {
    try {
        const config = await prisma.emailIntegration.findFirst({
            where: { isActive: true }
        });

        if (!config) {
            console.log('No active email configuration found.');
            return false;
        }

        const fraudWarningText = "\n\n⚠️ SECURITY & FRAUD ALERT\nTechwell does not authorize unknown individuals to collect payments or make commitments on its behalf. Always verify through official channels. When in doubt, contact support@techwell.co.in immediately.";
        const fraudWarningHtml = `
            <br/><br/>
            <div style="background-color: #fff8f0; border: 1px solid #ffe8cc; border-left: 4px solid #ff9900; padding: 15px; font-family: sans-serif; font-size: 12px; color: #555; margin-top: 30px;">
                <strong style="color: #cc7a00; display: block; margin-bottom: 5px; font-size: 14px;">⚠️ SECURITY & FRAUD ALERT</strong>
                <p style="margin: 0;">Techwell does not authorize unknown individuals to collect payments or make commitments on its behalf. Always verify through official channels. When in doubt, contact <a href="mailto:support@techwell.co.in" style="color: #cc7a00; text-decoration: underline;">support@techwell.co.in</a> immediately.</p>
            </div>
        `;

        const enhancedText = text ? text + fraudWarningText : undefined;
        const enhancedHtml = html ? html + fraudWarningHtml : undefined;

        if (config.provider === 'EMAILJS') {
            const emailJsData = {
                service_id: config.serviceId,
                template_id: config.templateId,
                user_id: config.publicKey,
                accessToken: config.privateKey,
                template_params: {
                    to_email: to,
                    subject,
                    message: enhancedText,
                    ...templateParams
                }
            };
            await axios.post('https://api.emailjs.com/api/v1.0/email/send', emailJsData);
            console.log(`Email sent via EmailJS to ${to}`);
            return true;

        } else if (config.provider === 'SMTP') {
            const transporter = nodemailer.createTransport({
                host: config.host,
                port: config.port,
                secure: config.port === 465,
                auth: {
                    user: config.user,
                    pass: config.pass
                }
            });

            await transporter.sendMail({
                from: config.fromEmail || config.user,
                to,
                subject,
                text: enhancedText,
                html: enhancedHtml
            });
            console.log(`Email sent via SMTP to ${to}`);
            return true;
        }

    } catch (error) {
        console.error('Email Sending Failed:', error.message);
        return false;
    }
};

module.exports = { sendEmail };
