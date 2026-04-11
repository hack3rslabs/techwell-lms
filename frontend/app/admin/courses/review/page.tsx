"use client"

import * as React from 'react'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Eye,
    CheckCircle,
    XCircle,
    Clock,
    Archive,
    Loader2,
    BookOpen,
    Video,
    Users
} from 'lucide-react'
import api from '@/lib/api'

interface PendingCourse {
    id: string
    title: string
    description: string
    category: string
    courseType: 'RECORDED' | 'LIVE' | 'HYBRID'
    difficulty: string
    publishStatus: 'DRAFT' | 'IN_REVIEW' | 'PUBLISHED' | 'ARCHIVED'
    submittedForReviewAt?: string
    instructorId: string
    price: number
    _count?: {
        modules: number
        enrollments: number
    }
}

export default function CourseReviewPage() {
    const router = useRouter()
    const [courses, setCourses] = useState<PendingCourse[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [selectedCourse, setSelectedCourse] = useState<PendingCourse | null>(null)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [reviewNotes, setReviewNotes] = useState('')
    const [isProcessing, setIsProcessing] = useState(false)
    const [filter, setFilter] = useState<'ALL' | 'IN_REVIEW' | 'DRAFT'>('IN_REVIEW')

    useEffect(() => {
        fetchCourses()
    }, [fetchCourses])

    const fetchCourses = useCallback(async () => {
        setIsLoading(true)
        try {
            const res = await api.get('/admin/courses/pending', {
                params: { status: filter }
            })
            setCourses(res.data.courses || [])
        } catch (error) {
            console.error('Failed to fetch pending courses:', error)
            // Mock data for demo
            setCourses([
                {
                    id: '1',
                    title: 'Advanced React Patterns',
                    description: 'Learn advanced React patterns including compound components...',
                    category: 'Development',
                    courseType: 'RECORDED',
                    difficulty: 'ADVANCED',
                    publishStatus: 'IN_REVIEW',
                    submittedForReviewAt: new Date().toISOString(),
                    instructorId: 'inst1',
                    price: 2999,
                    _count: { modules: 8, enrollments: 0 }
                },
                {
                    id: '2',
                    title: 'Live Python Bootcamp',
                    description: 'Comprehensive Python course with live sessions...',
                    category: 'Development',
                    courseType: 'LIVE',
                    difficulty: 'BEGINNER',
                    publishStatus: 'IN_REVIEW',
                    submittedForReviewAt: new Date().toISOString(),
                    instructorId: 'inst2',
                    price: 4999,
                    _count: { modules: 12, enrollments: 0 }
                }
            ])
        } finally {
            setIsLoading(false)
        }
    }, [filter])

    const handleApprove = async (course: PendingCourse) => {
        setIsProcessing(true)
        try {
            await api.patch(`/admin/courses/${course.id}/approve`, { notes: reviewNotes })
            setCourses(courses.filter(c => c.id !== course.id))
            setIsDialogOpen(false)
            setSelectedCourse(null)
            setReviewNotes('')
        } catch (error) {
            console.error('Failed to approve course:', error)
            alert('Failed to approve course')
        } finally {
            setIsProcessing(false)
        }
    }

    const handleReject = async (course: PendingCourse) => {
        if (!reviewNotes.trim()) {
            alert('Please provide rejection notes')
            return
        }
        setIsProcessing(true)
        try {
            await api.patch(`/admin/courses/${course.id}/reject`, { notes: reviewNotes })
            setCourses(courses.filter(c => c.id !== course.id))
            setIsDialogOpen(false)
            setSelectedCourse(null)
            setReviewNotes('')
        } catch (error) {
            console.error('Failed to reject course:', error)
            alert('Failed to reject course')
        } finally {
            setIsProcessing(false)
        }
    }

    const handleArchive = async (courseId: string) => {
        if (!confirm('Are you sure you want to archive this course?')) return
        try {
            await api.patch(`/admin/courses/${courseId}/archive`)
            fetchCourses()
        } catch (error) {
            console.error('Failed to archive course:', error)
        }
    }

    const getCourseTypeIcon = (type: string) => {
        switch (type) {
            case 'LIVE': return <Users className="h-4 w-4 text-green-600" />
            case 'HYBRID': return <Video className="h-4 w-4 text-orange-600" />
            default: return <BookOpen className="h-4 w-4 text-blue-600" />
        }
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'IN_REVIEW':
                return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300"><Clock className="h-3 w-3 mr-1" />In Review</Badge>
            case 'PUBLISHED':
                return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300"><CheckCircle className="h-3 w-3 mr-1" />Published</Badge>
            case 'ARCHIVED':
                return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-300"><Archive className="h-3 w-3 mr-1" />Archived</Badge>
            default:
                return <Badge variant="secondary">Draft</Badge>
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Course Review</h1>
                    <p className="text-muted-foreground">Review and approve courses submitted by instructors.</p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex gap-2">
                {(['IN_REVIEW', 'DRAFT', 'ALL'] as const).map(status => (
                    <Button
                        key={status}
                        variant={filter === status ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setFilter(status)}
                    >
                        {status === 'IN_REVIEW' ? 'Pending Review' : status === 'ALL' ? 'All Courses' : 'Drafts'}
                    </Button>
                ))}
            </div>

            {/* Courses Table */}
            <Card>
                <CardContent className="pt-6">
                    {isLoading ? (
                        <div className="flex justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : courses.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Course</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Category</TableHead>
                                    <TableHead>Modules</TableHead>
                                    <TableHead>Price</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {courses.map(course => (
                                    <TableRow key={course.id}>
                                        <TableCell>
                                            <div>
                                                <div className="font-medium">{course.title}</div>
                                                <div className="text-xs text-muted-foreground max-w-xs truncate">{course.description}</div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1">
                                                {getCourseTypeIcon(course.courseType)}
                                                <span className="text-sm">{course.courseType}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>{course.category}</TableCell>
                                        <TableCell>{course._count?.modules || 0}</TableCell>
                                        <TableCell>₹{course.price}</TableCell>
                                        <TableCell>{getStatusBadge(course.publishStatus)}</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => router.push(`/courses/${course.id}`)}
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                                {course.publishStatus === 'IN_REVIEW' && (
                                                    <Button
                                                        size="sm"
                                                        onClick={() => {
                                                            setSelectedCourse(course)
                                                            setIsDialogOpen(true)
                                                        }}
                                                    >
                                                        Review
                                                    </Button>
                                                )}
                                                {course.publishStatus === 'PUBLISHED' && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleArchive(course.id)}
                                                    >
                                                        <Archive className="h-4 w-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <div className="text-center py-12 text-muted-foreground">
                            <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-20" />
                            <h3 className="text-lg font-medium">No courses pending review</h3>
                            <p>All courses have been reviewed.</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Review Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Review Course</DialogTitle>
                        <DialogDescription>{selectedCourse?.title}</DialogDescription>
                    </DialogHeader>
                    {selectedCourse && (
                        <div className="space-y-4 py-4">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="text-muted-foreground">Type:</span>
                                    <p className="font-medium">{selectedCourse.courseType}</p>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Difficulty:</span>
                                    <p className="font-medium">{selectedCourse.difficulty}</p>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Modules:</span>
                                    <p className="font-medium">{selectedCourse._count?.modules || 0}</p>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Price:</span>
                                    <p className="font-medium">₹{selectedCourse.price}</p>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Review Notes</label>
                                <Textarea
                                    value={reviewNotes}
                                    onChange={e => setReviewNotes(e.target.value)}
                                    placeholder="Add notes for the instructor (required for rejection)"
                                    className="min-h-[100px]"
                                />
                            </div>
                        </div>
                    )}
                    <DialogFooter className="gap-2">
                        <Button
                            variant="destructive"
                            onClick={() => selectedCourse && handleReject(selectedCourse)}
                            disabled={isProcessing}
                        >
                            {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4 mr-2" />}
                            Reject
                        </Button>
                        <Button
                            onClick={() => selectedCourse && handleApprove(selectedCourse)}
                            disabled={isProcessing}
                        >
                            {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4 mr-2" />}
                            Approve & Publish
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
