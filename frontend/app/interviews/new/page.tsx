"use client"

import * as React from 'react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { interviewApi, uploadApi } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    ArrowLeft,
    ArrowRight,
    Check,
    Upload,
    FileText,
    User,
    Calendar,
    Clock,
    Loader2,
    Briefcase,
    Bot,
    Target,
    Sparkles,
    Video
} from 'lucide-react'

// Step configuration
const STEPS = [
    { id: 1, title: 'Interview Details', icon: Target },
    { id: 2, title: 'JD & Resume', icon: FileText },
    { id: 3, title: 'Select Panel', icon: User },
    { id: 4, title: 'Schedule', icon: Calendar },
    { id: 5, title: 'Tech Check', icon: Bot },
    { id: 6, title: 'Review', icon: Check },
]

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

const AVATARS = [
    { id: 'tech-1', name: 'Alex Chen', role: 'Technical Lead', personality: 'Friendly', avatar: '/interviewer_avatar.png' },
    { id: 'tech-2', name: 'Sarah Johnson', role: 'Senior Engineer', personality: 'Professional', avatar: '/interviewer_avatar.png' },
    { id: 'hr-1', name: 'Emma Williams', role: 'HR Manager', personality: 'Encouraging', avatar: '/interviewer_avatar.png' },
    { id: 'hr-2', name: 'David Smith', role: 'Talent Acquisition', personality: 'Strict', avatar: '/interviewer_avatar.png' },
]

const TIME_SLOTS = [
    '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
    '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'
]

