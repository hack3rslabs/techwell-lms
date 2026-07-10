require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { DATABASE_HELP, getDatabaseHealth, isDatabaseOfflineError } = require('./utils/database');

const authRoutes = require('./routes/auth.routes');
const usersRoutes = require('./routes/users.routes');
const courseRoutes = require('./routes/course.routes');
const interviewRoutes = require('./routes/interview.routes');
const eventsRoutes = require('./routes/events.routes');
const settingsRoutes = require('./routes/settings.routes');

const { twilioRouter } = require('./ai-core/providers/twilio');

const app = express();

// Security Middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            ...helmet.contentSecurityPolicy.getDefaultDirectives(),
            "frame-ancestors": ["'self'", "http://localhost:3000", "http://127.0.0.1:3000", "http://192.168.29.183:3000", process.env.FRONTEND_URL],
            "img-src": ["'self'", "data:", "blob:", "http:", "https:", "http://localhost:5000", "http://127.0.0.1:5000"],
            "connect-src": ["'self'", "http://localhost:5000", "http://127.0.0.1:5000", "ws:", "wss:"],
        },
    },
    frameguard: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginEmbedderPolicy: false,
    crossOriginOpenerPolicy: false,
}));

// Serve Static Uploads
const path = require('path');
const uploadsPath = path.join(__dirname, '../uploads');
app.use('/uploads', express.static(uploadsPath, {
    setHeaders: (res) => {
        res.set('Access-Control-Allow-Origin', '*');
        res.set('Cross-Origin-Resource-Policy', 'cross-origin');
    }
}));

app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        
        const allowedOrigins = ['http://localhost:3000', 'http://192.168.29.183:3000'];
        if (process.env.FRONTEND_URL) {
            allowedOrigins.push(process.env.FRONTEND_URL.replace(/\/$/, ''));
        }

        if (origin.endsWith('techwell.co.in') || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        
        console.warn('CORS Blocked Origin:', origin);
        return callback(new Error('CORS policy error'), false);
    },
    credentials: true
}));

const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // Limit each IP to 1000 requests per windowMs
    message: { error: 'Too many requests from this IP, please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
});
app.use(globalLimiter);

