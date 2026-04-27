const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate, authorize, checkPermission, optionalAuth } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL } } });

/**
 * Generate unique certificate ID based on settings
 */
async function generateCertificateId() {
    // Get or create settings
    let settings = await prisma.certificateSettings.findFirst({
        where: { instituteId: 'default' }
    });

    if (!settings) {
        settings = await prisma.certificateSettings.create({
            data: { instituteId: 'default' }
        });
    }

    // Increment sequence
    const newSequence = settings.currentSequence + 1;
    await prisma.certificateSettings.update({
        where: { id: settings.id },
        data: { currentSequence: newSequence }
    });

    // Format ID
    const year = settings.yearInId ? new Date().getFullYear() : '';
    const sequence = String(newSequence).padStart(settings.sequenceDigits, '0');

    return settings.yearInId
        ? `${settings.prefix}-${year}-${sequence}`
        : `${settings.prefix}-${sequence}`;
}

/**
 * @route   GET /api/certificates
 * @desc    Get all certificates (Admin) or user's certificates
 * @access  Private
 */
router.get('/', authenticate, async (req, res, next) => {
    try {
        const isAdmin = ['SUPER_ADMIN', 'ADMIN'].includes(req.user.role);
        const where = isAdmin ? {} : { userId: req.user.id };

        const certificates = await prisma.certificate.findMany({
            where,
            include: {
                template: { select: { name: true, previewUrl: true } }
            },
            orderBy: { issueDate: 'desc' }
        });

        res.json({ certificates });
    } catch (error) {
        next(error);
    }
});

/**
 * @route   GET /api/certificates/verify/:uniqueId
 * @desc    Public certificate verification
 * @access  Public
 */
router.get('/verify/:uniqueId', async (req, res, next) => {
    try {
        const certificate = await prisma.certificate.findUnique({
            where: { uniqueId: req.params.uniqueId },
            select: {
                uniqueId: true,
                studentName: true,
                courseName: true,
                courseCategory: true,
                issueDate: true,
                expiryDate: true,
                grade: true,
                isValid: true,
                signatoryName: true,
                signatoryTitle: true
            }
        });

        if (!certificate) {
            return res.status(404).json({
                verified: false,
                error: 'Certificate not found'
            });
        }

        // Check expiry
        const isExpired = certificate.expiryDate && new Date(certificate.expiryDate) < new Date();

        res.json({
            verified: certificate.isValid && !isExpired,
            certificate,
            isExpired
        });
    } catch (error) {
        next(error);
    }
});

/**
 * @route   GET /api/certificates/:id
 * @desc    Get single certificate details
 * @access  Private
 */
router.get('/:id', authenticate, async (req, res, next) => {
    try {
        const certificate = await prisma.certificate.findUnique({
            where: { id: req.params.id },
            include: {
                template: true,
                user: { select: { name: true, email: true } }
            }
        });

        if (!certificate) {
            return res.status(404).json({ error: 'Certificate not found' });
        }

        // Check access
        const isAdmin = ['SUPER_ADMIN', 'ADMIN'].includes(req.user.role);
        if (!isAdmin && certificate.userId !== req.user.id) {
            return res.status(403).json({ error: 'Access denied' });
        }

        res.json({ certificate });
    } catch (error) {
        next(error);
    }
});

/**
 * @route   POST /api/certificates/generate
 * @desc    Generate certificate for course completion
 * @access  Private
 */
router.post('/generate', authenticate, async (req, res, next) => {
    try {
        const { userId, courseId, enrollmentId, grade, score } = req.body;

        // Get user and course info
        const [user, course, settings] = await Promise.all([
            prisma.user.findUnique({ where: { id: userId } }),
            prisma.course.findUnique({ where: { id: courseId } }),
            prisma.certificateSettings.findFirst({ where: { instituteId: 'default' } })
        ]);

        if (!user || !course) {
            return res.status(404).json({ error: 'User or Course not found' });
        }

        let certificateEnrollmentId = enrollmentId;

        // Verify Course Completion (Security Check)
        if (req.user.role !== 'SUPER_ADMIN' && req.user.role !== 'ADMIN') {
            // 1. Verify Enrollment
            const enrollment = await prisma.enrollment.findUnique({
                where: { userId_courseId: { userId: req.user.id, courseId } }
            });

            if (!enrollment || enrollment.status !== 'COMPLETED') {
                return res.status(403).json({ error: 'Course not completed. Cannot claim certificate.' });
            }
            certificateEnrollmentId = enrollment.id;
        }

        // Check if certificate already exists
        const existing = await prisma.certificate.findFirst({
            where: { userId, courseId }
        });

        if (existing) {
            return res.status(400).json({
                error: 'Certificate already exists',
                certificate: existing
            });
        }

        // Get default template
        const defaultTemplate = await prisma.certificateTemplate.findFirst({
            where: { isDefault: true, isActive: true }
        });

        // Generate unique ID
        const uniqueId = await generateCertificateId();

        // Calculate expiry if configured
        let expiryDate = null;
        if (settings?.defaultValidityMonths) {
            expiryDate = new Date();
            expiryDate.setMonth(expiryDate.getMonth() + settings.defaultValidityMonths);
        }

        // Create certificate
        const certificate = await prisma.certificate.create({
            data: {
                uniqueId,
                userId,
                courseId,
                enrollmentId: certificateEnrollmentId,
                studentName: user.name,
                courseName: course.title,
                courseCategory: course.category,
                grade,
                score,
                templateId: defaultTemplate?.id,
                signatureUrl: settings?.defaultSignatureUrl,
                signatoryName: settings?.defaultSignatoryName || 'Director',
                signatoryTitle: settings?.defaultSignatoryTitle || 'Academic Director',
                expiryDate,
                verificationUrl: `/certificates/verify/${uniqueId}`
            }
        });

        res.status(201).json({
            message: 'Certificate generated successfully',
            certificate
        });
    } catch (error) {
        next(error);
    }
});

