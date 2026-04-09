"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { MapPin, Briefcase, Building2, Banknote, Clock, Share2, Bookmark, CheckCircle, GraduationCap, Globe } from "lucide-react"
import _Link from "next/link"

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

interface JobDetail {
    id: string
    title: string
    type: string
    location: string
    salary: string
    experience: string
    description: string
    requirements: string | null
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
    const _router = useRouter()
    const [job, _setJob] = useState<JobDetail | null>(null)
    const [isLoading, _setIsLoading] = useState(true)
    const [isApplying, setIsApplying] = useState(false)
    const [applicationForm, setApplicationForm] = useState({
        resumeUrl: '',
        coverLetter: '',
        name: '',
        email: '',
        phone: ''
    })

    const handleApply = async () => {
        // Validate required fields
        if (!applicationForm.resumeUrl) {
            alert("Resume Link is required")
            return
        }
        if (!user && (!applicationForm.name || !applicationForm.email || !applicationForm.phone)) {
            alert("Please fill all required fields")
            return
        }

        setIsApplying(true)
        try {
            if (user) {
                // Internal Apply
                await api.post(`/jobs/${params.id}/apply`, {
                    resumeUrl: applicationForm.resumeUrl,
                    coverLetter: applicationForm.coverLetter
                })
            } else {
                // External Apply (Guest)
                await api.post(`/ats/apply/external`, {
                    jobId: params.id,
                    ...applicationForm
                })
            }

            alert('Application Submitted Successfully!')
            setApplicationForm({ resumeUrl: '', coverLetter: '', name: '', email: '', phone: '' })
            // Close dialog logic would go here if controlled
        } catch (error: unknown) {
            const errorMessage = (error as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Failed to apply'
            alert(errorMessage)
        } finally {
            setIsApplying(false)
        }
    }

    if (isLoading) return <div className="min-h-screen grid place-items-center">Loading...</div>
    if (!job) return <div className="min-h-screen grid place-items-center">Job not found</div>

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-950 pb-20">
            {/* Header / Breacrumbs would go here */}

            <div className="bg-white dark:bg-slate-900 border-b shadow-sm sticky top-16 z-20">
                <div className="container py-6">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="flex gap-4 items-center">
                            <Avatar className="h-16 w-16 rounded-xl border bg-white p-2">
                                <AvatarImage src={job.employer.employerProfile?.logo || ''} className="object-contain" />
                                <AvatarFallback className="rounded-xl"><Building2 className="h-8 w-8 text-muted-foreground" /></AvatarFallback>
                            </Avatar>
                            <div>
                                <h1 className="text-2xl font-bold">{job.title}</h1>
                                <div className="flex items-center gap-2 text-muted-foreground font-medium">
                                    <span>{job.employer.employerProfile?.companyName}</span>
                                    <span>•</span>
                                    <span>{job.location}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <Button variant="outline" size="lg">
                                <Bookmark className="mr-2 h-4 w-4" /> Save
                            </Button>

                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button size="lg" className="px-8">
                                        {user ? 'Apply Now' : 'Apply as Guest'}
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
                                    <DialogHeader>
                                        <DialogTitle>Apply to {job.employer.employerProfile?.companyName}</DialogTitle>
                                        <DialogDescription>
                                            Applying for <span className="font-semibold text-primary">{job.title}</span>
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="grid gap-4 py-4">
                                        {!user && (
                                            <>
                                                <div className="space-y-2">
                                                    <Label>Full Name <span className="text-red-500">*</span></Label>
                                                    <Input
                                                        placeholder="John Doe"
                                                        value={applicationForm.name || ''}
                                                        onChange={e => setApplicationForm({ ...applicationForm, name: e.target.value })}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Email <span className="text-red-500">*</span></Label>
                                                    <Input
                                                        type="email"
                                                        placeholder="john@example.com"
                                                        value={applicationForm.email || ''}
                                                        onChange={e => setApplicationForm({ ...applicationForm, email: e.target.value })}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Phone <span className="text-red-500">*</span></Label>
                                                    <Input
                                                        type="tel"
                                                        placeholder="+1 234 567 890"
                                                        value={applicationForm.phone || ''}
                                                        onChange={e => setApplicationForm({ ...applicationForm, phone: e.target.value })}
                                                    />
                                                </div>
                                            </>
                                        )}
                                        <div className="space-y-2">
                                            <Label>Resume Link (Google Drive / LinkedIn) <span className="text-red-500">*</span></Label>
                                            <Input
                                                placeholder="https://..."
                                                value={applicationForm.resumeUrl}
                                                onChange={e => setApplicationForm({ ...applicationForm, resumeUrl: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Cover Letter / Additional Notes</Label>
                                            <Textarea
                                                placeholder="Why are you a good fit?"
                                                className="min-h-[100px]"
                                                value={applicationForm.coverLetter}
                                                onChange={e => setApplicationForm({ ...applicationForm, coverLetter: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        {!user && (
                                            <div className="text-xs text-muted-foreground mr-auto max-w-[200px]">
                                                By applying, you agree to our Terms and Privacy Policy.
                                            </div>
                                        )}
                                        <Button onClick={handleApply} disabled={isApplying}>
                                            {isApplying ? 'Applying...' : 'Submit Application'}
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-8 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Job Description</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Key Highlights */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 dark:bg-slate-900 rounded-lg">
                                <div className="space-y-1">
                                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                                        <Briefcase className="h-3 w-3" /> Experience
                                    </div>
                                    <div className="font-semibold text-sm">{job.experience || 'Fresher'}</div>
                                </div>
                                <div className="space-y-1">
                                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                                        <Banknote className="h-3 w-3" /> Salary
                                    </div>
                                    <div className="font-semibold text-sm">{job.salary || 'Not Disclosed'}</div>
                                </div>
                                <div className="space-y-1">
                                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                                        <MapPin className="h-3 w-3" /> Location
                                    </div>
                                    <div className="font-semibold text-sm">{job.location}</div>
                                </div>
                                <div className="space-y-1">
                                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                                        <Clock className="h-3 w-3" /> Job Type
                                    </div>
                                    <div className="font-semibold text-sm">{job.type.replace('_', ' ')}</div>
                                </div>
                            </div>

                            <div className="prose dark:prose-invert max-w-none text-foreground/90">
                                <h3 className="font-semibold text-lg mb-2">Role & Responsibilities</h3>
                                <div className="whitespace-pre-wrap leading-relaxed">{job.description}</div>
                            </div>

                            {job.requirements && (
                                <div className="prose dark:prose-invert max-w-none text-foreground/90">
                                    <h3 className="font-semibold text-lg mb-2">Requirements</h3>
                                    <div className="whitespace-pre-wrap leading-relaxed">{job.requirements}</div>
                                </div>
                            )}

                            <Separator />

                            <div>
                                <h3 className="font-semibold mb-3">Key Skills</h3>
                                <div className="flex flex-wrap gap-2">
                                    {['React', 'Next.js', 'Typescript', 'Node.js', 'PostgreSQL'].map(skill => (
                                        <Badge key={skill} variant="secondary" className="px-3 py-1 font-normal text-sm">
                                            {skill}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="lg:col-span-4 space-y-6">
                    {/* Company Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">About Company</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {job.employer.employerProfile?.description && (
                                <p className="text-sm text-muted-foreground line-clamp-4">
                                    {job.employer.employerProfile.description}
                                </p>
                            )}

                            <div className="space-y-3 pt-2">
                                {job.employer.employerProfile?.website && (
                                    <div className="flex items-center gap-2 text-sm">
                                        <Globe className="h-4 w-4 text-primary" />
                                        <a href={job.employer.employerProfile.website} target="_blank" className="text-primary hover:underline truncate">
                                            {job.employer.employerProfile.website}
                                        </a>
                                    </div>
                                )}
                                {job.employer.employerProfile?.industry && (
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Building2 className="h-4 w-4" />
                                        <span>{job.employer.employerProfile.industry}</span>
                                    </div>
                                )}
                                {job.employer.employerProfile?.companySize && (
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <UsersIcon className="h-4 w-4" />
                                        <span>{job.employer.employerProfile.companySize} Employees</span>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Similar Jobs Placeholder */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Similar Jobs</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">More jobs like this coming soon.</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}

function UsersIcon({ className }: { className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
    )
}
