const express = require('express');
const { authenticate, authorize, checkPermission, optionalAuth } = require('../middleware/auth');
const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');
const router = express.Router();
const prisma = new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL } } });

// Helper to mask secrets
const mask = (str) => str ? `${str.substring(0, 4)}...${str.substring(str.length - 4)}` : '';
const isLiveRazorpayKey = (keyId = '') => keyId.startsWith('rzp_live_');

const getRazorpayCredentials = async (req) => {
    const config = await prisma.paymentConfig.findFirst();
    const liveKeyId = process.env.RAZORPAY_KEY_ID || config?.razorpayKeyId || '';
    const liveKeySecret = process.env.RAZORPAY_KEY_SECRET || config?.razorpayKeySecret || '';
    const testKeyId = process.env.RAZORPAY_TEST_KEY_ID || '';
    const testKeySecret = process.env.RAZORPAY_TEST_KEY_SECRET || '';

    if (liveKeyId && liveKeySecret) {
        return {
            keyId: liveKeyId,
            keySecret: liveKeySecret,
            mode: isLiveRazorpayKey(liveKeyId) ? 'LIVE' : 'TEST',
            source: process.env.RAZORPAY_KEY_ID ? 'env' : 'database'
        };
    }

    return null;
};

// GET /api/payment/config
router.get('/config', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), async (req, res) => {
    try {
        let config = await prisma.paymentConfig.findFirst();
        if (!config) {
            // Return default empty struct
            return res.json({
                razorpayKeyId: '',
                razorpayKeySecret: '',
                stripePublishableKey: '',
                stripeSecretKey: '',
                activeGateway: 'NONE',
                currency: 'INR'
            });
        }

        // Return masked secrets
        res.json({
            ...config,
            razorpayKeySecret: mask(config.razorpayKeySecret),
            stripeSecretKey: mask(config.stripeSecretKey)
        });
    } catch (error) {
        console.error("Payment Config Fetch Error:", error);
        res.status(500).json({ error: "Failed to fetch config" });
    }
});

// PUT /api/payment/config
router.put('/config', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), async (req, res) => {
    try {
        const {
            razorpayKeyId, razorpayKeySecret,
            stripePublishableKey, stripeSecretKey,
            activeGateway, currency
        } = req.body;

        // Find existing to check if secret is being updated or kept same
        const existing = await prisma.paymentConfig.findFirst();

        const data = {
            razorpayKeyId,
            stripePublishableKey,
            activeGateway,
            currency
        };

        // Only update secrets if they differ from masked version (meaning user typed new one)
        // Simple logic: if input includes "...", ignore it. If full string, save it.
        // Better logic: user sends "UNCHANGED" or null. But for now we assume masking format.
        if (razorpayKeySecret && !razorpayKeySecret.includes('...')) {
            data.razorpayKeySecret = razorpayKeySecret;
        }
        if (stripeSecretKey && !stripeSecretKey.includes('...')) {
            data.stripeSecretKey = stripeSecretKey;
        }

        if (existing) {
            const updated = await prisma.paymentConfig.update({
                where: { id: existing.id },
                data
            });
            res.json(updated);
        } else {
            const created = await prisma.paymentConfig.create({
                data: {
                    ...data,
                    // If creates new, must use provided secrets (even if empty)
                    razorpayKeySecret: razorpayKeySecret || '',
                    stripeSecretKey: stripeSecretKey || ''
                }
            });
            res.json(created);
        }
    } catch (error) {
        console.error("Payment Config Update Error:", error);
        res.status(500).json({ error: "Failed to update config" });
    }
});



// POST /api/payments/create-order (Generic for User Checkout)
router.post('/create-order', authenticate, async (req, res) => {
    try {
        const { amount, currency = "INR", courseId } = req.body;

        if (!courseId) {
            return res.status(400).json({ error: "courseId is required" });
        }

        const course = await prisma.course.findUnique({
            where: { id: courseId },
            select: {
                id: true,
                isPublished: true,
                price: true,
                bundlePrice: true
            }
        });

        if (!course) {
            return res.status(404).json({ error: "Course not found" });
        }

        if (!course.isPublished) {
            return res.status(400).json({ error: "Course is not available for payment" });
        }

        const normalizedAmount = Number(amount);
        if (Number.isNaN(normalizedAmount) || normalizedAmount < 0) {
            return res.status(400).json({ error: "Invalid payment amount" });
        }

        if (normalizedAmount === 0) {
            const existingEnrollment = await prisma.enrollment.findUnique({
                where: {
                    userId_courseId: {
                        userId: req.user.id,
                        courseId
                    }
                }
            });

            if (!existingEnrollment) {
                await prisma.enrollment.create({
                    data: {
                        userId: req.user.id,
                        courseId,
                        status: 'ACTIVE'
                    }
                });
            }

            return res.json({
                gateway: 'FREE',
                message: 'Free enrollment completed successfully.'
            });
        }

        const config = await prisma.paymentConfig.findFirst();
        const credentials = await getRazorpayCredentials(req);
        const activeGateway = credentials ? 'RAZORPAY' : (config?.activeGateway || 'NONE');

        if (activeGateway === 'NONE') {
            return res.status(400).json({ error: "No payment gateway configured in .env or settings" });
        }

        if (activeGateway === 'RAZORPAY') {
            const { keyId, keySecret, mode, source } = credentials;
            const Razorpay = require('razorpay');
            const razorpay = new Razorpay({
                key_id: keyId,
                key_secret: keySecret
            });

            const options = {
                amount: Math.round(normalizedAmount * 100), // amount in paisa
                currency: currency,
                receipt: `receipt_${Date.now()}`
            };
            const order = await razorpay.orders.create(options);

            // Create pending payment record
            await prisma.payment.create({
                data: {
                    orderId: order.id,
                    amount: normalizedAmount,
                    currency: currency,
                    status: 'PENDING',
                    userId: req.user.id,
                    courseId: courseId
                }
            });

            return res.json({
                gateway: 'RAZORPAY',
                orderId: order.id,
                keyId: keyId,
                amount: options.amount,
                currency: currency,
                mode,
                source
            });
        }

        else if (activeGateway === 'STRIPE') {
            const stripe = require('stripe')(config.stripeSecretKey);
            const paymentIntent = await stripe.paymentIntents.create({
                amount: Math.round(amount * 100),
                currency: currency.toLowerCase(),
                automatic_payment_methods: { enabled: true },
            });
            return res.json({
                gateway: 'STRIPE',
                clientSecret: paymentIntent.client_secret,
                publishableKey: config.stripePublishableKey
            });
        }

    } catch (error) {
        console.error("Create Order Error:", error);
        res.status(error.status || 500).json({ error: error.message || "Payment initiation failed" });
    }
});

