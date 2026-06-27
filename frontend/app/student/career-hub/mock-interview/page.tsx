"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Loader2, Plus, BrainCircuit, Trophy } from 'lucide-react'
import api from '@/lib/api'
import { useAuth } from '@/lib/auth-context'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function MockInterviewDashboard() {
    const { user } = useAuth()
    const router = useRouter()
    const [interviews, setInterviews] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isCreating, setIsCreating] = useState(false)
    const [openDialog, setOpenDialog] = useState(false)
    const [stats, setStats] = useState({ total: 0, completed: 0, averageScore: 0 })

    const [formData, setFormData] = useState({
        role: '',
        domain: '',
        technology: '',
        experience: '0',
    })

    useEffect(() => {
        fetchInterviews()
        fetchStats()
    }, [])

    const fetchInterviews = async () => {
        try {
            const res = await api.get('/interviews')
            setInterviews(res.data.interviews || [])
        } catch (error) {
            console.error(error)
        } finally {
            setIsLoading(false)
        }
    }

    const fetchStats = async () => {
        try {
            const res = await api.get('/interviews/stats/summary')
            setStats(res.data.stats || { total: 0, completed: 0, averageScore: 0 })
        } catch (error) {
            console.error(error)
        }
    }

    const handleCreate = async (e: any) => {
        e.preventDefault()
        setIsCreating(true)
        const exp = parseInt(formData.experience || '0')
        const difficulty = exp === 0 ? 'BEGINNER' : exp <= 2 ? 'INTERMEDIATE' : 'ADVANCED'
        try {
            const res = await api.post('/interviews', {
                role: formData.role,
                domain: formData.domain || formData.role,
                technology: formData.technology,
                resumeUrl: null,
                difficulty,
                duration: 30  // default; user picks this on the pre-interview screen
            })
            toast.success('Interview created! Configure your session.')
            setOpenDialog(false)
            router.push(`/student/career-hub/mock-interview/${res.data.interview.id}`)
        } catch (error: any) {
            toast.error(error.response?.data?.error || error.response?.data?.message || 'Failed to create interview')
        } finally {
            setIsCreating(false)
        }
    }

    return (
        <div className="container mx-auto p-6 max-w-6xl space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                        <BrainCircuit className="h-8 w-8 text-primary" /> 
                        AI Mock Interviews
                    </h1>
                    <p className="text-muted-foreground mt-1">Practice and improve your interview skills with AI.</p>
                </div>

                <div className="flex gap-4">
                    <Card className="bg-primary/5 border-primary/20">
                        <CardContent className="p-4 flex items-center gap-4">
                            <div>
                                <p className="text-sm text-muted-foreground">Plan Status</p>
                                <p className="font-bold">{(user as any)?.plan === 'FREE' || (user as any)?.plan === 'BASIC' ? 'Basic (5 limit)' : 'Premium (Unlimited)'}</p>
                            </div>
                            <div className="h-8 w-px bg-primary/20"></div>
                            <div>
                                <p className="text-sm text-muted-foreground">Completed</p>
                                <p className="font-bold">{stats.completed} Interviews</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Dialog open={openDialog} onOpenChange={setOpenDialog}>
                    <DialogTrigger asChild>
                        <Card className="border-dashed border-2 hover:border-primary/50 hover:bg-primary/5 transition-colors cursor-pointer group">
                            <CardContent className="flex flex-col items-center justify-center h-48 text-center p-6 space-y-4">
                                <div className="p-4 bg-primary/10 rounded-full group-hover:scale-110 transition-transform">
                                    <Plus className="h-8 w-8 text-primary" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg">Start New Interview</h3>
                                    <p className="text-sm text-muted-foreground">Generate AI questions based on your role.</p>
                                </div>
                            </CardContent>
                        </Card>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[480px]">
                        <DialogHeader>
                            <DialogTitle className="text-xl">Create AI Mock Interview</DialogTitle>
                            <DialogDescription>
                                Fill in your job details. The AI will generate a structured interview with HR + Technical questions tailored to your profile.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleCreate} className="space-y-4 pt-2">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold">🎯 Target Role / Position *</label>
                                <Input
                                    placeholder="e.g. Full Stack Developer, Marketing Executive, BPO Executive"
                                    required
                                    value={formData.role}
                                    onChange={e => setFormData({...formData, role: e.target.value})}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold">🏢 Domain / Industry *</label>
                                <Input
                                    placeholder="e.g. IT, Healthcare, Finance, Education, BPO"
                                    required
                                    value={formData.domain}
                                    onChange={e => setFormData({...formData, domain: e.target.value})}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold">💻 Key Skills / Technologies</label>
                                <Input
                                    placeholder="e.g. React, Node.js, Excel, Customer Service, Python"
                                    value={formData.technology}
                                    onChange={e => setFormData({...formData, technology: e.target.value})}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold">📅 Years of Experience</label>
                                <div className="grid grid-cols-4 gap-2">
                                    {[
                                        { label: 'Fresher', value: '0', desc: '< 1 yr' },
                                        { label: 'Junior', value: '1', desc: '1-2 yrs' },
                                        { label: 'Mid-Level', value: '3', desc: '3-5 yrs' },
                                        { label: 'Senior', value: '6', desc: '6+ yrs' },
                                    ].map(opt => (
                                        <button
                                            key={opt.value}
                                            type="button"
                                            onClick={() => setFormData({...formData, experience: opt.value})}
                                            className={`p-2 rounded-lg border text-center text-xs transition-all ${
                                                formData.experience === opt.value
                                                    ? 'border-primary bg-primary/10 text-primary font-bold'
                                                    : 'border-slate-200 hover:border-slate-300'
                                            }`}
                                        >
                                            <div className="font-semibold">{opt.label}</div>
                                            <div className="text-muted-foreground">{opt.desc}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-800 space-y-1">
                                <p className="font-semibold">📋 Your interview will follow this structure:</p>
                                <p>→ <strong>5 HR Opening Questions</strong> (Self intro, Strengths, Goals...)</p>
                                <p>→ <strong>Technical Questions</strong> based on your role & skills</p>
                                <p>→ <strong>5 HR Closing Questions</strong> (Salary, Notice Period...)</p>
                                <p className="text-blue-600">You will choose the interviewer panel & duration on the next screen.</p>
                            </div>
                            <div className="flex justify-end gap-3 pt-2">
                                <Button type="button" variant="outline" onClick={() => setOpenDialog(false)}>Cancel</Button>
                                <Button type="submit" disabled={isCreating} className="min-w-[140px]">
                                    {isCreating ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating...</> : '🚀 Create Interview'}
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>

                {isLoading ? (
                    <div className="col-span-2 flex justify-center items-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
                ) : (
                    interviews.map((interview) => (
                        <Card key={interview.id} className="group relative">
                            <CardHeader className="pb-2">
                                <div className="flex justify-between items-start">
                                    <CardTitle className="text-lg line-clamp-1">{interview.role}</CardTitle>
                                    {interview.status === 'COMPLETED' ? (
                                        <div className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-semibold">Score: {interview.evaluation?.overallScore || 0}%</div>
                                    ) : (
                                        <div className="bg-yellow-100 text-yellow-700 text-xs px-2 py-1 rounded-full font-semibold">Pending</div>
                                    )}
                                </div>
                                <CardDescription>{interview.domain}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-xs text-muted-foreground mb-4">
                                    Created: {new Date(interview.createdAt).toLocaleDateString()}
                                </p>
                                <div className="flex gap-2">
                                    {interview.status === 'COMPLETED' ? (
                                        <Button variant="outline" className="w-full" asChild>
                                            <Link href={`/student/career-hub/mock-interview/${interview.id}/feedback`}>View Feedback</Link>
                                        </Button>
                                    ) : (
                                        <Button className="w-full" asChild>
                                            <Link href={`/student/career-hub/mock-interview/${interview.id}`}>Continue Interview</Link>
                                        </Button>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    )
}
