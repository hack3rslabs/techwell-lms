"use client"

import * as React from 'react'
import { useRouter } from 'next/navigation'
import api, { courseApi, uploadApi, courseCategoryApi, type CoursePayload } from '@/lib/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Image from "next/image"
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, GripVertical, Loader2, Plus, Upload, X, Wand2, ArrowRight, ArrowLeft } from 'lucide-react'
import { QuizBuilderDialog } from './QuizBuilderDialog'
import { VideoUpload } from '@/components/admin/VideoUpload'
import { getFullImageUrl } from '@/lib/image-utils'
import { RichTextEditor } from '@/components/ui/RichTextEditor'

interface CourseCreationWizardProps {
    redirectPath: string
    initialCourseId?: string
}

export function CourseCreationWizard({ redirectPath, initialCourseId }: CourseCreationWizardProps) {
    const router = useRouter()

    // Steps: 1=Basic, 2=Curriculum, 3=Review
    const [step, setStep] = React.useState(1)
    const [isLoading, setIsLoading] = React.useState(false)
    const [courseId, setCourseId] = React.useState<string | null>(initialCourseId || null)
    const [bannerFile, setBannerFile] = React.useState<File | null>(null)
    const [bannerPreview, setBannerPreview] = React.useState<string | null>(null)

    // Fetch initial data if editing
    React.useEffect(() => {
        return () => {
            if (bannerPreview) {
                URL.revokeObjectURL(bannerPreview)
            }
        }
    }, [bannerPreview])
 
    // Step 1 Data
    const [basicData, setBasicData] = React.useState({
        title: '',
        description: '',
        category: 'Development',
        price: 0,
        discountPrice: 0,
        difficulty: 'BEGINNER',
        duration: 0,
        courseCode: '',
        bannerUrl: '',
        jobRoles: [] as string[],
        // Course Types
        courseType: 'RECORDED' as 'RECORDED' | 'LIVE' | 'HYBRID',
        hasInterviewPrep: false,
        interviewPrice: 0,
        jobPrep: false,
        // New Features
        fakeEnrolledCount: 0,
        fakeRating: 4.5,
        requireAdmissionFee: true,
        admissionFee: 1000,
        // SEO Fields
        slug: '',
        seoTitle: '',
        metaDescription: '',
        targetKeywords: [] as string[],
        faqs: [] as { question: string, answer: string }[],
        // SEO Content Fields (Phase 2)
        careerOpportunities: [] as { role: string; description: string }[],
        salaryInsights: [] as { role: string; min: string; max: string; average: string }[],
        projects: [] as { title: string; description: string; duration: string }[],
        prerequisites: [] as string[],
        learningOutcomes: [] as string[],
        toolsCovered: [] as string[],
    })

    // Step 2 Data (Curriculum)
    interface Lesson {
        id?: string
        title: string
        type: 'VIDEO' | 'TEXT' | 'QUIZ' | 'ASSIGNMENT' | 'PDF'
        duration: number
        videoUrl?: string
        content?: string
        isPublished: boolean
    }
    interface Module {
        id?: string
        title: string
        description: string
        orderIndex: number
        isPublished: boolean
        lessons: Lesson[]
    }
    const [modules, setModules] = React.useState<Module[]>([])
    const [aiTopic, setAiTopic] = React.useState('')
    const [quizBuilderLessonId, setQuizBuilderLessonId] = React.useState<string | null>(null)
    const [isGenerating, setIsGenerating] = React.useState(false)
    const [expandedModuleIndexes, setExpandedModuleIndexes] = React.useState<number[]>([])

    React.useEffect(() => {
        if (!initialCourseId) return

        const fetchCourse = async () => {
            try {
                const res = await courseApi.getById(initialCourseId)
                const c = res.data.course
                setBasicData({
                    title: c.title,
                    description: c.description,
                    category: c.category,
                    price: Number(c.price) || 0,
                    discountPrice: Number(c.discountPrice) || 0,
                    difficulty: c.difficulty,
                    duration: Number(c.duration) || 0,
                    courseCode: c.courseCode || '',
                    bannerUrl: c.bannerUrl || '',
                    jobRoles: c.jobRoles || [],
                    courseType: c.courseType || 'RECORDED',
                    hasInterviewPrep: c.hasInterviewPrep || false,
                    interviewPrice: Number(c.interviewPrice) || 0,
                    jobPrep: c.jobPrep || false,
                    fakeEnrolledCount: Number(c.fakeEnrolledCount) || 0,
                    fakeRating: Number(c.fakeRating) || 4.5,
                    requireAdmissionFee: c.requireAdmissionFee ?? true,
                    admissionFee: Number(c.admissionFee) ?? 1000,
                    slug: c.slug || '',
                    seoTitle: c.seoTitle || '',
                    metaDescription: c.metaDescription || '',
                    targetKeywords: c.targetKeywords || [],
                    faqs: c.faqs || [],
                    careerOpportunities: c.careerOpportunities || [],
                    salaryInsights: c.salaryInsights || [],
                    projects: c.projects || [],
                    prerequisites: c.prerequisites || [],
                    learningOutcomes: c.learningOutcomes || [],
                    toolsCovered: c.toolsCovered || []
                })
                if (c.modules) {
                    setModules(c.modules)
                }
            } catch (error) {
                console.error("Failed to fetch course", error)
            }
        }

        fetchCourse()
    }, [initialCourseId, setBasicData, setModules])

    // Load categories from API
    const [dbCategories, setDbCategories] = React.useState<{ id: string; name: string; icon: string | null }[]>([])
    React.useEffect(() => {
        courseCategoryApi.getAll()
            .then(res => setDbCategories(res.data.categories || []))
            .catch(() => setDbCategories([]))
    }, [])

    // Handlers
    const handleBasicSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        // Client-side validation
        if (!basicData.title || basicData.title.trim().length < 3) {
            alert('Title must be at least 3 characters')
            return
        }
        if (!basicData.description || basicData.description.trim().length < 10) {
            alert('Description must be at least 10 characters')
            return
        }
        if (!basicData.category || basicData.category.trim().length < 2) {
            alert('Please select a valid category')
            return
        }

        // Validate image file
        const _validateImage = (file: File | null): boolean => {
            if (!file) return true // optional

            const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"]

            if (!allowedTypes.includes(file.type)) {
                alert("Only JPG, PNG, or WEBP images are allowed")
                return false
            }

            const maxSize = 2 * 1024 * 1024 // 2MB

            if (file.size > maxSize) {
                alert("Image size must be less than 2MB")
                return false
            }

            return true
        }


        setIsLoading(true)
        try {
            console.log('[DEBUG] Starting course save process...');
            
            // Upload banner file first if selected
            let finalImageUrl = basicData.bannerUrl;
            if (bannerFile) {
                console.log('[DEBUG] Uploading new image file:', bannerFile.name);
                const formData = new FormData();
                formData.append('file', bannerFile);
                
                // Debug FormData
                for (const [key, value] of formData.entries()) {
                    console.log(`[DEBUG] FormData entry: ${key}=${value instanceof File ? value.name : value}`);
                }

                const uploadRes = await uploadApi.upload(formData);
                console.log('[DEBUG] Upload successful, received URL:', uploadRes.data.url);
                finalImageUrl = uploadRes.data.url;
            }

            // Clean jobRoles: remove empty strings
            const cleanJobRoles = Array.isArray(basicData.jobRoles) ? basicData.jobRoles.filter(Boolean) : [];
            const cleanTargetKeywords = Array.isArray(basicData.targetKeywords) ? basicData.targetKeywords.filter(Boolean) : [];

            // Explicitly build payload with EXACT fields expected by backend
            const payload: CoursePayload = {
                title: basicData.title,
                description: basicData.description,
                category: basicData.category,
                difficulty: basicData.difficulty as 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED',
                duration: Number(basicData.duration) || 0,
                price: Number(basicData.price) || 0,
                discountPrice: Number(basicData.discountPrice) || 0,
                courseCode: basicData.courseCode || undefined,
                bannerUrl: finalImageUrl || undefined,
                thumbnail: finalImageUrl || undefined,
                jobRoles: cleanJobRoles,
                courseType: basicData.courseType as 'RECORDED' | 'LIVE' | 'HYBRID',
                hasInterviewPrep: basicData.hasInterviewPrep,
                interviewPrice: Number(basicData.interviewPrice) || 0,
                jobPrep: basicData.jobPrep,
                fakeEnrolledCount: Number(basicData.fakeEnrolledCount) || 0,
                fakeRating: Number(basicData.fakeRating) || 4.5,
                requireAdmissionFee: basicData.requireAdmissionFee,
                admissionFee: Number(basicData.admissionFee) || 0,
                slug: basicData.slug || undefined,
                seoTitle: basicData.seoTitle || undefined,
                metaDescription: basicData.metaDescription || undefined,
                targetKeywords: cleanTargetKeywords,
                faqs: basicData.faqs,
                careerOpportunities: basicData.careerOpportunities,
                salaryInsights: basicData.salaryInsights,
                projects: basicData.projects,
                prerequisites: basicData.prerequisites,
                learningOutcomes: basicData.learningOutcomes,
                toolsCovered: basicData.toolsCovered
            };

            console.log('[DEBUG] Final payload being sent to backend:', JSON.stringify(payload, null, 2));

            if (courseId) {
                console.log('[DEBUG] Calling courseApi.update with ID:', courseId);
                const updateRes = await courseApi.update(courseId, payload);
                console.log('[DEBUG] Update response:', updateRes.data);
            } else {
                console.log('[DEBUG] Calling courseApi.create');
                const createRes = await courseApi.create(payload);
                console.log('[DEBUG] Create response:', createRes.data);
                setCourseId(createRes.data.course.id);
                setAiTopic(basicData.title);
            }
            console.log('[DEBUG] Step 1 completed successfully, moving to Step 2');
            setStep(2);
        } catch (error: any) {
            console.error('[DEBUG] handleBasicSubmit caught error:', error);
            const errorMsg = error.response?.data?.error || error.message || 'Unknown error occurred';
            const errorDetails = error.response?.data?.details || null;
            const errorStack = error.response?.data?.stack || null;

            console.error('[DEBUG] Error Message:', errorMsg);
            if (errorDetails) console.error('[DEBUG] Error Details:', errorDetails);
            if (errorStack) console.error('[DEBUG] Server Stack Trace:', errorStack);

            let alertMsg = `Error: ${errorMsg}`;
            if (errorDetails && Array.isArray(errorDetails)) {
                const validationErrors = errorDetails
                    .map((err: any) => `${err.path?.join('.')} - ${err.message}`)
                    .join('\n');
                alertMsg += `\n\nValidation Details:\n${validationErrors}`;
            }
            alert(alertMsg);
        } finally {
            setIsLoading(false);
        }
    }

    const handleGenerateAI = async () => {
        if (!aiTopic) return
        setIsGenerating(true)
        try {
            const res = await courseApi.generate({
                topic: aiTopic,
                difficulty: basicData.difficulty
            })
            // Auto-fill basic data from AI
            setBasicData(prev => ({
                ...prev,
                title: res.data.courseData.title,
                description: res.data.courseData.description,
                price: res.data.courseData.price,
                discountPrice: res.data.courseData.discountPrice,
                courseCode: res.data.courseData.courseCode,
                bannerUrl: res.data.courseData.bannerUrl,
                jobRoles: res.data.courseData.jobRoles || [],
                difficulty: res.data.courseData.difficulty,
                duration: Number(res.data.courseData.duration) || prev.duration
            }))
            // Replace modules with generated ones
            setModules(res.data.courseData.modules)
        } catch (error) {
            console.error('AI Generation failed:', error)
            alert('AI Generation failed')
        } finally {
            setIsGenerating(false)
        }
    }

    const handleAddModule = () => {
        const nextIndex = modules.length
        const newModule: Module = {
            title: 'New Module',
            description: 'Module description',
            orderIndex: nextIndex,
            isPublished: false,
            lessons: []
        }
        setModules([...modules, newModule])
        setExpandedModuleIndexes(prev => [...prev, nextIndex])
    }

    const toggleModuleEditor = (idx: number) => {
        setExpandedModuleIndexes(prev =>
            prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]
        )
    }

    const handleUpdateModule = (idx: number, updates: Partial<Module>) => {
        const newModules = [...modules]
        newModules[idx] = { ...newModules[idx], ...updates }
        setModules(newModules)
    }

    const handleDeleteModule = (idx: number) => {
        const newModules = modules.filter((_, i) => i !== idx)
        // Update orderIndex for remaining modules
        newModules.forEach((m, i) => { m.orderIndex = i })
        setModules(newModules)
        setExpandedModuleIndexes(prev =>
            prev.filter(i => i !== idx).map(i => (i > idx ? i - 1 : i))
        )
    }

    const handleAddLesson = (moduleIdx: number) => {
        const newLesson: Lesson = {
            title: 'New Lesson',
            type: 'VIDEO',
            duration: 5 * 60,
            isPublished: false
        }
        const newModules = [...modules]
        newModules[moduleIdx].lessons.push(newLesson)
        setModules(newModules)
    }

    const handleDeleteLesson = (moduleIdx: number, lessonIdx: number) => {
        const newModules = [...modules]
        newModules[moduleIdx].lessons = newModules[moduleIdx].lessons.filter((_, i) => i !== lessonIdx)
        setModules(newModules)
    }

    const handleSaveCurriculum = async () => {
        if (!courseId) return
        setIsLoading(true)
        try {
            await courseApi.updateCurriculum(courseId, { modules })
            setStep(3)
        } catch (error) {
            console.error('Failed to save curriculum:', error)
            alert('Failed to save curriculum')
        } finally {
            setIsLoading(false)
        }
    }

    const handleStatusUpdate = async (status: 'DRAFT' | 'IN_REVIEW' | 'PUBLISHED') => {
        if (!courseId) return
        setIsLoading(true)
        try {
            await api.patch(`/courses/${courseId}/status`, { status })
            router.push(redirectPath)
        } catch (error) {
            console.error('Failed to update status:', error)
            alert('Failed to update status')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="container py-8 max-w-4xl">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Create New Course</h1>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className={step >= 1 ? "text-primary font-medium" : ""}>1. Basic Details</span>
                    <ArrowRight className="h-4 w-4" />
                    <span className={step >= 2 ? "text-primary font-medium" : ""}>2. Curriculum</span>
                    <ArrowRight className="h-4 w-4" />
                    <span className={step >= 3 ? "text-primary font-medium" : ""}>3. Review</span>
                </div>
            </div>

            {/* STEP 1: BASIC DETAILS */}
            {step === 1 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Basic Information</CardTitle>
                        <CardDescription>Start by providing the core details of your course.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleBasicSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Course Title</label>
                                <Input
                                    value={basicData.title}
                                    onChange={e => setBasicData({ ...basicData, title: e.target.value })}
                                    placeholder="e.g. Master ReactJS in 30 Days"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Description</label>
                                <RichTextEditor
                                    value={basicData.description}
                                    onChange={(val: string) => setBasicData({ ...basicData, description: val })}
                                    placeholder="What will students learn?"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Category</label>
                                    <select
                                        aria-label="Course Category"
                                        className="w-full p-2 border rounded-md bg-background"
                                        value={basicData.category}
                                        onChange={e => setBasicData({ ...basicData, category: e.target.value })}
                                    >
                                        {dbCategories.length > 0 ? (
                                            dbCategories.map(cat => (
                                                <option key={cat.id} value={cat.name}>
                                                    {cat.icon ? `${cat.icon} ` : ''}{cat.name}
                                                </option>
                                            ))
                                        ) : (
                                            // Fallback hardcoded options
                                            <>
                                                <option value="Cloud & DevOps Engineering">☁️ Cloud &amp; DevOps Engineering</option>
                                                <option value="Software Development">💻 Software Development</option>
                                                <option value="Data Science & Artificial Intelligence">🤖 Data Science &amp; AI</option>
                                                <option value="Cyber Security">🔐 Cyber Security</option>
                                                <option value="Networking & System Administration">🌐 Networking &amp; System Admin</option>
                                                <option value="ERP & SAP">🏭 ERP &amp; SAP</option>
                                                <option value="ITSM & CRM Platforms">🛠️ ITSM &amp; CRM Platforms</option>
                                                <option value="HR Management">👥 HR Management</option>
                                                <option value="Finance & Marketing">📊 Finance &amp; Marketing</option>
                                            </>
                                        )}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Difficulty</label>
                                    <select
                                        aria-label="Course Difficulty"
                                        className="w-full p-2 border rounded-md bg-background"
                                        value={basicData.difficulty}
                                        onChange={e => setBasicData({ ...basicData, difficulty: e.target.value })}
                                    >
                                        <option value="BEGINNER">Beginner</option>
                                        <option value="INTERMEDIATE">Intermediate</option>
                                        <option value="ADVANCED">Advanced</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Course Duration (hours)</label>
                                    <Input
                                        type="number"
                                        min="0"
                                        step="0.5"
                                        value={basicData.duration}
                                        onChange={e => setBasicData({ ...basicData, duration: Number(e.target.value) })}
                                        placeholder="e.g. 24"
                                    />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-semibold">Course Banner Image</label>
                                    <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full font-medium">Recommended: 1200x400 (3:1)</span>
                                </div>
                                <div className="group relative">
                                    <Input
                                        type="file"
                                        accept="image/jpeg,image/png,image/webp,image/jpg"
                                        className="cursor-pointer bg-muted/20 hover:bg-muted/40 transition-colors border-dashed"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0] || null

                                            if (!file) return

                                            const allowedTypes = [
                                                "image/jpeg",
                                                "image/png",
                                                "image/webp",
                                                "image/jpg"
                                            ]

                                            if (!allowedTypes.includes(file.type)) {
                                                alert("Only JPG, PNG, WEBP allowed")
                                                return
                                            }

                                            const maxSize = 2 * 1024 * 1024

                                            if (file.size > maxSize) {
                                                alert("Image must be under 2MB")
                                                return
                                            }

                                            setBannerFile(file)
                                            setBannerPreview(URL.createObjectURL(file))
                                        }}
                                    />
                                    <p className="text-[11px] text-muted-foreground mt-1.5 px-1">
                                        This image will be displayed at the top of the course page. Use high-quality visuals to attract students.
                                    </p>
                                </div>
                                
                                {(bannerPreview || basicData.bannerUrl) && (
                                    <div className="mt-4 relative rounded-xl overflow-hidden border shadow-sm group">
                                        <Image
                                            src={
                                                bannerPreview
                                                    ? bannerPreview
                                                    : basicData.bannerUrl
                                                        ? getFullImageUrl(basicData.bannerUrl)
                                                        : "/placeholder.jpg"
                                            }
                                            alt="Banner preview"
                                            width={1200}
                                            height={400}
                                            className="w-full aspect-[3/1] object-cover"
                                        />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <p className="text-white text-xs font-medium">Click "Choose File" to replace</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Price fields hidden as per user request */}

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Course Code</label>
                                <Input
                                    value={basicData.courseCode}
                                    onChange={e => setBasicData({ ...basicData, courseCode: e.target.value })}
                                    placeholder="e.g. REACT-101"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Job Roles (Comma separated)</label>
                                <Input
                                    value={basicData.jobRoles.join(', ')}
                                    onChange={e => {
                                        const roles = e.target.value
                                            .split(',')
                                            .map(s => s.trim())
                                            .filter(Boolean); // Remove empty strings
                                        setBasicData({ ...basicData, jobRoles: roles });
                                    }}
                                    placeholder="Frontend Dev, UI Engineer..."
                                />
                            </div>

                            {/* Course Type */}
                            <div className="space-y-3 pt-4 border-t">
                                <label className="text-sm font-medium">Course Type</label>
                                <div className="grid grid-cols-3 gap-3">
                                    {[
                                        { value: 'RECORDED', label: 'Recorded', desc: 'Pre-recorded video lessons' },
                                        { value: 'LIVE', label: 'Live', desc: 'Scheduled live sessions' },
                                        { value: 'HYBRID', label: 'Hybrid', desc: 'Mix of live + recorded' }
                                    ].map(type => (
                                        <button
                                            key={type.value}
                                            type="button"
                                            onClick={() => setBasicData({ ...basicData, courseType: type.value as 'RECORDED' | 'LIVE' | 'HYBRID' })}
                                            className={`p-3 rounded-lg border-2 text-left transition-all ${basicData.courseType === type.value
                                                ? 'border-primary bg-primary/5'
                                                : 'border-border hover:border-primary/50'
                                                }`}
                                        >
                                            <div className="font-medium">{type.label}</div>
                                            <div className="text-xs text-muted-foreground">{type.desc}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Interview Integration */}
                            <div className="space-y-3 pt-4 border-t">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <label className="text-sm font-medium">Interview Prep Integration</label>
                                        <p className="text-xs text-muted-foreground">Link AI interview practice with this course</p>
                                    </div>
                                    <button
                                        type="button"
                                        aria-label="Toggle Interview Prep"
                                        onClick={() => setBasicData({ ...basicData, hasInterviewPrep: !basicData.hasInterviewPrep })}
                                        className={`w-12 h-6 rounded-full transition-colors ${basicData.hasInterviewPrep ? 'bg-primary' : 'bg-muted'
                                            } relative`}
                                    >
                                        <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${basicData.hasInterviewPrep ? 'translate-x-7' : 'translate-x-1'
                                            }`} />
                                    </button>
                                </div>
                                {basicData.hasInterviewPrep && (
                                    <div className="space-y-2 hidden">
                                        <label className="text-sm font-medium">Interview Prep Price (₹)</label>
                                        <Input
                                            type="number"
                                            value={basicData.interviewPrice}
                                            onChange={e => setBasicData({ ...basicData, interviewPrice: Number(e.target.value) })}
                                            min="0"
                                            placeholder="Add-on price for interview prep"
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Job Prep Integration */}
                            <div className="space-y-3 pt-4 border-t">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <label className="text-sm font-medium">Job Placement & Assistance (Job Prep)</label>
                                        <p className="text-xs text-muted-foreground">Toggle to flag this course as a Placement Assistance / Job Prep Program</p>
                                    </div>
                                    <button
                                        type="button"
                                        aria-label="Toggle Job Prep"
                                        onClick={() => setBasicData({ ...basicData, jobPrep: !basicData.jobPrep })}
                                        className={`w-12 h-6 rounded-full transition-colors ${basicData.jobPrep ? 'bg-primary' : 'bg-muted'
                                            } relative`}
                                    >
                                        <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${basicData.jobPrep ? 'translate-x-7' : 'translate-x-1'
                                            }`} />
                                    </button>
                                </div>
                            </div>

                            {/* Marketing & Pricing Features */}
                            <div className="space-y-4 pt-4 border-t">
                                <h3 className="text-sm font-semibold">Marketing & Pricing Settings</h3>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Initial Enrolled Count (Fake Count)</label>
                                        <Input
                                            type="number"
                                            value={basicData.fakeEnrolledCount}
                                            onChange={e => setBasicData({ ...basicData, fakeEnrolledCount: Number(e.target.value) })}
                                            min="0"
                                            placeholder="e.g. 500"
                                        />
                                        <p className="text-[10px] text-muted-foreground">This number is added to actual enrollments to show public popularity.</p>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Initial Rating (Fake Rating)</label>
                                        <Input
                                            type="number"
                                            value={basicData.fakeRating}
                                            onChange={e => setBasicData({ ...basicData, fakeRating: Number(e.target.value) })}
                                            min="0"
                                            max="5"
                                            step="0.1"
                                            placeholder="e.g. 4.8"
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center justify-between mt-2">
                                    <div>
                                        <label className="text-sm font-medium">Require Admission Fee</label>
                                        <p className="text-xs text-muted-foreground">If enabled, students must pay an admission fee before enrolling.</p>
                                    </div>
                                    <button
                                        type="button"
                                        aria-label="Toggle Admission Fee"
                                        onClick={() => setBasicData({ ...basicData, requireAdmissionFee: !basicData.requireAdmissionFee })}
                                        className={`w-12 h-6 rounded-full transition-colors ${basicData.requireAdmissionFee ? 'bg-primary' : 'bg-muted'
                                            } relative`}
                                    >
                                        <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${basicData.requireAdmissionFee ? 'translate-x-7' : 'translate-x-1'
                                            }`} />
                                    </button>
                                </div>

                                {basicData.requireAdmissionFee && (
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Admission Fee Amount (₹)</label>
                                        <Input
                                            type="number"
                                            value={basicData.admissionFee}
                                            onChange={e => setBasicData({ ...basicData, admissionFee: Number(e.target.value) })}
                                            min="0"
                                            placeholder="e.g. 1000"
                                        />
                                    </div>
                                )}
                            </div>

                            {/* SEO Settings (Phase 1) */}
                            <div className="space-y-4 pt-6 border-t">
                                <div>
                                    <h3 className="text-lg font-medium">SEO & Meta Data</h3>
                                    <p className="text-sm text-muted-foreground">Optimize your course for search engines</p>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">SEO URL (Slug) <span className="text-muted-foreground font-normal">(optional)</span></label>
                                        <Input
                                            value={basicData.slug}
                                            onChange={e => setBasicData({ ...basicData, slug: e.target.value })}
                                            placeholder="e.g. python-full-stack-development-course"
                                        />
                                        <p className="text-xs text-muted-foreground">Leave blank to auto-generate from title</p>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">SEO Title</label>
                                        <Input
                                            value={basicData.seoTitle}
                                            onChange={e => setBasicData({ ...basicData, seoTitle: e.target.value })}
                                            placeholder="e.g. Python Full Stack Development Course | Live Training"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Meta Description</label>
                                    <Textarea
                                        value={basicData.metaDescription}
                                        onChange={e => setBasicData({ ...basicData, metaDescription: e.target.value })}
                                        placeholder="Brief summary for search engine results..."
                                        rows={3}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Target Keywords (comma separated)</label>
                                    <Input
                                        value={basicData.targetKeywords?.join(', ')}
                                        onChange={e => setBasicData({ 
                                            ...basicData, 
                                            targetKeywords: e.target.value.split(',').map(k => k.trim()).filter(Boolean) 
                                        })}
                                        placeholder="e.g. python course, full stack training, web development"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <label className="text-sm font-medium">Frequently Asked Questions (FAQ Schema)</label>
                                        <Button 
                                            type="button" 
                                            variant="outline" 
                                            size="sm"
                                            onClick={() => setBasicData({
                                                ...basicData,
                                                faqs: [...(basicData.faqs || []), { question: '', answer: '' }]
                                            })}
                                        >
                                            <Plus className="h-4 w-4 mr-2" />
                                            Add FAQ
                                        </Button>
                                    </div>
                                    {basicData.faqs?.map((faq, index) => (
                                        <div key={index} className="space-y-2 p-3 border rounded-md relative">
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="absolute top-2 right-2 h-6 w-6 p-0 text-destructive"
                                                onClick={() => {
                                                    const newFaqs = [...basicData.faqs];
                                                    newFaqs.splice(index, 1);
                                                    setBasicData({ ...basicData, faqs: newFaqs });
                                                }}
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                            <Input
                                                placeholder="Question"
                                                value={faq.question}
                                                onChange={e => {
                                                    const newFaqs = [...basicData.faqs];
                                                    newFaqs[index].question = e.target.value;
                                                    setBasicData({ ...basicData, faqs: newFaqs });
                                                }}
                                                className="pr-8"
                                            />
                                            <Textarea
                                                placeholder="Answer"
                                                value={faq.answer}
                                                onChange={e => {
                                                    const newFaqs = [...basicData.faqs];
                                                    newFaqs[index].answer = e.target.value;
                                                    setBasicData({ ...basicData, faqs: newFaqs });
                                                }}
                                                rows={2}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* SEO Content Settings (Phase 2) */}
                            <div className="space-y-6 pt-6 border-t">
                                <div>
                                    <h3 className="text-lg font-medium">Course Landing Page Content</h3>
                                    <p className="text-sm text-muted-foreground">Add high-converting sections for your course landing page</p>
                                </div>

                                {/* Prerequisites */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Prerequisites</label>
                                    <Textarea
                                        value={basicData.prerequisites?.join('\n')}
                                        onChange={e => setBasicData({ ...basicData, prerequisites: e.target.value.split('\n').filter(Boolean) })}
                                        placeholder="Enter each prerequisite on a new line"
                                        rows={3}
                                    />
                                </div>

                                {/* Learning Outcomes */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Learning Outcomes</label>
                                    <Textarea
                                        value={basicData.learningOutcomes?.join('\n')}
                                        onChange={e => setBasicData({ ...basicData, learningOutcomes: e.target.value.split('\n').filter(Boolean) })}
                                        placeholder="Enter each outcome on a new line"
                                        rows={4}
                                    />
                                </div>

                                {/* Tools Covered */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Tools Covered</label>
                                    <Textarea
                                        value={basicData.toolsCovered?.join('\n')}
                                        onChange={e => setBasicData({ ...basicData, toolsCovered: e.target.value.split('\n').filter(Boolean) })}
                                        placeholder="Enter each tool on a new line (e.g. React, Docker, AWS)"
                                        rows={3}
                                    />
                                </div>

                                {/* Projects */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <label className="text-sm font-medium">Hands-on Projects</label>
                                        <Button 
                                            type="button" variant="outline" size="sm"
                                            onClick={() => setBasicData({ ...basicData, projects: [...(basicData.projects || []), { title: '', description: '', duration: '' }] })}
                                        >
                                            <Plus className="h-4 w-4 mr-2" /> Add Project
                                        </Button>
                                    </div>
                                    {basicData.projects?.map((proj, index) => (
                                        <div key={index} className="space-y-2 p-3 border rounded-md relative">
                                            <Button type="button" variant="ghost" size="sm" className="absolute top-2 right-2 h-6 w-6 p-0 text-destructive"
                                                onClick={() => { const newArr = [...basicData.projects]; newArr.splice(index, 1); setBasicData({ ...basicData, projects: newArr }); }}><X className="h-4 w-4" /></Button>
                                            <Input placeholder="Project Title" value={proj.title} onChange={e => { const newArr = [...basicData.projects]; newArr[index].title = e.target.value; setBasicData({ ...basicData, projects: newArr }); }} className="pr-8" />
                                            <Textarea placeholder="Project Description" value={proj.description} onChange={e => { const newArr = [...basicData.projects]; newArr[index].description = e.target.value; setBasicData({ ...basicData, projects: newArr }); }} rows={2} />
                                            <Input placeholder="Duration (e.g. 2 weeks)" value={proj.duration} onChange={e => { const newArr = [...basicData.projects]; newArr[index].duration = e.target.value; setBasicData({ ...basicData, projects: newArr }); }} />
                                        </div>
                                    ))}
                                </div>

                                {/* Career Opportunities */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <label className="text-sm font-medium">Career Opportunities</label>
                                        <Button 
                                            type="button" variant="outline" size="sm"
                                            onClick={() => setBasicData({ ...basicData, careerOpportunities: [...(basicData.careerOpportunities || []), { role: '', description: '' }] })}
                                        >
                                            <Plus className="h-4 w-4 mr-2" /> Add Role
                                        </Button>
                                    </div>
                                    {basicData.careerOpportunities?.map((item, index) => (
                                        <div key={index} className="space-y-2 p-3 border rounded-md relative flex gap-2">
                                            <div className="flex-1 space-y-2">
                                                <Input placeholder="Job Role (e.g. Software Engineer)" value={item.role} onChange={e => { const newArr = [...basicData.careerOpportunities]; newArr[index].role = e.target.value; setBasicData({ ...basicData, careerOpportunities: newArr }); }} />
                                                <Input placeholder="Short Description" value={item.description} onChange={e => { const newArr = [...basicData.careerOpportunities]; newArr[index].description = e.target.value; setBasicData({ ...basicData, careerOpportunities: newArr }); }} />
                                            </div>
                                            <Button type="button" variant="ghost" size="sm" className="h-10 w-10 p-0 text-destructive self-start"
                                                onClick={() => { const newArr = [...basicData.careerOpportunities]; newArr.splice(index, 1); setBasicData({ ...basicData, careerOpportunities: newArr }); }}><X className="h-4 w-4" /></Button>
                                        </div>
                                    ))}
                                </div>

                                {/* Salary Insights */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <label className="text-sm font-medium">Salary Insights</label>
                                        <Button 
                                            type="button" variant="outline" size="sm"
                                            onClick={() => setBasicData({ ...basicData, salaryInsights: [...(basicData.salaryInsights || []), { role: '', min: '', max: '', average: '' }] })}
                                        >
                                            <Plus className="h-4 w-4 mr-2" /> Add Insight
                                        </Button>
                                    </div>
                                    {basicData.salaryInsights?.map((item, index) => (
                                        <div key={index} className="space-y-2 p-3 border rounded-md relative grid grid-cols-2 gap-2">
                                            <Button type="button" variant="ghost" size="sm" className="absolute -top-3 -right-3 h-6 w-6 p-0 bg-background border text-destructive rounded-full"
                                                onClick={() => { const newArr = [...basicData.salaryInsights]; newArr.splice(index, 1); setBasicData({ ...basicData, salaryInsights: newArr }); }}><X className="h-4 w-4" /></Button>
                                            <Input className="col-span-2" placeholder="Job Role (e.g. Full Stack Developer)" value={item.role} onChange={e => { const newArr = [...basicData.salaryInsights]; newArr[index].role = e.target.value; setBasicData({ ...basicData, salaryInsights: newArr }); }} />
                                            <Input placeholder="Min (e.g. ₹4 LPA)" value={item.min} onChange={e => { const newArr = [...basicData.salaryInsights]; newArr[index].min = e.target.value; setBasicData({ ...basicData, salaryInsights: newArr }); }} />
                                            <Input placeholder="Max (e.g. ₹12 LPA)" value={item.max} onChange={e => { const newArr = [...basicData.salaryInsights]; newArr[index].max = e.target.value; setBasicData({ ...basicData, salaryInsights: newArr }); }} />
                                            <Input className="col-span-2" placeholder="Average (e.g. ₹6 LPA)" value={item.average} onChange={e => { const newArr = [...basicData.salaryInsights]; newArr[index].average = e.target.value; setBasicData({ ...basicData, salaryInsights: newArr }); }} />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex justify-end pt-4">
                                <Button type="submit" disabled={isLoading}>
                                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Next: Curriculum
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            {/* STEP 2: CURRICULUM */}
            {step === 2 && (
                <div className="space-y-6">
                    {/* AI Generator Box */}
                    <Card className="border-primary/50 bg-primary/5">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Wand2 className="h-5 w-5 text-primary" />
                                AI Curriculum Generator
                            </CardTitle>
                            <CardDescription>
                                Automatically generate modules and lessons structure based on your topic.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex gap-4">
                                <Input
                                    value={aiTopic}
                                    onChange={e => setAiTopic(e.target.value)}
                                    placeholder="Enter topic (e.g. Advanced Python Patterns)"
                                />
                                <Button onClick={handleGenerateAI} disabled={isGenerating}>
                                    {isGenerating ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Generating...
                                        </>
                                    ) : (
                                        <>
                                            <Wand2 className="mr-2 h-4 w-4" />
                                            Generate
                                        </>
                                    )}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Modules List */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Course Curriculum</CardTitle>
                            <Button variant="outline" size="sm" onClick={handleAddModule}>
                                <Plus className="mr-2 h-4 w-4" /> Add Module
                            </Button>
                        </CardHeader>
                        <CardContent>
                            {modules.length === 0 ? (
                                <div className="text-center py-12 text-muted-foreground border-dashed border-2 rounded-lg">
                                    No modules yet. Use the AI Generator above or add manually.
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {modules.map((mod, idx) => (
                                        <div key={idx} className="border rounded-lg p-4 bg-card">
                                            <button
                                                type="button"
                                                onClick={() => toggleModuleEditor(idx)}
                                                className="w-full flex items-center justify-between gap-3 text-left"
                                            >
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <GripVertical className="h-5 w-5 text-muted-foreground shrink-0" />
                                                    <div className="min-w-0">
                                                        <div className="font-medium truncate">{mod.title || `Module ${idx + 1}`}</div>
                                                        <div className="text-xs text-muted-foreground">{mod.lessons.length} lessons</div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Badge variant="secondary">{expandedModuleIndexes.includes(idx) ? 'Hide' : 'Edit'}</Badge>
                                                    <span className="text-muted-foreground">{expandedModuleIndexes.includes(idx) ? '-' : '+'}</span>
                                                </div>
                                            </button>
                                            {expandedModuleIndexes.includes(idx) && (
                                                <div className="mt-4">
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center gap-3 flex-1">
                                                    <GripVertical className="h-5 w-5 text-muted-foreground" />
                                                    <div className="flex-1">
                                                        <Input
                                                            type="text"
                                                            placeholder="Module title"
                                                            className="h-8 font-medium mb-2"
                                                            value={mod.title}
                                                            onChange={(e) => handleUpdateModule(idx, { title: e.target.value })}
                                                        />
                                                        <Textarea
                                                            placeholder="Module description"
                                                            className="text-sm min-h-[50px]"
                                                            value={mod.description}
                                                            onChange={(e) => handleUpdateModule(idx, { description: e.target.value })}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Badge variant="secondary">{mod.lessons.length} Lessons</Badge>
                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        onClick={() => {
                                                            if (confirm('Delete this module?')) {
                                                                handleDeleteModule(idx)
                                                            }
                                                        }}
                                                    >
                                                        Delete
                                                    </Button>
                                                </div>
                                            </div>
                                            <div className="pl-8 space-y-4 border-l-2 ml-2">
                                                {mod.lessons.map((lesson, lIdx) => (
                                                    <div key={lIdx} className="p-4 bg-muted/30 rounded border space-y-3">
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-medium text-sm">Lesson {lIdx + 1}: {lesson.title}</span>
                                                                <Badge variant="outline" className="text-[10px]">{lesson.type}</Badge>
                                                                <Badge variant={lesson.isPublished ? 'default' : 'secondary'} className="text-[10px]">
                                                                    {lesson.isPublished ? 'Published' : 'Draft'}
                                                                </Badge>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-xs text-muted-foreground">{Math.round(lesson.duration / 60)} min</span>
                                                                {/* Simple Toggle for Publish */}
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => {
                                                                        const newModules = [...modules]
                                                                        newModules[idx].lessons[lIdx].isPublished = !lesson.isPublished
                                                                        setModules(newModules)
                                                                    }}
                                                                >
                                                                    {lesson.isPublished ? 'Unpublish' : 'Publish'}
                                                                </Button>
                                                            </div>
                                                        </div>

                                                        {/* Type & Content Editor */}
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            <div>
                                                                <label className="text-xs font-medium">Type</label>
                                                                <select
                                                                    aria-label="Lesson Type"
                                                                    className="w-full p-2 h-9 text-sm border rounded bg-background"
                                                                    value={lesson.type}
                                                                    onChange={(e) => {
                                                                        const newModules = [...modules]
                                                                        newModules[idx].lessons[lIdx].type = e.target.value as any
                                                                        setModules(newModules)
                                                                    }}
                                                                >
                                                                    <option value="VIDEO">Video Lesson</option>
                                                                    <option value="TEXT">Text / Article</option>
                                                                    <option value="PDF">PDF Resource</option>
                                                                    <option value="QUIZ">Quiz / Test</option>
                                                                    <option value="ASSIGNMENT">Assignment</option>
                                                                </select>
                                                            </div>
                                                            <div>
                                                                <label className="text-xs font-medium">Duration (sec)</label>
                                                                <Input
                                                                    type="number"
                                                                    className="h-9"
                                                                    value={lesson.duration}
                                                                    onChange={(e) => {
                                                                        const newModules = [...modules]
                                                                        newModules[idx].lessons[lIdx].duration = Number(e.target.value)
                                                                        setModules(newModules)
                                                                    }}
                                                                />
                                                            </div>
                                                        </div>

                                                        {/* Dynamic Content Input based on Type */}
                                                        {lesson.type === 'VIDEO' && (
                                                            <div className="bg-background rounded p-2 border">
                                                                <VideoUpload
                                                                    label={`Video Source`}
                                                                    initialUrl={lesson.videoUrl}
                                                                    onUploadComplete={(url) => {
                                                                        const newModules = [...modules]
                                                                        newModules[idx].lessons[lIdx].videoUrl = url
                                                                        setModules(newModules)
                                                                    }}
                                                                />
                                                            </div>
                                                        )}

                                                        {(lesson.type === 'TEXT' || lesson.type === 'PDF' || lesson.type === 'ASSIGNMENT') && (
                                                            <div className="space-y-2">
                                                                <label className="text-xs font-medium">
                                                                    {lesson.type === 'PDF' ? 'PDF URL' : 'Content / Instructions'}
                                                                </label>
                                                                {lesson.type === 'PDF' ? (
                                                                    <Textarea
                                                                        className="min-h-[100px]"
                                                                        placeholder="Paste PDF link here..."
                                                                        value={lesson.content || ''}
                                                                        onChange={(e) => {
                                                                            const newModules = [...modules]
                                                                            newModules[idx].lessons[lIdx].content = e.target.value
                                                                            setModules(newModules)
                                                                        }}
                                                                    />
                                                                ) : (
                                                                    <RichTextEditor
                                                                        value={lesson.content || ''}
                                                                        onChange={(val: string) => {
                                                                            const newModules = [...modules]
                                                                            newModules[idx].lessons[lIdx].content = val
                                                                            setModules(newModules)
                                                                        }}
                                                                        placeholder="Write lesson content here..."
                                                                    />
                                                                )}
                                                            </div>
                                                        )}

                                                        {lesson.type === 'QUIZ' && (
                                                            <div className="p-3 bg-muted text-xs rounded border mt-3 flex items-center justify-between">
                                                                <span className="font-medium text-foreground">Quiz Configuration</span>
                                                                {lesson.id ? (
                                                                    <Button size="sm" onClick={() => setQuizBuilderLessonId(lesson.id || null)}>
                                                                        Manage Quizzes
                                                                    </Button>
                                                                ) : (
                                                                    <span className="text-muted-foreground italic bg-secondary px-2 py-1 rounded">Save Curriculum first to manage quizzes</span>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="flex justify-between mt-8 pt-4 border-t">
                                <Button variant="ghost" onClick={() => setStep(1)}>Back</Button>
                                <Button onClick={handleSaveCurriculum} disabled={modules.length === 0 || isLoading}>
                                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Save & Continue
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* STEP 3: REVIEW & DEPLOY */}
            {step === 3 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-green-600">
                            <CheckCircle2 className="h-6 w-6" />
                            Ready to Deploy!
                        </CardTitle>
                        <CardDescription>
                            Review your course details and choose how to publish.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Course Summary */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                                <span className="text-muted-foreground">Title:</span>
                                <p className="font-medium">{basicData.title}</p>
                            </div>
                            <div>
                                <span className="text-muted-foreground">Category:</span>
                                <p className="font-medium">{basicData.category}</p>
                            </div>
                            <div>
                                <span className="text-muted-foreground">Course Type:</span>
                                <p className="font-medium">{basicData.courseType}</p>
                            </div>
                            <div>
                                <span className="text-muted-foreground">Difficulty:</span>
                                <p className="font-medium">{basicData.difficulty}</p>
                            </div>
                            <div>
                                <span className="text-muted-foreground">Duration:</span>
                                <p className="font-medium">{basicData.duration || 0} hours</p>
                            </div>
                            <div>
                                <span className="text-muted-foreground">Modules:</span>
                                <p className="font-medium">{modules.length}</p>
                            </div>
                            <div>
                                <span className="text-muted-foreground">Total Lessons:</span>
                                <p className="font-medium">{modules.reduce((acc, m) => acc + m.lessons.length, 0)}</p>
                            </div>
                            {/* Price hidden from review as per user request */}
                            <div>
                                <span className="text-muted-foreground">Interview Prep:</span>
                                <p className="font-medium">{basicData.hasInterviewPrep ? 'Yes' : 'No'}</p>
                            </div>
                            <div>
                                <span className="text-muted-foreground">Job Prep:</span>
                                <p className="font-medium">{basicData.jobPrep ? 'Yes' : 'No'}</p>
                            </div>
                        </div>

                        {/* Deployment Options */}
                        <div className="border-t pt-6">
                            <h4 className="font-medium mb-4">Choose Deployment Option</h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <button
                                    type="button"
                                    onClick={() => handleStatusUpdate('DRAFT')}
                                    className="p-4 border rounded-lg text-left hover:border-primary transition-colors"
                                >
                                    <div className="font-medium text-muted-foreground">Save as Draft</div>
                                    <p className="text-xs text-muted-foreground mt-1">Save for later editing. Not visible to students.</p>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleStatusUpdate('IN_REVIEW')}
                                    className="p-4 border rounded-lg text-left hover:border-primary transition-colors"
                                >
                                    <div className="font-medium text-orange-600">Submit for Review</div>
                                    <p className="text-xs text-muted-foreground mt-1">Send to admin for approval before publishing.</p>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleStatusUpdate('PUBLISHED')}
                                    className="p-4 border-2 border-primary rounded-lg text-left bg-primary/5"
                                >
                                    <div className="font-medium text-primary">Publish Now</div>
                                    <p className="text-xs text-muted-foreground mt-1">Make visible to all students immediately.</p>
                                </button>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-4 pt-4 border-t">
                            <Button variant="outline" onClick={() => setStep(2)}>
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Curriculum
                            </Button>
                            <Button variant="outline" className="flex-1" onClick={() => router.push(`/courses/${courseId}`)}>
                                Preview Course
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}
            {/* Quiz Builder Dialog */}
            {quizBuilderLessonId && (
                <QuizBuilderDialog 
                    lessonId={quizBuilderLessonId} 
                    onClose={() => setQuizBuilderLessonId(null)} 
                />
            )}
        </div>
    )
}
