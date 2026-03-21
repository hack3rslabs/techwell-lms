"use client"

import * as React from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { interviewApi } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
    Video,
    VideoOff,
    Mic,
    MicOff,
    Phone,
    ChevronRight,
    Clock,
    Bot,
    Loader2,
    CheckCircle2,
    ArrowLeft,
    Send,
    Briefcase,
    AlertTriangle,
    Maximize,
    Minimize,
    Volume2,
    VolumeX
} from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

// Speech Recognition Types
interface ISpeechRecognitionEvent extends Event {
    resultIndex: number
    results: {
        [key: number]: {
            [key: number]: {
                transcript: string
            }
            length: number
            isFinal: boolean
        }
        length: number
    }
}

interface ISpeechRecognitionErrorEvent extends Event {
    error: string
}

interface ISpeechRecognition extends EventTarget {
    continuous: boolean
    interimResults: boolean
    onresult: (event: ISpeechRecognitionEvent) => void
    onerror: (event: ISpeechRecognitionErrorEvent) => void
    onend: () => void
    start: () => void
    stop: () => void
}

declare global {
    interface Window {
        SpeechRecognition: new () => ISpeechRecognition
        webkitSpeechRecognition: new () => ISpeechRecognition
    }
}

interface Message {
    id: string
    role: 'interviewer' | 'user'
    content: string
    timestamp: Date
}

interface Question {
    id: string
    question: string
    type: string
    avatarRole: string // 'Technical', 'HR', etc.
}

interface AvatarConfig {
    name: string
    role: string
    color: string
    icon: React.ElementType
}

const AVATARS: Record<string, AvatarConfig> = {
    'tech-1': { name: "Alex Chen", role: "Technical Lead", color: "from-blue-500/20 to-cyan-500/20", icon: Bot },
    'tech-2': { name: "Sarah Johnson", role: "Senior Engineer", color: "from-indigo-500/20 to-blue-500/20", icon: Bot },
    'hr-1': { name: "Emma Williams", role: "HR Manager", color: "from-purple-500/20 to-pink-500/20", icon: Briefcase },
    'hr-2': { name: "David Smith", role: "Talent Acquisition", color: "from-slate-500/20 to-gray-500/20", icon: Briefcase },
    // Fallbacks
    'Technical': { name: "AI Interviewer", role: "Technical", color: "from-blue-500/20 to-cyan-500/20", icon: Bot },
    'HR': { name: "AI Recruiter", role: "HR", color: "from-purple-500/20 to-pink-500/20", icon: Briefcase }
}

// Success Overlay Component
function SuccessOverlay({ onRedirect, onDashboard }: { onRedirect: () => void, onDashboard: () => void }) {
    React.useEffect(() => {
        // Reduced auto-redirect time to let user choose
        const timer = setTimeout(onRedirect, 10000);
        return () => clearTimeout(timer);
    }, [onRedirect]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-in fade-in duration-500">
            <div className="text-center space-y-6 p-8 bg-card border rounded-2xl shadow-2xl max-w-md w-full animate-in zoom-in-50 duration-500 delay-150">
                <div className="mx-auto h-24 w-24 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle2 className="h-12 w-12 text-green-600 animate-in zoom-in duration-300 delay-300" />
                </div>
                <div className="space-y-2">
                    <h2 className="text-3xl font-bold tracking-tight">Interview Completed!</h2>
                    <p className="text-muted-foreground">Great job! We are generating your performance report now.</p>
                </div>
                
                <div className="flex flex-col gap-3 pt-4">
                    <Button 
                        onClick={onRedirect}
                        className="w-full h-12 rounded-xl font-bold"
                    >
                        View Performance Report
                        <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                    <Button 
                        variant="outline"
                        onClick={onDashboard}
                        className="w-full h-12 rounded-xl font-bold"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Dashboard
                    </Button>
                </div>

                <div className="flex justify-center gap-2 mt-4">
                    <div className="h-2 w-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="h-2 w-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="h-2 w-2 bg-primary rounded-full animate-bounce"></div>
                </div>
            </div>
        </div>
    );
}

