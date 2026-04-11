"use client"

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import api, { courseApi, interviewApi, certificateApi, liveClassApi } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
    GraduationCap,
    Video,
    TrendingUp,
    Calendar,
    Loader2,
    LogOut,
    BookOpen,
    Download,
    Award,
    Clock,
    PlayCircle,
    Briefcase,
    ExternalLink,
    FileText,
    MapPin,
    Building2,
    CheckCircle2
} from 'lucide-react'
import { NewInterviewDialog } from '@/components/interviews/NewInterviewDialog'
import { StudentMessages } from '@/components/messages/StudentMessages'

interface Enrollment {
    id: string
    course: {
        id: string
        title: string
        thumbnail?: string
        category: string
        difficulty: string
    }
    progress?: number
    hasInterviewAccess?: boolean
}

interface Interview {
    id: string
    domain: string
    role: string
    company?: string
    difficulty: string
    status: string
    createdAt: string
    score?: number
}

interface JobInterview {
    id: string
    roundName: string
    roundType: string
    scheduledAt: string
    duration: number
    location?: string
    meetingLink?: string
    application: {
        job: {
            title: string
            employer: {
                employerProfile?: {
                    companyName: string
                }
            }
        }
    }
}

interface LiveClassMessage {
    id: string
    courseId: string
    title: string
    platform: string
    scheduledAt: string
    duration: number
    meetingLink?: string
    hostName?: string
}

interface Certificate {
    id: string
    uniqueId: string
    courseName: string
    studentName: string
    issueDate: string
    grade?: string
    score?: number
}

interface Application {
    id: string
    status: string
    createdAt: string
    job: {
        id: string
        title: string
        location: string
        type: string
        employer: {
            employerProfile: {
                companyName: string
                logo: string | null
            }
        }
    }
}