export default function NewInterviewPage() {
    const router = useRouter()
    const { isAuthenticated, isLoading: authLoading } = useAuth()

    const [currentStep, setCurrentStep] = useState(1)
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Form state
    const [formData, setFormData] = useState({
        // Step 1
        domain: 'TECHNOLOGY',
        role: '',
        company: '',
        technology: '',
        difficulty: 'INTERMEDIATE',
        duration: 30,
        type: 'INSTANT', // 'INSTANT' or 'SCHEDULED'
        // Step 2
        jobDescription: '',
        resumeFile: null as File | null,
        resumeUrl: '',
        // Step 3
        selectedAvatars: ['tech-1', 'hr-1'],
        panelCount: 2,
        // Step 4
        scheduledDate: '',
        scheduledTime: '',
        // Step 5
        techVerified: false
    })

    React.useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push('/login')
        }
    }, [authLoading, isAuthenticated, router])

    const updateFormData = (field: string, value: string | number | boolean | File | string[] | null) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    const handleResumeUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            updateFormData('resumeFile', file)
            updateFormData('resumeUrl', file.name)
        }
    }

    const toggleAvatar = (avatarId: string) => {
        setFormData(prev => {
            const isSelected = prev.selectedAvatars.includes(avatarId)
            const newAvatars = isSelected
                ? prev.selectedAvatars.filter(id => id !== avatarId)
                : [...prev.selectedAvatars, avatarId]
            return {
                ...prev,
                selectedAvatars: newAvatars,
                panelCount: newAvatars.length
            }
        })
    }

    const canProceed = () => {
        switch (currentStep) {
            case 1: return formData.domain && formData.role && formData.technology
            case 2: return true // JD and resume are optional
            case 3: return formData.selectedAvatars.length > 0
            case 4: return formData.scheduledDate && formData.scheduledTime
            case 5: return formData.techVerified
            case 6: return true
            default: return true
        }
    }

    const handleNext = () => {
        if (currentStep === 3 && formData.type === 'INSTANT') {
            setCurrentStep(5)
            return
        }
        if (currentStep < 6 && canProceed()) {
            setCurrentStep(prev => prev + 1)
        }
    }

    const handleBack = () => {
        if (currentStep === 5 && formData.type === 'INSTANT') {
            setCurrentStep(3)
            return
        }
        if (currentStep > 1) {
            setCurrentStep(prev => prev - 1)
        }
    }

    const handleSubmit = async () => {
        setIsSubmitting(true)
        try {
            // Combine date and time for scheduledAt
            const scheduledAt = formData.scheduledDate && formData.scheduledTime
                ? new Date(`${formData.scheduledDate} ${formData.scheduledTime}`).toISOString()
                : null

            // 1. Upload Resume if exists
            let finalResumeUrl = formData.resumeUrl;
            if (formData.resumeFile) {
                const uploadData = new FormData();
                uploadData.append('file', formData.resumeFile);
                try {
                    const uploadRes = await uploadApi.upload(uploadData);
                    finalResumeUrl = uploadRes.data.url;
                } catch (error) {
                    console.error('Resume upload failed:', error);
                    // Continue anyway but without resume context
                }
            }

            // 2. Create Interview
            const response = await interviewApi.create({
                domain: formData.domain,
                role: formData.role,
                company: formData.company,
                difficulty: formData.difficulty,
                jobDescription: formData.jobDescription,
                panelCount: formData.panelCount,
                scheduledAt,
                duration: formData.duration,
                selectedAvatars: formData.selectedAvatars,
                technology: formData.technology,
                resumeUrl: finalResumeUrl
            })

            const interviewId = response.data.interview.id
            router.push(`/interviews/${interviewId}/start`)
        } catch (error) {
            console.error('Failed to create interview:', error)
            alert('Failed to schedule interview. Please try again.')
        } finally {
            setIsSubmitting(false)
        }
    }

    // Dynamic duration estimation helper
    React.useEffect(() => {
        let estimatedDuration = 30 // Base

        if (formData.jobDescription) estimatedDuration += 10
        if (formData.resumeFile) estimatedDuration += 5
        if (formData.difficulty === 'ADVANCED') estimatedDuration += 15
        if (formData.difficulty === 'BEGINNER') estimatedDuration -= 5
        if (formData.panelCount > 1) estimatedDuration += (formData.panelCount - 1) * 5

        if (estimatedDuration !== formData.duration) {
            updateFormData('duration', estimatedDuration)
        }
    }, [formData.jobDescription, formData.resumeFile, formData.difficulty, formData.panelCount])


    if (authLoading || !isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 py-8">
            <div className="container max-w-4xl">
                {/* Header */}
                <div className="mb-8">
                    <Button variant="ghost" onClick={() => router.push('/interviews')} className="mb-4">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Interviews
                    </Button>
                    <h1 className="text-3xl font-bold">Schedule AI Interview</h1>
                    <p className="text-muted-foreground">Complete the steps below to set up your personalized mock interview</p>
                </div>

                {/* Progress Steps */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        {STEPS.map((step, idx) => (
                            <div key={step.id} className="flex items-center">
                                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors ${currentStep > step.id
                                    ? 'bg-primary border-primary text-primary-foreground'
                                    : currentStep === step.id
                                        ? 'border-primary text-primary'
                                        : 'border-muted text-muted-foreground'
                                    }`}>
                                    {currentStep > step.id ? (
                                        <Check className="h-5 w-5" />
                                    ) : (
                                        <step.icon className="h-5 w-5" />
                                    )}
                                </div>
                                {idx < STEPS.length - 1 && (
                                    <div className={`w-16 md:w-24 h-0.5 mx-2 ${currentStep > step.id ? 'bg-primary' : 'bg-muted'
                                        }`} />
                                )}
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-between mt-2">
                        {STEPS.map(step => (
                            <span key={step.id} className={`text-xs ${currentStep === step.id ? 'text-primary font-medium' : 'text-muted-foreground'
                                }`}>
                                {step.title}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Step Content */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle>{STEPS[currentStep - 1].title}</CardTitle>
                        <CardDescription>
                            {currentStep === 1 && 'Tell us about the role you want to practice for'}
                            {currentStep === 2 && 'Upload your resume and job description for personalized questions'}
                            {currentStep === 3 && 'Choose your interviewer panel'}
                            {currentStep === 4 && 'Pick a convenient time for your interview'}
                            {currentStep === 5 && 'Review your interview setup'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {/* Step 1: Interview Details */}
                        {currentStep === 1 && (
                            <div className="space-y-6">
                                <div className="space-y-4">
                                    <Label className="text-base">Interview Type</Label>
                                    <div className="grid grid-cols-2 gap-4">
                                        <Card
                                            className={`cursor-pointer transition-all ${formData.type === 'INSTANT' ? 'border-primary ring-2 ring-primary/20' : 'hover:border-primary/50'}`}
                                            onClick={() => updateFormData('type', 'INSTANT')}
                                        >
                                            <CardContent className="p-4 flex flex-col items-center gap-2 text-center">
                                                <Sparkles className={`h-8 w-8 ${formData.type === 'INSTANT' ? 'text-primary' : 'text-muted-foreground'}`} />
                                                <div className="font-bold">Instant Start</div>
                                                <div className="text-xs text-muted-foreground">Start practicing immediately</div>
                                            </CardContent>
                                        </Card>
                                        <Card
                                            className={`cursor-pointer transition-all ${formData.type === 'SCHEDULED' ? 'border-primary ring-2 ring-primary/20' : 'hover:border-primary/50'}`}
                                            onClick={() => updateFormData('type', 'SCHEDULED')}
                                        >
                                            <CardContent className="p-4 flex flex-col items-center gap-2 text-center">
                                                <Calendar className={`h-8 w-8 ${formData.type === 'SCHEDULED' ? 'text-primary' : 'text-muted-foreground'}`} />
                                                <div className="font-bold">Schedule Later</div>
                                                <div className="text-xs text-muted-foreground">Pick a time for your session</div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label>Domain / Industry</Label>
                                        <Select value={formData.domain} onValueChange={(v) => updateFormData('domain', v)}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {DOMAINS.map(d => (
                                                    <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Role / Position *</Label>
                                        <Input
                                            placeholder="e.g., Frontend Developer"
                                            value={formData.role}
                                            onChange={(e) => updateFormData('role', e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Primary Technology Stack *</Label>
                                        <Input
                                            placeholder="e.g., React, Node.js, Python"
                                            value={formData.technology}
                                            onChange={(e) => updateFormData('technology', e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Target Company (Optional)</Label>
                                        <Input
                                            placeholder="e.g., Google, Amazon"
                                            value={formData.company}
                                            onChange={(e) => updateFormData('company', e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Difficulty Level</Label>
                                        <Select value={formData.difficulty} onValueChange={(v) => updateFormData('difficulty', v)}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {DIFFICULTIES.map(d => (
                                                    <SelectItem key={d.value} value={d.value}>
                                                        <div>
                                                            <div className="font-medium">{d.label}</div>
                                                            <div className="text-xs text-muted-foreground">{d.desc}</div>
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Duration (Minutes)</Label>
                                        <Select value={String(formData.duration)} onValueChange={(v) => updateFormData('duration', Number(v))}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {[15, 30, 45, 60].map(m => (
                                                    <SelectItem key={m} value={String(m)}>{m} Minutes</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 2: JD & Resume */}
                        {currentStep === 2 && (
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <Label>Job Description</Label>
                                    <p className="text-sm text-muted-foreground mb-2">
                                        Paste the job description for more relevant questions
                                    </p>
                                    <Textarea
                                        placeholder="Paste the job description here..."
                                        value={formData.jobDescription}
                                        onChange={(e) => updateFormData('jobDescription', e.target.value)}
                                        rows={6}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Resume Upload</Label>
                                    <p className="text-sm text-muted-foreground mb-2">
                                        Upload your resume to get experience-based questions
                                    </p>
                                    <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary transition-colors">
                                        <input
                                            type="file"
                                            accept=".pdf,.doc,.docx"
                                            onChange={handleResumeUpload}
                                            className="hidden"
                                            id="resume-upload"
                                        />
                                        <label htmlFor="resume-upload" className="cursor-pointer">
                                            {formData.resumeFile ? (
                                                <div className="flex items-center justify-center gap-2">
                                                    <FileText className="h-8 w-8 text-primary" />
                                                    <div className="text-left">
                                                        <p className="font-medium">{formData.resumeFile.name}</p>
                                                        <p className="text-sm text-muted-foreground">Click to change</p>
                                                    </div>
                                                </div>
                                            ) : (
                                                <>
                                                    <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                                                    <p className="font-medium">Drop your resume here or click to upload</p>
                                                    <p className="text-sm text-muted-foreground">PDF, DOC, DOCX (Max 5MB)</p>
                                                </>
                                            )}
                                        </label>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 3: Panel Selection */}
                        {currentStep === 3 && (
                            <div className="space-y-6">
                                <p className="text-sm text-muted-foreground">
                                    Select the interviewers for your panel. Mix technical and HR for a realistic experience.
                                </p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {AVATARS.map(avatar => {
                                        const isSelected = formData.selectedAvatars.includes(avatar.id)
                                        return (
                                            <Card
                                                key={avatar.id}
                                                className={`cursor-pointer transition-all ${isSelected ? 'border-primary ring-2 ring-primary/20' : 'hover:border-primary/50'
                                                    }`}
                                                onClick={() => toggleAvatar(avatar.id)}
                                            >
                                                <CardContent className="flex items-center gap-4 p-4">
                                                    <div className={`w-14 h-14 rounded-full flex items-center justify-center ${avatar.role.includes('Technical') || avatar.role.includes('Engineer')
                                                        ? 'bg-blue-100 text-blue-600'
                                                        : 'bg-purple-100 text-purple-600'
                                                        }`}>
                                                        {avatar.role.includes('Technical') || avatar.role.includes('Engineer') ? (
                                                            <Bot className="h-7 w-7" />
                                                        ) : (
                                                            <Briefcase className="h-7 w-7" />
                                                        )}
                                                    </div>
                                                    <div className="flex-1">
                                                        <h4 className="font-medium">{avatar.name}</h4>
                                                        <p className="text-sm text-muted-foreground">{avatar.role}</p>
                                                        <p className="text-xs text-muted-foreground">Style: {avatar.personality}</p>
                                                    </div>
                                                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${isSelected ? 'border-primary bg-primary text-primary-foreground' : 'border-muted'
                                                        }`}>
                                                        {isSelected && <Check className="h-4 w-4" />}
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        )
                                    })}
                                </div>
                                <p className="text-sm font-medium">
                                    Selected: {formData.selectedAvatars.length} interviewer(s)
                                </p>
                            </div>
                        )}

                        {/* Step 4: Schedule */}
                        {currentStep === 4 && (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label>Select Date</Label>
                                        <Input
                                            type="date"
                                            value={formData.scheduledDate}
                                            onChange={(e) => updateFormData('scheduledDate', e.target.value)}
                                            min={new Date().toISOString().split('T')[0]}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Select Time Slot</Label>
                                        <div className="grid grid-cols-2 gap-2">
                                            {TIME_SLOTS.map(slot => (
                                                <Button
                                                    key={slot}
                                                    variant={formData.scheduledTime === slot ? 'default' : 'outline'}
                                                    size="sm"
                                                    onClick={() => updateFormData('scheduledTime', slot)}
                                                    className="justify-start"
                                                >
                                                    <Clock className="h-4 w-4 mr-2" />
                                                    {slot}
                                                </Button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <div className="p-4 bg-muted/50 rounded-lg">
                                    <div className="flex items-center gap-2 text-sm">
                                        <Sparkles className="h-4 w-4 text-primary" />
                                        <span className="font-medium">Pro Tip:</span>
                                        <span className="text-muted-foreground">Schedule when you&apos;re most alert for best performance</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 5: Tech Check */}
                        {currentStep === 5 && (
                            <div className="space-y-6">
                                <p className="text-sm text-muted-foreground">
                                    Before we begin, let&apos;s ensure your technical setup is ready for a professional interview.
                                </p>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 border rounded-lg bg-background/50">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-blue-100 text-blue-600 rounded-full">
                                                <Video className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <p className="font-medium">Camera Check</p>
                                                <p className="text-xs text-muted-foreground">Ensure you are clearly visible</p>
                                            </div>
                                        </div>
                                        <Check className="h-5 w-5 text-green-500" />
                                    </div>
                                    <div className="flex items-center justify-between p-4 border rounded-lg bg-background/50">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-purple-100 text-purple-600 rounded-full">
                                                <Clock className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <p className="font-medium">Microphone Check</p>
                                                <p className="text-xs text-muted-foreground">Audio should be clear and loud</p>
                                            </div>
                                        </div>
                                        <Check className="h-5 w-5 text-green-500" />
                                    </div>
                                    <div className="flex items-center justify-between p-4 border rounded-lg bg-background/50">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-orange-100 text-orange-600 rounded-full">
                                                <Sparkles className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <p className="font-medium">Internet Stability</p>
                                                <p className="text-xs text-muted-foreground">High-speed connection required</p>
                                            </div>
                                        </div>
                                        <Check className="h-5 w-5 text-green-500" />
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2 pt-4">
                                    <input
                                        type="checkbox"
                                        id="tech-confirm"
                                        aria-label="Confirm technical setup"
                                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                        checked={formData.techVerified}
                                        onChange={(e) => updateFormData('techVerified', e.target.checked)}
                                    />
                                    <Label htmlFor="tech-confirm" className="text-sm cursor-pointer">
                                        I confirm that my camera, microphone, and internet are working properly.
                                    </Label>
                                </div>
                            </div>
                        )}

                        {/* Step 6: Review */}
                        {currentStep === 6 && (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <h4 className="font-medium flex items-center gap-2">
                                            <Target className="h-4 w-4 text-primary" />
                                            Role & Technology
                                        </h4>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Domain:</span>
                                                <span className="font-medium">{DOMAINS.find(d => d.value === formData.domain)?.label}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Role:</span>
                                                <span className="font-medium">{formData.role}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Technology:</span>
                                                <span className="font-medium">{formData.technology}</span>
                                            </div>
                                            {formData.company && (
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Company:</span>
                                                    <span className="font-medium">{formData.company}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <h4 className="font-medium flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-primary" />
                                            Schedule & Panel
                                        </h4>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Type:</span>
                                                <span className="font-medium uppercase">{formData.type}</span>
                                            </div>
                                            {formData.type === 'SCHEDULED' && (
                                                <>
                                                    <div className="flex justify-between">
                                                        <span className="text-muted-foreground">Date:</span>
                                                        <span className="font-medium">
                                                            {formData.scheduledDate ? new Date(formData.scheduledDate).toLocaleDateString() : 'Not set'}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-muted-foreground">Time:</span>
                                                        <span className="font-medium">{formData.scheduledTime || 'Not set'}</span>
                                                    </div>
                                                </>
                                            )}
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Panel Size:</span>
                                                <span className="font-medium">{formData.panelCount} interviewer(s)</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                {formData.jobDescription && (
                                    <div className="p-4 bg-muted/50 rounded-lg border">
                                        <h4 className="font-medium mb-1 text-sm">Job Description</h4>
                                        <p className="text-xs text-muted-foreground line-clamp-3">{formData.jobDescription}</p>
                                    </div>
                                )}
                                {formData.resumeFile && (
                                    <div className="p-4 bg-muted/50 rounded-lg flex items-center gap-2 border">
                                        <FileText className="h-4 w-4 text-primary" />
                                        <span className="text-sm font-medium">Resume Uploaded:</span>
                                        <span className="text-xs text-muted-foreground">{formData.resumeFile.name}</span>
                                    </div>
                                )}
                                <div className="p-4 bg-green-50 border border-green-100 rounded-lg flex items-center gap-2">
                                    <Check className="h-4 w-4 text-green-600" />
                                    <span className="text-sm text-green-700 font-medium">Technical Setup Verified</span>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Navigation Buttons */}
                <div className="flex justify-between">
                    <Button variant="outline" onClick={handleBack} disabled={currentStep === 1}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back
                    </Button>
                    {currentStep < 6 ? (
                        <Button onClick={handleNext} disabled={!canProceed()}>
                            Next
                            <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                    ) : (
                        <Button onClick={handleSubmit} disabled={isSubmitting} className="bg-primary hover:bg-primary/90">
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Initializing...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="h-4 w-4 mr-2" />
                                    {formData.type === 'INSTANT' ? 'Start Interview Now' : 'Confirm & Schedule'}
                                </>
                            )}
                        </Button>
                    )}
                </div>
            </div>
        </div>
    )
}
