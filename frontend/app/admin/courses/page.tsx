"use client"

import * as React from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { GraduationCap, Loader2, Plus, BookOpen, Clock } from 'lucide-react'

interface Course {
    id: string
    title: string
    category: string
    isPublished: boolean
    difficulty: string
    price: number
    _count?: { enrollments: number; modules: number }
}

export default function AdminCoursesPage() {
    const router = useRouter()
    const [courses, setCourses] = React.useState<Course[]>([])
    const [isLoading, setIsLoading] = React.useState(true)

    React.useEffect(() => {
        const fetchCourses = async () => {
            try {
                const res = await api.get('/courses')
                setCourses(res.data.courses || [])
            } catch (error) {
                console.error(error)
            } finally {
                setIsLoading(false)
            }
        }
        fetchCourses()
    }, [])

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Courses</h1>
                    <p className="text-muted-foreground">Manage your curriculum and content.</p>
                </div>
                <Button onClick={() => router.push('/admin/courses/new')}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create New Course
                </Button>
            </div>

            {isLoading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {courses.map((course) => (
                        <Card key={course.id} className="hover:shadow-lg transition-all group overflow-hidden">
                            <div className="h-2 bg-primary/10 group-hover:bg-primary transition-colors" />
                            <CardContent className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <Badge variant="outline" className="mb-2">
                                        {course.category}
                                    </Badge>
                                    <Badge className={course.isPublished ? "bg-green-100 text-green-700 hover:bg-green-100" : "bg-yellow-100 text-yellow-700 hover:bg-yellow-100"}>
                                        {course.isPublished ? 'Published' : 'Draft'}
                                    </Badge>
                                </div>
                                <h3 className="font-bold text-lg mb-2 line-clamp-2 min-h-[56px]">
                                    {course.title}
                                </h3>

                                <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground mb-6">
                                    <div className="flex items-center gap-1">
                                        <BookOpen className="h-3.5 w-3.5" />
                                        {course._count?.modules || 0} Modules
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Clock className="h-3.5 w-3.5" />
                                        {course.difficulty}
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-4 border-t">
                                    <span className="font-bold text-lg">
                                        {course.price === 0 ? 'Free' : `₹${course.price}`}
                                    </span>
                                    <Button variant="secondary" size="sm" onClick={() => router.push(`/admin/courses/${course.id}/edit`)}>
                                        Manage
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
