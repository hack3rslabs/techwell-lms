import { MetadataRoute } from 'next'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://techwell.co.in'

    // Static Routes
    const routes = [
        '',
        '/courses',
        '/jobs',
        '/blog',
        '/contact',
        '/about',
        '/it-training-vizag',
        '/computer-courses-vijayawada',
        '/software-training-guntur',
        '/privacy',
        '/terms',
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: route === '' ? 'daily' as const : 'weekly' as const,
        priority: route === '' ? 1 : route.includes('training') || route.includes('courses-') ? 0.9 : 0.8,
    }))

    // Dynamic Routes (Mocked structure for now, would enable with real fetch)
    // const courses = await getDynamicRoutes('/courses', '/courses')
    // const blogs = await getDynamicRoutes('/blogs', '/blog')
    // const jobs = await getDynamicRoutes('/jobs', '/jobs')

    return [...routes]
}
