const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get student's own referral stats
exports.getMyReferrals = async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            include: {
                referralsMade: {
                    select: { id: true, name: true, email: true, createdAt: true }
                },
                referralRewardsAsReferrer: true
            }
        });

        res.json({
            success: true,
            data: {
                referralCode: user.referralCode,
                commissionBalance: user.referralCommissionBal,
                referrals: user.referralsMade,
                rewards: user.referralRewardsAsReferrer
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Generate referral code for student if they don't have one
exports.generateReferralCode = async (req, res) => {
    try {
        const user = await prisma.user.findUnique({ where: { id: req.user.id } });
        if (user.referralCode) {
            return res.json({ success: true, referralCode: user.referralCode });
        }

        // Generate unique code (e.g. name prefix + random string)
        const prefix = user.name.substring(0, 3).toUpperCase().replace(/[^A-Z]/g, '') || 'REF';
        const randomString = Math.random().toString(36).substring(2, 6).toUpperCase();
        const code = `${prefix}${randomString}`;

        const updatedUser = await prisma.user.update({
            where: { id: req.user.id },
            data: { referralCode: code }
        });

        res.json({ success: true, referralCode: updatedUser.referralCode });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Apply referral code (public endpoint, used during checkout/enrollment)
exports.applyReferral = async (req, res) => {
    try {
        const { code } = req.body;
        if (!code) return res.status(400).json({ success: false, message: 'Referral code is required' });

        const referrer = await prisma.user.findUnique({
            where: { referralCode: String(code || "").toUpperCase() }
        });

        if (!referrer) {
            return res.status(404).json({ success: false, message: 'Invalid referral code' });
        }

        // Return a standard discount format so checkout can handle it identically to a coupon
        res.json({
            success: true,
            data: {
                type: 'REFERRAL',
                referrerId: referrer.id,
                referrerName: referrer.name,
                discountPercent: 10 // e.g. 10% off for the referred user
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Admin stats
exports.getAdminReferralStats = async (req, res) => {
    try {
        const topReferrers = await prisma.user.findMany({
            where: { referralCommissionBal: { gt: 0 } },
            orderBy: { referralCommissionBal: 'desc' },
            take: 10,
            select: { id: true, name: true, email: true, referralCode: true, referralCommissionBal: true, _count: { select: { referralsMade: true } } }
        });

        const totalRewards = await prisma.referralReward.aggregate({
            _sum: { amount: true }
        });

        res.json({ success: true, data: { topReferrers, totalCommissionPaid: totalRewards._sum.amount || 0 } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
