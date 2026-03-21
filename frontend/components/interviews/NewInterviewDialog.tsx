"use client"

import * as React from 'react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { interviewApi } from '@/lib/api'
import { useAuth } from '@/lib/auth-context'
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
    Loader2,
    Plus,
    Sparkles,
    FileText,
    Upload,
    ArrowRight,
    Lock,
    Crown,
    Check
} from 'lucide-react'

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

interface NewInterviewDialogProps {
    trigger?: React.ReactNode
    open?: boolean
    onOpenChange?: (open: boolean) => void
}

export function NewInterviewDialog({ trigger, open: controlledOpen, onOpenChange }: NewInterviewDialogProps) {
    const router = useRouter()
    const { user } = useAuth()

    // Internal state if not controlled
    const [internalOpen, setInternalOpen] = useState(false)
    const isControlled = open !== undefined && onOpenChange !== undefined
    const isOpen = isControlled ? controlledOpen : internalOpen
    const setIsOpen = isControlled ? onOpenChange : setInternalOpen

    const [isSubmitting, setIsSubmitting] = useState(false)
    const [step, setStep] = useState(1) // 1: Details, 2: JD/Resume
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
        panelCount: 1,
        type: 'INSTANT'
    })

    // Check access - FORCED TRUE FOR TESTING
    const hasAccess = true; // user?.hasUnlimitedInterviews || user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN'

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
                panelCount: 1,
                duration: formData.duration,
                technology: formData.technology,
                selectedAvatars: ['tech-1']
            })

            const interviewId = response.data.interview.id
            if (setIsOpen) setIsOpen(false)
            router.push(`/interviews/${interviewId}/start`)
        } catch (error) {
            console.error('Failed to create interview:', error)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleUpgrade = () => {
        router.push('/pricing') 
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button className="rounded-xl shadow-lg shadow-primary/20 hover:scale-105 transition-all">
                        <Plus className="mr-2 h-4 w-4" /> New Interview
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
                {!hasAccess ? (
                    // LOCKED STATE
                    <div className="flex flex-col items-center text-center py-6 space-y-6">
                        <div className="h-20 w-20 bg-amber-100 rounded-full flex items-center justify-center mb-2">
                            <Crown className="h-10 w-10 text-amber-600" />
                        </div>
                        <div className="space-y-2">
                            <DialogTitle className="text-2xl font-bold">Unlock Unlimited Interviews</DialogTitle>
                            <DialogDescription className="text-base max-w-sm mx-auto">
                                You've used your free credits. Upgrade to Pro to practice with personalized AI interviews without limits.
                            </DialogDescription>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full text-left bg-muted/30 p-4 rounded-xl border">
                            <div className="flex items-center gap-2">
                                <Check className="h-4 w-4 text-green-500" />
                                <span className="text-sm">Unlimited Mock Interviews</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Check className="h-4 w-4 text-green-500" />
                                <span className="text-sm">Detailed AI Feedback</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Check className="h-4 w-4 text-green-500" />
                                <span className="text-sm">Resume Analysis</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Check className="h-4 w-4 text-green-500" />
                                <span className="text-sm">Role-Specific Questions</span>
                            </div>
                        </div>

                        <Button size="lg" onClick={handleUpgrade} className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-xl shadow-orange-500/20">
                            Upgrade to Pro <Sparkles className="ml-2 h-4 w-4" />
                        </Button>
                        <p className="text-xs text-muted-foreground">Starting at just $9.99/mo</p>
                    </div>
                ) : (
                    // UNLOCKED STATE (FORM)
                    <>
                        <DialogHeader>
                            <DialogTitle>Start New Interview</DialogTitle>
                            <DialogDescription>
                                Setup your mock interview session in seconds.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="grid gap-6 py-4">
                            {step === 1 && (
                                <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Domain</Label>
                                            <Select value={formData.domain} onValueChange={(v) => updateFormData('domain', v)}>
                                                <SelectTrigger><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    {DOMAINS.map(d => <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Difficulty</Label>
                                            <Select value={formData.difficulty} onValueChange={(v) => updateFormData('difficulty', v)}>
                                                <SelectTrigger><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    {DIFFICULTIES.map(d => <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Role *</Label>
                                            <Input
                                                placeholder="e.g. Frontend Dev"
                                                value={formData.role}
                                                onChange={(e) => updateFormData('role', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Tech Stack *</Label>
                                            <Input
                                                placeholder="e.g. React, Node.js"
                                                value={formData.technology}
                                                onChange={(e) => updateFormData('technology', e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Target Company (Optional)</Label>
                                        <Input
                                            placeholder="e.g. Google, Amazon"
                                            value={formData.company}
                                            onChange={(e) => updateFormData('company', e.target.value)}
                                        />
                                    </div>
                                </div>
                            )}

                            {step === 2 && (
                                <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                                    <div className="space-y-2">
                                        <Label>Job Description (Optional)</Label>
                                        <Textarea
                                            placeholder="Paste the JD here for tailored questions..."
                                            value={formData.jobDescription}
                                            onChange={(e) => updateFormData('jobDescription', e.target.value)}
                                            rows={4}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Resume (Optional)</Label>
                                        <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer relative">
                                            <input
                                                type="file"
                                                accept=".pdf,.doc,.docx"
                                                className="absolute inset-0 opacity-0 cursor-pointer"
                                                onChange={handleResumeUpload}
                                            />
                                            {formData.resumeFile ? (
                                                <div className="flex items-center justify-center gap-2 text-primary">
                                                    <FileText className="h-5 w-5" />
                                                    <span className="font-medium text-sm">{formData.resumeFile.name}</span>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center gap-1 text-muted-foreground">
                                                    <Upload className="h-6 w-6 mb-1" />
                                                    <span className="text-sm font-medium">Upload Resume</span>
                                                    <span className="text-xs">PDF, DOCX (Max 5MB)</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end gap-3">
                            {step === 2 && (
                                <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
                            )}

                            {step === 1 ? (
                                <Button
                                    onClick={() => setStep(2)}
                                    disabled={!formData.role || !formData.technology}
                                >
                                    Next <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            ) : (
                                <Button onClick={handleCreateInterview} disabled={isSubmitting}>
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Starting...
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="mr-2 h-4 w-4" /> Start Interview
                                        </>
                                    )}
                                </Button>
                            )}
                        </div>
                    </>
                )}
            </DialogContent>
        </Dialog>
    )
}
