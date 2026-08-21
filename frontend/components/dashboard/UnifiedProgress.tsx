"use client"

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import {
    Video,
    BookOpen,
    Award,
    TrendingUp,
    PlayCircle,
    CheckCircle,
    ArrowRight,
    Zap
} from 'lucide-react'

interface CourseProgress {
    id: string
    title: string
    category: string
    progress: number
    hasInterviewPrep: boolean
    lessonCompleted: number
    totalLessons: number
    interviewStatus?: 'not_started' | 'in_progress' | 'completed'
    interviewScore?: number
}

interface UnifiedProgressProps {
    courses: CourseProgress[]
    onStartInterview?: (courseId: string) => void
    onContinueCourse?: (courseId: string) => void
}

export function UnifiedProgressCard({ courses, onStartInterview, onContinueCourse }: UnifiedProgressProps) {
    const router = useRouter()

    const handleStartInterview = (courseId: string) => {
        if (onStartInterview) {
            onStartInterview(courseId)
        } else {
            router.push(`/interviews/new?courseId=${courseId}`)
        }
    }

    const handleContinueCourse = (courseId: string) => {
        if (onContinueCourse) {
            onContinueCourse(courseId)
        } else {
            router.push(`/courses/${courseId}/learn`)
        }
    }

    const getInterviewStatusBadge = (status?: string, score?: number) => {
        switch (status) {
            case 'completed':
                return (
                    <Badge className="bg-green-100 text-green-700 border-green-200">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Score: {score}%
                    </Badge>
                )
            case 'in_progress':
                return (
                    <Badge variant="outline" className="bg-sky-50 text-sky-700 border-sky-200">
                        <PlayCircle className="h-3 w-3 mr-1" />
                        In Progress
                    </Badge>
                )
            default:
                return null
        }
    }

    if (courses.length === 0) {
        return (
            <Card>
                <CardContent className="py-12 text-center">
                    <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="font-medium mb-2">No courses enrolled</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                        Start learning by enrolling in a course
                    </p>
                    <Button onClick={() => router.push('/courses')}>
                        Browse Courses
                    </Button>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="space-y-4">
            {courses.map(course => (
                <Card key={course.id} className="overflow-hidden">
                    <div className="flex flex-col lg:flex-row">
                        {/* Course Progress Section */}
                        <div className="flex-1 p-4 border-b lg:border-b-0 lg:border-r">
                            <div className="flex items-start justify-between mb-3">
                                <div>
                                    <h3 className="font-semibold">{course.title}</h3>
                                    <p className="text-xs text-muted-foreground">{course.category}</p>
                                </div>
                                <Badge variant="secondary">
                                    <BookOpen className="h-3 w-3 mr-1" />
                                    Course
                                </Badge>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Progress</span>
                                    <span className="font-medium">{course.progress}%</span>
                                </div>
                                <Progress value={course.progress} className="h-2" />
                                <p className="text-xs text-muted-foreground">
                                    {course.lessonCompleted} of {course.totalLessons} lessons
                                </p>
                            </div>

                            <Button
                                variant="outline"
                                size="sm"
                                className="mt-3 w-full"
                                onClick={() => handleContinueCourse(course.id)}
                            >
                                <PlayCircle className="h-4 w-4 mr-2" />
                                Continue Learning
                            </Button>
                        </div>

                        {/* Interview Prep Section */}
                        {course.hasInterviewPrep && (
                            <div className="lg:w-64 p-4 bg-gradient-to-br from-primary/5 to-primary/10">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <Video className="h-4 w-4 text-primary" />
                                        <span className="font-medium text-sm">Interview Prep</span>
                                    </div>
                                    {getInterviewStatusBadge(course.interviewStatus, course.interviewScore)}
                                </div>

                                {course.interviewStatus === 'completed' ? (
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-sm text-green-600">
                                            <Award className="h-4 w-4" />
                                            Interview Completed
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="w-full"
                                            onClick={() => handleStartInterview(course.id)}
                                        >
                                            Practice Again
                                        </Button>
                                    </div>
                                ) : course.interviewStatus === 'in_progress' ? (
                                    <Button
                                        size="sm"
                                        className="w-full"
                                        onClick={() => handleStartInterview(course.id)}
                                    >
                                        Continue Interview
                                        <ArrowRight className="h-4 w-4 ml-2" />
                                    </Button>
                                ) : (
                                    <div className="space-y-2">
                                        <p className="text-xs text-muted-foreground">
                                            Practice AI interviews for this course domain
                                        </p>
                                        <Button
                                            size="sm"
                                            className="w-full"
                                            onClick={() => handleStartInterview(course.id)}
                                            disabled={course.progress < 50}
                                        >
                                            <Zap className="h-4 w-4 mr-2" />
                                            Start Interview
                                        </Button>
                                        {course.progress < 50 && (
                                            <p className="text-xs text-sky-600">
                                                Complete 50% of course to unlock
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </Card>
            ))}
        </div>
    )
}

// Stats Overview Component
export function LearningStatsCard({ stats }: {
    stats: {
        totalCourses: number
        completedCourses: number
        totalInterviews: number
        averageScore: number
        hoursLearned: number
    }
}) {
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
                <CardContent className="pt-4">
                    <div className="flex items-center gap-2">
                        <BookOpen className="h-5 w-5 text-blue-600" />
                        <div>
                            <p className="text-2xl font-bold">{stats.totalCourses}</p>
                            <p className="text-xs text-muted-foreground">Enrolled Courses</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardContent className="pt-4">
                    <div className="flex items-center gap-2">
                        <Award className="h-5 w-5 text-green-600" />
                        <div>
                            <p className="text-2xl font-bold">{stats.completedCourses}</p>
                            <p className="text-xs text-muted-foreground">Completed</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardContent className="pt-4">
                    <div className="flex items-center gap-2">
                        <Video className="h-5 w-5 text-sky-600" />
                        <div>
                            <p className="text-2xl font-bold">{stats.totalInterviews}</p>
                            <p className="text-xs text-muted-foreground">Interviews</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardContent className="pt-4">
                    <div className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-sky-600" />
                        <div>
                            <p className="text-2xl font-bold">{stats.averageScore}%</p>
                            <p className="text-xs text-muted-foreground">Avg Score</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
