"use client"

import * as React from "react"
import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import api from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
    Plus, Users, Briefcase, Video, Check, MoreHorizontal,
    Clock, ArrowRight, TrendingUp, Target, Activity,
    Calendar, BarChart3, Loader2, UserCheck, Zap, ChevronRight
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface Application {
    id: string
    status: string
}

interface Job {
    id: string
    title: string
    location: string
    type: string
    status: 'PUBLISHED' | 'DRAFT' | 'CLOSED' | 'PAUSED' | 'OPEN'
    applications?: Application[]
    _count?: {
        applications: number
    }
    createdAt: string
}

interface ActivityItem {
    id: string
    message: string
    icon: string
    action: string
    entityType: string
    timestamp: string
    details: Record<string, unknown> | null
}

interface FunnelData {
    applied: number
    screened: number
    shortlisted: number
    interviewScheduled: number
    interviewed: number
    hired: number
    rejected: number
}

interface AnalyticsSummary {
    totalJobs: number
    activeJobs: number
    totalApplications: number
    hiredCount: number
    rejectedCount: number
    avgTimeToHire: number
    avgAtsScore: number
    selectionRate: string | number
}

interface AnalyticsData {
    summary: AnalyticsSummary
    funnel: FunnelData
    sourceBreakdown: { internal: number; external: number }
}

