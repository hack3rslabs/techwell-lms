"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BookOpen, Users, VideoIcon, GraduationCap, Settings, PlusCircle, ArrowRight } from "lucide-react"
import api from "@/lib/api"
import { useAuth } from "@/lib/auth-context"
import { Loader2 } from "lucide-react"

export default function TrainingManagerPage() {
    const router = useRouter()
    const { canWrite } = useAuth()
    const [stats, setStats] = React.useState({
        activeCourses: 0,
        activeBatches: 0,
        totalStudents: 0,
        liveClasses: 0
    })
    const [isLoading, setIsLoading] = React.useState(true)

    React.useEffect(() => {
        const fetchTrainingStats = async () => {
            try {
                // Here we might aggregate data from different endpoints.
                // For now, these routes might not expose exact counts so we handle graceful fallbacks
                const [coursesRes, batchesRes] = await Promise.all([
                    api.get('/courses/manage/all?status=PUBLISHED&limit=1').catch(() => ({ data: { pagination: { total: 0 } } })),
                    api.get('/batches').catch(() => ({ data: [] }))
                ])
                setStats({
                    activeCourses: coursesRes.data?.pagination?.total || 0,
                    activeBatches: Array.isArray(batchesRes.data) ? batchesRes.data.length : 0,
                    totalStudents: 1250, // Mock: this should come from a centralized /api/admin/training/stats
                    liveClasses: 8       // Mock: this should come from a centralized /api/admin/training/stats
                })
            } catch (error) {
                console.error("Failed to load training stats:", error)
            } finally {
                setIsLoading(false)
            }
        }
        fetchTrainingStats()
    }, [])

    if (isLoading) {
        return (
            <div className="h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Training Manager Dashboard</h1>
                    <p className="text-muted-foreground mt-2">
                        Centralized view for Courses, Batches, Live Classes, and Student Enrollments.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline"><Settings className="mr-2 h-4 w-4" /> Config Data</Button>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card className="cursor-pointer hover:shadow-lg transition-all" onClick={() => router.push('/admin/courses')}>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Active Courses</CardTitle>
                        <BookOpen className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{stats.activeCourses}</div>
                    </CardContent>
                </Card>

                <Card className="cursor-pointer hover:shadow-lg transition-all" onClick={() => router.push('/admin/batches')}>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Ongoing Batches</CardTitle>
                        <Users className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{stats.activeBatches}</div>
                    </CardContent>
                </Card>

                <Card className="cursor-pointer hover:shadow-lg transition-all" onClick={() => router.push('/admin/students')}>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Enrolled</CardTitle>
                        <GraduationCap className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{stats.totalStudents}</div>
                    </CardContent>
                </Card>

                <Card className="cursor-pointer hover:shadow-lg transition-all" onClick={() => router.push('/admin/live-classes')}>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Scheduled Live Classes</CardTitle>
                        <VideoIcon className="h-4 w-4 text-purple-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{stats.liveClasses}</div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>AI Course Generation</CardTitle>
                        <p className="text-sm text-muted-foreground">Generate complete course curriculum drafts using AI.</p>
                    </CardHeader>
                    <CardContent>
                        <Button className="w-full" onClick={() => router.push('/admin/courses/new')}>
                            <PlusCircle className="mr-2 h-4 w-4" /> Start AI Generation
                        </Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Trigger Automations</CardTitle>
                        <p className="text-sm text-muted-foreground">Manage workflow triggers like auto-certificates and assessments.</p>
                    </CardHeader>
                    <CardContent>
                        <Button variant="secondary" className="w-full" onClick={() => router.push('/admin/automation-studio')}>
                            Go To Automation Studio <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
