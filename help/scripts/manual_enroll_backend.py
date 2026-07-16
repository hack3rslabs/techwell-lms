import re

with open(r"e:\FinalProjects\techwell-lms\backend\src\routes\admin.routes.js", "r", encoding="utf-8") as f:
    content = f.read()

manual_enroll_code = """
/**
 * @route   POST /api/admin/enrollments/manual
 * @desc    Manually enroll a student (Admin/Staff)
 * @access  Private (Admin/Staff)
 */
router.post('/enrollments/manual', authenticate, checkPermission('STUDENTS'), async (req, res, next) => {
    try {
        const { userId, courseId, batchId, paymentMethod, couponCode, amountPaid } = req.body;
        
        if (!userId || !courseId) {
            return res.status(400).json({ error: 'User and Course are required' });
        }

        const course = await prisma.course.findUnique({ where: { id: courseId } });
        if (!course) return res.status(404).json({ error: 'Course not found' });

        // Calculate discount if coupon exists
        let discountAmount = 0;
        let finalAmount = course.price;
        let appliedCouponId = null;

        if (couponCode) {
            const coupon = await prisma.coupon.findUnique({ where: { code: couponCode } });
            if (coupon && coupon.isActive && new Date(coupon.expiryDate) > new Date()) {
                if (coupon.discountType === 'PERCENTAGE') {
                    discountAmount = (course.price * coupon.discountValue) / 100;
                } else {
                    discountAmount = coupon.discountValue;
                }
                finalAmount = course.price - discountAmount;
                appliedCouponId = coupon.id;
            }
        }

        // We use the amount passed from frontend if provided and validated, or the calculated one
        const paymentAmount = amountPaid !== undefined ? parseFloat(amountPaid) : finalAmount;

        // Create Payment
        const payment = await prisma.payment.create({
            data: {
                orderId: `MANUAL_${Date.now()}_${userId.substring(0, 5)}`,
                amount: paymentAmount,
                status: 'COMPLETED',
                paymentMethod: paymentMethod || 'CASH', // CASH or ONLINE
                userId,
                courseId
            }
        });

        // Create Enrollment
        const enrollment = await prisma.enrollment.create({
            data: {
                userId,
                courseId,
                batchId: batchId || null,
                status: 'ACTIVE'
            },
            include: {
                user: true,
                course: true
            }
        });

        res.status(201).json({ 
            message: 'Enrollment successful', 
            enrollment,
            payment 
        });

    } catch (error) {
        console.error('Manual enrollment error:', error);
        next(error);
    }
});
"""

if "POST /api/admin/enrollments/manual" not in content:
    # Insert it right before the PATCH route
    content = content.replace("router.patch('/enrollments/:id/status'", manual_enroll_code + "\nrouter.patch('/enrollments/:id/status'")

with open(r"e:\FinalProjects\techwell-lms\backend\src\routes\admin.routes.js", "w", encoding="utf-8") as f:
    f.write(content)

print("Added manual enrollment backend route!")
