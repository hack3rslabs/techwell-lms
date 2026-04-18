"use client"

import * as React from 'react'
import Image from 'next/image'
import {
    Users,
    Search,
    Filter,
    Loader2,
    User,
    BookOpen,
    TrendingUp,
    TrendingDown,
    AlertTriangle,
    ArrowUpRight,
    BarChart3,
    Target,
    ChevronDown
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription
} from '@/components/ui/dialog'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import api from '@/lib/api'

interface Student {
    id: string
    name: string
    email: string
    avatar: string | null
    enrollments: {
        course: { id: string; title: string }
        progress: number
        completedAt: string | null
    }[]
}

interface Batch {
    id: string
    name: string
    course: { title: string }
}

interface StudentProgress {
    student: { name: string; email: string }
    course: { title: string }
    overallProgress: number
    modules: {
        title: string
        progress: number
        lessons: {
            title: string
            completed: boolean
            score: number | null
        }[]
    }[]
}

export default function InstructorStudentsPage() {
    const [students, setStudents] = React.useState<Student[]>([])
    const [batches, setBatches] = React.useState<Batch[]>([])
    const [loading, setLoading] = React.useState(true)
    const [searchQuery, setSearchQuery] = React.useState('')
    const [selectedBatch, setSelectedBatch] = React.useState<string>('')
    const [progressFilter, setProgressFilter] = React.useState<string>('all')

    const [selectedStudent, setSelectedStudent] = React.useState<Student | null>(null)
    const [selectedCourseId, setSelectedCourseId] = React.useState<string>('')
    const [studentProgress, setStudentProgress] = React.useState<StudentProgress | null>(null)
    const [loadingProgress, setLoadingProgress] = React.useState(false)

    React.useEffect(() => {
        fetchData()
    }, [selectedBatch])

    const fetchData = async () => {
        setLoading(true)
        try {
            const [studentsRes, batchesRes] = await Promise.all([
                api.get('/trainer/students', { params: { batchId: selectedBatch || undefined } }),
                api.get('/trainer/batches')
            ])
            setStudents(studentsRes.data || [])
            setBatches(batchesRes.data || [])
        } catch (error) {
            console.error('Failed to fetch data:', error)
        } finally {
            setLoading(false)
        }
    }

    const fetchStudentProgress = async (studentId: string, courseId: string) => {
        setLoadingProgress(true)
        try {
            const res = await api.get(`/trainer/students/${studentId}/progress`, {
                params: { courseId }
            })
            setStudentProgress(res.data)
        } catch (error) {
            console.error('Failed to fetch progress:', error)
            setStudentProgress(null)
        } finally {
            setLoadingProgress(false)
        }
    }

    const handleViewProgress = (student: Student, courseId: string) => {
        setSelectedStudent(student)
        setSelectedCourseId(courseId)
        fetchStudentProgress(student.id, courseId)
    }

    const getProgressColor = (progress: number) => {
        if (progress >= 80) return 'text-green-600 bg-green-100'
        if (progress >= 50) return 'text-amber-600 bg-amber-100'
        return 'text-red-600 bg-red-100'
    }

    const getProgressIcon = (progress: number) => {
        if (progress >= 80) return TrendingUp
        if (progress >= 50) return Target
        return TrendingDown
    }

    const filteredStudents = students.filter(s => {
        const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.email.toLowerCase().includes(searchQuery.toLowerCase())

        if (progressFilter === 'all') return matchesSearch

        const avgProgress = s.enrollments.reduce((acc, e) => acc + e.progress, 0) / (s.enrollments.length || 1)

        if (progressFilter === 'at-risk') return matchesSearch && avgProgress < 30
        if (progressFilter === 'on-track') return matchesSearch && avgProgress >= 30 && avgProgress < 80
        if (progressFilter === 'top') return matchesSearch && avgProgress >= 80

        return matchesSearch
    })

    const atRiskCount = students.filter(s => {
        const avg = s.enrollments.reduce((acc, e) => acc + e.progress, 0) / (s.enrollments.length || 1)
        return avg < 30
    }).length

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-black text-slate-800">Student Progress</h1>
                <p className="text-sm text-slate-500 mt-1">Monitor and track student performance across your courses</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="border-none shadow-sm">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-primary/10">
                            <Users className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{students.length}</p>
                            <p className="text-xs text-slate-500 font-medium">Total Students</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-sm cursor-pointer hover:shadow-md transition-all"
                    onClick={() => setProgressFilter('top')}>
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-green-100">
                            <TrendingUp className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">
                                {students.filter(s => {
                                    const avg = s.enrollments.reduce((acc, e) => acc + e.progress, 0) / (s.enrollments.length || 1)
                                    return avg >= 80
                                }).length}
                            </p>
                            <p className="text-xs text-slate-500 font-medium">Top Performers</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-sm cursor-pointer hover:shadow-md transition-all"
                    onClick={() => setProgressFilter('on-track')}>
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-amber-100">
                            <Target className="h-5 w-5 text-amber-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">
                                {students.filter(s => {
                                    const avg = s.enrollments.reduce((acc, e) => acc + e.progress, 0) / (s.enrollments.length || 1)
                                    return avg >= 30 && avg < 80
                                }).length}
                            </p>
                            <p className="text-xs text-slate-500 font-medium">On Track</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-sm cursor-pointer hover:shadow-md transition-all border-red-200"
                    onClick={() => setProgressFilter('at-risk')}>
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-red-100">
                            <AlertTriangle className="h-5 w-5 text-red-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-red-600">{atRiskCount}</p>
                            <p className="text-xs text-slate-500 font-medium">At Risk</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row md:items-center gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                        placeholder="Search students..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="gap-2">
                            <Filter className="h-4 w-4" />
                            {selectedBatch ? batches.find(b => b.id === selectedBatch)?.name : 'All Batches'}
                            <ChevronDown className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => setSelectedBatch('')}>All Batches</DropdownMenuItem>
                        {batches.map(batch => (
                            <DropdownMenuItem key={batch.id} onClick={() => setSelectedBatch(batch.id)}>
                                {batch.name}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>

                {progressFilter !== 'all' && (
                    <Button variant="ghost" size="sm" onClick={() => setProgressFilter('all')}>
                        Clear filter
                    </Button>
                )}
            </div>

            {/* Students List */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : filteredStudents.length === 0 ? (
                <Card className="border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-16">
                        <Users className="h-16 w-16 text-slate-300 mb-4" />
                        <h3 className="text-lg font-bold text-slate-600">No students found</h3>
                        <p className="text-sm text-slate-500 mt-1">
                            {searchQuery ? 'Try adjusting your search' : 'No students enrolled yet'}
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {filteredStudents.map((student) => {
                        const avgProgress = student.enrollments.reduce((acc, e) => acc + e.progress, 0) / (student.enrollments.length || 1)
                        const ProgressIcon = getProgressIcon(avgProgress)

                        return (
                            <Card key={student.id} className="border-none shadow-sm hover:shadow-md transition-all">
                                <CardContent className="p-6">
                                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                                        {/* Student Info */}
                                        <div className="flex items-center gap-4 min-w-[250px]">
                                            <div className="h-12 w-12 rounded-full bg-slate-200 flex items-center justify-center">
                                                {student.avatar ? (
                                                    <Image src={student.avatar} alt="" width={48} height={48} className="h-12 w-12 rounded-full object-cover" />
                                                ) : (
                                                    <User className="h-6 w-6 text-slate-500" />
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-800">{student.name}</p>
                                                <p className="text-xs text-slate-500">{student.email}</p>
                                            </div>
                                        </div>

                                        {/* Progress Overview */}
                                        <div className="flex-1">
                                            <div className="flex items-center gap-4 mb-2">
                                                <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold ${getProgressColor(avgProgress)}`}>
                                                    <ProgressIcon className="h-3 w-3" />
                                                    {Math.round(avgProgress)}% avg
                                                </div>
                                                <span className="text-xs text-slate-500">
                                                    {student.enrollments.length} course{student.enrollments.length !== 1 ? 's' : ''}
                                                </span>
                                            </div>
                                            <Progress value={avgProgress} className="h-2" />
                                        </div>

                                        {/* Courses */}
                                        <div className="flex flex-wrap gap-2">
                                            {student.enrollments.slice(0, 2).map((enrollment) => (
                                                <Button
                                                    key={enrollment.course.id}
                                                    variant="outline"
                                                    size="sm"
                                                    className="text-xs"
                                                    onClick={() => handleViewProgress(student, enrollment.course.id)}
                                                >
                                                    <BookOpen className="h-3 w-3 mr-1" />
                                                    {enrollment.course.title.substring(0, 20)}...
                                                    <Badge variant="secondary" className="ml-2 text-[10px]">
                                                        {enrollment.progress}%
                                                    </Badge>
                                                </Button>
                                            ))}
                                            {student.enrollments.length > 2 && (
                                                <Badge variant="outline">+{student.enrollments.length - 2} more</Badge>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>
            )}

            {/* Progress Detail Dialog */}
            <Dialog open={!!selectedStudent && !!selectedCourseId} onOpenChange={() => {
                setSelectedStudent(null)
                setSelectedCourseId('')
                setStudentProgress(null)
            }}>
                <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Student Progress Details</DialogTitle>
                        <DialogDescription>
                            {selectedStudent?.name} - {studentProgress?.course.title || 'Loading...'}
                        </DialogDescription>
                    </DialogHeader>

                    {loadingProgress ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : studentProgress ? (
                        <div className="space-y-6 py-4">
                            {/* Overall Progress */}
                            <div className="p-4 bg-slate-50 rounded-xl">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="font-medium">Overall Progress</span>
                                    <span className="text-lg font-bold text-primary">{studentProgress.overallProgress}%</span>
                                </div>
                                <Progress value={studentProgress.overallProgress} className="h-3" />
                            </div>

                            {/* Module-wise Progress */}
                            <div className="space-y-4">
                                <h3 className="font-bold text-slate-800">Module Breakdown</h3>
                                {studentProgress.modules.map((module, idx) => (
                                    <Card key={idx} className="border">
                                        <CardHeader className="py-3 px-4">
                                            <div className="flex items-center justify-between">
                                                <CardTitle className="text-sm">{module.title}</CardTitle>
                                                <Badge variant={module.progress === 100 ? "default" : "secondary"}>
                                                    {module.progress}%
                                                </Badge>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="px-4 pb-4 pt-0">
                                            <div className="space-y-2">
                                                {module.lessons.map((lesson, lidx) => (
                                                    <div key={lidx} className="flex items-center justify-between text-sm py-1 border-b last:border-0">
                                                        <span className={lesson.completed ? 'text-slate-800' : 'text-slate-500'}>
                                                            {lesson.title}
                                                        </span>
                                                        <div className="flex items-center gap-2">
                                                            {lesson.score !== null && (
                                                                <Badge variant="outline" className="text-xs">
                                                                    Score: {lesson.score}%
                                                                </Badge>
                                                            )}
                                                            {lesson.completed ? (
                                                                <Badge className="bg-green-100 text-green-700 text-xs">Done</Badge>
                                                            ) : (
                                                                <Badge variant="secondary" className="text-xs">Pending</Badge>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-12 text-slate-500">
                            <p>Unable to load progress details</p>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}
