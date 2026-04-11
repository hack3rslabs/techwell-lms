"use client"

import * as React from 'react'
import Image from 'next/image'
import {
    FileCheck,
    Search,
    Filter,
    Loader2,
    User,
    BookOpen,
    Clock,
    CheckCircle2,
    XCircle,
    Eye,
    MessageSquare,
    Download
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from '@/components/ui/dialog'
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger
} from '@/components/ui/tabs'
import api from '@/lib/api'

interface Submission {
    id: string
    content: string | null
    fileUrl: string | null
    grade: number | null
    feedback: string | null
    status: string
    createdAt: string
    user: {
        id: string
        name: string
        email: string
        avatar: string | null
    }
    lesson: {
        id: string
        title: string
        module: {
            title: string
            course: {
                title: string
            }
        }
    }
}

export default function AssessmentsPage() {
    const [submissions, setSubmissions] = React.useState<Submission[]>([])
    const [loading, setLoading] = React.useState(true)
    const [searchQuery, setSearchQuery] = React.useState('')
    const [activeTab, setActiveTab] = React.useState('pending')

    const [selectedSubmission, setSelectedSubmission] = React.useState<Submission | null>(null)
    const [gradeValue, setGradeValue] = React.useState('')
    const [feedbackValue, setFeedbackValue] = React.useState('')
    const [grading, setGrading] = React.useState(false)

    React.useEffect(() => {
        fetchSubmissions()
    }, [])

    const fetchSubmissions = async () => {
        try {
            const res = await api.get('/trainer/assessments')
            setSubmissions(res.data || [])
        } catch (error) {
            console.error('Failed to fetch submissions:', error)
            // Fallback to empty for now
            setSubmissions([])
        } finally {
            setLoading(false)
        }
    }

    const handleGrade = async () => {
        if (!selectedSubmission || !gradeValue) return

        setGrading(true)
        try {
            await api.post('/trainer/assessments/grade', {
                submissionId: selectedSubmission.id,
                grade: parseInt(gradeValue),
                feedback: feedbackValue,
                status: 'GRADED'
            })
            setSelectedSubmission(null)
            setGradeValue('')
            setFeedbackValue('')
            fetchSubmissions()
        } catch (error) {
            console.error('Failed to grade submission:', error)
            alert('Failed to grade submission')
        } finally {
            setGrading(false)
        }
    }

    const filteredSubmissions = submissions.filter(s => {
        const matchesSearch =
            s.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.lesson.title.toLowerCase().includes(searchQuery.toLowerCase())

        if (activeTab === 'pending') return matchesSearch && s.status === 'PENDING'
        if (activeTab === 'graded') return matchesSearch && s.status === 'GRADED'
        return matchesSearch
    })

    const pendingCount = submissions.filter(s => s.status === 'PENDING').length
    const gradedCount = submissions.filter(s => s.status === 'GRADED').length

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'PENDING':
                return <Badge variant="secondary" className="bg-amber-100 text-amber-700">Pending Review</Badge>
            case 'GRADED':
                return <Badge className="bg-green-100 text-green-700">Graded</Badge>
            case 'REJECTED':
                return <Badge variant="destructive">Rejected</Badge>
            default:
                return <Badge variant="outline">{status}</Badge>
        }
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-black text-slate-800">Assessment Center</h1>
                <p className="text-sm text-slate-500 mt-1">Review and grade student assignments</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="border-none shadow-sm">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-amber-100">
                            <Clock className="h-5 w-5 text-amber-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{pendingCount}</p>
                            <p className="text-xs text-slate-500 font-medium">Pending Review</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-sm">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-green-100">
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{gradedCount}</p>
                            <p className="text-xs text-slate-500 font-medium">Graded</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-sm">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-primary/10">
                            <FileCheck className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{submissions.length}</p>
                            <p className="text-xs text-slate-500 font-medium">Total Submissions</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Tabs & Search */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList>
                        <TabsTrigger value="pending">
                            Pending ({pendingCount})
                        </TabsTrigger>
                        <TabsTrigger value="graded">
                            Graded ({gradedCount})
                        </TabsTrigger>
                        <TabsTrigger value="all">All</TabsTrigger>
                    </TabsList>
                </Tabs>

                <div className="relative max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                        placeholder="Search by student or assignment..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>
            </div>

            {/* Submissions List */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : filteredSubmissions.length === 0 ? (
                <Card className="border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-16">
                        <FileCheck className="h-16 w-16 text-slate-300 mb-4" />
                        <h3 className="text-lg font-bold text-slate-600">
                            {activeTab === 'pending' ? 'No pending submissions' : 'No submissions found'}
                        </h3>
                        <p className="text-sm text-slate-500 mt-1">
                            {activeTab === 'pending'
                                ? 'All caught up! No assignments waiting for review.'
                                : 'No submissions match your search criteria.'}
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {filteredSubmissions.map((submission) => (
                        <Card key={submission.id} className="border-none shadow-sm hover:shadow-md transition-all">
                            <CardContent className="p-6">
                                <div className="flex flex-col md:flex-row md:items-center gap-4">
                                    {/* Student Info */}
                                    <div className="flex items-center gap-3 min-w-[200px]">
                                        <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center">
                                            {submission.user.avatar ? (
                                                <Image src={submission.user.avatar} alt="" width={40} height={40} className="h-10 w-10 rounded-full object-cover" />
                                            ) : (
                                                <User className="h-5 w-5 text-slate-500" />
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-800">{submission.user.name}</p>
                                            <p className="text-xs text-slate-500">{submission.user.email}</p>
                                        </div>
                                    </div>

                                    {/* Assignment Info */}
                                    <div className="flex-1">
                                        <p className="font-medium text-slate-700">{submission.lesson.title}</p>
                                        <p className="text-xs text-slate-500 flex items-center gap-1">
                                            <BookOpen className="h-3 w-3" />
                                            {submission.lesson.module.course.title} • {submission.lesson.module.title}
                                        </p>
                                    </div>

                                    {/* Status & Grade */}
                                    <div className="flex items-center gap-4">
                                        {getStatusBadge(submission.status)}
                                        {submission.grade !== null && (
                                            <span className="text-lg font-bold text-primary">{submission.grade}%</span>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                setSelectedSubmission(submission)
                                                setGradeValue(submission.grade?.toString() || '')
                                                setFeedbackValue(submission.feedback || '')
                                            }}
                                        >
                                            <Eye className="h-4 w-4 mr-1" />
                                            {submission.status === 'PENDING' ? 'Review' : 'View'}
                                        </Button>
                                        {submission.fileUrl && (
                                            <Button variant="ghost" size="icon" asChild>
                                                <a href={submission.fileUrl} target="_blank" rel="noopener noreferrer" title="Download attachment">
                                                    <Download className="h-4 w-4" />
                                                </a>
                                            </Button>
                                        )}
                                    </div>
                                </div>

                                {/* Submitted Date */}
                                <div className="mt-4 pt-4 border-t flex items-center justify-between text-xs text-slate-500">
                                    <span>Submitted {new Date(submission.createdAt).toLocaleString()}</span>
                                    {submission.feedback && (
                                        <span className="flex items-center gap-1">
                                            <MessageSquare className="h-3 w-3" />
                                            Feedback provided
                                        </span>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Grade Dialog */}
            <Dialog open={!!selectedSubmission} onOpenChange={() => setSelectedSubmission(null)}>
                <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Review Submission</DialogTitle>
                        <DialogDescription>
                            {selectedSubmission?.lesson.title} - {selectedSubmission?.user.name}
                        </DialogDescription>
                    </DialogHeader>

                    {selectedSubmission && (
                        <div className="space-y-6 py-4">
                            {/* Submission Content */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Submission Content</label>
                                <div className="p-4 bg-slate-50 rounded-lg border min-h-[100px]">
                                    {selectedSubmission.content ? (
                                        <p className="text-sm whitespace-pre-wrap">{selectedSubmission.content}</p>
                                    ) : (
                                        <p className="text-sm text-slate-500 italic">No text content submitted</p>
                                    )}
                                </div>
                                {selectedSubmission.fileUrl && (
                                    <Button variant="outline" size="sm" asChild className="mt-2">
                                        <a href={selectedSubmission.fileUrl} target="_blank" rel="noopener noreferrer">
                                            <Download className="h-4 w-4 mr-2" />
                                            Download Attachment
                                        </a>
                                    </Button>
                                )}
                            </div>

                            {/* Grade Input */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Grade (0-100) *</label>
                                <Input
                                    type="number"
                                    min="0"
                                    max="100"
                                    placeholder="Enter grade..."
                                    value={gradeValue}
                                    onChange={(e) => setGradeValue(e.target.value)}
                                />
                            </div>

                            {/* Feedback */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Feedback</label>
                                <Textarea
                                    placeholder="Provide constructive feedback to the student..."
                                    value={feedbackValue}
                                    onChange={(e) => setFeedbackValue(e.target.value)}
                                    rows={4}
                                />
                            </div>
                        </div>
                    )}

                    <DialogFooter className="gap-2">
                        <Button variant="outline" onClick={() => setSelectedSubmission(null)}>
                            Cancel
                        </Button>
                        {selectedSubmission?.status === 'PENDING' && (
                            <Button
                                onClick={handleGrade}
                                disabled={grading || !gradeValue}
                            >
                                {grading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                                Submit Grade
                            </Button>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
