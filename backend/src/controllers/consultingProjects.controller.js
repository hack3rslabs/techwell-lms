const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all consulting projects
exports.getProjects = async (req, res) => {
    try {
        const { type } = req.query; // BUSINESS or IT
        const where = type ? { type } : {};
        
        const projects = await prisma.consultingProject.findMany({
            where,
            include: {
                client: true,
                agreement: true,
                assignee: { select: { id: true, name: true, email: true, avatar: true } },
                milestones: true,
                resources: {
                    include: {
                        user: {
                            select: { id: true, name: true, email: true, avatar: true }
                        }
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        
        res.json({ success: true, projects });
    } catch (error) {
        console.error('Error fetching consulting projects:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch consulting projects' });
    }
};

// Get single project
exports.getProjectById = async (req, res) => {
    try {
        const { id } = req.params;
        const project = await prisma.consultingProject.findUnique({
            where: { id },
            include: {
                client: true,
                agreement: true,
                assignee: { select: { id: true, name: true, email: true, avatar: true } },
                milestones: true,
                resources: {
                    include: {
                        user: {
                            select: { id: true, name: true, email: true, avatar: true }
                        }
                    }
                }
            }
        });
        
        if (!project) return res.status(404).json({ success: false, error: 'Project not found' });
        
        res.json({ success: true, project });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to fetch project' });
    }
};

// Create new project
exports.createProject = async (req, res) => {
    try {
        const { title, description, type, status, clientId, agreementId, assigneeId, startDate, endDate, budget, webUrl, commitment, notes, contacts } = req.body;
        
        const project = await prisma.consultingProject.create({
            data: {
                title,
                description,
                type,
                status: status || 'ONBOARDING',
                clientId: clientId || null,
                agreementId: agreementId || null,
                assigneeId: assigneeId || null,
                startDate: startDate ? new Date(startDate) : null,
                endDate: endDate ? new Date(endDate) : null,
                budget: budget ? parseFloat(budget) : 0,
                webUrl,
                commitment,
                notes,
                contacts: contacts || null
            },
            include: {
                client: true,
                agreement: true,
                assignee: { select: { id: true, name: true, email: true, avatar: true } }
            }
        });
        
        res.status(201).json({ success: true, project });
    } catch (error) {
        console.error('Create project error:', error);
        res.status(500).json({ success: false, error: 'Failed to create project' });
    }
};

// Update project
exports.updateProject = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, type, status, clientId, agreementId, assigneeId, startDate, endDate, budget, webUrl, commitment, notes, contacts } = req.body;
        
        const project = await prisma.consultingProject.update({
            where: { id },
            data: {
                title,
                description,
                type,
                status,
                clientId: clientId || null,
                agreementId: agreementId || null,
                assigneeId: assigneeId || null,
                startDate: startDate ? new Date(startDate) : null,
                endDate: endDate ? new Date(endDate) : null,
                budget: budget ? parseFloat(budget) : 0,
                webUrl,
                commitment,
                notes,
                contacts: contacts !== undefined ? contacts : undefined
            },
            include: {
                client: true,
                agreement: true,
                assignee: { select: { id: true, name: true, email: true, avatar: true } }
            }
        });
        
        res.json({ success: true, project });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to update project' });
    }
};

// Delete project
exports.deleteProject = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.consultingProject.delete({ where: { id } });
        res.json({ success: true, message: 'Project deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to delete project' });
    }
};

// Add milestone
exports.addMilestone = async (req, res) => {
    try {
        const { projectId } = req.params;
        const { title, description, dueDate, isCompleted } = req.body;
        
        const milestone = await prisma.consultingMilestone.create({
            data: {
                projectId,
                title,
                description,
                dueDate: dueDate ? new Date(dueDate) : null,
                isCompleted: isCompleted || false
            }
        });
        
        res.status(201).json({ success: true, milestone });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to add milestone' });
    }
};

// Add resource
exports.addResource = async (req, res) => {
    try {
        const { projectId } = req.params;
        const { userId, role, hoursAllocated } = req.body;
        
        const resource = await prisma.consultingResource.create({
            data: {
                projectId,
                userId,
                role,
                hoursAllocated: hoursAllocated ? parseInt(hoursAllocated) : 0
            },
            include: {
                user: {
                    select: { id: true, name: true, email: true, avatar: true }
                }
            }
        });
        
        res.status(201).json({ success: true, resource });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to add resource' });
    }
};