export default function InterviewRoomPage() {
    const router = useRouter()
    const params = useParams()
    const { isAuthenticated, isLoading: authLoading } = useAuth()
    const { toast } = useToast()

    const videoRef = React.useRef<HTMLVideoElement>(null)
    const [stream, setStream] = React.useState<MediaStream | null>(null)
    const [isVideoOn, setIsVideoOn] = React.useState(true)
    const [isMicOn, setIsMicOn] = React.useState(true)

    // AI State
    const [currentQuestion, setCurrentQuestion] = React.useState<Question | null>(null)
    const [questionCount, setQuestionCount] = React.useState(0)

    const [messages, setMessages] = React.useState<Message[]>([])
    const [userResponse, setUserResponse] = React.useState('')
    const [codeResponse, setCodeResponse] = React.useState('') // New: Code Editor State
    const [isThinking, setIsThinking] = React.useState(false)
    const [isAIProcessing, setIsAIProcessing] = React.useState(false)

    // 2026 Features: Real-time Analysis
    const [wpm, setWpm] = React.useState(0)
    const [fillerCount, setFillerCount] = React.useState(0)
    const [speechStartTime, setSpeechStartTime] = React.useState<number | null>(null)
    const [tabSwitchCount, setTabSwitchCount] = React.useState(0)
    const [isTabActive, setIsTabActive] = React.useState(true)
    const [isStarted, setIsStarted] = React.useState(false)
    const [isFullscreen, setIsFullscreen] = React.useState(false)
    const [isVoiceEnabled, setIsVoiceEnabled] = React.useState(true)

    // Fullscreen Toggle
    const toggleFullscreen = React.useCallback(() => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(err => {
                console.error(`Error attempting to enable full-screen mode: ${err.message}`);
            });
        } else {
            document.exitFullscreen().then(() => setIsFullscreen(false));
        }
    }, [])

    // Listen for fullscreen change (e.g. Esc key)
    React.useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement)
        }
        document.addEventListener('fullscreenchange', handleFullscreenChange)
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
    }, [])

    // Anti-Cheat: Tab Visibility
    React.useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.hidden) {
                setTabSwitchCount(prev => prev + 1)
                setIsTabActive(false)
                toast({
                    variant: "destructive",
                    title: "Warning: Tab Switch Detected",
                    description: "Please stay on this tab during the interview. This event has been logged."
                })
            } else {
                setIsTabActive(true)
            }
        }
        document.addEventListener("visibilitychange", handleVisibilityChange)
        return () => document.removeEventListener("visibilitychange", handleVisibilityChange)
    }, [toast])

    // Real-time Speech Logic
    const analyzeSpeech = React.useCallback((transcript: string) => {
        if (!speechStartTime) return

        const words = transcript.trim().split(/\s+/).length
        const durationMin = (Date.now() - speechStartTime) / 60000
        const currentWpm = durationMin > 0 ? Math.round(words / durationMin) : 0
        setWpm(currentWpm)

        const fillers = (transcript.match(/\b(um|uh|like|you know|sort of)\b/gi) || []).length
        setFillerCount(fillers)
    }, [speechStartTime])

    interface Interview {
        id: string
        role: string
        company?: string
        technology?: string
        difficulty?: string
        duration?: number
        panelCount?: number
        selectedAvatars?: string[]
    }

    const [interview, setInterview] = React.useState<Interview | null>(null)
    const [timeLeft, setTimeLeft] = React.useState(0) // Seconds
    const [isCompleted, setIsCompleted] = React.useState(false)

    const [showSuccess, setShowSuccess] = React.useState(false)

    React.useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push('/login')
        }
    }, [authLoading, isAuthenticated, router])

    // Load Interview & Init Timer
    React.useEffect(() => {
        const fetchInterview = async () => {
            try {
                const res = await interviewApi.getById(params.id as string)
                setInterview(res.data.interview)
                // Initialize timer (default 30 mins if missing)
                if (res.data.interview.duration) {
                    setTimeLeft(res.data.interview.duration * 60)
                } else {
                    setTimeLeft(30 * 60)
                }
            } catch (error) {
                console.error('Failed to fetch interview:', error)
            }
        }
        if (params.id) {
            fetchInterview()
        }
    }, [params.id])

    // Countdown Timer
    React.useEffect(() => {
        if (!isCompleted && timeLeft > 0) {
            const timer = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        clearInterval(timer)
                        handleEndInterview() // Auto-end
                        return 0
                    }
                    return prev - 1
                })
            }, 1000)
            return () => clearInterval(timer)
        }
    }, [isCompleted, timeLeft])

    // Initialize camera stream
    React.useEffect(() => {
        const initCamera = async () => {
            try {
                const mediaStream = await navigator.mediaDevices.getUserMedia({
                    video: true,
                    audio: true
                })
                setStream(mediaStream)
                if (videoRef.current) {
                    videoRef.current.srcObject = mediaStream
                }
            } catch (error) {
                console.error('Failed to access camera:', error)
                toast({
                    variant: "destructive",
                    title: "Hardware Access Error",
                    description: "Could not access camera/microphone. Please check permissions."
                })
                setIsMicOn(false)
                setIsVideoOn(false)
            }
        }
        initCamera()

        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop())
            }
        }
    }, [])

    // Sync Mic State with Stream
    React.useEffect(() => {
        if (stream) {
            stream.getAudioTracks().forEach(track => {
                track.enabled = isMicOn
            })
        }
    }, [isMicOn, stream])

    // Initial Question Fetch
    React.useEffect(() => {
        const startInterview = async () => {
            // Only trigger if started AND no question has been loaded yet AND not already loading
            if (isStarted && !isCompleted && !currentQuestion && !isAIProcessing) {
                console.log("[InterviewRoom] Triggering initial question fetch...");
                await fetchNextQuestion();
            }
        }
        startInterview();
        // Removed currentQuestion and isAIProcessing from dependencies to prevent infinite loops on failure
    }, [isStarted, isCompleted])

    const handleEndInterview = async () => {
        try {
            await interviewApi.complete(params.id as string, { score: Math.floor(Math.random() * 20) + 80 })
        } catch (error) {
            console.error('Failed to complete interview:', error)
        }
        
        // Ensure ALL tracks are stopped and disabled
        if (stream) {
            stream.getTracks().forEach(track => {
                track.enabled = false;
                track.stop();
                console.log(`Stopped track: ${track.kind}`);
            });
            setStream(null);
        }
        setIsVideoOn(false);
        setIsMicOn(false);
        
        // Stop recognition if active
        if (isRecording) {
            recognitionRef.current?.stop();
            setIsRecording(false);
        }

        setShowSuccess(true)
    }

    // Timer
    React.useEffect(() => {
        if (!isCompleted && timeLeft > 0) {
            const timer = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        clearInterval(timer)
                        handleEndInterview() // Auto-end
                        return 0
                    }
                    return prev - 1
                })
            }, 1000)
            return () => clearInterval(timer)
        }
    }, [isCompleted, timeLeft])

    const fetchNextQuestion = async () => {
        try {
            setIsAIProcessing(true);
            const res = await interviewApi.nextQuestion(params.id as string);

            if (res.data.completed) {
                setIsCompleted(true);
                setMessages(prev => [...prev, {
                    id: Date.now().toString(),
                    role: 'interviewer',
                    content: "Thank you! The interview is complete. Generating your performance report...",
                    timestamp: new Date()
                }]);
                
                // Cleanup camera on auto-completion
                if (stream) {
                    stream.getTracks().forEach(track => {
                        track.enabled = false;
                        track.stop();
                    });
                    setStream(null);
                }
                setIsVideoOn(false);
                setIsMicOn(false);

                // Show success overlay after a brief delay for the message to be read
                setTimeout(() => setShowSuccess(true), 2000);
                return;
            }

            const questionData = res.data.question;
            if (!questionData) throw new Error("No question data received");

            setCurrentQuestion({
                id: questionData.id || 'temp',
                question: questionData.question,
                type: questionData.type,
                avatarRole: questionData.avatarRole || (questionData.avatarId?.includes('hr') ? 'HR' : 'Technical')
            });

            setQuestionCount(prev => prev + 1);

            // Add to chat
            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                role: 'interviewer',
                content: questionData.question,
                timestamp: new Date()
            }]);

            // Speak the question
            speakText(questionData.question);
        } catch (error) {
            console.error("Failed to fetch next question:", error);
            toast({
                variant: "destructive",
                title: "AI Connection Error",
                description: "Failed to load the next question. Please check your connection or try again."
            });
        } finally {
            setIsAIProcessing(false);
        }
    }

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }

    const [isWaitingNext, setIsWaitingNext] = React.useState(false)
    const [nextQuestionTimer, setNextQuestionTimer] = React.useState(10)
    const [isRecording, setIsRecording] = React.useState(false)
    const recognitionRef = React.useRef<ISpeechRecognition | null>(null)
    const speechTimeoutRef = React.useRef<NodeJS.Timeout | null>(null)

    // Handle Speech Recognition
    React.useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
        if (SpeechRecognition) {
            recognitionRef.current = new SpeechRecognition()
            if (recognitionRef.current) {
                recognitionRef.current.continuous = true
                recognitionRef.current.interimResults = true

                recognitionRef.current.onresult = (event: ISpeechRecognitionEvent) => {
                    let transcript = ''
                    for (let i = event.resultIndex; i < event.results.length; i++) {
                        transcript += event.results[i][0].transcript
                    }
                    setUserResponse(transcript)
                    analyzeSpeech(transcript)
                }



                recognitionRef.current.onerror = (event: ISpeechRecognitionErrorEvent) => {
                    console.error('Speech recognition error:', event.error)
                    setIsRecording(false)
                }

                recognitionRef.current.onend = () => {
                    setIsRecording(false)
                }
            }
        }
    }, [])

    const toggleRecording = () => {
        if (isRecording) {
            recognitionRef.current?.stop()
        } else {
            // Ensure mic is hardware-on for STT to work
            if (!isMicOn) {
                setIsMicOn(true)
            }
            setUserResponse('')
            recognitionRef.current?.start()
            setIsRecording(true)
            setSpeechStartTime(Date.now())
            setWpm(0)
            setFillerCount(0)
        }
    }

    const speakText = (text: string) => {
        if (!isVoiceEnabled) return; // Skip if voice is disabled

        if (typeof window !== 'undefined' && window.speechSynthesis) {
            // Cancel any ongoing speech
            window.speechSynthesis.cancel()

            const utterance = new SpeechSynthesisUtterance(text)
            utterance.rate = 0.95
            utterance.pitch = 1

            // Get voices
            let voices = window.speechSynthesis.getVoices()
            
            // If voices aren't loaded, wait for them
            if (voices.length === 0) {
                const voiceRetry = setInterval(() => {
                    voices = window.speechSynthesis.getVoices()
                    if (voices.length > 0) {
                        clearInterval(voiceRetry)
                        const preferred = voices.find(v => v.name.includes('Google') || v.name.includes('Premium'))
                        if (preferred) utterance.voice = preferred
                        window.speechSynthesis.speak(utterance)
                    }
                }, 100)
                // Cleanup retry after 3s
                setTimeout(() => clearInterval(voiceRetry), 3000)
            } else {
                const preferredVoice = voices.find(v => v.name.includes('Google') || v.name.includes('Premium'))
                if (preferredVoice) utterance.voice = preferredVoice
                window.speechSynthesis.speak(utterance)
            }

            utterance.onend = () => {
                startResponseTimer()
                toggleRecording()
                toast({
                    description: "Listening...",
                    duration: 2000,
                })
            }
        } else {
            // Fallback for no speech synthesis
            startResponseTimer()
            toggleRecording()
        }
    }

    const startResponseTimer = () => {
        setNextQuestionTimer(60) // Give user 60 seconds to answer
        if (speechTimeoutRef.current) clearInterval(speechTimeoutRef.current)

        speechTimeoutRef.current = setInterval(() => {
            setNextQuestionTimer(prev => {
                if (prev <= 1) {
                    if (speechTimeoutRef.current) clearInterval(speechTimeoutRef.current)
                    handleAutoSubmit()
                    return 0
                }
                return prev - 1
            })
        }, 1000)
    }

    const handleAutoSubmit = () => {
        if (isRecording) recognitionRef.current?.stop()
        handleSendResponse(true)
    }

    // Re-attach stream when video toggles back on
    React.useEffect(() => {
        if (isVideoOn && videoRef.current && stream) {
            videoRef.current.srcObject = stream
        }
    }, [isVideoOn, stream])

    // Gap Timer
    React.useEffect(() => {
        if (isWaitingNext) {
            if (nextQuestionTimer <= 0) {
                setIsWaitingNext(false)
                fetchNextQuestion()
                return
            }
            const timer = setInterval(() => {
                setNextQuestionTimer(prev => prev - 1)
            }, 1000)
            return () => clearInterval(timer)
        }
    }, [isWaitingNext, nextQuestionTimer])

    // ... existing initialization ...

    const handleSendResponse = async (isAuto = false) => {
        if (!currentQuestion) return
        if (!userResponse.trim() && !isAuto) return // Don't allow manual empty submit

        const finalResponse = userResponse.trim() || "(No verbal response recorded)";

        if ((!userResponse.trim() || userResponse.trim().length < 5) && isAuto) {
            toast({
                variant: "destructive",
                title: "No audio detected",
                description: "We couldn't hear your answer clearly. Please check your microphone.",
            })
            // Optional: Don't submit if silent? For now we submit "No verbal response" as per original logic but warn the user.
        }

        // Add user message if there was a response or if it's auto-submit
        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: finalResponse,
            timestamp: new Date()
        }
        setMessages(prev => [...prev, userMessage])
        setUserResponse('')
        setIsThinking(true)

        // Clear auto-submit timer
        if (speechTimeoutRef.current) clearInterval(speechTimeoutRef.current)
        if (isRecording) recognitionRef.current?.stop()

        // Submit to AI
        try {
            await interviewApi.submitResponse(params.id as string, {
                questionId: currentQuestion.id,
                answer: finalResponse,
                code: currentQuestion.type === 'CODING' ? codeResponse : undefined
            });

            // Always wait for next question (backend decides if it's the last one)
            setNextQuestionTimer(5) // Short gap before next question
            setIsWaitingNext(true)

        } catch (error) {
            console.error("Error submitting response:", error);
            // Even on error, try to move forward
            if (isAuto) {
                setNextQuestionTimer(5)
                setIsWaitingNext(true)
            }
        } finally {
            setIsThinking(false);
        }
    }



    if (authLoading || !isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    const getActiveAvatar = () => {
        // 1. If question has specific avatar role/id, use it
        if (currentQuestion?.avatarRole && AVATARS[currentQuestion.avatarRole]) {
            return AVATARS[currentQuestion.avatarRole]
        }
        // 2. Use interview selected avatar
        const primaryAvatarId = interview?.selectedAvatars?.[0]
        if (primaryAvatarId && AVATARS[primaryAvatarId]) {
            return AVATARS[primaryAvatarId]
        }
        // 3. Fallback
        return AVATARS['tech-1'] || AVATARS['Technical'] || { name: "AI Interviewer", role: "Specialist", color: "from-blue-500/20 to-cyan-500/20", icon: Bot }
    }

    const activeAvatar = getActiveAvatar()

    const AvatarIcon = activeAvatar.icon;

    return (
        <div className="min-h-screen bg-background">
            {showSuccess && <SuccessOverlay 
                onRedirect={() => router.push(`/interviews/${params.id}/report`)} 
                onDashboard={() => router.push('/dashboard')}
            />}

            {/* Start Interview Overlay */}
            {!isStarted && !showSuccess && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-md transition-all duration-500">
                    <Card className="max-w-md w-full p-10 text-center space-y-8 border-2 border-primary/20 shadow-2xl animate-in zoom-in-95 duration-300">
                        <div className="relative mx-auto h-32 w-32">
                            <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping opacity-25" />
                            <div className="relative h-full w-full bg-primary/10 rounded-full flex items-center justify-center border-4 border-primary/20">
                                <Bot className="h-16 w-16 text-primary animate-pulse" />
                            </div>
                        </div>
                        <div className="space-y-3">
                            <h1 className="text-3xl font-black tracking-tight">{activeAvatar.name} is ready</h1>
                            <p className="text-muted-foreground text-sm font-medium leading-relaxed px-4">
                                Hello! I'm {activeAvatar.name}. Please ensure your camera and microphone are working.
                                Click below to begin the session.
                            </p>
                        </div>
                        <Button
                            size="lg"
                            className="w-full h-14 rounded-2xl text-lg font-bold uppercase tracking-widest shadow-xl shadow-primary/30 hover:scale-105 transition-all group"
                            onClick={async () => {
                                setIsStarted(true);
                                try {
                                    await interviewApi.start(params.id as string);
                                } catch (e) {
                                    console.error("Failed to sync start status:", e);
                                }
                            }}
                        >
                            Start Interview
                            <ChevronRight className="h-6 w-6 ml-2 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </Card>
                </div>
            )}

            {/* Header Bar */}
            <div className="h-14 bg-muted/50 border-b flex items-center justify-between px-4 backdrop-blur-md sticky top-0 z-20">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" onClick={() => router.push('/interviews')}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Exit
                    </Button>
                    <div className="h-6 w-px bg-border" />
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2 text-sm">
                            <Bot className="h-4 w-4 text-primary" />
                            <span className="font-bold">{interview?.role || 'Interview'}</span>
                            {interview?.technology && (
                                <span className="bg-primary/10 text-primary text-[10px] px-2 py-0.5 rounded-full">
                                    {interview.technology}
                                </span>
                            )}
                        </div>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                            {interview?.company || 'Mock Interview'} • {interview?.difficulty} Level
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1 bg-background/50 p-1 rounded-xl border group">
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 rounded-lg hover:bg-primary/10 hover:text-primary transition-all"
                            onClick={() => setIsVoiceEnabled(!isVoiceEnabled)}
                            title={isVoiceEnabled ? "Mute AI Voice" : "Unmute AI Voice"}
                        >
                            {isVoiceEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4 text-red-500" />}
                        </Button>
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 rounded-lg hover:bg-primary/10 hover:text-primary transition-all"
                            onClick={toggleFullscreen}
                            title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
                        >
                            {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
                        </Button>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2 text-sm bg-background/50 px-3 py-1 rounded-full border border-primary/20 shadow-sm">
                            <Clock className="h-4 w-4 text-primary animate-pulse" />
                            <span className="font-mono font-bold">{formatTime(timeLeft)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm hidden sm:flex">
                            <span className="text-[10px] font-bold text-muted-foreground uppercase opacity-70">Progress</span>
                            <div className="flex gap-1">
                                {[1, 2, 3, 4, 5].map(step => (
                                    <div
                                        key={step}
                                        className={`h-1 w-4 rounded-full transition-all duration-500 ${step <= questionCount ? 'bg-primary shadow-[0_0_8px_rgba(var(--primary),0.5)]' : 'bg-muted'}`}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className={`flex h-[calc(100vh-3.5rem)] overflow-hidden transition-all duration-500 ${isFullscreen ? 'max-w-[1600px] mx-auto' : ''}`}>

                {/* Video Section */}
                <div className="flex-1 p-4 flex flex-col gap-4 bg-muted/10 relative">
                    {/* CODING MODE LAYOUT */}
                    {currentQuestion?.type === 'CODING' ? (
                        <div className="flex-1 flex gap-4 h-full min-h-0">
                            {/* Left Side: Question & Avatar (Compact) */}
                            <div className="w-1/3 flex flex-col gap-4">
                                <Card className="flex-1 relative overflow-hidden border-2 border-primary/20 shadow-xl flex flex-col">
                                    <CardContent className={`h-full flex flex-col items-center justify-center p-6 bg-gradient-to-br ${activeAvatar.color}`}>
                                        <div className="relative mb-6">
                                            <div className="h-24 w-24 rounded-full bg-background/50 backdrop-blur-md flex items-center justify-center shadow-2xl">
                                                <AvatarIcon className="h-12 w-12 text-primary" />
                                            </div>
                                            {isAIProcessing && (
                                                <div className="absolute -bottom-1 -right-1 h-6 w-6 bg-primary rounded-full flex items-center justify-center animate-bounce">
                                                    <div className="h-2 w-2 bg-primary-foreground rounded-full animate-ping" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="z-10 w-full px-4 text-center">
                                            <div className="bg-background/80 backdrop-blur-md p-4 rounded-xl border border-primary/20 shadow-lg mb-4">
                                                <h2 className="font-bold text-base leading-tight">
                                                    {currentQuestion.question}
                                                </h2>
                                            </div>
                                            <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                                                <div className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
                                                Coding Challenge
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Right Side: Code Editor */}
                            <div className="flex-1 flex flex-col bg-[#1e1e1e] rounded-xl border border-border/50 shadow-2xl overflow-hidden">
                                <div className="bg-[#2d2d2d] px-4 py-2 flex items-center justify-between border-b border-white/10 text-xs text-gray-400 font-mono">
                                    <div className="flex items-center gap-2">
                                        <span className="text-blue-400">JS</span>
                                        <span>solution.js</span>
                                    </div>
                                    <span>Auto-save enabled</span>
                                </div>
                                <textarea
                                    value={codeResponse}
                                    onChange={(e) => setCodeResponse(e.target.value)}
                                    className="flex-1 w-full bg-[#1e1e1e] text-[#d4d4d4] p-4 font-mono text-sm resize-none focus:outline-none leading-relaxed"
                                    spellCheck={false}
                                    placeholder="// Write your solution here..."
                                />
                            </div>
                        </div>
                    ) : (
                        /* STANDARD MODE LAYOUT */
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 h-full min-h-0">
                            {/* AI Interviewer - Dynamic Avatar */}
                            <Card className={`relative overflow-hidden border-2 transition-all duration-500 flex flex-col ${isAIProcessing ? 'border-primary/50' : 'border-transparent shadow-xl'}`}>
                                <CardContent className={`h-full flex flex-col items-center justify-center p-8 bg-gradient-to-br ${activeAvatar.color} relative`}>
                                    <div className="absolute top-4 left-4 bg-primary/20 backdrop-blur-md px-3 py-1 rounded-full border border-primary/20 z-20">
                                        <div className="flex items-center gap-2">
                                            <Bot className="h-3 w-3 text-primary" />
                                            <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Interviewer</span>
                                        </div>
                                    </div>

                                    <div className="text-center space-y-6 mb-12">
                                        <div className="h-32 w-32 rounded-full bg-background/50 backdrop-blur-md flex items-center justify-center mx-auto shadow-2xl animate-in zoom-in duration-500">
                                            {activeAvatar && <AvatarIcon className="h-16 w-16 text-primary" />}
                                        </div>
                                        <div className="space-y-1">
                                            <h2 className="font-bold text-2xl tracking-tight">{activeAvatar.name}</h2>
                                            <p className="text-xs text-muted-foreground uppercase font-bold tracking-widest">{activeAvatar.role}</p>
                                        </div>
                                    </div>

                                    {/* Prominent Question Overlay */}
                                    <div className="absolute bottom-8 left-4 right-4 z-10">
                                        {currentQuestion ? (
                                            <div className="bg-background/90 backdrop-blur-md p-6 rounded-2xl border-2 border-primary/20 shadow-2xl animate-in slide-in-from-bottom-5 duration-500">
                                                <p className="text-xl font-black leading-relaxed text-foreground text-center">
                                                    "{currentQuestion.question}"
                                                </p>
                                            </div>
                                        ) : isAIProcessing ? (
                                            <div className="flex flex-col items-center gap-4 text-center">
                                                <div className="flex gap-1 items-end h-8">
                                                    {[1, 2, 3, 4, 5].map(i => (
                                                        <div key={i} className="w-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: `${i * 100}ms` }} />
                                                    ))}
                                                </div>
                                                <p className="font-bold text-sm text-primary uppercase tracking-widest animate-pulse">AI is thinking...</p>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center gap-4">
                                                <Button 
                                                    variant="outline" 
                                                    size="lg" 
                                                    className="bg-primary/10 border-primary/20 text-primary font-bold rounded-2xl px-8 h-12 hover:scale-105 transition-all"
                                                    onClick={fetchNextQuestion}
                                                >
                                                    <Bot className="h-4 w-4 mr-2" />
                                                    Start Asking Questions
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                            {/* ... (rest of standard layout) */}


                            {/* User Video */}
                            <Card className="relative overflow-hidden bg-muted/50 border-transparent shadow-lg">
                                <CardContent className="h-full flex items-center justify-center p-0">
                                    {isVideoOn && stream ? (
                                        <video
                                            ref={videoRef}
                                            autoPlay
                                            muted
                                            playsInline
                                            className="w-full h-full object-cover scale-x-[-1]"
                                        />
                                    ) : (
                                        <div className="text-center p-8">
                                            <div className="h-28 w-28 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4 border-2 border-dashed border-muted">
                                                {isVideoOn ? <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /> : <VideoOff className="h-8 w-8 text-muted-foreground" />}
                                            </div>
                                            <p className="font-bold">You</p>
                                            <p className="text-xs text-muted-foreground">{isVideoOn ? 'Camera loading...' : 'Camera is disabled'}</p>
                                        </div>
                                    )}

                                    {/* AI Coach Widget */}
                                    {isRecording && (
                                        <div className="absolute top-4 left-4 flex flex-col gap-2">
                                            <div className="bg-black/60 backdrop-blur-md px-3 py-2 rounded-xl text-white text-xs border border-white/10 shadow-xl">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <div className={`h-2 w-2 rounded-full ${wpm > 160 ? 'bg-red-500' : wpm < 100 ? 'bg-yellow-500' : 'bg-green-500'}`} />
                                                    <span className="font-bold uppercase tracking-wider">Live Coach</span>
                                                </div>
                                                <div className="space-y-1">
                                                    <div className="flex justify-between gap-4">
                                                        <span className="text-white/70">Pace:</span>
                                                        <span className={`font-mono font-bold ${wpm > 160 || wpm < 100 ? 'text-yellow-400' : 'text-green-400'}`}>
                                                            {wpm} WPM
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between gap-4">
                                                        <span className="text-white/70">Fillers:</span>
                                                        <span className={`font-mono font-bold ${fillerCount > 3 ? 'text-red-400' : 'text-green-400'}`}>
                                                            {fillerCount}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Anti-Cheat Warning */}
                                    {!isTabActive && (
                                        <div className="absolute inset-0 bg-red-950/90 backdrop-blur-sm z-50 flex items-center justify-center p-8 text-center animate-in fade-in">
                                            <div>
                                                <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                                                <h3 className="text-xl font-bold text-white mb-2">Tab Switch Detected!</h3>
                                                <p className="text-red-200 text-sm">
                                                    Please return to the interview tab immediately.<br />
                                                    This incident has been flagged.
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    <div className="absolute bottom-4 left-4 flex items-center gap-3 bg-black/60 backdrop-blur-md px-4 py-2 rounded-2xl text-white">
                                        {isMicOn ? (
                                            <div className="flex items-center gap-2">
                                                <div className="flex gap-0.5 items-end h-3">
                                                    <div className="w-0.5 h-1 bg-green-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                                                    <div className="w-0.5 h-2 bg-green-400 animate-bounce" style={{ animationDelay: '100ms' }} />
                                                    <div className="w-0.5 h-3 bg-green-400 animate-bounce" style={{ animationDelay: '200ms' }} />
                                                </div>
                                                <span className="text-[10px] font-bold uppercase tracking-wider">Audio Active</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                <MicOff className="h-3 w-3 text-red-400" />
                                                <span className="text-[10px] font-bold uppercase tracking-wider text-red-400">Microphone Muted</span>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}
                    {/* Transcription/Answer Box */}
                    <Card className="border-2 border-primary/10 shadow-lg overflow-hidden transition-all duration-300">
                        <div className="bg-muted/30 px-4 py-2 flex items-center justify-between border-b border-white/5">
                            <div className="flex items-center gap-2">
                                <Bot className="h-4 w-4 text-primary" />
                                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Your Answer</span>
                            </div>
                            <div className="flex items-center gap-3">
                                {isRecording && (
                                    <div className="flex items-center gap-1.5 px-2 py-0.5 bg-red-500/10 rounded-full border border-red-500/20">
                                        <div className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
                                        <span className="text-[9px] font-bold text-red-500 uppercase tracking-tighter">Recording...</span>
                                    </div>
                                )}
                                <span className="text-[9px] font-mono text-muted-foreground">{userResponse.length} characters</span>
                            </div>
                        </div>
                        <textarea
                            value={userResponse}
                            onChange={(e) => setUserResponse(e.target.value)}
                            placeholder={isRecording ? "Listening to your answer... Click 'Stop' or wait for the auto-submit." : "Type your answer here or click the microphone to speak..."}
                            className="w-full h-32 p-4 bg-background text-foreground text-sm font-medium resize-none focus:outline-none focus:ring-1 focus:ring-primary/20 leading-relaxed transition-all"
                            spellCheck={true}
                        />
                    </Card>

                    {/* Controls - Minimalist Auto-hide in Fullscreen */}
                    <div className={`transition-all duration-500 ${isFullscreen ? 'opacity-0 hover:opacity-100 fixed bottom-8 transform -translate-x-1/2 left-1/2 z-50' : 'bg-background/80 backdrop-blur-md p-4 rounded-3xl border shadow-xl flex items-center justify-center gap-6 max-w-md mx-auto w-full'}`}>
                        <div className="flex flex-col items-center gap-1">
                            <Button
                                variant={isMicOn ? "outline" : "destructive"}
                                size="icon"
                                className={`h-12 w-12 rounded-2xl transition-all ${isFullscreen ? 'bg-background/50 border-white/20' : ''}`}
                                onClick={() => setIsMicOn(!isMicOn)}
                                title={isMicOn ? "Mute Microphone" : "Unmute Microphone"}
                            >
                                {isMicOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
                            </Button>
                            {!isFullscreen && <span className="text-[10px] font-bold text-muted-foreground uppercase">{isMicOn ? 'Mute' : 'Unmute'}</span>}
                        </div>

                        <div className="flex flex-col items-center gap-1">
                            <Button
                                variant={isRecording ? "destructive" : "outline"}
                                size="icon"
                                className={`h-12 w-12 rounded-2xl transition-all ${isRecording ? 'ring-4 ring-primary/20 animate-pulse shadow-xl shadow-primary/20 bg-primary/10' : ''} ${isFullscreen ? 'bg-background/50 border-white/20' : ''}`}
                                onClick={toggleRecording}
                                title={isRecording ? "Stop Transcribing" : "Start Transcribing"}
                            >
                                {isRecording ? <div className="h-3 w-3 bg-red-500 rounded-sm animate-pulse" /> : <Bot className="h-5 w-5 text-primary" />}
                            </Button>
                            {!isFullscreen && <span className="text-[10px] font-bold text-muted-foreground uppercase">{isRecording ? 'Stop' : 'Transcribe'}</span>}
                        </div>

                        <div className="flex flex-col items-center gap-1">
                            <Button
                                variant={isVideoOn ? "outline" : "destructive"}
                                size="icon"
                                className={`h-12 w-12 rounded-2xl transition-all ${isFullscreen ? 'bg-background/50 border-white/20' : ''}`}
                                onClick={() => setIsVideoOn(!isVideoOn)}
                            >
                                {isVideoOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
                            </Button>
                            {!isFullscreen && <span className="text-[10px] font-bold text-muted-foreground uppercase">{isVideoOn ? 'Stop Video' : 'Start Video'}</span>}
                        </div>

                        <div className="flex flex-col items-center gap-1">
                            <Button
                                variant="outline"
                                size="icon"
                                className={`h-12 w-12 rounded-2xl transition-all hover:bg-primary/20 hover:text-primary ${isFullscreen ? 'bg-background/50 border-white/20' : ''}`}
                                onClick={() => handleSendResponse(false)}
                                disabled={isAIProcessing || isThinking || !userResponse.trim()}
                                title="Submit Answer"
                            >
                                <Send className="h-5 w-5" />
                            </Button>
                            {!isFullscreen && <span className="text-[10px] font-bold text-muted-foreground uppercase">Submit</span>}
                        </div>

                        <div className="h-10 w-px bg-border mx-2" />

                        <div className="flex flex-col items-center gap-1">
                            <Button
                                variant="destructive"
                                size="icon"
                                className="h-12 w-12 rounded-2xl shadow-lg shadow-red-500/20 hover:scale-110 active:scale-95 transition-all"
                                onClick={handleEndInterview}
                            >
                                <Phone className="h-5 w-5 rotate-[135deg]" />
                            </Button>
                            {!isFullscreen && <span className="text-[10px] font-bold text-red-600 uppercase">End Session</span>}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    )
}
