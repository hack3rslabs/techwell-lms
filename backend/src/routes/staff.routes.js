const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate } = require('../middleware/auth');
const router = express.Router();
const prisma = new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL } } });

/**
 * @route   POST /api/staff/attendance/check-in
 * @desc    Check in for the day or start a new break session
 * @access  Private (Staff/Admin)
 */
router.post('/attendance/check-in', authenticate, async (req, res, next) => {
    try {
        const userId = req.user.id;
        const date = new Date();
        date.setHours(0, 0, 0, 0); // Start of day

        const { location, photoUrl } = req.body;
        const checkInTime = new Date();

        // Check if attendance record exists for today
        const existing = await prisma.staffAttendance.findUnique({
            where: { userId_date: { userId, date } }
        });

        if (existing) {
            // Check if there is an active session without a checkOut
            let sessions = existing.sessions ? (typeof existing.sessions === 'string' ? JSON.parse(existing.sessions) : existing.sessions) : [];
            if (sessions.length > 0 && !sessions[sessions.length - 1].checkOut) {
                return res.status(400).json({ error: 'You are already checked in. Please check out first.' });
            }

            // Start a new session (e.g. back from break)
            sessions.push({ checkIn: checkInTime.toISOString(), location, photoUrl });

            const updated = await prisma.staffAttendance.update({
                where: { id: existing.id },
                data: {
                    sessions,
                    status: 'PRESENT',
                    checkOutTime: null
                }
            });

            return res.json({ message: 'Checked in (break ended) successfully', attendance: updated });
        }

        // Initial check-in for the day
        const sessions = [{ checkIn: checkInTime.toISOString(), location, photoUrl }];
        const attendance = await prisma.staffAttendance.create({
            data: {
                userId,
                date,
                checkInTime,
                location,
                ipAddress: req.ip || null,
                photoUrl,
                sessions,
                status: 'PRESENT'
            }
        });

        res.json({ message: 'Checked in successfully', attendance });
    } catch (error) {
        next(error);
    }
});

/**
 * @route   POST /api/staff/attendance/check-out
 * @desc    Check out for the day or take a break
 * @access  Private (Staff/Admin)
 */
router.post('/attendance/check-out', authenticate, async (req, res, next) => {
    try {
        const userId = req.user.id;
        const date = new Date();
        date.setHours(0, 0, 0, 0);

        const attendance = await prisma.staffAttendance.findUnique({
            where: { userId_date: { userId, date } }
        });

        if (!attendance) {
            return res.status(400).json({ error: 'Not checked in today' });
        }

        let sessions = attendance.sessions ? (typeof attendance.sessions === 'string' ? JSON.parse(attendance.sessions) : attendance.sessions) : [];
        if (sessions.length === 0 || sessions[sessions.length - 1].checkOut) {
            return res.status(400).json({ error: 'No active session to check out from.' });
        }

        // Close current session
        const checkOutTime = new Date();
        sessions[sessions.length - 1].checkOut = checkOutTime.toISOString();

        // Calculate total hours
        let totalHours = 0;
        sessions.forEach(s => {
            if (s.checkIn && s.checkOut) {
                totalHours += (new Date(s.checkOut).getTime() - new Date(s.checkIn).getTime()) / (1000 * 60 * 60);
            }
        });

        const updated = await prisma.staffAttendance.update({
            where: { id: attendance.id },
            data: {
                checkOutTime,
                sessions,
                totalHours: parseFloat(totalHours.toFixed(2))
            }
        });

        res.json({ message: 'Checked out successfully', attendance: updated });
    } catch (error) {
        next(error);
    }
});

/**
 * @route   GET /api/staff/attendance/my-logs
 * @desc    Get user's attendance logs
 * @access  Private (Staff/Admin)
 */
