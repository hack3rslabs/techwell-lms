"use client"

import { useState, useEffect } from "react"
import { Plus, Settings, Users, BookOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import api from "@/lib/api"
import Link from "next/link"

interface Assessment {
    id: string
    title: string
    description: string
    type: string
    duration: number
    passingScore: number
    createdAt: string
    _count?: {
        questions: number
        attempts: number
    }
}

export default function EmployerAssessmentsPage() {
    const [assessments, setAssessments] = useState<Assessment[]>([])
    const [loading, setLoading] = useState(true)
    const [isCreateOpen, setIsCreateOpen] = useState(false)
    const [formData, setFormData] = useState({ title: '', description: '', type: 'MCQ', duration: 60, passingScore: 50 })
    const [submitting, setSubmitting] = useState(false)

    const fetchAssessments = async () => {
        try {
            const res = await api.get('/assessments')
            setAssessments(res.data)
        } catch (error) {
            toast.error("Failed to load assessments")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchAssessments()
    }, [])

    const handleCreate = async () => {
        setSubmitting(true)
        try {
            const res = await api.post('/assessments', formData)
            toast.success("Assessment created successfully")
            setIsCreateOpen(false)
            fetchAssessments()
        } catch (error) {
            toast.error("Failed to create assessment")
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className="container py-8 max-w-6xl">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Assessments & Quizzes</h1>
                    <p className="text-slate-500 mt-1">Create coding challenges and MCQ tests to screen candidates.</p>
                </div>
                <Button onClick={() => setIsCreateOpen(true)} className="gap-2 bg-indigo-600 hover:bg-indigo-700">
                    <Plus className="w-4 h-4" /> New Assessment
                </Button>
            </div>

            {loading ? (
                <div className="text-center py-12 text-slate-400">Loading...</div>
            ) : assessments.length === 0 ? (
                <div className="text-center py-20 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
                    <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-slate-700">No assessments yet</h3>
                    <p className="text-slate-500 mb-6 mt-2">Create your first test to start screening candidates.</p>
                    <Button onClick={() => setIsCreateOpen(true)} variant="outline">Create Assessment</Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {assessments.map(assessment => (
                        <Card key={assessment.id} className="hover:border-indigo-200 hover:shadow-md transition-all">
                            <CardHeader className="pb-4">
                                <div className="flex justify-between items-start">
                                    <div className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2 py-1 rounded">
                                        {assessment.type}
                                    </div>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 -mt-2 -mr-2">
                                        <Settings className="w-4 h-4 text-slate-400" />
                                    </Button>
                                </div>
                                <CardTitle className="text-lg mt-3 line-clamp-1">{assessment.title}</CardTitle>
                                <CardDescription className="line-clamp-2">{assessment.description}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div className="bg-slate-50 p-3 rounded-lg text-center">
                                        <div className="text-xl font-black text-slate-700">{assessment._count?.questions || 0}</div>
                                        <div className="text-xs text-slate-500 font-medium">Questions</div>
                                    </div>
                                    <div className="bg-slate-50 p-3 rounded-lg text-center">
                                        <div className="text-xl font-black text-slate-700">{assessment._count?.attempts || 0}</div>
                                        <div className="text-xs text-slate-500 font-medium">Attempts</div>
                                    </div>
                                </div>
                                <Link href={`/admin/assessments/${assessment.id}/edit`}>
                                    <Button variant="outline" className="w-full text-indigo-600 border-indigo-200 hover:bg-indigo-50">
                                        Manage Questions
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create Assessment</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Title</Label>
                            <Input value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} placeholder="e.g. React Frontend Challenge" />
                        </div>
                        <div className="space-y-2">
                            <Label>Description</Label>
                            <Input value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} placeholder="Brief description..." />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Type</Label>
                                <Select value={formData.type} onValueChange={v => setFormData({ ...formData, type: v })}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="MCQ">Multiple Choice</SelectItem>
                                        <SelectItem value="CODING">Coding Challenge</SelectItem>
                                        <SelectItem value="MIXED">Mixed (Both)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Duration (mins)</Label>
                                <Input type="number" value={formData.duration} onChange={e => setFormData({ ...formData, duration: parseInt(e.target.value) || 60 })} />
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                        <Button onClick={handleCreate} disabled={!formData.title || submitting} className="bg-indigo-600 hover:bg-indigo-700">
                            Create Assessment
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
