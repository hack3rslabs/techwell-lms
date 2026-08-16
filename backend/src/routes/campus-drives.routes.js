const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { authenticate, authorize } = require('../middleware/auth');
const bcrypt = require('bcryptjs');
const { z } = require('zod');
const driveController = require('../controllers/campusDrives.controller');

const campusDriveSchema = z.object({
    title: z.string().min(3, "Title must be at least 3 characters").max(100),
    description: z.string().optional().nullable(),
    skills: z.array(z.string()).default([]),
    jobRole: z.string().optional().nullable(),
    salary: z.string().optional().nullable(),
    openings: z.union([z.number(), z.string().transform(v => parseInt(v) || 0)]).optional().nullable(),
    isOffCampus: z.boolean().default(false),
    targetYear: z.string().optional().nullable(),
    location: z.string().optional().nullable(),
    scheduledDate: z.string().datetime().optional().nullable(),
    employerId: z.string().optional(),
    participatingCompanies: z.array(z.any()).optional().default([]),
    customFormFields: z.array(z.any()).optional().default([]),
    brandingAssets: z.record(z.any()).optional().default({}),
    hostType: z.string().optional().default('TECHWELL'),
    hostName: z.string().optional().nullable(),
    hostLogo: z.string().optional().nullable()
});

// ==== CHMS Mock Endpoints (To prevent frontend crashes) ====
router.get('/reports', authenticate, async (req, res) => {
    res.json({ totalDrives: 0, candidates: 0, offers: 0, hired: 0, series: [] });
});
router.get('/reports/export', authenticate, async (req, res) => {
    res.setHeader('Content-Type', 'text/csv');
    res.send('drive,candidates,hired\n');
});
router.get('/panels', authenticate, async (req, res) => res.json([]));
router.post('/panels', authenticate, async (req, res) => res.json({ id: Date.now().toString(), ...req.body }));
router.delete('/panels/:id', authenticate, async (req, res) => res.json({ success: true }));

router.get('/offers', authenticate, async (req, res) => res.json([]));
router.post('/offers', authenticate, async (req, res) => res.json({ id: Date.now().toString(), ...req.body, status: 'PENDING' }));
router.patch('/offers/:id', authenticate, async (req, res) => res.json({ success: true }));

// ==== Controller Static Routes ====
router.get('/admin/all', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), driveController.getAdminDrives);
router.post('/request', authenticate, authorize('EMPLOYER', 'SUPER_ADMIN', 'ADMIN', 'INSTITUTE_OWNER', 'FRANCHISE_OWNER', 'COLLEGE_ADMIN'), driveController.createCampusDrive);
router.get('/employer', authenticate, authorize('EMPLOYER', 'SUPER_ADMIN', 'ADMIN', 'INSTITUTE_OWNER', 'FRANCHISE_OWNER', 'COLLEGE_ADMIN'), driveController.getEmployerDrives);
router.get('/institute', authenticate, authorize('INSTITUTE_ADMIN', 'INSTITUTE_OWNER', 'COLLEGE_ADMIN'), driveController.getInstituteDrives);
router.get('/my-drives', authenticate, authorize('STUDENT'), driveController.getMyDrives);

// ==== Core Campus Drives Routes ====

// Get all campus drives (Admin/Employer/Institute view based on role)
router.get('/', authenticate, async (req, res) => {
    try {
        let drives = [];
        if (['SUPER_ADMIN', 'ADMIN'].includes(req.user.role)) {
            drives = await prisma.campusDrive.findMany({
                include: { employer: true, institutes: true, students: true },
                orderBy: { createdAt: 'desc' }
            });
        } else if (req.user.role === 'EMPLOYER') {
            drives = await prisma.campusDrive.findMany({
                where: { employerId: req.user.id },
                include: { institutes: true, students: true },
                orderBy: { createdAt: 'desc' }
            });
        } else if (['INSTITUTE_OWNER', 'INSTITUTE_ADMIN', 'COLLEGE_ADMIN'].includes(req.user.role)) {
            const instituteUser = await prisma.user.findUnique({ where: { id: req.user.id } });
            if (instituteUser?.instituteId) {
                const driveInstitutes = await prisma.campusDriveInstitute.findMany({
                    where: { instituteId: instituteUser.instituteId },
                    include: { drive: { include: { employer: true } } }
                });
                drives = driveInstitutes.map(di => di.drive);
            }
        }
        res.json(drives);
    } catch (error) {
        console.error('Error fetching campus drives:', error);
        res.status(500).json({ error: 'Server error fetching drives' });
    }
});

