"use client"

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import api, { interviewApi, userApi } from '@/lib/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
    Users,
    GraduationCap,
    Video,
    TrendingUp,
    Search,
    Loader2,
    BarChart3,
    BrainCircuit,
    Magnet,
    Building2,
    Activity,
    Plus,
    Calendar,
    Briefcase
} from 'lucide-react'
import dynamic from 'next/dynamic'
import { AdminReportModal } from '@/components/admin/report-modal'

const AdminCharts = dynamic(() => import('@/components/admin/AdminCharts').then(mod => mod.AdminCharts), {
    loading: () => <div className="h-[400px] w-full bg-muted/20 animate-pulse rounded-2xl flex items-center justify-center text-muted-foreground text-sm">Loading Analytics...</div>,
    ssr: false
})


// Simple Alert Component if toast missing


interface User {
    id: string
    email: string
    name: string
    role: string
    isActive: boolean
    createdAt: string
    _count?: { enrollments: number; interviews: number }
}

interface Course {
    id: string
    title: string
    category: string
    isPublished: boolean
    _count?: { enrollments: number }
}

import { InstituteSwitcher } from '@/components/admin/InstituteSwitcher'

export default function AdminDashboard() {
    const router = useRouter()
    const { user, isAuthenticated, isLoading: authLoading, hasPermission } = useAuth()
    // ...

    const [users, setUsers] = React.useState<User[]>([])
    const [_courses, setCourses] = React.useState<Course[]>([])

    const [stats, setStats] = React.useState({
        users: 0,
        courses: 0,
        enrollments: 0,
        interviews: 0,
        leads: 0,
        campusDrives: 0,
        revenue: 0,
        recentActivity: [] as any[]
    })

    const [isLoading, setIsLoading] = React.useState(true)
    const [searchQuery, _setSearchQuery] = React.useState('')
    // const [activeTab, setActiveTab] = React.useState<'overview' | 'users' | 'courses' | 'ai-training'>('overview')

    // AI Training State
    const [trainingData, setTrainingData] = React.useState({
        domain: 'IT',
        topic: '',
        difficulty: 'INTERMEDIATE',
        content: ''
    })
    const [_isTraining, setIsTraining] = React.useState(false)
    const [_trainMessage, setTrainMessage] = React.useState<{ msg: string, type: 'success' | 'error' } | null>(null)

    React.useEffect(() => {
        if (!authLoading && (!isAuthenticated || !['SUPER_ADMIN', 'ADMIN', 'INSTITUTE_ADMIN', 'STAFF', 'INSTRUCTOR', 'EMPLOYER'].includes(user?.role || ''))) {
            router.push('/dashboard')
        }
    }, [authLoading, isAuthenticated, user, router])

    React.useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch basic lists AND real stats
                const [usersRes, coursesRes, statsRes] = await Promise.allSettled([
                    hasPermission('USERS') ? api.get('/users') : Promise.resolve({ data: { users: [] } }),
                    hasPermission('COURSES') ? api.get('/courses') : Promise.resolve({ data: { courses: [] } }),
                    userApi.getAdminStats() // This endpoint uses authorize() so it's safer
                ])

                if (usersRes.status === 'fulfilled') {
                    setUsers(usersRes.value.data.users || [])
                }
                if (coursesRes.status === 'fulfilled') {
                    setCourses(coursesRes.value.data.courses || [])
                }
                if (statsRes.status === 'fulfilled') {
                    setStats(statsRes.value.data)
                }

            } catch (error) {
                console.error('Failed to fetch data:', error)
            } finally {
                setIsLoading(false)
            }
        }

        if (isAuthenticated && ['SUPER_ADMIN', 'ADMIN', 'INSTITUTE_ADMIN', 'STAFF'].includes(user?.role || '')) {
            fetchData()
        }
    }, [isAuthenticated, user, hasPermission])

    const _toggleUserStatus = async (userId: string, isActive: boolean) => {
        try {
            await api.patch(`/users/${userId}/status`, { isActive: !isActive })
            setUsers(users.map(u => u.id === userId ? { ...u, isActive: !isActive } : u))
        } catch (error) {
            console.error('Failed to update user status:', error)
        }
    }

    const _handleTrainAI = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!trainingData.topic || !trainingData.content) return

        setIsTraining(true)
        setTrainMessage(null)
        try {
            await interviewApi.trainAI(trainingData)
            setTrainMessage({ msg: 'Knowledge base updated successfully!', type: 'success' })
            setTrainingData(prev => ({ ...prev, topic: '', content: '' })) // Reset form
        } catch (error) {
            console.error('Training failed:', error)
            setTrainMessage({ msg: 'Failed to update knowledge base.', type: 'error' })
        } finally {
            setIsTraining(false)
        }
    }

    const _filteredUsers = searchQuery
        ? users.filter(u =>
            u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            u.email.toLowerCase().includes(searchQuery.toLowerCase())
        )
        : users



    // Only check if user exists and is not a student
    // Layout already handles the detailed loading and redirect logic
    if (!user || user.role === 'STUDENT') {
        return null;
    }

    // ... existing imports

    return (
        <div className="space-y-8">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
                        Dashboard Overview
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        Welcome back, {user?.name}. Here&apos;s your platform at a glance.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    {/* Institute Switcher for Super Admin */}
                    {user?.role === 'SUPER_ADMIN' && <InstituteSwitcher />}

                    {/* Placeholder for DateRangePicker */}
                    <Button variant="outline">Last 30 Days</Button>
                    <AdminReportModal>
                        <Button>
                            <BarChart3 className="mr-2 h-4 w-4" /> Generate Report
                        </Button>
                    </AdminReportModal>
                </div>
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : (
                <div className="space-y-8">
                    {/* Advanced Stats Grid */}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                        {hasPermission('FINANCE') && (
                            <Card
                                className="cursor-pointer hover:shadow-lg transition-all border-l-4 border-l-green-500 hover:-translate-y-1 col-span-1 xl:col-span-2"
                                onClick={() => router.push('/admin/finance')}
                            >
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-sm font-medium text-muted-foreground">
                                        Total Revenue
                                    </CardTitle>
                                    <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold">₹</div>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">₹{stats.revenue.toLocaleString()}</div>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        +20.1% from last month
                                    </p>
                                </CardContent>
                            </Card>
                        )}

                        <Card
                            className="cursor-pointer hover:shadow-lg transition-all border-l-4 border-l-blue-500 hover:-translate-y-1"
                            onClick={() => router.push('/admin/roles')}
                        >
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    Total Users
                                </CardTitle>
                                <Users className="h-4 w-4 text-blue-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.users}</div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    +180 new this month
                                </p>
                            </CardContent>
                        </Card>

                        <Card
                            className="cursor-pointer hover:shadow-lg transition-all border-l-4 border-l-orange-500 hover:-translate-y-1"
                            onClick={() => router.push('/admin/courses')}
                        >
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    Active Enrollments
                                </CardTitle>
                                <GraduationCap className="h-4 w-4 text-orange-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.enrollments}</div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Across {stats.courses} active courses
                                </p>
                            </CardContent>
                        </Card>
                        
                        <Card
                            className="cursor-pointer hover:shadow-lg transition-all border-l-4 border-l-purple-500 hover:-translate-y-1"
                            onClick={() => router.push('/admin/leads')}
                        >
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    CRM Leads
                                </CardTitle>
                                <Magnet className="h-4 w-4 text-purple-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.leads || 0}</div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Active prospects in pipeline
                                </p>
                            </CardContent>
                        </Card>

                        <Card
                            className="cursor-pointer hover:shadow-lg transition-all border-l-4 border-l-indigo-500 hover:-translate-y-1"
                            onClick={() => router.push('/admin/campus-drives')}
                        >
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    Campus Drives
                                </CardTitle>
                                <Building2 className="h-4 w-4 text-indigo-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.campusDrives || 0}</div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Ongoing hiring drives
                                </p>
                            </CardContent>
                        </Card>
                    </div>


                    {/* Charts & Quick Actions Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Charts Area */}
                        <div className="lg:col-span-2 space-y-6">
                            <AdminCharts stats={stats} />
                        </div>

                        {/* Right Sidebar Area: Activity & Actions */}
                        <div className="space-y-6">
                            {/* Quick Actions */}
                            <Card className="border-t-4 border-t-blue-500">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-lg">Quick Actions</CardTitle>
                                </CardHeader>
                                <CardContent className="grid grid-cols-2 gap-3">
                                    <Button variant="outline" className="h-20 flex-col gap-2 bg-slate-50 dark:bg-slate-900/50 hover:border-blue-500 hover:text-blue-600" onClick={() => router.push('/admin/blogs/editor')}>
                                        <Plus className="h-5 w-5" />
                                        <span className="text-xs">Create Blog</span>
                                    </Button>
                                    <Button variant="outline" className="h-20 flex-col gap-2 bg-slate-50 dark:bg-slate-900/50 hover:border-indigo-500 hover:text-indigo-600" onClick={() => router.push('/admin/campus-drives')}>
                                        <Building2 className="h-5 w-5" />
                                        <span className="text-xs">New Drive</span>
                                    </Button>
                                    <Button variant="outline" className="h-20 flex-col gap-2 bg-slate-50 dark:bg-slate-900/50 hover:border-purple-500 hover:text-purple-600" onClick={() => router.push('/admin/crm/pipelines')}>
                                        <Briefcase className="h-5 w-5" />
                                        <span className="text-xs">Pipeline</span>
                                    </Button>
                                    <Button variant="outline" className="h-20 flex-col gap-2 bg-slate-50 dark:bg-slate-900/50 hover:border-orange-500 hover:text-orange-600" onClick={() => router.push('/admin/events')}>
                                        <Calendar className="h-5 w-5" />
                                        <span className="text-xs">New Event</span>
                                    </Button>
                                </CardContent>
                            </Card>

                            {/* Recent Activity */}
                            <Card className="h-[400px] flex flex-col">
                                <CardHeader className="pb-3 border-b">
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <Activity className="h-5 w-5 text-blue-500" />
                                        Recent Activity
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="flex-1 overflow-y-auto p-0">
                                    {stats.recentActivity && stats.recentActivity.length > 0 ? (
                                        <div className="divide-y">
                                            {stats.recentActivity.map((activity, i) => (
                                                <div key={i} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors flex gap-4 items-start">
                                                    <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-full mt-1 shrink-0">
                                                        <GraduationCap className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium">
                                                            <span className="font-bold">{activity.user?.name}</span> enrolled in <span className="font-bold text-blue-600">{activity.course?.title}</span>
                                                        </p>
                                                        <p className="text-xs text-muted-foreground mt-1">
                                                            {new Date(activity.enrolledAt).toLocaleDateString()} at {new Date(activity.enrolledAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                                            No recent activity found.
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
