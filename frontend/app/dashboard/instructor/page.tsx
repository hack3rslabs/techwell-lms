"use client"

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Users, DollarSign, BookOpen, Plus, TrendingUp } from 'lucide-react'

export default function InstructorDashboard() {
    const router = useRouter()
    const { user, isLoading } = useAuth()
    const [activeTab, setActiveTab] = React.useState('overview')
    const [stats, setStats] = React.useState({ totalStudents: 0, activeCourses: 0, totalRevenue: 0, rating: 0 })
    const [courses, setCourses] = React.useState<any[]>([])
    const [enrollments, setEnrollments] = React.useState<any[]>([])

    React.useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // Fetch data from actual API when available
            } catch (error) {
                console.error("Failed to fetch instructor data", error)
            }
        }
        fetchDashboardData()
    }, [])

    if (isLoading) return null

    return (
        <div className="relative min-h-screen bg-background overflow-hidden">
            {/* Background Decor */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-[100px]" />
                <div className="absolute bottom-[10%] left-[-5%] w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[100px]" />
            </div>

            <div className="container py-8 relative z-10">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 text-xs font-medium mb-2">
                            Instructor Panel
                        </div>
                        <h1 className="text-3xl font-extrabold tracking-tight">
                            Hello, <span className="text-foreground cursor-default">{user?.name || 'Instructor'}</span>
                        </h1>
                        <p className="text-muted-foreground mt-1">Manage your courses and track student progress.</p>
                    </div>
                    <Button className="glass bg-primary/90 hover:bg-primary shadow-lg shadow-primary/20" onClick={() => router.push('/admin/courses/new')}>
                        <Plus className="mr-2 h-4 w-4" /> Create New Course
                    </Button>
                </div>

                {/* Glass Tabs */}
                <div className="flex gap-2 mb-8 p-1 glass rounded-xl overflow-x-auto w-fit">
                    {['overview', 'courses', 'students', 'earnings'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-6 py-2 rounded-lg font-medium transition-all duration-300 capitalize ${activeTab === tab
                                    ? 'bg-primary text-white shadow-md'
                                    : 'text-muted-foreground hover:bg-white/10 hover:text-foreground'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="glass-card p-6 rounded-2xl relative overflow-hidden">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm text-muted-foreground">Total Students</p>
                                <h3 className="text-3xl font-bold mt-2">{stats.totalStudents}</h3>
                            </div>
                            <div className="p-3 bg-blue-500/10 rounded-xl text-blue-600"><Users className="h-6 w-6" /></div>
                        </div>
                    </div>
                    <div className="glass-card p-6 rounded-2xl relative overflow-hidden">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm text-muted-foreground">Active Courses</p>
                                <h3 className="text-3xl font-bold mt-2">{stats.activeCourses}</h3>
                            </div>
                            <div className="p-3 bg-purple-500/10 rounded-xl text-purple-600"><BookOpen className="h-6 w-6" /></div>
                        </div>
                    </div>
                    <div className="glass-card p-6 rounded-2xl relative overflow-hidden">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm text-muted-foreground">Total Revenue</p>
                                <h3 className="text-3xl font-bold mt-2 text-green-600">₹{stats.totalRevenue.toLocaleString()}</h3>
                            </div>
                            <div className="p-3 bg-green-500/10 rounded-xl text-green-600"><DollarSign className="h-6 w-6" /></div>
                        </div>
                    </div>
                    <div className="glass-card p-6 rounded-2xl relative overflow-hidden">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm text-muted-foreground">Instructor Rating</p>
                                <h3 className="text-3xl font-bold mt-2 text-amber-500">{stats.rating}/5.0</h3>
                            </div>
                            <div className="p-3 bg-amber-500/10 rounded-xl text-amber-600"><TrendingUp className="h-6 w-6" /></div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Course List */}
                    <div className="lg:col-span-2 glass-card rounded-2xl p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold">My Courses</h3>
                            <Button variant="link" className="text-primary">View All</Button>
                        </div>
                        <div className="space-y-4">
                            {courses.length === 0 && <p className="text-muted-foreground text-sm">No active courses found.</p>}
                            {courses.map(course => (
                                <div key={course.id} className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
                                            <BookOpen className="h-6 w-6 text-primary" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold">{course.title}</h4>
                                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                                <span>{course.students} Students</span>
                                                <span>⭐ {course.rating}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className={`text-xs px-2 py-1 rounded-full mb-1 inline-block ${course.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                                            {course.status}
                                        </div>
                                        <div className="font-bold text-sm">₹{course.price}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Recent Sales / Enrollments */}
                    <div className="glass-card rounded-2xl p-6">
                        <h3 className="text-xl font-bold mb-6">Recent Enrollments</h3>
                        <div className="space-y-4">
                            {enrollments.length === 0 && <p className="text-muted-foreground text-sm">No recent enrollments.</p>}
                            {enrollments.map(enrollment => (
                                <div key={enrollment.id} className="flex items-center gap-3 pb-3 border-b border-white/10 last:border-0">
                                    <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-blue-400 to-purple-400 flex items-center justify-center text-white font-bold">
                                        {enrollment.student[0]}
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-medium text-sm">{enrollment.student}</h4>
                                        <p className="text-xs text-muted-foreground line-clamp-1">{enrollment.course}</p>
                                    </div>
                                    <div className="text-green-600 font-bold text-sm">
                                        +₹{enrollment.amount.toLocaleString()}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
