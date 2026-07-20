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

        // If status is CREATED or SENT, automatically transition to OPENED when they hit verify
        if (invitation.status === 'CREATED' || invitation.status === 'SENT') {
            await prisma.consultancyInvitation.update({
                where: { id: invitation.id },
                data: { status: 'OPENED', openedAt: new Date() }
            });
            invitation.status = 'OPENED';
        }

        // Only allow progression if not already accepted/closed
        if (['AGREEMENT_ACCEPTED', 'ACTIVE', 'CLOSED', 'JOINED', 'COMPLETED', 'OFFER_RELEASED'].includes(invitation.status)) {
             return res.status(400).json({ success: false, message: 'This invitation has already been processed.' });
        }

        res.json({ success: true, invitation });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updatePublicStatus = async (req, res) => {
    try {
        const { token } = req.params;
        const { status } = req.body;
        
        const invitation = await prisma.consultancyInvitation.findUnique({ where: { token } });
        if (!invitation) return res.status(404).json({ success: false, message: 'Invalid invitation link.' });

        const dataToUpdate = { status };
        
        // Track timestamps for progression
        if (status === 'STARTED' && !invitation.startedAt) dataToUpdate.startedAt = new Date();
        if (status === 'SUBMITTED' && !invitation.submittedAt) dataToUpdate.submittedAt = new Date();
        
        const updated = await prisma.consultancyInvitation.update({
            where: { id: invitation.id },
            data: dataToUpdate
        });
        
        res.json({ success: true, invitation: updated });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.uploadCandidateDocument = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
        
        const { token } = req.params;
        const invitation = await prisma.consultancyInvitation.findUnique({ where: { token } });
        if (!invitation) return res.status(404).json({ success: false, message: 'Invalid invitation link.' });

        const baseUrl = `${req.protocol}://${req.get('host')}`;
        const fileUrl = `${baseUrl}/uploads/${req.file.filename}`;

        res.json({ success: true, url: fileUrl });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.submitAgreement = async (req, res) => {
    try {
        const { token } = req.params;
        const data = req.body;

        const invitation = await prisma.consultancyInvitation.findUnique({ where: { token } });
        
        if (!invitation) {
            return res.status(404).json({ success: false, message: 'Invalid invitation link.' });
        }
        if (new Date() > new Date(invitation.expiresAt)) {
            return res.status(400).json({ success: false, message: 'This invitation has expired.' });
        }
        if (['AGREEMENT_ACCEPTED', 'ACTIVE', 'CLOSED', 'JOINED', 'COMPLETED', 'OFFER_RELEASED'].includes(invitation.status)) {
            return res.status(400).json({ success: false, message: 'This invitation has already been processed.' });
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
                locationCoords: data.locationCoords,
                advanceFee: data.advanceFee ? parseFloat(data.advanceFee) : null,
                totalFee: data.totalFee ? parseFloat(data.totalFee) : null
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
            'INVITED', 'OPENED', 'STARTED', 'SUBMITTED', 'PENDING_ACCEPTANCE', 'AGREEMENT_ACCEPTED', 
            'PROCESSING', 'INTERVIEW_SCHEDULED', 'OFFER_RELEASED', 
            'JOINED', 'COMPLETED', 'CLOSED', 'EXPIRED'
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
        let { status } = req.query;
    if (status !== undefined) status = Array.isArray(status) ? status[0] : String(status);

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
        const { name, email, phone, customTerms, jobRole, feePercentage, prefilledData, advanceFee, totalFee } = req.body;
        
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
                advanceFee: advanceFee ? parseFloat(advanceFee) : null,
                totalFee: totalFee ? parseFloat(totalFee) : null,
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
        const { name, email, phone, customTerms, jobRole, feePercentage, prefilledData, advanceFee, totalFee } = req.body;
        
        const existing = await prisma.consultancyInvitation.findUnique({ where: { id } });
        if (!existing) return res.status(404).json({ message: "Invitation not found" });
        if (existing.status !== 'INVITED') return res.status(400).json({ message: "Cannot edit an accepted or processing invitation" });
        
        const updated = await prisma.consultancyInvitation.update({
            where: { id },
            data: { 
                name, email, phone, customTerms, jobRole, feePercentage, prefilledData,
                advanceFee: advanceFee ? parseFloat(advanceFee) : null,
                totalFee: totalFee ? parseFloat(totalFee) : null 
            }
        });
        
        res.json({ success: true, invitation: updated });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.autoMatchJobs = async (req, res) => {
    try {
        const { id } = req.params;
        // id is invitation ID, which has agreement ID, which has candidate details.
        const invitation = await prisma.consultancyInvitation.findUnique({
            where: { id },
            include: { agreement: true }
        });

        if (!invitation || !invitation.agreement) {
            return res.status(400).json({ message: "Candidate agreement not found" });
        }

        const candidateSkills = invitation.agreement.skills || 'General';
        const candidateExp = invitation.agreement.totalExperience || '0';
        const candidateRole = invitation.jobRole || 'General';

        // Fetch open jobs
        const openJobs = await prisma.job.findMany({
            where: { status: 'OPEN' },
            take: 20
        });

        if (openJobs.length === 0) return res.json({ matches: [] });

        if (!process.env.GEMINI_API_KEY) {
            // Mock matches
            const matches = openJobs.slice(0, 3).map((j, i) => ({
                jobId: j.id,
                title: j.title,
                matchPercentage: 90 - (i * 10),
                rationale: `(Mock) Job matches candidate role ${candidateRole}`
            }));
            return res.json({ matches });
        }

        const { GoogleGenerativeAI } = require('@google/generative-ai');
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const jobData = openJobs.map(j => ({
            id: j.id,
            title: j.title,
            skills: j.skills,
            experience: j.experience
        }));

        const prompt = `
You are an expert Technical Recruiter AI for a Consultancy.
Match the following Candidate against a list of Open Jobs and return the top 3 matches in a JSON array.

=== CANDIDATE DETAILS ===
Role: ${candidateRole}
Skills: ${candidateSkills}
Experience: ${candidateExp}

=== OPEN JOBS ===
${JSON.stringify(jobData)}

=== INSTRUCTIONS ===
Return ONLY a valid JSON array of objects (no markdown wrappers) with this exact structure:
[
  {
    "jobId": "id string",
    "title": "Job Title",
    "matchPercentage": number (0-100),
    "rationale": "1-2 short sentences explaining why they are a good fit."
  }
]
`;

        const result = await model.generateContent(prompt);
        let cleanJson = result.response.text().replace(/\`\`\`json/gi, '').replace(/\`\`\`/g, '').trim();
        const aiMatches = JSON.parse(cleanJson);

        res.json({ matches: aiMatches.sort((a, b) => b.matchPercentage - a.matchPercentage) });
    } catch (error) {
        console.error("Auto Match Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};