router.get('/attendance/my-logs', authenticate, async (req, res, next) => {
    try {
        const logs = await prisma.staffAttendance.findMany({
            where: { userId: req.user.id },
            orderBy: { date: 'desc' },
            take: 30
        });
        res.json(logs);
    } catch (error) {
        next(error);
    }
});

/**
 * @route   GET /api/staff/attendance/today
 * @desc    Get current check-in status for today
 * @access  Private (Staff/Admin)
 */
router.get('/attendance/today', authenticate, async (req, res, next) => {
    try {
        const date = new Date();
        date.setHours(0, 0, 0, 0);

        const attendance = await prisma.staffAttendance.findUnique({
            where: { userId_date: { userId: req.user.id, date } }
        });

        res.json(attendance || null);
    } catch (error) {
        next(error);
    }
});

/**
 * @route   GET /api/staff/goals/current
 * @desc    Get current month's goals
 * @access  Private (Staff/Admin)
 */
router.get('/goals/current', authenticate, async (req, res, next) => {
    try {
        const now = new Date();
        const month = now.getMonth() + 1;
        const year = now.getFullYear();

        let goals = await prisma.staffGoal.findMany({
            where: { userId: req.user.id, month, year }
        });

        // If no goals found, maybe return default placeholders or empty array
        res.json(goals);
    } catch (error) {
        next(error);
    }
});

/**
 * @route   GET /api/staff/calendar
 * @desc    Get categorized calendar events for Tele-Sales & Counseling
 * @access  Private
 */
router.get('/calendar', authenticate, async (req, res, next) => {
    try {
        const userId = req.user.id;
        
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
        const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
        const startOfTomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0);
        const endOfTomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 23, 59, 59);

        // 1. Get Tasks (Today, Tomorrow, Admin Assigned, Overdue)
        const allTasks = await prisma.task.findMany({
            where: { assignedTo: userId, status: { not: 'COMPLETED' } },
            include: { creator: true }
        });

        const todayTasks = allTasks.filter(t => t.dueDate && t.dueDate >= startOfToday && t.dueDate <= endOfToday);
        const tomorrowTasks = allTasks.filter(t => t.dueDate && t.dueDate >= startOfTomorrow && t.dueDate <= endOfTomorrow);
        const adminAssignedTasks = allTasks.filter(t => t.creator && (t.creator.role === 'ADMIN' || t.creator.role === 'SUPER_ADMIN'));
        const overdueTasks = allTasks.filter(t => t.dueDate && t.dueDate < startOfToday);

        // 2. Get Follow up reminders
        const reminders = await prisma.followUpReminder.findMany({
            where: { lead: { assignedTo: userId }, isCompleted: false },
            include: { lead: true }
        });

        const todayReminders = reminders.filter(r => r.reminderDate >= startOfToday && r.reminderDate <= endOfToday);
        const overdueReminders = reminders.filter(r => r.reminderDate < startOfToday);

        // 3. Get Demo Schedules
        const demos = await prisma.demoSchedule.findMany({
            where: { assignedTo: userId, status: 'SCHEDULED', scheduledAt: { gte: startOfToday, lte: endOfToday } },
            include: { lead: true },
            orderBy: { scheduledAt: 'asc' }
        });

        // 4. Get Leads Assigned
        const assignedLeads = await prisma.lead.findMany({
            where: { assignedTo: userId, status: { in: ['NEW', 'CONTACTED'] } },
            orderBy: { createdAt: 'desc' },
            take: 20
        });

        // 5. Recent Follow-ups
        const recentFollowUps = await prisma.leadActivityLog.findMany({
            where: {
                performedBy: req.user.id,
                actionType: {
                    contains: "Follow Up"
                }
            },
            include: { lead: true        },
        orderBy: {
          createdAt: "desc",
        },
        take: 10
        });

        const pendingWorksCount = overdueTasks.length + overdueReminders.length + todayTasks.length + todayReminders.length;

        res.json({ 
            todayTasks, 
            tomorrowTasks, 
            adminAssignedTasks, 
            demos,
            todayReminders,
            assignedLeads,
            recentFollowUps,
            pendingWorksCount,
            overdueTasks,
            overdueReminders
        });
    } catch (error) {
        next(error);
    }
});

