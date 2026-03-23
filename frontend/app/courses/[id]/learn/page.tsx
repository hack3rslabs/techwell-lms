"use client"

import * as React from 'react'
import { useRouter, useParams } from 'next/navigation'
import api from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import {
    Loader2,
    PlayCircle,
    CheckCircle2,
    Lock,
    Menu,
    ChevronLeft,
    FileText,
    Award
} from 'lucide-react'
import { cn } from '@/lib/utils'
import DOMPurify from 'isomorphic-dompurify'

interface Lesson {
    id: string
    title: string
    duration: number
    content?: string
    videoUrl?: string
    order: number
    progress: { isCompleted: boolean }[]
}

interface Module {
    id: string
    title: string
    orderIndex: number
    lessons: Lesson[]
}

interface Course {
    id: string
    title: string
    modules: Module[]
}

export default function CourseLearnPage() {
    const params = useParams()
    const router = useRouter()

    // Expanded Interfaces
    interface QuizOption {
        optionText: string
        isCorrect: boolean
    }
    interface QuizQuestion {
        id: string
        question: string
        options: QuizOption[]
        correctAnswer: string
    }
    interface Lesson {
        id: string
        title: string
        type: 'VIDEO' | 'TEXT' | 'QUIZ' | 'ASSIGNMENT' | 'PDF'
        duration: number
        content?: string
        videoUrl?: string
        order: number
        isLocked: boolean
        isCompleted: boolean
        lastScore?: number
        quizzes?: QuizQuestion[]
        settings?: Record<string, unknown>
    }
    interface Module {
        id: string
        title: string
        description: string
        orderIndex: number
        lessons: Lesson[]
    }
    interface Course {
        id: string
        title: string
        modules: Module[]
        userProgress: number
    }

    const [course, setCourse] = React.useState<Course | null>(null)
    const [activeLesson, setActiveLesson] = React.useState<Lesson | null>(null)
    const [isLoading, setIsLoading] = React.useState(true)
    const [sidebarOpen, setSidebarOpen] = React.useState(true)

    // Quiz State
    const [quizAnswers, setQuizAnswers] = React.useState<Record<string, string>>({})
    const [quizSubmitted, setQuizSubmitted] = React.useState(false)
    const [quizScore, setQuizScore] = React.useState(0)

    React.useEffect(() => {
        const fetchContent = async () => {
            try {
                // Use the new LMS route
                const res = await api.get(`/courses/${params.id}/learn`)
                if (res.data.course) {
                    setCourse(res.data.course)

                    // Intelligent Resume: Find first unlocked and incomplete lesson
                    const modules = res.data.course.modules as Module[]
                    let resumeLesson = null

                    for (const mod of modules) {
                        for (const lesson of mod.lessons) {
                            if (!lesson.isCompleted && !lesson.isLocked) {
                                resumeLesson = lesson
                                break
                            }
                        }
                        if (resumeLesson) break
                    }

                    // Fallback to first lesson
                    if (!resumeLesson && modules.length > 0 && modules[0].lessons.length > 0) {
                        resumeLesson = modules[0].lessons[0]
                    }

                    setActiveLesson(resumeLesson)
                }
            } catch (error) {
                console.error("Failed to load course content", error)
            } finally {
                setIsLoading(false)
            }
        }
        fetchContent()
    }, [params.id, router])

    const handleLessonComplete = async (lessonId: string, score?: number) => {
        try {
            // Optimistic Update
            setCourse(prev => {
                if (!prev) return null
                const newModules = prev.modules.map(m => ({
                    ...m,
                    lessons: m.lessons.map(l => l.id === lessonId ? { ...l, isCompleted: true } : l)
                }))
                // Re-calculate locks locally (simplified) or fetch
                return { ...prev, modules: newModules }
            })

            // Call API
            await api.post(`/courses/${course?.id}/lessons/${lessonId}/complete`, {
                timeSpent: 100, // Mock time
                score
            })

            // Re-fetch to sync locks and progress
            const res = await api.get(`/courses/${params.id}/learn`)
            if (res.data.course) {
                setCourse(res.data.course)
                // Auto-advance logic could go here
            }

        } catch (error) {
            console.error("Failed to mark complete", error)
        }
    }

    const handleQuizSubmit = () => {
        if (!activeLesson || !activeLesson.quizzes) return

        let correct = 0
        activeLesson.quizzes.forEach(q => {
            if (quizAnswers[q.id] === q.correctAnswer) correct++
        })

        const score = Math.round((correct / activeLesson.quizzes.length) * 100)
        setQuizScore(score)
        setQuizSubmitted(true)

        // Pass if score > passing (default 60)
        const passingScore = typeof activeLesson.settings?.passingScore === 'number' 
            ? activeLesson.settings.passingScore 
            : 60
        if (score >= passingScore) {
            handleLessonComplete(activeLesson.id, score)
        }
    }

    if (isLoading) {
        return (
            <div className="h-screen flex items-center justify-center bg-background">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    if (!course) return null

    return (
        <div className="flex h-screen bg-background overflow-hidden font-sans">
            {/* Sidebar */}
            <div className={cn(
                "w-80 border-r bg-card flex flex-col transition-all duration-300 absolute inset-y-0 left-0 z-20 md:relative",
                !sidebarOpen && "-translate-x-full md:w-0 md:translate-x-0 md:overflow-hidden md:border-none"
            )}>
                <div className="p-4 border-b flex items-center justify-between h-14">
                    <h2 className="font-bold truncate text-sm">{course.title}</h2>
                    <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)} className="md:hidden">
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                </div>

                <div className="p-4 border-b bg-muted/20">
                    <div className="flex justify-between text-xs mb-2">
                        <span>Course Progress</span>
                        <span className="font-medium">{course.userProgress}%</span>
                    </div>
                    <Progress value={course.userProgress} className="h-1.5" />
                </div>

                <ScrollArea className="flex-1">
                    <div className="p-4 space-y-6">
                        {course.modules.map((module) => (
                            <div key={module.id}>
                                <h3 className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-3 pl-1">
                                    {module.title}
                                </h3>
                                <div className="space-y-1">
                                    {module.lessons.map((lesson) => {
                                        const isActive = activeLesson?.id === lesson.id
                                        const isLocked = lesson.isLocked

                                        return (
                                            <button
                                                key={lesson.id}
                                                disabled={isLocked}
                                                onClick={() => {
                                                    setActiveLesson(lesson)
                                                    // Reset quiz state on change
                                                    setQuizAnswers({})
                                                    setQuizSubmitted(false)
                                                }}
                                                className={cn(
                                                    "w-full flex items-center gap-3 p-2.5 rounded-md text-sm transition-all text-left group relative",
                                                    isActive ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted text-foreground/80",
                                                    isLocked && "opacity-50 cursor-not-allowed hover:bg-transparent"
                                                )}
                                            >
                                                {/* Status Icon */}
                                                <div className="shrink-0">
                                                    {lesson.isCompleted ? (
                                                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                                                    ) : isLocked ? (
                                                        <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                                                    ) : (
                                                        <div className={cn(
                                                            "h-4 w-4 rounded-full border-2 flex items-center justify-center",
                                                            isActive ? "border-primary" : "border-muted-foreground/30"
                                                        )}>
                                                            {isActive && <div className="h-1.5 w-1.5 rounded-full bg-primary" />}
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <div className="truncate text-xs md:text-sm">{lesson.title}</div>
                                                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-0.5">
                                                        <span>{Math.round(lesson.duration / 60)}m</span>
                                                        <span className="uppercase border px-1 rounded">{lesson.type}</span>
                                                    </div>
                                                </div>
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 bg-secondary/10">
                <header className="h-14 border-b flex items-center px-4 gap-4 bg-background sticky top-0 z-10 w-full justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)}>
                            <Menu className="h-4 w-4" />
                        </Button>
                        <h1 className="text-sm font-semibold hidden md:block">{activeLesson?.title}</h1>
                    </div>

                    <Button variant="outline" size="sm" onClick={() => router.push('/dashboard')}>
                        Exit Class
                    </Button>
                </header>

                <ScrollArea className="flex-1">
                    <div className="max-w-4xl mx-auto p-4 md:p-8 pb-20">
                        {activeLesson ? (
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                {/* Type-Based Content Rendering */}
                                {activeLesson.type === 'VIDEO' && (
                                    <div className="aspect-video bg-black rounded-lg overflow-hidden shadow-2xl ring-1 ring-border">
                                        {activeLesson.videoUrl ? (
                                            <iframe
                                                title={activeLesson.title}
                                                src={activeLesson.videoUrl.replace('watch?v=', 'embed/')} // Simple generic replace
                                                className="w-full h-full"
                                                allowFullScreen
                                                allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                                            />
                                        ) : (
                                            <div className="h-full flex items-center justify-center text-muted-foreground">
                                                No Video Source
                                            </div>
                                        )}
                                    </div>
                                )}

                                {activeLesson.type === 'QUIZ' && (
                                    <div className="border rounded-xl bg-card p-6 shadow-sm">
                                        <div className="flex items-center justify-between mb-6">
                                            <h2 className="text-xl font-bold">Concept Check Quiz</h2>
                                            <Badge
                                                variant={quizSubmitted ? (quizScore >= 60 ? "default" : "destructive") : "secondary"}
                                                className={quizSubmitted && quizScore >= 60 ? "bg-green-600 hover:bg-green-700" : ""}
                                            >
                                                {quizSubmitted ? `Score: ${quizScore}%` : `${activeLesson.quizzes?.length || 0} Questions`}
                                            </Badge>
                                        </div>

                                        {!quizSubmitted ? (
                                            <div className="space-y-6">
                                                {activeLesson.quizzes?.map((q, idx) => (
                                                    <div key={q.id} className="space-y-3">
                                                        <p className="font-medium text-sm">{idx + 1}. {q.question}</p>
                                                        <div className="space-y-2 pl-4">
                                                            {/* Map through QuizOption objects */}
                                                            {Array.isArray(q.options) && q.options.map((opt: QuizOption, oIdx: number) => (
                                                                <label key={oIdx} className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                                                                    <input
                                                                        type="radio"
                                                                        name={q.id}
                                                                        value={opt.optionText}
                                                                        checked={quizAnswers[q.id] === opt.optionText}
                                                                        onChange={() => setQuizAnswers(prev => ({ ...prev, [q.id]: opt.optionText }))}
                                                                        className="w-4 h-4 accent-primary"
                                                                    />
                                                                    <span className="text-sm">{opt.optionText}</span>
                                                                </label>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))}
                                                <Button onClick={handleQuizSubmit} className="w-full mt-4">
                                                    Submit Quiz
                                                </Button>
                                            </div>
                                        ) : (
                                            <div className="text-center py-8 space-y-4">
                                                {quizScore >= 60 ? (
                                                    <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto" />
                                                ) : (
                                                    <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center mx-auto text-red-600 font-bold text-2xl">
                                                        !
                                                    </div>
                                                )}
                                                <div>
                                                    <h3 className="text-lg font-bold">
                                                        {quizScore >= 60 ? 'Quiz Passed!' : 'Try Again'}
                                                    </h3>
                                                    <p className="text-muted-foreground text-sm mt-1">
                                                        You scored {quizScore}%. Passing score is 60%.
                                                    </p>
                                                </div>
                                                {quizScore < 60 && (
                                                    <Button onClick={() => { setQuizSubmitted(false); setQuizAnswers({}); }}>
                                                        Retry Quiz
                                                    </Button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Generic Content (Text/Instructions) */}
                                {(activeLesson.type === 'TEXT' || activeLesson.type === 'ASSIGNMENT' || activeLesson.type === 'PDF') && (
                                    <div className="prose dark:prose-invert max-w-none bg-card p-6 rounded-xl border shadow-sm">
                                        <h2 className="text-xl font-bold mb-4 not-prose border-b pb-2">{activeLesson.title}</h2>
                                        import DOMPurify from 'isomorphic-dompurify';

                                        // ... (rest of imports)

                                        // Inside component
                                        <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(activeLesson.content || '') }} />

                                        {activeLesson.type === 'ASSIGNMENT' && (
                                            <div className="mt-8 p-6 bg-muted/30 rounded-lg border-2 border-dashed text-center">
                                                <FileText className="h-10 w-10 mx-auto opacity-50 mb-2" />
                                                <h3 className="font-semibold mb-1">Upload Submission</h3>
                                                <p className="text-xs text-muted-foreground mb-4">Upload your assignment file (PDF, Zip) for review.</p>
                                                <Button size="sm">Select File</Button>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Navigation / completion controls */}
                                <div className="flex items-center justify-between pt-8 border-t mt-8">
                                    <Button variant="ghost" disabled>Previous</Button>

                                    {/* Video triggers completion via button manually for now, usually via event */}
                                    {activeLesson.type !== 'QUIZ' && (
                                        <Button
                                            onClick={() => handleLessonComplete(activeLesson.id)}
                                            disabled={activeLesson.isCompleted}
                                            className={cn("min-w-[150px]", activeLesson.isCompleted && "bg-green-600 hover:bg-green-700")}
                                        >
                                            {activeLesson.isCompleted ? (
                                                <>
                                                    <CheckCircle2 className="mr-2 h-4 w-4" /> Completed
                                                </>
                                            ) : "Mark as Complete"}
                                        </Button>
                                    )}

                                    <Button variant="secondary" disabled>Next Lesson</Button>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-20 animate-pulse">
                                <p className="text-muted-foreground">Select a lesson from the sidebar to start</p>
                            </div>
                        )}

                        {/* Course Completion Banner */}
                        {course.userProgress === 100 && (
                            <div className="mt-12 mb-12 p-8 bg-gradient-to-r from-emerald-500/10 to-blue-500/10 rounded-2xl border border-emerald-500/20 text-center animate-bounce-in">
                                <div className="inline-flex p-4 bg-emerald-100 dark:bg-emerald-900/30 rounded-full mb-4 shadow-sm">
                                    <Award className="h-10 w-10 text-emerald-600 dark:text-emerald-400" />
                                </div>
                                <h2 className="text-2xl font-bold mb-2">Detailed Course Completed!</h2>
                                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                                    Congratulations! You have successfully completed all modules and assessments.
                                </p>
                                <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/20" onClick={() => router.push(`/certificate/${course.id}`)}>
                                    View Certificate
                                </Button>
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </div>
        </div>
    )
}
