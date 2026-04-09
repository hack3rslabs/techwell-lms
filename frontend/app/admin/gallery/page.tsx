"use client"

import { useState, useEffect } from "react"
import { Plus, Trash2, Image as ImageIcon, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import Image from "next/image"

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
    const { toast } = useToast()

    useEffect(() => {
        fetchImages()
    }, [])

    const fetchImages = async () => {
        try {
            const res = await fetch("/api/admin/gallery")
            const data = await res.json()
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
        if (!newUrl) return

        setSubmitting(true)
        try {
            const res = await fetch("/api/admin/gallery", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ url: newUrl }),
            })

            if (!res.ok) throw new Error("Failed to add image")

            const newImage = await res.json()
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
            const res = await fetch(`/api/admin/gallery?id=${id}`, {
                method: "DELETE",
            })

            if (!res.ok) throw new Error("Failed to delete")

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
                <CardContent className="p-6">
                    <form onSubmit={handleAddImage} className="flex gap-4 items-end">
                        <div className="flex-1 space-y-2">
                            <label className="text-sm font-medium">Image URL</label>
                            <Input
                                placeholder="https://example.com/image.jpg"
                                value={newUrl}
                                onChange={(e) => setNewUrl(e.target.value)}
                            />
                        </div>
                        <Button type="submit" disabled={submitting || !newUrl}>
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
                            src={image.url}
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
