const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getPreferences = async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            select: {
                subscribedToNewsletter: true,
                deleteRequested: true,
                deleteRequestDate: true
            }
        });
        res.json({ success: true, data: user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updatePreferences = async (req, res) => {
    try {
        const { subscribedToNewsletter } = req.body;
        const user = await prisma.user.update({
            where: { id: req.user.id },
            data: { subscribedToNewsletter }
        });
        res.json({ success: true, message: 'Preferences updated successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.requestDeletion = async (req, res) => {
    try {
        await prisma.user.update({
            where: { id: req.user.id },
            data: { 
                deleteRequested: true,
                deleteRequestDate: new Date()
            }
        });
        res.json({ success: true, message: 'Account deletion requested successfully. An administrator will review your request.' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
