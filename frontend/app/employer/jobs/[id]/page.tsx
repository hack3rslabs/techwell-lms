"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import api from "@/lib/api"
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Loader2, Calendar, MoreVertical, Download } from "lucide-react"

interface ColumnConfig {
    title: string
    color: string
}

const COLUMNS: Record<string, ColumnConfig> = {
    APPLIED: { title: "Applied", color: "bg-gray-100" },
    VIEWED: { title: "Viewed", color: "bg-blue-50" }, // Added Viewed
    SCREENED: { title: "Screened", color: "bg-indigo-50" },
    SHORTLISTED: { title: "Shortlisted", color: "bg-purple-50" },
    INTERVIEW_SCHEDULED: { title: "Interview", color: "bg-pink-50" },
    SELECTED: { title: "Selected", color: "bg-green-50" },
    APPOINTED: { title: "Hired", color: "bg-emerald-100 border-emerald-200" }, // Renamed Hired in UI
    REJECTED: { title: "Rejected", color: "bg-red-50" }
}

import type { DropResult } from "@hello-pangea/dnd"

export default function ATSPipelinePage() {
    const { id: jobId } = useParams()
    const router = useRouter()
    interface Job {
        id: string
        title: string
    }

    interface Application {
        id: string
        status: string
        source: string
        atsScore: number
        externalName?: string
        externalEmail?: string
        createdAt: string
        applicant?: {
            name: string
            email: string
            avatar?: string
        }
    }

    const [applications, setApplications] = useState<Application[]>([])
    const [job, setJob] = useState<Job | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    const fetchData = useCallback(async () => {
        try {
            const [jobRes, appsRes] = await Promise.all([
                api.get(`/jobs/${jobId}`),
                api.get(`/ats/applications/${jobId}`)
            ])
            setJob(jobRes.data)
            setApplications(appsRes.data)
        } catch (error) {
            console.error(error)
        } finally {
            setIsLoading(false)
        }
    }, [jobId])

    useEffect(() => {
        fetchData()
    }, [fetchData])

    const handleExport = async () => {
        try {
            const res = await api.get(`/ats/export/${jobId}`, { responseType: 'blob' })
            const url = window.URL.createObjectURL(new Blob([res.data]))
            const link = document.createElement('a')
            link.href = url
            link.setAttribute('download', `applicants-${jobId}.csv`)
            document.body.appendChild(link)
            link.click()
            link.remove()
        } catch (error) {
            console.error("Failed to export", error)
            alert("Failed to export data")
        }
    }

    const onDragEnd = async (result: DropResult) => {
        if (!result.destination) return

        const { draggableId, destination } = result
        const newStatus = destination.droppableId

        // Optimistic UI update
        const updatedApps = applications.map(app =>
            app.id === draggableId ? { ...app, status: newStatus } : app
        )
        setApplications(updatedApps)

        // API Call
        try {
            await api.patch(`/ats/status/${draggableId}`, { status: newStatus })
        } catch (error) {
            console.error("Failed to update status", error)
            fetchData() // Revert on error
        }
    }

    if (isLoading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>

    // Group apps by status
    const columns = Object.keys(COLUMNS).reduce((acc: Record<string, Application[]>, status) => {
        acc[status] = applications.filter(app => app.status === status)
        return acc
    }, {})

    return (
        <div className="container py-6 h-[calc(100vh-60px)] flex flex-col">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    <h1 className="text-2xl font-bold">{job?.title} Pipeline</h1>
                    <div className="flex gap-2 text-sm text-muted-foreground mt-1">
                        <Badge variant="outline">{applications.length} Candidates</Badge>
                        <Badge variant="outline" className="bg-blue-50 text-blue-700">
                            {applications.filter(a => a.source === 'INTERNAL').length} Internal
                        </Badge>
                    </div>
                </div>
                <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleExport()}>
                        <Download className="mr-2 h-4 w-4" /> Export
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => router.push(`/employer/jobs/edit/${jobId}`)}>Edit Job</Button>
                    <Button size="sm" onClick={() => router.push(`/employer/dashboard/ats/add-candidate`)}>Add Candidate</Button>
                </div>
            </div>

            <DragDropContext onDragEnd={onDragEnd}>
                <div className="flex-1 overflow-x-auto pb-4">
                    <div className="flex gap-4 min-w-[1200px] h-full">
                        {(Object.entries(COLUMNS) as [string, ColumnConfig][]).map(([status, config]) => (
                            <div key={status} className={`flex-1 min-w-[280px] rounded-lg p-3 flex flex-col ${config.color}`}>
                                <h3 className="font-semibold mb-3 flex justify-between items-center">
                                    {config.title}
                                    <Badge variant="secondary" className="bg-white/50">{columns[status]?.length || 0}</Badge>
                                </h3>

                                <Droppable droppableId={status}>
                                    {(provided) => (
                                        <div
                                            ref={provided.innerRef}
                                            {...provided.droppableProps}
                                            className="flex-1 overflow-y-auto space-y-3 min-h-[100px]"
                                        >
                                            {columns[status]?.map((app, index: number) => (
                                                <Draggable key={app.id} draggableId={app.id} index={index}>
                                                    {(provided) => (
                                                        <Card
                                                            ref={provided.innerRef}
                                                            {...provided.draggableProps}
                                                            {...provided.dragHandleProps}
                                                            className="shadow-sm hover:shadow-md cursor-grab active:cursor-grabbing border-none"
                                                            onClick={() => router.push(`/employer/dashboard/ats/candidate/${app.id}`)}
                                                        >
                                                            <CardContent className="p-3">
                                                                <div className="flex items-start justify-between mb-2">
                                                                    <div className="flex items-center gap-2">
                                                                        {app.source === 'INTERNAL' && (
                                                                            <Badge variant="default" className="bg-blue-600 text-[10px] h-5 px-1">TechWell</Badge>
                                                                        )}
                                                                        {app.atsScore > 0 && (
                                                                            <Badge variant="outline" className={`text-[10px] h-5 px-1 ${app.atsScore >= 80 ? 'text-green-600 border-green-200' : 'text-orange-500'}`}>
                                                                                {app.atsScore}% Match
                                                                            </Badge>
                                                                        )}
                                                                    </div>
                                                                </div>

                                                                <div className="flex items-center gap-3 mb-3">
                                                                    <Avatar className="h-8 w-8">
                                                                        <AvatarImage src={app.applicant?.avatar} />
                                                                        <AvatarFallback>{(app.applicant?.name || app.externalName || 'U')[0]}</AvatarFallback>
                                                                    </Avatar>
                                                                    <div>
                                                                        <p className="font-medium text-sm line-clamp-1">{app.applicant?.name || app.externalName}</p>
                                                                        <p className="text-xs text-muted-foreground line-clamp-1">{app.applicant?.email || app.externalEmail}</p>
                                                                    </div>
                                                                </div>

                                                                <div className="flex justify-between items-center mt-2 border-t pt-2">
                                                                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                                                                        <Calendar className="w-3 h-3" />
                                                                        {new Date(app.createdAt).toLocaleDateString()}
                                                                    </div>
                                                                    <Button variant="ghost" size="icon" className="h-6 w-6">
                                                                        <MoreVertical className="w-3 h-3" />
                                                                    </Button>
                                                                </div>
                                                            </CardContent>
                                                        </Card>
                                                    )}
                                                </Draggable>
                                            ))}
                                            {provided.placeholder}
                                        </div>
                                    )}
                                </Droppable>
                            </div>
                        ))}
                    </div>
                </div>
            </DragDropContext>
        </div>
    )
}
