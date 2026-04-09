import { MetadataRoute } from 'next'
import _api from '@/lib/api'

// Helper to fetch keys if API is available, otherwise returns defaults
async function _getDynamicRoutes(_endpoint: string, _routePrefix: string) {
    try {
        // In a real build, we might fetch directly from DB or public API
        // For SSG/ISR support. 
        // const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`)
        // const data = await res.json()
        return [] // data.map(item => ({ url: `${baseUrl}${routePrefix}/${item.slug || item.id}`, lastModified: new Date() }))
    } catch (_e) {
        return []
    }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://techwell.com'

    // Static Routes
    const routes = [
        '',
        '/courses',
        '/jobs',
        '/blog',
        '/contact',
        '/about',
        '/privacy',
        '/terms',
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: route === '' ? 1 : 0.8,
    }))

    // Dynamic Routes (Mocked structure for now, would enable with real fetch)
    // const courses = await getDynamicRoutes('/courses', '/courses')
    // const blogs = await getDynamicRoutes('/blogs', '/blog')
    // const jobs = await getDynamicRoutes('/jobs', '/jobs')

    return [...routes]
}
