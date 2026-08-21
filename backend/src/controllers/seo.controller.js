/**
 * SEO Controller
 * Manages metadata overrides, URL redirects, and 404 crawl error logs.
 * Uses the SystemSetting model with JSON storage (key-value pattern)
 * so no schema migration is needed.
 */
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL } } });

// ── Storage Keys ──────────────────────────────────────────────
const OVERRIDES_KEY = 'seo_metadata_overrides';
const REDIRECTS_KEY = 'seo_redirects';
const CRAWL_ERRORS_KEY = 'seo_crawl_errors';

// ── Helpers ───────────────────────────────────────────────────
async function getJson(key) {
    try {
        const row = await prisma.systemSetting.findUnique({ where: { key } });
        return row ? JSON.parse(row.value) : [];
    } catch {
        return [];
    }
}

async function setJson(key, data) {
    const value = JSON.stringify(data);
    await prisma.systemSetting.upsert({
        where: { key },
        update: { value },
        create: { key, value },
    });
}

function makeId() {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

// ── Known SEO pages from seo-data.ts (kept in sync manually) ─
const SEO_PAGES = [
    { slug: '/', title: 'Home', priority: 1.0 },
    { slug: '/courses', title: 'Courses', priority: 0.9 },
    { slug: '/jobs', title: 'Jobs', priority: 0.9 },
    { slug: '/placements', title: 'Placements', priority: 0.9 },
    { slug: '/consultancy', title: 'Consultancy', priority: 0.9 },
    { slug: '/services', title: 'Services', priority: 0.9 },
    { slug: '/about', title: 'About', priority: 0.8 },
    { slug: '/contact', title: 'Contact', priority: 0.8 },
    { slug: '/events', title: 'Events', priority: 0.8 },
    { slug: '/blog', title: 'Blog', priority: 0.7 },
    // SEO Landing Pages
    { slug: '/it-training', title: 'IT Training Hub', priority: 0.9 },
    { slug: '/networking', title: 'Networking Training', priority: 0.8 },
    { slug: '/desktop-support', title: 'Desktop Support Training', priority: 0.8 },
    { slug: '/windows-server', title: 'Windows Server Training', priority: 0.8 },
    { slug: '/linux', title: 'Linux Training', priority: 0.8 },
    { slug: '/cloud-computing', title: 'Cloud Computing Training', priority: 0.8 },
    { slug: '/devops', title: 'DevOps Training', priority: 0.8 },
    { slug: '/devsecops', title: 'DevSecOps Training', priority: 0.8 },
    { slug: '/application-security', title: 'Application Security', priority: 0.8 },
    { slug: '/cyber-security', title: 'Cyber Security / VAPT', priority: 0.8 },
    { slug: '/endpoint-management', title: 'Endpoint Management', priority: 0.8 },
    { slug: '/site-reliability-engineering', title: 'SRE Training', priority: 0.8 },
    { slug: '/it-service-management', title: 'ITSM Training', priority: 0.8 },
    { slug: '/ai-ml', title: 'AI & ML Training', priority: 0.8 },
    { slug: '/full-stack-development', title: 'Full Stack Development', priority: 0.8 },
    { slug: '/vibe-coding', title: 'Vibe Coding', priority: 0.8 },
    { slug: '/freshers-jobs', title: 'Freshers Jobs', priority: 0.8 },
    { slug: '/career-hub', title: 'Career Hub', priority: 0.8 },
    { slug: '/campus-hiring', title: 'Campus Hiring', priority: 0.8 },
    { slug: '/campus-recruitment', title: 'Campus Recruitment', priority: 0.8 },
    { slug: '/campus-to-career', title: 'Campus to Career', priority: 0.8 },
    { slug: '/job-assistance', title: 'Job Assistance', priority: 0.8 },
    { slug: '/placement-assistance', title: 'Placement Assistance', priority: 0.8 },
    { slug: '/job-consultancy', title: 'Job Consultancy', priority: 0.8 },
    { slug: '/recruitment', title: 'Recruitment', priority: 0.8 },
    { slug: '/ai-mock-interview', title: 'AI Mock Interview', priority: 0.8 },
    { slug: '/interview-training', title: 'Interview Training', priority: 0.8 },
    { slug: '/resume-builder', title: 'Resume Builder', priority: 0.8 },
    { slug: '/it-consulting', title: 'IT Consulting', priority: 0.8 },
    { slug: '/software-development', title: 'Software Development', priority: 0.8 },
];

// ── GET /api/seo/pages ────────────────────────────────────────
exports.getSeoPages = async (req, res) => {
    try {
        const overrides = await getJson(OVERRIDES_KEY);
        const overrideMap = Object.fromEntries(overrides.map(o => [o.slug, o]));
        const pages = SEO_PAGES.map(p => ({
            ...p,
            hasOverride: !!overrideMap[p.slug],
            overrideTitle: overrideMap[p.slug]?.title,
            overrideDescription: overrideMap[p.slug]?.description,
        }));
        res.json({ success: true, data: pages, total: pages.length });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// ── GET /api/seo/stats ────────────────────────────────────────
exports.getStats = async (req, res) => {
    try {
        const [overrides, redirects, crawlErrors] = await Promise.all([
            getJson(OVERRIDES_KEY),
            getJson(REDIRECTS_KEY),
            getJson(CRAWL_ERRORS_KEY),
        ]);
        const last7Days = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const recentErrors = crawlErrors.filter(e => new Date(e.lastSeen) >= last7Days);
        res.json({
            success: true,
            data: {
                totalPages: SEO_PAGES.length,
                overrideCount: overrides.length,
                redirectCount: redirects.length,
                crawlErrors7d: recentErrors.length,
                totalCrawlErrors: crawlErrors.length,
            },
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// ── Metadata Overrides ────────────────────────────────────────
exports.getOverrides = async (req, res) => {
    try {
        const data = await getJson(OVERRIDES_KEY);
        const { search } = req.query;
        const filtered = search
            ? data.filter(o => o.slug.includes(search) || o.title?.toLowerCase().includes(search.toLowerCase()))
            : data;
        res.json({ success: true, data: filtered, total: filtered.length });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.createOverride = async (req, res) => {
    try {
        const { slug, title, description, ogTitle, ogDescription, noIndex } = req.body;
        if (!slug) return res.status(400).json({ success: false, error: 'slug is required' });
        const overrides = await getJson(OVERRIDES_KEY);
        if (overrides.find(o => o.slug === slug)) {
            return res.status(409).json({ success: false, error: 'Override for this slug already exists' });
        }
        const newOverride = {
            id: makeId(),
            slug,
            title: title || null,
            description: description || null,
            ogTitle: ogTitle || null,
            ogDescription: ogDescription || null,
            noIndex: noIndex || false,
            updatedAt: new Date().toISOString(),
            updatedBy: req.user?.email || 'admin',
        };
        overrides.push(newOverride);
        await setJson(OVERRIDES_KEY, overrides);
        res.status(201).json({ success: true, data: newOverride });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.updateOverride = async (req, res) => {
    try {
        const { id } = req.params;
        const overrides = await getJson(OVERRIDES_KEY);
        const idx = overrides.findIndex(o => o.id === id);
        if (idx === -1) return res.status(404).json({ success: false, error: 'Override not found' });
        overrides[idx] = {
            ...overrides[idx],
            ...req.body,
            id,
            updatedAt: new Date().toISOString(),
            updatedBy: req.user?.email || 'admin',
        };
        await setJson(OVERRIDES_KEY, overrides);
        res.json({ success: true, data: overrides[idx] });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.deleteOverride = async (req, res) => {
    try {
        const { id } = req.params;
        let overrides = await getJson(OVERRIDES_KEY);
        const before = overrides.length;
        overrides = overrides.filter(o => o.id !== id);
        if (overrides.length === before) return res.status(404).json({ success: false, error: 'Override not found' });
        await setJson(OVERRIDES_KEY, overrides);
        res.json({ success: true, message: 'Override deleted' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// ── Redirects ─────────────────────────────────────────────────
exports.getRedirects = async (req, res) => {
    try {
        const data = await getJson(REDIRECTS_KEY);
        const { search } = req.query;
        const filtered = search
            ? data.filter(r => r.from.includes(search) || r.to.includes(search))
            : data;
        res.json({ success: true, data: filtered, total: filtered.length });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.createRedirect = async (req, res) => {
    try {
        const { from, to, type } = req.body;
        if (!from || !to) return res.status(400).json({ success: false, error: 'from and to are required' });
        const redirects = await getJson(REDIRECTS_KEY);
        if (redirects.find(r => r.from === from)) {
            return res.status(409).json({ success: false, error: 'Redirect from this path already exists' });
        }
        const newRedirect = {
            id: makeId(),
            from,
            to,
            type: type === '302' ? 302 : 301,
            hits: 0,
            createdAt: new Date().toISOString(),
            createdBy: req.user?.email || 'admin',
        };
        redirects.push(newRedirect);
        await setJson(REDIRECTS_KEY, redirects);
        res.status(201).json({ success: true, data: newRedirect });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.updateRedirect = async (req, res) => {
    try {
        const { id } = req.params;
        const redirects = await getJson(REDIRECTS_KEY);
        const idx = redirects.findIndex(r => r.id === id);
        if (idx === -1) return res.status(404).json({ success: false, error: 'Redirect not found' });
        redirects[idx] = { ...redirects[idx], ...req.body, id };
        await setJson(REDIRECTS_KEY, redirects);
        res.json({ success: true, data: redirects[idx] });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.deleteRedirect = async (req, res) => {
    try {
        const { id } = req.params;
        let redirects = await getJson(REDIRECTS_KEY);
        const before = redirects.length;
        redirects = redirects.filter(r => r.id !== id);
        if (redirects.length === before) return res.status(404).json({ success: false, error: 'Redirect not found' });
        await setJson(REDIRECTS_KEY, redirects);
        res.json({ success: true, message: 'Redirect deleted' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// ── 404 Crawl Error Log ───────────────────────────────────────
exports.getCrawlErrors = async (req, res) => {
    try {
        const data = await getJson(CRAWL_ERRORS_KEY);
        // Sort newest first
        data.sort((a, b) => new Date(b.lastSeen) - new Date(a.lastSeen));
        res.json({ success: true, data, total: data.length });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.logCrawlError = async (req, res) => {
    try {
        const { path: errorPath, referrer, userAgent } = req.body;
        if (!errorPath) return res.status(400).json({ success: false, error: 'path is required' });
        // Ignore obviously internal paths
        if (errorPath.startsWith('/api') || errorPath.startsWith('/_next')) {
            return res.json({ success: true, ignored: true });
        }
        const errors = await getJson(CRAWL_ERRORS_KEY);
        const existing = errors.find(e => e.path === errorPath);
        if (existing) {
            existing.hits = (existing.hits || 1) + 1;
            existing.lastSeen = new Date().toISOString();
        } else {
            errors.push({
                id: makeId(),
                path: errorPath,
                referrer: referrer || null,
                userAgent: userAgent || null,
                hits: 1,
                firstSeen: new Date().toISOString(),
                lastSeen: new Date().toISOString(),
                dismissed: false,
            });
        }
        // Keep last 500 errors max
        const sorted = errors.sort((a, b) => new Date(b.lastSeen) - new Date(a.lastSeen)).slice(0, 500);
        await setJson(CRAWL_ERRORS_KEY, sorted);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.dismissCrawlError = async (req, res) => {
    try {
        const { id } = req.params;
        let errors = await getJson(CRAWL_ERRORS_KEY);
        const before = errors.length;
        errors = errors.filter(e => e.id !== id);
        if (errors.length === before) return res.status(404).json({ success: false, error: 'Error not found' });
        await setJson(CRAWL_ERRORS_KEY, errors);
        res.json({ success: true, message: 'Crawl error dismissed' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.clearCrawlErrors = async (req, res) => {
    try {
        await setJson(CRAWL_ERRORS_KEY, []);
        res.json({ success: true, message: 'All crawl errors cleared' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// ── Dynamic SEO Page Generator ────────────────────────────────
exports.getDynamicSeoPage = async (req, res) => {
    try {
        const { slug } = req.params;
        
        // 1. Search for a matching course
        const searchSlug = slug.replace(/-/g, ' ').toLowerCase();
        
        const courses = await prisma.course.findMany({
            where: { isPublished: true },
            select: { id: true, title: true, description: true, benefits: true, jobRoles: true }
        });
        
        const course = courses.find(c => c.title.toLowerCase().includes(searchSlug) || searchSlug.includes(c.title.toLowerCase()));

        if (course) {
            let features = [];
            let careerPaths = [];
            
            try { if (course.benefits) features = (typeof course.benefits === 'string' ? JSON.parse(course.benefits) : course.benefits).map(b => ({ icon: '✅', title: b, body: b })); } catch(e) { /* ignore parse error */ }
            try { if (course.jobRoles) careerPaths = (typeof course.jobRoles === 'string' ? JSON.parse(course.jobRoles) : course.jobRoles); } catch(e) { /* ignore parse error */ }

            const seoData = {
                title: `${course.title} Training | Techwell`,
                description: course.description || `Learn ${course.title} with Techwell's professional training program.`,
                h1: `${course.title} Training`,
                subheading: `Professional training program for ${course.title}`,
                intro: course.description || `Enroll in our ${course.title} training to build your career.`,
                features,
                careerPaths,
                faqs: [
                    { q: `What is included in the ${course.title} course?`, a: `The course covers all essential topics for ${course.title}, including hands-on projects and interview preparation.` },
                    { q: `Does this course offer placement assistance?`, a: `Yes, all our professional training programs include job assistance and resume building.` }
                ],
                ctaPrimary: { label: 'View Course Details', href: `/courses` },
                crossLink: { heading: 'Practice Assessments', text: `Test your ${course.title} skills on our platform.`, cta: 'Start Practice', url: 'https://elearnstack.com' },
                relatedLinks: []
            };
            
            // Check overrides
            const overrides = await getJson(OVERRIDES_KEY);
            const override = overrides.find(o => o.slug === slug || o.slug === `/${slug}`);
            if (override) {
                if (override.title) seoData.title = override.title;
                if (override.description) seoData.description = override.description;
            }

            return res.json(seoData);
        }
        
        res.status(404).json({ success: false, error: 'Dynamic SEO content not found' });
        
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};