export default function DashboardPage() {
    const router = useRouter()
    const { user, isLoading: authLoading, logout } = useAuth()

    const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null
    const initialTabParam = searchParams?.get('tab')

    type TabType = 'overview' | 'learning' | 'interviews' | 'applications' | 'certificates'
    const validTabs: TabType[] = ['overview', 'learning', 'interviews', 'applications', 'certificates']

    const [activeTab, setActiveTab] = React.useState<TabType>(
        (initialTabParam && (validTabs as string[]).includes(initialTabParam))
            ? initialTabParam as TabType
            : 'overview'
    )
    const [stats, setStats] = React.useState<{
        enrollments: number;
        interviews: { total: number; completed: number; averageScore: number };
    } | null>(null)

    const [enrollments, setEnrollments] = React.useState<Enrollment[]>([])
    const [interviews, setInterviews] = React.useState<Interview[]>([])
    const [jobInterviews, setJobInterviews] = React.useState<JobInterview[]>([])
    const [courseMessages, setCourseMessages] = React.useState<Record<string, LiveClassMessage[]>>({})
    const [certificates, setCertificates] = React.useState<Certificate[]>([])
    const [applications, setApplications] = React.useState<Application[]>([])
    const [isLoading, setIsLoading] = React.useState(true)
    const [appFilter, setAppFilter] = React.useState<string>('ALL')

    React.useEffect(() => {
        if (!authLoading) {
            if (!user) {
                router.push('/login')
            } else if (user.role === 'EMPLOYER') {
                router.push('/employer/dashboard')
            } else if (user.role === 'SUPER_ADMIN' || user.role === 'ADMIN') {
                router.push('/admin')
            } else if (user.role === 'INSTRUCTOR') {
                router.push('/instructor')
            }
        }
    }, [authLoading, user, router])

    React.useEffect(() => {
        const fetchData = async () => {
            if (!user) return

            try {
                const [enrollmentsRes, interviewStatsRes, interviewsRes, jobInterviewsRes, liveClassesRes] = await Promise.all([
                    courseApi.getMyEnrollments(),
                    interviewApi.getStats(),
                    interviewApi.getAll({ page: 1 }),
                    interviewApi.getJobInterviews ? interviewApi.getJobInterviews() : Promise.resolve({ data: { interviews: [] } }),
                    liveClassApi.getAll({ upcoming: true }).catch(() => ({ data: [] as LiveClassMessage[] }))
                ])

                setEnrollments(enrollmentsRes.data.enrollments || [])
                setInterviews(interviewsRes.data.interviews || [])
                setJobInterviews(jobInterviewsRes.data.interviews || [])
                setCourseMessages(
                    (liveClassesRes.data || []).reduce((messagesByCourse: Record<string, LiveClassMessage[]>, liveClass: LiveClassMessage) => {
                        if (!messagesByCourse[liveClass.courseId]) {
                            messagesByCourse[liveClass.courseId] = []
                        }

                        messagesByCourse[liveClass.courseId].push(liveClass)
                        return messagesByCourse
                    }, {})
                )

                setStats({
                    enrollments: enrollmentsRes.data.enrollments?.length || 0,
                    interviews: interviewStatsRes.data.stats || { total: 0, completed: 0, averageScore: 0 },
                })

                // Fetch certificates and applications in background (non-blocking)
                try {
                    const certsRes = await certificateApi.getAll()
                    setCertificates(certsRes.data.certificates || certsRes.data || [])
                } catch {
                    // Certificate endpoint might fail - graceful fallback
                }

                try {
                    const appsRes = await api.get('/jobs/applications/me')
                    setApplications(appsRes.data || [])
                } catch {
                    // Applications endpoint might fail - graceful fallback
                }
            } catch {
                // Error handling
            } finally {
                setIsLoading(false)
            }
        }

        if (user) {
            fetchData()
        }
    }, [user])

    const getStatusBadge = (status: string) => {
        const statusMap: Record<string, { label: string; className: string }> = {
            APPLIED: { label: 'Applied', className: 'bg-blue-50 text-blue-700 border-blue-200' },
            UNDER_REVIEW: { label: 'Under Review', className: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
            SHORTLISTED: { label: 'Shortlisted', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
            INTERVIEW: { label: 'Interview', className: 'bg-purple-50 text-purple-700 border-purple-200' },
            OFFERED: { label: 'Offered', className: 'bg-green-50 text-green-700 border-green-200' },
            HIRED: { label: 'Hired', className: 'bg-green-50 text-green-800 border-green-300' },
            REJECTED: { label: 'Rejected', className: 'bg-red-50 text-red-700 border-red-200' },
            WITHDRAWN: { label: 'Withdrawn', className: 'bg-gray-50 text-gray-600 border-gray-200' },
        }
        const s = statusMap[status] || { label: status, className: 'bg-gray-50 text-gray-700 border-gray-200' }
        return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${s.className}`}>{s.label}</span>
    }

    const filteredApplications = appFilter === 'ALL'
        ? applications
        : applications.filter(app => app.status === appFilter)

    if (authLoading || !user) {
        return (
            <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-background relative overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-primary/5 rounded-full blur-[100px] opacity-40 animate-pulse" />
                    <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-[100px] opacity-40" />
                </div>
                <Loader2 className="h-8 w-8 animate-spin text-primary relative z-10" />
            </div>
        )
    }

    return (
        <div className="relative min-h-screen bg-background overflow-hidden">
            {/* Background Decor */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-primary/5 rounded-full blur-[100px]" />
                <div className="absolute bottom-[20%] right-[-5%] w-[500px] h-[500px] bg-teal-500/5 rounded-full blur-[100px]" />
            </div>

            <div className="container py-8 relative z-10">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tight">
                            Welcome, <span className="text-foreground">{user.name}</span>!
                        </h1>
                        <p className="text-muted-foreground mt-1 text-lg">Track your progress and manage your learning journey.</p>
                    </div>
                    <div className="flex gap-3">
                        <Button variant="outline" className="hover:bg-muted/80" onClick={() => router.push('/profile')}>
                            Profile Settings
                        </Button>
                        <Button variant="ghost" className="text-red-500 hover:text-red-600 hover:bg-red-50/50" onClick={logout}>
                            <LogOut className="mr-2 h-4 w-4" />
                            Logout
                        </Button>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="flex gap-1 mb-8 p-1.5 bg-muted/50 border border-border/50 rounded-xl overflow-x-auto">
                    {[
                        { id: 'overview', label: 'Overview', icon: TrendingUp },
                        { id: 'learning', label: 'My Learning', icon: BookOpen },
                        { id: 'messages', label: 'Messages', icon:BookOpen },
                        { id: 'interviews', label: 'Interviews', icon: Video },
                        { id: 'applications', label: 'Applications', icon: Briefcase, count: applications.length },
                        { id: 'certificates', label: 'Certificates', icon: Award, count: certificates.length },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as typeof activeTab)}
                            className={`px-5 py-2.5 rounded-lg font-medium transition-all duration-300 flex items-center gap-2 whitespace-nowrap text-sm ${activeTab === tab.id
                                ? 'bg-primary text-white shadow-lg shadow-primary/25'
                                : 'text-muted-foreground hover:bg-background hover:text-foreground'
                                }`}
                        >
                            <tab.icon className="h-4 w-4" />
                            {tab.label}
                            {tab.count !== undefined && tab.count > 0 && (
                                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${activeTab === tab.id
                                    ? 'bg-white/20 text-white'
                                    : 'bg-primary/10 text-primary'
                                    }`}>
                                    {tab.count}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                {/* PROMINENT UPCOMING INTERVIEWS BANNER */}
                {jobInterviews.length > 0 && (
                    <div className="mb-8 bg-card border border-border rounded-2xl p-6 border-l-4 border-l-primary relative overflow-hidden animate-in fade-in slide-in-from-top-2 duration-500">
                        <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-full blur-3xl" />

                        <div className="flex items-center gap-3 mb-4 relative z-10">
                            <div className="p-2 bg-primary/10 rounded-xl">
                                <Calendar className="h-6 w-6 text-primary animate-pulse" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-foreground">Upcoming Interviews</h2>
                                <p className="text-sm text-muted-foreground">You have {jobInterviews.length} scheduled interview{jobInterviews.length > 1 ? 's' : ''}</p>
                            </div>
                        </div>

                        <div className="space-y-3 relative z-10">
                            {jobInterviews.slice(0, 3).map((interview) => {
                                const interviewDate = new Date(interview.scheduledAt);
                                const isToday = interviewDate.toDateString() === new Date().toDateString();
                                const isTomorrow = interviewDate.toDateString() === new Date(Date.now() + 86400000).toDateString();
                                const isPast = interviewDate < new Date();
                                const isWithinHour = !isPast && (interviewDate.getTime() - Date.now()) < 3600000;
                                let borderClass = 'border-border';
                                if (isWithinHour) {
                                    borderClass = 'border-green-500 shadow-lg shadow-green-500/10';
                                } else if (isToday) {
                                    borderClass = 'border-primary/50';
                                }

                                return (
                                    <div
                                        key={interview.id}
                                        className={`flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl bg-background border ${borderClass}`}
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className={`flex flex-col items-center justify-center p-3 rounded-xl min-w-[70px] ${isWithinHour ? 'bg-green-50 text-green-700' :
                                                isToday ? 'bg-primary/10 text-primary' :
                                                    isTomorrow ? 'bg-blue-50 text-blue-700' :
                                                        'bg-muted text-muted-foreground'
                                                }`}>
                                                <span className="text-xs font-medium uppercase">
                                                    {isToday ? 'Today' : isTomorrow ? 'Tomorrow' : interviewDate.toLocaleDateString('en-US', { weekday: 'short' })}
                                                </span>
                                                <span className="text-2xl font-bold">{interviewDate.getDate()}</span>
                                                <span className="text-xs">{interviewDate.toLocaleDateString('en-US', { month: 'short' })}</span>
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-lg text-foreground">{interview.application?.job?.title || interview.roundName}</h3>
                                                <p className="text-sm text-muted-foreground">
                                                    {interview.application?.job?.employer?.employerProfile?.companyName || 'Company'} • {interview.roundName}
                                                </p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <Clock className="h-3 w-3 text-muted-foreground" />
                                                    <span className="text-sm font-medium text-foreground">
                                                        {interviewDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} ({interview.duration} min)
                                                    </span>
                                                    {isWithinHour && (
                                                        <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full font-medium animate-pulse">
                                                            Starting Soon!
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex gap-2 md:flex-shrink-0">
                                            {interview.meetingLink ? (
                                                <Button
                                                    size="lg"
                                                    className={`gap-2 font-semibold ${isWithinHour
                                                        ? 'bg-green-600 hover:bg-green-700 shadow-lg shadow-green-500/20'
                                                        : 'bg-primary hover:bg-primary/90'
                                                        }`}
                                                    onClick={() => window.open(interview.meetingLink, '_blank')}
                                                >
                                                    <Video className="h-4 w-4" />
                                                    {isWithinHour ? 'Join Now' : 'Join Meeting'}
                                                </Button>
                                            ) : (
                                                <Button size="lg" variant="outline" className="gap-2" disabled>
                                                    <Video className="h-4 w-4" />
                                                    Link pending...
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}

                            {jobInterviews.length > 3 && (
                                <Button variant="link" className="w-full text-primary" onClick={() => setActiveTab('interviews')}>
                                    View all {jobInterviews.length} interviews →
                                </Button>
                            )}
                        </div>
                    </div>
                )}

                {isLoading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    </div>
                ) : (
                    <div>
                        {/* OVERVIEW TAB */}
                        {activeTab === 'overview' && (
                            <div className="space-y-8">
                                {/* Stats Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                    {[
                                        { label: 'Enrolled Courses', value: stats?.enrollments || 0, icon: GraduationCap, bgClass: 'bg-blue-500/10 text-blue-600', gradientClass: 'via-blue-500' },
                                        { label: 'Total Interviews', value: stats?.interviews.total || 0, icon: Video, bgClass: 'bg-purple-500/10 text-purple-600', gradientClass: 'via-purple-500' },
                                        { label: 'Completed', value: stats?.interviews.completed || 0, icon: CheckCircle2, bgClass: 'bg-teal-500/10 text-teal-600', gradientClass: 'via-teal-500' },
                                        { label: 'Avg Score', value: `${Math.round(stats?.interviews.averageScore || 0)}%`, icon: TrendingUp, bgClass: 'bg-green-500/10 text-green-600', gradientClass: 'via-green-500' },
                                    ].map((stat) => (
                                        <div key={stat.label} className="bg-card border border-border p-6 rounded-2xl relative overflow-hidden group hover:-translate-y-1 transition-all duration-300 hover:shadow-md">
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                                                    <h3 className="text-3xl font-bold mt-2 text-foreground">{stat.value}</h3>
                                                </div>
                                                <div className={`p-3 rounded-xl ${stat.bgClass}`}>
                                                    <stat.icon className="h-6 w-6" />
                                                </div>
                                            </div>
                                            <div className={`absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity ${stat.gradientClass}`} />
                                        </div>
                                    ))}
                                </div>

                                {/* Recent Activity / Quick Actions */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="bg-card border border-border p-6 rounded-2xl">
                                        <div className="flex flex-col gap-1 mb-6">
                                            <h3 className="text-xl font-bold text-foreground">Continue Learning</h3>
                                            <p className="text-sm text-muted-foreground">Pick up where you left off</p>
                                        </div>

                                        <div className="space-y-3">
                                            {enrollments.length > 0 ? (
                                                <>
                                                    {enrollments.slice(0, 3).map((enrollment) => (
                                                        <div key={enrollment.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-muted/50 transition-colors border border-transparent hover:border-border">
                                                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                                                <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                                                                    <BookOpen className="h-5 w-5 text-primary" />
                                                                </div>
                                                                <div className="min-w-0">
                                                                    <h4 className="font-medium line-clamp-1 text-foreground">{enrollment.course.title}</h4>
                                                                    <p className="text-xs text-muted-foreground">{enrollment.course.category} • {enrollment.progress || 0}% complete</p>
                                                                </div>
                                                            </div>
                                                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0 rounded-full flex-shrink-0" onClick={() => router.push(`/courses/${enrollment.course.id}/learn`)}>
                                                                <PlayCircle className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    ))}
                                                    <Button variant="link" className="px-0 w-full text-primary" onClick={() => setActiveTab('learning')}>
                                                        View All Courses
                                                    </Button>
                                                </>
                                            ) : (
                                                <div className="text-center py-6">
                                                    <p className="text-muted-foreground mb-4">No courses enrolled yet.</p>
                                                    <Button onClick={() => router.push('/courses')}>Browse Courses</Button>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="bg-card border border-border p-6 rounded-2xl">
                                        <div className="flex flex-col gap-1 mb-6">
                                            <h3 className="text-xl font-bold text-foreground">Interview Practice</h3>
                                            <p className="text-sm text-muted-foreground">Recent mock interviews</p>
                                        </div>

                                        <div className="space-y-3">
                                            {interviews.length > 0 ? (
                                                <>
                                                    {interviews.slice(0, 3).map((interview) => (
                                                        <div key={interview.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-muted/50 transition-colors border border-transparent hover:border-border">
                                                            <div>
                                                                <h4 className="font-medium text-foreground">{interview.role}</h4>
                                                                <p className="text-xs text-muted-foreground">{interview.domain} • {new Date(interview.createdAt).toLocaleDateString()}</p>
                                                            </div>
                                                            <span className={`text-xs px-2.5 py-1 rounded-full font-medium border ${interview.status === 'COMPLETED' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                                                                }`}>
                                                                {interview.status === 'COMPLETED' ? `${interview.score || 0}%` : interview.status}
                                                            </span>
                                                        </div>
                                                    ))}
                                                    <Button variant="link" className="px-0 w-full text-primary" onClick={() => setActiveTab('interviews')}>
                                                        View All Interviews
                                                    </Button>
                                                </>
                                            ) : (
                                                <div className="text-center py-6">
                                                    <p className="text-muted-foreground mb-4">No interviews taken yet.</p>
                                                    <NewInterviewDialog trigger={<Button variant="outline">Start Interview</Button>} />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <StudentMessages />
                            </div>
                        )}

                        {/* MY LEARNING TAB */}
                        {activeTab === 'learning' && (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="md:col-span-2">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {enrollments.map((enrollment) => {
                                    const progress = enrollment.progress || 0
                                    const courseLiveMessages = courseMessages[enrollment.course.id] || []
                                    return (
                                        <div
                                            key={enrollment.id}
                                            className="bg-card border border-border p-0 rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer"
                                            onClick={() => router.push(`/courses/${enrollment.course.id}/learn`)}
                                        >
                                            <div className="p-6 pb-2">
                                                <div className="flex justify-between items-start">
                                                    <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                                                        <GraduationCap className="h-5 w-5 text-primary" />
                                                    </div>
                                                    <span className="text-xs px-2 py-1 bg-muted rounded-full border border-border font-medium text-muted-foreground">
                                                        {enrollment.course.difficulty}
                                                    </span>
                                                </div>
                                                <h3 className="text-lg font-bold line-clamp-1 mb-1 text-foreground">{enrollment.course.title}</h3>
                                                <p className="text-sm text-muted-foreground">{enrollment.course.category}</p>
                                            </div>
                                            <div className="p-6 pt-2">
                                                <div className="w-full bg-muted h-2 rounded-full mb-4 overflow-hidden">
                                                    <div
                                                        className={`h-2 rounded-full transition-all duration-500 ${progress === 100 ? 'bg-green-500' : 'bg-primary'}`}
                                                        style={{ width: `${progress}%` }}
                                                    />
                                                </div>
                                                <div className="flex justify-between items-center text-sm">
                                                    <span className="text-muted-foreground">Progress</span>
                                                    <span className={`font-bold ${progress === 100 ? 'text-green-600' : 'text-foreground'}`}>{progress}%</span>
                                                </div>

                                                {courseLiveMessages.length > 0 && (
                                                    <div className="mt-4 pt-4 border-t border-border space-y-3">
                                                        <div className="flex items-center justify-between gap-2">
                                                            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                                                                <Calendar className="h-4 w-4 text-primary" />
                                                                <span>Course Meetings</span>
                                                            </div>
                                                            <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                                                                {courseLiveMessages.length}
                                                            </Badge>
                                                        </div>

                                                        {courseLiveMessages.slice(0, 2).map((liveClass) => (
                                                            <div key={liveClass.id} className="rounded-xl border border-primary/15 bg-primary/5 p-3 space-y-3">
                                                                <div className="flex items-start justify-between gap-3">
                                                                    <div className="min-w-0">
                                                                        <p className="font-semibold text-sm text-foreground line-clamp-2">
                                                                            {liveClass.title}
                                                                        </p>
                                                                        <p className="text-xs text-muted-foreground mt-1">
                                                                            Sent by {liveClass.hostName || 'Super Admin'}
                                                                        </p>
                                                                    </div>
                                                                    <Badge variant="outline" className="text-[10px] uppercase tracking-wide">
                                                                        {liveClass.platform.replace(/_/g, ' ')}
                                                                    </Badge>
                                                                </div>

                                                                <div className="space-y-1.5 text-xs text-muted-foreground">
                                                                    <div className="flex items-center gap-2">
                                                                        <Calendar className="h-3.5 w-3.5 text-primary" />
                                                                        <span>{new Date(liveClass.scheduledAt).toLocaleDateString()}</span>
                                                                    </div>
                                                                    <div className="flex items-center gap-2">
                                                                        <Clock className="h-3.5 w-3.5 text-primary" />
                                                                        <span>
                                                                            {new Date(liveClass.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {liveClass.duration} mins
                                                                        </span>
                                                                    </div>
                                                                </div>

                                                                <div className="flex items-center gap-2">
                                                                    <Button
                                                                        size="sm"
                                                                        variant="outline"
                                                                        onClick={(event) => {
                                                                            event.stopPropagation()
                                                                            router.push(`/courses/${enrollment.course.id}/learn`)
                                                                        }}
                                                                    >
                                                                        <BookOpen className="mr-2 h-3.5 w-3.5" />
                                                                        Open Course
                                                                    </Button>
                                                                    {liveClass.meetingLink ? (
                                                                        <Button
                                                                            size="sm"
                                                                            onClick={(event) => {
                                                                                event.stopPropagation()
                                                                                window.open(liveClass.meetingLink, '_blank', 'noopener,noreferrer')
                                                                            }}
                                                                        >
                                                                            <ExternalLink className="mr-2 h-3.5 w-3.5" />
                                                                            Join
                                                                        </Button>
                                                                    ) : (
                                                                        <span className="text-xs text-muted-foreground">Meeting link will appear soon.</span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        ))}

                                                        {courseLiveMessages.length > 2 && (
                                                            <p className="text-xs text-muted-foreground">
                                                                +{courseLiveMessages.length - 2} more scheduled session{courseLiveMessages.length - 2 > 1 ? 's' : ''} for this course.
                                                            </p>
                                                        )}
                                                    </div>
                                                )}

                                                {enrollment.hasInterviewAccess && (
                                                    <div className="mt-4 pt-4 border-t border-border">
                                                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                                            <Video className="h-3 w-3" />
                                                            <span>Interview Prep Available</span>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )
                                })}
                                {enrollments.length === 0 && (
                                    <div className="col-span-full text-center py-20">
                                        <GraduationCap className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
                                        <h3 className="text-xl font-medium mb-2 text-foreground">No Courses Yet</h3>
                                        <p className="text-muted-foreground mb-6">Start your learning journey today.</p>
                                        <Button size="lg" onClick={() => router.push('/courses')}>
                                            Browse Catalog
                                        </Button>
                                    </div>
                                )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* INTERVIEWS TAB */}
                        {activeTab === 'interviews' && (
                            <div className="space-y-6">
                                <div className="flex justify-between items-center">
                                    <h2 className="text-2xl font-bold text-foreground">Interview History</h2>
                                    <NewInterviewDialog />
                                </div>

                                {/* Scheduled Job Interviews Section */}
                                {jobInterviews.length > 0 && (
                                    <div className="bg-card border border-border rounded-xl p-6 border-l-4 border-l-blue-500 mb-6 relative overflow-hidden">
                                        <div className="absolute top-0 right-0 p-4 opacity-5">
                                            <Calendar className="w-24 h-24" />
                                        </div>
                                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-foreground">
                                            <Calendar className="h-5 w-5 text-blue-500" />
                                            Upcoming Scheduled Interviews
                                        </h3>
                                        <div className="grid gap-4">
                                            {jobInterviews.map((interview) => (
                                                <div key={interview.id} className="bg-muted/30 p-4 rounded-lg border border-border flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                                    <div>
                                                        <h4 className="font-bold text-lg text-foreground">{interview.roundName}</h4>
                                                        <p className="text-muted-foreground">{interview.application.job.title} at <span className="text-foreground font-medium">{interview.application.job.employer.employerProfile?.companyName || 'Company'}</span></p>
                                                        <div className="flex flex-wrap gap-4 mt-2 text-sm">
                                                            <div className="flex items-center gap-1 text-foreground">
                                                                <Calendar className="h-4 w-4 text-blue-500" />
                                                                {new Date(interview.scheduledAt).toLocaleDateString()}
                                                            </div>
                                                            <div className="flex items-center gap-1 text-foreground">
                                                                <Clock className="h-4 w-4 text-blue-500" />
                                                                {new Date(interview.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({interview.duration} mins)
                                                            </div>
                                                            {interview.location && (
                                                                <div className="flex items-center gap-1 text-muted-foreground">
                                                                    <MapPin className="h-4 w-4" /> {interview.location}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-col items-end gap-2">
                                                        <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium border border-blue-200">
                                                            {interview.roundType}
                                                        </span>
                                                        {interview.meetingLink && (
                                                            <Button size="sm" onClick={() => window.open(interview.meetingLink, '_blank')}>
                                                                <Video className="mr-1 h-3 w-3" /> Join Meeting
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="bg-card border border-border rounded-2xl p-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {interviews.map(interview => (
                                            <div key={interview.id} className="p-4 rounded-xl border border-border bg-background hover:bg-muted/30 transition-colors">
                                                <div className="flex justify-between mb-2">
                                                    <span className="text-xs text-muted-foreground">{new Date(interview.createdAt).toLocaleDateString()}</span>
                                                    <span className={`text-xs px-2 py-1 rounded-full font-medium border ${interview.status === 'COMPLETED' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-blue-50 text-blue-700 border-blue-200'
                                                        }`}>
                                                        {interview.status}
                                                    </span>
                                                </div>
                                                <h3 className="font-bold text-base mb-1 text-foreground">{interview.role}</h3>
                                                <p className="text-xs text-muted-foreground mb-3">{interview.domain}</p>

                                                {interview.status === 'COMPLETED' && (
                                                    <div className="mb-4 flex items-baseline gap-1">
                                                        <span className="text-2xl font-bold text-primary">{interview.score || 0}%</span>
                                                        <span className="text-xs text-muted-foreground">Score</span>
                                                    </div>
                                                )}
                                                {(() => {
                                                    const pathSuffix = interview.status === 'COMPLETED' ? '/report' : ''
                                                    return (
                                                        <Button variant="outline" className="w-full" size="sm" onClick={() => router.push(`/interviews/${interview.id}${pathSuffix}`)}>
                                                            {interview.status === 'COMPLETED' ? 'View Report' : 'Resume'}
                                                        </Button>
                                                    )
                                                })()}
                                            </div>
                                        ))}
                                        {interviews.length === 0 && (
                                            <div className="col-span-full py-12 text-center">
                                                <Video className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                                                <h3 className="text-lg font-medium mb-2 text-foreground">No Interviews Yet</h3>
                                                <p className="text-muted-foreground mb-4">Practice with AI-powered mock interviews.</p>
                                                <NewInterviewDialog trigger={<Button>Start Your First Interview</Button>} />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* APPLICATIONS TAB */}
                        {activeTab === 'applications' && (
                            <div className="space-y-6">
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                    <div>
                                        <h2 className="text-2xl font-bold text-foreground">My Applications</h2>
                                        <p className="text-muted-foreground text-sm">{applications.length} total application{applications.length !== 1 ? 's' : ''}</p>
                                    </div>
                                    <Button onClick={() => router.push('/jobs')} variant="outline">
                                        <Briefcase className="mr-2 h-4 w-4" /> Find Jobs
                                    </Button>
                                </div>

                                {/* Status Filter */}
                                {applications.length > 0 && (
                                    <div className="flex gap-2 overflow-x-auto pb-1">
                                        {['ALL', 'APPLIED', 'UNDER_REVIEW', 'SHORTLISTED', 'INTERVIEW', 'OFFERED', 'REJECTED'].map((status) => {
                                            const count = status === 'ALL' ? applications.length : applications.filter(a => a.status === status).length
                                            if (count === 0 && status !== 'ALL') return null
                                            return (
                                                <button
                                                    key={status}
                                                    onClick={() => setAppFilter(status)}
                                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap border ${appFilter === status
                                                        ? 'bg-primary text-white border-primary'
                                                        : 'bg-background text-muted-foreground border-border hover:bg-muted/50'
                                                        }`}
                                                >
                                                    {status === 'ALL' ? 'All' : status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} ({count})
                                                </button>
                                            )
                                        })}
                                    </div>
                                )}

                                {/* Applications List */}
                                <div className="space-y-3">
                                    {filteredApplications.map((app) => (
                                        <div key={app.id} className="bg-card border border-border rounded-xl p-5 hover:shadow-md transition-all duration-200">
                                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                                <div className="flex items-start gap-4">
                                                    <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                                                        <Building2 className="h-6 w-6 text-primary" />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-bold text-foreground text-lg">{app.job.title}</h3>
                                                        <p className="text-sm text-muted-foreground">
                                                            {app.job.employer?.employerProfile?.companyName || 'Company'}
                                                        </p>
                                                        <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                                                            {app.job.location && (
                                                                <span className="flex items-center gap-1">
                                                                    <MapPin className="h-3 w-3" /> {app.job.location}
                                                                </span>
                                                            )}
                                                            <span className="flex items-center gap-1">
                                                                <Briefcase className="h-3 w-3" /> {app.job.type}
                                                            </span>
                                                            <span className="flex items-center gap-1">
                                                                <Clock className="h-3 w-3" /> Applied {new Date(app.createdAt).toLocaleDateString()}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3 md:flex-shrink-0">
                                                    {getStatusBadge(app.status)}
                                                    <Button variant="ghost" size="sm" onClick={() => router.push(`/jobs/${app.job.id}`)}>
                                                        <ExternalLink className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                    {applications.length === 0 && (
                                        <div className="text-center py-20 bg-card border border-border rounded-2xl">
                                            <Briefcase className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
                                            <h3 className="text-xl font-medium mb-2 text-foreground">No Applications Yet</h3>
                                            <p className="text-muted-foreground mb-6 max-w-sm mx-auto">Start applying to jobs and track your applications here.</p>
                                            <Button size="lg" onClick={() => router.push('/jobs')}>
                                                <Briefcase className="mr-2 h-4 w-4" /> Browse Jobs
                                            </Button>
                                        </div>
                                    )}

                                    {applications.length > 0 && filteredApplications.length === 0 && (
                                        <div className="text-center py-12 bg-card border border-border rounded-2xl">
                                            <FileText className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                                            <p className="text-muted-foreground">No applications with this status.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* CERTIFICATES TAB */}
                        {activeTab === 'certificates' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {certificates.map((cert) => (
                                    <div key={cert.id} className="bg-card border border-border p-6 rounded-2xl border-l-[6px] border-l-yellow-500 relative overflow-hidden group hover:shadow-md transition-all">
                                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                            <Award className="w-24 h-24" />
                                        </div>
                                        <div className="h-12 w-12 bg-yellow-50 rounded-full flex items-center justify-center mb-4">
                                            <Award className="h-6 w-6 text-yellow-600" />
                                        </div>
                                        <h3 className="text-lg font-bold mb-1 text-foreground">{cert.courseName}</h3>
                                        <p className="text-sm text-muted-foreground mb-4">Certificate of Completion</p>

                                        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2 bg-muted/50 p-2 rounded border border-border">
                                            <Clock className="h-3 w-3" />
                                            Issued: {new Date(cert.issueDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4 bg-muted/50 p-2 rounded border border-border font-mono">
                                            ID: {cert.uniqueId}
                                        </div>

                                        {cert.score && (
                                            <div className="mb-4 text-sm">
                                                <span className="text-muted-foreground">Score: </span>
                                                <span className="font-bold text-foreground">{cert.score}%</span>
                                            </div>
                                        )}

                                        <Button size="sm" variant="outline" className="w-full" onClick={() => router.push(`/certificate/${cert.id}`)}>
                                            <Download className="h-4 w-4 mr-2" />
                                            View Certificate
                                        </Button>
                                    </div>
                                ))}
                                {certificates.length === 0 && (
                                    <div className="col-span-full text-center py-20 bg-card border border-border rounded-2xl">
                                        <Award className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
                                        <h3 className="text-lg font-medium mb-2 text-foreground">No Certificates Yet</h3>
                                        <p className="text-muted-foreground mb-6">Complete courses to earn your certificates.</p>
                                        <Button onClick={() => setActiveTab('learning')}>
                                            <BookOpen className="mr-2 h-4 w-4" /> Go to My Learning
                                        </Button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}