export default function EmployerDashboard() {
    const [jobs, setJobs] = useState<Job[]>([])
    const [activities, setActivities] = useState<ActivityItem[]>([])
    const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            const [jobsRes, activityRes, analyticsRes] = await Promise.allSettled([
                api.get('/jobs/my/listings'),
                api.get('/ats/activity?limit=10'),
                api.get('/ats/analytics')
            ])

            if (jobsRes.status === 'fulfilled') setJobs(jobsRes.value.data)
            if (activityRes.status === 'fulfilled') setActivities(activityRes.value.data)
            if (analyticsRes.status === 'fulfilled') setAnalytics(analyticsRes.value.data)
        } catch {
            // Error handling
        } finally {
            setIsLoading(false)
        }
    }

    const stats = useMemo(() => {
        if (analytics) return analytics.summary

        let selected = 0
        let totalApplications = 0

        jobs.forEach(job => {
            job.applications?.forEach((app) => {
                totalApplications++
                if (app.status === 'SELECTED' || app.status === 'APPOINTED' || app.status === 'HIRED') selected++
            })
        })
        return {
            totalJobs: jobs.length,
            activeJobs: jobs.filter(j => j.status === 'PUBLISHED' || j.status === 'OPEN').length,
            totalApplications,
            hiredCount: selected,
            rejectedCount: 0,
            avgTimeToHire: 0,
            avgAtsScore: 0,
            selectionRate: totalApplications > 0 ? ((selected / totalApplications) * 100).toFixed(1) : 0
        }
    }, [jobs, analytics])

    const getActivityIcon = (icon: string) => {
        switch (icon) {
            case 'status': return <TrendingUp className="h-4 w-4 text-blue-600" />
            case 'interview': return <Video className="h-4 w-4 text-purple-600" />
            case 'note': return <Activity className="h-4 w-4 text-amber-600" />
            case 'feedback': return <Check className="h-4 w-4 text-green-600" />
            case 'apply': return <Users className="h-4 w-4 text-indigo-600" />
            default: return <Activity className="h-4 w-4 text-gray-500" />
        }
    }

    const getActivityBg = (icon: string) => {
        switch (icon) {
            case 'status': return 'bg-blue-50'
            case 'interview': return 'bg-purple-50'
            case 'note': return 'bg-amber-50'
            case 'feedback': return 'bg-green-50'
            case 'apply': return 'bg-indigo-50'
            default: return 'bg-gray-100'
        }
    }

    const timeAgo = (dateStr: string) => {
        const diff = Date.now() - new Date(dateStr).getTime()
        const mins = Math.floor(diff / 60000)
        if (mins < 60) return `${mins}m ago`
        const hrs = Math.floor(mins / 60)
        if (hrs < 24) return `${hrs}h ago`
        const days = Math.floor(hrs / 24)
        return `${days}d ago`
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        )
    }

    return (
        <div className="container space-y-8 animate-in fade-in duration-500 pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-100 pb-6">
                <div>
                    <h1 className="text-3xl font-bold text-foreground tracking-tight">
                        Hiring Overview
                    </h1>
                    <p className="text-muted-foreground mt-1 text-sm font-medium">Welcome back! Here's what's happening with your jobs today.</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" onClick={() => router.push('/employer/reports')} className="bg-white border-gray-200 text-gray-700 hover:bg-gray-50 shadow-sm">
                        <BarChart3 className="mr-2 h-4 w-4 text-gray-500" /> Analytics
                    </Button>
                    <Button onClick={() => router.push('/employer/jobs/new')} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-sm shadow-blue-200">
                        <Plus className="mr-2 h-4 w-4" /> Post a Job
                    </Button>
                </div>
            </div>

            {/* Primary Stats Grid */}
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                <Card className="bg-white border border-gray-200 shadow-sm rounded-xl overflow-hidden hover:shadow-md transition-shadow duration-200">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-blue-50 rounded-xl">
                                <Users className="h-6 w-6 text-blue-600" />
                            </div>
                            <Badge variant="outline" className="text-blue-600 bg-blue-50 border-blue-100 font-medium">
                                Total
                            </Badge>
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-3xl font-bold text-gray-900">{stats.totalApplications}</h3>
                            <p className="text-sm font-medium text-gray-500">Total Applicants</p>
                        </div>
                        <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-2 text-xs font-medium text-gray-500">
                            <Zap className="w-3.5 h-3.5 text-amber-500" />
                            <span>Avg Score: <span className="text-gray-900 font-bold">{stats.avgAtsScore || '—'}</span></span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white border border-gray-200 shadow-sm rounded-xl overflow-hidden hover:shadow-md transition-shadow duration-200">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-purple-50 rounded-xl">
                                <Briefcase className="h-6 w-6 text-purple-600" />
                            </div>
                            <Badge variant="outline" className="text-purple-600 bg-purple-50 border-purple-100 font-medium">
                                Active
                            </Badge>
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-3xl font-bold text-gray-900">{stats.activeJobs}</h3>
                            <p className="text-sm font-medium text-gray-500">Active Jobs</p>
                        </div>
                        <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-2 text-xs font-medium text-gray-500 cursor-pointer hover:text-blue-600 transition-colors" onClick={() => router.push('/employer/jobs')}>
                            <span>View all jobs</span>
                            <ArrowRight className="w-3 h-3" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white border border-gray-200 shadow-sm rounded-xl overflow-hidden hover:shadow-md transition-shadow duration-200">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-green-50 rounded-xl">
                                <UserCheck className="h-6 w-6 text-green-600" />
                            </div>
                            <Badge variant="outline" className="text-green-600 bg-green-50 border-green-100 font-medium">
                                Hired
                            </Badge>
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-3xl font-bold text-gray-900">{stats.hiredCount}</h3>
                            <p className="text-sm font-medium text-gray-500">Candidates Hired</p>
                        </div>
                        <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-2 text-xs font-medium text-gray-500">
                            <Target className="w-3.5 h-3.5 text-green-500" />
                            <span>Selection Rate: <span className="text-gray-900 font-bold">{stats.selectionRate}%</span></span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white border border-gray-200 shadow-sm rounded-xl overflow-hidden hover:shadow-md transition-shadow duration-200">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-amber-50 rounded-xl">
                                <Clock className="h-6 w-6 text-amber-600" />
                            </div>
                            <Badge variant="outline" className="text-amber-600 bg-amber-50 border-amber-100 font-medium">
                                Speed
                            </Badge>
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-3xl font-bold text-gray-900">{stats.avgTimeToHire || '—'}</h3>
                            <p className="text-sm font-medium text-gray-500">Avg Days to Hire</p>
                        </div>
                        <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-2 text-xs font-medium text-gray-500">
                            <span>Platform Benchmark: <span className="text-gray-900 font-bold">14 days</span></span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Job Listings Table */}
                <Card className="lg:col-span-2 bg-white border border-gray-200 shadow-sm rounded-xl overflow-hidden">
                    <CardHeader className="border-b border-gray-100 bg-gray-50/50 py-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-base font-bold text-gray-900">Recent Job Listings</CardTitle>
                                <CardDescription className="mt-1 text-xs text-gray-500">Manage and monitor your active roles</CardDescription>
                            </div>
                            <Button variant="ghost" size="sm" className="text-xs font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50" onClick={() => router.push('/employer/jobs')}>
                                View All
                                <ArrowRight className="ml-1.5 h-3 w-3" />
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-white border-b border-gray-100 hover:bg-white">
                                        <TableHead className="font-semibold text-gray-700 text-xs uppercase tracking-wider pl-6">Role / Location</TableHead>
                                        <TableHead className="font-semibold text-gray-700 text-xs uppercase tracking-wider">Status</TableHead>
                                        <TableHead className="font-semibold text-gray-700 text-xs uppercase tracking-wider">Pipeline</TableHead>
                                        <TableHead className="text-right font-semibold text-gray-700 text-xs uppercase tracking-wider pr-6">Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {jobs.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center py-12 text-gray-400">
                                                <div className="flex flex-col items-center justify-center gap-2">
                                                    <Briefcase className="h-10 w-10 text-gray-300" />
                                                    <p>No jobs posted yet.</p>
                                                    <Button variant="link" className="text-blue-600" onClick={() => router.push('/employer/jobs/new')}>
                                                        Post your first job
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : jobs.slice(0, 5).map((job) => (
                                        <TableRow key={job.id} className="hover:bg-blue-50/30 transition-colors border-b border-gray-50 last:border-0 group cursor-pointer" onClick={() => router.push(`/employer/jobs/${job.id}`)}>
                                            <TableCell className="pl-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-gray-900 text-sm group-hover:text-blue-700 transition-colors">{job.title}</span>
                                                    <span className="text-xs text-gray-500 mt-0.5">{job.location} • {job.type?.replace('_', ' ')}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant="secondary"
                                                    className={cn(
                                                        "font-medium border text-[10px] px-2 py-0.5",
                                                        (job.status === 'PUBLISHED' || job.status === 'OPEN')
                                                            ? 'bg-green-50 text-green-700 border-green-200'
                                                            : job.status === 'CLOSED'
                                                                ? 'bg-gray-100 text-gray-600 border-gray-200'
                                                                : 'bg-amber-50 text-amber-700 border-amber-200'
                                                    )}
                                                >
                                                    {job.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Users className="h-4 w-4 text-gray-400" />
                                                    <span className="text-sm font-bold text-gray-900">{job._count?.applications || job.applications?.length || 0}</span>
                                                    <div className="hidden sm:flex h-1.5 w-16 bg-gray-100 rounded-full ml-2 overflow-hidden">
                                                        <div className="bg-blue-600 h-full rounded-full" style={{ width: `${Math.min(((job._count?.applications || job.applications?.length || 0) / 20) * 100, 100)}%` }} />
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right pr-6">
                                                <Button size="icon" variant="ghost" className="h-8 w-8 text-gray-400 hover:text-gray-900">
                                                    <ChevronRight className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>

                {/* Right Side - Activity Feed */}
                <div className="space-y-6">
                    {/* Hiring Funnel */}
                    {analytics?.funnel && (
                        <Card className="bg-white border border-gray-200 shadow-sm rounded-xl">
                            <CardHeader className="border-b border-gray-100 bg-gray-50/50 py-4">
                                <CardTitle className="text-base font-bold text-gray-900 flex items-center gap-2">
                                    <Target className="h-4 w-4 text-blue-600" /> Pipeline Health
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="space-y-4">
                                    {[
                                        { label: 'Applied', value: analytics.funnel.applied, color: 'bg-blue-500', icon: Users },
                                        { label: 'Screened', value: analytics.funnel.screened, color: 'bg-indigo-500', icon: Check },
                                        { label: 'Interview', value: analytics.funnel.interviewScheduled, color: 'bg-purple-500', icon: Video },
                                        { label: 'Hired', value: analytics.funnel.hired, color: 'bg-green-500', icon: UserCheck },
                                    ].map((stage) => {
                                        const pct = analytics.funnel.applied > 0 ? (stage.value / analytics.funnel.applied) * 100 : 0
                                        return (
                                            <div key={stage.label} className="relative">
                                                <div className="flex items-center justify-between mb-1.5 z-10 relative">
                                                    <div className="flex items-center gap-2">
                                                        <div className={cn("p-1 rounded-md bg-opacity-10", stage.color.replace('bg-', 'bg-opacity-10 ' + stage.color.replace('500', '50')))}>
                                                            <stage.icon className={cn("h-3 w-3", stage.color.replace('bg-', 'text-'))} />
                                                        </div>
                                                        <span className="text-xs font-semibold text-gray-700">{stage.label}</span>
                                                    </div>
                                                    <span className="text-sm font-bold text-gray-900">{stage.value}</span>
                                                </div>
                                                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                                    <div className={cn("h-full rounded-full transition-all duration-1000", stage.color)} style={{ width: `${Math.max(pct, 5)}%` }} />
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    <Card className="bg-white border border-gray-200 shadow-sm rounded-xl overflow-hidden">
                        <CardHeader className="border-b border-gray-100 bg-gray-50/50 py-4">
                            <CardTitle className="text-base font-bold text-gray-900 flex items-center gap-2">
                                <Activity className="h-4 w-4 text-amber-500" /> Activity Feed
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            {activities.length === 0 ? (
                                <p className="text-sm text-gray-400 text-center py-8">No recent activity.</p>
                            ) : (
                                <div className="max-h-[350px] overflow-y-auto p-0">
                                    {activities.map((activity) => (
                                        <div key={activity.id} className="flex gap-3 p-4 border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                                            <div className={`h-8 w-8 rounded-full ${getActivityBg(activity.icon)} flex items-center justify-center mt-1 shrink-0 ring-4 ring-white`}>
                                                {getActivityIcon(activity.icon)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-800 leading-snug">{activity.message}</p>
                                                <p className="text-[11px] text-gray-400 mt-1 font-medium">{timeAgo(activity.timestamp)}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
