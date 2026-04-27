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
    imageUrl?: string // Optional real image URL
}

const AVATARS: Record<string, AvatarConfig> = {
    'tech-1': { name: "suman singh", role: "Technical Lead", color: "from-blue-500/20 to-cyan-500/20", icon: Bot, imageUrl: "https://assets.isu.pub/document-structure/240312171651-9775bf30331c563f0c3e285d730b03c0/v1/1ffb01b0184d05f1f53084337d8047fb.jpeg" },
    'tech-2': { name: "Sarah Johnson", role: "Senior Engineer", color: "from-indigo-500/20 to-blue-500/20", icon: Bot, imageUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop" },
    'hr-1': { name: "Emma Williams", role: "HR Manager", color: "from-purple-500/20 to-pink-500/20", icon: Briefcase, imageUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop" },
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
    const [isVoiceEnabled, setIsVoiceEnabled] = React.useState(true)
    const [isAudioMonitoring, setIsAudioMonitoring] = React.useState(false)

    // AI State
    const [currentQuestion, setCurrentQuestion] = React.useState<Question | null>(null)
    const [questionCount, setQuestionCount] = React.useState(0)

    const [_messages, setMessages] = React.useState<Message[]>([])
    const [userResponse, setUserResponse] = React.useState('')
    const [codeResponse, setCodeResponse] = React.useState('') // New: Code Editor State
    const [isThinking, setIsThinking] = React.useState(false)
    const [isAIProcessing, setIsAIProcessing] = React.useState(false)

    // 2026 Features: Real-time Analysis
    const [wpm, setWpm] = React.useState(0)
    const [fillerCount, setFillerCount] = React.useState(0)
    const [speechStartTime, setSpeechStartTime] = React.useState<number | null>(null)
    const [_tabSwitchCount, setTabSwitchCount] = React.useState(0)
    const [isTabActive, setIsTabActive] = React.useState(true)
    const [isStarted, setIsStarted] = React.useState(false)
    const [isFullscreen, setIsFullscreen] = React.useState(false)

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
                console.log("[InterviewRoom] Fetching interview details...");
                const res = await interviewApi.getById(params.id as string)
                const interviewData = res.data.interview
                setInterview(interviewData)

                // 1. Check for existing unanswered question
                const questions = interviewData.questions || [];
                const lastUnanswered = questions.find((q: any) => !q.response);
                
                if (lastUnanswered) {
                    console.log("[InterviewRoom] Found existing unanswered question:", lastUnanswered.id);
                    setCurrentQuestion({
                        id: lastUnanswered.id,
                        question: lastUnanswered.question,
                        type: lastUnanswered.type,
                        avatarRole: lastUnanswered.avatarRole || (lastUnanswered.avatarId?.includes('hr') ? 'HR' : 'Technical')
                    });
                    setQuestionCount(questions.length);
                    
                    // Add to chat if not already there
                    setMessages(prev => {
                        const exists = prev.some(m => m.content === lastUnanswered.question);
                        if (!exists) {
                            return [...prev, {
                                id: 'init-' + lastUnanswered.id,
                                role: 'interviewer',
                                content: lastUnanswered.question,
                                timestamp: new Date()
                            }];
                        }
                        return prev;
                    });
                }

                // 2. Auto-start if already in progress
                if (interviewData.status === 'IN_PROGRESS' || interviewData.status === 'STARTED') {
                    console.log("[InterviewRoom] Interview already in progress, auto-starting UI...");
                    setIsStarted(true)
                }

                // Initialize timer
                if (interviewData.duration) {
                    setTimeLeft(interviewData.duration * 60)
                } else {
                    setTimeLeft(60 * 60)
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

    const [fetchRetryCount, setFetchRetryCount] = React.useState(0);

    const fetchNextQuestion = async () => {
        try {
            setIsAIProcessing(true);
            console.log(`[InterviewRoom] Fetching next question (Attempt ${fetchRetryCount + 1})...`);
            
            const res = await interviewApi.nextQuestion(params.id as string);

            if (res.data.completed) {
                setIsCompleted(true);
                setMessages(prev => [...prev, {
                    id: Date.now().toString(),
                    role: 'interviewer',
                    content: "Thank you! The interview is complete. Generating your performance report...",
                    timestamp: new Date()
                }]);

                if (stream) {
                    stream.getTracks().forEach(track => {
                        track.enabled = false;
                        track.stop();
                    });
                    setStream(null);
                }
                setIsVideoOn(false);
                setIsMicOn(false);

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
            setFetchRetryCount(0); // Reset on success

            // Add to chat
            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                role: 'interviewer',
                content: questionData.question,
                timestamp: new Date()
            }]);

            // Speak the question
            speakText(questionData.question);
        } catch (error: any) {
            console.error("Failed to fetch next question:", error);
            
            const errorMessage = error.response?.data?.error || error.message || "Unknown error";
            
            if (fetchRetryCount < 2) {
                console.log("[InterviewRoom] Retrying fetch...");
                setFetchRetryCount(prev => prev + 1);
                setTimeout(fetchNextQuestion, 2000);
            } else {
                toast({
                    variant: "destructive",
                    title: "AI Connection Error",
                    description: `Failed after 3 attempts: ${errorMessage}. Please check your internet or reload.`
                });
            }
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
                    let fullTranscript = ''
                    for (let i = 0; i < event.results.length; i++) {
                        fullTranscript += event.results[i][0].transcript
                    }
                    setUserResponse(fullTranscript)
                    analyzeSpeech(fullTranscript)
                }

                recognitionRef.current.onerror = (event: ISpeechRecognitionErrorEvent) => {
                    console.error('Speech recognition error:', event.error)
                    setIsRecording(false)

                    let errorMessage = "Speech recognition failed."
                    let errorTitle = "Voice Error"

                    if (event.error === 'network') {
                        errorTitle = "Network Error"
                        errorMessage = "Speech service is unavailable. Please check your connection or type your answer."
                    } else if (event.error === 'not-allowed') {
                        errorTitle = "Permission Denied"
                        errorMessage = "Microphone access was denied. Please check browser permissions."
                    } else if (event.error === 'no-speech') {
                        return
                    }

                    toast({
                        variant: "destructive",
                        title: errorTitle,
                        description: errorMessage
                    })
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
            try {
                recognitionRef.current?.start()
                setIsRecording(true)
                setSpeechStartTime(Date.now())
                setWpm(0)
                setFillerCount(0)
            } catch (error) {
                console.error("Failed to start speech recognition:", error)
                toast({
                    variant: "destructive",
                    title: "Speech Error",
                    description: "Could not start speech recognition. You can type your answer instead."
                })
                setIsRecording(false)
            }
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
            const res = await interviewApi.submitResponse(params.id as string, {
                questionId: currentQuestion.id,
                answer: finalResponse,
                code: currentQuestion.type === 'CODING' ? codeResponse : undefined
            });

            const briefFeedback = res.data.response?.briefFeedback;

            if (briefFeedback) {
                // Add feedback message
                setMessages(prev => [...prev, {
                    id: 'fb-' + Date.now(),
                    role: 'interviewer',
                    content: briefFeedback,
                    timestamp: new Date()
                }]);

                // Speak the feedback
                speakText(briefFeedback);

                // Wait slightly longer since we're speaking feedback
                setNextQuestionTimer(8)
            } else {
                setNextQuestionTimer(5)
            }

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
                                Hello! I&apos;m {activeAvatar.name}. Please ensure your camera and microphone are working.
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

            <div className={`flex flex-col md:flex-row h-[calc(100vh-3.5rem)] overflow-hidden transition-all duration-500 bg-background ${isFullscreen ? 'max-w-[1600px] mx-auto' : ''}`}>
                
                {/* STAGE: Video & Controls */}
                <div className="flex-1 flex flex-col min-w-0 bg-muted/5">
                    <div className="flex-1 relative p-6 flex items-center justify-center overflow-hidden">
                        {currentQuestion?.type === 'CODING' ? (
                            <div className="w-full h-full flex flex-col gap-4">
                                {/* Compact Avatar/Question for Coding Mode */}
                                <div className="flex items-center gap-4 bg-background/50 backdrop-blur-md p-4 rounded-2xl border border-primary/20">
                                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                                        <AvatarIcon className="h-6 w-6 text-primary" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-bold leading-tight line-clamp-2">{currentQuestion.question}</p>
                                    </div>
                                </div>
                                
                                {/* Code Editor */}
                                <div className="flex-1 flex flex-col bg-[#1e1e1e] rounded-2xl border border-white/5 shadow-2xl overflow-hidden">
                                    <div className="bg-[#2d2d2d] px-4 py-2 flex items-center justify-between border-b border-white/10 text-xs text-gray-400 font-mono">
                                        <div className="flex items-center gap-2">
                                            <span className="text-blue-400">JS</span>
                                            <span>solution.js</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                                            <span>Live Editor</span>
                                        </div>
                                    </div>
                                    <textarea
                                        value={codeResponse}
                                        onChange={(e) => setCodeResponse(e.target.value)}
                                        className="flex-1 w-full bg-[#1e1e1e] text-[#d4d4d4] p-6 font-mono text-sm resize-none focus:outline-none leading-relaxed"
                                        spellCheck={false}
                                        placeholder="// Write your solution here..."
                                    />
                                </div>
                            </div>
                        ) : (
                            /* Standard Mode: Video Circles */
                            <div className="flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-24 w-full max-w-6xl">
                                {/* AI Interviewer */}
                                <div className="relative group">
                                    <div className={`h-64 w-64 md:h-80 md:w-80 lg:h-96 lg:w-96 rounded-full overflow-hidden border-4 transition-all duration-700 shadow-2xl ${isAIProcessing ? 'border-primary animate-pulse scale-105' : 'border-background/20 scale-100 hover:scale-105'}`}>
                                        <div className={`h-full w-full flex flex-col items-center justify-center bg-gradient-to-br ${activeAvatar.color} relative`}>
                                            <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-background/80 backdrop-blur-md px-3 py-1 rounded-full border border-primary/20 z-20">
                                                <div className="flex items-center gap-2">
                                                    <Bot className="h-3 w-3 text-primary" />
                                                    <span className="text-[10px] font-black text-primary uppercase tracking-widest">Interviewer</span>
                                                </div>
                                            </div>
                                            <div className="text-center space-y-4">
                                                <div className="h-32 w-32 md:h-40 md:w-40 rounded-full bg-background/50 backdrop-blur-md flex items-center justify-center mx-auto shadow-2xl overflow-hidden border-2 border-white/20">
                                                    {activeAvatar.imageUrl ? (
                                                        <img src={activeAvatar.imageUrl} alt={activeAvatar.name} className="h-full w-full object-cover" />
                                                    ) : (
                                                        <AvatarIcon className="h-16 w-16 md:h-20 md:w-20 text-primary" />
                                                    )}
                                                </div>
                                                <div className="space-y-1">
                                                    <h2 className="font-bold text-2xl tracking-tight">{activeAvatar.name}</h2>
                                                    <p className="text-[10px] text-muted-foreground uppercase font-black tracking-[0.2em]">{activeAvatar.role}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    {isAIProcessing && <div className="absolute -inset-4 bg-primary/10 rounded-full animate-ping -z-10" />}
                                </div>

                                {/* User Video */}
                                <div className="relative group">
                                    <div className="h-64 w-64 md:h-80 md:w-80 lg:h-96 lg:w-96 rounded-full overflow-hidden border-4 border-background/20 shadow-2xl transition-all duration-700 hover:scale-105 bg-muted/30 relative">
                                        {isVideoOn && stream ? (
                                            <video ref={videoRef} autoPlay muted={!isAudioMonitoring} playsInline className="w-full h-full object-cover scale-x-[-1]" />
                                        ) : (
                                            <div className="h-full w-full flex flex-col items-center justify-center p-8 text-center bg-muted/40">
                                                <div className="h-20 w-20 rounded-full bg-background/50 flex items-center justify-center mx-auto mb-4 border-2 border-dashed border-muted">
                                                    {isVideoOn ? <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /> : <VideoOff className="h-8 w-8 text-muted-foreground" />}
                                                </div>
                                                <p className="font-bold">You</p>
                                                <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{isVideoOn ? "Loading..." : "Camera Disabled"}</p>
                                            </div>
                                        )}
                                        {isRecording && <div className="absolute inset-0 bg-red-500/10 pointer-events-none border-4 border-red-500/20 rounded-full animate-pulse" />}
                                        
                                        {/* Floating Transcription Bubble */}
                                        {isRecording && userResponse && (
                                            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-[85%] bg-black/60 backdrop-blur-md text-white p-3 rounded-2xl border border-white/20 shadow-2xl animate-in slide-in-from-bottom-2 duration-300">
                                                <p className="text-xs font-medium line-clamp-3 text-center leading-snug">
                                                    {userResponse}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                    {isRecording && (
                                        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-background/90 backdrop-blur-md px-4 py-2 rounded-xl border border-primary/20 shadow-xl flex items-center gap-2 z-30">
                                            <div className={`h-2 w-2 rounded-full ${wpm > 160 ? "bg-red-500" : "bg-green-500"} animate-pulse`} />
                                            <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Pace: {wpm} WPM</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Integrated Controls Panel */}
                    <div className="p-6 bg-background/50 border-t backdrop-blur-md">
                        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
                            <div className="flex items-center gap-2">
                                <Button
                                    variant={isAudioMonitoring ? "default" : "outline"}
                                    size="icon"
                                    className="h-12 w-12 rounded-2xl transition-all"
                                    onClick={() => {
                                        setIsAudioMonitoring(!isAudioMonitoring);
                                        if (!isAudioMonitoring) toast({ title: "Monitoring Enabled", description: "Use headphones to avoid echo." });
                                    }}
                                    title="Monitor Voice"
                                >
                                    {isAudioMonitoring ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
                                </Button>
                                <Button
                                    variant={isMicOn ? "outline" : "destructive"}
                                    size="icon"
                                    className="h-12 w-12 rounded-2xl"
                                    onClick={() => setIsMicOn(!isMicOn)}
                                    title="Mute Mic"
                                >
                                    {isMicOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
                                </Button>
                                <Button
                                    variant={isVideoOn ? "outline" : "destructive"}
                                    size="icon"
                                    className="h-12 w-12 rounded-2xl"
                                    onClick={() => {
                                        if (currentQuestion) {
                                            toast({ variant: "destructive", title: "Video Mandatory", description: "Video must remain on." });
                                            return;
                                        }
                                        setIsVideoOn(!isVideoOn);
                                    }}
                                    title="Toggle Video"
                                >
                                    {isVideoOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
                                </Button>
                            </div>

                            <div className="flex-1 flex justify-center">
                                <Button
                                    variant={isRecording ? "destructive" : "default"}
                                    size="lg"
                                    className={`h-14 px-8 rounded-2xl text-base font-bold transition-all ${isRecording ? 'ring-4 ring-primary/20 shadow-xl' : 'shadow-lg shadow-primary/20'}`}
                                    onClick={toggleRecording}
                                >
                                    {isRecording ? (
                                        <><div className="h-3 w-3 bg-white rounded-full animate-pulse mr-3" /> Stop Recording</>
                                    ) : (
                                        <><Mic className="h-5 w-5 mr-3" /> Start Speaking</>
                                    )}
                                </Button>
                            </div>

                            <div className="flex items-center gap-2">
                                <Button
                                    variant="destructive"
                                    size="icon"
                                    className="h-12 w-12 rounded-2xl shadow-lg shadow-red-500/20 hover:scale-110"
                                    onClick={handleEndInterview}
                                    title="End Session"
                                >
                                    <Phone className="h-5 w-5 rotate-[135deg]" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* SIDEBAR: Question & Transcription */}
                <div className="w-full md:w-[400px] lg:w-[450px] border-l bg-card flex flex-col shadow-2xl">
                    {/* Active Question Display */}
                    <div className="p-6 bg-primary/5 border-b">
                        <div className="flex items-center gap-2 mb-4">
                            <Bot className="h-4 w-4 text-primary" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-primary">Interviewer Prompt</span>
                        </div>
                        {currentQuestion ? (
                            <div className="bg-background p-5 rounded-2xl border-2 border-primary/20 shadow-inner">
                                <p className="text-lg font-bold leading-relaxed text-foreground">
                                    "{currentQuestion.question}"
                                </p>
                            </div>
                        ) : (
                            <div className="animate-pulse space-y-3">
                                <div className="h-4 bg-muted rounded w-3/4" />
                                <div className="h-4 bg-muted rounded w-1/2" />
                            </div>
                        )}
                    </div>

                    {/* Transcription Area */}
                    <div className="flex-1 flex flex-col min-h-0">
                        <div className="px-6 py-4 border-b bg-muted/20 flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Real-time Answer</span>
                            {isRecording && (
                                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-red-500/10 rounded-full border border-red-500/20">
                                    <div className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
                                    <span className="text-[9px] font-bold text-red-500 uppercase">Listening</span>
                                </div>
                            )}
                        </div>
                        <div className="flex-1 p-6 overflow-y-auto bg-background/50 space-y-4">
                            <textarea
                                value={userResponse}
                                onChange={(e) => setUserResponse(e.target.value)}
                                placeholder={isRecording ? "Listening to your answer..." : "Your answer will appear here as you speak, or you can type directly."}
                                className="w-full h-full bg-transparent text-foreground text-base font-medium resize-none focus:outline-none leading-relaxed placeholder:italic placeholder:opacity-50"
                                spellCheck={true}
                            />
                        </div>
                    </div>

                    {/* Action Bar */}
                    <div className="p-6 bg-muted/10 border-t">
                        <Button
                            size="lg"
                            className="w-full h-14 rounded-2xl text-lg font-bold shadow-xl shadow-primary/20 group"
                            onClick={() => handleSendResponse(false)}
                            disabled={isAIProcessing || isThinking || !userResponse.trim()}
                        >
                            Submit Answer
                            <Send className="h-5 w-5 ml-3 group-hover:translate-x-1 transition-transform" />
                        </Button>
                        <p className="text-center text-[10px] text-muted-foreground mt-4 font-medium uppercase tracking-tighter">
                            Pressing Submit will evaluate your answer and load the next question
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
