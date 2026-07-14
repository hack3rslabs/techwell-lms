"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import api from "@/lib/api"
import { useParams } from "next/navigation"
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Loader2, User, FileText, CheckCircle2, IndianRupee, ArrowLeft } from "lucide-react"
import Link from "next/link"

// Define Pipeline Stages
const PIPELINE_STAGES = [
    { id: 'ELIGIBLE', label: 'Eligible', color: 'bg-slate-100' },
    { id: 'INVITED', label: 'Invited', color: 'bg-blue-50' },
    { id: 'APPLIED', label: 'Applied', color: 'bg-indigo-50' },
    { id: 'SHORTLISTED', label: 'Shortlisted', color: 'bg-purple-50' },
    { id: 'TECH_INTERVIEW', label: 'Tech Interview', color: 'bg-orange-50' },
    { id: 'HR_INTERVIEW', label: 'HR Interview', color: 'bg-amber-50' },
    { id: 'SELECTED', label: 'Selected', color: 'bg-green-50' },
    { id: 'OFFERED', label: 'Offered', color: 'bg-emerald-50' },
    { id: 'JOINED', label: 'Joined', color: 'bg-teal-50' },
    { id: 'REJECTED', label: 'Rejected', color: 'bg-red-50' },
]

interface Candidate {
    id: string // CampusDriveStudent relation ID
    userId: string
    status: string
    atsScore: number
    resumeUrl: string | null
    offerLetterUrl: string | null
    ctc: string | null
    user: {
        name: string
        email: string
        phone: string
        college: string
    }
}

export default function PipelineKanbanPage() {
    const params = useParams()
    const [candidates, setCandidates] = useState<Candidate[]>([])
    const [isLoading, setIsLoading] = useState(true)

    async function fetchPipeline() {
        try {
            // Ideally an endpoint that gets students in this drive
            // For now, let's mock it if the endpoint isn't fully ready or we use a custom one
            // We'd hit GET /campus-drives/:id/students 
            const res = await api.get(`/campus-drives/${params.id}/students`)
            setCandidates(res.data)
        } catch (error) {
            console.error('Failed to fetch campus drive pipeline:', error)
            setCandidates([])
        } finally {
            setIsLoading(false)
        }
    }


    useEffect(() => {
        if (params.id) {
            fetchPipeline()
        }
    }, [params.id])


    const onDragEnd = async (result: DropResult) => {
        const { destination, source, draggableId } = result
        if (!destination) return
        if (destination.droppableId === source.droppableId) return

        const newStatus = destination.droppableId
        
        // Optimistic update
        setCandidates(prev => prev.map(c => 
            c.id === draggableId ? { ...c, status: newStatus } : c
        ))

        try {
            // API Call to update status
            const candidate = candidates.find(c => c.id === draggableId)
            if (candidate) {
                await api.patch(`/campus-drives/${params.id}/pipeline/${candidate.userId}`, {
                    status: newStatus
                })
            }
        } catch (error) {
            console.error("Failed to update pipeline status")
            // Revert on failure
            fetchPipeline()
        }
    }

    if (isLoading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>

    return (
        <div className="space-y-6 h-full flex flex-col p-4">
            <div className="flex items-center gap-4">
                <Link href={`/admin/campus-drives/${params.id}`}>
                    <Button variant="outline" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Recruitment Pipeline</h1>
                    <p className="text-muted-foreground">Drag and drop candidates across hiring stages.</p>
                </div>
            </div>

            <DragDropContext onDragEnd={onDragEnd}>
                <div className="flex gap-4 overflow-x-auto pb-4 flex-1 items-start min-h-[600px]">
                    {PIPELINE_STAGES.map(stage => {
                        const stageCandidates = candidates.filter(c => c.status === stage.id)

                        return (
                            <Droppable key={stage.id} droppableId={stage.id}>
                                {(provided, snapshot) => (
                                    <div
                                        ref={provided.innerRef}
                                        {...provided.droppableProps}
                                        className={`flex flex-col min-w-[300px] max-w-[300px] rounded-lg border bg-muted/30 ${snapshot.isDraggingOver ? 'bg-muted/50 ring-2 ring-primary/20' : ''}`}
                                    >
                                        <div className={`p-3 border-b font-semibold flex justify-between items-center ${stage.color} rounded-t-lg`}>
                                            <span>{stage.label}</span>
                                            <Badge variant="secondary" className="bg-white/50">{stageCandidates.length}</Badge>
                                        </div>
                                        
                                        <div className="p-2 flex-1 space-y-2 min-h-[150px]">
                                            {stageCandidates.map((candidate, index) => (
                                                <Draggable key={candidate.id} draggableId={candidate.id} index={index}>
                                                    {(provided, snapshot) => (
                                                        <Card
                                                            ref={provided.innerRef}
                                                            {...provided.draggableProps}
                                                            {...provided.dragHandleProps}
                                                            className={`shadow-sm ${snapshot.isDragging ? 'shadow-lg ring-2 ring-primary/20' : 'hover:shadow-md'} transition-all`}
                                                        >
                                                            <CardContent className="p-3">
                                                                <div className="flex gap-3">
                                                                    <Avatar className="h-8 w-8">
                                                                        <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                                                            {candidate.user.name.charAt(0)}
                                                                        </AvatarFallback>
                                                                    </Avatar>
                                                                    <div className="flex-1 overflow-hidden">
                                                                        <h4 className="text-sm font-medium truncate">{candidate.user.name}</h4>
                                                                        <p className="text-xs text-muted-foreground truncate">{candidate.user.college}</p>
                                                                        
                                                                        <div className="flex gap-2 mt-2">
                                                                            <Badge variant="outline" className="text-[10px] px-1 py-0 h-4">
                                                                                ATS: {candidate.atsScore}%
                                                                            </Badge>
                                                                            {candidate.resumeUrl && (
                                                                                <a href={candidate.resumeUrl} target="_blank" rel="noreferrer" className="text-blue-500 hover:text-blue-700">
                                                                                    <FileText className="h-4 w-4" />
                                                                                </a>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </CardContent>
                                                        </Card>
                                                    )}
                                                </Draggable>
                                            ))}
                                            {provided.placeholder}
                                        </div>
                                    </div>
                                )}
                            </Droppable>
                        )
                    })}
                </div>
            </DragDropContext>
        </div>
    )
}
