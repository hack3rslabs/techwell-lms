const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');

// Helper function to generate a random password if not provided
const generatePassword = () => Math.random().toString(36).slice(-8);

// Institute Admin: Bulk Upload Students from parsed CSV/JSON
exports.bulkUploadStudents = async (req, res) => {
    try {
        if (!req.user.instituteId) return res.status(400).json({ error: 'Not associated with an institute' });
        
        const { students, filename } = req.body; // students should be an array of objects
        if (!students || !Array.isArray(students)) {
            return res.status(400).json({ error: 'Invalid students data' });
        }

        let successCount = 0;
        let failedCount = 0;
        let errors = [];

        for (let i = 0; i < students.length; i++) {
            const student = students[i];
            try {
                // Ensure email is present
                if (!student.email) throw new Error('Email is required');
                
                // Check if user exists
                const existingUser = await prisma.user.findUnique({ where: { email: student.email } });
                if (existingUser) {
                    throw new Error('User with this email already exists');
                }

                // Create user
                const hashedPassword = await bcrypt.hash(student.password || generatePassword(), 10);
                await prisma.user.create({
                    data: {
                        name: student.name || 'Unknown',
                        email: student.email,
                        password: hashedPassword,
                        phone: student.phone || null,
                        role: 'STUDENT',
                        instituteId: req.user.instituteId,
                        college: student.college || null,
                        qualification: student.qualification || null,
                        isActive: true
                    }
                });

                successCount++;
            } catch (err) {
                failedCount++;
                errors.push({ row: i + 1, email: student.email, error: err.message });
            }
        }

        // Log the upload
        const log = await prisma.bulkUploadLog.create({
            data: {
                instituteId: req.user.instituteId,
                uploadedBy: req.user.id,
                filename: filename || 'unknown.csv',
                totalRecords: students.length,
                successCount,
                failedCount,
                errors: errors.length > 0 ? errors : null
            }
        });

        res.json({ message: 'Bulk upload completed', successCount, failedCount, errors, logId: log.id });
    } catch (error) {
        console.error('Bulk Upload Error:', error);
        res.status(500).json({ error: 'Failed to process bulk upload' });
    }
};

// Institute Admin: Get upload logs
exports.getUploadLogs = async (req, res) => {
    try {
        if (!req.user.instituteId) return res.status(400).json({ error: 'Not associated with an institute' });

        const logs = await prisma.bulkUploadLog.findMany({
            where: { instituteId: req.user.instituteId },
            orderBy: { createdAt: 'desc' }
        });

        res.json(logs);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch upload logs' });
    }
};
