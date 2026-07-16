const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');

// Public Franchise Request (Creates Lead + Pending Franchise)
exports.publicFranchiseRequest = async (req, res, next) => {
    try {
        const { 
            name, franchiseType, contactPerson, email, phone, 
            address, state, city, pincode, googleBusinessUrl 
        } = req.body;

        if (!name || !email || !phone || !contactPerson) {
            return res.status(400).json({ error: 'Name, email, phone, and contact person are required' });
        }

        // Check if email already registered as franchise
        const existingFranchise = await prisma.franchise.findUnique({ where: { email } });
        if (existingFranchise) {
            return res.status(400).json({ error: 'Email already registered for a franchise request' });
        }

        // Create Franchise in PENDING state without user login yet
        const franchise = await prisma.franchise.create({
            data: {
                name,
                franchiseType,
                contactPerson,
                email,
                phone,
                address,
                state,
                city,
                pincode,
                googleBusinessUrl,
                status: 'PENDING',
                branchCode: `FRN-${Math.floor(1000 + Math.random() * 9000)}`
            }
        });

        // Initialize verification record
        await prisma.franchiseVerification.create({
            data: { franchiseId: franchise.id }
        });

        // Add to Leads so Sales team can track
        await prisma.lead.create({
            data: {
                name: contactPerson,
                email,
                phone,
                source: 'WEBSITE_FRANCHISE_REQUEST',
                status: 'NEW',
                courseOfInterest: 'FRANCHISE',
                city,
                state,
                franchiseId: franchise.id
            }
        });

        res.status(201).json({ success: true, data: franchise });
    } catch (err) {
        next(err);
    }
};

// Register a new Franchise (Admin Manual Creation)
exports.registerFranchise = async (req, res, next) => {
    try {
        const { 
            name, franchiseType, contactPerson, email, phone, 
            address, state, district, city, pincode, password 
        } = req.body;

        if (!name || !email || !phone || !password) {
            return res.status(400).json({ error: 'Name, email, phone, and password are required' });
        }

        // Check if franchise email already exists
        const existingFranchise = await prisma.franchise.findUnique({ where: { email } });
        if (existingFranchise) {
            return res.status(400).json({ error: 'Email already registered for a franchise' });
        }

        // Create Franchise
        const franchise = await prisma.franchise.create({
            data: {
                name,
                franchiseType,
                contactPerson,
                email,
                phone,
                address,
                state,
                district,
                city,
                pincode,
                branchCode: `FRN-${Math.floor(1000 + Math.random() * 9000)}`
            }
        });

        // Also create a user for the franchise admin
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await prisma.user.create({
            data: {
                name: contactPerson,
                email,
                phone,
                password: hashedPassword,
                role: 'FRANCHISE_ADMIN',
                franchiseId: franchise.id,
                emailVerified: false
            }
        });

        // Initialize verification record
        await prisma.franchiseVerification.create({
            data: { franchiseId: franchise.id }
        });

        res.status(201).json({ success: true, data: franchise });
    } catch (err) {
        next(err);
    }
};

exports.getFranchiseStats = async (req, res, next) => {
    try {
        let franchiseId = req.params.id; // Could be passed if SUPER_ADMIN
        
        if (req.user.role !== 'SUPER_ADMIN') {
            franchiseId = req.user.franchiseId;
        }

        if (!franchiseId && req.user.role === 'SUPER_ADMIN') {
            // Overall Admin Stats
            const total = await prisma.franchise.count();
            const active = await prisma.franchise.count({ where: { status: 'ACTIVE' } });
            const pending = await prisma.franchise.count({ where: { status: 'PENDING' } });
            const suspended = await prisma.franchise.count({ where: { status: 'SUSPENDED' } });
            const revenue = await prisma.franchiseRevenue.aggregate({
                where: { status: 'SETTLED' },
                _sum: { techwellShare: true, amount: true }
            });

            return res.status(200).json({ 
                success: true, 
                data: { 
                    total, 
                    active, 
                    pending, 
                    suspended,
                    totalRevenue: revenue._sum.amount || 0,
                    techwellRevenue: revenue._sum.techwellShare || 0,
                    upcomingRenewal: 0 // Placeholder until expiration logic is built
                } 
            });
        }

        // Specific Franchise Stats
        const revenue = await prisma.franchiseRevenue.aggregate({
            where: { franchiseId, status: 'SETTLED' },
            _sum: { franchiseShare: true }
        });

        const studentCount = await prisma.user.count({
            where: { franchiseId, role: 'STUDENT' }
        });

        const coursesSold = await prisma.enrollment.count({
            where: { user: { franchiseId } }
        });

        const certificatesIssued = await prisma.certificate.count({
            where: { franchiseId }
        });

        res.status(200).json({
            success: true,
            data: {
                revenue: revenue._sum.franchiseShare || 0,
                studentCount,
                coursesSold,
                certificatesIssued
            }
        });
    } catch (err) {
        next(err);
    }
};

