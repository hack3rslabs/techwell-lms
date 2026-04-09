import type { Metadata, ResolvingMetadata } from 'next'
import CourseDetailClient from './client'

type Props = {
    params: { id: string }
    searchParams: { [key: string]: string | string[] | undefined }
}

// Function to fetch data for metadata
// In a real app, use `fetch` with caching or a direct DB call if using Server Actions/RSC
async function getCourse(id: string) {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/courses/${id}`, {
            // Revalidate every hour
            next: { revalidate: 3600 }
        })
        if (!res.ok) return null
        // Assuming API structure: { course: ... } or { data: { course: ... } }
        // Based on previous code: response.data.course
        const data = await res.json()
        return data.course
    } catch (_error) {
        return null
    }
}

export async function generateMetadata(
    { params, searchParams: _searchParams }: Props,
    parent: ResolvingMetadata
): Promise<Metadata> {
    const { id } = await params
    const course = await getCourse(id)

    if (!course) {
        return {
            title: 'Course Not Found',
        }
    }

    const previousImages = (await parent).openGraph?.images || []

    return {
        title: course.title,
        description: course.description?.slice(0, 160) || "Learn with TechWell",
        openGraph: {
            title: course.title,
            description: course.description?.slice(0, 160),
            images: course.thumbnail ? [course.thumbnail, ...previousImages] : previousImages,
            type: 'article',
            publishedTime: course.createdAt,
            authors: [course.instructor?.name || 'TechWell'],
        },
        twitter: {
            card: "summary_large_image",
            title: course.title,
            description: course.description?.slice(0, 160),
            images: course.thumbnail ? [course.thumbnail] : [],
        }
    }
}

export default async function CoursePage({ params }: Props) {
    const { id } = await params
    const course = await getCourse(id)

    // Handle course not found case gracefully (or let client handle loading if we returned null but client fetches too? 
    // Actually client generally re-fetches or we could pass initial data. 
    // For now we just render client component which handles its own fetching, 
    // but the JSON-LD script will only be present if we successfully fetched here.)

    if (!course) {
        return <CourseDetailClient />
    }

    // JSON-LD Structured Data
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Course',
        name: course.title,
        description: course.description,
        provider: {
            '@type': 'Organization',
            name: 'TechWell',
            sameAs: 'https://techwell.co.in'
        },
        hasCourseInstance: {
            '@type': 'CourseInstance',
            courseMode: 'online',
            instructor: course.instructor ? {
                '@type': 'Person',
                name: course.instructor.name
            } : undefined
        },
        offers: {
            '@type': 'Offer',
            category: 'Paid',
            price: course.price,
            priceCurrency: 'INR'
        }
    }

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <CourseDetailClient />
        </>
    )
}
