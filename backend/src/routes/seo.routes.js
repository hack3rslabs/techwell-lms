const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const seoController = require('../controllers/seo.controller');

const ADMIN_ROLES = ['SUPER_ADMIN', 'ADMIN', 'STAFF'];

// ── Sitemap Pages (from seo-data.ts, read-only view) ──────────
router.get('/pages', authenticate, authorize(...ADMIN_ROLES), seoController.getSeoPages);

// ── Metadata Overrides (CRUD) ─────────────────────────────────
router.get('/overrides', authenticate, authorize(...ADMIN_ROLES), seoController.getOverrides);
router.post('/overrides', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), seoController.createOverride);
router.put('/overrides/:id', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), seoController.updateOverride);
router.delete('/overrides/:id', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), seoController.deleteOverride);

// ── Redirects (CRUD) ─────────────────────────────────────────
router.get('/redirects', authenticate, authorize(...ADMIN_ROLES), seoController.getRedirects);
router.post('/redirects', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), seoController.createRedirect);
router.put('/redirects/:id', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), seoController.updateRedirect);
router.delete('/redirects/:id', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), seoController.deleteRedirect);

// ── 404 Crawl Log ─────────────────────────────────────────────
router.get('/crawl-errors', authenticate, authorize(...ADMIN_ROLES), seoController.getCrawlErrors);
router.post('/crawl-errors/log', seoController.logCrawlError); // Public — called by Next.js not-found
router.delete('/crawl-errors/:id', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), seoController.dismissCrawlError);
router.delete('/crawl-errors', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), seoController.clearCrawlErrors);

// ── Summary Stats ─────────────────────────────────────────────
router.get('/stats', authenticate, authorize(...ADMIN_ROLES), seoController.getStats);

// ── Dynamic SEO Content (Public) ──────────────────────────────
router.get('/dynamic/:slug', seoController.getDynamicSeoPage);

module.exports = router;
