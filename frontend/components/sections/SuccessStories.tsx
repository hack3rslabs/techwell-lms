"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { ArrowRight, Loader2, ExternalLink, ChevronRight, ChevronLeft } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import api from "@/lib/api"
import Image from "next/image"

export function SuccessStories() {
  const [stories, setStories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const scrollContainerRef = React.useRef<HTMLDivElement>(null)
  
  const backendBase = process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "http://localhost:5000"

  useEffect(() => {
      const fetchStories = async () => {
          try {
              const res = await api.get("/success-stories")
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

  const scroll = (direction: 'left' | 'right') => {
      if (scrollContainerRef.current) {
          const scrollAmount = direction === 'left' ? -350 : 350
          scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' })
      }
  }

  return (
    <section className="py-24 relative overflow-hidden bg-slate-50 dark:bg-[#0A0A0A]">
      <div className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-8">
            <div className="max-w-2xl">
                <Badge className="bg-slate-200 dark:bg-white/10 text-slate-800 dark:text-slate-200 border-none font-bold tracking-widest uppercase mb-6 rounded-sm px-3 py-1">
                    Corporate Placements
                </Badge>
                <h2 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
                    Where Ambition Meets <span className="text-primary">Opportunity.</span>
                </h2>
                <p className="mt-6 text-lg text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                    Explore our track record of empowering professionals and placing them in leading tech enterprises.
                </p>
            </div>
            
            <div className="flex items-center gap-4">
                <div className="hidden md:flex items-center gap-2 mr-4">
                    <button onClick={() => scroll('left')} className="p-3 rounded-full border border-slate-200 dark:border-white/10 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors">
                        <ChevronLeft className="w-5 h-5 text-slate-700 dark:text-slate-300" />
                    </button>
                    <button onClick={() => scroll('right')} className="p-3 rounded-full border border-slate-200 dark:border-white/10 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors">
                        <ChevronRight className="w-5 h-5 text-slate-700 dark:text-slate-300" />
                    </button>
                </div>
                <a href="/placements" className="hidden md:inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white hover:text-primary transition-colors group">
                    View Placement Directory 
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </a>
            </div>
        </div>

        {loading ? (
            <div className="flex justify-center items-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        ) : stories.length === 0 ? (
            <div className="text-center py-20 border border-slate-200 dark:border-white/5 bg-white dark:bg-black rounded-lg">
                <p className="text-slate-500 dark:text-slate-400 font-medium tracking-wide">Placements are currently being updated.</p>
            </div>
        ) : (
            <div 
                ref={scrollContainerRef}
                className="flex overflow-x-auto snap-x snap-mandatory gap-6 pb-8 [&::-webkit-scrollbar]:hidden"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                {stories.map((story) => {
                    const imageUrl = story.imagePath?.startsWith('http') ? story.imagePath : `${backendBase}${story.imagePath}`
                    const CardWrapper = story.url ? 'a' : 'div'
                    const wrapperProps = story.url ? { href: story.url, target: "_blank", rel: "noopener noreferrer" } : {}
                    
                    return (
                    <CardWrapper 
                        key={story.id} 
                        {...wrapperProps as any}
                        className={`shrink-0 w-[280px] sm:w-[320px] lg:w-[380px] snap-start group relative bg-white dark:bg-black border border-slate-200 dark:border-white/10 rounded-lg overflow-hidden transition-all duration-300 shadow-sm hover:shadow-2xl flex flex-col ${story.url ? 'cursor-pointer hover:border-primary/50' : ''}`}
                    >
                        <div className="relative w-full aspect-[4/3] overflow-hidden bg-slate-100 dark:bg-slate-900">
                            {/* Overlay for a more premium muted look until hover */}
                            <div className="absolute inset-0 bg-black/10 dark:bg-black/40 group-hover:bg-transparent transition-colors duration-500 z-10" />
                            
                            <Image 
                                src={imageUrl} 
                                alt={story.altText || 'Success Story'}
                                fill
                                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                className="object-cover scale-100 group-hover:scale-105 transition-transform duration-700 ease-in-out mix-blend-multiply dark:mix-blend-normal"
                            />

                            {story.url && (
                                <div className="absolute top-4 right-4 z-20 bg-white dark:bg-black p-2 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-y-2 group-hover:translate-y-0">
                                    <ExternalLink className="w-4 h-4 text-slate-900 dark:text-white" />
                                </div>
                            )}
                        </div>
                        
                        {story.altText && (
                            <div className="relative bg-white dark:bg-black p-5 border-t border-slate-100 dark:border-white/5 z-20">
                                <h3 className="font-bold text-sm text-slate-900 dark:text-white uppercase tracking-wider truncate">
                                    {story.altText}
                                </h3>
                                {story.url && (
                                    <p className="text-xs text-primary mt-1.5 font-medium flex items-center gap-1">
                                        View Details <ArrowRight className="w-3 h-3" />
                                    </p>
                                )}
                            </div>
                        )}
                    </CardWrapper>
                )})}
            </div>
        )}
        
        <div className="mt-4 flex items-center justify-between md:hidden">
            <div className="flex items-center gap-2">
                <button onClick={() => scroll('left')} className="p-3 rounded-full border border-slate-200 dark:border-white/10 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors">
                    <ChevronLeft className="w-5 h-5 text-slate-700 dark:text-slate-300" />
                </button>
                <button onClick={() => scroll('right')} className="p-3 rounded-full border border-slate-200 dark:border-white/10 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors">
                    <ChevronRight className="w-5 h-5 text-slate-700 dark:text-slate-300" />
                </button>
            </div>
            <a href="/placements" className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white hover:text-primary transition-colors group">
                Directory 
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
        </div>

      </div>
    </section>
  )
}