/**
 * @route   GET /api/staff/goals
 * @desc    Get user's staff goals
 * @access  Private (Staff/Admin)
 */
router.get('/goals', authenticate, async (req, res, next) => {
    try {
        const goals = await prisma.staffGoal.findMany({
            where: { userId: req.user.id },
            orderBy: { createdAt: 'desc' }
        });
        res.json(goals);
    } catch (error) {
        next(error);
    }
});

/**
 * @route   GET /api/staff/scripts
 * @desc    Get scripts/templates available to staff
 * @access  Private (Staff/Admin)
 */
router.get('/scripts', authenticate, async (req, res, next) => {
    try {
        const scripts = await prisma.followUpTemplate.findMany({
            where: { isActive: true, type: { in: ['SCRIPT', 'MOTIVATION', 'TELE_FOLLOWUP', 'SALES_FOLLOWUP'] } },
            orderBy: { createdAt: 'desc' }
        });
        res.json(scripts);
    } catch (error) {
        next(error);
    }
});

/**
 * @route   GET /api/staff/monitoring
 * @desc    Get aggregated metrics for all staff members
 * @access  Private (Admin/Manager)
 */
router.get('/monitoring', authenticate, async (req, res, next) => {
    try {
        const { dateRange } = req.query; // 'today', 'week', 'month', 'all'
        
        let startDate = new Date(0);
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);

        if (dateRange === 'today') {
            startDate = startOfToday;
        } else if (dateRange === 'week') {
            startDate = new Date(startOfToday);
            startDate.setDate(startDate.getDate() - startDate.getDay()); // Start of week (Sunday)
        } else if (dateRange === 'month') {
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        }

        // Fetch all staff members (users with roles other than STUDENT, or specifically STAFF/ADMIN)
        const staffMembers = await prisma.user.findMany({
            where: { role: { in: ['ADMIN', 'MANAGER', 'STAFF', 'SUPER_ADMIN', 'INSTRUCTOR'] } },
            select: { id: true, name: true, role: true, email: true }
        });

        const metrics = await Promise.all(staffMembers.map(async (staff) => {
            // 1. Attendance/Work Hours
            const attendances = await prisma.staffAttendance.findMany({
                where: { userId: staff.id, date: { gte: startDate } }
            });
            const totalWorkHours = attendances.reduce((acc, curr) => acc + (curr.totalHours || 0), 0);

            // 2. Calls Made
            const totalCalls = await prisma.communicationLog.count({
                where: { userId: staff.id, type: 'CALL', timestamp: { gte: startDate } }
            });

            // 3. Leads assigned in this period (or just currently assigned)
            const leadsHandled = await prisma.lead.count({
                where: { assignedToId: staff.id }
            });

            // 4. Leads Converted
            const leadsConverted = await prisma.lead.count({
                where: { assignedToId: staff.id, status: 'ENROLLED' } // Assuming ENROLLED is converted
            });

            // 5. Leads Lost
            const leadsLost = await prisma.lead.count({
                where: { assignedToId: staff.id, status: { in: ['LOST', 'DROPPED'] } }
            });

            // 6. Demo Schedules
            const demoSchedules = await prisma.demoSchedule.count({
                where: { assignedTo: staff.id, scheduledAt: { gte: startDate } }
            });

            return {
                ...staff,
                totalWorkHours: parseFloat(totalWorkHours.toFixed(2)),
                totalCalls,
                leadsHandled,
                leadsConverted,
                leadsLost,
                leadsPending: leadsHandled - (leadsConverted + leadsLost),
                demoSchedules
            };
        }));

        res.json(metrics);
    } catch (error) {
        console.error("Monitoring error:", error);
        next(error);
    }
});

module.exports = router;

