"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Loader2, Award } from "lucide-react"
import api from "@/lib/api"
import { Footer } from "@/components/layout/Footer"

export default function PlacementsPage() {
    const [stories, setStories] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const backendBase = process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "http://localhost:5000"

    useEffect(() => {
        const fetchStories = async () => {
            try {
                const res = await api.get("/success-stories")
                // Sort by order
                const activeStories = res.data
                    .filter((s: any) => s.isActive)
                    .sort((a: any, b: any) => a.order - b.order)
                setStories(activeStories)
            } catch (err) {
                console.error("Failed to fetch success stories", err)
            } finally {
                setLoading(false)
            }
        }
        fetchStories()
    }, [])

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-black text-slate-900 dark:text-white pt-24">
            
            {/* Header Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 py-12 text-center">
                <Badge className="bg-primary/10 text-primary border-none font-bold tracking-widest uppercase mb-4 px-4 py-1.5">
                    <Award className="w-4 h-4 mr-2 inline" />
                    Alumni Outcomes
                </Badge>
                <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-6">
                    Our <span className="text-primary">Success Stories</span>
                </h1>
                <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
                    Explore the journeys of our students who have successfully transformed their careers and secured top placements in the industry.
                </p>
            </div>

            {/* Gallery Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
                {loading ? (
                    <div className="flex items-center justify-center py-24">
                        <Loader2 className="h-12 w-12 animate-spin text-primary" />
                    </div>
                ) : stories.length === 0 ? (
                    <div className="text-center py-24 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                        <p className="text-slate-500 font-medium">New success stories are being updated. Check back soon!</p>
                    </div>
                ) : (
                    <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
                        {stories.map((story) => {
                            const imageUrl = story.imagePath?.startsWith('http') ? story.imagePath : `${backendBase}${story.imagePath}`
                            return (
                            <div 
                                key={story.id} 
                                className="break-inside-avoid relative group rounded-2xl overflow-hidden bg-white dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-slate-800"
                            >
                                <div className="relative">
                                    <img 
                                        src={imageUrl} 
                                        alt={story.altText || 'Success Story'}
                                        className="w-full h-auto object-cover transition-transform duration-700 hover:scale-105"
                                        loading="lazy"
                                    />
                                </div>
                                {story.altText && (
                                    <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
                                        <p className="font-semibold text-sm text-center">{story.altText}</p>
                                    </div>
                                )}
                            </div>
                        )})}
                    </div>
                )}
            </div>
        </div>
    )
}
