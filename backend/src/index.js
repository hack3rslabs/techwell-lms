require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { DATABASE_HELP, getDatabaseHealth, isDatabaseOfflineError } = require('./utils/database');
const cookieParser = require('cookie-parser');

const authRoutes = require('./routes/auth.routes');
const usersRoutes = require('./routes/users.routes');
const courseRoutes = require('./routes/course.routes');
const interviewRoutes = require('./routes/interview.routes');
const eventsRoutes = require('./routes/events.routes');
const settingsRoutes = require('./routes/settings.routes');

const { twilioRouter } = require('./ai-core/providers/twilio');

const app = express();

// Bulletproof Manual CORS Middleware
app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (origin && (origin.endsWith('techwell.co.in') || origin.includes('localhost') || origin.includes('127.0.0.1') || origin.includes('192.168.'))) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    } else if (process.env.FRONTEND_URL) {
        res.setHeader('Access-Control-Allow-Origin', process.env.FRONTEND_URL.replace(/\/$/, ''));
    }
    // Removed the wildcard '*' fallback to prevent A05 Security Misconfiguration when credentials are true
    
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    
    const reqHeaders = req.headers['access-control-request-headers'];
    if (reqHeaders) {
        res.setHeader('Access-Control-Allow-Headers', reqHeaders);
    } else {
        res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, x-trust-token');
    }
    
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    
    // Explicitly handle preflight
    if (req.method === 'OPTIONS') {
        return res.status(204).end();
    }
    next();
});

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



const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // Limit each IP to 1000 requests per windowMs
    message: { error: 'Too many requests from this IP, please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
});
app.use(globalLimiter);

// Stricter Rate Limiter for Authentication & AI endpoints
const strictLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20, // Limit each IP to 20 requests per windowMs
    message: { error: 'Too many requests, please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api/auth/login', strictLimiter);
app.use('/api/ai', strictLimiter);
app.use('/api/ai-blog', strictLimiter);

app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));
app.use(cookieParser());

// API Routes
const { maintenanceMiddleware } = require('./middleware/maintenanceMiddleware');
app.use('/api', maintenanceMiddleware);

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
app.use('/api/campus-drives', require('./routes/campusDrives.routes'));
app.use('/api/campus-drives', require('./routes/campus-drives.routes'));
app.use('/api/campus-applications', require('./routes/campus-applications.routes'));
app.use('/api/tasks', require('./routes/tasks.routes'));
app.use('/api/email-settings', require('./routes/email-settings.routes'));
app.use('/api/reports', require('./routes/reports.routes'));
app.use('/api/tickets', require('./routes/tickets.routes'));
app.use('/api/institutes', require('./routes/institute.routes'));
app.use('/api/bulk-upload', require('./routes/bulkUpload.routes'));
app.use('/api/consultancy-analytics', require('./routes/consultancyAnalytics.routes'));
app.use('/api/live-classes', require('./routes/live-classes.routes'));
app.use('/api/blogs', require('./routes/blog.routes'));
app.use('/api/ai/blog', require('./routes/ai-blog.routes'));
app.use('/api/ats', require('./routes/ats.routes'));
app.use('/api/ai-settings', require('./routes/ai-settings.routes'));
app.use('/api/admin/ai-management', require('./routes/ai-management.routes'));
app.use('/api/trainer', require('./routes/trainer.routes'));
app.use('/api/behavior', require('./routes/behavior.routes'));
app.use('/api/library', require('./routes/library.routes'));
app.use('/api/chatgpt', require('./routes/chatgpt.routes'));
// app.use('/api/enrollment-requests', require('./routes/enrollment-requests.routes'));
app.use('/api/employer-requests', require('./routes/employer-requests.routes'));
app.use('/api/messages', require('./routes/messages.routes'));
app.use('/api/course-categories', require('./routes/course-categories.routes'));
app.use('/api/resume', require('./routes/resume.routes'));
app.use('/api/skillcasts', require('./routes/skillcastRoutes'));
app.use('/api/coupons', require('./routes/coupons.routes'));
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
        console.error('PRISMA ERROR:', err);
        return res.status(400).json({
            error: errorMsg,
            details: err.message, // Temporarily expose for debugging
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
const PORT = 5000; // Hardcoded to match Dockerfile EXPOSE

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

    server.listen(PORT, '0.0.0.0', () => {
        console.log(`🚀 Techwell API running on http://0.0.0.0:${PORT}`);
        require('./ai-core/scheduler/followUpCron')();
        require('./cron/messageCron')();
    });
}

module.exports = app;