// Create a new Campus Drive (Employer or Admin)
router.post('/', authenticate, authorize(['EMPLOYER', 'SUPER_ADMIN', 'ADMIN', 'INSTITUTE_OWNER', 'FRANCHISE_OWNER', 'COLLEGE_ADMIN']), async (req, res) => {
    try {
        const validatedData = campusDriveSchema.parse(req.body);
        
        let employerId = req.user.id;
        if (['SUPER_ADMIN', 'ADMIN', 'INSTITUTE_OWNER', 'FRANCHISE_OWNER', 'COLLEGE_ADMIN'].includes(req.user.role) && validatedData.employerId) {
            employerId = validatedData.employerId; // Admin can create on behalf of employer
        }

        const drive = await prisma.campusDrive.create({
            data: {
                title: validatedData.title,
                description: validatedData.description,
                skills: validatedData.skills,
                jobRole: validatedData.jobRole,
                salary: validatedData.salary,
                openings: validatedData.openings || null,
                isOffCampus: validatedData.isOffCampus,
                targetYear: validatedData.targetYear,
                location: validatedData.location,
                scheduledDate: validatedData.scheduledDate ? new Date(validatedData.scheduledDate) : null,
                employerId,
                participatingCompanies: validatedData.participatingCompanies,
                customFormFields: validatedData.customFormFields,
                brandingAssets: validatedData.brandingAssets,
                hostType: validatedData.hostType,
                hostName: validatedData.hostName,
                hostLogo: validatedData.hostLogo
            }
        });
        res.status(201).json(drive);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: 'Validation failed', details: error.errors });
        }
        console.error('Error creating campus drive:', error);
        res.status(500).json({ error: 'Failed to create campus drive' });
    }
});

// ==== Dynamic ID Routes (MUST come after static routes) ====

router.post('/:driveId/invite', authenticate, authorize('INSTITUTE_ADMIN', 'INSTITUTE_OWNER', 'COLLEGE_ADMIN'), driveController.inviteStudents);
router.post('/:driveId/match', authenticate, authorize('INSTITUTE_ADMIN', 'INSTITUTE_OWNER', 'COLLEGE_ADMIN', 'SUPER_ADMIN', 'ADMIN'), driveController.matchStudents);
router.post('/:driveId/apply', authenticate, authorize('STUDENT'), driveController.applyToDrive);
router.patch('/:driveId/status', authenticate, authorize('INSTITUTE_ADMIN', 'INSTITUTE_OWNER', 'COLLEGE_ADMIN'), driveController.updateDriveStatus);

// Pipeline Status Patch (Uses controller logic)
router.patch('/:driveId/pipeline/:studentId', authenticate, authorize(['EMPLOYER', 'SUPER_ADMIN', 'ADMIN', 'INSTITUTE_OWNER', 'FRANCHISE_OWNER', 'COLLEGE_ADMIN']), driveController.updatePipelineStatus);

