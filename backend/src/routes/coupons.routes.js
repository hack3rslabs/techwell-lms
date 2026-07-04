const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate, checkPermission } = require('../middleware/auth');

const router = express.Router();

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: process.env.DATABASE_URL
        }
    }
});

const adminOrCoursePermission = (accessType) => (req, res, next) => {
    if (['SUPER_ADMIN', 'ADMIN'].includes(req.user?.role)) {
        return next();
    }

    return checkPermission('COURSES', accessType)(req, res, next);
};

const serializeCoupon = (coupon) => ({
    ...coupon,

    courseIds:
        coupon.courses?.map((item) => item.courseId) || [],

    courses:
        coupon.courses
            ?.map((item) => item.course)
            .filter(Boolean) || []
});

const findActiveCouponForCourse = async (couponName, courseId) => {
    const normalizedName = String(couponName || '').trim();

    if (!normalizedName) {
        return null;
    }

    const coupon = await prisma.coupon.findFirst({
        where: {
            couponName: {
                equals: normalizedName,
                mode: 'insensitive'
            },

            isActive: true,

            expiryDate: {
                gte: new Date()
            },

            courses: {
                some: {
                    courseId
                }
            }
        },

        include: {
            courses: {
                include: {
                    course: {
                        select: {
                            id: true,
                            title: true
                        }
                    }
                }
            }
        }
    });

    return coupon;
};

router.get(
    '/',
    authenticate,
    adminOrCoursePermission('read'),
    async (req, res, next) => {
        try {
            const coupons = await prisma.coupon.findMany({
                orderBy: {
                    createdAt: 'desc'
                },

                include: {
                    courses: {
                        include: {
                            course: true
                        }
                    }
                }
            });

            res.json({
                coupons: coupons.map(serializeCoupon)
            });
        } catch (error) {
            next(error);
        }
    }
);

router.post(
    '/',
    authenticate,
    adminOrCoursePermission('write'),
    async (req, res, next) => {
        try {
            const {
                couponName,
                discountPercentage,
                expiryDate,
                courseIds
            } = req.body;

            const normalizedName = String(
                couponName || ''
            ).trim();

            const selectedCourseIds = Array.isArray(courseIds)
                ? [...new Set(courseIds.filter(Boolean))]
                : [];

            const discount = Number(discountPercentage);

            const expiry =
                /^\d{4}-\d{2}-\d{2}$/.test(
                    String(expiryDate || '')
                )
                    ? new Date(
                          `${expiryDate}T23:59:59.999`
                      )
                    : new Date(expiryDate);

            if (!normalizedName) {
                return res.status(400).json({
                    error: 'Coupon name is required'
                });
            }

            if (
                !Number.isFinite(discount) ||
                discount <= 0 ||
                discount > 100
            ) {
                return res.status(400).json({
                    error:
                        'Discount percentage must be between 1 and 100'
                });
            }

            if (Number.isNaN(expiry.getTime())) {
                return res.status(400).json({
                    error: 'Expiry date is required'
                });
            }

            if (selectedCourseIds.length === 0) {
                return res.status(400).json({
                    error:
                        'Select at least one course for this coupon'
                });
            }

            const existing = await prisma.coupon.findFirst({
                where: {
                    couponName: {
                        equals: normalizedName,
                        mode: 'insensitive'
                    }
                },

                select: {
                    id: true
                }
            });

            if (existing) {
                return res.status(400).json({
                    error: 'Coupon name already exists'
                });
            }

            const coursesCount = await prisma.course.count({
                where: {
                    id: {
                        in: selectedCourseIds
                    }
                }
            });

            if (coursesCount !== selectedCourseIds.length) {
                return res.status(400).json({
                    error:
                        'One or more selected courses were not found'
                });
            }

            const coupon = await prisma.coupon.create({
                data: {
                    couponName: normalizedName,

                    discountPercentage: discount,

                    expiryDate: expiry,

                    isActive: true,

                    courses: {
                        create: selectedCourseIds.map(
                            (courseId) => ({
                                course: {
                                    connect: {
                                        id: courseId
                                    }
                                }
                            })
                        )
                    }
                },

                include: {
                    courses: {
                        include: {
                            course: true
                        }
                    }
                }
            });

            res.status(201).json({
                coupon: serializeCoupon(coupon)
            });
        } catch (error) {
            next(error);
        }
    }
);

router.patch(
    '/:id',
    authenticate,
    adminOrCoursePermission('write'),
    async (req, res, next) => {
        try {
            const { isActive } = req.body;

            const coupon = await prisma.coupon.update({
                where: { 
                    id: req.params.id
                },

                data: {
                    isActive: Boolean(isActive)
                },

                include: {
                    courses: {
                        include: {
                            course: {
                                select: {
                                    id: true,
                                    title: true
                                }
                            }
                        }
                    }
                }
            });

            res.json({
                coupon: serializeCoupon(coupon)
            });
        } catch (error) {
            next(error);
        }
    }
);

router.delete(
    '/:id',
    authenticate,
    adminOrCoursePermission('write'),
    async (req, res, next) => {
        try {
            await prisma.coupon.delete({
                where: {
                    id: req.params.id
                }
            });

            res.json({
                success: true
            });
        } catch (error) {
            next(error);
        }
    }
);

router.post(
    '/validate',
    authenticate,
    async (req, res, next) => {
        try {
            const {
                couponName,
                courseId,
                amount
            } = req.body;

            const baseAmount = Number(amount);

            if (!courseId) {
                return res.status(400).json({
                    error: 'courseId is required'
                });
            }

            if (
                !Number.isFinite(baseAmount) ||
                baseAmount < 0
            ) {
                return res.status(400).json({
                    error: 'Invalid amount'
                });
            }

            const coupon =
                await findActiveCouponForCourse(
                    couponName,
                    courseId
                );

            if (!coupon) {
                return res.status(404).json({
                    error:
                        'Coupon is invalid, expired, or not applicable to this course'
                });
            }

            const discountAmount = Math.ceil(
                (baseAmount * coupon.discountPercentage) / 100
            );

            const finalAmount = Math.max(
                0,
                Math.ceil(baseAmount - discountAmount)
            );

            res.json({
                coupon: {
                    id: coupon.id,
                    couponName: coupon.couponName,
                    discountPercentage:
                        coupon.discountPercentage,
                    expiryDate: coupon.expiryDate
                },

                discountAmount,
                finalAmount
            });
        } catch (error) {
            next(error);
        }
    }
);

module.exports = router;
module.exports.findActiveCouponForCourse =
    findActiveCouponForCourse;