const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getAllTeamMembers = async (req, res) => {
    try {
        const team = await prisma.teamMember.findMany({
            orderBy: { orderIndex: 'asc' }
        });
        res.json(team);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch team members' });
    }
};

exports.getActiveTeamMembers = async (req, res) => {
    try {
        const team = await prisma.teamMember.findMany({
            where: { isActive: true },
            orderBy: { orderIndex: 'asc' }
        });
        res.json(team);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch active team members' });
    }
};

exports.createTeamMember = async (req, res) => {
    try {
        const { name, designation, description, photoUrl, linkedinUrl, orderIndex, isActive } = req.body;
        const newMember = await prisma.teamMember.create({
            data: { name, designation, description, photoUrl, linkedinUrl, orderIndex, isActive }
        });
        res.status(201).json(newMember);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create team member' });
    }
};

exports.updateTeamMember = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, designation, description, photoUrl, linkedinUrl, orderIndex, isActive } = req.body;
        const updatedMember = await prisma.teamMember.update({
            where: { id },
            data: { name, designation, description, photoUrl, linkedinUrl, orderIndex, isActive }
        });
        res.json(updatedMember);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update team member' });
    }
};

exports.deleteTeamMember = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.teamMember.delete({ where: { id } });
        res.json({ message: 'Team member deleted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to delete team member' });
    }
};
