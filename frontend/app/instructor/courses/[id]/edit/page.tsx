"use client"

import { useParams } from 'next/navigation'
import { CourseCreationWizard } from '@/components/course/CourseCreationWizard'

export default function InstructorEditCoursePage() {
    const params = useParams()
    const courseId = params?.id as string

    if (!courseId) return null

    return <CourseCreationWizard redirectPath="/instructor/courses" initialCourseId={courseId} />
}
