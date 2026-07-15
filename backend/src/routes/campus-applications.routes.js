const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { authenticate, authorize } = require('../middleware/auth');

// Get all applications for a specific drive (Employer or Admin)
router.get('/drive/:driveId', authenticate, authorize(['EMPLOYER', 'SUPER_ADMIN']), async (req, res) => {
    try {
        const { driveId } = req.params;
        const drive = await prisma.campusDrive.findUnique({ where: { id: driveId } });
        
        if (!drive) return res.status(404).json({ error: 'Drive not found' });
        
        if (req.user.role === 'EMPLOYER' && drive.employerId !== req.user.id) {
            return res.status(403).json({ error: 'Access denied to this drive pipeline' });
        }

        const applications = await prisma.campusDriveStudent.findMany({
            where: { driveId },
            include: {
                user: {
                    select: { id: true, name: true, email: true, phone: true, college: true, qualification: true, avatar: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        res.json(applications);
    } catch (error) {
        console.error('Error fetching applications:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Update Application Status (ATS drag-and-drop)
router.patch('/:id/status', authenticate, authorize(['EMPLOYER', 'SUPER_ADMIN']), async (req, res) => {
    try {
        const applicationId = req.params.id;
        const { status } = req.body;

        // Valid statuses from Prisma schema logic
        const validStatuses = ['ELIGIBLE', 'INVITED', 'APPLIED', 'SHORTLISTED', 'TECH_INTERVIEW', 'HR_INTERVIEW', 'SELECTED', 'OFFERED', 'JOINED', 'REJECTED'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: 'Invalid status update' });
        }

        const application = await prisma.campusDriveStudent.findUnique({
            where: { id: applicationId },
            include: { drive: true }
        });

        if (!application) return res.status(404).json({ error: 'Application not found' });
        
        if (req.user.role === 'EMPLOYER' && application.drive.employerId !== req.user.id) {
            return res.status(403).json({ error: 'Access denied' });
        }

        const updated = await prisma.campusDriveStudent.update({
            where: { id: applicationId },
            data: { status }
        });

        const { sendStatusUpdateEmail } = require('../services/email.service');
        if (application.user && application.user.email) {
            const companyName = application.drive?.companyName || 'Our Company';
            const jobTitle = application.drive?.title || 'Campus Drive';
            sendStatusUpdateEmail(
                application.user.email,
                application.user.name || 'Student',
                jobTitle,
                companyName,
                status
            ).catch(err => console.error('Failed to send status email:', err));
        }

        res.json(updated);
    } catch (error) {
        console.error('Error updating application status:', error);
        res.status(500).json({ error: 'Failed to update status' });
    }
});

module.exports = router;
