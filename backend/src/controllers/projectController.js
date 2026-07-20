
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL } } });

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
        const { title, description, price, originalPrice, image, techStack, category, features, capex, roi, projectType, demoLink, reportLink, isPublished } = req.body;

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
                reportLink,
                isPublished: isPublished !== undefined ? isPublished : true
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
        const { title, description, price, originalPrice, image, techStack, category, features, capex, roi, projectType, demoLink, reportLink, isPublished } = req.body;

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
                reportLink,
                isPublished
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

// Request to buy/apply for a project
exports.requestProject = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId; // from authenticate middleware

        // Check if project exists
        const project = await prisma.project.findUnique({ where: { id } });
        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }

        // Create or update request
        const request = await prisma.projectRequest.upsert({
            where: {
                userId_projectId: {
                    userId,
                    projectId: id
                }
            },
            update: {}, // if exists, do nothing (or maybe update status to PENDING)
            create: {
                userId,
                projectId: id,
                status: 'PENDING'
            }
        });

        res.status(201).json(request);
    } catch (error) {
        console.error('Error requesting project:', error);
        res.status(500).json({ error: 'Failed to request project' });
    }
};

// Get all project requests for admin
exports.getAllProjectRequests = async (req, res) => {
    try {
        const requests = await prisma.projectRequest.findMany({
            include: {
                project: {
                    select: { id: true, title: true, price: true, category: true }
                },
                user: {
                    select: { 
                        id: true, 
                        name: true, 
                        email: true,
                        phone: true,
                        institute: {
                            select: { id: true, name: true }
                        }
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        res.json(requests);
    } catch (error) {
        console.error('Error fetching project requests:', error);
        res.status(500).json({ error: 'Failed to fetch project requests' });
    }
};

// Get dashboard stats for project manager
exports.getDashboardStats = async (req, res) => {
    try {
        const totalProjects = await prisma.project.count();
        const totalRequests = await prisma.projectRequest.count();
        
        // Calculate Total Sell by summing price of APPROVED requests
        // Wait, price is a string in Project model. Let's just fetch all approved requests and their projects and sum them up.
        const approvedRequests = await prisma.projectRequest.findMany({
            where: { status: 'APPROVED' },
            include: { project: true }
        });

        let totalSell = 0;
        approvedRequests.forEach(req => {
            const price = parseFloat(req.project.price);
            if (!isNaN(price)) {
                totalSell += price;
            }
        });

        const recentProjects = await prisma.project.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' }
        });

        const recentRequests = await prisma.projectRequest.findMany({
            take: 5,
            include: {
                project: { select: { title: true } },
                user: { select: { name: true, email: true } }
            },
            orderBy: { createdAt: 'desc' }
        });

        res.json({
            totalProjects,
            totalRequests,
            totalSell,
            recentProjects,
            recentRequests
        });
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard stats' });
    }
};

// Get all projects for public viewing
exports.getPublicProjects = async (req, res) => {
    try {
        const projects = await prisma.project.findMany({
            where: { isPublished: true },
            orderBy: { createdAt: 'desc' }
        });
        res.json(projects);
    } catch (error) {
        console.error('Error fetching public projects:', error);
        res.status(500).json({ error: 'Failed to fetch projects' });
    }
};

