"use client"

import { CourseCreationWizard } from '@/components/course/CourseCreationWizard'

export default function AdminCreateCoursePage() {
    return <CourseCreationWizard redirectPath="/admin/courses" />
}
