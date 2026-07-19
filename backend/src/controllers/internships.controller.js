const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const createError = require('http-errors');

// 1. Get Student Internship Details
const getMyInternship = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const enrollment = await prisma.internshipEnrollment.findFirst({
            where: { userId },
            include: {
                program: true,
                mentor: { select: { name: true, email: true } },
                dailyLogs: { orderBy: { date: 'desc' }, take: 5 },
                tasks: { orderBy: { dueDate: 'asc' } },
                evaluation: true
            }
        });
        res.json({ success: true, data: enrollment });
    } catch (error) {
        next(error);
    }
};

// 2. Submit Daily Log
const submitDailyLog = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { hoursLogged, tasksCompleted, blockers } = req.body;

        const enrollment = await prisma.internshipEnrollment.findFirst({
            where: { userId, status: 'ACTIVE' }
        });

        if (!enrollment) throw createError(404, 'No active internship found.');

        const log = await prisma.internshipLog.create({
            data: { enrollmentId: enrollment.id, hoursLogged, tasksCompleted, blockers }
        });

        res.json({ success: true, message: 'Daily log submitted successfully', data: log });
    } catch (error) {
        next(error);
    }
};

// 3. Admin: Get all internship enrollments
const getAllInternships = async (req, res, next) => {
    try {
        const enrollments = await prisma.internshipEnrollment.findMany({
            include: {
                user: { select: { name: true, email: true } },
                program: true,
                mentor: { select: { name: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json({ success: true, data: enrollments });
    } catch (error) {
        next(error);
    }
};

// 4. Admin: Assign Mentor
const assignMentor = async (req, res, next) => {
    try {
        const { enrollmentId } = req.params;
        const { mentorId } = req.body;

        const updated = await prisma.internshipEnrollment.update({
            where: { id: enrollmentId },
            data: { mentorId, status: 'ACTIVE', startDate: new Date() }
        });

        res.json({ success: true, message: 'Mentor assigned and internship activated', data: updated });
    } catch (error) {
        next(error);
    }
};

// 5. Admin: Get all Internship Programs
const getPrograms = async (req, res, next) => {
    try {
        const programs = await prisma.internshipProgram.findMany({
            orderBy: { createdAt: 'desc' },
            include: { _count: { select: { enrollments: true } } }
        });
        res.json({ success: true, data: programs });
    } catch (error) {
        next(error);
    }
};

// 6. Admin: Create a new Internship Program
const createProgram = async (req, res, next) => {
    try {
        const { title, department, description, durationMonths, skillsRequired, isActive } = req.body;

        if (!title || !department || !description) {
            return res.status(400).json({ success: false, message: 'Title, department, and description are required.' });
        }

        const program = await prisma.internshipProgram.create({
            data: {
                title,
                department,
                description,
                durationMonths: durationMonths ? parseInt(durationMonths) : 6,
                skillsRequired: Array.isArray(skillsRequired)
                    ? skillsRequired
                    : (skillsRequired ? skillsRequired.split(',').map(s => s.trim()) : []),
                isActive: isActive !== undefined ? isActive : true
            }
        });

        res.status(201).json({ success: true, message: 'Internship program created successfully', data: program });
    } catch (error) {
        next(error);
    }
};

// 7. Admin: Update an Internship Program
const updateProgram = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { title, department, description, durationMonths, skillsRequired, isActive } = req.body;

        const updated = await prisma.internshipProgram.update({
            where: { id },
            data: {
                ...(title && { title }),
                ...(department && { department }),
                ...(description && { description }),
                ...(durationMonths && { durationMonths: parseInt(durationMonths) }),
                ...(skillsRequired && {
                    skillsRequired: Array.isArray(skillsRequired)
                        ? skillsRequired
                        : skillsRequired.split(',').map(s => s.trim())
                }),
                ...(isActive !== undefined && { isActive })
            }
        });

        res.json({ success: true, message: 'Program updated successfully', data: updated });
    } catch (error) {
        next(error);
    }
};

// 8. Admin: Delete an Internship Program
const deleteProgram = async (req, res, next) => {
    try {
        const { id } = req.params;
        await prisma.internshipProgram.delete({ where: { id } });
        res.json({ success: true, message: 'Program deleted successfully' });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getMyInternship,
    submitDailyLog,
    getAllInternships,
    assignMentor,
    getPrograms,
    createProgram,
    updateProgram,
    deleteProgram
};
