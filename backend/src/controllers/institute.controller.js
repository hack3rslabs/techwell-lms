const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Public: Self-Registration for Institutes
exports.registerInstitute = async (req, res) => {
    try {
        const { name, contactPerson, email, phone, type, state, district, city, website } = req.body;

        // Check if an institute with this email already exists
        if (email) {
            const existing = await prisma.institute.findFirst({ where: { email } });
            if (existing) {
                return res.status(400).json({ error: 'An institute with this email is already registered.' });
            }
        }

        const institute = await prisma.institute.create({
            data: {
                name,
                contactPerson,
                email,
                phone,
                type,
                state,
                district,
                city,
                website,
                status: 'PENDING'
            }
        });

        res.status(201).json({ message: 'Registration submitted successfully. Pending approval.', institute });
    } catch (error) {
        console.error('Register Institute Error:', error);
        res.status(500).json({ error: 'Failed to register institute' });
    }
};

// Super Admin: List all institutes
exports.getInstitutes = async (req, res) => {
    try {
        const { status, type } = req.query;
        let where = {};
        if (status) where.status = status;
        if (type) where.type = type;

        const institutes = await prisma.institute.findMany({
            where,
            orderBy: { createdAt: 'desc' }
        });

        res.json(institutes);
    } catch (error) {
        console.error('Get Institutes Error:', error);
        res.status(500).json({ error: 'Failed to fetch institutes' });
    }
};

// Super Admin: Update Institute Status (Approve/Reject)
exports.updateInstituteStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // APPROVED or REJECTED

        if (!['APPROVED', 'REJECTED', 'PENDING'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        const institute = await prisma.institute.update({
            where: { id },
            data: { status }
        });

        res.json({ message: 'Institute status updated', institute });
    } catch (error) {
        console.error('Update Institute Status Error:', error);
        res.status(500).json({ error: 'Failed to update institute status' });
    }
};

// Institute Admin: Get their own institute details
exports.getMyInstitute = async (req, res) => {
    try {
        if (!req.user.instituteId) {
            return res.status(400).json({ error: 'User is not associated with any institute' });
        }

        const institute = await prisma.institute.findUnique({
            where: { id: req.user.instituteId }
        });

        if (!institute) return res.status(404).json({ error: 'Institute not found' });
        res.json(institute);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch institute details' });
    }
};

// Institute Admin: Update their own branding/details
exports.updateMyInstitute = async (req, res) => {
    try {
        if (!req.user.instituteId) {
            return res.status(400).json({ error: 'User is not associated with any institute' });
        }

        const { logoUrl, themeColor, subdomain, website, phone, emailTemplate } = req.body;
        
        // Ensure subdomain is unique if provided
        if (subdomain) {
            const existing = await prisma.institute.findFirst({
                where: { subdomain, id: { not: req.user.instituteId } }
            });
            if (existing) {
                return res.status(400).json({ error: 'Subdomain is already taken' });
            }
        }

        const institute = await prisma.institute.update({
            where: { id: req.user.instituteId },
            data: { logoUrl, themeColor, subdomain, website, phone, emailTemplate }
        });

        res.json({ message: 'Institute updated successfully', institute });
    } catch (error) {
        console.error('Update My Institute Error:', error);
        res.status(500).json({ error: 'Failed to update institute details' });
    }
};

// Institute Admin: Dashboard Stats
exports.getInstituteDashboard = async (req, res) => {
    try {
        const instituteId = req.params.id || req.user.instituteId;
        
        if (req.user.role !== 'SUPER_ADMIN' && req.user.instituteId !== instituteId) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        const stats = await prisma.$transaction([
            prisma.user.count({ where: { instituteId, role: 'STUDENT' } }),
            prisma.campusDriveInstitute.count({ where: { instituteId, status: 'ACCEPTED' } }),
            prisma.candidateProfile.count({ 
                where: { 
                    user: { instituteId },
                    placementStatus: 'PLACED'
                } 
            }),
            prisma.course.count({ where: { institutes: { some: { id: instituteId } } } })
        ]);

        res.json({
            success: true,
            data: {
                totalStudents: stats[0],
                totalCampusDrives: stats[1],
                totalPlaced: stats[2],
                totalCourses: stats[3]
            }
        });
    } catch (error) {
        console.error('Institute Dashboard Error:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard stats' });
    }
};

// Institute Admin: Get Students
exports.getInstituteStudents = async (req, res) => {
    try {
        const instituteId = req.params.id || req.user.instituteId;
        
        if (req.user.role !== 'SUPER_ADMIN' && req.user.instituteId !== instituteId) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        const students = await prisma.user.findMany({
            where: { instituteId, role: 'STUDENT' },
            include: { candidateProfile: true },
            orderBy: { createdAt: 'desc' }
        });

        res.json({ success: true, data: students });
    } catch (error) {
        console.error('Institute Students Error:', error);
        res.status(500).json({ error: 'Failed to fetch students' });
    }
};