exports.getAllFranchises = async (req, res, next) => {
    try {
        const franchises = await prisma.franchise.findMany({
            include: {
                verifications: true
            },
            orderBy: { createdAt: 'desc' }
        });
        res.status(200).json({ success: true, data: franchises });
    } catch (err) {
        next(err);
    }
};

exports.getFranchiseById = async (req, res, next) => {
    try {
        const { id } = req.params;
        
        // RBAC Check
        if (req.user.role !== 'SUPER_ADMIN' && req.user.franchiseId !== id) {
            return res.status(403).json({ error: 'Not authorized to view this franchise' });
        }

        const franchise = await prisma.franchise.findUnique({
            where: { id },
            include: {
                verifications: true,
                subscriptions: true,
                revenues: true,
                agreements: true,
                users: {
                    where: { role: { in: ['FRANCHISE_ADMIN', 'FRANCHISE_STAFF', 'FRANCHISE_TRAINER', 'FRANCHISE_COUNSELLOR'] } },
                    select: { id: true, name: true, email: true, role: true }
                }
            }
        });

        if (!franchise) {
            return res.status(404).json({ error: 'Franchise not found' });
        }

        res.status(200).json({ success: true, data: franchise });
    } catch (err) {
        next(err);
    }
};

exports.updateFranchise = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (req.user.role !== 'SUPER_ADMIN' && req.user.franchiseId !== id) {
            return res.status(403).json({ error: 'Not authorized to update this franchise' });
        }

        // Prevent Franchise Admins from changing their status/branchCode
        let dataToUpdate = { ...req.body };
        if (req.user.role !== 'SUPER_ADMIN') {
            delete dataToUpdate.status;
            delete dataToUpdate.branchCode;
            delete dataToUpdate.adminRemarks;
            delete dataToUpdate.approvedById;
        }

        const updated = await prisma.franchise.update({
            where: { id },
            data: dataToUpdate
        });

        res.status(200).json({ success: true, data: updated });
    } catch (err) {
        next(err);
    }
};

exports.deleteFranchise = async (req, res, next) => {
    try {
        const { id } = req.params;
        await prisma.franchise.delete({ where: { id } });
        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        next(err);
    }
};

exports.uploadVerificationDocs = async (req, res, next) => {
    try {
        const { id } = req.params;
        
        if (req.user.role !== 'SUPER_ADMIN' && req.user.franchiseId !== id) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        const updated = await prisma.franchiseVerification.update({
            where: { franchiseId: id },
            data: req.body
        });

        res.status(200).json({ success: true, data: updated });
    } catch (err) {
        next(err);
    }
};

exports.updateVerificationStatus = async (req, res, next) => {
    try {
        const { id } = req.params; // franchiseId
        const { status, remarks } = req.body;

        const updated = await prisma.franchiseVerification.update({
            where: { franchiseId: id },
            data: { status, remarks, verifiedAt: status === 'APPROVED' ? new Date() : null }
        });

        if (status === 'APPROVED') {
            await prisma.franchise.update({
                where: { id },
                data: { status: 'ACTIVE', approvedById: req.user.id }
            });
        }

        res.status(200).json({ success: true, data: updated });
    } catch (err) {
        next(err);
    }
};

