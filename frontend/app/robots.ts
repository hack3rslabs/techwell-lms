import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://techwell.co.in'

    // Private routes — never expose to any crawler
    const disallow = [
        '/admin',
        '/api',
        '/student',
        '/employer',
        '/franchise-admin',
        '/instructor',
        '/institute',
        '/profile',
        '/agreements',
        '/certificate',
        '/verify',
        '/login',
        '/register',
        '/forgot-password',
        '/onboarding',
        '/_next',
    ]

    return {
        rules: [
            // Standard search engines — full public access
            {
                userAgent: 'Googlebot',
                allow: '/',
                disallow,
            },
            {
                userAgent: 'Bingbot',
                allow: '/',
                disallow,
            },
            // Google AI Overview & extended crawl
            {
                userAgent: 'Google-Extended',
                allow: '/',
                disallow,
            },
            // ChatGPT / OpenAI web crawler
            {
                userAgent: 'GPTBot',
                allow: '/',
                disallow,
            },
            // ChatGPT browsing tool
            {
                userAgent: 'ChatGPT-User',
                allow: '/',
                disallow,
            },
            // Perplexity AI
            {
                userAgent: 'PerplexityBot',
                allow: '/',
                disallow,
            },
            // Anthropic / Claude
            {
                userAgent: 'anthropic-ai',
                allow: '/',
                disallow,
            },
            {
                userAgent: 'ClaudeBot',
                allow: '/',
                disallow,
            },
            // Meta AI
            {
                userAgent: 'Meta-ExternalAgent',
                allow: '/',
                disallow,
            },
            // Apple / Siri
            {
                userAgent: 'Applebot-Extended',
                allow: '/',
                disallow,
            },
            // Cohere AI
            {
                userAgent: 'cohere-ai',
                allow: '/',
                disallow,
            },
            // DuckDuckGo AI
            {
                userAgent: 'DuckDuckBot',
                allow: '/',
                disallow,
            },
            // Default rule — all other crawlers get the same public access
            {
                userAgent: '*',
                allow: '/',
                disallow,
            },
        ],
        sitemap: `${baseUrl}/sitemap.xml`,
    }
}
