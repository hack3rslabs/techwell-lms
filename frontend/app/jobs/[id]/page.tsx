"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { MapPin, Briefcase, Building2, Banknote, Clock, Share2, Bookmark, CheckCircle, GraduationCap, Globe, FileText, Upload } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/lib/auth-context"
import api from "@/lib/api"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"

interface JobDetail {
    id: string
    title: string
    type: string
    location: string
    salary: string
    experience: string
    description: string
    requirements: string | null
    skills?: string
    createdAt: string
    employer: {
        id: string
        name: string
        employerProfile: {
            companyName: string
            logo: string | null
            website: string | null
            description: string | null
            industry: string | null
            companySize: string | null
            location: string | null
        }
    }
}

export default function JobDetailPage() {
    const params = useParams()
    const { user } = useAuth()
    const router = useRouter()
    const [job, setJob] = useState<JobDetail | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isApplying, setIsApplying] = useState(false)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [uploading, setUploading] = useState(false)
    
    const [applicationForm, setApplicationForm] = useState({
        resumeUrl: '',
        coverLetter: '',
        name: '',
        email: '',
        phone: ''
    })

    useEffect(() => {
        fetchJobDetails()
    }, [params.id])

    const fetchJobDetails = async () => {
        try {
            setIsLoading(true)
            const res = await api.get(`/jobs/${params.id}`)
            setJob(res.data)
        } catch (error) {
            console.error("Failed to fetch job", error)
            toast.error("Failed to load job details")
        } finally {
            setIsLoading(false)
        }
    }

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        const formData = new FormData()
        formData.append('file', file)

        setUploading(true)
        try {
            // Using the existing upload endpoint. Note: In a real app, this might need public access or special guest token.
            const res = await api.post('/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            })
            setApplicationForm(prev => ({ ...prev, resumeUrl: res.data.url }))
            toast.success("Resume uploaded successfully")
        } catch (error) {
            console.error("Upload failed", error)
            toast.error("Failed to upload resume. Please try a direct link or try again.")
        } finally {
            setUploading(false)
        }
    }

    const handleApply = async () => {
        if (!applicationForm.resumeUrl) {
            toast.error("Please upload your resume")
            return
        }
        if (!user && (!applicationForm.name || !applicationForm.email || !applicationForm.phone)) {
            toast.error("Please fill all required person fields")
            return
        }

        setIsApplying(true)
        try {
            if (user) {
                await api.post(`/jobs/${params.id}/apply`, {
                    resumeUrl: applicationForm.resumeUrl,
                    coverLetter: applicationForm.coverLetter
                })
            } else {
                await api.post(`/ats/apply/external`, {
                    jobId: params.id,
                    ...applicationForm
                })
            }

            toast.success('Application Submitted Successfully!')
            setIsDialogOpen(false)
            setApplicationForm({ resumeUrl: '', coverLetter: '', name: '', email: '', phone: '' })
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Failed to apply')
        } finally {
            setIsApplying(false)
        }
    }

    if (isLoading) return (
        <div className="min-h-screen grid place-items-center bg-slate-50">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                <p className="text-slate-500 font-medium animate-pulse uppercase tracking-widest text-xs">Fetching Intel...</p>
            </div>
        </div>
    )

    if (!job) return (
        <div className="min-h-screen grid place-items-center bg-slate-50">
            <Card className="p-10 text-center max-w-md mx-auto rounded-[2rem] border-dashed">
                <h3 className="text-2xl font-black text-slate-900 mb-2">Job Void Error</h3>
                <p className="text-slate-500 mb-6 font-medium">The opportunity you're looking for might have been closed or moved.</p>
                <Button onClick={() => router.push('/jobs')}>Back to Portal</Button>
            </Card>
        </div>
    )

    return (
        <div className="min-h-screen bg-gray-50/50 dark:bg-slate-950 pb-20">
            <div className="bg-white dark:bg-slate-900 border-b shadow-sm sticky top-16 z-20">
                <div className="container max-w-7xl mx-auto py-8 px-4">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div className="flex gap-6 items-center">
                            <Avatar className="h-20 w-20 rounded-3xl border bg-slate-50 p-2 shadow-sm shrink-0">
                                <AvatarImage src={job.employer.employerProfile?.logo || undefined} className="object-contain" />
                                <AvatarFallback className="rounded-3xl bg-slate-100 text-slate-400"><Building2 className="h-10 w-10" /></AvatarFallback>
                            </Avatar>
                            <div>
                                <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-tight mb-2">{job.title}</h1>
                                <div className="flex flex-wrap items-center gap-4 text-sm font-bold text-slate-500">
                                    <span className="flex items-center gap-1.5"><Building2 className="w-4 h-4 text-primary" /> {job.employer.employerProfile?.companyName}</span>
                                    <span className="hidden md:block">•</span>
                                    <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-primary" /> {job.location}</span>
                                    <span className="hidden md:block">•</span>
                                    <Badge variant="secondary" className="bg-blue-50 text-blue-600 border-blue-100 uppercase tracking-tighter text-[10px] font-black">{job.type.replace('_', ' ')}</Badge>
                                </div>
                            </div>
                        </div>

                        <div className="flex w-full md:w-auto gap-3">
                            <Button variant="outline" size="lg" className="flex-1 md:flex-none h-12 px-6 rounded-xl font-bold border-slate-200">
                                <Bookmark className="mr-2 h-4 w-4" /> Save
                            </Button>

                            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button size="lg" className="flex-1 md:flex-none h-12 px-10 text-md font-black bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-200 dark:shadow-none rounded-xl uppercase tracking-widest">
                                        {user ? 'Apply Now' : 'Apply as Guest'}
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto rounded-[2rem]">
                                    <DialogHeader>
                                        <DialogTitle className="text-2xl font-black">Apply for this Role</DialogTitle>
                                        <DialogDescription className="font-medium">
                                            Joining <span className="text-primary font-bold">{job.employer.employerProfile?.companyName}</span> as <span className="text-slate-900 font-bold">{job.title}</span>
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="grid gap-6 py-6">
                                        {!user && (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Full Name *</Label>
                                                    <Input
                                                        placeholder="e.g. Rahul Sharma"
                                                        className="h-12 bg-slate-50 border-slate-200 rounded-xl"
                                                        value={applicationForm.name}
                                                        onChange={e => setApplicationForm({ ...applicationForm, name: e.target.value })}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Contact Email *</Label>
                                                    <Input
                                                        type="email"
                                                        placeholder="name@example.com"
                                                        className="h-12 bg-slate-50 border-slate-200 rounded-xl"
                                                        value={applicationForm.email}
                                                        onChange={e => setApplicationForm({ ...applicationForm, email: e.target.value })}
                                                    />
                                                </div>
                                                <div className="space-y-2 md:col-span-2">
                                                    <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Phone Number *</Label>
                                                    <Input
                                                        type="tel"
                                                        placeholder="+91 XXXXX XXXXX"
                                                        className="h-12 bg-slate-50 border-slate-200 rounded-xl"
                                                        value={applicationForm.phone}
                                                        onChange={e => setApplicationForm({ ...applicationForm, phone: e.target.value })}
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        <div className="space-y-3">
                                            <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Your Resume *</Label>
                                            <div className="flex flex-col gap-4">
                                                <div className="relative group">
                                                    <div className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center transition-all ${applicationForm.resumeUrl ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-200 hover:border-blue-400'}`}>
                                                        {uploading ? (
                                                            <div className="flex flex-col items-center gap-2">
                                                                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                                                <span className="text-xs font-bold text-slate-500">Uploading File...</span>
                                                            </div>
                                                        ) : applicationForm.resumeUrl ? (
                                                            <div className="flex flex-col items-center gap-2 text-emerald-600">
                                                                <CheckCircle className="h-10 w-10" />
                                                                <span className="text-xs font-black uppercase">Resume Attached</span>
                                                                <Button variant="ghost" size="sm" className="h-6 text-[10px] text-slate-400" onClick={() => setApplicationForm({...applicationForm, resumeUrl: ''})}>Remove</Button>
                                                            </div>
                                                        ) : (
                                                            <>
                                                                <Upload className="h-10 w-10 text-slate-400 mb-3 group-hover:text-blue-500 transition-colors" />
                                                                <span className="text-sm font-bold text-slate-600">Upload PDF / DOCX</span>
                                                                <span className="text-[10px] text-slate-400 font-medium mt-1">Max file size 5MB</span>
                                                                <Input 
                                                                    type="file" 
                                                                    accept=".pdf,.doc,.docx" 
                                                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                                                    onChange={handleFileUpload}
                                                                />
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="relative">
                                                    <div className="absolute inset-0 flex items-center">
                                                        <span className="w-full border-t border-slate-100"></span>
                                                    </div>
                                                    <div className="relative flex justify-center text-[10px] items-center">
                                                        <span className="bg-white px-2 text-slate-400 font-bold uppercase">Or use link</span>
                                                    </div>
                                                </div>
                                                <div className="relative">
                                                    <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                                    <Input
                                                        placeholder="Direct Resume URL (Google Drive/LinkedIn)"
                                                        className="pl-10 h-11 bg-slate-50 border-slate-200 rounded-xl text-xs"
                                                        value={applicationForm.resumeUrl}
                                                        onChange={e => setApplicationForm({ ...applicationForm, resumeUrl: e.target.value })}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Brief Cover Letter</Label>
                                            <Textarea
                                                placeholder="Pitch yourself to the recruiter..."
                                                className="min-h-[120px] bg-slate-50 border-slate-200 rounded-2xl resize-none"
                                                value={applicationForm.coverLetter}
                                                onChange={e => setApplicationForm({ ...applicationForm, coverLetter: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <DialogFooter className="gap-2 sm:gap-0">
                                        <Button variant="ghost" className="font-bold" onClick={() => setIsDialogOpen(false)}>Discard</Button>
                                        <Button onClick={handleApply} disabled={isApplying || uploading} className="h-12 px-8 font-black uppercase tracking-widest bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-100 rounded-xl flex-1">
                                            {isApplying ? 'Submitting...' : 'Confirm Application'}
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container max-w-7xl mx-auto py-12 px-4 grid grid-cols-1 lg:grid-cols-12 gap-10">
                <div className="lg:col-span-8 space-y-8">
                    <Card className="rounded-[2.5rem] border-slate-200/60 shadow-xl shadow-slate-200/30 overflow-hidden">
                        <CardHeader className="bg-slate-50/50 p-8 border-b border-slate-100">
                            <CardTitle className="text-xl font-black text-slate-900 tracking-tight uppercase flex items-center gap-2">
                                <FileText className="w-5 h-5 text-blue-600" /> Deep Job Profile
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-8 space-y-10">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                <div className="space-y-1 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                    <div className="text-[10px] font-black text-slate-400 flex items-center gap-1 uppercase tracking-widest">
                                        <Clock className="h-3 w-3" /> Experience
                                    </div>
                                    <div className="font-black text-slate-900">{job.experience || 'Fresher'}</div>
                                </div>
                                <div className="space-y-1 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                    <div className="text-[10px] font-black text-slate-400 flex items-center gap-1 uppercase tracking-widest">
                                        <Banknote className="h-3 w-3" /> Yearly Package
                                    </div>
                                    <div className="font-black text-slate-900">₹{job.salary || 'Competitive'}</div>
                                </div>
                                <div className="space-y-1 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                    <div className="text-[10px] font-black text-slate-400 flex items-center gap-1 uppercase tracking-widest">
                                        <MapPin className="h-3 w-3" /> Location
                                    </div>
                                    <div className="font-black text-slate-900">{job.location}</div>
                                </div>
                                <div className="space-y-1 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                    <div className="text-[10px] font-black text-slate-400 flex items-center gap-1 uppercase tracking-widest">
                                        <Briefcase className="h-3 w-3" /> Agreement
                                    </div>
                                    <div className="font-black text-slate-900">{job.type.replace('_', ' ')}</div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Mission & Responsibility</h3>
                                <div className="text-slate-600 font-medium leading-relaxed whitespace-pre-wrap text-[15px]">
                                    {job.description}
                                </div>
                            </div>

                            {job.requirements && (
                                <div className="space-y-4 pt-4 border-t border-slate-50">
                                    <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Success Requirements</h3>
                                    <div className="text-slate-600 font-medium leading-relaxed whitespace-pre-wrap text-[15px]">
                                        {job.requirements}
                                    </div>
                                </div>
                            )}

                            {job.skills && (
                                <div className="space-y-4 pt-6 border-t border-slate-50">
                                    <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">Technical Stack</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {job.skills.split(',').map(skill => (
                                            <Badge key={skill} variant="secondary" className="px-4 py-1.5 bg-blue-50 text-blue-600 border border-blue-100 text-xs font-bold rounded-lg shadow-sm">
                                                {skill.trim()}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <div className="lg:col-span-4 space-y-8">
                    <Card className="rounded-[2.5rem] border-slate-200/60 shadow-xl shadow-slate-200/30 overflow-hidden">
                        <CardHeader className="bg-slate-50/50 p-6 border-b border-slate-100">
                            <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-900">About Employer</CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-6">
                            <div className="flex items-center gap-4">
                                <Avatar className="h-12 w-12 rounded-xl border bg-slate-50 p-1 shadow-sm shrink-0">
                                    <AvatarImage src={job.employer.employerProfile?.logo || undefined} className="object-contain" />
                                    <AvatarFallback className="rounded-xl bg-slate-100 text-slate-400 font-bold"><Building2 className="h-6 w-6" /></AvatarFallback>
                                </Avatar>
                                <div>
                                    <h4 className="font-black text-slate-900 tracking-tight">{job.employer.employerProfile?.companyName}</h4>
                                    <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{job.employer.employerProfile?.industry || 'Tech Innovator'}</p>
                                </div>
                            </div>

                            {job.employer.employerProfile?.description && (
                                <p className="text-[13px] text-slate-500 font-medium leading-relaxed">
                                    {job.employer.employerProfile.description}
                                </p>
                            )}

                            <div className="space-y-3 pt-2 border-t border-slate-50">
                                {job.employer.employerProfile?.website && (
                                    <a href={job.employer.employerProfile.website} target="_blank" className="flex items-center gap-3 text-xs font-bold text-slate-600 hover:text-blue-600 transition-colors bg-slate-50 p-3 rounded-xl border border-slate-100 group">
                                        <Globe className="h-4 w-4 text-primary group-hover:rotate-12 transition-transform" />
                                        <span className="truncate">Professional Website</span>
                                    </a>
                                )}
                                <div className="flex items-center gap-3 text-xs font-bold text-slate-400 bg-slate-50 p-3 rounded-xl border border-slate-100 border-dashed">
                                    <CheckCircle className="h-4 w-4 text-emerald-500" />
                                    <span>Verified Hiring Partner</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="rounded-[2.5rem] border-none bg-slate-900 text-white p-8 overflow-hidden relative group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl -translate-y-10 translate-x-10 group-hover:scale-150 transition-transform duration-700" />
                        <div className="relative z-10 space-y-4">
                            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center border border-white/10 mb-4">
                                <GraduationCap className="w-6 h-6 text-blue-400" />
                            </div>
                            <h3 className="text-xl font-black tracking-tight leading-tight">Career Growth Tips</h3>
                            <p className="text-xs text-slate-400 font-medium leading-relaxed">Make sure to tailor your resume according to the Technical Stack listed in the job description to increase your Profile Sync score.</p>
                            <Button className="w-full h-12 bg-white text-slate-950 hover:bg-blue-50 font-black uppercase tracking-widest text-[10px] rounded-xl shadow-lg shadow-white/5" asChild>
                                <Link href="/profile">Audit My Profile</Link>
                            </Button>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    )
}
