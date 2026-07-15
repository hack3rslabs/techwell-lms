"use client"

import * as React from 'react'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import { WidgetRenderer, DEFAULT_LAYOUT, WidgetId } from '@/components/admin/widgets/WidgetRegistry'

import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import api, { interviewApi, userApi } from '@/lib/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Search, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    Users,
    GraduationCap,
    TrendingUp,
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
    const [courses, setCourses] = React.useState<Course[]>([])

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


    const [isMounted, setIsMounted] = React.useState(false)
    const [layout, setLayout] = React.useState<WidgetId[]>(DEFAULT_LAYOUT)
    const [visibleWidgets, setVisibleWidgets] = React.useState<Record<WidgetId, boolean>>({
        revenue: true,
        upcomingFees: true,
        users: true,
        franchises: true,
        enrollments: true,
        certificates: true,
        leads: true,
        campusDrives: true,
        activeTasks: true,
        consulting: true,
        supportTickets: true,
        cmdb: true
    })

    React.useEffect(() => {
        setIsMounted(true)
        const savedLayout = localStorage.getItem('adminDashboardLayout')
        const savedVisibility = localStorage.getItem('adminDashboardVisibility')
        
        if (savedLayout) {
            try { setLayout(JSON.parse(savedLayout)) } catch(e) {}
        }
        if (savedVisibility) {
            try { setVisibleWidgets(JSON.parse(savedVisibility)) } catch(e) {}
        }
    }, [])

    const handleDragEnd = (result: DropResult) => {
        if (!result.destination) return
        
        const newLayout = Array.from(layout)
        const [reorderedItem] = newLayout.splice(result.source.index, 1)
        newLayout.splice(result.destination.index, 0, reorderedItem)
        
        setLayout(newLayout)
        localStorage.setItem('adminDashboardLayout', JSON.stringify(newLayout))
    }

    const toggleWidget = (key: WidgetId) => {
        const newVisibility = { ...visibleWidgets, [key]: !visibleWidgets[key] }
        setVisibleWidgets(newVisibility)
        localStorage.setItem('adminDashboardVisibility', JSON.stringify(newVisibility))
    }


    const [searchQuery, _setSearchQuery] = React.useState('')
    // const [activeTab, setActiveTab] = React.useState<'overview' | 'users' | 'courses' | 'ai-training'>('overview')

    // AI Training State
    const [trainingData, setTrainingData] = React.useState({
        domain: 'IT',
        topic: '',
        difficulty: 'INTERMEDIATE',
        content: ''
    })

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

    // Only check if user exists and is not a student
    // Layout already handles the detailed loading and redirect logic
    if (!user || user.role === 'STUDENT') {
        return null;
    }

    // ... existing imports

    return (
        <div className="space-y-8 overflow-x-hidden w-full max-w-full">
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
                <div className="flex flex-col md:flex-row items-center gap-3 w-full md:w-auto">
                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Search CMDB..."
                            className="pl-8 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                        />
                    </div>
                    
                    <div className="flex items-center gap-2 w-full md:w-auto justify-between">
                        {user?.role === 'SUPER_ADMIN' && <InstituteSwitcher />}
                        
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm">
                                    <Settings className="mr-2 h-4 w-4" /> Widgets
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                                {Object.keys(visibleWidgets).map((key) => (
                                    <DropdownMenuItem
                                        key={key}
                                        onClick={() => toggleWidget(key as WidgetId)}
                                        className="capitalize flex items-center justify-between cursor-pointer"
                                    >
                                        {key.replace(/([A-Z])/g, ' $1').trim()}
                                        {visibleWidgets[key as keyof typeof visibleWidgets] && <CheckSquare className="h-4 w-4 text-primary" />}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <AdminReportModal>
                            <Button size="sm">
                                <BarChart3 className="mr-2 h-4 w-4" /> Report
                            </Button>
                        </AdminReportModal>
                    </div>
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
                    {isMounted && (
                        <DragDropContext onDragEnd={handleDragEnd}>
                            <Droppable droppableId="dashboard-widgets" direction="horizontal">
                                {(provided) => (
                                    <div 
                                        className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6"
                                        {...provided.droppableProps}
                                        ref={provided.innerRef}
                                    >
                                        {layout.map((widgetId, index) => {
                                            if (!visibleWidgets[widgetId]) return null
                                            
                                            // Handle permissions for specific widgets
                                            if (widgetId === 'revenue' && !hasPermission('FINANCE')) return null
                                            if (widgetId === 'upcomingFees' && !hasPermission('FINANCE')) return null
                                            
                                            // Determine column span for specific widgets (like revenue taking 2 cols)
                                            const colSpanClass = widgetId === 'revenue' ? 'col-span-1 xl:col-span-2' : 'col-span-1'
                                            
                                            return (
                                                <Draggable key={widgetId} draggableId={widgetId} index={index}>
                                                    {(provided, snapshot) => (
                                                        <div
                                                            ref={provided.innerRef}
                                                            {...provided.draggableProps}
                                                            {...provided.dragHandleProps}
                                                            className={`${colSpanClass} ${snapshot.isDragging ? 'z-50 ring-2 ring-primary ring-offset-2 rounded-xl scale-[1.02] opacity-90' : ''}`}
                                                            style={{
                                                                ...provided.draggableProps.style,
                                                                transition: snapshot.isDragging ? 'none' : provided.draggableProps.style?.transition
                                                            }}
                                                        >
                                                            <WidgetRenderer id={widgetId} stats={stats} />
                                                        </div>
                                                    )}
                                                </Draggable>
                                            )
                                        })}
                                        {provided.placeholder}
                                    </div>
                                )}
                            </Droppable>
                        </DragDropContext>
                    )}

                    {/* Charts & Quick Actions Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Charts Area */}
                        <div className="lg:col-span-2 space-y-6">
                            <AdminCharts stats={stats} />
                        </div>

                        {/* Right Sidebar Area: Activity & Actions */}
                        <div className="space-y-6">
                            {/* Quick Actions */}
                            <Card className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden relative">
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-lg font-bold">Quick Actions</CardTitle>
                                </CardHeader>
                                <CardContent className="grid grid-cols-2 lg:grid-cols-3 gap-3">
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
                                    <Button variant="outline" className="h-24 flex-col gap-3 rounded-2xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-cyan-500 hover:text-cyan-600 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 shadow-sm transition-all group lg:col-span-2" onClick={() => router.push('/admin/support')}>
                                        <div className="p-2 rounded-full bg-cyan-100 dark:bg-cyan-900/40 text-cyan-600 dark:text-cyan-400 group-hover:scale-110 transition-transform"><LifeBuoy className="h-4 w-4" /></div>
                                        <span className="text-[11px] font-bold uppercase tracking-wider">Manage Tickets</span>
                                    </Button>
                                </CardContent>
                            </Card>

                            {/* Recent Activity */}
                            <Card className="h-[420px] flex flex-col rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
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
