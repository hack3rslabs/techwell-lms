import { Metadata } from 'next'
import CourseList from '@/components/course/CourseList'

export const metadata: Metadata = {
    title: 'Explore AI-Adaptive Courses | Techwell',
    description: 'Master in-demand tech skills with personalized, AI-driven learning paths. Accelerate your career with industry-aligned curriculum.',
    keywords: ['Tech Courses', 'AI Learning', 'Web Development Course', 'Data Science Training', 'Cloud Certification'],
    openGraph: {
        title: 'Industry-Ready Tech Courses | Techwell',
        description: 'Accelerate your career with our AI-powered courses designed by industry experts.',
        type: 'website',
        images: ['/images/courses-og.png']
    }
}

export default function Page() {
    return <CourseList />
}
