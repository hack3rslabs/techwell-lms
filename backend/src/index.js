require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/auth.routes');
const usersRoutes = require('./routes/users.routes');
const courseRoutes = require('./routes/course.routes');
const interviewRoutes = require('./routes/interview.routes');
const settingsRoutes = require('./routes/settings.routes');

const app = express();

// Security Middleware
app.use(helmet());
app.use(cors({
    origin: function (origin, callback) {
        const allowedOrigins = [
            'http://localhost:3000',
            'http://192.168.29.183:3000',
            process.env.FRONTEND_URL
        ];
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            var msg = 'The CORS policy for this site does not allow access from the specified Origin.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    },
    credentials: true
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: { error: 'Too many requests, please try again later.' }
});
app.use('/api', limiter);

// Optimization: Compression
const compression = require('compression');
app.use(compression());

// Body parser - Increased limit for video uploads
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Audit Middleware (Logs all state-changing actions)
const auditMiddleware = require('./middleware/audit');
app.use(auditMiddleware);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/test-debug', (req, res) => {
    res.send('BACKEND IS ALIVE AND UPDATED AT ' + new Date().toISOString());
});

// Log all requests
app.use((req, res, next) => {
    console.log(`[DEBUG LOG] ${req.method} ${req.url}`);
    next();
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/courses', courseRoutes);
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
app.use('/api/leads', require('./routes/leads.routes'));
app.use('/api/employers', require('./routes/employer.routes'));
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
app.use('/api/rbac', require('./routes/rbac.routes'));
app.use('/api/behavior', require('./routes/behavior.routes'));
app.use('/api/library', require('./routes/library.routes'));
app.use('/api/chatgpt', require('./routes/chatgpt.routes'));
app.use('/api/enrollment-requests', require('./routes/enrollment-requests.routes'));


// Serve Static Uploads
const path = require('path'); // Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// 404 handler
app.use((req, res) => {
    console.log(`[404] ${req.method} ${req.url}`);
    res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Error:', err);

    if (err.name === 'ZodError') {
        return res.status(400).json({
            error: 'Validation error',
            details: err.errors
        });
    }

    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({ error: 'Invalid token' });
    }

    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'Token expired' });
    }

    const errorMessage = process.env.NODE_ENV === 'production'
        ? 'Internal server error'
        : err.message || 'Internal server error';

    res.status(err.status || 500).json({
        error: errorMessage
    });
});

// Start server
const http = require('http');
const { initializeSocket } = require('./services/socket.service');

const server = http.createServer(app);
const io = initializeSocket(server);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`🚀 TechWell API running on http://localhost:${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
    console.log(`🔌 Socket.io initialized`);
});

module.exports = app;
