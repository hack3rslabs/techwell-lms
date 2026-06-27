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
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
        const res = await fetch(`${apiUrl}/courses/${id}`, {
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
        title: course.seoTitle || course.title,
        description: course.metaDescription || course.description?.slice(0, 160) || "Learn with Techwell",
        keywords: course.targetKeywords?.length > 0 ? course.targetKeywords.join(', ') : `${course.title}, Techwell, Course, Training`,
        openGraph: {
            title: course.seoTitle || course.title,
            description: course.metaDescription || course.description?.slice(0, 160),
            images: course.thumbnail ? [course.thumbnail, ...previousImages] : previousImages,
            type: 'article',
            publishedTime: course.createdAt,
            authors: [course.instructor?.name || 'Techwell'],
        },
        twitter: {
            card: "summary_large_image",
            title: course.seoTitle || course.title,
            description: course.metaDescription || course.description?.slice(0, 160),
            images: course.thumbnail ? [course.thumbnail] : [],
        }
    }
}

export default async function CoursePage({ params }: Props) {
    const { id } = await params
    const course = await getCourse(id)

    // Handle course not found case gracefully
    if (!course) {
        return <CourseDetailClient />
    }

    // JSON-LD Structured Data for Course
    const courseSchema = {
        '@context': 'https://schema.org',
        '@type': 'Course',
        name: course.title,
        description: course.metaDescription || course.description,
        provider: {
            '@type': 'Organization',
            name: 'Techwell',
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

    // JSON-LD Structured Data for FAQPage (if faqs exist)
    let faqSchema = null
    if (course.faqs && Array.isArray(course.faqs) && course.faqs.length > 0) {
        faqSchema = {
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: course.faqs.map((faq: any) => ({
                '@type': 'Question',
                name: faq.question,
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: faq.answer
                }
            }))
        }
    }

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(courseSchema) }}
            />
            {faqSchema && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
                />
            )}
            <CourseDetailClient />
        </>
    )
}