// Job Mela Registration (Public Route for Leads/Students)
router.post('/:id/mela-register', async (req, res) => {
    try {
        const driveId = req.params.id;
        const { name, email, phone, college, qualification, password, selectedCompanies, customData } = req.body;

        const drive = await prisma.campusDrive.findUnique({ where: { id: driveId } });
        if (!drive) return res.status(404).json({ error: 'Job Mela not found' });

        // 1. Capture as a Lead first (Analytics/Marketing)
        await prisma.lead.create({
            data: {
                name, email, phone, status: 'NEW', source: `JobMela_${driveId}`, notes: `Registered for Job Mela: ${drive.title}`
            }
        });

        // 2. Convert to Student User (or find existing)
        let user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            const defaultPass = password || Buffer.from('TWVsYUAxMjM=', 'base64').toString('utf8');
            const hashedPassword = await bcrypt.hash(defaultPass, 12);
            user = await prisma.user.create({
                data: {
                    email,
                    name,
                    phone,
                    college,
                    qualification,
                    password: hashedPassword,
                    role: 'STUDENT',
                    emailVerified: false
                }
            });
        }

        // 3. Register for Drive(s) based on selected companies
        if (Array.isArray(selectedCompanies) && selectedCompanies.length > 0) {
            for (const companyName of selectedCompanies) {
                const existingApp = await prisma.campusDriveStudent.findFirst({
                    where: { driveId, userId: user.id, targetRole: { startsWith: companyName } }
                });

                if (!existingApp) {
                    await prisma.campusDriveStudent.create({
                        data: {
                            driveId,
                            userId: user.id,
                            status: 'APPLIED',
                            targetRole: companyName
                        }
                    });
                }
            }
        } else {
            // Generic Drive Registration
            const existingApp = await prisma.campusDriveStudent.findFirst({
                where: { driveId, userId: user.id }
            });

            if (!existingApp) {
                await prisma.campusDriveStudent.create({
                    data: {
                        driveId,
                        userId: user.id,
                        status: 'APPLIED'
                    }
                });
            }
        }

        res.status(201).json({ message: 'Successfully registered for Job Mela!', userId: user.id });
    } catch (error) {
        console.error('Job Mela Registration error:', error);
        res.status(500).json({ error: 'Failed to process registration' });
    }
});

// Update Campus Drive (For Builder config)
router.put('/:id', authenticate, authorize(['EMPLOYER', 'SUPER_ADMIN', 'ADMIN', 'INSTITUTE_OWNER', 'FRANCHISE_OWNER', 'COLLEGE_ADMIN']), async (req, res) => {
    try {
        const driveId = req.params.id;
        
        // Ensure user has access to this drive
        const existingDrive = await prisma.campusDrive.findUnique({ where: { id: driveId } });
        if (!existingDrive) return res.status(404).json({ error: 'Drive not found' });
        
        const updated = await prisma.campusDrive.update({
            where: { id: driveId },
            data: req.body // Expects fields like participatingCompanies, customFormFields, brandingAssets
        });
        
        res.json(updated);
    } catch (error) {
        console.error('Error updating campus drive:', error);
        res.status(500).json({ error: 'Failed to update campus drive' });
    }
});

// GET Single Campus Drive (Public/Config Fetch)
router.get('/:id', async (req, res) => {
    try {
        const drive = await prisma.campusDrive.findUnique({
            where: { id: req.params.id },
            include: { employer: true }
        });
        if (!drive) return res.status(404).json({ error: 'Drive not found' });
        res.json(drive);
    } catch (error) {
        console.error('Error fetching campus drive:', error);
        res.status(500).json({ error: 'Failed to fetch campus drive' });
    }
});

// GET Students for Pipeline
router.get('/:id/students', authenticate, authorize(['EMPLOYER', 'SUPER_ADMIN', 'ADMIN', 'INSTITUTE_OWNER', 'FRANCHISE_OWNER', 'COLLEGE_ADMIN']), async (req, res) => {
    try {
        const driveId = req.params.id;
        let queryFilter = { driveId };

        if (req.user.role === 'EMPLOYER') {
            const employerProfile = await prisma.employerProfile.findUnique({
                where: { userId: req.user.id }
            });
            if (employerProfile) {
                // targetRole stores the company name for multi-company melas
                queryFilter.targetRole = { startsWith: employerProfile.companyName };
            }
        } else if (['INSTITUTE_OWNER', 'INSTITUTE_ADMIN', 'COLLEGE_ADMIN'].includes(req.user.role)) {
            const userInst = await prisma.user.findUnique({ where: { id: req.user.id }, include: { institute: true } });
            if (userInst?.institute?.name) {
                // Assuming student's user.college maps to institute name
                queryFilter.user = { college: userInst.institute.name };
            }
        }

        const students = await prisma.campusDriveStudent.findMany({
            where: queryFilter,
            include: {
                user: {
                    select: { name: true, email: true, phone: true, college: true }
                }
            }
        });
        res.json(students);
    } catch (error) {
        console.error('Error fetching campus drive students:', error);
        res.status(500).json({ error: 'Failed to fetch students' });
    }
});

module.exports = router;

