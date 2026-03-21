/**
 * Email Service
 * Handles sending emails for various events.
 * Currently logs to console/file for V1/Dev.
 * Future: Integrate SendGrid/AWS SES.
 */

const { sendEmail: realSendEmail } = require('../utils/emailSender');

const sendEmail = async (to, subject, html) => {
    try {
        const success = await realSendEmail({
            to,
            subject,
            html,
            text: html.replace(/<[^>]*>/g, '') // Basic HTML to text conversion
        });
        
        if (!success) {
            console.log('Falling back to console logging for email:');
            console.log(`To: ${to}, Subject: ${subject}`);
        }
        
        return success;
    } catch (error) {
        console.error('Email service error:', error);
        return false;
    }
};

const sendWelcomeEmail = async (user) => {
    const subject = 'Welcome to TechWell!';
    const html = `
        <h1>Welcome, ${user.name}!</h1>
        <p>Thanks for joining TechWell. We're excited to have you.</p>
        <p>Explore our courses and start your journey today.</p>
    `;
    return sendEmail(user.email, subject, html);
};

const sendCertificateEmail = async (user, course) => {
    const subject = `Certificate Earned: ${course.title}`;
    const html = `
        <h1>Congratulations, ${user.name}!</h1>
        <p>You have successfully completed <strong>${course.title}</strong>.</p>
        <p>You can download your certificate from your dashboard.</p>
    `;
    return sendEmail(user.email, subject, html);
};

/**
 * Send interview scheduled notification to applicant
 */
const sendInterviewScheduledEmail = async (applicantEmail, applicantName, interviewDetails) => {
    const { jobTitle, companyName, roundName, scheduledAt, duration, meetingLink, platform } = interviewDetails;

    const dateStr = new Date(scheduledAt).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    const timeStr = new Date(scheduledAt).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        timeZoneName: 'short'
    });

    const subject = `Interview Scheduled: ${jobTitle} at ${companyName}`;
    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #2563eb;">Interview Scheduled! 🎉</h1>
            
            <p>Dear ${applicantName},</p>
            
            <p>Great news! Your interview has been scheduled for the <strong>${jobTitle}</strong> position at <strong>${companyName}</strong>.</p>
            
            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin-top: 0;">Interview Details</h3>
                <p><strong>Round:</strong> ${roundName}</p>
                <p><strong>Date:</strong> ${dateStr}</p>
                <p><strong>Time:</strong> ${timeStr}</p>
                <p><strong>Duration:</strong> ${duration} minutes</p>
                ${platform ? `<p><strong>Platform:</strong> ${platform}</p>` : ''}
            </div>
            
            ${meetingLink ? `
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${meetingLink}" style="background: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                        Join Meeting
                    </a>
                </div>
                <p style="color: #6b7280; font-size: 14px;">Meeting Link: <a href="${meetingLink}">${meetingLink}</a></p>
            ` : '<p style="color: #6b7280;">Meeting link will be shared separately.</p>'}
            
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;" />
            
            <p style="color: #6b7280; font-size: 14px;">
                Good luck with your interview! If you have any questions, please reach out to the recruiter.
            </p>
            
            <p>Best regards,<br/>The TechWell Team</p>
        </div>
    `;

    return sendEmail(applicantEmail, subject, html);
};

const sendOtpEmail = async (email, otp) => {
    const subject = 'TechWell - Verify Your Email';
    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #2563eb;">Verify Your Email</h1>
            <p>Your OTP verification code is:</p>
            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
                <h2 style="font-size: 36px; letter-spacing: 8px; color: #111827; margin: 0;">${otp}</h2>
            </div>
            <p style="color: #6b7280;">This code is valid for <strong>10 minutes</strong>. Do not share it with anyone.</p>
            <p>Best regards,<br/>The TechWell Team</p>
        </div>
    `;
    return sendEmail(email, subject, html);
};

module.exports = {
    sendWelcomeEmail,
    sendCertificateEmail,
    sendInterviewScheduledEmail,
    sendOtpEmail
};
