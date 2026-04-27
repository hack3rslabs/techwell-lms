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
const settingsRoutes = require('./routes/settings.routes');

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
        const allowedOrigins = ['http://localhost:3000', 'http://192.168.29.183:3000', process.env.FRONTEND_URL];
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) return callback(new Error('CORS policy error'), false);
        return callback(null, true);
    },
    credentials: true
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/rbac', require('./routes/rbac.routes'));
app.use('/api/leads', require('./routes/leads.routes'));
app.use('/api/employers', require('./routes/employer.routes'));
app.use('/api/interviews', interviewRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/projects', require('./routes/projectRoutes'));
app.use('/api/payments', require('./routes/payment.routes'));
app.use('/api/finance', require('./routes/finance.routes'));
app.use('/api/admin', require('./routes/admin.routes'));
app.use('/api/upload', require('./routes/upload.routes'));
app.use('/api/search', require('./routes/search.routes'));
app.use('/api/analytics', require('./routes/analytics.routes'));
app.use('/api/avatars', require('./routes/avatar.routes'));
app.use('/api/knowledge-base', require('./routes/knowledge-base.routes'));
app.use('/api/certificates', require('./routes/certificate.routes'));
app.use('/api/portfolio', require('./routes/portfolio.routes'));
app.use('/api/ai', require('./routes/ai.routes'));
app.use('/api/video', require('./routes/video.routes'));
app.use('/api/jobs', require('./routes/jobs.routes'));
app.use('/api/tasks', require('./routes/tasks.routes'));
app.use('/api/email-settings', require('./routes/email-settings.routes'));
app.use('/api/reports', require('./routes/reports.routes'));
app.use('/api/tickets', require('./routes/tickets.routes'));
app.use('/api/live-classes', require('./routes/live-classes.routes'));
app.use('/api/blogs', require('./routes/blog.routes'));
app.use('/api/ats', require('./routes/ats.routes'));
app.use('/api/ai-settings', require('./routes/ai-settings.routes'));
app.use('/api/trainer', require('./routes/trainer.routes'));
app.use('/api/behavior', require('./routes/behavior.routes'));
app.use('/api/library', require('./routes/library.routes'));
app.use('/api/chatgpt', require('./routes/chatgpt.routes'));
app.use('/api/enrollment-requests', require('./routes/enrollment-requests.routes'));
app.use('/api/employer-requests', require('./routes/employer-requests.routes'));
app.use('/api/messages', require('./routes/messages.routes'));
app.use('/api/course-categories', require('./routes/course-categories.routes'));
app.use('/api/resume', require('./routes/resume.routes'));

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
        return res.status(400).json({
            error: 'Database operation failed',
            details: err.message
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
server.listen(PORT, () => {
    console.log(`🚀 TechWell API running on http://localhost:${PORT}`);
});

module.exports = app;
