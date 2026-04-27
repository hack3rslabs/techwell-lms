"use client"

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { Upload, X, CheckCircle, Loader2 } from 'lucide-react'
import { uploadApi } from '@/lib/api'

interface VideoUploadProps {
    onUploadComplete: (url: string) => void
    initialUrl?: string
    label?: string
}

export function VideoUpload({ onUploadComplete, initialUrl, label = "Upload Video" }: VideoUploadProps) {
    const [previewUrl, setPreviewUrl] = React.useState<string | null>(initialUrl || null)
    const [isUploading, setIsUploading] = React.useState(false)
    const [progress, setProgress] = React.useState(0)
    const [error, setError] = React.useState<string | null>(null)

    const fileInputRef = React.useRef<HTMLInputElement>(null)

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0]
        if (!selectedFile) return

        // Validate type
        if (!selectedFile.type.startsWith('video/')) {
            setError('Please upload a valid video file')
            return
        }

        // Validate size (e.g. 50MB)
        if (selectedFile.size > 50 * 1024 * 1024) {
            setError('File size exceeds 50MB limit')
            return
        }

        setError(null)
        setProgress(0)
        setIsUploading(true)

        try {
            const formData = new FormData()
            formData.append('file', selectedFile)

            // Simulating progress for UX
            const interval = setInterval(() => {
                setProgress(prev => {
                    if (prev >= 90) {
                        clearInterval(interval)
                        return 90
                    }
                    return prev + 10
                })
            }, 300)

            // Explicitly type the response we expect from the API
            interface UploadResponse {
                data: {
                    url: string
                }
            }

            const response = await uploadApi.upload(formData)
            // Use type assertion for the response data
            const data = (response as unknown as UploadResponse).data

            clearInterval(interval)
            setProgress(100)

            const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
            // Ensure we handle URL construction correctly
            const baseUrl = apiBaseUrl.endsWith('/api')
                ? apiBaseUrl.slice(0, -4)
                : apiBaseUrl

            const finalUrl = data.url.startsWith('http')
                ? data.url
                : `${baseUrl}${data.url}`

            setPreviewUrl(finalUrl)
            onUploadComplete(finalUrl)

        } catch (err: unknown) {
            console.error(err)
            let message = 'Upload failed'
            if (err && typeof err === 'object' && 'response' in err) {
                // Axios error shape
                const response = (err as { response?: { data?: { error?: string } } }).response
                message = response?.data?.error || message
            } else if (err instanceof Error) {
                message = err.message
            }
            setError(message)
        } finally {
            setIsUploading(false)
        }
    }

    const handleRemove = () => {
        setPreviewUrl(null)
        onUploadComplete('')
        if (fileInputRef.current) fileInputRef.current.value = ''
    }

    return (
        <div className="space-y-4">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                {label}
            </label>

            {!previewUrl ? (
                <div className="border-2 border-dashed rounded-lg p-6 hover:bg-muted/50 transition-colors cursor-pointer text-center"
                    onClick={() => fileInputRef.current?.click()}>
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="video/*"
                        onChange={handleFileChange}
                    />

                    {isUploading ? (
                        <div className="space-y-2">
                            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                            <p className="text-sm text-muted-foreground">Uploading... {progress}%</p>
                            {/* Simple Progress Bar */}
                            <div className="h-2 bg-secondary rounded-full overflow-hidden">
                                <div className="h-full bg-primary transition-all duration-300" style={{ width: `${progress}%` }} />
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <div className="mx-auto bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center">
                                <Upload className="h-6 w-6 text-primary" />
                            </div>
                            <p className="text-sm font-medium">Click to upload video</p>
                            <p className="text-xs text-muted-foreground">MP4, WebM up to 50MB</p>
                            {error && <p className="text-xs text-red-500 font-medium mt-2">{error}</p>}
                        </div>
                    )}
                </div>
            ) : (
                <div className="relative border rounded-lg p-2 bg-muted/20">
                    <video
                        src={previewUrl}
                        className="w-full max-h-[200px] rounded object-cover bg-black"
                        controls
                    />
                    <Button
                        size="icon"
                        variant="destructive"
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                        onClick={handleRemove}
                    >
                        <X className="h-3 w-3" />
                    </Button>
                    <div className="flex items-center gap-2 mt-2 text-xs text-green-600 font-medium px-1">
                        <CheckCircle className="h-3 w-3" />
                        Upload Complete
                    </div>
                </div>
            )}
        </div>
    )
}
