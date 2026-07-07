const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Landing Pages
exports.getLandingPages = async (req, res) => {
    try {
        const pages = await prisma.landingPage.findMany({
            orderBy: { createdAt: 'desc' }
        });
        res.json({ success: true, pages });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getLandingPageBySlug = async (req, res) => {
    try {
        const { slug } = req.params;
        const page = await prisma.landingPage.findUnique({
            where: { slug, status: 'PUBLISHED' }
        });
        if (!page) {
            return res.status(404).json({ success: false, message: 'Landing page not found' });
        }
        res.json({ success: true, page });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.createLandingPage = async (req, res) => {
    try {
        const { title, slug, content, status, seoTitle, seoDesc, htmlContent, customCss, customJs, headerCode, ogImage, pagePassword } = req.body;
        const page = await prisma.landingPage.create({
            data: { title, slug, content, status, seoTitle, seoDesc, htmlContent, customCss, customJs, headerCode, ogImage, pagePassword }
        });
        res.status(201).json({ success: true, page });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.incrementPageViews = async (req, res) => {
    try {
        const { slug } = req.params;
        await prisma.landingPage.update({
            where: { slug },
            data: { views: { increment: 1 } }
        });
        res.json({ success: true });
    } catch {
        res.json({ success: false }); // Silently fail — view tracking is non-critical
    }
};

exports.updateLandingPage = async (req, res) => {
    try {
        const { id } = req.params;
        const page = await prisma.landingPage.update({
            where: { id },
            data: req.body
        });
        res.json({ success: true, page });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deleteLandingPage = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.landingPage.delete({ where: { id } });
        res.json({ success: true, message: 'Landing page deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Forms
exports.getForms = async (req, res) => {
    try {
        const forms = await prisma.leadGenForm.findMany({
            orderBy: { createdAt: 'desc' }
        });
        res.json({ success: true, forms });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getFormById = async (req, res) => {
    try {
        const { id } = req.params;
        const form = await prisma.leadGenForm.findUnique({
            where: { id }
        });
        if (!form) {
            return res.status(404).json({ success: false, message: 'Form not found' });
        }
        res.json({ success: true, form });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.createForm = async (req, res) => {
    try {
        const { title, fields, submitMessage, redirectUrl } = req.body;
        const form = await prisma.leadGenForm.create({
            data: { title, fields: fields || [], submitMessage, redirectUrl }
        });
        res.status(201).json({ success: true, form });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deleteForm = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.leadGenForm.delete({ where: { id } });
        res.json({ success: true, message: 'Form deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Campaigns
exports.getCampaigns = async (req, res) => {
    try {
        const campaigns = await prisma.marketingCampaign.findMany({
            orderBy: { createdAt: 'desc' }
        });

        // Calculate ROI for each campaign
        const campaignsWithRoi = await Promise.all(campaigns.map(async (campaign) => {
            const leads = await prisma.lead.findMany({
                where: { campaignId: campaign.id },
                select: { revenueGenerated: true }
            });
            const totalRevenue = leads.reduce((acc, lead) => acc + (lead.revenueGenerated || 0), 0);
            
            let roiScore = 0;
            if (campaign.budget && campaign.budget > 0) {
                roiScore = ((totalRevenue - campaign.budget) / campaign.budget) * 100;
            }

            return {
                ...campaign,
                totalRevenue,
                leadsCount: leads.length,
                roiScore: Math.round(roiScore * 100) / 100 // Round to 2 decimals
            };
        }));

        res.json({ success: true, campaigns: campaignsWithRoi });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.createCampaign = async (req, res) => {
    try {
        const campaign = await prisma.marketingCampaign.create({
            data: req.body
        });
        res.status(201).json({ success: true, campaign });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deleteCampaign = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.marketingCampaign.delete({ where: { id } });
        res.json({ success: true, message: 'Campaign deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


exports.subscribeNewsletter = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    // Check if lead already exists with this email
    const existing = await prisma.lead.findFirst({
      where: { email }
    });

    if (existing) {
      return res.json({ success: true, message: 'Already subscribed!' });
    }

    // Create a new lead for the newsletter
    const name = email.split('@')[0];
    await prisma.lead.create({
      data: {
        name: name,
        email: email,
        source: 'NEWSLETTER',
        status: 'NEW'
      }
    });

    res.json({ success: true, message: 'Successfully subscribed to the newsletter!' });
  } catch (error) {
    console.error('[Newsletter] subscribe error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
