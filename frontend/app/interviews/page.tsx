"use client"

import * as React from 'react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { interviewApi } from '@/lib/api'
import { useAuth } from '@/lib/auth-context'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Video,
    Calendar,
    Clock,
    CheckCircle2,
    XCircle,
    PlayCircle,
    Loader2,
    Plus,
    Sparkles,
    FileText,
    Upload,
    Bot,
    Briefcase,
    Check,
    ArrowRight
} from 'lucide-react'
import { NewInterviewDialog } from '@/components/interviews/NewInterviewDialog'


interface Interview {
    id: string
    domain: string
    role: string
    company?: string
    difficulty: string
    status: string
    scheduledAt: string
    score?: number
}

const DOMAINS = [
    { value: 'TECHNOLOGY', label: 'Technology / Software' },
    { value: 'DATA_SCIENCE', label: 'Data Science & AI' },
    { value: 'PRODUCT', label: 'Product Management' },
    { value: 'DESIGN', label: 'UI/UX Design' },
    { value: 'BUSINESS', label: 'Business / Consulting' },
    { value: 'FINANCE', label: 'Finance & Banking' },
]

const DIFFICULTIES = [
    { value: 'BEGINNER', label: 'Beginner', desc: 'For freshers, 0-2 years experience' },
    { value: 'INTERMEDIATE', label: 'Intermediate', desc: 'For mid-level, 2-5 years experience' },
    { value: 'ADVANCED', label: 'Advanced', desc: 'For seniors, 5+ years experience' },
]

