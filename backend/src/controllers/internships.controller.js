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

        if (!enrollment) {
            throw createError(404, 'No active internship found.');
        }

        const log = await prisma.internshipLog.create({
            data: {
                enrollmentId: enrollment.id,
                hoursLogged,
                tasksCompleted,
                blockers
            }
        });

        res.json({ success: true, message: 'Daily log submitted successfully', data: log });
    } catch (error) {
        next(error);
    }
};

// 3. Admin: Get all internships
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

module.exports = {
    getMyInternship,
    submitDailyLog,
    getAllInternships,
    assignMentor
};
