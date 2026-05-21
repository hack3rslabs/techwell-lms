"use client"

import { useState, useEffect } from "react"
import { Plus, Trash2, Image as ImageIcon, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import Image from "next/image"
import api, { uploadApi } from "@/lib/api"
import { getFullImageUrl } from "@/lib/image-utils"

interface GalleryImage {
    id: string
    url: string
    caption: string | null
}

export default function GalleryPage() {
    const [images, setImages] = useState<GalleryImage[]>([])
    const [selectedImageUrl, setSelectedImageUrl] = useState("")
    const [loading, setLoading] = useState(true)
    const [uploading, setUploading] = useState(false)
    const [submitting, setSubmitting] = useState(false)
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

    const handleAddImage = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedImageUrl) return

        setSubmitting(true)
        try {
            const res = await api.post("/admin/gallery", { url: selectedImageUrl })
            const newImage = res.data
            setImages([...images, newImage])
            setSelectedImageUrl("")
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
            await api.delete("/admin/gallery", { params: { id } })
            setImages(images.filter(img => img.id !== id))
            toast({ title: "Success", description: "Image deleted" })
        } catch (_error) {
            toast({ title: "Error", description: "Failed to delete image", variant: "destructive" })
        }
    }

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        if (!file.type.startsWith("image/")) {
            toast({ title: "Error", description: "Please select an image file", variant: "destructive" })
            return
        }

        const formData = new FormData()
        formData.append("file", file)

        setUploading(true)
        try {
            const res = await uploadApi.upload(formData)
            setSelectedImageUrl(res.data.url)
            toast({ title: "Success", description: "Image uploaded" })
        } catch (_error) {
            toast({ title: "Error", description: "Failed to upload image", variant: "destructive" })
        } finally {
            setUploading(false)
            e.target.value = ""
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
                <CardContent className="p-6">
                    <form onSubmit={handleAddImage} className="flex gap-4 items-end">
                        <div className="flex-1 space-y-2">
                            <label className="text-sm font-medium">Gallery Image</label>
                            <Input
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                disabled={uploading}
                            />
                            {uploading && <p className="text-xs text-muted-foreground">Uploading image...</p>}
                            {selectedImageUrl && (
                                <div className="relative h-32 w-32 overflow-hidden rounded-md border">
                                    <Image
                                        src={getFullImageUrl(selectedImageUrl)}
                                        alt="Selected gallery image"
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                            )}
                        </div>
                        <Button type="submit" disabled={submitting || uploading || !selectedImageUrl}>
                            {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                            Add Image
                        </Button>
                    </form>
                </CardContent>
            </Card>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {loading ? (
                    [1, 2, 3, 4].map(i => (
                        <div key={i} className="aspect-square bg-muted animate-pulse rounded-lg" />
                    ))
                ) : images.map((image) => (
                    <div key={image.id} className="group relative aspect-square bg-muted rounded-lg overflow-hidden border">
                        <Image
                            src={getFullImageUrl(image.url)}
                            alt={image.caption || "Gallery Image"}
                            fill
                            className="object-cover transition-transform group-hover:scale-105"
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
