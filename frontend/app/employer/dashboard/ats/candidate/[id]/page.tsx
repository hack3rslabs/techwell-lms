"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import api from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Loader2, Mail, Phone, Calendar, Download, Send, Star, MessageSquare,
    Tag, Zap, CheckCircle2, XCircle, AlertTriangle, ArrowLeft,
    BookOpen
} from "lucide-react"

interface HistoryEntry {
    type?: string
    status?: string
    content?: string
    rating?: number
    tags?: string[]
    timestamp: string
    notes?: string
    addedBy?: string
}

interface ApplicationDetail {
    id: string
    status: string
    source: string
    atsScore: number
    createdAt: string
    externalName?: string
    externalEmail?: string
    externalPhone?: string
    coverLetter?: string
    resumeUrl?: string
    applicant?: {
        id: string
        name: string
        email: string
        phone?: string
        avatar?: string
    }
    statusHistory?: HistoryEntry[]
    job?: {
        title: string
        skills?: string
    }
}

function AIInterviewList({ userId }: { userId: string }) {
    interface Interview {
        id: string
        title: string
        status: string
        createdAt: string
        role?: string
        domain?: string
        difficulty?: string
        evaluation?: {
            overallScore: number
        }
    }
    const [interviews, setInterviews] = useState<Interview[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchInterviews = async () => {
            try {
                const res = await api.get(`/interviews/user/${userId}`)
                setInterviews(res.data.interviews || [])
            } catch (error) {
                console.error("Failed to fetch interviews", error)
            } finally {
                setLoading(false)
            }
        }
        fetchInterviews()
    }, [userId])

    if (loading) return <div className="text-center py-4"><Loader2 className="animate-spin h-5 w-5 mx-auto text-primary" /></div>
    if (interviews.length === 0) return <div className="text-center py-8 text-muted-foreground">No practice interviews found.</div>

    return (
        <div className="space-y-3">
            {interviews.map((interview) => (
                <div key={interview.id} className="flex items-center justify-between p-3 bg-white/50 border rounded-lg hover:bg-white transition-colors">
                    <div>
                        <div className="font-medium text-sm">{interview.role} ({interview.domain})</div>
                        <div className="text-xs text-muted-foreground gap-2 flex items-center">
                            <Badge variant="outline" className="text-[10px] h-4">{interview.difficulty}</Badge>
                            <span>{new Date(interview.createdAt).toLocaleDateString()}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        {interview.evaluation ? (
                            <Badge variant={interview.evaluation.overallScore >= 70 ? 'default' : 'secondary'} className={interview.evaluation.overallScore >= 70 ? 'bg-green-600' : 'bg-amber-500'}>
                                {interview.evaluation.overallScore}%
                            </Badge>
                        ) : (
                            <span className="text-xs text-muted-foreground">In Progress</span>
                        )}
                        <Button size="sm" variant="ghost" onClick={() => window.open(`/interviews/${interview.id}/report`, '_blank')}>
                            View Report
                        </Button>
                    </div>
                </div>
            ))}
        </div>
    )
}

