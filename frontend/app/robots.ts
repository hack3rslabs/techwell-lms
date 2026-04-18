import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://techwell.co.in'

    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/admin/', '/api/', '/student/dashboard', '/employer/dashboard'],
        },
        sitemap: `${baseUrl}/sitemap.xml`,
    }
}