exports.getSubscriptionDetails = async (req, res, next) => {
    try {
        const { id } = req.params;
        if (req.user.role !== 'SUPER_ADMIN' && req.user.franchiseId !== id) {
            return res.status(403).json({ error: 'Not authorized' });
        }
        const subs = await prisma.franchiseSubscription.findMany({ where: { franchiseId: id } });
        res.status(200).json({ success: true, data: subs });
    } catch (err) {
        next(err);
    }
};

exports.addSubscription = async (req, res, next) => {
    try {
        const { id } = req.params;
        const sub = await prisma.franchiseSubscription.create({
            data: { ...req.body, franchiseId: id }
        });
        res.status(201).json({ success: true, data: sub });
    } catch (err) {
        next(err);
    }
};

exports.getRevenueDetails = async (req, res, next) => {
    try {
        const { id } = req.params;
        if (req.user.role !== 'SUPER_ADMIN' && req.user.franchiseId !== id) {
            return res.status(403).json({ error: 'Not authorized' });
        }
        const revs = await prisma.franchiseRevenue.findMany({ 
            where: { franchiseId: id },
            orderBy: { createdAt: 'desc' }
        });
        res.status(200).json({ success: true, data: revs });
    } catch (err) {
        next(err);
    }
};

exports.recordOfflinePayment = async (req, res, next) => {
    try {
        // Only FRANCHISE_ADMIN can call this (or staff if we expand later)
        const franchiseId = req.user.franchiseId;
        if (!franchiseId) {
            return res.status(403).json({ error: 'Must be associated with a franchise' });
        }

        const { studentId, courseId, amountCollected } = req.body;

        if (!studentId || !courseId || amountCollected === undefined) {
            return res.status(400).json({ error: 'studentId, courseId, and amountCollected are required' });
        }

        // 1. Get Franchise Config
        const franchise = await prisma.franchise.findUnique({
            where: { id: franchiseId },
            select: { royaltyPercentage: true, name: true }
        });

        if (!franchise) {
            return res.status(404).json({ error: 'Franchise not found' });
        }

        // 2. Calculate Math
        const techwellShare = parseFloat(amountCollected) * (franchise.royaltyPercentage / 100);

        // 3. Create Payment Record (CASH_FRANCHISE)
        const payment = await prisma.payment.create({
            data: {
                orderId: `CASH-${Date.now()}-${Math.floor(Math.random()*1000)}`,
                amount: parseFloat(amountCollected),
                status: 'SUCCESS',
                paymentMethod: 'CASH_FRANCHISE',
                userId: studentId,
                courseId: courseId,
                franchiseId: franchiseId
            }
        });

        // 4. Upsert Enrollment
        const enrollment = await prisma.enrollment.upsert({
            where: {
                userId_courseId: {
                    userId: studentId,
                    courseId: courseId
                }
            },
            update: { status: 'ACTIVE' },
            create: {
                userId: studentId,
                courseId: courseId,
                status: 'ACTIVE'
            }
        });

        // 5. Update Franchise Ledger (Debit = Franchise owes Techwell)
        // Find last balance
        const lastLedger = await prisma.franchiseLedger.findFirst({
            where: { franchiseId },
            orderBy: { createdAt: 'desc' }
        });

        const previousBalance = lastLedger ? lastLedger.balanceAfter : 0;
        const newBalance = previousBalance + techwellShare;

        const ledger = await prisma.franchiseLedger.create({
            data: {
                franchiseId: franchiseId,
                transactionType: 'DEBIT',
                amount: techwellShare,
                balanceAfter: newBalance,
                description: `Royalty (${franchise.royaltyPercentage}%) for Offline Enrollment in Course.`,
                referenceId: payment.id
            }
        });

        res.status(200).json({
            success: true,
            message: 'Offline payment recorded and ledger updated.',
            data: {
                paymentId: payment.id,
                techwellShare,
                newLedgerBalance: newBalance
            }
        });

    } catch (err) {
        next(err);
    }
};