export default function CandidateProfilePage() {
    const { id } = useParams()
    const router = useRouter()

    const [application, setApplication] = useState<ApplicationDetail | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [score, setScore] = useState<number | null>(null)

    // Notes
    const [noteContent, setNoteContent] = useState("")
    const [noteTags, setNoteTags] = useState("")
    const [submittingNote, setSubmittingNote] = useState(false)

    // Rating
    const [hoverRating, setHoverRating] = useState(0)
    const [selectedRating, setSelectedRating] = useState(0)

    const fetchData = useCallback(async () => {
        try {
            const res = await api.get(`/ats/applications/detail/${id}`)
            setApplication(res.data)
            setScore(res.data.atsScore)

            // Auto-mark as VIEWED if status is APPLIED
            if (res.data.status === 'APPLIED') {
                await api.patch(`/ats/status/${id}`, { status: 'VIEWED' })
                setApplication((prev) => prev ? ({ ...prev, status: 'VIEWED' }) : null)
            }

            // Extract most recent rating
            const ratings = (res.data.statusHistory || []).filter((h: HistoryEntry) => h.type === 'RATING')
            if (ratings.length > 0) {
                setSelectedRating(ratings[ratings.length - 1].rating || 0)
            }
        } catch (error) {
            console.error(error)
        } finally {
            setIsLoading(false)
        }
    }, [id])

    useEffect(() => {
        fetchData()
    }, [fetchData])

    const handleScore = async () => {
        const res = await api.post(`/ats/score/${id}`)
        setScore(res.data.atsScore)
        fetchData()
    }

    const handleStatusUpdate = async (newStatus: string) => {
        await api.patch(`/ats/status/${id}`, { status: newStatus })
        setApplication((prev) => prev ? ({ ...prev, status: newStatus }) : null)
    }

    const handleAddNote = async () => {
        if (!noteContent.trim()) return
        setSubmittingNote(true)
        try {
            const tags = noteTags.split(',').map(t => t.trim()).filter(Boolean)
            await api.post(`/ats/notes/${id}`, {
                content: noteContent,
                tags,
                rating: selectedRating || undefined
            })
            setNoteContent("")
            setNoteTags("")
            fetchData()
        } catch (error) {
            console.error('Failed to add note:', error)
        } finally {
            setSubmittingNote(false)
        }
    }

    const handleRate = async (rating: number) => {
        setSelectedRating(rating)
        try {
            await api.patch(`/ats/rate/${id}`, { rating })
        } catch (error) {
            console.error('Failed to rate:', error)
        }
    }

    if (isLoading) return (
        <div className="flex justify-center items-center h-[60vh]">
            <Loader2 className="animate-spin h-8 w-8 text-primary" />
        </div>
    )

    if (!application) return (
        <div className="text-center py-20 text-muted-foreground">
            <XCircle className="mx-auto h-12 w-12 mb-3 opacity-30" />
            Candidate not found
        </div>
    )

    const { applicant, externalName, externalEmail, externalPhone, source, status, coverLetter, resumeUrl } = application
    const name = applicant?.name || externalName || 'Unknown Candidate'
    const email = applicant?.email || externalEmail
    const phone = applicant?.phone || externalPhone || "N/A"

    // Separate notes vs status changes from history
    const notes = (application.statusHistory || []).filter(h => h.type === 'NOTE')
    const _statusHistory = (application.statusHistory || []).filter(h => !h.type || h.type === 'STATUS')
    const _ratings = (application.statusHistory || []).filter(h => h.type === 'RATING')

    const getStatusColor = (s: string) => {
        switch (s) {
            case 'APPLIED': case 'VIEWED': return 'bg-gray-400'
            case 'SCREENED': return 'bg-blue-500'
            case 'SHORTLISTED': return 'bg-purple-500'
            case 'INTERVIEW_SCHEDULED': case 'INTERVIEW_PENDING': return 'bg-violet-500'
            case 'SELECTED': case 'APPOINTED': case 'HIRED': return 'bg-green-500'
            case 'REJECTED': return 'bg-red-500'
            default: return 'bg-primary'
        }
    }

    return (
        <div className="max-w-5xl mx-auto py-6 px-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Button variant="ghost" onClick={() => router.back()} className="mb-4 gap-2">
                <ArrowLeft className="h-4 w-4" /> Back to Pipeline
            </Button>

            <div className="grid gap-6 md:grid-cols-3">
                {/* Sidebar Profile */}
                <Card className="md:col-span-1 glass-card">
                    <CardContent className="pt-6 flex flex-col items-center text-center">
                        <Avatar className="h-24 w-24 mb-4 ring-4 ring-primary/10">
                            <AvatarImage src={applicant?.avatar} />
                            <AvatarFallback className="text-xl bg-primary/10 text-primary font-bold">{name[0]}</AvatarFallback>
                        </Avatar>
                        <h2 className="text-xl font-bold">{name}</h2>
                        <p className="text-sm text-muted-foreground mb-2">{email}</p>

                        {/* Star Rating */}
                        <div className="flex items-center gap-1 mb-4">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    onClick={() => handleRate(star)}
                                    onMouseEnter={() => setHoverRating(star)}
                                    onMouseLeave={() => setHoverRating(0)}
                                    className="p-0.5 transition-transform hover:scale-125"
                                    aria-label={`Rate ${star} stars`}
                                >
                                    <Star
                                        className={`h-5 w-5 transition-colors ${(hoverRating || selectedRating) >= star
                                            ? 'fill-amber-400 text-amber-400'
                                            : 'text-gray-300'
                                            }`}
                                    />
                                </button>
                            ))}
                        </div>

                        <div className="flex flex-wrap gap-2 justify-center mb-6">
                            {source === 'INTERNAL' ? (
                                <Badge className="bg-blue-600 hover:bg-blue-700">TechWell Student</Badge>
                            ) : (
                                <Badge variant="secondary">External</Badge>
                            )}
                            <Badge variant="outline" className={`${status === 'HIRED' || status === 'APPOINTED' ? 'border-green-300 text-green-700' :
                                status === 'REJECTED' ? 'border-red-300 text-red-700' : ''
                                }`}>{status}</Badge>
                        </div>

                        <div className="w-full space-y-2 text-left text-sm">
                            <div className="flex items-center gap-2">
                                <Phone className="w-4 h-4 text-muted-foreground" /> {phone}
                            </div>
                            <div className="flex items-center gap-2">
                                <Mail className="w-4 h-4 text-muted-foreground" /> {email}
                            </div>
                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-muted-foreground" />
                                Applied {new Date(application.createdAt).toLocaleDateString()}
                            </div>
                        </div>

                        <div className="mt-6 w-full space-y-2">
                            {resumeUrl && (
                                <Button className="w-full" variant="outline" onClick={() => window.open(resumeUrl, '_blank')}>
                                    <Download className="mr-2 h-4 w-4" /> Resume
                                </Button>
                            )}
                            <Button className="w-full">
                                <Mail className="mr-2 h-4 w-4" /> Send Email
                            </Button>
                            <Button className="w-full" variant="secondary" onClick={() => router.push(`/employer/schedule-interview?appId=${application.id}`)}>
                                <Calendar className="mr-2 h-4 w-4" /> Schedule Interview
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Main Content */}
                <div className="md:col-span-2 space-y-6">
                    {/* ATS Score Card */}
                    <Card className="glass-card overflow-hidden">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg flex justify-between items-center">
                                <span className="flex items-center gap-2">
                                    <Zap className="h-5 w-5 text-primary" /> ATS Analysis
                                </span>
                                {score ? (
                                    <Badge variant={score >= 80 ? 'default' : 'secondary'} className={`text-base px-3 py-1 ${score >= 80 ? 'bg-green-600' : score >= 60 ? 'bg-amber-500' : 'bg-red-500'}`}>
                                        {score}% Match
                                    </Badge>
                                ) : (
                                    <Button size="sm" onClick={handleScore}>
                                        <Zap className="mr-1 h-3 w-3" /> Calculate Score
                                    </Button>
                                )}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {score && (
                                <div className="mb-3">
                                    <div className="h-3 bg-muted rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all duration-1000 ${score >= 80 ? 'bg-green-500' : score >= 60 ? 'bg-amber-500' : 'bg-red-500'}`}
                                            style={{ width: `${score}%` }}
                                        />
                                    </div>
                                </div>
                            )}
                            <p className="text-sm text-muted-foreground flex items-center gap-2">
                                {score && score >= 80 ? (
                                    <><CheckCircle2 className="h-4 w-4 text-green-500" /> Strong match! Recommended for interview.</>
                                ) : score && score >= 60 ? (
                                    <><AlertTriangle className="h-4 w-4 text-amber-500" /> Good match. Review experience details.</>
                                ) : score ? (
                                    <><XCircle className="h-4 w-4 text-red-500" /> Low match. Check resume manually.</>
                                ) : (
                                    <>Click calculate to run AI-powered analysis.</>
                                )}
                            </p>
                        </CardContent>
                    </Card>

                    <Tabs defaultValue="details">
                        <TabsList className="w-full grid grid-cols-4">
                            <TabsTrigger value="details">Details</TabsTrigger>
                            <TabsTrigger value="notes">Notes ({notes.length})</TabsTrigger>
                            <TabsTrigger value="resume">Resume</TabsTrigger>
                            <TabsTrigger value="history">History</TabsTrigger>
                        </TabsList>

                        <TabsContent value="details" className="space-y-4">
                            <Card className="glass-card">
                                <CardHeader>
                                    <CardTitle className="text-base">Cover Letter</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="bg-muted/50 p-4 rounded-lg text-sm whitespace-pre-wrap leading-relaxed">
                                        {coverLetter || "No cover letter provided."}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Job info */}
                            {application.job && (
                                <Card className="glass-card">
                                    <CardHeader>
                                        <CardTitle className="text-base flex items-center gap-2">
                                            <BookOpen className="h-4 w-4" /> Applied For
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <h3 className="font-semibold text-lg">{application.job.title}</h3>
                                        {application.job.skills && (
                                            <div className="flex flex-wrap gap-1.5 mt-2">
                                                {application.job.skills.split(',').map((s, i) => (
                                                    <Badge key={i} variant="outline" className="text-[10px]">{s.trim()}</Badge>
                                                ))}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            )}
                        </TabsContent>

                        {/* Notes Tab */}
                        <TabsContent value="notes" className="space-y-4">
                            {/* Add Note */}
                            <Card className="glass-card">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-base flex items-center gap-2">
                                        <MessageSquare className="h-4 w-4" /> Add Note
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <Textarea
                                        placeholder="Add your assessment, observations, or reminders about this candidate..."
                                        value={noteContent}
                                        onChange={(e) => setNoteContent(e.target.value)}
                                        rows={3}
                                    />
                                    <div className="flex items-center gap-3">
                                        <div className="flex-1">
                                            <Input
                                                placeholder="Tags (comma-separated): e.g. strong-communicator, culture-fit"
                                                value={noteTags}
                                                onChange={(e) => setNoteTags(e.target.value)}
                                                className="text-sm"
                                            />
                                        </div>
                                        <Button onClick={handleAddNote} disabled={submittingNote || !noteContent.trim()}>
                                            {submittingNote ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Existing Notes */}
                            {notes.length === 0 ? (
                                <Card className="glass-card">
                                    <CardContent className="py-8 text-center text-muted-foreground">
                                        <MessageSquare className="h-10 w-10 mx-auto mb-2 opacity-30" />
                                        <p>No notes yet. Add your first note above.</p>
                                    </CardContent>
                                </Card>
                            ) : (
                                <div className="space-y-3">
                                    {notes.slice().reverse().map((note, i) => (
                                        <Card key={i} className="glass-card">
                                            <CardContent className="py-4">
                                                <p className="text-sm mb-2">{note.content}</p>
                                                <div className="flex items-center justify-between">
                                                    <div className="flex flex-wrap gap-1">
                                                        {(note.tags || []).map((tag, ti) => (
                                                            <Badge key={ti} variant="outline" className="text-[10px] gap-1">
                                                                <Tag className="h-2.5 w-2.5" /> {tag}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                    <span className="text-[10px] text-muted-foreground">
                                                        {new Date(note.timestamp).toLocaleString()}
                                                    </span>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="resume">
                            <Card className="glass-card">
                                <CardContent className="p-0 h-[500px]">
                                    {resumeUrl ? (
                                        <iframe src={resumeUrl} className="w-full h-full rounded-md" title="Candidate resume" />
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-muted-foreground">
                                            <div className="text-center">
                                                <Download className="h-10 w-10 mx-auto mb-2 opacity-30" />
                                                No Resume Uploaded
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="history">
                            <Card className="glass-card">
                                <CardContent className="pt-6">
                                    <div className="space-y-4">
                                        {(application?.statusHistory || []).map((entry, i: number) => (
                                            <div key={i} className="flex gap-4">
                                                <div className="flex flex-col items-center">
                                                    <div className={`w-3 h-3 rounded-full ${getStatusColor(entry.status || '')} mt-1.5`} />
                                                    {i < ((application?.statusHistory?.length || 0) - 1) && <div className="w-0.5 flex-1 bg-border" />}
                                                </div>
                                                <div className="pb-4">
                                                    <div className="flex items-center gap-2">
                                                        <p className="font-semibold text-sm">
                                                            {entry.type === 'NOTE' ? '📝 Note Added' :
                                                                entry.type === 'RATING' ? `⭐ Rated ${entry.rating}/5` :
                                                                    entry.status}
                                                        </p>
                                                    </div>
                                                    <p className="text-xs text-muted-foreground mt-1">
                                                        {new Date(entry.timestamp).toLocaleString()}
                                                    </p>
                                                    {(entry.notes || entry.content) && (
                                                        <p className="text-sm text-muted-foreground mt-1 bg-muted/50 px-3 py-1.5 rounded-lg">
                                                            {entry.notes || entry.content}
                                                        </p>
                                                    )}
                                                    {entry.tags && entry.tags.length > 0 && (
                                                        <div className="flex gap-1 mt-1.5">
                                                            {entry.tags.map((tag, ti) => (
                                                                <Badge key={ti} variant="outline" className="text-[9px] h-4">{tag}</Badge>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* AI Interviews Tab */}
                        <TabsContent value="ai-interviews">
                            <Card className="glass-card">
                                <CardHeader>
                                    <CardTitle className="text-base flex items-center gap-2">
                                        <Zap className="h-4 w-4 text-amber-500" /> AI Interview Results
                                    </CardTitle>
                                    <CardDescription>
                                        Performance in practice interviews on TechWell.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {!application?.applicant?.id ? (
                                        <div className="text-center py-12 text-muted-foreground">
                                            <p>This is an external candidate. AI Interview history is not available.</p>
                                        </div>
                                    ) : (
                                        <AIInterviewList userId={application.applicant.id} />
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>

                    {/* Quick Actions */}
                    <Card className="glass-card">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base">Update Status</CardTitle>
                        </CardHeader>
                        <CardContent className="flex gap-2 flex-wrap">
                            <Button size="sm" variant="outline" onClick={() => handleStatusUpdate('SCREENED')}>Screen</Button>
                            <Button size="sm" variant="outline" onClick={() => handleStatusUpdate('SHORTLISTED')} className="border-purple-200 text-purple-700 hover:bg-purple-50">
                                Shortlist
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleStatusUpdate('INTERVIEW_SCHEDULED')} className="border-blue-200 text-blue-700 hover:bg-blue-50">
                                Schedule Interview
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleStatusUpdate('APPOINTED')} className="border-green-200 text-green-700 hover:bg-green-50">
                                <CheckCircle2 className="mr-1 h-3 w-3" /> Hire
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleStatusUpdate('REJECTED')} className="border-red-200 text-red-700 hover:bg-red-50">
                                <XCircle className="mr-1 h-3 w-3" /> Reject
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
