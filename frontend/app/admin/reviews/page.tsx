"use client"

import { useState, useEffect } from 'react'
import api from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, XCircle, ExternalLink, Loader2, FileText, BookOpen } from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'

export default function ReviewsPage() {
    interface ReviewCourse {
        id: string
        title: string
        instructor?: { name: string }
        price: number
        category: string
        submittedForReviewAt?: string
        publishStatus: string
        status: string
    }
    interface ReviewBlog {
        id: string
        title: string
        author?: { name: string }
        summary?: string
        content: string
        createdAt: string
    }
    const [courses, setCourses] = useState<ReviewCourse[]>([])
    const [blogs, setBlogs] = useState<ReviewBlog[]>([])
    const [isLoading, setIsLoading] = useState(true)

    async function fetchData() {
        setIsLoading(true)
        try {
            // We need to fetch ALL mostly, or specific endpoints for pending
            // For now, fetch generic and filter client side or use dedicated params if implemented
            const [coursesRes, blogsRes] = await Promise.all([
                api.get('/courses'), // Needs to return all for admin
                api.get('/blogs?status=IN_REVIEW') // Blog API supports status filter
            ])

            // Filter courses client side if API returns all
            const pendingCourses = (coursesRes.data.courses || coursesRes.data).filter((c: { publishStatus: string, status: string }) =>
                c.publishStatus === 'IN_REVIEW' || c.status === 'IN_REVIEW' // handle both legacy/new
            )

            setCourses(pendingCourses)
            setBlogs(blogsRes.data.blogs || blogsRes.data)
        } catch {
            // Error handling
        } finally {
            setIsLoading(false)
        }
    }


    useEffect(() => {
        fetchData()
    }, [])


    const handleApproveCourse = async (id: string) => {
        try {
            await api.patch(`/courses/${id}/status`, { status: 'PUBLISHED' })
            toast.success('Course approved & published')
            setCourses(prev => prev.filter(c => c.id !== id))
        } catch (_error) {
            toast.error('Failed to approve course')
        }
    }

    const handleRejectCourse = async (id: string) => {
        if (!confirm('Reject this course and return to draft?')) return
        try {
            await api.patch(`/courses/${id}/status`, { status: 'DRAFT' })
            toast.success('Course rejected')
            setCourses(prev => prev.filter(c => c.id !== id))
        } catch (_error) {
            toast.error('Failed to reject course')
        }
    }

    const handleApproveBlog = async (id: string) => {
        try {
            await api.put(`/blogs/${id}`, { status: 'PUBLISHED' })
            toast.success('Blog post published')
            setBlogs(prev => prev.filter(b => b.id !== id))
        } catch (_error) {
            toast.error('Failed to publish blog')
        }
    }

    const handleRejectBlog = async (id: string) => {
        if (!confirm('Return this post to draft?')) return
        try {
            await api.put(`/blogs/${id}`, { status: 'DRAFT' })
            toast.success('Blog returned to draft')
            setBlogs(prev => prev.filter(b => b.id !== id))
        } catch (_error) {
            toast.error('Failed to reject blog')
        }
    }

    if (isLoading) return <div className="p-8"><Loader2 className="animate-spin h-8 w-8 mx-auto" /></div>

    return (
        <div className="container py-8 space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Review Queue</h1>
                <p className="text-muted-foreground">Approve or reject content submitted for publication.</p>
            </div>

            <Tabs defaultValue="courses">
                <TabsList>
                    <TabsTrigger value="courses">Courses ({courses.length})</TabsTrigger>
                    <TabsTrigger value="blogs">Blog Posts ({blogs.length})</TabsTrigger>
                </TabsList>

                <TabsContent value="courses" className="space-y-4 mt-6">
                    {courses.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground border rounded-lg bg-muted/10">
                            <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>No courses pending review.</p>
                        </div>
                    ) : (
                        courses.map(course => (
                            <Card key={course.id}>
                                <CardHeader>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <CardTitle>{course.title}</CardTitle>
                                            <CardDescription>Submitted by {course.instructor?.name || 'Instructor'}</CardDescription>
                                        </div>
                                        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending Review</Badge>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex justify-between items-end">
                                        <div className="text-sm text-muted-foreground space-y-1">
                                            <p>Price: ₹{course.price}</p>
                                            <p>Category: {course.category}</p>
                                            <p>Submitted: {course.submittedForReviewAt ? format(new Date(course.submittedForReviewAt), 'MMM d, yyyy') : 'Recently'}</p>
                                        </div>
                                        <div className="flex gap-2">
                                            {/* Preview Link would go here */}
                                            <Button variant="outline" size="sm" onClick={() => handleRejectCourse(course.id)}>
                                                <XCircle className="mr-2 h-4 w-4" /> Reject
                                            </Button>
                                            <Button size="sm" onClick={() => handleApproveCourse(course.id)}>
                                                <CheckCircle className="mr-2 h-4 w-4" /> Approve
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </TabsContent>

                <TabsContent value="blogs" className="space-y-4 mt-6">
                    {blogs.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground border rounded-lg bg-muted/10">
                            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>No blog posts pending review.</p>
                        </div>
                    ) : (
                        blogs.map(blog => (
                            <Card key={blog.id}>
                                <CardHeader>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <CardTitle>{blog.title}</CardTitle>
                                            <CardDescription>Authored by {blog.author?.name || 'User'}</CardDescription>
                                        </div>
                                        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending Review</Badge>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <p className="text-sm text-muted-foreground line-clamp-2">{blog.summary || blog.content}</p>
                                        <div className="flex justify-between items-end">
                                            <div className="text-sm text-muted-foreground">
                                                Created: {format(new Date(blog.createdAt), 'MMM d, yyyy')}
                                            </div>
                                            <div className="flex gap-2">
                                                {/* Preview Link */}
                                                <Button variant="outline" size="sm" onClick={() => handleRejectBlog(blog.id)}>
                                                    <XCircle className="mr-2 h-4 w-4" /> Return to Draft
                                                </Button>
                                                <Button size="sm" onClick={() => handleApproveBlog(blog.id)}>
                                                    <CheckCircle className="mr-2 h-4 w-4" /> Publish
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </TabsContent>
            </Tabs>
        </div>
    )
}
