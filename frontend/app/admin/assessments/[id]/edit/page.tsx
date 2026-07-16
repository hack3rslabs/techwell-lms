"use client"

import React, { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import api from '@/lib/api'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Loader2, Plus, Sparkles, Trash2, ArrowLeft } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export default function AssessmentEditorPage() {
    const params = useParams()
    const router = useRouter()
    const assessmentId = params.id as string

    const [assessment, setAssessment] = useState<any>(null)
    const [questions, setQuestions] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)

    const [isManualOpen, setIsManualOpen] = useState(false)
    const [isAiOpen, setIsAiOpen] = useState(false)
    const [isSaving, setIsSaving] = useState(false)

    // Manual Question Form
    const [manualForm, setManualForm] = useState({
        text: '',
        optA: '',
        optB: '',
        optC: '',
        optD: '',
        correctAnswer: 'A',
        marks: 1
    })

    // AI Generate Form
    const [aiForm, setAiForm] = useState({
        topic: '',
        count: 5
    })

    const fetchData = useCallback(async () => {
        try {
            const [assessmentRes, questionsRes] = await Promise.all([
                api.get(`/assessments/${assessmentId}`),
                api.get(`/assessments/${assessmentId}/questions`)
            ])
            setAssessment(assessmentRes.data)
            setQuestions(questionsRes.data)
        } catch (error) {
            console.error('Failed to fetch data', error)
            toast.error('Failed to load assessment data.')
        } finally {
            setIsLoading(false)
        }
    }, [assessmentId])

    useEffect(() => {
        fetchData()
    }, [fetchData])

    const handleManualSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSaving(true)
        try {
            const optionsMap: Record<string, string> = {
                A: manualForm.optA,
                B: manualForm.optB,
                C: manualForm.optC,
                D: manualForm.optD
            }
            const payload = {
                text: manualForm.text,
                type: 'MCQ',
                options: [manualForm.optA, manualForm.optB, manualForm.optC, manualForm.optD],
                correctAnswer: optionsMap[manualForm.correctAnswer],
                marks: manualForm.marks
            }

            await api.post(`/assessments/${assessmentId}/questions`, payload)
            toast.success('Question added successfully')
            setIsManualOpen(false)
            setManualForm({ text: '', optA: '', optB: '', optC: '', optD: '', correctAnswer: 'A', marks: 1 })
            fetchData()
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Failed to add question')
        } finally {
            setIsSaving(false)
        }
    }

    const handleAiSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSaving(true)
        const toastId = toast.loading('AI is generating questions...')
        try {
            const res = await api.post(`/assessments/${assessmentId}/generate-ai`, aiForm)
            toast.success(`Successfully generated ${res.data.count} questions!`, { id: toastId })
            setIsAiOpen(false)
            fetchData()
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Failed to generate questions. Ensure Gemini API key is configured.', { id: toastId })
        } finally {
            setIsSaving(false)
        }
    }

    const handleDeleteQuestion = async (qId: string) => {
        if (!confirm('Are you sure you want to delete this question?')) return
        try {
            await api.delete(`/assessments/${assessmentId}/questions/${qId}`)
            toast.success('Question deleted')
            fetchData()
        } catch (error) {
            toast.error('Failed to delete question')
        }
    }

    if (isLoading) {
        return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-indigo-600" /></div>
    }

    return (
        <div className="container mx-auto py-8">
            <div className="flex items-center gap-4 mb-8">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="w-5 h-5" />
                </Button>
                <div>
                    <h1 className="text-3xl font-bold">Edit Questions</h1>
                    <p className="text-muted-foreground">{assessment?.title} - {questions.length} Questions</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Actions Sidebar */}
                <div className="lg:col-span-1 space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Add Questions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Button className="w-full bg-indigo-600 hover:bg-indigo-700" onClick={() => setIsManualOpen(true)}>
                                <Plus className="w-4 h-4 mr-2" /> Manual Add
                            </Button>
                            <Button className="w-full border-indigo-200 text-indigo-700 hover:bg-indigo-50" variant="outline" onClick={() => {
                                setAiForm({ topic: assessment?.title || '', count: 5 })
                                setIsAiOpen(true)
                            }}>
                                <Sparkles className="w-4 h-4 mr-2 text-indigo-500" /> AI Generate
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                {/* Questions List */}
                <div className="lg:col-span-3 space-y-4">
                    {questions.length === 0 ? (
                        <div className="text-center py-16 border-2 border-dashed rounded-xl text-muted-foreground">
                            No questions found. Click "Add Questions" to get started.
                        </div>
                    ) : (
                        questions.map((q, i) => (
                            <Card key={q.id}>
                                <CardContent className="p-6">
                                    <div className="flex items-start justify-between">
                                        <div className="space-y-4 w-full">
                                            <div className="font-semibold text-lg flex gap-2">
                                                <span className="text-indigo-600">Q{i+1}.</span> {q.text}
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                                                {q.options.map((opt: string, idx: number) => (
                                                    <div key={idx} className={`p-2 rounded-md border ${opt === q.correctAnswer ? 'bg-emerald-50 border-emerald-200 text-emerald-900 font-medium' : 'bg-slate-50 border-slate-100'}`}>
                                                        {String.fromCharCode(65+idx)}. {opt}
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="text-xs text-muted-foreground font-medium">Marks: {q.marks}</div>
                                        </div>
                                        <Button variant="ghost" size="icon" onClick={() => handleDeleteQuestion(q.id)} className="text-red-500 hover:text-red-700 ml-4 shrink-0">
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            </div>

            {/* Manual Add Dialog */}
            <Dialog open={isManualOpen} onOpenChange={setIsManualOpen}>
                <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Manual Add Question</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleManualSubmit} className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Question Text</Label>
                            <Input required value={manualForm.text} onChange={e => setManualForm({...manualForm, text: e.target.value})} placeholder="What is the output of..." />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Option A</Label>
                                <Input required value={manualForm.optA} onChange={e => setManualForm({...manualForm, optA: e.target.value})} />
                            </div>
                            <div className="space-y-2">
                                <Label>Option B</Label>
                                <Input required value={manualForm.optB} onChange={e => setManualForm({...manualForm, optB: e.target.value})} />
                            </div>
                            <div className="space-y-2">
                                <Label>Option C</Label>
                                <Input required value={manualForm.optC} onChange={e => setManualForm({...manualForm, optC: e.target.value})} />
                            </div>
                            <div className="space-y-2">
                                <Label>Option D</Label>
                                <Input required value={manualForm.optD} onChange={e => setManualForm({...manualForm, optD: e.target.value})} />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Correct Answer</Label>
                                <Select value={manualForm.correctAnswer} onValueChange={v => setManualForm({...manualForm, correctAnswer: v})}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="A">Option A</SelectItem>
                                        <SelectItem value="B">Option B</SelectItem>
                                        <SelectItem value="C">Option C</SelectItem>
                                        <SelectItem value="D">Option D</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Marks</Label>
                                <Input type="number" required min="1" value={manualForm.marks} onChange={e => setManualForm({...manualForm, marks: parseInt(e.target.value)})} />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsManualOpen(false)}>Cancel</Button>
                            <Button type="submit" disabled={isSaving}>
                                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save Question
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* AI Generate Dialog */}
            <Dialog open={isAiOpen} onOpenChange={setIsAiOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-indigo-500" /> AI Question Generator
                        </DialogTitle>
                        <DialogDescription>
                            Generate multiple choice questions instantly using Google Gemini.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleAiSubmit} className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Topic</Label>
                            <Input required value={aiForm.topic} onChange={e => setAiForm({...aiForm, topic: e.target.value})} placeholder="e.g. Advanced JavaScript Concepts" />
                        </div>
                        <div className="space-y-2">
                            <Label>Number of Questions</Label>
                            <Select value={aiForm.count.toString()} onValueChange={v => setAiForm({...aiForm, count: parseInt(v)})}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="5">5 Questions</SelectItem>
                                    <SelectItem value="10">10 Questions</SelectItem>
                                    <SelectItem value="15">15 Questions</SelectItem>
                                    <SelectItem value="20">20 Questions</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsAiOpen(false)}>Cancel</Button>
                            <Button type="submit" disabled={isSaving} className="bg-indigo-600 hover:bg-indigo-700">
                                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Generate
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    )
}
