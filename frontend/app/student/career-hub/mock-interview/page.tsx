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
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

export default function MockInterviewDashboard() {
    const { user } = useAuth()
    const router = useRouter()
    const [interviews, setInterviews] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isCreating, setIsCreating] = useState(false)
    const [openDialog, setOpenDialog] = useState(false)
    const [stats, setStats] = useState({ total: 0, completed: 0, averageScore: 0 })
    const [trendData, setTrendData] = useState<any[]>([])

    const [formData, setFormData] = useState({
        role: '',
        domain: '',
        technology: '',
        experience: '0',
        interviewMode: 'FULL',
        jobDescription: ''
    })
    const [resumeFile, setResumeFile] = useState<File | null>(null)

    async function fetchInterviews() {
        try {
            const res = await api.get('/interviews')
            setInterviews(res.data.interviews || [])
        } catch (error) {
            console.error(error)
        } finally {
            setIsLoading(false)
        }
    }


    async function fetchStats() {
        try {
            const res = await api.get('/interviews/stats/summary')
            setStats(res.data.stats || { total: 0, completed: 0, averageScore: 0 })
        } catch (error) {
            console.error(error)
        }
    }


    async function fetchTrendData() {
        try {
            const res = await api.get('/interviews/stats/trend')
            setTrendData(res.data.trend || [])
        } catch (error) {
            console.error(error)
        }
    }




    useEffect(() => {
        fetchInterviews()
        fetchStats()
        fetchTrendData()
    }, [])


    const handleCreate = async (e: any) => {
        e.preventDefault()
        setIsCreating(true)

        let uploadedResumeUrl = null;
        if (resumeFile) {
            try {
                const formDataFile = new FormData();
                formDataFile.append('file', resumeFile);
                const uploadRes = await api.post('/upload', formDataFile, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                uploadedResumeUrl = uploadRes.data.url || uploadRes.data.fileUrl || uploadRes.data.filePath;
            } catch (err) {
                console.error("Resume upload failed", err);
                toast.error("Failed to upload resume. Proceeding without it.");
            }
        }

        const exp = parseInt(formData.experience || '0')
        const difficulty = exp === 0 ? 'BEGINNER' : exp <= 2 ? 'INTERMEDIATE' : 'ADVANCED'
        try {
            const res = await api.post('/interviews', {
                role: formData.role,
                domain: formData.domain || formData.role,
                technology: formData.technology,
                resumeUrl: uploadedResumeUrl,
                jobDescription: formData.jobDescription,
                difficulty,
                interviewMode: formData.interviewMode,
                duration: formData.interviewMode === 'FULL' ? 30 : 10
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

            {trendData.length > 0 && (
                <Card className="w-full">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Performance Trend</CardTitle>
                        <CardDescription>Your technical and overall score progression</CardDescription>
                    </CardHeader>
                    <CardContent className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={trendData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} />
                                <Tooltip />
                                <Line type="monotone" dataKey="Overall" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                                <Line type="monotone" dataKey="Technical" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            )}

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
                                <label className="text-sm font-semibold">📄 Job Description (Optional)</label>
                                <textarea
                                    className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 min-h-[80px]"
                                    placeholder="Paste the target job description to tailor the interview..."
                                    value={formData.jobDescription}
                                    onChange={e => setFormData({...formData, jobDescription: e.target.value})}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold">📎 Upload Resume (Optional)</label>
                                <Input
                                    type="file"
                                    accept=".pdf,.doc,.docx"
                                    onChange={e => setResumeFile(e.target.files?.[0] || null)}
                                />
                                <p className="text-xs text-muted-foreground">AI will generate questions based on your resume experience.</p>
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
                            <div className="space-y-2">
                                <label className="text-sm font-semibold">⚡ Interview Mode</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {[
                                        { label: 'Full Interview', value: 'FULL', desc: 'HR + Tech + HR' },
                                        { label: 'Quick Tech', value: 'QUICK_TECH', desc: 'Tech Only' },
                                        { label: 'Quick HR', value: 'QUICK_HR', desc: 'Behavioral Only' },
                                    ].map(opt => (
                                        <button
                                            key={opt.value}
                                            type="button"
                                            onClick={() => setFormData({...formData, interviewMode: opt.value})}
                                            className={`p-2 rounded-lg border text-center text-xs transition-all ${
                                                formData.interviewMode === opt.value
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
                                {formData.interviewMode === 'FULL' && (
                                    <>
                                        <p>→ <strong>5 HR Opening Questions</strong> (Self intro, Strengths, Goals...)</p>
                                        <p>→ <strong>Technical Questions</strong> based on your role & skills</p>
                                        <p>→ <strong>5 HR Closing Questions</strong> (Salary, Notice Period...)</p>
                                        <p className="text-blue-600 mt-2">Duration: ~30 minutes.</p>
                                    </>
                                )}
                                {formData.interviewMode === 'QUICK_TECH' && (
                                    <>
                                        <p>→ <strong>Direct Technical Questions</strong> based on your role & skills</p>
                                        <p className="text-blue-600 mt-2">Duration: ~10 minutes. HR phase skipped.</p>
                                    </>
                                )}
                                {formData.interviewMode === 'QUICK_HR' && (
                                    <>
                                        <p>→ <strong>Behavioral & Situational Questions</strong> only.</p>
                                        <p className="text-blue-600 mt-2">Duration: ~10 minutes. Technical phase skipped.</p>
                                    </>
                                )}
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