export default function InterviewsPage() {
    const router = useRouter()
    const { isAuthenticated, isLoading: authLoading } = useAuth()

    const [interviews, setInterviews] = React.useState<Interview[]>([])
    const [stats, setStats] = React.useState<{ total: number; completed: number; averageScore: number } | null>(null)
    const [isLoading, setIsLoading] = React.useState(true)
    // const [isPotentialModalOpen, setPotentialModalOpen] = useState(false) // Removed unused state

    // New Interview Form State
    const [isOpen, setIsOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [step, setStep] = useState(1) // 1: Details, 2: JD/Resume, 3: Review/Launch
    const [formData, setFormData] = useState({
        domain: 'TECHNOLOGY',
        role: '',
        company: '',
        technology: '',
        difficulty: 'INTERMEDIATE',
        duration: 30,
        jobDescription: '',
        resumeFile: null as File | null,
        resumeUrl: '',
        panelCount: 1, // Simplified for quick start
        type: 'INSTANT'
    })

    React.useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push('/login')
        }
    }, [authLoading, isAuthenticated, router])

    React.useEffect(() => {
        const fetchData = async () => {
            if (!isAuthenticated) return

            try {
                const [interviewsRes, statsRes] = await Promise.all([
                    interviewApi.getAll(),
                    interviewApi.getStats(),
                ])
                setInterviews(interviewsRes.data.interviews || [])
                setStats(statsRes.data.stats)
            } catch (error) {
                console.error('Failed to fetch interviews:', error)
            } finally {
                setIsLoading(false)
            }
        }

        if (isAuthenticated) {
            fetchData()
        }
    }, [isAuthenticated])

    const handleStartInterview = async (id: string) => {
        try {
            await interviewApi.start(id)
            setInterviews(interviews.map(i =>
                i.id === id ? { ...i, status: 'IN_PROGRESS' } : i
            ))
            router.push(`/interviews/${id}`)
        } catch (error) {
            console.error('Failed to start interview:', error)
        }
    }

    const updateFormData = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    const handleResumeUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            updateFormData('resumeFile', file)
            updateFormData('resumeUrl', file.name)
        }
    }

    const handleCreateInterview = async () => {
        if (!formData.role || !formData.technology) return

        setIsSubmitting(true)
        try {
            const response = await interviewApi.create({
                domain: formData.domain,
                role: formData.role,
                company: formData.company,
                difficulty: formData.difficulty,
                jobDescription: formData.jobDescription,
                panelCount: 1, // Defaulting to 1 for quick start
                duration: formData.duration,
                technology: formData.technology,
                selectedAvatars: ['tech-1'] // Default avatar
            })

            const interviewId = response.data.interview.id
            setIsOpen(false)
            // Redirect to start page (Tech Check)
            router.push(`/interviews/${interviewId}/start`)
        } catch (error) {
            console.error('Failed to create interview:', error)
        } finally {
            setIsSubmitting(false)
        }
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'SCHEDULED': return <Calendar className="h-4 w-4 text-blue-500" />
            case 'IN_PROGRESS': return <PlayCircle className="h-4 w-4 text-yellow-500" />
            case 'COMPLETED': return <CheckCircle2 className="h-4 w-4 text-green-500" />
            case 'CANCELLED': return <XCircle className="h-4 w-4 text-red-500" />
            default: return <Clock className="h-4 w-4" />
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'SCHEDULED': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
            case 'IN_PROGRESS': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
            case 'COMPLETED': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
            case 'CANCELLED': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
            default: return 'bg-gray-100 text-gray-700'
        }
    }

    if (authLoading || !isAuthenticated) {
        return (
            <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="container py-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold mb-2">AI Interview Prep</h1>
                    <p className="text-muted-foreground">
                        Practice with AI-powered mock interviews and get instant feedback
                    </p>
                </div>

                <NewInterviewDialog
                    open={isOpen}
                    onOpenChange={setIsOpen}
                    trigger={
                        <Button className="rounded-xl shadow-lg shadow-primary/20 hover:scale-105 transition-all">
                            <Plus className="mr-2 h-4 w-4" /> New Interview
                        </Button>
                    }
                />
            </div>

            {/* Stats Overview */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <div className="bg-card border border-border rounded-xl p-5">
                        <p className="text-sm font-medium text-muted-foreground">Total Interviews</p>
                        <p className="text-3xl font-bold text-foreground mt-1">{stats.total}</p>
                    </div>
                    <div className="bg-card border border-border rounded-xl p-5">
                        <p className="text-sm font-medium text-muted-foreground">Completed</p>
                        <p className="text-3xl font-bold text-foreground mt-1">{stats.completed}</p>
                    </div>
                    <div className="bg-card border border-border rounded-xl p-5">
                        <p className="text-sm font-medium text-muted-foreground">Average Score</p>
                        <p className="text-3xl font-bold text-foreground mt-1">{Math.round(stats.averageScore || 0)}%</p>
                    </div>
                </div>
            )}

            {/* Interview History */}
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Recent History</h2>
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : interviews.length === 0 ? (
                <div className="text-center py-20 bg-muted/30 rounded-3xl border border-dashed border-muted-foreground/20">
                    <Video className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-50" />
                    <h3 className="text-xl font-bold">No sessions practiced yet</h3>
                    <p className="text-muted-foreground mb-6">Launch your first AI mock interview to sharpen your skills.</p>
                    <Button size="lg" onClick={() => setIsOpen(true)} className="rounded-xl shadow-xl shadow-primary/20">
                        <Plus className="mr-2 h-5 w-5" /> Start Practice Interview
                    </Button>
                </div>
            ) : (
                <div className="space-y-4">
                    {interviews.map((interview) => (
                        <Card key={interview.id} className="hover:shadow-md transition-shadow">
                            <CardContent className="flex items-center justify-between py-4">
                                <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                                        <Video className="h-6 w-6 text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="font-medium">{interview.role}</h3>
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <span>{interview.domain}</span>
                                            {interview.company && <span>• {interview.company}</span>}
                                            <span>• {interview.difficulty}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full ${getStatusColor(interview.status)}`}>
                                        {getStatusIcon(interview.status)}
                                        {interview.status}
                                    </span>
                                    {interview.score !== undefined && interview.score !== null && (
                                        <span className="text-sm font-medium">{interview.score}%</span>
                                    )}
                                    {(interview.status === 'SCHEDULED' || interview.status === 'IN_PROGRESS') && (
                                        <Button size="sm" onClick={() => handleStartInterview(interview.id)}>
                                            {interview.status === 'IN_PROGRESS' ? 'Resume' : 'Start'}
                                        </Button>
                                    )}
                                    {interview.status === 'COMPLETED' && (
                                        <Button size="sm" variant="outline" onClick={() => router.push(`/interviews/${interview.id}/report`)}>
                                            View Report
                                        </Button>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )
            }
        </div >
    )
}
