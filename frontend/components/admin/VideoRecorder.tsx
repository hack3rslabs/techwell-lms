"use client"

import * as React from 'react'
import { useState, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import {
    Video,
    StopCircle,
    Upload,
    ScreenShare,
    Camera,
    Mic,
    MicOff,
    Monitor,
    Trash2,
    Download,
    Loader2,
    AlertCircle
} from 'lucide-react'

interface VideoRecorderProps {
    onRecordingComplete?: (blob: Blob, thumbnail?: string) => void
    onUploadComplete?: (url: string, thumbnail?: string) => void
    maxDuration?: number // in seconds
    allowScreenShare?: boolean
}

type RecordingMode = 'camera' | 'screen' | 'screen_with_camera'

export function VideoRecorder({
    onRecordingComplete,
    onUploadComplete,
    maxDuration = 600, // 10 minutes default
    allowScreenShare = true
}: VideoRecorderProps) {
    const [isRecording, setIsRecording] = useState(false)
    const [isPreviewing, setIsPreviewing] = useState(false)
    const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null)
    const [recordedUrl, setRecordedUrl] = useState<string | null>(null)
    const [duration, setDuration] = useState(0)
    const [mode, setMode] = useState<RecordingMode>('camera')
    const [isMuted, setIsMuted] = useState(false)
    const [isUploading, setIsUploading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const videoRef = useRef<HTMLVideoElement>(null)
    const previewRef = useRef<HTMLVideoElement>(null)
    const mediaRecorderRef = useRef<MediaRecorder | null>(null)
    const streamRef = useRef<MediaStream | null>(null)
    const chunksRef = useRef<Blob[]>([])
    const timerRef = useRef<NodeJS.Timeout | null>(null)

    const stopRecording = useCallback(() => {
        if (timerRef.current) {
            clearInterval(timerRef.current)
            timerRef.current = null
        }

        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop()
        }

        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop())
            streamRef.current = null
        }

        setIsRecording(false)
    }, [])

    const startRecording = useCallback(async () => {
        setError(null)
        chunksRef.current = []

        try {
            let stream: MediaStream

            if (mode === 'camera') {
                stream = await navigator.mediaDevices.getUserMedia({
                    video: { width: 1280, height: 720, facingMode: 'user' },
                    audio: true
                })
            } else if (mode === 'screen') {
                stream = await navigator.mediaDevices.getDisplayMedia({
                    video: { width: 1920, height: 1080 },
                    audio: true
                })
            } else {
                // Screen with camera overlay
                const screenStream = await navigator.mediaDevices.getDisplayMedia({
                    video: { width: 1920, height: 1080 },
                    audio: true
                })
                const cameraStream = await navigator.mediaDevices.getUserMedia({
                    video: { width: 320, height: 240 },
                    audio: true
                })

                // Combine streams
                const tracks = [
                    ...screenStream.getVideoTracks(),
                    ...cameraStream.getAudioTracks()
                ]
                stream = new MediaStream(tracks)
            }

            streamRef.current = stream

            if (videoRef.current) {
                videoRef.current.srcObject = stream
                videoRef.current.muted = true
                await videoRef.current.play()
            }

            const mediaRecorder = new MediaRecorder(stream, {
                mimeType: 'video/webm;codecs=vp9'
            })

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunksRef.current.push(e.data)
                }
            }

            mediaRecorder.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: 'video/webm' })
                setRecordedBlob(blob)
                const url = URL.createObjectURL(blob)
                setRecordedUrl(url)
                setIsPreviewing(true)

                // Generate thumbnail
                if (videoRef.current) {
                    const canvas = document.createElement('canvas')
                    canvas.width = videoRef.current.videoWidth
                    canvas.height = videoRef.current.videoHeight
                    const ctx = canvas.getContext('2d')
                    if (ctx) {
                        ctx.drawImage(videoRef.current, 0, 0)
                        const thumbnail = canvas.toDataURL('image/jpeg', 0.7)
                        onRecordingComplete?.(blob, thumbnail)
                    }
                }
            }

            mediaRecorderRef.current = mediaRecorder
            mediaRecorder.start(1000) // Collect data every second
            setIsRecording(true)
            setDuration(0)

            // Start duration timer
            timerRef.current = setInterval(() => {
                setDuration(prev => {
                    if (prev >= maxDuration) {
                        stopRecording()
                        return prev
                    }
                    return prev + 1
                })
            }, 1000)

        } catch (err: unknown) {
            console.error('Failed to start recording:', err)
            const message = (err as { message?: string })?.message || 'Failed to access camera/microphone'
            setError(message)
        }
    }, [mode, maxDuration, onRecordingComplete, stopRecording])

    const discardRecording = useCallback(() => {
        if (recordedUrl) {
            URL.revokeObjectURL(recordedUrl)
        }
        setRecordedBlob(null)
        setRecordedUrl(null)
        setIsPreviewing(false)
        setDuration(0)
    }, [recordedUrl])

    const downloadRecording = useCallback(() => {
        if (!recordedBlob) return
        const url = URL.createObjectURL(recordedBlob)
        const a = document.createElement('a')
        a.href = url
        a.download = `recording_${Date.now()}.webm`
        a.click()
        URL.revokeObjectURL(url)
    }, [recordedBlob])

    const uploadRecording = useCallback(async () => {
        if (!recordedBlob) return
        setIsUploading(true)

        try {
            const formData = new FormData()
            formData.append('video', recordedBlob, 'recording.webm')

            // Mock upload - replace with actual API call
            await new Promise(resolve => setTimeout(resolve, 2000))
            const mockUrl = `https://storage.example.com/videos/${Date.now()}.webm`

            onUploadComplete?.(mockUrl)
            setIsUploading(false)
        } catch (_err) {
            setError('Failed to upload recording')
            setIsUploading(false)
        }
    }, [recordedBlob, onUploadComplete])

    const toggleMute = useCallback(() => {
        if (streamRef.current) {
            streamRef.current.getAudioTracks().forEach(track => {
                track.enabled = isMuted
            })
        }
        setIsMuted(!isMuted)
    }, [isMuted])

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Video className="h-5 w-5" />
                    Video Recorder
                </CardTitle>
                <CardDescription>
                    Record video from camera or capture your screen
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
                        <AlertCircle className="h-4 w-4" />
                        <span className="text-sm">{error}</span>
                    </div>
                )}

                {/* Mode Selector */}
                {!isRecording && !isPreviewing && (
                    <div className="flex gap-2">
                        <Button
                            variant={mode === 'camera' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setMode('camera')}
                        >
                            <Camera className="h-4 w-4 mr-2" />
                            Camera
                        </Button>
                        {allowScreenShare && (
                            <>
                                <Button
                                    variant={mode === 'screen' ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setMode('screen')}
                                >
                                    <Monitor className="h-4 w-4 mr-2" />
                                    Screen
                                </Button>
                                <Button
                                    variant={mode === 'screen_with_camera' ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setMode('screen_with_camera')}
                                >
                                    <ScreenShare className="h-4 w-4 mr-2" />
                                    Screen + Cam
                                </Button>
                            </>
                        )}
                    </div>
                )}

                {/* Video Preview */}
                <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                    {isPreviewing && recordedUrl ? (
                        <video
                            ref={previewRef}
                            src={recordedUrl}
                            controls
                            className="w-full h-full object-contain"
                        />
                    ) : (
                        <video
                            ref={videoRef}
                            className="w-full h-full object-contain"
                            autoPlay
                            muted
                            playsInline
                        />
                    )}

                    {/* Recording Indicator */}
                    {isRecording && (
                        <div className="absolute top-4 left-4 flex items-center gap-2 bg-red-600 text-white px-3 py-1 rounded-full">
                            <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                            <span className="text-sm font-medium">REC</span>
                            <span className="text-sm">{formatTime(duration)}</span>
                        </div>
                    )}

                    {/* Duration Progress */}
                    {isRecording && (
                        <div className="absolute bottom-0 left-0 right-0">
                            <Progress value={(duration / maxDuration) * 100} className="h-1 rounded-none" />
                        </div>
                    )}
                </div>

                {/* Controls */}
                <div className="flex items-center justify-center gap-3">
                    {!isRecording && !isPreviewing && (
                        <Button onClick={startRecording} className="gap-2">
                            <Video className="h-4 w-4" />
                            Start Recording
                        </Button>
                    )}

                    {isRecording && (
                        <>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={toggleMute}
                            >
                                {isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={stopRecording}
                                className="gap-2"
                            >
                                <StopCircle className="h-4 w-4" />
                                Stop Recording
                            </Button>
                        </>
                    )}

                    {isPreviewing && (
                        <>
                            <Button
                                variant="outline"
                                onClick={discardRecording}
                                className="gap-2"
                            >
                                <Trash2 className="h-4 w-4" />
                                Discard
                            </Button>
                            <Button
                                variant="outline"
                                onClick={downloadRecording}
                                className="gap-2"
                            >
                                <Download className="h-4 w-4" />
                                Download
                            </Button>
                            <Button
                                onClick={uploadRecording}
                                disabled={isUploading}
                                className="gap-2"
                            >
                                {isUploading ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Upload className="h-4 w-4" />
                                )}
                                {isUploading ? 'Uploading...' : 'Use Recording'}
                            </Button>
                        </>
                    )}
                </div>

                {/* Duration Info */}
                {isRecording && (
                    <p className="text-center text-sm text-muted-foreground">
                        Max duration: {formatTime(maxDuration)}
                    </p>
                )}
            </CardContent>
        </Card>
    )
}

export default VideoRecorder
