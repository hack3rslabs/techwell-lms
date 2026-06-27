import { MetadataRoute } from 'next'

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://techwell.co.in'

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            // ── All crawlers: allow public content ─────────────────────────
            {
                userAgent: '*',
                allow: [
                    '/',
                    '/courses',
                    '/courses/',
                    '/blog',
                    '/blog/',
                    '/jobs',
                    '/jobs/',
                    '/about',
                    '/contact',
                    '/pricing',
                    '/careers',
                    '/live-classes',
                    '/skillcast',
                    '/projects',
                    '/colleges',
                    '/community',
                    '/privacy',
                    '/terms',
                    '/cookies',
                    '/gdpr',
                    '/help',
                    '/support',
                    '/certificate',
                ],
                disallow: [
                    '/admin/',
                    '/admin',
                    '/api/',
                    '/dashboard/',
                    '/student/',
                    '/employer/',
                    '/instructor/',
                    '/profile/',
                    '/chat/',
                    '/verify/',
                    '/forgot-password/',
                    '/register',
                    '/login',
                    '/_next/',
                    '/interviews/',
                    '/resume-builder/',
                    '/portfolio/',
                ],
            },
            // ── Googlebot: same as above ────────────────────────────────────
            {
                userAgent: 'Googlebot',
                allow: ['/', '/courses', '/blog', '/jobs', '/about', '/contact'],
                disallow: ['/admin/', '/api/', '/dashboard/', '/student/', '/employer/'],
            },
            // ── Bingbot ────────────────────────────────────────────────────
            {
                userAgent: 'Bingbot',
                allow: ['/', '/courses', '/blog', '/jobs', '/about', '/contact'],
                disallow: ['/admin/', '/api/', '/dashboard/', '/student/', '/employer/'],
            },
            // ── Block AI training crawlers ──────────────────────────────────
            { userAgent: 'GPTBot',       disallow: ['/'] },
            { userAgent: 'CCBot',        disallow: ['/'] },
            { userAgent: 'anthropic-ai', disallow: ['/'] },
            { userAgent: 'Claude-Web',   disallow: ['/'] },
        ],
        sitemap: `${BASE_URL}/sitemap.xml`,
        host:    BASE_URL,
    }
}
