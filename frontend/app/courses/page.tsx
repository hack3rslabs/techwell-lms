import { Metadata } from 'next'
import CourseList from '@/components/course/CourseList'

export const metadata: Metadata = {
    title: 'Explore AI-Adaptive Courses | Techwell',
    description: 'Browse our collection of AI-powered tech courses. Learn Web Development, Data Science, Cloud Computing and more with personalized learning paths.',
    keywords: ['Tech Courses', 'AI Learning', 'Web Development Course', 'Data Science Training', 'Cloud Certification'],
    openGraph: {
        title: 'Industry-Ready Tech Courses | Techwell',
        description: 'Accelerate your career with our AI-powered courses designed by industry experts.',
        type: 'website',
        images: ['/images/courses-og.png']
    }
}

export default function Page() {
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        itemListElement: [
            {
                '@type': 'ListItem',
                position: 1,
                name: 'Web Development Course'
            },
            {
                '@type': 'ListItem',
                position: 2,
                name: 'Data Science Certification'
            }
        ]
    }

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <CourseList />
        </>
    )
}
