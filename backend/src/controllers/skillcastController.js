
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.createSkillcast = async (req, res) => {
    try {
        const { title, description, videoUrl, expertName, designation, company, linkedinUrl, experience, thumbnail } = req.body;
        const skillcast = await prisma.skillcast.create({
            data: {
                title,
                description,
                videoUrl,
                expertName,
                designation,
                company,
                linkedinUrl,
                experience,
                thumbnail
            }
        });
        res.status(201).json(skillcast);
    } catch (error) {
        console.error('Error creating skillcast:', error);
        res.status(500).json({ error: 'Failed to create skillcast' });
    }
};

exports.getAllSkillcasts = async (req, res) => {
    try {
        const skillcasts = await prisma.skillcast.findMany({
            orderBy: { createdAt: 'desc' }
        });
        res.status(200).json(skillcasts);
    } catch (error) {
        console.error('Error fetching skillcasts:', error);
        res.status(500).json({ error: 'Failed to fetch skillcasts' });
    }
};

exports.getSkillcastById = async (req, res) => {
    try {
        const { id } = req.params;
        const skillcast = await prisma.skillcast.findUnique({
            where: { id }
        });
        if (!skillcast) return res.status(404).json({ error: 'Skillcast not found' });
        res.json(skillcast);
    } catch (error) {
        console.error('Error fetching skillcast:', error);
        res.status(500).json({ error: 'Failed to fetch skillcast' });
    }
};

exports.updateSkillcast = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, videoUrl, expertName, designation, company, linkedinUrl, experience, thumbnail } = req.body;
        const skillcast = await prisma.skillcast.update({
            where: { id },
            data: {
                title,
                description,
                videoUrl,
                expertName,
                designation,
                company,
                linkedinUrl,
                experience,
                thumbnail
            }
        });
        res.json(skillcast);
    } catch (error) {
        console.error('Error updating skillcast:', error);
        res.status(500).json({ error: 'Failed to update skillcast' });
    }
};

exports.deleteSkillcast = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.skillcast.delete({
            where: { id }
        });
        res.json({ message: 'Skillcast deleted successfully' });
    } catch (error) {
        console.error('Error deleting skillcast:', error);
        res.status(500).json({ error: 'Failed to delete skillcast' });
    }
};
