
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all projects
exports.getAllProjects = async (req, res) => {
    try {
        const projects = await prisma.project.findMany({
            orderBy: { createdAt: 'desc' }
        });
        res.json(projects);
    } catch (error) {
        console.error('Error fetching projects:', error);
        res.status(500).json({ error: 'Failed to fetch projects' });
    }
};

// Get single project
exports.getProjectById = async (req, res) => {
    try {
        const { id } = req.params;
        const project = await prisma.project.findUnique({
            where: { id }
        });

        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }

        res.json(project);
    } catch (error) {
        console.error('Error fetching project:', error);
        res.status(500).json({ error: 'Failed to fetch project' });
    }
};

// Create a new project
exports.createProject = async (req, res) => {
    try {
        const { title, description, price, originalPrice, image, techStack, category, features, capex, roi, projectType, demoLink, reportLink } = req.body;

        const project = await prisma.project.create({
            data: {
                title,
                description,
                price,
                originalPrice,
                image,
                techStack, // Expecting JSON array or array of strings
                category,
                features,
                capex,
                roi,
                projectType,
                demoLink,
                reportLink
            }
        });

        res.status(201).json(project);
    } catch (error) {
        console.error('Error creating project:', error);
        res.status(500).json({ error: 'Failed to create project' });
    }
};

// Update a project
exports.updateProject = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, price, originalPrice, image, techStack, category, features, capex, roi, projectType, demoLink, reportLink } = req.body;

        const project = await prisma.project.update({
            where: { id },
            data: {
                title,
                description,
                price,
                originalPrice,
                image,
                techStack,
                category,
                features,
                capex,
                roi,
                projectType,
                demoLink,
                reportLink
            }
        });

        res.json(project);
    } catch (error) {
        console.error('Error updating project:', error);
        res.status(500).json({ error: 'Failed to update project' });
    }
};

// Delete a project
exports.deleteProject = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.project.delete({
            where: { id }
        });
        res.json({ message: 'Project deleted successfully' });
    } catch (error) {
        console.error('Error deleting project:', error);
        res.status(500).json({ error: 'Failed to delete project' });
    }
};
