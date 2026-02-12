"use client"

import { CourseCreationWizard } from '@/components/course/CourseCreationWizard'

export default function InstructorCreateCoursePage() {
    return <CourseCreationWizard redirectPath="/instructor/courses" />
}
