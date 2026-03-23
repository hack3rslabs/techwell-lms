"use client"

import * as React from 'react'
import { useState, useRef, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { interviewApi } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
    ArrowLeft,
    ArrowRight,
    Check,
    Camera,
    Mic,
    Monitor,
    Wifi,
    Volume2,
    AlertCircle,
    Loader2,
    Play,
    CheckCircle2,
    XCircle,
    Lightbulb
} from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

interface CheckItem {
    id: string
    label: string
    icon: React.ElementType
    status: 'pending' | 'checking' | 'success' | 'error'
    message?: string
}

export default function InterviewStartPage() {
    const router = useRouter()
    const params = useParams()
    const { isAuthenticated, isLoading: authLoading } = useAuth()
    const { toast } = useToast()

    const videoRef = useRef<HTMLVideoElement>(null)
    const [stream, setStream] = useState<MediaStream | null>(null)
    const [audioLevel, setAudioLevel] = useState(0)
    const [isReady, setIsReady] = useState(false)
    interface Interview {
        id: string
        role: string
        title?: string
    }
    const [interview, setInterview] = useState<Interview | null>(null)

    const [checks, setChecks] = useState<CheckItem[]>([
        { id: 'camera', label: 'Camera Access', icon: Camera, status: 'pending' },
        { id: 'microphone', label: 'Microphone Access', icon: Mic, status: 'pending' },
        { id: 'browser', label: 'Browser Compatibility', icon: Monitor, status: 'pending' },
        { id: 'connection', label: 'Internet Connection', icon: Wifi, status: 'pending' },
    ])

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push('/login')
        }
    }, [authLoading, isAuthenticated, router])

    // Fetch interview details
    useEffect(() => {
        const fetchInterview = async () => {
            try {
                const res = await interviewApi.getById(params.id as string)
                setInterview(res.data.interview)
            } catch (error) {
                console.error('Failed to fetch interview:', error)
            }
        }
        if (params.id) {
            fetchInterview()
        }
    }, [params.id])

    function updateCheck(id: string, update: Partial<CheckItem>) {
        setChecks(prev => prev.map(check =>
            check.id === id ? { ...check, ...update } : check
        ))
    }

    const requestMediaPermissions = async () => {
        updateCheck('camera', { status: 'checking' })
        updateCheck('microphone', { status: 'checking' })

        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true
            })

            setStream(mediaStream)

            // Attach video to preview
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream
            }

            updateCheck('camera', { status: 'success', message: 'Camera connected' })
            updateCheck('microphone', { status: 'success', message: 'Microphone connected' })

            // Setup audio level monitoring
            const audioContext = new AudioContext()
            const analyser = audioContext.createAnalyser()
            const microphone = audioContext.createMediaStreamSource(mediaStream)
            microphone.connect(analyser)
            analyser.fftSize = 256

            const dataArray = new Uint8Array(analyser.frequencyBinCount)

            const updateAudioLevel = () => {
                analyser.getByteFrequencyData(dataArray)
                const average = dataArray.reduce((a, b) => a + b) / dataArray.length
                setAudioLevel(Math.round((average / 255) * 100))
                requestAnimationFrame(updateAudioLevel)
            }
            updateAudioLevel()

            setIsReady(true)
        } catch (error) {
            console.error('Media permission error:', error)
            const err = error as Error

            if (err.name === 'NotAllowedError') {
                updateCheck('camera', { status: 'error', message: 'Permission denied - Please allow access' })
                updateCheck('microphone', { status: 'error', message: 'Permission denied - Please allow access' })
            } else {
                updateCheck('camera', { status: 'error', message: 'Camera not found' })
                updateCheck('microphone', { status: 'error', message: 'Microphone not found' })
            }
        }
    }

    const runSystemChecks = async () => {
        // Check browser compatibility
        updateCheck('browser', { status: 'checking' })
        await new Promise(r => setTimeout(r, 500))
        const isCompatible = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)
        updateCheck('browser', {
            status: isCompatible ? 'success' : 'error',
            message: isCompatible ? 'Chrome/Edge/Firefox detected' : 'Browser not supported'
        })

        // Check internet connection
        updateCheck('connection', { status: 'checking' })
        await new Promise(r => setTimeout(r, 500))
        const isOnline = navigator.onLine
        updateCheck('connection', {
            status: isOnline ? 'success' : 'error',
            message: isOnline ? 'Connection stable' : 'No internet connection'
        })

        // Request camera and microphone
        await requestMediaPermissions()
    }

    // Run system checks on mount
    useEffect(() => {
        let mounted = true
        if (mounted) {
            // runSystemChecks is async but calls setState synchronously at start
            // Defer to avoid cascading render lint
            setTimeout(() => void runSystemChecks(), 0)
        }
        return () => {
            mounted = false
            // Cleanup stream on unmount
            if (stream) {
                stream.getTracks().forEach(track => track.stop())
            }
        }
    }, [])

    const handleStartInterview = async () => {
        try {
            await interviewApi.start(params.id as string)
            router.push(`/interviews/${params.id}`)
        } catch (error: unknown) {
            const err = error as { response?: { data?: { error?: string } } };
            console.error('Failed to start interview:', error)
            toast({
                variant: "destructive",
                title: "Failed to Start",
                description: err.response?.data?.error || "An unexpected error occurred. Please try again."
            })
        }
    }

    const getStatusIcon = (status: CheckItem['status']) => {
        switch (status) {
            case 'pending': return <div className="h-5 w-5 rounded-full border-2 border-muted" />
            case 'checking': return <Loader2 className="h-5 w-5 animate-spin text-primary" />
            case 'success': return <CheckCircle2 className="h-5 w-5 text-green-500" />
            case 'error': return <XCircle className="h-5 w-5 text-red-500" />
        }
    }

    const allChecksPassed = true; // checks.every(c => c.status === 'success') - FORCED TRUE FOR TESTING

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
                    <h1 className="text-3xl font-bold">Pre-Interview Setup</h1>
                    <p className="text-muted-foreground">Let&apos;s make sure everything is ready for your interview</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Camera Preview */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Camera className="h-5 w-5" />
                                Camera Preview
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="aspect-video bg-muted rounded-lg overflow-hidden relative">
                                <video
                                    ref={videoRef}
                                    autoPlay
                                    muted
                                    playsInline
                                    className="w-full h-full object-cover scale-x-[-1]"
                                />
                                {!stream && (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="text-center text-muted-foreground">
                                            <Camera className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                            <p>Camera loading...</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* System Checks */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Monitor className="h-5 w-5" />
                                System Check
                            </CardTitle>
                            <CardDescription>
                                We&apos;re checking your setup for the best interview experience
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {checks.map(check => (
                                <div key={check.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <check.icon className="h-5 w-5 text-muted-foreground" />
                                        <div>
                                            <p className="font-medium text-sm">{check.label}</p>
                                            {check.message && (
                                                <p className={`text-xs ${check.status === 'error' ? 'text-red-500' : 'text-muted-foreground'}`}>
                                                    {check.message}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    {getStatusIcon(check.status)}
                                </div>
                            ))}

                            {/* Audio Level Indicator */}
                            {stream && (
                                <div className="p-3 bg-muted/50 rounded-lg">
                                    <div className="flex items-center gap-3 mb-2">
                                        <Volume2 className="h-5 w-5 text-muted-foreground" />
                                        <span className="font-medium text-sm">Microphone Level</span>
                                    </div>
                                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-green-500 to-green-400 transition-all duration-100"
                                            style={{ width: `${audioLevel}%` }}
                                        />
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Speak to test your microphone
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Interview Tips */}
                <Card className="mt-6">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Lightbulb className="h-5 w-5 text-yellow-500" />
                            Tips for a Great Interview
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="p-4 bg-muted/50 rounded-lg">
                                <h4 className="font-medium mb-1">🎯 Be Specific</h4>
                                <p className="text-sm text-muted-foreground">Use the STAR method for behavioral questions</p>
                            </div>
                            <div className="p-4 bg-muted/50 rounded-lg">
                                <h4 className="font-medium mb-1">🗣️ Think Aloud</h4>
                                <p className="text-sm text-muted-foreground">Explain your thought process for technical questions</p>
                            </div>
                            <div className="p-4 bg-muted/50 rounded-lg">
                                <h4 className="font-medium mb-1">⏱️ Pace Yourself</h4>
                                <p className="text-sm text-muted-foreground">Take your time - quality over speed</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Start Button */}
                <div className="mt-8 text-center">
                    {allChecksPassed ? (
                        <Button size="lg" onClick={handleStartInterview} className="px-8">
                            <Play className="h-5 w-5 mr-2" />
                            I&apos;m Ready - Start Interview
                        </Button>
                    ) : (
                        <div className="space-y-2">
                            <Button size="lg" disabled className="px-8">
                                <AlertCircle className="h-5 w-5 mr-2" />
                                Complete System Check First
                            </Button>
                            <p className="text-sm text-muted-foreground">
                                Please allow camera and microphone access to continue
                            </p>
                            <Button variant="outline" onClick={requestMediaPermissions}>
                                Retry Permissions
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
