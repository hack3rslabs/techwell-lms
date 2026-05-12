"use client"

import { useState, useEffect } from "react"
import { ImageIcon, Loader2, Camera } from "lucide-react"
import api from "@/lib/api"
import Link from "next/link"
import { Button } from "@/components/ui/button"

interface GalleryImage {
    id: string
    url: string
    caption: string | null
}

export default function PublicGalleryPage() {
    const [images, setImages] = useState<GalleryImage[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchImages = async () => {
            try {
                // The route is prefixed with /admin in index.js but the GET is public
                const res = await api.get("/admin/gallery")
                if (Array.isArray(res.data)) {
                    setImages(res.data)
                }
            } catch (error) {
                console.error("Failed to fetch gallery images", error)
            } finally {
                setLoading(false)
            }
        }
        fetchImages()
    }, [])

    return (
        <div className="min-h-screen bg-background">
            {/* Hero Section */}
            <div className="relative h-[40vh] min-h-[300px] flex items-center justify-center overflow-hidden bg-muted">
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-background z-10" />
                    {images.length > 0 && (
                        <img 
                            src={images[0].url} 
                            alt="Hero background" 
                            className="w-full h-full object-cover blur-sm opacity-50 scale-110"
                        />
                    )}
                </div>
                
                <div className="container relative z-20 text-center space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-2">
                        <Camera className="w-3 h-3" />
                        Our Moments
                    </div>
                    <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white">
                        Life at <span className="text-primary">Techwell</span>
                    </h1>
                    <p className="text-lg text-gray-300 max-w-2xl mx-auto">
                        Capturing the events, workshops, and achievements that define our community.
                    </p>
                </div>
            </div>

            <div className="container py-16">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 space-y-4">
                        <Loader2 className="w-10 h-10 animate-spin text-primary" />
                        <p className="text-muted-foreground animate-pulse">Developing memories...</p>
                    </div>
                ) : images.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {images.map((image, index) => (
                            <div 
                                key={image.id} 
                                className="group relative aspect-[4/5] overflow-hidden rounded-2xl bg-muted border shadow-sm hover:shadow-xl transition-all duration-500"
                            >
                                <img
                                    src={image.url}
                                    alt={image.caption || `Gallery image ${index + 1}`}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    loading="lazy"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-6">
                                    {image.caption && (
                                        <p className="text-white text-sm font-medium transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                                            {image.caption}
                                        </p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-24 space-y-4">
                        <div className="p-4 bg-muted rounded-full w-fit mx-auto">
                            <ImageIcon className="w-12 h-12 text-muted-foreground opacity-20" />
                        </div>
                        <h2 className="text-2xl font-semibold">Gallery is Empty</h2>
                        <p className="text-muted-foreground max-w-sm mx-auto">
                            Check back soon for photos of our latest events and activities.
                        </p>
                    </div>
                )}
            </div>

            {/* Newsletter or CTA Section */}
            <div className="bg-muted/30 py-20 border-t">
                <div className="container text-center space-y-6">
                    <h2 className="text-3xl font-bold">Want to join us?</h2>
                    <p className="text-muted-foreground max-w-lg mx-auto">
                        Be a part of our upcoming events and workshops. Stay updated with our latest news.
                    </p>
                    <div className="flex justify-center gap-4">
                        <Link href="/courses">
                            <Button size="lg">
                                Explore Courses
                            </Button>
                        </Link>
                        <Link href="/contact">
                            <Button variant="outline" size="lg">
                                Contact Us
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
