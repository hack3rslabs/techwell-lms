import { Metadata } from 'next'
import CourseList from '@/components/course/CourseList'

export const metadata: Metadata = {
    title: 'Explore AI-Adaptive Courses | TechWell',
    description: 'Browse our collection of AI-powered tech courses. Learn Web Development, Data Science, Cloud Computing and more with personalized learning paths.',
    keywords: ['Tech Courses', 'AI Learning', 'Web Development Course', 'Data Science Training', 'Cloud Certification'],
    openGraph: {
        title: 'Industry-Ready Tech Courses | TechWell',
        description: 'Accelerate your career with our AI-powered courses designed by industry experts.',
        type: 'website',
        images: ['/images/courses-og.png']
    }
}

export default function Page() {
    return <CourseList />
}
