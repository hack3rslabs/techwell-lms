"use client"

import * as React from 'react'
import {
    Users,
    BookOpen,
    Star,
    TrendingUp,
    Play,
    Clock,
    CheckCircle2,
    Calendar,
    ArrowUpRight,
    AlertTriangle,
    FileCheck,
    Loader2
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import api from '@/lib/api'
import Link from 'next/link'

interface StatCardProps {
    icon: React.ElementType
    label: string
    value: string | number
    trend?: string
    color: string
    loading?: boolean
}

const StatCard = ({ icon: Icon, label, value, trend, color, loading }: StatCardProps) => (
    <Card className="border-none shadow-sm bg-white overflow-hidden group hover:shadow-md transition-all duration-300">
        <CardContent className="p-6">
            <div className="flex items-center justify-between">
                <div className={`p-3 rounded-2xl ${color} shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="h-6 w-6 text-white" />
                </div>
                {trend && (
                    <div className="flex items-center gap-1 text-[10px] font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full border border-green-100">
                        <TrendingUp className="h-3 w-3" />
                        {trend}
                    </div>
                )}
            </div>
            <div className="mt-4">
                <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">{label}</p>
                {loading ? (
                    <Loader2 className="h-6 w-6 animate-spin mt-2" />
                ) : (
                    <p className="text-3xl font-black text-slate-800 mt-1">{value}</p>
                )}
            </div>
        </CardContent>
    </Card>
)

interface TrainerStats {
    totalStudents: number
    activeBatches: number
    pendingEvaluations: number
    completionRate: number
}

interface Batch {
    id: string
    name: string
    course: { title: string; thumbnail: string | null }
    _count: { enrollments: number }
}

export default function InstructorDashboard() {
    const [stats, setStats] = React.useState<TrainerStats | null>(null)
    const [batches, setBatches] = React.useState<Batch[]>([])
    const [loading, setLoading] = React.useState(true)

    React.useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsRes, batchesRes] = await Promise.all([
                    api.get('/trainer/stats'),
                    api.get('/trainer/batches')
                ])
                setStats(statsRes.data)
                setBatches(batchesRes.data)
            } catch (error) {
                console.error('Failed to fetch trainer data:', error)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    icon={Users}
                    label="Total Students"
                    value={stats?.totalStudents ?? '-'}
                    color="bg-blue-600"
                    loading={loading}
                />
                <StatCard
                    icon={BookOpen}
                    label="Active Batches"
                    value={stats?.activeBatches ?? '-'}
                    color="bg-purple-600"
                    loading={loading}
                />
                <StatCard
                    icon={FileCheck}
                    label="Pending Evaluations"
                    value={stats?.pendingEvaluations ?? '-'}
                    color="bg-amber-500"
                    loading={loading}
                />
                <StatCard
                    icon={CheckCircle2}
                    label="Completion Rate"
                    value={`${stats?.completionRate ?? 0}%`}
                    trend="+5%" // Keep trend static or calculate if history available
                    color="bg-emerald-600"
                    loading={loading}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* My Batches */}
                <Card className="lg:col-span-2 border-none shadow-sm bg-white overflow-hidden">
                    <CardHeader className="p-8 pb-0">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-xl font-black text-slate-800">My Batches</CardTitle>
                                <CardDescription className="text-xs font-bold uppercase tracking-widest mt-1">
                                    Active student groups
                                </CardDescription>
                            </div>
                            <Link href="/instructor/batches">
                                <Button variant="ghost" size="sm" className="text-primary font-bold hover:bg-primary/5">
                                    View All
                                </Button>
                            </Link>
                        </div>
                    </CardHeader>
                    <CardContent className="p-8">
                        {loading ? (
                            <div className="flex items-center justify-center py-12">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            </div>
                        ) : batches.length === 0 ? (
                            <div className="text-center py-12 text-slate-500">
                                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                <p className="font-medium">No batches assigned yet</p>
                                <p className="text-sm mt-1">Create a batch to start managing students</p>
                                <Link href="/instructor/batches">
                                    <Button className="mt-4">Create Batch</Button>
                                </Link>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {batches.slice(0, 4).map((batch) => (
                                    <div
                                        key={batch.id}
                                        className="flex items-center gap-4 p-4 rounded-2xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all group"
                                    >
                                        <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                                            <Users className="h-7 w-7 text-primary" />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-bold text-slate-800">{batch.name}</h4>
                                            <p className="text-sm text-slate-500">{batch.course.title}</p>
                                        </div>
                                        <div className="text-right">
                                            <Badge variant="secondary" className="font-bold">
                                                {batch._count.enrollments} Students
                                            </Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Quick Actions & Alerts */}
                <div className="space-y-8">
                    {/* Pending Evaluations Alert */}
                    {stats && stats.pendingEvaluations > 0 && (
                        <Card className="border-none shadow-sm bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
                            <CardContent className="p-6">
                                <div className="flex items-start gap-4">
                                    <div className="p-3 rounded-2xl bg-amber-500 shadow-sm">
                                        <AlertTriangle className="h-6 w-6 text-white" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-amber-900">Pending Evaluations</h3>
                                        <p className="text-sm text-amber-700 mt-1">
                                            You have {stats.pendingEvaluations} assignment{stats.pendingEvaluations > 1 ? 's' : ''} waiting for review.
                                        </p>
                                        <Link href="/instructor/assessments">
                                            <Button size="sm" className="mt-3 bg-amber-600 hover:bg-amber-700">
                                                Review Now
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Quick Stats */}
                    <Card className="border-none shadow-sm bg-white overflow-hidden">
                        <CardHeader className="p-6 pb-0">
                            <CardTitle className="text-lg font-bold text-slate-800">Quick Stats</CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-4">
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest text-slate-600">
                                    <span>Course Completion</span>
                                    <span className="text-primary tracking-tighter">84%</span>
                                </div>
                                <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
                                    <div className="h-full bg-primary w-[84%] rounded-full shadow-[0_0_10px_rgba(var(--primary),0.3)]" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest text-slate-600">
                                    <span>Student Engagement</span>
                                    <span className="text-purple-600 tracking-tighter">62%</span>
                                </div>
                                <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
                                    <div className="h-full bg-purple-600 w-[62%] rounded-full" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Live Classes CTA */}
                    <Card className="border-none shadow-sm bg-gradient-to-br from-slate-900 to-slate-800 text-white overflow-hidden relative">
                        <div className="absolute top-0 right-0 p-8 opacity-10">
                            <TrendingUp className="h-32 w-32" />
                        </div>
                        <CardContent className="p-6 relative z-10">
                            <div className="h-12 w-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center mb-4 border border-white/10">
                                <Calendar className="h-6 w-6 text-white" />
                            </div>
                            <h3 className="text-lg font-bold mb-2 leading-tight">Schedule a Live Class</h3>
                            <p className="text-white/60 text-sm font-medium mb-4">
                                Connect with your students in real-time.
                            </p>
                            <Button className="w-full bg-white text-slate-900 font-bold hover:bg-slate-100 rounded-xl h-10 shadow-xl shadow-black/20">
                                Schedule Class
                                <ArrowUpRight className="h-4 w-4 ml-2" />
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
