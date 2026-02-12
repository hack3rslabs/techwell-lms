"use client"

import { useParams } from 'next/navigation'
import { CourseCreationWizard } from '@/components/course/CourseCreationWizard'

export default function AdminEditCoursePage() {
    const params = useParams()
    const courseId = params?.id as string

    if (!courseId) return null

    return <CourseCreationWizard redirectPath="/admin/courses" initialCourseId={courseId} />
}