const xss = require('xss-clean');
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));
app.use(xss());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/events', require('./routes/events.routes'));
app.use('/api/staff', require('./routes/staff.routes'));
app.use('/api/admin', require('./routes/admin.routes'));
app.use('/api/consultancy', require('./routes/consultancy.routes'));
app.use('/api/consulting-projects', require('./routes/consultingProjects.routes'));
app.use('/api/gdpr', require('./routes/gdpr.routes'));
app.use('/api/referrals', require('./routes/referrals.routes'));
app.use('/api/rbac', require('./routes/rbac.routes'));
app.use('/api/leads', require('./routes/leads.routes'));
app.use('/api/crm/leads/bulk', require('./routes/bulk-leads.routes'));
app.use('/api/crm/tasks', require('./routes/crm-tasks.routes'));
app.use('/api/crm/communication', require('./routes/communication.routes'));
app.use('/api/crm/customers', require('./routes/crm-customers.routes'));
app.use('/api/crm/agreements', require('./routes/crm-agreements.routes'));
app.use('/api/messaging', require('./routes/messaging.routes'));
app.use('/api/analytics', require('./routes/analytics.routes'));
app.use('/api/analytics/studio', require('./routes/analytics-studio.routes'));
app.use('/api/ads', require('./routes/ads.routes'));
app.use('/api/employers', require('./routes/employer.routes'));
app.use('/api/interviews', interviewRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/projects', require('./routes/projectRoutes'));
app.use('/api/payments', require('./routes/payment.routes'));
app.use('/api/finance', require('./routes/finance.routes'));
app.use('/api/upload', require('./routes/upload.routes'));
app.use('/api/search', require('./routes/search.routes'));
app.use('/api/avatars', require('./routes/avatar.routes'));
app.use('/api/knowledge-base', require('./routes/knowledge-base.routes'));
app.use('/api/partners', require('./routes/partner.routes'));
app.use('/api/certificates', require('./routes/certificate.routes'));
app.use('/api/portfolio', require('./routes/portfolio.routes'));
app.use('/api/ai', require('./routes/ai.routes'));
app.use('/api/video', require('./routes/video.routes'));
app.use('/api/jobs', require('./routes/jobs.routes'));
app.use('/api/campus-drives', require('./routes/campus-drives.routes'));
app.use('/api/campus-applications', require('./routes/campus-applications.routes'));
app.use('/api/tasks', require('./routes/tasks.routes'));
app.use('/api/email-settings', require('./routes/email-settings.routes'));
app.use('/api/reports', require('./routes/reports.routes'));
app.use('/api/tickets', require('./routes/tickets.routes'));
app.use('/api/institutes', require('./routes/institute.routes'));
app.use('/api/campus-drives', require('./routes/campusDrives.routes'));
app.use('/api/bulk-upload', require('./routes/bulkUpload.routes'));
app.use('/api/consultancy-analytics', require('./routes/consultancyAnalytics.routes'));
app.use('/api/live-classes', require('./routes/live-classes.routes'));
app.use('/api/blogs', require('./routes/blog.routes'));
app.use('/api/ai/blog', require('./routes/ai-blog.routes'));
app.use('/api/ats', require('./routes/ats.routes'));
app.use('/api/ai-settings', require('./routes/ai-settings.routes'));
app.use('/api/trainer', require('./routes/trainer.routes'));
app.use('/api/behavior', require('./routes/behavior.routes'));
app.use('/api/library', require('./routes/library.routes'));
app.use('/api/chatgpt', require('./routes/chatgpt.routes'));
// app.use('/api/enrollment-requests', require('./routes/enrollment-requests.routes'));
app.use('/api/employer-requests', require('./routes/employer-requests.routes'));
app.use('/api/messages', require('./routes/messages.routes'));
app.use('/api/course-categories', require('./routes/course-categories.routes'));
app.use('/api/resume', require('./routes/resume.routes'));
app.use('/api/candidates', require('./routes/candidate.routes'));
app.use('/api/assessments', require('./routes/assessment.routes'));
app.use('/api/quizzes', require('./routes/quiz.routes'));
app.use('/api/operations', require('./routes/operations.routes'));
app.use('/api/admin/gallery', require('./routes/galleryRoutes'));
app.use('/api/success-stories', require('./routes/success-stories.routes'));
app.use('/api/documents', require('./routes/documents.routes'));
app.use('/api/services', require('./routes/service.routes'));
app.use('/api/products', require('./routes/product.routes'));
app.use('/api/clients', require('./routes/client.routes'));
app.use('/api/team', require('./routes/team'));
app.use('/api/batches', require('./routes/batch.routes'));
app.use('/api/staff', require('./routes/staff.routes'));
app.use('/api/sales/templates', require('./routes/templates.routes'));
app.use('/api/internships', require('./routes/internships.routes'));
app.use('/api/ats-checker', require('./routes/ats-checker.routes'));
app.use('/api/linkedin', require('./routes/linkedin.routes'));
app.use('/api/payroll', require('./routes/payroll.routes'));
app.use('/api/admin/marketing', require('./routes/marketing.routes'));
app.use('/api/promotions', require('./routes/promotions.routes'));
app.use('/api/admin/newsletters', require('./routes/newsletter.routes'));
app.use('/api/admin/automation-studio', require('./api/admin/automation-studio/index'));
app.use('/api/franchise', require('./routes/franchise.routes'));
app.use('/api/twilio', twilioRouter);

// Health check
app.get('/api/health', async (req, res) => {
    const db = await getDatabaseHealth();
    res.json({ status: db.ok ? 'ok' : 'degraded', database: db.ok ? 'online' : 'offline' });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('API Error:', err);

    // Handle Zod validation errors
    if (err.name === 'ZodError') {
        return res.status(400).json({
            error: 'Validation failed',
            details: err.errors.map(e => ({ path: e.path.join('.'), message: e.message }))
        });
    }

    // Handle Prisma errors
    if (err.code && err.code.startsWith('P')) {
        let errorMsg = 'Database operation failed';
        if (err.code === 'P2002') {
            errorMsg = 'A unique constraint was violated (duplicate record).';
        } else if (err.code === 'P2003') {
            errorMsg = 'A foreign key constraint failed.';
        } else if (err.code === 'P2025') {
            errorMsg = 'Requested record was not found.';
        }

        return res.status(400).json({
            error: errorMsg,
            details: process.env.NODE_ENV === 'development' ? err.message : undefined,
            code: err.code
        });
    }

    res.status(err.status || 500).json({
        error: err.message || 'Internal server error',
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
});

const http = require('http');
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

// Permanent solution to prevent server from crashing due to unhandled errors
process.on('uncaughtException', (err) => {
    console.error('UNCAUGHT EXCEPTION! 💥 Shutting down gracefully is recommended, but keeping alive for now.');
    console.error(err.name, err.message);
    console.error(err.stack);
});

process.on('unhandledRejection', (err) => {
    console.error('UNHANDLED REJECTION! 💥 Keeping alive.');
    console.error(err);
});

if (process.env.NODE_ENV !== 'test') {

    // Auto-seed Super Admin
    async function seedSuperAdmin() {
        try {
            const bcrypt = require('bcryptjs');
            const { PrismaClient } = require('@prisma/client');
            const prisma = new PrismaClient();
            const email = 'admin@techwell.co.in';
            const rawPassword = process.env.ADMIN_PASSWORD;
            if (!rawPassword) {
                console.error('[SEED] ADMIN_PASSWORD environment variable is missing.');
                return;
            }
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(rawPassword, salt);

            let admin = await prisma.user.findUnique({ where: { email } });
            if (!admin) {
                await prisma.user.create({
                    data: {
                        email,
                        password: hashedPassword,
                        firstName: 'Uttam',
                        lastName: 'Admin',
                        name: 'Uttam Admin',
                        role: 'SUPER_ADMIN',
                        emailVerified: true
                    }
                });
                console.log(`[SEED] Created super admin: ${email}`);
            } else {
                // Ensure they have SUPER_ADMIN role and reset password if needed
                await prisma.user.update({
                    where: { email },
                    data: {
                        role: 'SUPER_ADMIN',
                        password: hashedPassword
                    }
                });
                console.log(`[SEED] Verified super admin: ${email}`);
            }
        } catch (err) {
            console.error('[SEED] Error seeding super admin:', err);
        }
    }
    seedSuperAdmin();

    server.listen(PORT, () => {
        console.log(`🚀 Techwell API running on http://localhost:${PORT}`);
        require('./ai-core/scheduler/followUpCron')();
        require('./cron/messageCron')();
    });
}

module.exports = app;
