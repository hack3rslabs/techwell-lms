const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate, authorize, checkPermission } = require('../middleware/auth');
const { sendEmail } = require('../utils/emailSender');
const { sendWhatsAppMessage } = require('../utils/whatsappAgent');

const prisma = new PrismaClient();
const router = express.Router();

/**
 * Helper to generate Batch Code (e.g., B-2026-06-001)
 */
async function generateBatchCode() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const prefix = `B-${year}-${month}-`;

    const lastBatch = await prisma.batch.findFirst({
        where: { batchCode: { startsWith: prefix } },
        orderBy: { batchCode: 'desc' }
    });

    if (!lastBatch) {
        return `${prefix}001`;
    }

    const lastSeqStr = lastBatch.batchCode.split('-').pop();
    const nextSeq = parseInt(lastSeqStr, 10) + 1;
    return `${prefix}${String(nextSeq).padStart(3, '0')}`;
}

/**
 * @route   GET /api/batches
 * @desc    Get all batches
 * @access  Private
 */
router.get('/', authenticate, async (req, res, next) => {
    try {
        const where = {};
        if (req.user.role === 'STUDENT') {
            const enrollments = await prisma.enrollment.findMany({
                where: { userId: req.user.id, status: 'ACTIVE' },
                select: { batchId: true }
            });
            const enrolledBatchIds = enrollments.map(e => e.batchId).filter(Boolean);
            if (enrolledBatchIds.length === 0) {
                return res.json([]);
            }
            where.id = { in: enrolledBatchIds };
        }

        const batches = await prisma.batch.findMany({
            where,
            include: {
                course: { select: { title: true } },
                instructor: { select: { name: true } },
                _count: { select: { enrollments: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(batches);
    } catch (error) {
        next(error);
    }
});

/**
 * @route   GET /api/batches/:id
 * @desc    Get batch details
 * @access  Private
 */
router.get('/:id', authenticate, async (req, res, next) => {
    try {
        const batch = await prisma.batch.findUnique({
            where: { id: req.params.id },
            include: {
                course: { select: { title: true } },
                instructor: { select: { name: true } },
                _count: { select: { enrollments: true } },
                liveClasses: { orderBy: { scheduledAt: 'asc' } },
                interviews: { orderBy: { createdAt: 'desc' } }
            }
        });
        if (!batch) return res.status(404).json({ error: 'Batch not found' });
        res.json(batch);
    } catch (error) {
        next(error);
    }
});

/**
 * @route   POST /api/batches
 * @desc    Create a new batch
 * @access  Private/Admin
 */
router.post('/', authenticate, checkPermission('COURSES'), async (req, res, next) => {
    try {
        const { name, courseId, instructorId, timings, hasJobAssistance, startDate, endDate, maxStudents, description } = req.body;
        
        const batchCode = await generateBatchCode();
        
        const batch = await prisma.batch.create({
            data: {
                batchCode,
                name,
                courseId,
                instructorId,
                timings,
                hasJobAssistance: hasJobAssistance || false,
                startDate: startDate ? new Date(startDate) : null,
                endDate: endDate ? new Date(endDate) : null,
                maxStudents: maxStudents ? parseInt(maxStudents, 10) : null,
                description
            }
        });
        
        res.status(201).json(batch);
    } catch (error) {
        next(error);
    }
});

/**
 * @route   PUT /api/batches/:id
 * @desc    Update a batch
 * @access  Private/Admin
 */
router.put('/:id', authenticate, checkPermission('COURSES'), async (req, res, next) => {
    try {
        const { name, timings, hasJobAssistance, startDate, endDate, maxStudents, description, isActive, status } = req.body;
        
        const batch = await prisma.batch.update({
            where: { id: req.params.id },
            data: {
                name,
                timings,
                hasJobAssistance,
                startDate: startDate ? new Date(startDate) : null,
                endDate: endDate ? new Date(endDate) : null,
                maxStudents: maxStudents ? parseInt(maxStudents, 10) : null,
                description,
                isActive,
                status: status || undefined
            }
        });
        
        res.json(batch);
    } catch (error) {
        next(error);
    }
});

/**
 * @route   GET /api/batches/:id/students
 * @desc    Get students enrolled in a batch
 * @access  Private
 */
router.get('/:id/students', authenticate, async (req, res, next) => {
    try {
        const enrollments = await prisma.enrollment.findMany({
            where: { batchId: req.params.id },
            include: {
                user: { select: { id: true, name: true, email: true, phone: true } }
            }
        });
        res.json(enrollments);
    } catch (error) {
        next(error);
    }
});

/**
 * @route   GET /api/batches/:id/available-students
 * @desc    Get students enrolled in the course but not currently in this batch
 * @access  Private
 */
router.get('/:id/available-students', authenticate, async (req, res, next) => {
    try {
        const batch = await prisma.batch.findUnique({ where: { id: req.params.id } });
        if (!batch) return res.status(404).json({ error: 'Batch not found' });

        const enrollments = await prisma.enrollment.findMany({
            where: {
                courseId: batch.courseId,
                OR: [
                    { batchId: null },
                    { batchId: { not: batch.id } }
                ],
                status: 'ACTIVE'
            },
            include: {
                user: { select: { id: true, name: true, email: true, phone: true } }
            }
        });

        // We only want the user objects to match the expected API signature on frontend
        // Currently frontend expects a list of students
        const students = enrollments.map(e => e.user).filter(Boolean);
        
        // Remove duplicates if any
        const uniqueStudentsMap = new Map();
        for (const s of students) {
            if (!uniqueStudentsMap.has(s.id)) {
                uniqueStudentsMap.set(s.id, s);
            }
        }
        res.json(Array.from(uniqueStudentsMap.values()));
    } catch (error) {
        next(error);
    }
});

/**
 * @route   POST /api/batches/:id/students
 * @desc    Assign students to a batch
 * @access  Private/Admin
 */
router.post('/:id/students', authenticate, checkPermission('USERS'), async (req, res, next) => {
    try {
        const { studentIds } = req.body; // Array of user IDs
        if (!Array.isArray(studentIds)) return res.status(400).json({ error: 'studentIds must be an array' });
        
        const batch = await prisma.batch.findUnique({ where: { id: req.params.id } });
        if (!batch) return res.status(404).json({ error: 'Batch not found' });

        // For each student, check if they have an enrollment for this course.
        // If yes, update batchId. If no, create enrollment.
        let addedCount = 0;
        for (const userId of studentIds) {
            const existingEnrollment = await prisma.enrollment.findUnique({
                where: {
                    userId_courseId: {
                        userId,
                        courseId: batch.courseId
                    }
                }
            });

            if (existingEnrollment) {
                await prisma.enrollment.update({
                    where: { id: existingEnrollment.id },
                    data: { batchId: batch.id }
                });
            } else {
                await prisma.enrollment.create({
                    data: {
                        userId,
                        courseId: batch.courseId,
                        batchId: batch.id
                    }
                });
            }
            addedCount++;
        }
        
        res.json({ success: true, addedCount });
    } catch (error) {
        next(error);
    }
});

/**
 * @route   GET /api/batches/:id/attendance
 * @desc    Get attendance for a batch on a specific date
 * @access  Private
 */
router.get('/:id/attendance', authenticate, async (req, res, next) => {
    try {
        const { date } = req.query; // YYYY-MM-DD
        if (!date) return res.status(400).json({ error: 'Date is required' });

        const searchDate = new Date(date);
        searchDate.setHours(0, 0, 0, 0);

        const attendances = await prisma.attendance.findMany({
            where: { 
                batchId: req.params.id,
                date: {
                    gte: searchDate,
                    lt: new Date(searchDate.getTime() + 24 * 60 * 60 * 1000)
                }
            },
            include: {
                user: { select: { id: true, name: true, email: true } }
            }
        });
        res.json(attendances);
    } catch (error) {
        next(error);
    }
});

/**
 * @route   POST /api/batches/:id/attendance
 * @desc    Mark attendance for students in a batch
 * @access  Private
 */
router.post('/:id/attendance', authenticate, async (req, res, next) => {
    try {
        const { date, records } = req.body; 
        // records: [{ userId: '...', status: 'PRESENT' }, ...]
        if (!date || !Array.isArray(records)) {
            return res.status(400).json({ error: 'Date and records array are required' });
        }

        const attendanceDate = new Date(date);
        attendanceDate.setHours(0, 0, 0, 0);

        const batchId = req.params.id;

        // Using transaction to upsert all attendance records
        const upserts = records.map(record => {
            return prisma.attendance.upsert({
                where: {
                    batchId_userId_date: {
                        batchId,
                        userId: record.userId,
                        date: attendanceDate
                    }
                },
                update: {
                    status: record.status,
                    notes: record.notes || null
                },
                create: {
                    batchId,
                    userId: record.userId,
                    date: attendanceDate,
                    status: record.status,
                    notes: record.notes || null
                }
            });
        });

        await prisma.$transaction(upserts);

        res.json({ success: true, count: records.length });
    } catch (error) {
        next(error);
    }
});

/**
 * @route   GET /api/batches/:id/notes
 * @desc    Get notes/extensions for a batch
 * @access  Private
 */
router.get('/:id/notes', authenticate, async (req, res, next) => {
    try {
        const notes = await prisma.batchNote.findMany({
            where: { batchId: req.params.id },
            include: {
                user: { select: { id: true, name: true, role: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(notes);
    } catch (error) {
        next(error);
    }
});

/**
 * @route   POST /api/batches/:id/notes
 * @desc    Add a note or extension request
 * @access  Private
 */
router.post('/:id/notes', authenticate, async (req, res, next) => {
    try {
        const { content, type, requestedEndDate } = req.body;
        if (!content) return res.status(400).json({ error: 'Content is required' });

        const note = await prisma.batchNote.create({
            data: {
                batchId: req.params.id,
                userId: req.user.id,
                content,
                type: type || 'COMMENT',
                requestedEndDate: requestedEndDate ? new Date(requestedEndDate) : null,
                status: type === 'EXTENSION_REQUEST' ? 'PENDING' : 'APPROVED' // Comments are auto-approved
            },
            include: {
                user: { select: { id: true, name: true, role: true } }
            }
        });

        res.status(201).json(note);
    } catch (error) {
        next(error);
    }
});

/**
 * @route   PATCH /api/batches/:id/notes/:noteId/status
 * @desc    Approve/Reject an extension request
 * @access  Private/Admin
 */
router.patch('/:id/notes/:noteId/status', authenticate, checkPermission('COURSES'), async (req, res, next) => {
    try {
        const { status } = req.body; // APPROVED or REJECTED
        if (!['APPROVED', 'REJECTED'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        const note = await prisma.batchNote.findUnique({ where: { id: req.params.noteId } });
        if (!note || note.batchId !== req.params.id) {
            return res.status(404).json({ error: 'Note not found' });
        }

        const updatedNote = await prisma.batchNote.update({
            where: { id: note.id },
            data: { status }
        });

        // If approved and it's an extension, update the batch's endDate
        if (status === 'APPROVED' && note.type === 'EXTENSION_REQUEST' && note.requestedEndDate) {
            await prisma.batch.update({
                where: { id: req.params.id },
                data: { endDate: note.requestedEndDate }
            });
        }

        res.json(updatedNote);
    } catch (error) {
        next(error);
    }
});

/**
 * @route   POST /api/batches/:id/live-classes
 * @desc    Schedule a live class for a batch
 * @access  Private/Admin
 */
router.post('/:id/live-classes', authenticate, checkPermission('COURSES'), async (req, res, next) => {
    try {
        const { title, description, platform, meetingLink, scheduledAt, duration } = req.body;
        const batch = await prisma.batch.findUnique({ where: { id: req.params.id } });
        if (!batch) return res.status(404).json({ error: 'Batch not found' });

        const liveClass = await prisma.liveClass.create({
            data: {
                title,
                description,
                platform: platform || 'ZOOM',
                meetingLink,
                scheduledAt: new Date(scheduledAt),
                duration: parseInt(duration, 10),
                courseId: batch.courseId,
                batchId: batch.id
            }
        });
        res.status(201).json(liveClass);
    } catch (error) {
        next(error);
    }
});

/**
 * @route   POST /api/batches/:id/ai-interviews
 * @desc    Schedule AI interviews for all students in a batch
 * @access  Private/Admin
 */
router.post('/:id/ai-interviews', authenticate, checkPermission('COURSES'), async (req, res, next) => {
    try {
        const { domain, role, difficulty, duration } = req.body;
        const batch = await prisma.batch.findUnique({ where: { id: req.params.id } });
        if (!batch) return res.status(404).json({ error: 'Batch not found' });

        const enrollments = await prisma.enrollment.findMany({
            where: { batchId: batch.id, status: 'ACTIVE' }
        });

        if (enrollments.length === 0) {
            return res.status(400).json({ error: 'No active students found in this batch' });
        }

        const interviews = [];
        for (const enrollment of enrollments) {
            const interview = await prisma.interview.create({
                data: {
                    userId: enrollment.userId,
                    domain,
                    role,
                    difficulty: difficulty || 'INTERMEDIATE',
                    duration: parseInt(duration || 30, 10),
                    status: 'SCHEDULED',
                    batchId: batch.id,
                    linkedCourseId: batch.courseId
                }
            });
            interviews.push(interview);
        }

        res.status(201).json({ success: true, count: interviews.length });
    } catch (error) {
        next(error);
    }
});

/**
 * @route   PATCH /api/batches/:id/complete
 * @desc    Mark batch as completed and process exams
 * @access  Private/Admin
 */
router.patch('/:id/complete', authenticate, checkPermission('COURSES'), async (req, res, next) => {
    try {
        const batch = await prisma.batch.update({
            where: { id: req.params.id },
            data: { status: 'COMPLETED', isActive: false },
            include: { course: true }
        });

        // 2. Fetch all enrollments in this batch
        const enrollments = await prisma.enrollment.findMany({
            where: { batchId: batch.id, status: 'ACTIVE' },
            include: { user: true }
        });

        // 3. Mark enrollments as COMPLETED to trigger certificate eligibility
        if (enrollments.length > 0) {
            const enrollmentIds = enrollments.map(e => e.id);
            await prisma.enrollment.updateMany({
                where: { id: { in: enrollmentIds } },
                data: { status: 'COMPLETED' }
            });
            console.log(`[Batch Complete] Marked ${enrollmentIds.length} enrollments as COMPLETED for batch ${batch.id}`);

            // Fetch or create default certificate template
            let template = await prisma.certificateTemplate.findFirst({ where: { isDefault: true } });
            if (!template) {
                template = await prisma.certificateTemplate.findFirst();
            }
            if (!template) {
                template = await prisma.certificateTemplate.create({
                    data: {
                        name: 'Default Template',
                        designUrl: 'https://placeholder.com/template',
                        isDefault: true
                    }
                });
            }

            // Generate certificates
            const certificatePromises = enrollments.map(enrollment => {
                const uniqueId = `CERT-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
                return prisma.certificate.create({
                    data: {
                        uniqueId,
                        userId: enrollment.userId,
                        courseId: batch.courseId,
                        enrollmentId: enrollment.id,
                        studentName: enrollment.user.name,
                        courseName: batch.course.title,
                        templateId: template.id
                    }
                });
            });
            const createdCertificates = await Promise.all(certificatePromises);

            // 4. Send Congratulations, Certificate & Review Links
            const googleLink = process.env.GOOGLE_REVIEW_LINK || 'https://g.page/r/placeholder';
            const justdialLink = process.env.JUSTDIAL_REVIEW_LINK || 'https://justdial.com/placeholder';
            const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

            for (let i = 0; i < enrollments.length; i++) {
                const enrollment = enrollments[i];
                const user = enrollment.user;
                if (!user) continue;

                const userCert = createdCertificates.find(c => c.userId === user.id);
                const certLink = userCert ? `${frontendUrl}/certificates/verify/${userCert.uniqueId}` : '';

                const msg = `Congratulations ${user.name} on completing ${batch.course.title}!\n\nView and download your certificate here: ${certLink}\n\nWe wish you the best in your career. Please drop us a review to help other students:\nGoogle: ${googleLink}\nJustdial: ${justdialLink}`;
                
                if (user.email) {
                    sendEmail({
                        to: user.email,
                        subject: `Your Certificate for ${batch.course.title} is Ready!`,
                        text: msg,
                        html: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; text-align: center;">
                                <h1 style="color: #1469e2;">Congratulations <b>${user.name}</b>!</h1>
                                <p style="font-size: 16px;">You have successfully completed <b>${batch.course.title}</b>.</p>
                                ${certLink ? `<div style="margin: 30px 0;"><a href="${certLink}" style="background-color: #1469e2; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">View Your Certificate</a></div>` : ''}
                                <p>We wish you the best in your career. Please drop us a review to help other students:</p>
                                <p><a href="${googleLink}">Google Review</a> | <a href="${justdialLink}">Justdial Review</a></p>
                               </div>`
                    }).catch(err => console.error('Failed to send email to', user.email));
                }

                if (user.phone) {
                    sendWhatsAppMessage(user.phone, msg).catch(err => console.error('Failed to send WA to', user.phone));
                }
            }
        }

        res.json({ message: 'Batch completed and enrollments processed', batch });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
