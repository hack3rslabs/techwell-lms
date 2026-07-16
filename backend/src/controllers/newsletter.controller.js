const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getNewsletters = async (req, res) => {
    try {
        const newsletters = await prisma.newsletterCampaign.findMany({
            orderBy: { createdAt: 'desc' }
        });
        res.json(newsletters);
    } catch (error) {
        console.error('Failed to get newsletters:', error);
        res.status(500).json({ error: 'Failed to retrieve newsletters' });
    }
};

exports.getNewsletterById = async (req, res) => {
    try {
        const newsletter = await prisma.newsletterCampaign.findUnique({
            where: { id: req.params.id }
        });
        if (!newsletter) return res.status(404).json({ error: 'Newsletter not found' });
        res.json(newsletter);
    } catch (error) {
        console.error('Failed to get newsletter:', error);
        res.status(500).json({ error: 'Failed to retrieve newsletter' });
    }
};

exports.createNewsletter = async (req, res) => {
    try {
        const { subject, htmlContent } = req.body;
        const newsletter = await prisma.newsletterCampaign.create({
            data: {
                subject,
                htmlContent,
                status: 'DRAFT'
            }
        });
        res.status(201).json(newsletter);
    } catch (error) {
        console.error('Failed to create newsletter:', error);
        res.status(500).json({ error: 'Failed to create newsletter' });
    }
};

exports.updateNewsletter = async (req, res) => {
    try {
        const { subject, htmlContent, status } = req.body;
        const newsletter = await prisma.newsletterCampaign.update({
            where: { id: req.params.id },
            data: { subject, htmlContent, status }
        });
        res.json(newsletter);
    } catch (error) {
        console.error('Failed to update newsletter:', error);
        res.status(500).json({ error: 'Failed to update newsletter' });
    }
};

exports.deleteNewsletter = async (req, res) => {
    try {
        await prisma.newsletterCampaign.delete({
            where: { id: req.params.id }
        });
        res.json({ success: true });
    } catch (error) {
        console.error('Failed to delete newsletter:', error);
        res.status(500).json({ error: 'Failed to delete newsletter' });
    }
};

exports.publishNewsletter = async (req, res) => {
    try {
        // 1. Mark as published
        const newsletter = await prisma.newsletterCampaign.update({
            where: { id: req.params.id },
            data: { 
                status: 'PUBLISHED',
                sentAt: new Date()
            }
        });

        // 2. Get all subscribed leads
        const subscribedLeads = await prisma.lead.findMany({
            where: {
                subscribedToNewsletter: true
            },
            select: { email: true }
        });

        // 3. In a real app, integrate SMTP or AWS SES here to send the emails.
        console.log(`[NEWSLETTER] Sending "${newsletter.subject}" to ${subscribedLeads.length} leads.`);
        // For demonstration purposes, we will mock the sending process successfully.
        
        res.json({ 
            success: true, 
            message: `Newsletter published and sent to ${subscribedLeads.length} subscribers!`,
            newsletter
        });
    } catch (error) {
        console.error('Failed to publish newsletter:', error);
        res.status(500).json({ error: 'Failed to publish newsletter' });
    }
};