/**
 * @route   PUT /api/certificates/:id/invalidate
 * @desc    Invalidate a certificate
 * @access  Private/Admin
 */
router.put('/:id/invalidate', authenticate, checkPermission('CERTIFICATES'), async (req, res, next) => {
    try {
        const certificate = await prisma.certificate.update({
            where: { id: req.params.id },
            data: { isValid: false }
        });

        res.json({ message: 'Certificate invalidated', certificate });
    } catch (error) {
        next(error);
    }
});

// ============= SETTINGS ENDPOINTS =============

/**
 * @route   GET /api/certificates/admin/settings
 * @desc    Get certificate settings
 * @access  Private/Admin
 */
router.get('/admin/settings', authenticate, checkPermission('CERTIFICATES'), async (req, res, next) => {
    try {
        let settings = await prisma.certificateSettings.findFirst({
            where: { instituteId: 'default' }
        });

        // Create default settings if not exists
        if (!settings) {
            settings = await prisma.certificateSettings.create({
                data: { instituteId: 'default' }
            });
        }

        res.json({ settings });
    } catch (error) {
        next(error);
    }
});

/**
 * @route   PUT /api/certificates/admin/settings
 * @desc    Update certificate settings
 * @access  Private/Admin
 */
router.put('/admin/settings', authenticate, checkPermission('CERTIFICATES'), async (req, res, next) => {
    try {
        const {
            prefix,
            yearInId,
            sequenceDigits,
            defaultSignatureUrl,
            defaultSignatoryName,
            defaultSignatoryTitle,
            defaultValidityMonths,
            instituteName,
            instituteLogoUrl
        } = req.body;

        let settings = await prisma.certificateSettings.findFirst({
            where: { instituteId: 'default' }
        });

        if (settings) {
            settings = await prisma.certificateSettings.update({
                where: { id: settings.id },
                data: {
                    prefix,
                    yearInId,
                    sequenceDigits,
                    defaultSignatureUrl,
                    defaultSignatoryName,
                    defaultSignatoryTitle,
                    defaultValidityMonths,
                    instituteName,
                    instituteLogoUrl
                }
            });
        } else {
            settings = await prisma.certificateSettings.create({
                data: {
                    instituteId: 'default',
                    prefix,
                    yearInId,
                    sequenceDigits,
                    defaultSignatureUrl,
                    defaultSignatoryName,
                    defaultSignatoryTitle,
                    defaultValidityMonths,
                    instituteName,
                    instituteLogoUrl
                }
            });
        }

        res.json({ message: 'Settings updated', settings });
    } catch (error) {
        next(error);
    }
});

// ============= TEMPLATE ENDPOINTS =============

/**
 * @route   GET /api/certificates/admin/templates
 * @desc    Get all certificate templates
 * @access  Private/Admin
 */
router.get('/admin/templates', authenticate, checkPermission('CERTIFICATES'), async (req, res, next) => {
    try {
        const templates = await prisma.certificateTemplate.findMany({
            orderBy: { createdAt: 'desc' }
        });

        res.json({ templates });
    } catch (error) {
        next(error);
    }
});

/**
 * @route   POST /api/certificates/admin/templates
 * @desc    Create a new certificate template
 * @access  Private/Admin
 */
router.post('/admin/templates', authenticate, checkPermission('CERTIFICATES'), async (req, res, next) => {
    try {
        const { name, description, designUrl, previewUrl, layout, isDefault } = req.body;

        // If setting as default, unset other defaults
        if (isDefault) {
            await prisma.certificateTemplate.updateMany({
                where: { isDefault: true },
                data: { isDefault: false }
            });
        }

        const template = await prisma.certificateTemplate.create({
            data: {
                name,
                description,
                designUrl,
                previewUrl,
                layout,
                isDefault: isDefault || false
            }
        });

        res.status(201).json({ message: 'Template created', template });
    } catch (error) {
        next(error);
    }
});

/**
 * @route   PUT /api/certificates/admin/templates/:id
 * @desc    Update a certificate template
 * @access  Private/Admin
 */
router.put('/admin/templates/:id', authenticate, checkPermission('CERTIFICATES'), async (req, res, next) => {
    try {
        const { name, description, designUrl, previewUrl, layout, isDefault, isActive } = req.body;

        // If setting as default, unset other defaults
        if (isDefault) {
            await prisma.certificateTemplate.updateMany({
                where: { isDefault: true, id: { not: req.params.id } },
                data: { isDefault: false }
            });
        }

        const template = await prisma.certificateTemplate.update({
            where: { id: req.params.id },
            data: { name, description, designUrl, previewUrl, layout, isDefault, isActive }
        });

        res.json({ message: 'Template updated', template });
    } catch (error) {
        next(error);
    }
});

/**
 * @route   DELETE /api/certificates/admin/templates/:id
 * @desc    Delete a certificate template
 * @access  Private/Admin
 */
router.delete('/admin/templates/:id', authenticate, checkPermission('CERTIFICATES'), async (req, res, next) => {
    try {
        await prisma.certificateTemplate.delete({
            where: { id: req.params.id }
        });

        res.json({ message: 'Template deleted' });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
