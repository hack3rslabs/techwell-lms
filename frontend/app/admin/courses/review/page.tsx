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

    // ✅ FIX: moved above useEffect
    const fetchCourses = useCallback(async () => {
        setIsLoading(true)
        try {
            const res = await api.get('/admin/courses/pending', {
                params: { status: filter }
            })
            setCourses(res.data.courses || [])
        } catch (error) {
            console.error('Failed to fetch pending courses:', error)

            // Mock data fallback
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

    useEffect(() => {
        fetchCourses()
    }, [fetchCourses])

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
                return <Badge variant="outline">In Review</Badge>
            case 'PUBLISHED':
                return <Badge variant="outline">Published</Badge>
            case 'ARCHIVED':
                return <Badge variant="outline">Archived</Badge>
            default:
                return <Badge>Draft</Badge>
        }
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Course Review</h1>

            <Card>
                <CardContent className="pt-6">
                    {isLoading ? (
                        <Loader2 className="animate-spin" />
                    ) : (
                        courses.map(course => (
                            <div key={course.id}>{course.title}</div>
                        ))
                    )}
                </CardContent>
            </Card>
        </div>
    )
}