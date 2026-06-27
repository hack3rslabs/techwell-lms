const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all ads (Admin)
exports.getAds = async (req, res) => {
    try {
        const ads = await prisma.adBanner.findMany({
            orderBy: { createdAt: 'desc' }
        });
        res.json({ success: true, ads });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get active ads (Public)
exports.getActiveAds = async (req, res) => {
    try {
        const now = new Date();
        const ads = await prisma.adBanner.findMany({
            where: { 
                status: 'ACTIVE',
                OR: [
                    { isPermanent: true },
                    { autoRenewal: true },
                    { expiresAt: null },
                    { expiresAt: { gt: now } }
                ]
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json({ success: true, ads });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Create a new ad
exports.createAd = async (req, res) => {
    try {
        const { title, businessName, contactInfo, imageUrl, targetUrl, position, status, durationDays, isPermanent, autoRenewal } = req.body;
        
        if (!title || !imageUrl) {
            return res.status(400).json({ success: false, message: 'Title and Image URL are required.' });
        }

        let expiresAt = null;
        if (!isPermanent && durationDays) {
            expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + parseInt(durationDays, 10));
        }

        const ad = await prisma.adBanner.create({
            data: { 
                title, businessName, contactInfo, imageUrl, targetUrl, position, status,
                durationDays: durationDays ? parseInt(durationDays, 10) : null,
                isPermanent: !!isPermanent,
                autoRenewal: !!autoRenewal,
                expiresAt
            }
        });
        res.status(201).json({ success: true, ad });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Delete an ad
exports.deleteAd = async (req, res) => {
    try {
        await prisma.adBanner.delete({
            where: { id: req.params.id }
        });
        res.json({ success: true, message: 'Ad deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Record ad view
exports.recordView = async (req, res) => {
    try {
        await prisma.adBanner.update({
            where: { id: req.params.id },
            data: { views: { increment: 1 } }
        });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Record ad click
exports.recordClick = async (req, res) => {
    try {
        await prisma.adBanner.update({
            where: { id: req.params.id },
            data: { clicks: { increment: 1 } }
        });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
