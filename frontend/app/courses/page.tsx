import { Metadata } from 'next'
import CourseList from '@/components/course/CourseList'
import { Suspense } from 'react'

export const metadata: Metadata = {
    title: 'Explore Live Instructor-Led Courses | Techwell',
    description: 'Browse our collection of live trainer-led tech courses. Learn Web Development, Data Science, Cloud Computing, and more with expert guidance and AI-assisted automation.',
    keywords: ['Live Tech Courses', 'Trainer-Led IT Training', 'Web Development Course', 'Data Science Training', 'Cloud Certification'],
    openGraph: {
        title: 'Industry-Ready Live Technical Courses | Techwell',
        description: 'Accelerate your career with our live instructor-led courses designed by industry experts.',
        type: 'website',
        images: ['/images/courses-og.png']
    }
}

export default function Page() {
    return (
        <Suspense fallback={
            <div className="container py-12 flex justify-center items-center min-h-[300px]">
                <div className="flex flex-col items-center gap-2">
                    <span className="w-8 h-8 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin"></span>
                    <p className="text-muted-foreground text-sm font-medium">Loading programs catalog...</p>
                </div>
            </div>
        }>
            <CourseList />
        </Suspense>
    )
}
