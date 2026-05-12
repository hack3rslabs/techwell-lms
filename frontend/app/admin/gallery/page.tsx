"use client"

import { useState, useEffect } from "react"
import { Plus, Trash2, Image as ImageIcon, Loader2, X, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import api from "@/lib/api"

interface GalleryImage {
    id: string
    url: string
    caption: string | null
}

export default function GalleryPage() {
    const [images, setImages] = useState<GalleryImage[]>([])
    const [newUrl, setNewUrl] = useState("")
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [isUploading, setIsUploading] = useState(false)
    const { toast } = useToast()

    useEffect(() => {
        fetchImages()
    }, [])

    const fetchImages = async () => {
        try {
            const res = await api.get("/admin/gallery")
            const data = res.data
            if (Array.isArray(data)) {
                setImages(data)
            }
        } catch (error) {
            console.error("Failed to fetch images", error)
        } finally {
            setLoading(false)
        }
    }

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        if (!file.type.startsWith('image/')) {
            toast({ title: "Error", description: "Please upload an image file", variant: "destructive" })
            return
        }

        const formData = new FormData()
        formData.append('file', file)

        setIsUploading(true)
        try {
            const res = await api.post('/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            })

            if (res.data.url) {
                setNewUrl(res.data.url)
                toast({ title: "Success", description: "Image uploaded successfully" })
            }
        } catch (error) {
            console.error('Upload error:', error)
            toast({ title: "Error", description: "Failed to upload image", variant: "destructive" })
        } finally {
            setIsUploading(false)
        }
    }

    const handleAddImage = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newUrl) return

        setSubmitting(true)
        try {
            const res = await api.post("/admin/gallery", { url: newUrl })
            const newImage = res.data
            setImages([...images, newImage])
            setNewUrl("")
            toast({ title: "Success", description: "Image added to gallery" })
        } catch (_error) {
            toast({ title: "Error", description: "Failed to add image", variant: "destructive" })
        } finally {
            setSubmitting(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this image?")) return

        try {
            await api.delete(`/admin/gallery?id=${id}`)
            setImages(images.filter(img => img.id !== id))
            toast({ title: "Success", description: "Image deleted" })
        } catch (_error) {
            toast({ title: "Error", description: "Failed to delete image", variant: "destructive" })
        }
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Gallery Manager</h1>
                    <p className="text-muted-foreground">Manage images displayed in the footer gallery.</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-xl">Add New Image</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div 
                                className={`relative border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center transition-all cursor-pointer
                                    ${newUrl ? 'border-primary/50 bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50'}
                                    ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}
                                `}
                                onClick={() => {
                                    if (isUploading || submitting) return
                                    const input = document.createElement('input')
                                    input.type = 'file'
                                    input.accept = 'image/*'
                                    input.onchange = (e: any) => handleImageUpload(e)
                                    input.click()
                                }}
                            >
                                <div className="text-center space-y-2">
                                    <div className="p-3 bg-primary/10 rounded-full w-fit mx-auto">
                                        {isUploading ? (
                                            <Loader2 className="w-6 h-6 animate-spin text-primary" />
                                        ) : (
                                            <Upload className="w-6 h-6 text-primary" />
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold">Click or drag to upload</p>
                                        <p className="text-xs text-muted-foreground">PNG, JPG or GIF (max 5MB)</p>
                                    </div>
                                </div>
                            </div>

                            {newUrl && (
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Image URL (Optional Preview)</label>
                                    <div className="flex gap-2">
                                        <Input
                                            value={newUrl}
                                            onChange={(e) => setNewUrl(e.target.value)}
                                            placeholder="https://example.com/image.jpg"
                                            className="text-xs"
                                        />
                                        <Button 
                                            variant="outline" 
                                            size="icon"
                                            onClick={() => setNewUrl("")}
                                        >
                                            <X className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col justify-between">
                            <div 
                                className="bg-muted rounded-xl aspect-video relative overflow-hidden border group cursor-pointer"
                                onClick={() => {
                                    const input = document.createElement('input')
                                    input.type = 'file'
                                    input.accept = 'image/*'
                                    input.onchange = (e: any) => handleImageUpload(e)
                                    input.click()
                                }}
                            >
                                {newUrl ? (
                                    <>
                                        <img
                                            src={newUrl}
                                            alt="Preview"
                                            className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                        />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <div className="flex flex-col items-center text-white">
                                                <Upload className="w-6 h-6 mb-2" />
                                                <span className="text-xs font-medium">Click to change</span>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground italic">
                                        <ImageIcon className="w-8 h-8 mb-2 opacity-20" />
                                        <span className="text-sm">Preview will appear here</span>
                                    </div>
                                )}
                            </div>

                            <Button 
                                onClick={handleAddImage} 
                                disabled={submitting || isUploading || !newUrl}
                                className="w-full mt-4"
                            >
                                {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                                Add to Gallery
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {loading ? (
                    [1, 2, 3, 4].map(i => (
                        <div key={i} className="aspect-square bg-muted animate-pulse rounded-lg" />
                    ))
                ) : images.map((image) => (
                    <div key={image.id} className="group relative aspect-square bg-muted rounded-lg overflow-hidden border">
                        <img
                            src={image.url}
                            alt={image.caption || "Gallery Image"}
                            className="w-full h-full object-cover transition-transform group-hover:scale-105"
                        />
                        <button
                            onClick={() => handleDelete(image.id)}
                            className="absolute top-2 right-2 p-1.5 bg-red-500/80 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                            title="Delete image"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                ))}
            </div>

            {!loading && images.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                    <ImageIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No images in gallery yet</p>
                </div>
            )}
        </div>
    )
}
