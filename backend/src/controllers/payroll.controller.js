const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// 1. Get all STAFF with attendance stats for the month
exports.getStaffRoster = async (req, res, next) => {
    try {
        const { month, year } = req.query;
        const targetMonth = parseInt(month) || new Date().getMonth() + 1;
        const targetYear = parseInt(year) || new Date().getFullYear();

        const staff = await prisma.user.findMany({
            where: { role: 'STAFF' },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                avatar: true,
                staffAttendances: {
                    where: {
                        date: {
                            gte: new Date(targetYear, targetMonth - 1, 1),
                            lt: new Date(targetYear, targetMonth, 1)
                        }
                    }
                },
                payrollRecords: {
                    where: { month: targetMonth, year: targetYear }
                }
            }
        });

        // Calculate hours
        const roster = staff.map(s => {
            const totalHours = s.staffAttendances.reduce((acc, att) => acc + (att.totalHours || 0), 0);
            const daysPresent = s.staffAttendances.filter(a => a.status === 'PRESENT').length;
            const payroll = s.payrollRecords.length > 0 ? s.payrollRecords[0] : null;

            return {
                id: s.id,
                name: s.name,
                email: s.email,
                avatar: s.avatar,
                totalHours: parseFloat(totalHours.toFixed(2)),
                daysPresent,
                payrollStatus: payroll ? payroll.status : 'UNPROCESSED',
                netAmount: payroll ? payroll.netAmount : 0
            };
        });

        res.json({ success: true, data: roster });
    } catch (error) {
        next(error);
    }
};

// 2. Generate or Update Payroll for a Staff member
exports.processPayroll = async (req, res, next) => {
    try {
        const { userId, month, year, baseSalary, bonus, deductions, notes } = req.body;

        if (!userId || !month || !year || baseSalary === undefined) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Get total hours from attendance
        const attendances = await prisma.staffAttendance.findMany({
            where: {
                userId,
                date: {
                    gte: new Date(year, month - 1, 1),
                    lt: new Date(year, month, 1)
                }
            }
        });

        const totalHours = attendances.reduce((acc, att) => acc + (att.totalHours || 0), 0);
        
        // Simple net amount calculation
        const netAmount = parseFloat(baseSalary) + parseFloat(bonus || 0) - parseFloat(deductions || 0);

        const payroll = await prisma.staffPayroll.upsert({
            where: {
                userId_month_year: { userId, month: parseInt(month), year: parseInt(year) }
            },
            update: {
                baseSalary: parseFloat(baseSalary),
                totalHours,
                bonus: parseFloat(bonus || 0),
                deductions: parseFloat(deductions || 0),
                netAmount,
                notes
            },
            create: {
                userId,
                month: parseInt(month),
                year: parseInt(year),
                baseSalary: parseFloat(baseSalary),
                totalHours,
                bonus: parseFloat(bonus || 0),
                deductions: parseFloat(deductions || 0),
                netAmount,
                notes,
                status: 'PENDING'
            }
        });

        res.json({ success: true, data: payroll });
    } catch (error) {
        next(error);
    }
};

// 3. Mark Payroll as Paid
exports.markAsPaid = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { paymentMethod, transactionRef } = req.body;

        const payroll = await prisma.staffPayroll.update({
            where: { id },
            data: {
                status: 'PAID',
                paymentDate: new Date(),
                paymentMethod,
                transactionRef
            }
        });

        res.json({ success: true, data: payroll });
    } catch (error) {
        next(error);
    }
};