exports.getAgreement = async (req, res, next) => {
    try {
        const { id } = req.params;
        let agreement = await prisma.franchiseAgreement.findFirst({
            where: { franchiseId: id, status: 'ACTIVE' },
            orderBy: { createdAt: 'desc' }
        });

        // Generate a default agreement if one doesn't exist
        if (!agreement) {
            const franchise = await prisma.franchise.findUnique({ where: { id } });
            if (!franchise) return res.status(404).json({ success: false, error: 'Franchise not found' });
            
            agreement = await prisma.franchiseAgreement.create({
                data: {
                    franchiseId: id,
                    version: '1.0',
                    content: `This Franchise Agreement is entered into between Techwell Institute of Technology ("Franchisor") and ${franchise.name} ("Franchisee"). Franchisor grants the Franchisee the non-exclusive right to operate a Techwell learning center at the approved location. Franchisee agrees to share ${franchise.royaltyPercentage}% of tuition revenue as royalty. Both parties agree to abide by the standard operating procedures and code of conduct.`
                }
            });
        }
        
        res.json({ success: true, data: agreement });
    } catch (err) {
        next(err);
    }
};

exports.acceptAgreement = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { signatureUrl, ipAddress } = req.body;
        
        const agreement = await prisma.franchiseAgreement.findFirst({
            where: { franchiseId: id, status: 'ACTIVE' },
            orderBy: { createdAt: 'desc' }
        });
        
        if (!agreement) {
            return res.status(404).json({ success: false, error: 'Active agreement not found' });
        }
        
        if (agreement.termsAccepted) {
            return res.status(400).json({ success: false, error: 'Agreement already accepted' });
        }
        
        const updated = await prisma.franchiseAgreement.update({
            where: { id: agreement.id },
            data: {
                termsAccepted: true,
                acceptedAt: new Date(),
                digitalSignatureUrl: signatureUrl || null,
                ipAddress: ipAddress || req.ip
            }
        });
        
        res.json({ success: true, data: updated, message: 'Agreement successfully accepted' });
    } catch (err) {
        next(err);
    }
};

exports.getResources = async (req, res, next) => {
    try {
        const franchiseId = req.user.role === 'SUPER_ADMIN' ? null : req.user.franchiseId;
        
        // Franchise sees global resources + their specific resources
        const whereClause = franchiseId 
            ? { OR: [{ franchiseId: null }, { franchiseId }] } 
            : {}; // Admin sees all

        const resources = await prisma.franchiseResource.findMany({
            where: whereClause,
            orderBy: { createdAt: 'desc' }
        });
        res.status(200).json({ success: true, data: resources });
    } catch (err) {
        next(err);
    }
};

exports.addResource = async (req, res, next) => {
    try {
        const { title, description, fileUrl, resourceType, franchiseId } = req.body;
        
        const resource = await prisma.franchiseResource.create({
            data: {
                title,
                description,
                fileUrl,
                resourceType, // BROCHURE, BANNER, SYLLABUS, VIDEO
                franchiseId: franchiseId || null
            }
        });

        res.status(201).json({ success: true, data: resource });
    } catch (err) {
        next(err);
    }
};

exports.getFranchiseDashboard = async (req, res, next) => {
    try {
        const { id } = req.params;
        if (req.user.role !== 'SUPER_ADMIN' && req.user.franchiseId !== id) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        const stats = await prisma.$transaction([
            prisma.user.count({ where: { franchiseId: id, role: 'STUDENT' } }),
            prisma.lead.count({ where: { franchiseId: id } }),
            prisma.payment.aggregate({ where: { franchiseId: id, status: 'SUCCESS' }, _sum: { amount: true } }),
            prisma.enrollment.count({ where: { user: { franchiseId: id } } })
        ]);

        res.json({
            success: true,
            data: {
                totalStudents: stats[0],
                totalLeads: stats[1],
                totalRevenue: stats[2]?._sum?.amount || 0,
                totalEnrollments: stats[3]
            }
        });
    } catch (err) {
        next(err);
    }
};

exports.getFranchiseLeads = async (req, res, next) => {
    try {
        const { id } = req.params;
        if (req.user.role !== 'SUPER_ADMIN' && req.user.franchiseId !== id) {
            return res.status(403).json({ error: 'Not authorized' });
        }
        
        const leads = await prisma.lead.findMany({
            where: { franchiseId: id },
            orderBy: { createdAt: 'desc' }
        });

        res.json({ success: true, data: leads });
    } catch (err) {
        next(err);
    }
};
