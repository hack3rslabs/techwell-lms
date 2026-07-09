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
    Briefcase,
    Zap,
    CheckSquare,
    LifeBuoy
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
        activeTasks: 0,
        activeTickets: 0,
        activeProjects: 0,
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
                <div className="flex items-center justify-center py-32">
                    <div className="relative">
                        <div className="h-16 w-16 rounded-full border-t-2 border-b-2 border-indigo-600 animate-spin"></div>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-8 w-8 bg-indigo-500/20 rounded-full animate-pulse"></div>
                    </div>
                </div>
            ) : (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    {/* Advanced Stats Grid */}
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                        {hasPermission('FINANCE') && (
                            <Card
                                className="cursor-pointer group relative overflow-hidden rounded-3xl border border-slate-200/60 dark:border-slate-700/50 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-500 hover:shadow-[0_8px_40px_rgb(0,0,0,0.08)] hover:-translate-y-1 col-span-1 xl:col-span-2"
                                onClick={() => router.push('/admin/finance')}
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                <div className="absolute -right-6 -top-6 h-32 w-32 rounded-full bg-gradient-to-br from-emerald-500/10 to-teal-500/10 blur-2xl group-hover:bg-emerald-500/20 transition-all duration-500" />
                                <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
                                    <CardTitle className="text-sm font-bold text-slate-500 dark:text-slate-400 tracking-wider uppercase">
                                        Total Revenue
                                    </CardTitle>
                                    <div className="h-10 w-10 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 border border-emerald-200/50 dark:border-emerald-800/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold shadow-sm transition-transform group-hover:scale-110 group-hover:rotate-3">₹</div>
                                </CardHeader>
                                <CardContent className="relative z-10 mt-2">
                                    <div className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">₹{stats.revenue.toLocaleString()}</div>
                                    <div className="flex items-center gap-1.5 mt-2 text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 w-fit px-2 py-1 rounded-full border border-emerald-100 dark:border-emerald-800">
                                        <TrendingUp className="h-3 w-3" />
                                        <span>+20.1% from last month</span>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        <Card
                            className="cursor-pointer group relative overflow-hidden rounded-3xl border border-slate-200/60 dark:border-slate-700/50 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-500 hover:shadow-[0_8px_40px_rgb(0,0,0,0.08)] hover:-translate-y-1"
                            onClick={() => router.push('/admin/roles')}
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <div className="absolute -right-6 -top-6 h-32 w-32 rounded-full bg-gradient-to-br from-blue-500/10 to-indigo-500/10 blur-2xl group-hover:bg-blue-500/20 transition-all duration-500" />
                            <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
                                <CardTitle className="text-sm font-bold text-slate-500 dark:text-slate-400 tracking-wider uppercase">
                                    Total Users
                                </CardTitle>
                                <div className="h-10 w-10 rounded-2xl bg-blue-100 dark:bg-blue-900/30 border border-blue-200/50 dark:border-blue-800/50 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold shadow-sm transition-transform group-hover:scale-110 group-hover:rotate-3">
                                    <Users className="h-4 w-4" />
                                </div>
                            </CardHeader>
                            <CardContent className="relative z-10 mt-2">
                                <div className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{stats.users}</div>
                                <div className="flex items-center gap-1.5 mt-2 text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 w-fit px-2 py-1 rounded-full border border-slate-200 dark:border-slate-700">
                                    <Zap className="h-3 w-3 text-amber-500" />
                                    <span>+180 new</span>
                                </div>
                            </CardContent>
                        </Card>

                        <Card
                            className="cursor-pointer group relative overflow-hidden rounded-3xl border border-slate-200/60 dark:border-slate-700/50 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-500 hover:shadow-[0_8px_40px_rgb(0,0,0,0.08)] hover:-translate-y-1"
                            onClick={() => router.push('/admin/courses')}
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <div className="absolute -right-6 -top-6 h-32 w-32 rounded-full bg-gradient-to-br from-orange-500/10 to-amber-500/10 blur-2xl group-hover:bg-orange-500/20 transition-all duration-500" />
                            <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
                                <CardTitle className="text-sm font-bold text-slate-500 dark:text-slate-400 tracking-wider uppercase">
                                    Enrollments
                                </CardTitle>
                                <div className="h-10 w-10 rounded-2xl bg-orange-100 dark:bg-orange-900/30 border border-orange-200/50 dark:border-orange-800/50 flex items-center justify-center text-orange-600 dark:text-orange-400 font-bold shadow-sm transition-transform group-hover:scale-110 group-hover:rotate-3">
                                    <GraduationCap className="h-4 w-4" />
                                </div>
                            </CardHeader>
                            <CardContent className="relative z-10 mt-2">
                                <div className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{stats.enrollments}</div>
                                <div className="flex items-center gap-1.5 mt-2 text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 w-fit px-2 py-1 rounded-full border border-slate-200 dark:border-slate-700">
                                    <span>{stats.courses} active courses</span>
                                </div>
                            </CardContent>
                        </Card>

                        <Card
                            className="cursor-pointer group relative overflow-hidden rounded-3xl border border-slate-200/60 dark:border-slate-700/50 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-500 hover:shadow-[0_8px_40px_rgb(0,0,0,0.08)] hover:-translate-y-1"
                            onClick={() => router.push('/admin/leads')}
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <div className="absolute -right-6 -top-6 h-32 w-32 rounded-full bg-gradient-to-br from-purple-500/10 to-pink-500/10 blur-2xl group-hover:bg-purple-500/20 transition-all duration-500" />
                            <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
                                <CardTitle className="text-sm font-bold text-slate-500 dark:text-slate-400 tracking-wider uppercase">
                                    CRM Leads
                                </CardTitle>
                                <div className="h-10 w-10 rounded-2xl bg-purple-100 dark:bg-purple-900/30 border border-purple-200/50 dark:border-purple-800/50 flex items-center justify-center text-purple-600 dark:text-purple-400 font-bold shadow-sm transition-transform group-hover:scale-110 group-hover:rotate-3">
                                    <Magnet className="h-4 w-4" />
                                </div>
                            </CardHeader>
                            <CardContent className="relative z-10 mt-2">
                                <div className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{stats.leads || 0}</div>
                                <div className="flex items-center gap-1.5 mt-2 text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 w-fit px-2 py-1 rounded-full border border-slate-200 dark:border-slate-700">
                                    <span>Active prospects</span>
                                </div>
                            </CardContent>
                        </Card>

                        <Card
                            className="cursor-pointer group relative overflow-hidden rounded-3xl border border-slate-200/60 dark:border-slate-700/50 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-500 hover:shadow-[0_8px_40px_rgb(0,0,0,0.08)] hover:-translate-y-1"
                            onClick={() => router.push('/admin/campus-drives')}
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <div className="absolute -right-6 -top-6 h-32 w-32 rounded-full bg-gradient-to-br from-indigo-500/10 to-cyan-500/10 blur-2xl group-hover:bg-indigo-500/20 transition-all duration-500" />
                            <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
                                <CardTitle className="text-sm font-bold text-slate-500 dark:text-slate-400 tracking-wider uppercase">
                                    Campus Drives
                                </CardTitle>
                                <div className="h-10 w-10 rounded-2xl bg-indigo-100 dark:bg-indigo-900/30 border border-indigo-200/50 dark:border-indigo-800/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold shadow-sm transition-transform group-hover:scale-110 group-hover:rotate-3">
                                    <Building2 className="h-4 w-4" />
                                </div>
                            </CardHeader>
                            <CardContent className="relative z-10 mt-2">
                                <div className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{stats.campusDrives || 0}</div>
                                <div className="flex items-center gap-1.5 mt-2 text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 w-fit px-2 py-1 rounded-full border border-slate-200 dark:border-slate-700">
                                    <span>Ongoing hiring</span>
                                </div>
                            </CardContent>
                        </Card>

                        <Card
                            className="cursor-pointer group relative overflow-hidden rounded-3xl border border-slate-200/60 dark:border-slate-700/50 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-500 hover:shadow-[0_8px_40px_rgb(0,0,0,0.08)] hover:-translate-y-1"
                            onClick={() => router.push('/admin/tasks')}
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-rose-500/5 to-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <div className="absolute -right-6 -top-6 h-32 w-32 rounded-full bg-gradient-to-br from-rose-500/10 to-red-500/10 blur-2xl group-hover:bg-rose-500/20 transition-all duration-500" />
                            <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
                                <CardTitle className="text-sm font-bold text-slate-500 dark:text-slate-400 tracking-wider uppercase">
                                    Active Tasks
                                </CardTitle>
                                <div className="h-10 w-10 rounded-2xl bg-rose-100 dark:bg-rose-900/30 border border-rose-200/50 dark:border-rose-800/50 flex items-center justify-center text-rose-600 dark:text-rose-400 font-bold shadow-sm transition-transform group-hover:scale-110 group-hover:rotate-3">
                                    <CheckSquare className="h-4 w-4" />
                                </div>
                            </CardHeader>
                            <CardContent className="relative z-10 mt-2">
                                <div className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{stats.activeTasks || 0}</div>
                                <div className="flex items-center gap-1.5 mt-2 text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 w-fit px-2 py-1 rounded-full border border-slate-200 dark:border-slate-700">
                                    <span>Pending action</span>
                                </div>
                            </CardContent>
                        </Card>

                        <Card
                            className="cursor-pointer group relative overflow-hidden rounded-3xl border border-slate-200/60 dark:border-slate-700/50 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-500 hover:shadow-[0_8px_40px_rgb(0,0,0,0.08)] hover:-translate-y-1"
                            onClick={() => router.push('/admin/consulting')}
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <div className="absolute -right-6 -top-6 h-32 w-32 rounded-full bg-gradient-to-br from-green-500/10 to-emerald-500/10 blur-2xl group-hover:bg-green-500/20 transition-all duration-500" />
                            <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
                                <CardTitle className="text-sm font-bold text-slate-500 dark:text-slate-400 tracking-wider uppercase">
                                    Consulting Projects
                                </CardTitle>
                                <div className="h-10 w-10 rounded-2xl bg-green-100 dark:bg-green-900/30 border border-green-200/50 dark:border-green-800/50 flex items-center justify-center text-green-600 dark:text-green-400 font-bold shadow-sm transition-transform group-hover:scale-110 group-hover:rotate-3">
                                    <BrainCircuit className="h-4 w-4" />
                                </div>
                            </CardHeader>
                            <CardContent className="relative z-10 mt-2">
                                <div className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{stats.activeProjects || 0}</div>
                                <div className="flex items-center gap-1.5 mt-2 text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 w-fit px-2 py-1 rounded-full border border-slate-200 dark:border-slate-700">
                                    <span>Active consulting</span>
                                </div>
                            </CardContent>
                        </Card>

                        <Card
                            className="cursor-pointer group relative overflow-hidden rounded-3xl border border-slate-200/60 dark:border-slate-700/50 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-500 hover:shadow-[0_8px_40px_rgb(0,0,0,0.08)] hover:-translate-y-1"
                            onClick={() => router.push('/admin/support')}
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <div className="absolute -right-6 -top-6 h-32 w-32 rounded-full bg-gradient-to-br from-cyan-500/10 to-teal-500/10 blur-2xl group-hover:bg-cyan-500/20 transition-all duration-500" />
                            <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
                                <CardTitle className="text-sm font-bold text-slate-500 dark:text-slate-400 tracking-wider uppercase">
                                    Open Support Tickets
                                </CardTitle>
                                <div className="h-10 w-10 rounded-2xl bg-cyan-100 dark:bg-cyan-900/30 border border-cyan-200/50 dark:border-cyan-800/50 flex items-center justify-center text-cyan-600 dark:text-cyan-400 font-bold shadow-sm transition-transform group-hover:scale-110 group-hover:rotate-3">
                                    <LifeBuoy className="h-4 w-4" />
                                </div>
                            </CardHeader>
                            <CardContent className="relative z-10 mt-2">
                                <div className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{stats.activeTickets || 0}</div>
                                <div className="flex items-center gap-1.5 mt-2 text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 w-fit px-2 py-1 rounded-full border border-slate-200 dark:border-slate-700">
                                    <span>Requires attention</span>
                                </div>
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
                            <Card className="rounded-3xl border border-slate-200/60 dark:border-slate-700/50 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden relative">
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-lg font-bold">Quick Actions</CardTitle>
                                </CardHeader>
                                <CardContent className="grid grid-cols-2 gap-3">
                                    <Button variant="outline" className="h-24 flex-col gap-3 rounded-2xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 shadow-sm transition-all group" onClick={() => router.push('/admin/blogs/editor')}>
                                        <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform"><Plus className="h-4 w-4" /></div>
                                        <span className="text-[11px] font-bold uppercase tracking-wider">Create Blog</span>
                                    </Button>
                                    <Button variant="outline" className="h-24 flex-col gap-3 rounded-2xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-indigo-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 shadow-sm transition-all group" onClick={() => router.push('/admin/campus-drives')}>
                                        <div className="p-2 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform"><Building2 className="h-4 w-4" /></div>
                                        <span className="text-[11px] font-bold uppercase tracking-wider">New Drive</span>
                                    </Button>
                                    <Button variant="outline" className="h-24 flex-col gap-3 rounded-2xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-purple-500 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 shadow-sm transition-all group" onClick={() => router.push('/admin/crm/pipelines')}>
                                        <div className="p-2 rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform"><Briefcase className="h-4 w-4" /></div>
                                        <span className="text-[11px] font-bold uppercase tracking-wider">Pipeline</span>
                                    </Button>
                                    <Button variant="outline" className="h-24 flex-col gap-3 rounded-2xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-orange-500 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20 shadow-sm transition-all group" onClick={() => router.push('/admin/events')}>
                                        <div className="p-2 rounded-full bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400 group-hover:scale-110 transition-transform"><Calendar className="h-4 w-4" /></div>
                                        <span className="text-[11px] font-bold uppercase tracking-wider">New Event</span>
                                    </Button>
                                </CardContent>
                            </Card>

                            {/* Recent Activity */}
                            <Card className="h-[420px] flex flex-col rounded-3xl border border-slate-200/60 dark:border-slate-700/50 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
                                <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                                        <div className="h-8 w-8 rounded-lg bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                                            <Activity className="h-4 w-4" />
                                        </div>
                                        Recent Activity
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="flex-1 overflow-y-auto p-0 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700">
                                    {stats.recentActivity && stats.recentActivity.length > 0 ? (
                                        <div className="divide-y divide-slate-100 dark:divide-slate-800/60 p-2">
                                            {stats.recentActivity.map((activity, i) => (
                                                <div key={i} className="p-4 hover:bg-white dark:hover:bg-slate-800 rounded-2xl transition-all duration-300 flex gap-4 items-start group">
                                                    <div className="h-10 w-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center shrink-0 border border-indigo-200/50 dark:border-indigo-800/50 group-hover:scale-110 transition-transform">
                                                        <GraduationCap className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                                                    </div>
                                                    <div className="flex-1 min-w-0 pt-0.5">
                                                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                                            <span className="font-bold text-slate-900 dark:text-white">{activity.user?.name}</span> enrolled in <span className="font-bold text-indigo-600 dark:text-indigo-400 truncate inline-block max-w-[120px] align-bottom">{activity.course?.title}</span>
                                                        </p>
                                                        <p className="text-xs font-medium text-slate-500 dark:text-slate-500 mt-1.5 flex items-center gap-1.5">
                                                            <Calendar className="h-3 w-3" />
                                                            {new Date(activity.enrolledAt).toLocaleDateString()} at {new Date(activity.enrolledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-full text-slate-400 dark:text-slate-500 p-8 text-center">
                                            <div className="h-16 w-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                                                <Activity className="h-8 w-8 opacity-50" />
                                            </div>
                                            <p className="text-sm font-medium">No recent activity found.</p>
                                            <p className="text-xs mt-1 opacity-70">Check back later for updates.</p>
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
