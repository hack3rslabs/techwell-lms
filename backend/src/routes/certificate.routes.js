const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate, authorize, checkPermission, optionalAuth } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const router = express.Router();
const prisma = new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL } } });

// Configure storage for certificate templates
const templateStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = 'uploads/templates';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'template-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const uploadTemplate = multer({
    storage: templateStorage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if (mimetype && extname) return cb(null, true);
        cb(new Error('Only images (JPEG, PNG, WEBP) are allowed!'));
    }
});

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
 * @route   GET /api/certificates/analytics
 * @desc    Get certificate issuance analytics
 * @access  Private/Admin
 */
router.get('/analytics', authenticate, checkPermission('CERTIFICATES'), async (req, res, next) => {
    try {
        const totalCertificates = await prisma.certificate.count();
        const activeCertificates = await prisma.certificate.count({ where: { status: 'ISSUED', isValid: true } });
        const revokedCertificates = await prisma.certificate.count({ where: { status: 'REVOKED' } });
        
        const byType = await prisma.certificate.groupBy({
            by: ['referenceType'],
            _count: { _all: true }
        });

        res.json({
            total: totalCertificates,
            active: activeCertificates,
            revoked: revokedCertificates,
            byType: byType.map(b => ({ type: b.referenceType || 'COURSE', count: b._count._all }))
        });
    } catch (error) {
        next(error);
    }
});

/**
 * @route   GET /api/certificates
 * @desc    Get all certificates (Admin) or user's certificates
 * @access  Private
 */
router.get('/', authenticate, async (req, res, next) => {
    try {
        const isAdmin = ['SUPER_ADMIN', 'ADMIN'].includes(req.user.role);
        const { status, courseId, search } = req.query;

        const where = {};
        if (!isAdmin && req.user.role !== 'FRANCHISE_ADMIN') {
            if (req.user.role !== 'STUDENT') {
                const certPerm = req.user.rolePermissions?.['CERTIFICATES'];
                if (!certPerm || certPerm.isDisabled || !certPerm.canRead) {
                    return res.status(403).json({ error: 'Access Denied: You do not have read permission for CERTIFICATES.' });
                }
            }
            where.userId = req.user.id;
            where.status = 'ISSUED'; // Students only see issued certs
        } else {
            if (status) where.status = status;
            if (courseId) where.courseId = courseId;
            if (search) {
                where.OR = [
                    { studentName: { contains: search, mode: 'insensitive' } },
                    { uniqueId: { contains: search, mode: 'insensitive' } }
                ];
            }
            if (req.user.role === 'FRANCHISE_ADMIN') {
                // Assuming students linked to franchise have franchiseId set, or checking by institute
                where.user = { franchiseId: req.user.franchiseId };
            }
        }

        const certificates = await prisma.certificate.findMany({
            where,
            include: {
                template: { select: { name: true, previewUrl: true } },
                user: { select: { name: true, email: true, avatar: true } },
                course: { select: { title: true } }
            },
            orderBy: { createdAt: 'desc' }
        });

        res.json({ certificates });
    } catch (error) {
        next(error);
    }
});

/**
 * @route   GET /api/certificates/me
 * @desc    Get current user's certificates
 * @access  Private
 */