// POST /api/payments/verify-payment
router.post('/verify-payment', authenticate, async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        const config = await prisma.paymentConfig.findFirst();
        const keySecret = process.env.RAZORPAY_KEY_SECRET || config?.razorpayKeySecret;

        if (!keySecret) {
            return res.status(500).json({ error: "Key secret not configured" });
        }

        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac("sha256", keySecret)
            .update(body.toString())
            .digest("hex");

        const isSignatureValid = expectedSignature === razorpay_signature;

        if (isSignatureValid) {
            // Update payment record
            const payment = await prisma.payment.update({
                where: { orderId: razorpay_order_id },
                data: {
                    status: 'SUCCESS',
                    paymentId: razorpay_payment_id,
                    signature: razorpay_signature
                }
            });

            const [course, user] = await Promise.all([
                prisma.course.findUnique({
                    where: { id: payment.courseId },
                    select: { title: true }
                }),
                prisma.user.findUnique({
                    where: { id: payment.userId },
                    select: {
                        name: true,
                        email: true,
                        phone: true,
                        qualification: true,
                        college: true,
                        dob: true
                    }
                })
            ]);

            if (user?.email) {
                const successNote = `Payment successful for course: ${course?.title || payment.courseId}`;
                const existingLead = await prisma.lead.findFirst({
                    where: { email: user.email }
                });

                if (existingLead) {
                    await prisma.lead.update({
                        where: { id: existingLead.id },
                        data: {
                            name: user.name || existingLead.name,
                            phone: user.phone || existingLead.phone,
                            qualification: user.qualification || existingLead.qualification,
                            college: user.college || existingLead.college,
                            dob: user.dob || existingLead.dob,
                            source: existingLead.source || 'Course Enrollment',
                            status: 'CONVERTED',
                            notes: existingLead.notes ? `${existingLead.notes} | ${successNote}` : successNote
                        }
                    });
                } else {
                    await prisma.lead.create({
                        data: {
                            name: user.name || 'TechWell Student',
                            email: user.email,
                            phone: user.phone || null,
                            qualification: user.qualification || null,
                            college: user.college || null,
                            dob: user.dob || null,
                            source: 'Course Enrollment',
                            status: 'CONVERTED',
                            notes: successNote
                        }
                    });
                }
            }

            // Auto-enroll user in the course
            const existingEnrollment = await prisma.enrollment.findUnique({
                where: {
                    userId_courseId: {
                        userId: payment.userId,
                        courseId: payment.courseId
                    }
                }
            });

            if (!existingEnrollment) {
                await prisma.enrollment.create({
                    data: {
                        userId: payment.userId,
                        courseId: payment.courseId,
                        status: 'ACTIVE'
                    }
                });
            }

            return res.json({ success: true, message: "Payment verified and enrollment created" });
        } else {
            // Update payment record to failed
            await prisma.payment.update({
                where: { orderId: razorpay_order_id },
                data: { status: 'FAILED' }
            });
            return res.status(400).json({ error: "Invalid signature" });
        }
    } catch (error) {
        console.error("Verify Payment Error:", error);
        res.status(500).json({ error: "Payment verification failed" });
    }
});

// GET /api/payments/order-status/:orderId
router.get('/order-status/:orderId', authenticate, async (req, res) => {
    try {
        const config = await prisma.paymentConfig.findFirst();
        const keyId = process.env.RAZORPAY_KEY_ID || config?.razorpayKeyId;
        const keySecret = process.env.RAZORPAY_KEY_SECRET || config?.razorpayKeySecret;

        if (!keyId || !keySecret) {
            return res.status(400).json({ error: 'Razorpay credentials are not configured' });
        }

        const Razorpay = require('razorpay');
        const razorpay = new Razorpay({
            key_id: keyId,
            key_secret: keySecret
        });

        const result = await razorpay.orders.fetchPayments(req.params.orderId);
        const payments = Array.isArray(result?.items) ? result.items : [];
        const latestPayment = payments.sort((a, b) => (b.created_at || 0) - (a.created_at || 0))[0] || null;

        return res.json({
            orderId: req.params.orderId,
            payment: latestPayment ? {
                id: latestPayment.id,
                status: latestPayment.status,
                method: latestPayment.method,
                amount: latestPayment.amount,
                captured: latestPayment.captured,
                errorCode: latestPayment.error_code,
                errorDescription: latestPayment.error_description,
                errorSource: latestPayment.error_source,
                errorStep: latestPayment.error_step,
                errorReason: latestPayment.error_reason,
            } : null
        });
    } catch (error) {
        console.error('Fetch Order Status Error:', error);
        res.status(500).json({ error: 'Failed to fetch Razorpay order status' });
    }
});

module.exports = router;
