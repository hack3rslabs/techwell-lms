"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import api from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Clock, ShieldAlert, CheckCircle2, ChevronRight, Play } from "lucide-react"
import Editor from "@monaco-editor/react"

interface Question {
    id: string
    text: string
    type: string
    options: string[] | string
    marks: number
}

interface Assessment {
    id: string
    title: string
    description: string
    duration: number
    type: string
    questions: Question[]
}

export default function StudentAssessmentPage() {
    const { id } = useParams()
    const router = useRouter()
    
    const [assessment, setAssessment] = useState<Assessment | null>(null)
    const [attempt, setAttempt] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [started, setStarted] = useState(false)
    const [timeLeft, setTimeLeft] = useState(0)
    const [currentQIndex, setCurrentQIndex] = useState(0)
    const [responses, setResponses] = useState<Record<string, string>>({})
    const [proctorWarnings, setProctorWarnings] = useState(0)
    const [submitting, setSubmitting] = useState(false)

    const fetchData = async () => {
        try {
            const res = await api.get(`/assessments/${id}`)
            setAssessment(res.data)
            setTimeLeft(res.data.duration * 60)
        } catch (error) {
            toast.error("Failed to load assessment")
        } finally {
            setLoading(false)
        }
    }

    const handleStart = async () => {
        try {
            const res = await api.post(`/assessments/${id}/start`)
            setAttempt(res.data)
            
            if (res.data.status === 'COMPLETED') {
                toast.error("You have already completed this test.")
                return
            }

            if (document.documentElement.requestFullscreen) {
                document.documentElement.requestFullscreen().catch(e => console.log("Fullscreen blocked"))
            }

            setStarted(true)
        } catch (error) {
            toast.error("Failed to start assessment")
        }
    }

    const handleSubmit = async (force = false) => {
        setSubmitting(true)
        try {
            const res = await api.post(`/assessments/${id}/submit`, {
                responses,
                proctorLogs: [{ type: 'TAB_SWITCHES', count: proctorWarnings }]
            })
            setAttempt(res.data)
            setStarted(false)
            if (document.fullscreenElement) {
                document.exitFullscreen().catch(e => console.log(e))
            }
            toast.success("Assessment submitted successfully!")
        } catch (error) {
            toast.error("Failed to submit")
            setSubmitting(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [id])

    // Proctoring: Tab switch detection
    useEffect(() => {
        if (!started || submitting || attempt?.status === 'COMPLETED') return

        const handleVisibilityChange = () => {
            if (document.hidden) {
                setProctorWarnings(prev => {
                    const newCount = prev + 1
                    toast.error(`Warning ${newCount}/3: Please do not leave the test tab!`, { duration: 5000 })
                    if (newCount >= 3) {
                        toast.error("Test auto-submitted due to multiple tab switches.")
                        handleSubmit(true)
                    }
                    return newCount
                })
            }
        }

        document.addEventListener("visibilitychange", handleVisibilityChange)
        return () => document.removeEventListener("visibilitychange", handleVisibilityChange)
    }, [started, submitting, attempt])

    // Timer
    useEffect(() => {
        if (!started || timeLeft <= 0 || submitting) return
        const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000)
        return () => clearInterval(timer)
    }, [started, timeLeft, submitting])

    // Auto submit on timeout
    useEffect(() => {
        if (started && timeLeft === 0 && !submitting && attempt?.status !== 'COMPLETED') {
            toast.error("Time is up! Submitting test...")
            handleSubmit()
        }
    }, [timeLeft, started, submitting, attempt])

    if (loading) return <div className="p-8 text-center">Loading...</div>
    if (!assessment) return <div className="p-8 text-center text-red-500">Assessment not found</div>

    // ALREADY COMPLETED STATE
    if (attempt?.status === 'COMPLETED') {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <Card className="max-w-md w-full border-green-200 bg-green-50 shadow-lg">
                    <CardContent className="pt-8 pb-8 text-center">
                        <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
                        <h2 className="text-2xl font-black text-slate-800">Test Completed</h2>
                        <p className="text-slate-600 mt-2">You have successfully finished this assessment.</p>
                        
                        <div className="mt-6 p-4 bg-white rounded-xl border border-green-100 shadow-sm inline-block">
                            <div className="text-sm text-slate-500 font-semibold uppercase tracking-wider mb-1">Your Score</div>
                            <div className="text-4xl font-black text-green-600">{Math.round(attempt.score)}%</div>
                        </div>

                        <div className="mt-8">
                            <Button onClick={() => router.push('/student/dashboard')} className="w-full">
                                Return to Dashboard
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    // PRE-START SCREEN
    if (!started) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white flex items-center justify-center p-4">
                <Card className="max-w-2xl w-full shadow-xl border-indigo-100">
                    <CardContent className="p-8">
                        <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mb-6">
                            <ShieldAlert className="w-8 h-8" />
                        </div>
                        <h1 className="text-3xl font-black text-slate-900">{assessment.title}</h1>
                        <p className="text-slate-600 mt-2 text-lg">{assessment.description}</p>
                        
                        <div className="mt-8 space-y-4 bg-slate-50 p-5 rounded-xl border border-slate-100">
                            <h3 className="font-bold text-slate-800">Proctoring Rules</h3>
                            <ul className="text-slate-600 text-sm space-y-2 list-disc pl-5">
                                <li>The test will open in <b>Full Screen Mode</b>.</li>
                                <li>Do not switch tabs or windows. Doing so 3 times will result in <b>automatic disqualification</b>.</li>
                                <li>You have <b>{assessment.duration} minutes</b> to complete the test.</li>
                                <li>Once the timer ends, your answers will be automatically submitted.</li>
                            </ul>
                        </div>

                        <div className="mt-8 flex justify-end">
                            <Button onClick={handleStart} size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2 font-bold px-8">
                                <Play className="w-5 h-5" /> Start Test Now
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    // TEST RUNNING STATE
    const currentQ = assessment.questions[currentQIndex]
    const formatTime = (secs: number) => {
        const m = Math.floor(secs / 60)
        const s = secs % 60
        return `${m}:${s < 10 ? '0' : ''}${s}`
    }

    let parsedOptions: string[] = []
    if (currentQ?.options) {
        try {
            parsedOptions = typeof currentQ.options === 'string' ? JSON.parse(currentQ.options) : currentQ.options
        } catch { }
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            {/* Header */}
            <div className="bg-white border-b px-6 py-4 flex justify-between items-center sticky top-0 z-10 shadow-sm">
                <div>
                    <h2 className="font-bold text-slate-800">{assessment.title}</h2>
                    <p className="text-xs text-slate-500 font-medium">Question {currentQIndex + 1} of {assessment.questions.length}</p>
                </div>
                <div className="flex items-center gap-6">
                    {proctorWarnings > 0 && (
                        <div className="text-xs font-bold text-red-500 bg-red-50 px-3 py-1 rounded-full border border-red-200 flex items-center gap-1.5">
                            <ShieldAlert className="w-3.5 h-3.5" /> Warnings: {proctorWarnings}/3
                        </div>
                    )}
                    <div className={`flex items-center gap-2 font-black text-lg px-4 py-1.5 rounded-lg border ${timeLeft < 300 ? 'bg-red-50 text-red-600 border-red-200 animate-pulse' : 'bg-slate-100 text-slate-700 border-slate-200'}`}>
                        <Clock className="w-5 h-5" />
                        {formatTime(timeLeft)}
                    </div>
                    <Button onClick={() => handleSubmit()} disabled={submitting} variant="destructive" className="font-bold">
                        {submitting ? 'Submitting...' : 'End Test'}
                    </Button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 max-w-4xl w-full mx-auto p-6 flex flex-col">
                <Card className="flex-1 shadow-sm border-slate-200 overflow-hidden flex flex-col">
                    <CardContent className="p-8 flex-1 flex flex-col">
                        <div className="flex justify-between items-start mb-6">
                            <h3 className="text-xl font-bold text-slate-800 leading-relaxed whitespace-pre-wrap">
                                <span className="text-indigo-500 mr-2">{currentQIndex + 1}.</span> 
                                {currentQ?.text}
                            </h3>
                            <span className="bg-indigo-50 text-indigo-700 text-xs font-bold px-2 py-1 rounded whitespace-nowrap">
                                {currentQ?.marks} Marks
                            </span>
                        </div>

                        {/* MCQ */}
                        {currentQ?.type === 'MCQ' && (
                            <RadioGroup 
                                value={responses[currentQ.id] || ""} 
                                onValueChange={v => setResponses(prev => ({...prev, [currentQ.id]: v}))}
                                className="space-y-3 mt-4"
                            >
                                {parsedOptions.map((opt, i) => (
                                    <div key={i} className={`flex items-center space-x-3 border p-4 rounded-xl cursor-pointer transition-all ${responses[currentQ.id] === opt ? 'bg-indigo-50 border-indigo-300' : 'bg-white hover:bg-slate-50'}`} onClick={() => setResponses(prev => ({...prev, [currentQ.id]: opt}))}>
                                        <RadioGroupItem value={opt} id={`opt-${i}`} />
                                        <Label htmlFor={`opt-${i}`} className="flex-1 cursor-pointer font-medium">{opt}</Label>
                                    </div>
                                ))}
                            </RadioGroup>
                        )}

                        {/* CODING */}
                        {currentQ?.type === 'CODING' && (
                            <div className="flex-1 min-h-[400px] border rounded-xl overflow-hidden mt-2">
                                <Editor
                                    height="100%"
                                    defaultLanguage="javascript"
                                    theme="vs-dark"
                                    value={responses[currentQ.id] || "// Write your code here..."}
                                    onChange={v => setResponses(prev => ({...prev, [currentQ.id]: v || ""}))}
                                    options={{ minimap: { enabled: false }, fontSize: 14 }}
                                />
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Footer Controls */}
                <div className="mt-6 flex justify-between">
                    <Button 
                        variant="outline" 
                        onClick={() => setCurrentQIndex(prev => prev - 1)}
                        disabled={currentQIndex === 0}
                    >
                        Previous
                    </Button>
                    
                    {currentQIndex < assessment.questions.length - 1 ? (
                        <Button 
                            className="bg-indigo-600 hover:bg-indigo-700 text-white"
                            onClick={() => setCurrentQIndex(prev => prev + 1)}
                        >
                            Next <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                    ) : (
                        <Button 
                            className="bg-green-600 hover:bg-green-700 text-white font-bold"
                            onClick={() => handleSubmit()}
                            disabled={submitting}
                        >
                            Submit Assessment
                        </Button>
                    )}
                </div>
            </div>
        </div>
    )
}
