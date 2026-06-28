const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');
const prisma = new PrismaClient();

// -------------------------------------------------------------
// PUBLIC API (For Candidates via Private Link)
// -------------------------------------------------------------

exports.verifyInvitation = async (req, res) => {
    try {
        const { token } = req.params;
        const invitation = await prisma.consultancyInvitation.findUnique({
            where: { token },
            include: { agreement: true }
        });

        if (!invitation) {
            return res.status(404).json({ success: false, message: 'Invalid invitation link.' });
        }

        if (new Date() > new Date(invitation.expiresAt)) {
            return res.status(400).json({ success: false, message: 'This invitation has expired.' });
        }

        if (invitation.status !== 'INVITED' && invitation.status !== 'PENDING_ACCEPTANCE') {
            return res.status(400).json({ success: false, message: 'This invitation has already been processed.' });
        }

        res.json({ success: true, invitation });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.submitAgreement = async (req, res) => {
    try {
        const { token } = req.params;
        const data = req.body;

        const invitation = await prisma.consultancyInvitation.findUnique({ where: { token } });
        if (!invitation || invitation.status !== 'INVITED' && invitation.status !== 'PENDING_ACCEPTANCE') {
            return res.status(400).json({ success: false, message: 'Invalid or expired invitation.' });
        }

        // Create Agreement
        const agreement = await prisma.consultancyAgreement.create({
            data: {
                fullName: data.fullName,
                parentsName: data.parentsName,
                dob: new Date(data.dob),
                gender: data.gender,
                aadhaarNumber: data.aadhaarNumber,
                panNumber: data.panNumber,
                passportPhotoUrl: data.passportPhotoUrl,
                livePhotoUrl: data.livePhotoUrl,
                liveSelfieUrl: data.liveSelfieUrl,
                
                currentAddress: data.currentAddress,
                permanentAddress: data.permanentAddress,
                city: data.city,
                state: data.state,
                pinCode: data.pinCode,
                
                mobileNumber: data.mobileNumber,
                alternateMobile: data.alternateMobile,
                emailAddress: data.emailAddress,
                emergencyContactName: data.emergencyContactName,
                emergencyContactNum: data.emergencyContactNum,
                
                highestQualification: data.highestQualification,
                specialization: data.specialization,
                collegeUniversity: data.collegeUniversity,
                graduationYear: Number(data.graduationYear),
                percentageCgpa: data.percentageCgpa,
                
                experienceLevel: data.experienceLevel,
                currentCompany: data.currentCompany,
                totalExperience: data.totalExperience,
                relevantExperience: data.relevantExperience,
                currentCtc: data.currentCtc,
                expectedCtc: data.expectedCtc,
                noticePeriod: data.noticePeriod,
                preferredLocations: data.preferredLocations,
                preferredJobRoles: data.preferredJobRoles,
                preferredIndustry: data.preferredIndustry,
                resumeUrl: data.resumeUrl,
                
                digitalSignatureUrl: data.digitalSignatureUrl,
                agreementVersion: data.agreementVersion || "1.0",
                acceptedAt: new Date(),
                browserInfo: req.headers['user-agent'],
                ipAddress: req.ip || req.connection.remoteAddress,
                locationCoords: data.locationCoords
            }
        });

        // Update Invitation Status
        await prisma.consultancyInvitation.update({
            where: { token },
            data: {
                status: 'AGREEMENT_ACCEPTED',
                agreementId: agreement.id
            }
        });

        res.json({ success: true, message: 'Agreement successfully submitted and recorded.', agreement });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


// -------------------------------------------------------------
// ADMIN API (Protected Routes)
// -------------------------------------------------------------

exports.getDashboardStats = async (req, res) => {
    try {
        const statuses = [
            'INVITED', 'PENDING_ACCEPTANCE', 'AGREEMENT_ACCEPTED', 
            'PROCESSING', 'INTERVIEW_SCHEDULED', 'OFFER_RELEASED', 
            'JOINED', 'COMPLETED', 'CLOSED'
        ];

        const grouped = await prisma.consultancyInvitation.groupBy({
            by: ['status'],
            _count: true
        });

        const total = await prisma.consultancyInvitation.count();
        const counts = {};
        statuses.forEach(s => counts[s] = 0);
        
        grouped.forEach(g => {
            counts[g.status] = g._count;
        });

        res.json({ success: true, stats: { total, counts } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getInvitations = async (req, res) => {
    try {
        const { status } = req.query;
        const where = status ? { status } : {};

        const invitations = await prisma.consultancyInvitation.findMany({
            where,
            include: { agreement: true },
            orderBy: { createdAt: 'desc' }
        });
        res.json({ success: true, invitations });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.createInvitation = async (req, res) => {
    try {
        const { name, email, phone, customTerms, jobRole, feePercentage, prefilledData } = req.body;
        
        const token = crypto.randomBytes(24).toString('hex');
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7); // Valid for 7 days

        const invitation = await prisma.consultancyInvitation.create({
            data: {
                name,
                email,
                phone,
                customTerms,
                jobRole,
                feePercentage,
                prefilledData,
                token,
                expiresAt,
                status: 'INVITED'
            }
        });

        // Normally you would trigger an email/SMS here
        
        res.json({ success: true, invitation, link: `/consultancy/invite/${token}` });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateCandidateStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const updated = await prisma.consultancyInvitation.update({
            where: { id },
            data: { status }
        });

        res.json({ success: true, updated });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateInvitation = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, phone, customTerms, jobRole, feePercentage, prefilledData } = req.body;
        
        const existing = await prisma.consultancyInvitation.findUnique({ where: { id } });
        if (!existing) return res.status(404).json({ message: "Invitation not found" });
        if (existing.status !== 'INVITED') return res.status(400).json({ message: "Cannot edit an accepted or processing invitation" });
        
        const updated = await prisma.consultancyInvitation.update({
            where: { id },
            data: { name, email, phone, customTerms, jobRole, feePercentage, prefilledData }
        });
        
        res.json({ success: true, invitation: updated });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