router.get('/me', authenticate, async (req, res, next) => {
    try {
        const certificates = await prisma.certificate.findMany({
            where: {
                userId: req.user.id,
                status: 'ISSUED'
            },
            include: {
                template: { select: { name: true, previewUrl: true } },
                course: { select: { title: true } },
                franchise: { select: { name: true, logoUrl: true } }
            },
            orderBy: { createdAt: 'desc' }
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
        const certificate = await prisma.certificate.findFirst({
            where: {
                OR: [
                    { uniqueId: req.params.uniqueId },
                    { regId: req.params.uniqueId },
                    { user: { regId: req.params.uniqueId } }
                ]
            },
            orderBy: { createdAt: 'desc' },
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
                signatoryTitle: true,
                status: true,
                franchise: {
                    select: {
                        name: true,
                        logoUrl: true
                    }
                }
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
        const isRevoked = certificate.status === 'REVOKED';

        res.json({
            verified: certificate.isValid && !isExpired && !isRevoked,
            certificate,
            isExpired,
            isRevoked
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
                user: { select: { name: true, email: true } },
                franchise: { select: { name: true, logoUrl: true } }
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
        const { userId, courseId, enrollmentId, grade, score, issueDate, purpose, templateId } = req.body;

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
        let templateToUse = templateId 
            ? await prisma.certificateTemplate.findUnique({ where: { id: templateId } })
            : await prisma.certificateTemplate.findFirst({
                where: { 
                    isDefault: true, 
                    isActive: true, 
                    purpose: purpose || 'COURSE_COMPLETION' 
                }
            });

        // Generate unique ID
        const uniqueId = await generateCertificateId();

        // Calculate expiry if configured
        let expiryDate = null;
        if (settings?.defaultValidityMonths) {
            expiryDate = new Date();
            expiryDate.setMonth(expiryDate.getMonth() + settings.defaultValidityMonths);
        }

        const status = settings?.approvalRequired ? 'PENDING' : 'ISSUED';

        // Create certificate
        const certificate = await prisma.certificate.create({
            data: {
                uniqueId,
                userId,
                regId: user.regId,
                courseId,
                enrollmentId: certificateEnrollmentId,
                studentName: user.name,
                courseName: course.title,
                courseCategory: course.category,
                grade,
                score,
                purpose: purpose || templateToUse?.purpose || 'COURSE_COMPLETION',
                templateId: templateToUse?.id,
                signatureUrl: settings?.defaultSignatureUrl,
                signatoryName: settings?.defaultSignatoryName || 'Director',
                signatoryTitle: settings?.defaultSignatoryTitle || 'Academic Director',
                issueDate: issueDate ? new Date(issueDate) : new Date(),
                expiryDate,
                verificationUrl: `/certificate/${uniqueId}`, // Updated to new public URL pattern
                status,
                isValid: true,
                franchiseId: user.franchiseId || null
            }
        });

        res.status(201).json({
            message: status === 'PENDING' ? 'Certificate request submitted for approval' : 'Certificate generated successfully',
            certificate
        });
    } catch (error) {
        next(error);
    }
});

/**
 * @route   POST /api/certificates/generate-bulk
 * @desc    Generate certificates for multiple users
 * @access  Private/Admin
 */
router.post('/generate-bulk', authenticate, checkPermission('CERTIFICATES'), async (req, res, next) => {
    try {
        const { courseId, batchId, userIds, studentIds, grade, templateId, purpose } = req.body;
        
        const finalUserIds = userIds || studentIds;
        let finalCourseId = courseId;

        if (!finalCourseId && batchId) {
            const batch = await prisma.batch.findUnique({ where: { id: batchId } });
            if (batch) finalCourseId = batch.courseId;
        }
        
        if (!finalCourseId || !finalUserIds || !Array.isArray(finalUserIds)) {
            return res.status(400).json({ error: 'courseId and an array of studentIds are required' });
        }

        const settings = await prisma.certificateSettings.findFirst() || {
            prefix: 'CERT',
            yearInId: true,
            sequenceDigits: 5,
            currentSequence: 0
        };

        const results = [];
        let currentSeq = settings.currentSequence;

        for (const userId of finalUserIds) {
            // Check if already exists
            const existing = await prisma.certificate.findFirst({
                where: { userId, courseId: finalCourseId }
            });

            if (existing) {
                results.push({ userId, status: 'skipped', reason: 'Certificate already exists for this course' });
                continue;
            }

            // Get user, course and enrollment details
            const [user, course, enrollment] = await Promise.all([
                prisma.user.findUnique({ where: { id: userId } }),
                prisma.course.findUnique({ where: { id: finalCourseId } }),
                prisma.enrollment.findUnique({ where: { userId_courseId: { userId, courseId: finalCourseId } } })
            ]);

            if (!user || !course || !enrollment) {
                results.push({ userId, status: 'failed', reason: 'User, Course or Enrollment not found' });
                continue;
            }

            currentSeq++;
            const yearStr = settings.yearInId ? `${new Date().getFullYear()}-` : '';
            const seqStr = String(currentSeq).padStart(settings.sequenceDigits, '0');
            const uniqueId = `${settings.prefix}-${yearStr}${seqStr}`;

            const certificate = await prisma.certificate.create({
                data: {
                    uniqueId,
                    userId: user.id,
                    regId: user.regId,
                    courseId: course.id,
                    enrollmentId: enrollment.id,
                    studentName: user.name,
                    courseName: course.title,
                    courseCategory: course.category || '',
                    issueDate: new Date(),
                    grade: grade || null,
                    templateId: templateId || undefined,
                    signatoryName: settings.defaultSignatoryName || 'Admin',
                    status: 'ISSUED',
                    isValid: true,
                    franchiseId: user.franchiseId || null
                }
            });
            results.push({ userId, status: 'success', certificateId: certificate.uniqueId });
        }

        // Update sequence
        if (currentSeq > settings.currentSequence) {
            await prisma.certificateSettings.update({
                where: { id: settings.id },
                data: { currentSequence: currentSeq }
            });
        }

        res.status(201).json({ message: 'Bulk generation complete', results });
    } catch (error) {
        next(error);
    }
});

/**
 * @route   PUT /api/certificates/:id/status
 * @desc    Update certificate status (Approve/Revoke)
 * @access  Private/Admin
 */
router.put('/:id/status', authenticate, checkPermission('CERTIFICATES'), async (req, res, next) => {
    try {
        const { status, revocationReason } = req.body;
        
        if (!['ISSUED', 'REVOKED', 'EXPIRED'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        const updateData = {
            status,
            isValid: status === 'ISSUED',
            approvedById: req.user.id
        };

        if (status === 'REVOKED') {
            updateData.revokedAt = new Date();
            updateData.revocationReason = revocationReason || 'No reason provided';
        }

        const certificate = await prisma.certificate.update({
            where: { id: req.params.id },
            data: updateData
        });

        res.json({ message: `Certificate ${status.toLowerCase()} successfully`, certificate });
    } catch (error) {
        next(error);
    }
});

/**
 * @route   POST /api/certificates/bulk-generate
 * @desc    Bulk generate certificates
 * @access  Private/Admin
 */
router.post('/bulk-generate', authenticate, checkPermission('CERTIFICATES'), async (req, res, next) => {
    try {
        const { courseId, userIds, templateId, issueDate } = req.body;

        const course = await prisma.course.findUnique({ where: { id: courseId } });
        const settings = await prisma.certificateSettings.findFirst({ where: { instituteId: 'default' } });

        if (!course) return res.status(404).json({ error: 'Course not found' });

        const results = { success: 0, failed: 0, errors: [] };
        const status = settings?.approvalRequired ? 'PENDING' : 'ISSUED';

        for (const userId of userIds) {
            try {
                const user = await prisma.user.findUnique({ where: { id: userId } });
                if (!user) {
                    results.failed++;
                    results.errors.push(`User ${userId} not found`);
                    continue;
                }

                const existing = await prisma.certificate.findFirst({ where: { userId, courseId } });
                if (existing) {
                    results.failed++;
                    results.errors.push(`Certificate for ${user.email} already exists`);
                    continue;
                }

                const enrollment = await prisma.enrollment.findUnique({
                    where: { userId_courseId: { userId, courseId } }
                });

                if (!enrollment) {
                    results.failed++;
                    results.errors.push(`User ${user.email} not enrolled in course`);
                    continue;
                }

                const uniqueId = await generateCertificateId();
                
                await prisma.certificate.create({
                    data: {
                        uniqueId,
                        userId,
                        regId: user.regId,
                        courseId,
                        enrollmentId: enrollment.id,
                        studentName: user.name,
                        courseName: course.title,
                        courseCategory: course.category,
                        templateId: templateId || undefined,
                        purpose: purpose || 'COURSE_COMPLETION',
                        signatureUrl: settings?.defaultSignatureUrl,
                        signatoryName: settings?.defaultSignatoryName || 'Director',
                        signatoryTitle: settings?.defaultSignatoryTitle || 'Academic Director',
                        issueDate: issueDate ? new Date(issueDate) : new Date(),
                        verificationUrl: `/certificate/${uniqueId}`,
                        status,
                        isValid: true,
                        franchiseId: user.franchiseId || null
                    }
                });
                
                results.success++;
            } catch (err) {
                results.failed++;
                results.errors.push(`Failed for user ${userId}: ${err.message}`);
            }
        }

        res.json({ message: 'Bulk generation complete', results });
    } catch (error) {
        next(error);
    }
});

/**
 * @route   GET /api/certificates/analytics/stats
 * @desc    Get certificate analytics
 * @access  Private/Admin
 */
router.get('/analytics/stats', authenticate, checkPermission('CERTIFICATES'), async (req, res, next) => {
    try {
        const [total, issued, pending, revoked, totalDownloads] = await Promise.all([
            prisma.certificate.count(),
            prisma.certificate.count({ where: { status: 'ISSUED' } }),
            prisma.certificate.count({ where: { status: 'PENDING' } }),
            prisma.certificate.count({ where: { status: 'REVOKED' } }),
            prisma.certificate.aggregate({ _sum: { downloads: true } })
        ]);

        res.json({
            total,
            issued,
            pending,
            revoked,
            downloads: totalDownloads._sum.downloads || 0
        });
    } catch (error) {
        next(error);
    }
});

/**
 * @route   POST /api/certificates/:id/download-event
 * @desc    Log download event and increment count
 * @access  Private
 */
router.post('/:id/download-event', authenticate, async (req, res, next) => {
    try {
        await prisma.certificate.update({
            where: { id: req.params.id },
            data: { downloads: { increment: 1 } }
        });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false }); // Silently fail to not block download UI
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
            instituteLogoUrl,
            approvalRequired,
            autoIssueOnCompletion
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
                    instituteLogoUrl,
                    approvalRequired,
                    autoIssueOnCompletion
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
                    instituteLogoUrl,
                    approvalRequired,
                    autoIssueOnCompletion
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
 * @route   POST /api/certificates/templates/upload
 * @desc    Upload a certificate template image
 * @access  Private (Admin & Franchise Admin)
 */
router.post('/templates/upload', authenticate, checkPermission('CERTIFICATES', 'create'), uploadTemplate.single('templateImage'), async (req, res, next) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'No image file uploaded' });
        const designUrl = `/uploads/templates/${req.file.filename}`;
        res.json({ message: 'Template image uploaded', designUrl });
    } catch (error) {
        if (req.file) {
            const safePath = path.resolve('uploads/templates', path.basename(req.file.path));
            fs.unlinkSync(safePath);
        }
        next(error);
    }
});

/**
 * @route   GET /api/certificates/admin/templates
 * @desc    Get all certificate templates
 * @access  Private/Admin
 */
router.get('/admin/templates', authenticate, checkPermission('CERTIFICATES'), async (req, res, next) => {
    try {
        const isAdmin = ['SUPER_ADMIN', 'ADMIN'].includes(req.user.role);
        const where = isAdmin ? {} : { franchiseId: req.user.franchiseId };

        const templates = await prisma.certificateTemplate.findMany({
            where,
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
 * @access  Private/Admin & Franchise Admin
 */
router.post('/admin/templates', authenticate, checkPermission('CERTIFICATES'), async (req, res, next) => {
    try {
        const { name, description, designUrl, previewUrl, layout, canvasData, isDefault, orientation, purpose } = req.body;
        const franchiseId = req.user.role === 'FRANCHISE_ADMIN' ? req.user.franchiseId : null;

        // If setting as default, unset other defaults
        if (isDefault) {
            await prisma.certificateTemplate.updateMany({
                where: { isDefault: true, franchiseId },
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
                canvasData,
                isDefault: isDefault || false,
                orientation: orientation || 'HORIZONTAL',
                purpose: purpose || 'COURSE_COMPLETION',
                franchiseId
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
 * @access  Private/Admin & Franchise Admin
 */
router.put('/admin/templates/:id', authenticate, checkPermission('CERTIFICATES'), async (req, res, next) => {
    try {
        const { name, description, designUrl, previewUrl, layout, canvasData, isDefault, isActive, orientation, purpose } = req.body;
        
        const templateExists = await prisma.certificateTemplate.findUnique({ where: { id: req.params.id } });
        if (!templateExists) return res.status(404).json({ error: 'Template not found' });
        
        if (req.user.role === 'FRANCHISE_ADMIN' && templateExists.franchiseId !== req.user.franchiseId) {
            return res.status(403).json({ error: 'Access denied' });
        }

        const franchiseId = templateExists.franchiseId;

        // If setting as default, unset other defaults
        if (isDefault) {
            await prisma.certificateTemplate.updateMany({
                where: { isDefault: true, id: { not: req.params.id }, franchiseId },
                data: { isDefault: false }
            });
        }

        const template = await prisma.certificateTemplate.update({
            where: { id: req.params.id },
            data: { name, description, designUrl, previewUrl, layout, canvasData, isDefault, isActive, orientation, purpose: purpose || undefined }
        });

        res.json({ message: 'Template updated', template });
    } catch (error) {
        next(error);
    }
});

/**
 * @route   DELETE /api/certificates/admin/templates/:id
 * @desc    Delete a certificate template
 * @access  Private/Admin & Franchise Admin
 */
router.delete('/admin/templates/:id', authenticate, checkPermission('CERTIFICATES'), async (req, res, next) => {
    try {
        const templateExists = await prisma.certificateTemplate.findUnique({ where: { id: req.params.id } });
        if (!templateExists) return res.status(404).json({ error: 'Template not found' });
        
        if (req.user.role === 'FRANCHISE_ADMIN' && templateExists.franchiseId !== req.user.franchiseId) {
            return res.status(403).json({ error: 'Access denied' });
        }

        await prisma.certificateTemplate.delete({
            where: { id: req.params.id }
        });

        res.json({ message: 'Template deleted' });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
