"use client"

import * as React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { courseApi } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, BookOpen, Clock, Users, Loader2 } from 'lucide-react'

interface Course {
    id: string
    title: string
    category: string
    isPublished: boolean
    difficulty: string
    price: number
    thumbnail?: string
    _count?: { enrollments: number; modules: number }
}

export default function InstructorCourses() {
    const router = useRouter()
    const [courses, setCourses] = React.useState<Course[]>([])
    const [isLoading, setIsLoading] = React.useState(true)

    React.useEffect(() => {
        const fetchCourses = async () => {
            try {
                const res = await courseApi.getMyCreated()
                setCourses(res.data.courses || [])
            } catch (error) {
                console.error("Failed to fetch my courses", error)
            } finally {
                setIsLoading(false)
            }
        }
        fetchCourses()
    }, [])

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">My Courses</h1>
                <Link href="/instructor/courses/new">
                    <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Create New Course
                    </Button>
                </Link>
            </div>

            {isLoading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : courses.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed rounded-lg">
                    <BookOpen className="h-12 w-12 mx-auto text-muted-foreground opacity-50 mb-4" />
                    <h3 className="text-lg font-medium">No courses created yet</h3>
                    <p className="text-muted-foreground mb-4">Start sharing your knowledge by creating your first course.</p>
                    <Link href="/instructor/courses/new">
                        <Button variant="outline">Create Now</Button>
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {courses.map((course) => (
                        <Card key={course.id} className="overflow-hidden border-none shadow-sm hover:shadow-md transition-shadow group">
                            <div className="aspect-video bg-muted relative">
                                {course.thumbnail ? (
                                    <Image src={course.thumbnail} alt={course.title} width={400} height={225} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center opacity-20 bg-primary/10">
                                        <BookOpen className="h-12 w-12" />
                                    </div>
                                )}
                                <div className="absolute top-2 right-2">
                                    <Badge variant={course.isPublished ? "default" : "secondary"}>
                                        {course.isPublished ? 'Published' : 'Draft'}
                                    </Badge>
                                </div>
                            </div>
                            <CardHeader className="p-4">
                                <CardTitle className="text-lg line-clamp-1" title={course.title}>{course.title}</CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 pt-0 space-y-4">
                                <div className="flex justify-between text-sm text-muted-foreground">
                                    <div className="flex items-center gap-1">
                                        <Users className="h-4 w-4" />
                                        {course._count?.enrollments || 0} Students
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <BookOpen className="h-4 w-4" />
                                        {course._count?.modules || 0} Modules
                                    </div>
                                </div>
                                <Button
                                    variant="outline"
                                    className="w-full"
                                    onClick={() => router.push(`/instructor/courses/${course.id}/edit`)}
                                >
                                    Manage Course
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
