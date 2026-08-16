const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all approval requests
exports.getApprovalRequests = async (req, res) => {
    try {
        let { status, type } = req.query;
    if (status !== undefined) status = Array.isArray(status) ? status[0] : String(status);
    if (type !== undefined) type = Array.isArray(type) ? type[0] : String(type);

        
        const whereClause = {};
        if (status) whereClause.status = status;
        if (type) whereClause.entityType = type;

        const requests = await prisma.systemApprovalRequest.findMany({
            where: whereClause,
            orderBy: { createdAt: 'desc' }
        });

        res.json({
            success: true,
            requests
        });
    } catch (error) {
        console.error('Error fetching approval requests:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch approval requests.' });
    }
};

// Create an approval request (Usually called by registration endpoints)
exports.createApprovalRequest = async (req, res) => {
    try {
        const { entityType, requesterName, requesterEmail, requesterPhone, payload } = req.body;

        const request = await prisma.systemApprovalRequest.create({
            data: {
                entityType,
                requesterName,
                requesterEmail,
                requesterPhone,
                payload
            }
        });

        res.status(201).json({
            success: true,
            message: `${entityType} registration submitted for approval.`,
            request
        });
    } catch (error) {
        console.error('Error creating approval request:', error);
        res.status(500).json({ success: false, message: 'Failed to submit approval request.' });
    }
};

// Approve or Reject
exports.updateApprovalStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, rejectionReason, adminNotes } = req.body;
        const adminId = req.user?.userId;

        const request = await prisma.systemApprovalRequest.findUnique({ where: { id } });
        if (!request) {
            return res.status(404).json({ success: false, message: 'Request not found' });
        }

        const updatedRequest = await prisma.systemApprovalRequest.update({
            where: { id },
            data: {
                status,
                rejectionReason,
                adminNotes,
                approvedByAdminId: adminId
            }
        });

        // NOTE: Actually creating the User/Franchise/Employer entities would be handled via a trigger or specific logic in a service,
        // or we can implement the creation logic directly here based on entityType if status === 'APPROVED'.
        if (status === 'APPROVED') {
            await handleEntityCreation(updatedRequest);
        }

        res.json({
            success: true,
            message: `Request ${String(status || '').toLowerCase()} successfully`,
            request: updatedRequest
        });

    } catch (error) {
        console.error('Error updating approval status:', error);
        res.status(500).json({ success: false, message: 'Failed to update approval status.' });
    }
};

// Internal function to provision the actual account when approved
async function handleEntityCreation(request) {
    const payload = typeof request.payload === 'string' ? JSON.parse(request.payload) : request.payload;
    
    // Check if user already exists
    let user = await prisma.user.findUnique({ where: { email: request.requesterEmail } });
    
    let role = 'STUDENT';
    if (request.entityType === 'EMPLOYER' || request.entityType === 'COMPANY') role = 'EMPLOYER';
    if (request.entityType === 'FRANCHISE') role = 'FRANCHISE';
    if (request.entityType === 'INSTITUTE' || request.entityType === 'COLLEGE') role = 'INSTITUTE_ADMIN';
    if (request.entityType === 'STAFF') role = 'STAFF';

    if (!user) {
        user = await prisma.user.create({
            data: {
                name: request.requesterName,
                email: request.requesterEmail,
                password: payload.passwordHash || payload.password || 'temp_password', // Should be hashed beforehand
                phone: request.requesterPhone,
                role: role,
                isActive: true,
                emailVerified: true
            }
        });
    } else {
        user = await prisma.user.update({
            where: { id: user.id },
            data: { role, isActive: true }
        });
    }

    // Link entity
    await prisma.systemApprovalRequest.update({
        where: { id: request.id },
        data: { entityId: user.id }
    });

    // Create specific entity record if needed
    if (request.entityType === 'EMPLOYER') {
        const existingEmployer = await prisma.employerProfile.findUnique({ where: { userId: user.id } });
        if (!existingEmployer) {
            await prisma.employerProfile.create({
                data: {
                    userId: user.id,
                    companyName: payload.companyName || request.requesterName,
                    website: payload.website || null,
                    location: payload.address || null,
                    status: 'PENDING'
                }
            });
        }
    } else if (request.entityType === 'INSTITUTE' || request.entityType === 'COLLEGE') {
        const existingInstitute = await prisma.institute.findFirst({ where: { email: request.requesterEmail } });
        if (!existingInstitute) {
            const newInstitute = await prisma.institute.create({
                data: {
                    name: payload.instituteName || 'Unknown Institute',
                    type: request.entityType === 'COLLEGE' ? 'COLLEGE' : 'TRAINING_INSTITUTE',
                    email: request.requesterEmail,
                    phone: request.requesterPhone,
                    status: 'APPROVED',
                    contactPerson: request.requesterName
                }
            });
            // Update the user to belong to this institute
            await prisma.user.update({
                where: { id: user.id },
                data: { instituteId: newInstitute.id }
            });
        }
    } else if (request.entityType === 'FRANCHISE') {
        const existingFranchise = await prisma.franchise.findFirst({ where: { email: request.requesterEmail } });
        if (!existingFranchise) {
            const newFranchise = await prisma.franchise.create({
                data: {
                    name: payload.franchiseName || 'Unknown Franchise',
                    email: request.requesterEmail,
                    phone: request.requesterPhone,
                    status: 'ACTIVE',
                    contactPerson: request.requesterName
                }
            });
            // Update the user to belong to this franchise
            await prisma.user.update({
                where: { id: user.id },
                data: { franchiseId: newFranchise.id }
            });
        }
    } else if (request.entityType === 'STAFF') {
         // Create default staff goal/settings if needed
    }
}
