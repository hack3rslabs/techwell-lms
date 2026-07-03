"use client"

import * as React from 'react'
import axios from 'axios'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { studentsApi } from '@/lib/api'
import { useToast } from '@/components/ui/use-toast'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import {
    GraduationCap,
    Loader2,
    Search,
    Users,
    BookOpen,
    TrendingUp,
    ChevronLeft,
    ChevronRight,
    Download,
    Mail,
    Phone,
    Award,
    Filter,
    RefreshCw,
    AlertCircle,
    CheckCircle2,
    Banknote,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface StudentEnrollment {
    id: string
    courseId: string
    progress: number
    status: string
    enrolledAt: string
    completedAt: string | null
}

interface StudentUser {
    id: string
    name: string
    email: string
    phone?: string
    avatar?: string
    qualification?: string
    college?: string
    plan: string
    createdAt: string
    enrollments: StudentEnrollment[]
}

interface StudentRecord {
    id: string
    userId: string
    courseId: string | null
    name: string
    email: string
    phone?: string
    qualification?: string
    status: string
    createdAt: string
    updatedAt: string
    course: {
        id: string
        title: string
        category: string
        price: number
        thumbnail?: string
    } | null
    paymentDone: boolean
    user: StudentUser
}

interface CourseOption {
    id: string
    title: string
    category?: string
    price?: number
    discountPrice?: number | null
}

interface Pagination {
    total: number
    page: number
    limit: number
    totalPages: number
}

function getStudentsErrorMessage(error: unknown) {
    if (axios.isAxiosError(error)) {
        if (!error.response) {
            return 'Could not reach the backend at http://localhost:5000. Start the backend and try again.'
        }

        const data = error.response.data as { error?: unknown; message?: unknown } | undefined
        const serverMessage =
            typeof data?.error === 'string'
                ? data.error
                : typeof data?.message === 'string'
                    ? data.message
                    : null

        if (error.response.status === 503) {
            return serverMessage || 'The backend is running, but one of its dependencies is unavailable.'
        }

        if (error.response.status === 403) {
            return serverMessage || 'You do not have permission to view students.'
        }

        return serverMessage || `Failed to load students (status ${error.response.status}).`
    }

    if (error instanceof Error && error.message) {
        return error.message
    }

    return 'Something went wrong while loading students.'
}

export default function StudentsPage() {
    const { toast } = useToast()
    const [students, setStudents] = React.useState<StudentRecord[]>([])
    const [courses, setCourses] = React.useState<CourseOption[]>([])
    const [pagination, setPagination] = React.useState<Pagination>({
        total: 0,
        page: 1,
        limit: 50,
        totalPages: 0,
    })
    const [isLoading, setIsLoading] = React.useState(true)
    const [searchQuery, setSearchQuery] = React.useState('')
    const [selectedCourse, setSelectedCourse] = React.useState<string>('all')
    const [debouncedSearch, setDebouncedSearch] = React.useState('')
    const [errorMessage, setErrorMessage] = React.useState<string | null>(null)
    const [recordingPaymentId, setRecordingPaymentId] = React.useState<string | null>(null)
    const [isPaymentModalOpen, setIsPaymentModalOpen] = React.useState(false)
    const [activeStudentForPayment, setActiveStudentForPayment] = React.useState<StudentRecord | null>(null)
    const [paymentForm, setPaymentForm] = React.useState({ courseIds: [] as string[], amount: '', paymentMethod: 'CASH', orderId: '', note: '', status: 'SUCCESS' })

    // Batch Modal States
    const [isBatchModalOpen, setIsBatchModalOpen] = React.useState(false)
    const [isBatchSubmitting, setIsBatchSubmitting] = React.useState(false)
    const [batchStudents, setBatchStudents] = React.useState<StudentRecord[]>([])
    const [batchSearch, setBatchSearch] = React.useState('')
    const [batchForm, setBatchForm] = React.useState({
        name: '',
        courseId: '',
        studentIds: [] as string[]
    })

    // Debounce search input
    React.useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery)
        }, 400)
        return () => clearTimeout(timer)
    }, [searchQuery])

    const fetchStudents = React.useCallback(async (page = 1) => {
        setIsLoading(true)
        setErrorMessage(null)
        try {
            const params: Record<string, string | number> = { page }
            if (debouncedSearch) params.search = debouncedSearch
            if (selectedCourse && selectedCourse !== 'all') params.course = selectedCourse

            const res = await studentsApi.getAll(params)
            setStudents(res.data.students)
            setCourses(res.data.courses)
            setPagination(res.data.pagination)
        } catch (error) {
            console.error('Failed to fetch students:', error)
            setErrorMessage(getStudentsErrorMessage(error))
        } finally {
            setIsLoading(false)
        }
    }, [debouncedSearch, selectedCourse])

    React.useEffect(() => {
        fetchStudents(1)
    }, [fetchStudents])

    const getEnrollmentForCourse = (student: StudentRecord): StudentEnrollment | undefined => {
        return student.user?.enrollments?.find(e => e.courseId === student.courseId)
    }

    const getCourseAmount = React.useCallback((course: CourseOption | null | undefined) => {
        if (!course) return 0
        const amount = Number(course.discountPrice && Number(course.discountPrice) > 0 ? course.discountPrice : course.price)
        return Number.isFinite(amount) && amount >= 0 ? amount : 0
    }, [])

    const getTotalForCourses = React.useCallback((courseIds: string[]) => {
        return courseIds.reduce((total, courseId) => {
            return total + getCourseAmount(courses.find(course => course.id === courseId))
        }, 0)
    }, [courses, getCourseAmount])

    const updatePaymentCourses = React.useCallback((courseIds: string[]) => {
        const uniqueCourseIds = [...new Set(courseIds)]
        setPaymentForm(prev => ({
            ...prev,
            courseIds: uniqueCourseIds,
            amount: String(getTotalForCourses(uniqueCourseIds)),
        }))
    }, [getTotalForCourses])

    // Stats
    const totalStudents = pagination.total
    const completedCount = students.filter(s => {
        const e = getEnrollmentForCourse(s)
        return e && e.progress >= 100
    }).length
    const inProgressCount = students.filter(s => {
        const e = getEnrollmentForCourse(s)
        return e && e.progress > 0 && e.progress < 100
    }).length
    const avgProgress = students.length > 0
        ? Math.round(
            students.reduce((sum, s) => {
                const e = getEnrollmentForCourse(s)
                return sum + (e?.progress || 0)
            }, 0) / students.length
        )
        : 0

    const handleExportCSV = () => {
        const headers = ['Name', 'Email', 'Phone', 'Course', 'Qualification', 'College', 'Progress', 'Enrollment Date', 'Approval Date']
        const rows = students.map(s => {
            const enrollment = getEnrollmentForCourse(s)
            return [
                s.name,
                s.email,
                s.phone || '',
                s.course?.title || '',
                s.qualification || s.user?.qualification || '',
                s.user?.college || '',
                `${enrollment?.progress || 0}%`,
                enrollment?.enrolledAt ? new Date(enrollment.enrolledAt).toLocaleDateString() : '',
                new Date(s.updatedAt).toLocaleDateString(),
            ]
        })

        const csvContent = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n')
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const link = document.createElement('a')
        link.href = URL.createObjectURL(blob)
        link.download = `students_export_${new Date().toISOString().split('T')[0]}.csv`
        link.click()
    }

    const handlePaymentDone = async (student: StudentRecord) => {
        if (student.paymentDone || recordingPaymentId) return

        if (!student.userId) {
            toast({
                title: 'Missing student details',
                description: 'This student row does not have a valid user record.',
                variant: 'destructive',
            })
            return
        }

        setActiveStudentForPayment(student)
        const defaultCourseId = student.courseId || (selectedCourse !== 'all' ? selectedCourse : '')
        const defaultCourseIds = defaultCourseId ? [defaultCourseId] : []
        setPaymentForm({
            courseIds: defaultCourseIds,
            amount: String(defaultCourseIds.length > 0 ? getTotalForCourses(defaultCourseIds) : ''),
            paymentMethod: 'CASH',
            orderId: '',
            note: '',
            status: 'SUCCESS'
        })
        setIsPaymentModalOpen(true)
    }

    const submitPaymentForm = async () => {
        if (!activeStudentForPayment) return
        if (paymentForm.courseIds.length === 0) {
            toast({
                title: 'Select courses',
                description: 'Choose at least one course this payment should unlock for the student.',
                variant: 'destructive',
            })
            return
        }

        const amount = paymentForm.amount.trim() ? Number(paymentForm.amount) : undefined
        if (amount !== undefined && (!Number.isFinite(amount) || amount < 0)) {
            toast({
                title: 'Invalid amount',
                description: 'Enter a valid payment amount, or leave it blank to use the course price.',
                variant: 'destructive',
            })
            return
        }

        setRecordingPaymentId(activeStudentForPayment.id)
        try {
            const [courseId, ...additionalCourseIds] = paymentForm.courseIds
            const payload: { studentId: string; courseId: string; additionalCourseIds?: string[]; amount?: number; paymentMethod?: string; orderId?: string; status?: string } = {
                studentId: activeStudentForPayment.userId,
                courseId,
            }

            if (additionalCourseIds.length > 0) payload.additionalCourseIds = additionalCourseIds
            if (amount !== undefined) payload.amount = amount
            if (paymentForm.paymentMethod) payload.paymentMethod = paymentForm.paymentMethod
            if (paymentForm.orderId.trim()) payload.orderId = paymentForm.orderId.trim()
            if (paymentForm.status) payload.status = paymentForm.status

            await studentsApi.markPaymentDone(payload)
            await fetchStudents(pagination.page)

            toast({
                title: 'Payment recorded',
                description: `${activeStudentForPayment.name}'s payment for ${paymentForm.courseIds.length} course${paymentForm.courseIds.length > 1 ? 's' : ''} was saved.`,
            })
            setIsPaymentModalOpen(false)
            setActiveStudentForPayment(null)
        } catch (error) {
            console.error('Failed to record cash payment:', error)
            const message = axios.isAxiosError(error)
                ? (typeof error.response?.data?.error === 'string'
                    ? error.response.data.error
                    : 'Could not record the cash payment.')
                : 'Could not record the cash payment.'

            toast({
                title: 'Payment not recorded',
                description: message,
                variant: 'destructive',
            })
        } finally {
            setRecordingPaymentId(null)
        }
    }

    // Fetch students for batch when course changes
    React.useEffect(() => {
        if (isBatchModalOpen && batchForm.courseId) {
            const fetchBatchStudents = async () => {
                try {
                    const res = await studentsApi.getAvailableForBatch(batchForm.courseId)
                    setBatchStudents(res.data.students || [])
                } catch (error) {
                    console.error('Failed to fetch batch students:', error)
                }
            }
            fetchBatchStudents()
        } else {
            setBatchStudents([])
            setBatchForm(prev => ({ ...prev, studentIds: [] }))
        }
    }, [batchForm.courseId, isBatchModalOpen])

    const handleCreateBatch = async () => {
        if (!batchForm.name || !batchForm.courseId) {
            toast({
                title: 'Missing information',
                description: 'Please provide a batch name and select a course.',
                variant: 'destructive'
            })
            return
        }

        if (batchForm.studentIds.length === 0) {
            toast({
                title: 'No students selected',
                description: 'Choose students to add to this batch.',
                variant: 'destructive'
            })
            return
        }

        setIsBatchSubmitting(true)
        try {
            const { batchesApi } = await import('@/lib/api')
            await batchesApi.create(batchForm)
            toast({
                title: 'Batch Created',
                description: `Successfully created batch "${batchForm.name}".`
            })
            setIsBatchModalOpen(false)
            setBatchForm({ name: '', courseId: '', studentIds: [] })
        } catch (error) {
            console.error('Failed to create batch:', error)
            toast({
                title: 'Error',
                description: 'Failed to create batch. Please try again.',
                variant: 'destructive'
            })
        } finally {
            setIsBatchSubmitting(false)
        }
    }

    const filteredBatchStudents = batchStudents.filter(s => 
        s.name.toLowerCase().includes(batchSearch.toLowerCase()) ||
        s.email.toLowerCase().includes(batchSearch.toLowerCase())
    )

    return (
        <div className="p-8 max-w-[1600px] mx-auto space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600">
                        Students
                    </h1>
                    <p className="text-muted-foreground mt-2 text-lg">
                        Students created after successful payment and enrollment
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fetchStudents(pagination.page)}
                        className="gap-2"
                    >
                        <RefreshCw className="h-4 w-4" />
                        Refresh
                    </Button>
                    <Button
                        size="sm"
                        onClick={() => setIsBatchModalOpen(true)}
                        className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md"
                    >
                        <Users className="h-4 w-4" />
                        Create Batch
                    </Button>
                    <Button
                        size="sm"
                        onClick={handleExportCSV}
                        className="gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white shadow-md"
                        disabled={students.length === 0}
                    >
                        <Download className="h-4 w-4" />
                        Export CSV
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="border-0 shadow-md bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/30">
                    <CardContent className="p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground font-medium">Total Students</p>
                                <p className="text-3xl font-bold text-violet-700 dark:text-violet-400 mt-1">{totalStudents}</p>
                            </div>
                            <div className="h-12 w-12 rounded-xl bg-violet-100 dark:bg-violet-900/50 flex items-center justify-center">
                                <Users className="h-6 w-6 text-violet-600 dark:text-violet-400" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-md bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/30 dark:to-green-950/30">
                    <CardContent className="p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground font-medium">Completed</p>
                                <p className="text-3xl font-bold text-emerald-700 dark:text-emerald-400 mt-1">{completedCount}</p>
                            </div>
                            <div className="h-12 w-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center">
                                <Award className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-md bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950/30 dark:to-yellow-950/30">
                    <CardContent className="p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground font-medium">In Progress</p>
                                <p className="text-3xl font-bold text-amber-700 dark:text-amber-400 mt-1">{inProgressCount}</p>
                            </div>
                            <div className="h-12 w-12 rounded-xl bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center">
                                <BookOpen className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-md bg-gradient-to-br from-blue-50 to-sky-50 dark:from-blue-950/30 dark:to-sky-950/30">
                    <CardContent className="p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground font-medium">Avg. Progress</p>
                                <p className="text-3xl font-bold text-blue-700 dark:text-blue-400 mt-1">{avgProgress}%</p>
                            </div>
                            <div className="h-12 w-12 rounded-xl bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
                                <TrendingUp className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card className="border shadow-sm">
                <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Filter className="h-4 w-4" />
                            <span className="text-sm font-medium">Filters</span>
                        </div>
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="student-search"
                                placeholder="Search by name, email, or phone..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                            <SelectTrigger id="course-filter" className="w-full sm:w-[250px]">
                                <SelectValue placeholder="All Courses" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Courses</SelectItem>
                                {courses.map((course) => (
                                    <SelectItem key={course.id} value={course.id}>
                                        {course.title}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {errorMessage && (
                <Card className="border-amber-200 bg-amber-50/70 shadow-sm">
                    <CardContent className="p-4">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-start gap-3">
                                <div className="mt-0.5 rounded-full bg-amber-100 p-2 text-amber-700">
                                    <AlertCircle className="h-4 w-4" />
                                </div>
                                <div>
                                    <p className="font-medium text-amber-950">Student data is unavailable right now</p>
                                    <p className="text-sm text-amber-800">{errorMessage}</p>
                                </div>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => fetchStudents(pagination.page)}
                                className="gap-2 border-amber-300 bg-white text-amber-900 hover:bg-amber-100"
                            >
                                <RefreshCw className="h-4 w-4" />
                                Retry
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Table */}
            <Card className="border shadow-sm">
                <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <GraduationCap className="h-5 w-5 text-violet-600" />
                         Students
                        {!isLoading && (
                            <Badge variant="secondary" className="ml-2 font-normal">
                                {pagination.total} total
                            </Badge>
                        )}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="py-16 flex flex-col items-center justify-center gap-3">
                            <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
                            <p className="text-sm text-muted-foreground">Loading students...</p>
                        </div>
                    ) : students.length > 0 ? (
                        <>
                            <div className="rounded-lg border overflow-hidden">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-muted/50 hover:bg-muted/50">
                                            <TableHead className="font-semibold">Student</TableHead>
                                            <TableHead className="font-semibold">Contact</TableHead>
                                            <TableHead className="font-semibold">Course</TableHead>
                                            <TableHead className="font-semibold">Qualification</TableHead>
                                          {/* <TableHead className="font-semibold">Progress</TableHead> */}
                                            {/* <TableHead className="font-semibold">Enrolled On</TableHead> */}
                                            <TableHead className="font-semibold">Enrolled On</TableHead>
                                            <TableHead className="font-semibold text-right">Payment</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {students.map((student) => {
                                            const enrollment = getEnrollmentForCourse(student)

                                            return (
                                                <TableRow key={student.id} className="group hover:bg-muted/30 transition-colors">
                                                    <TableCell>
                                                        <div className="flex items-center gap-3">
                                                            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center text-white text-sm font-semibold shrink-0">
                                                                {student.name?.charAt(0)?.toUpperCase() || '?'}
                                                            </div>
                                                            <div>
                                                                <div className="font-medium text-foreground">{student.name}</div>
                                                                {student.user?.college && (
                                                                    <div className="text-xs text-muted-foreground mt-0.5">{student.user.college}</div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="space-y-1">
                                                            <div className="flex items-center gap-1.5 text-sm">
                                                                <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                                                                <span>{student.email}</span>
                                                            </div>
                                                            {student.phone && (
                                                                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                                                    <Phone className="h-3.5 w-3.5" />
                                                                    <span>{student.phone}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div>
                                                            <div className="font-medium text-sm">{student.course?.title}</div>
                                                            <div className="text-xs text-muted-foreground mt-0.5">{student.course?.category}</div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <span className="text-sm">
                                                            {student.qualification || student.user?.qualification || '—'}
                                                        </span>
                                                    </TableCell>
                                                    {/* <TableCell>
                                                        <div className="space-y-2 min-w-[140px]">
                                                            <div className="flex items-center justify-between">
                                                                <span className="text-sm font-medium">{progress}%</span>
                                                                {getProgressBadge(progress)}
                                                            </div>
                                                            <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                                                                <div
                                                                    className={`h-full rounded-full transition-all duration-500 ${getProgressColor(progress)}`}
                                                                    style={{ width: `${progress}%` }}
                                                                />
                                                            </div>
                                                        </div>
                                                    </TableCell> */}
                                                    {/* <TableCell>
                                                        <div className="flex items-center gap-1.5 text-sm">
                                                            <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                                                            {enrollment?.enrolledAt
                                                                ? new Date(enrollment.enrolledAt).toLocaleDateString('en-IN', {
                                                                    day: '2-digit',
                                                                    month: 'short',
                                                                    year: 'numeric',
                                                                })
                                                                : '—'}
                                                        </div>
                                                    </TableCell> */}
                                                    <TableCell>
                                                        <div className="text-sm text-muted-foreground">
                                                            {enrollment?.enrolledAt
                                                                ? new Date(enrollment.enrolledAt).toLocaleDateString('en-IN', {
                                                                    day: '2-digit',
                                                                    month: 'short',
                                                                    year: 'numeric',
                                                                })
                                                                : '—'}
                                                        </div>
                                                    </TableCell>
                                                     <TableCell>
                                                        <div className="flex justify-end">
                                                            <Button
                                                                type="button"
                                                                size="sm"
                                                                variant={student.paymentDone ? 'outline' : 'default'}
                                                                className={
                                                                    student.paymentDone
                                                                        ? 'gap-2 border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-50'
                                                                        : 'gap-2 bg-emerald-600 text-white hover:bg-emerald-700'
                                                                }
                                                                disabled={student.paymentDone || Boolean(recordingPaymentId)}
                                                                onClick={() => handlePaymentDone(student)}
                                                            >
                                                                {recordingPaymentId === student.id ? (
                                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                                ) : student.paymentDone ? (
                                                                    <CheckCircle2 className="h-4 w-4" />
                                                                ) : (
                                                                    <Banknote className="h-4 w-4" />
                                                                )}
                                                                {student.paymentDone ? 'Paid' : 'Payment Done'}
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            )
                                        })}
                                    </TableBody>
                                </Table>
                            </div>

                            {/* Pagination */}
                            {pagination.totalPages > 1 && (
                                <div className="flex items-center justify-between mt-6">
                                    <p className="text-sm text-muted-foreground">
                                        Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                                        {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                                        {pagination.total} students
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            disabled={pagination.page <= 1}
                                            onClick={() => fetchStudents(pagination.page - 1)}
                                            className="gap-1"
                                        >
                                            <ChevronLeft className="h-4 w-4" />
                                            Previous
                                        </Button>
                                        <div className="flex items-center gap-1 px-2">
                                            {Array.from({ length: Math.min(pagination.totalPages, 5) }, (_, i) => {
                                                let pageNum: number
                                                if (pagination.totalPages <= 5) {
                                                    pageNum = i + 1
                                                } else if (pagination.page <= 3) {
                                                    pageNum = i + 1
                                                } else if (pagination.page >= pagination.totalPages - 2) {
                                                    pageNum = pagination.totalPages - 4 + i
                                                } else {
                                                    pageNum = pagination.page - 2 + i
                                                }
                                                return (
                                                    <Button
                                                        key={pageNum}
                                                        variant={pagination.page === pageNum ? 'default' : 'ghost'}
                                                        size="sm"
                                                        className="h-8 w-8 p-0"
                                                        onClick={() => fetchStudents(pageNum)}
                                                    >
                                                        {pageNum}
                                                    </Button>
                                                )
                                            })}
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            disabled={pagination.page >= pagination.totalPages}
                                            onClick={() => fetchStudents(pagination.page + 1)}
                                            className="gap-1"
                                        >
                                            Next
                                            <ChevronRight className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="text-center py-16 border rounded-lg bg-muted/10">
                            <div className={`h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4 ${errorMessage ? 'bg-amber-100 text-amber-600' : 'bg-violet-100 dark:bg-violet-900/30 text-violet-400'}`}>
                                {errorMessage ? <AlertCircle className="h-8 w-8" /> : <GraduationCap className="h-8 w-8" />}
                            </div>
                            <p className="text-lg font-medium">
                                {errorMessage ? 'Could not load students' : 'No students found'}
                            </p>
                            <p className="text-muted-foreground text-sm mt-1 max-w-sm mx-auto">
                                {errorMessage
                                    ? errorMessage
                                    : debouncedSearch || selectedCourse !== 'all'
                                        ? 'Try adjusting your filters to find more students.'
                                        : 'When payment succeeds and an enrollment is created, students will appear here.'}
                            </p>
                            {errorMessage && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => fetchStudents(1)}
                                    className="mt-4 gap-2"
                                >
                                    <RefreshCw className="h-4 w-4" />
                                    Retry loading
                                </Button>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

            <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Record Payment</DialogTitle>
                        <DialogDescription>Fill the details to record a manual payment for the student. Only student and course are required.</DialogDescription>
                    </DialogHeader>

                    <div className="max-h-[60vh] overflow-y-auto px-1 -mx-1">
                        <div className="grid grid-cols-1 gap-3.5 mt-2 pb-4">
                        <div>
                            <Label>Student</Label>
                            <div className="text-sm">{activeStudentForPayment ? `${activeStudentForPayment.name} — ${activeStudentForPayment.email}` : '—'}</div>
                        </div>

                        <div>
                            <Label>Courses</Label>
                            <div className="mt-2 max-h-56 overflow-y-auto rounded-md border bg-background">
                                {courses.length > 0 ? (
                                    courses.map((course) => {
                                        const checked = paymentForm.courseIds.includes(course.id)
                                        const amount = getCourseAmount(course)

                                        return (
                                            <label
                                                key={course.id}
                                                className="flex cursor-pointer items-start gap-3 border-b px-3 py-2 text-sm last:border-b-0 hover:bg-muted/40"
                                            >
                                                <Checkbox
                                                    checked={checked}
                                                    onCheckedChange={(value) => {
                                                        const nextCourseIds = value
                                                            ? [...paymentForm.courseIds, course.id]
                                                            : paymentForm.courseIds.filter(id => id !== course.id)
                                                        updatePaymentCourses(nextCourseIds)
                                                    }}
                                                    className="mt-0.5"
                                                />
                                                <span className="flex min-w-0 flex-1 flex-col">
                                                    <span className="truncate font-medium">{course.title}</span>
                                                    {course.category && (
                                                        <span className="text-xs text-muted-foreground">{course.category}</span>
                                                    )}
                                                </span>
                                                <span className="shrink-0 font-medium">₹{amount}</span>
                                            </label>
                                        )
                                    })
                                ) : (
                                    <div className="px-3 py-4 text-sm text-muted-foreground">
                                        No courses available. Create a course first, then record payment.
                                    </div>
                                )}
                            </div>
                            {paymentForm.courseIds.length > 0 && (
                                <div className="mt-2 text-xs text-muted-foreground">
                                    {paymentForm.courseIds.length} selected · Total ₹{getTotalForCourses(paymentForm.courseIds)}
                                </div>
                            )}
                        </div>

                        <div>
                            <Label>Amount</Label>
                            <Input value={paymentForm.amount} onChange={(e) => setPaymentForm(prev => ({ ...prev, amount: e.target.value }))} />
                        </div>

                        <div>
                            <Label>Payment Method</Label>
                            <Select value={paymentForm.paymentMethod} onValueChange={(v) => setPaymentForm(prev => ({ ...prev, paymentMethod: v }))}>
                                <SelectTrigger className="w-full">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="CASH">Cash</SelectItem>
                                    <SelectItem value="ONLINE">Online</SelectItem>
                                    <SelectItem value="RAZORPAY">Razorpay</SelectItem>
                                    <SelectItem value="STRIPE">Stripe</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label>Status</Label>
                            <Select value={paymentForm.status} onValueChange={(v) => setPaymentForm(prev => ({ ...prev, status: v }))}>
                                <SelectTrigger className="w-full">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="SUCCESS">Success</SelectItem>
                                    <SelectItem value="PENDING">Pending</SelectItem>
                                    <SelectItem value="FAILED">Failed</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label>Order ID (optional)</Label>
                            <Input value={paymentForm.orderId} onChange={(e) => setPaymentForm(prev => ({ ...prev, orderId: e.target.value }))} />
                        </div>

                        <div>
                            <Label>Note (optional)</Label>
                            <Textarea value={paymentForm.note} onChange={(e) => setPaymentForm(prev => ({ ...prev, note: e.target.value }))} />
                        </div>
                    </div>
                </div>

                    <DialogFooter>
                        <div className="flex items-center gap-2 w-full justify-end">
                            <Button variant="ghost" onClick={() => { setIsPaymentModalOpen(false); setActiveStudentForPayment(null); }}>Cancel</Button>
                            <Button onClick={submitPaymentForm} disabled={Boolean(recordingPaymentId) || paymentForm.courseIds.length === 0}>
                                {recordingPaymentId ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Record Payment'}
                            </Button>
                        </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Create Batch Dialog */}
            <Dialog open={isBatchModalOpen} onOpenChange={setIsBatchModalOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Create New Batch</DialogTitle>
                        <DialogDescription>
                            Create a student batch for a specific course. Batch ID will be auto-generated.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-6 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="batch-name">Batch Name</Label>
                            <Input
                                id="batch-name"
                                placeholder="e.g. Morning Batch June 2024"
                                value={batchForm.name}
                                onChange={(e) => setBatchForm(prev => ({ ...prev, name: e.target.value }))}
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="batch-course">Select Course</Label>
                            <Select 
                                value={batchForm.courseId} 
                                onValueChange={(val) => setBatchForm(prev => ({ ...prev, courseId: val, studentIds: [] }))}
                            >
                                <SelectTrigger id="batch-course">
                                    <SelectValue placeholder="Select a course to see eligible students" />
                                </SelectTrigger>
                                <SelectContent>
                                    {courses.map(course => (
                                        <SelectItem key={course.id} value={course.id}>{course.title}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {batchForm.courseId && (
                            <div className="grid gap-3">
                                <div className="flex items-center justify-between">
                                    <Label>Select Students ({batchForm.studentIds.length} selected)</Label>
                                    <div className="relative w-64">
                                        <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                                        <Input
                                            placeholder="Search students..."
                                            value={batchSearch}
                                            onChange={(e) => setBatchSearch(e.target.value)}
                                            className="pl-8 h-8 text-xs"
                                        />
                                    </div>
                                </div>
                                
                                <div className="border rounded-md max-h-[300px] overflow-y-auto">
                                    {batchStudents.length > 0 ? (
                                        <div className="divide-y">
                                            {filteredBatchStudents.map((student) => (
                                                <div 
                                                    key={student.id} 
                                                    className="flex items-center gap-3 p-3 hover:bg-muted/50 cursor-pointer"
                                                    onClick={() => {
                                                        const isSelected = batchForm.studentIds.includes(student.userId)
                                                        setBatchForm(prev => ({
                                                            ...prev,
                                                            studentIds: isSelected 
                                                                ? prev.studentIds.filter(id => id !== student.userId)
                                                                : [...prev.studentIds, student.userId]
                                                        }))
                                                    }}
                                                >
                                                    <Checkbox 
                                                        checked={batchForm.studentIds.includes(student.userId)}
                                                        onCheckedChange={() => {}} // handled by div click
                                                        className="pointer-events-none"
                                                    />
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium leading-none truncate">{student.name}</p>
                                                        <p className="text-xs text-muted-foreground truncate mt-1">{student.email}</p>
                                                    </div>
                                                    <Badge variant="outline" className="text-[10px]">
                                                        {student.phone || 'No Phone'}
                                                    </Badge>
                                                </div>
                                            ))}
                                            {filteredBatchStudents.length === 0 && (
                                                <div className="p-8 text-center text-sm text-muted-foreground">
                                                    No students found matching "{batchSearch}"
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="p-8 text-center text-sm text-muted-foreground">
                                            No active students found for this course.
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsBatchModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button 
                            onClick={handleCreateBatch} 
                            disabled={isBatchSubmitting || !batchForm.name || !batchForm.courseId || batchForm.studentIds.length === 0}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            {isBatchSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Create Batch
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

        </div>
    )
}
