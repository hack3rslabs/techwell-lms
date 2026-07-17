const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Super Admin: Get all drives in the system
exports.getAdminDrives = async (req, res) => {
    try {
        const drives = await prisma.campusDrive.findMany({
            include: { 
                employer: { select: { id: true, name: true, email: true, company: true } },
                institutes: { include: { institute: { select: { name: true, type: true } } } },
                _count: { select: { students: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(drives);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch all drives' });
    }
};

// Employer or Institute Admin: Request/Create a new Campus Drive
exports.createCampusDrive = async (req, res) => {
    try {
        const { instituteIds, isOffCampus, eligibilityCriteria, title, description, skills, jobRole, salary, openings, hiringMode, targetYear, departments, location, scheduledDate, hostType } = req.body;
        
        const isEmployer = req.user.role === 'EMPLOYER';
        const isInstituteRole = ['INSTITUTE_ADMIN', 'INSTITUTE_OWNER', 'COLLEGE_ADMIN'].includes(req.user.role);
        
        let driveData = {
            isOffCampus: isOffCampus || false,
            eligibilityCriteria: eligibilityCriteria || null,
            title,
            description,
            skills,
            jobRole,
            salary,
            openings: openings ? parseInt(openings) : null,
            hiringMode,
            targetYear,
            departments,
            location,
            scheduledDate: scheduledDate ? new Date(scheduledDate) : null,
        };

        if (isEmployer) {
            driveData.employerId = req.user.id;
            driveData.hostType = 'TECHWELL';
            driveData.status = 'REQUESTED';
        } else if (isInstituteRole) {
            if (!req.user.instituteId) {
                return res.status(400).json({ error: 'You are not assigned to an institute.' });
            }
            driveData.hostType = 'INSTITUTE';
            // Instantly approve since the institute itself is creating it
            driveData.status = 'APPROVED'; 
        } else {
            // Super Admin or Staff
            driveData.hostType = hostType || 'TECHWELL';
            driveData.status = 'APPROVED';
        }

        const drive = await prisma.campusDrive.create({
            data: driveData
        });

        // Link the drive to institutes
        if (isEmployer && !isOffCampus && instituteIds && instituteIds.length > 0) {
            const instituteLinks = instituteIds.map(id => ({
                driveId: drive.id,
                instituteId: id,
                status: 'INVITED'
            }));
            await prisma.campusDriveInstitute.createMany({
                data: instituteLinks,
                skipDuplicates: true
            });
        } else if (isInstituteRole) {
            // Self-link the institute
            await prisma.campusDriveInstitute.create({
                data: {
                    driveId: drive.id,
                    instituteId: req.user.instituteId,
                    status: 'ACCEPTED' // Institute created it, so they already accept it
                }
            });
        }

        res.status(201).json({ message: 'Campus drive created successfully', drive });
    } catch (error) {
        console.error('Create Campus Drive Error:', error);
        res.status(500).json({ error: 'Failed to create campus drive' });
    }
};

// Institute Admin: Get all drives for their institute
exports.getInstituteDrives = async (req, res) => {
    try {
        if (!req.user.instituteId) return res.status(400).json({ error: 'Not associated with an institute' });

        const driveLinks = await prisma.campusDriveInstitute.findMany({
            where: { instituteId: req.user.instituteId },
            include: {
                drive: {
                    include: { employer: { select: { id: true, name: true, email: true } } }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        // Map to return just the drives with their specific link status
        const drives = driveLinks.map(link => ({
            ...link.drive,
            instituteLinkStatus: link.status
        }));

        res.json(drives);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch drives' });
    }
};

// Employer: Get all drives they requested
exports.getEmployerDrives = async (req, res) => {
    try {
        const drives = await prisma.campusDrive.findMany({
            where: { employerId: req.user.id },
            include: {
                institutes: {
                    include: { institute: { select: { id: true, name: true, type: true } } }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        res.json(drives);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch employer drives' });
    }
};

// Institute Admin: Update drive status (Approve/Reject)
exports.updateDriveStatus = async (req, res) => {
    try {
        const { driveId } = req.params;
        const { status } = req.body; // APPROVED, REJECTED, SCHEDULED
        
        // Ensure the drive is linked to the user's institute
        const link = await prisma.campusDriveInstitute.findUnique({
            where: { driveId_instituteId: { driveId, instituteId: req.user.instituteId } }
        });
        
        if (!link) {
            return res.status(404).json({ error: 'Drive not linked to your institute' });
        }

        // Update the link status (e.g. Institute accepts/rejects the employer's drive)
        const updatedLink = await prisma.campusDriveInstitute.update({
            where: { id: link.id },
            data: { status }
        });

        res.json({ message: 'Drive status updated for your institute', link: updatedLink });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update drive status' });
    }
};

// Institute Admin: Invite students to a drive
exports.inviteStudents = async (req, res) => {
    try {
        const { driveId } = req.params;
        const { studentIds } = req.body; // Array of user IDs

        // Ensure access (Drive must be linked to the institute AND accepted)
        const link = await prisma.campusDriveInstitute.findUnique({
            where: { driveId_instituteId: { driveId, instituteId: req.user.instituteId } }
        });
        
        if (!link || link.status !== 'ACCEPTED') {
            return res.status(404).json({ error: 'Drive not found, or your institute has not accepted it yet.' });
        }

        const participations = studentIds.map(userId => ({
            driveId,
            userId,
            status: 'INVITED'
        }));

        await prisma.campusDriveStudent.createMany({
            data: participations,
            skipDuplicates: true
        });

        res.json({ message: 'Students invited successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to invite students' });
    }
};

// Student: Get their campus drive invitations
exports.getMyDrives = async (req, res) => {
    try {
        const drives = await prisma.campusDriveStudent.findMany({
            where: { userId: req.user.id },
            include: {
                drive: {
                    include: { employer: { select: { name: true, email: true } } }
                }
            }
        });
        res.json(drives);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch my drives' });
    }
};

// Student: Apply to a drive
exports.applyToDrive = async (req, res) => {
    try {
        const { driveId } = req.params;
        const { resumeUrl } = req.body;

        const participation = await prisma.campusDriveStudent.findFirst({
            where: { driveId, userId: req.user.id }
        });

        if (!participation) {
            // They weren't invited, so maybe they are applying generally (if drive is open)
            // But for now, we assume they need to be at least ELIGIBLE or INVITED.
            return res.status(403).json({ error: 'You are not eligible for this drive' });
        }

        const updated = await prisma.campusDriveStudent.update({
            where: { id: participation.id },
            data: { status: 'APPLIED', resumeUrl }
        });

        res.json({ message: 'Applied successfully', participation: updated });
    } catch (error) {
        res.status(500).json({ error: 'Failed to apply' });
    }
};

// Employer / Admin: Update candidate pipeline status
exports.updatePipelineStatus = async (req, res) => {
    try {
        const { driveId, studentId } = req.params;
        const { status, offerLetterUrl, ctc } = req.body;
        
        // Ensure access (drive belongs to employer or is admin)
        const drive = await prisma.campusDrive.findUnique({ where: { id: driveId } });
        if (!drive) return res.status(404).json({ error: 'Drive not found' });
        
        if (req.user.role !== 'SUPER_ADMIN' && drive.employerId !== req.user.id) {
            return res.status(403).json({ error: 'Access denied' });
        }

        const updated = await prisma.campusDriveStudent.updateMany({
            where: { driveId, userId: studentId },
            data: { status, offerLetterUrl, ctc }
        });

        res.json({ message: 'Pipeline status updated', updated });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update pipeline' });
    }
};

// Admin / Institute: AI Match students to a drive based on criteria
exports.matchStudents = async (req, res) => {
    try {
        const { driveId } = req.params;
        
        const drive = await prisma.campusDrive.findUnique({ 
            where: { id: driveId },
            include: { institutes: true }
        });
        
        if (!drive) return res.status(404).json({ error: 'Drive not found' });

        // Get all students belonging to the invited institutes
        const instituteIds = drive.institutes.map(link => link.instituteId);
        
        // In a real system, we would query users linked to these institutes
        // For now, let's fetch all users with role 'STUDENT' and simulate AI matching
        const students = await prisma.user.findMany({
            where: { role: 'STUDENT' },
            include: { candidateProfile: true }
        });

        const matches = [];

        for (const student of students) {
            // Simulated AI Matching Logic
            // In reality, this would call an LLM or use Vector Embeddings to match 
            // student.candidateProfile.parsedText with drive.description and drive.skills
            let aiMatchScore = Math.floor(Math.random() * 100); 
            
            // Boost score if they have a good ATS score
            if (student.candidateProfile?.atsScore) {
                aiMatchScore = (aiMatchScore + student.candidateProfile.atsScore) / 2;
            }

            if (aiMatchScore >= 60) { // Threshold for matching
                matches.push({
                    userId: student.id,
                    driveId: drive.id,
                    status: 'ELIGIBLE',
                    atsScore: aiMatchScore
                });
            }
        }

        if (matches.length > 0) {
            await prisma.campusDriveStudent.createMany({
                data: matches,
                skipDuplicates: true
            });
        }

        res.json({ message: `AI matched ${matches.length} students to this drive`, matchedCount: matches.length });
    } catch (error) {
        console.error('AI Matching Error:', error);
        res.status(500).json({ error: 'Failed to run AI matching' });
    }
};
