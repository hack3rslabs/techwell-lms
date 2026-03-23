"use client"

import * as React from 'react'
import { useRouter } from 'next/navigation'
import api, { courseApi } from '@/lib/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Loader2, Wand2, Plus, GripVertical, CheckCircle, ArrowRight, ArrowLeft } from 'lucide-react'
import { VideoUpload } from '@/components/admin/VideoUpload'

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

    // Fetch initial data if editing
    React.useEffect(() => {
        if (initialCourseId) {
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
                        courseCode: c.courseCode || '',
                        bannerUrl: c.bannerUrl || '',
                        jobRoles: c.jobRoles || [],
                        courseType: c.courseType || 'RECORDED',
                        hasInterviewPrep: c.hasInterviewPrep || false,
                        interviewPrice: Number(c.interviewPrice) || 0
                    })
                    if (c.modules) {
                        setModules(c.modules)
                    }
                } catch (error) {
                    console.error("Failed to fetch course", error)
                }
            }
            fetchCourse()
        }
    }, [initialCourseId])

    // Step 1 Data
    const [basicData, setBasicData] = React.useState({
        title: '',
        description: '',
        category: 'Development',
        price: 0,
        discountPrice: 0,
        difficulty: 'BEGINNER',
        courseCode: '',
        bannerUrl: '',
        jobRoles: [] as string[],
        // Course Types
        courseType: 'RECORDED' as 'RECORDED' | 'LIVE' | 'HYBRID',
        hasInterviewPrep: false,
        interviewPrice: 0
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
    const [isGenerating, setIsGenerating] = React.useState(false)

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
        
        // Validate URLs if provided
        const validateUrl = (url: string): boolean => {
            if (!url) return true // URL is optional
            try {
                new URL(url)
                return true
            } catch {
                return false
            }
        }
        
        if (basicData.bannerUrl && !validateUrl(basicData.bannerUrl)) {
            alert('Banner URL must be a valid URL (e.g., https://example.com/image.jpg)')
            return
        }
        
        setIsLoading(true)
        try {
            // Clean jobRoles: remove empty strings
            const cleanJobRoles = Array.isArray(basicData.jobRoles) ? basicData.jobRoles.filter(Boolean) : [];
            
            // Ensure all numeric fields are actually numbers (not strings)
            const payload = {
                ...basicData,
                jobRoles: cleanJobRoles,
                price: Number(basicData.price) || 0,
                discountPrice: Number(basicData.discountPrice) || 0,
                interviewPrice: Number(basicData.interviewPrice) || 0,
            };
            if (courseId) {
                // Update existing
                await courseApi.update(courseId, payload)
            } else {
                // Create new
                const res = await courseApi.create(payload)
                setCourseId(res.data.course.id)
                // Pre-fill AI topic with title
                setAiTopic(basicData.title)
            }
            setStep(2)
        } catch (error: any) {
            console.error('Failed to save course:', error)
            console.error('Response data:', error.response?.data)
            // Show backend validation errors with details
            if (error.response?.data?.details && Array.isArray(error.response.data.details)) {
                const validationErrors = error.response.data.details
                    .map((err: any) => `${err.path?.join('.')} - ${err.message}`)
                    .join('\n')
                alert(`Validation Error:\n${validationErrors}`)
            } else if (error.response?.data?.error) {
                alert(`Error: ${error.response.data.error}`)
            } else if (error.response?.status === 400) {
                alert(`Error: Invalid data. Check console for details.\n${JSON.stringify(error.response.data)}`)
            } else {
                alert(`Error: ${error.message || 'Failed to save course details'}`)
            }
        } finally {
            setIsLoading(false)
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
                difficulty: res.data.courseData.difficulty
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
        const newModule: Module = {
            title: 'New Module',
            description: 'Module description',
            orderIndex: modules.length,
            isPublished: false,
            lessons: []
        }
        setModules([...modules, newModule])
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
    }

    const handleAddLesson = (moduleIdx: number) => {
        const newLesson: Lesson = {
            title: 'New Lesson',
            type: 'VIDEO',
            duration: 0,
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
                                <Textarea
                                    value={basicData.description}
                                    onChange={e => setBasicData({ ...basicData, description: e.target.value })}
                                    placeholder="What will students learn?"
                                    className="min-h-[100px]"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Category</label>
                                    <select
                                        aria-label="Course Category"
                                        className="w-full p-2 border rounded-md bg-background"
                                        value={basicData.category}
                                        onChange={e => setBasicData({ ...basicData, category: e.target.value })}
                                    >
                                        <option value="Development">Development</option>
                                        <option value="Business">Business</option>
                                        <option value="Design">Design</option>
                                        <option value="Marketing">Marketing</option>
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
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Banner URL</label>
                                <Input
                                    value={basicData.bannerUrl}
                                    onChange={e => setBasicData({ ...basicData, bannerUrl: e.target.value })}
                                    placeholder="https://..."
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Price (₹)</label>
                                    <Input
                                        type="number"
                                        value={basicData.price}
                                        onChange={e => setBasicData({ ...basicData, price: Number(e.target.value) })}
                                        min="0"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Discount Price (₹)</label>
                                    <Input
                                        type="number"
                                        value={basicData.discountPrice}
                                        onChange={e => setBasicData({ ...basicData, discountPrice: Number(e.target.value) })}
                                        min="0"
                                    />
                                </div>
                            </div>

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
                                    <div className="space-y-2">
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
                                                                <Textarea
                                                                    className="min-h-[100px]"
                                                                    placeholder={lesson.type === 'PDF' ? 'Paste PDF link here...' : 'Write content details...'}
                                                                    value={lesson.content || ''}
                                                                    onChange={(e) => {
                                                                        const newModules = [...modules]
                                                                        newModules[idx].lessons[lIdx].content = e.target.value
                                                                        setModules(newModules)
                                                                    }}
                                                                />
                                                            </div>
                                                        )}

                                                        {lesson.type === 'QUIZ' && (
                                                            <div className="p-3 bg-yellow-50 text-yellow-800 text-xs rounded border border-yellow-200">
                                                                Quiz configuration is handled in the dedicated Quiz Builder after saving.
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
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
                            <CheckCircle className="h-6 w-6" />
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
                                <span className="text-muted-foreground">Modules:</span>
                                <p className="font-medium">{modules.length}</p>
                            </div>
                            <div>
                                <span className="text-muted-foreground">Total Lessons:</span>
                                <p className="font-medium">{modules.reduce((acc, m) => acc + m.lessons.length, 0)}</p>
                            </div>
                            <div>
                                <span className="text-muted-foreground">Price:</span>
                                <p className="font-medium">₹{basicData.price}</p>
                            </div>
                            <div>
                                <span className="text-muted-foreground">Interview Prep:</span>
                                <p className="font-medium">{basicData.hasInterviewPrep ? 'Yes' : 'No'}</p>
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
        </div>
    )
}
