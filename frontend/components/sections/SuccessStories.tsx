"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { ArrowRight, Loader2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import api from "@/lib/api"

import Image from "next/image"

export function SuccessStories() {
  const [stories, setStories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const backendBase = process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "http://localhost:5000"

  useEffect(() => {
      const fetchStories = async () => {
          try {
              const res = await api.get("/success-stories")
              const activeStories = res.data
                  .filter((s: any) => s.isActive)
                  .sort((a: any, b: any) => a.order - b.order)
                  .slice(0, 6)
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
    <section className="py-24 relative overflow-hidden bg-white dark:bg-black">
      {/* Background glow effects - Grayscale */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-96 h-96 bg-slate-300/20 blur-[100px] rounded-full mix-blend-multiply dark:mix-blend-screen pointer-events-none"></div>
      <div className="absolute top-1/2 right-0 -translate-y-1/2 w-96 h-96 bg-zinc-300/20 blur-[100px] rounded-full mix-blend-multiply dark:mix-blend-screen pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge className="bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-slate-100 border-none font-bold tracking-widest uppercase mb-4 hover:bg-slate-300 dark:hover:bg-slate-700">Alumni Outcomes</Badge>
          <h2 className="text-4xl md:text-5xl font-black tracking-tight text-black dark:text-white mb-6">
            From Classroom to <span className="text-black dark:text-white">Boardroom</span>
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
            Join thousands of Techwell alumni who have successfully launched and accelerated their careers at top Fortune 500 tech companies.
          </p>
        </div>

        {loading ? (
            <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        ) : stories.length === 0 ? (
            <div className="text-center py-12 opacity-50">
                <p>New success stories are being updated.</p>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {stories.map((story) => {
                const imageUrl = story.imagePath?.startsWith('http') ? story.imagePath : `${backendBase}${story.imagePath}`
                return (
                <div 
                  key={story.id} 
                  className="group relative bg-black dark:bg-white backdrop-blur-xl border border-slate-800 dark:border-slate-200 rounded-3xl overflow-hidden hover:-translate-y-2 transition-all duration-500 shadow-xl hover:shadow-2xl aspect-[4/3]"
                >
                        <div className="relative h-full w-full">
                            <Image 
                                src={imageUrl} 
                                alt={story.altText || 'Success Story'}
                                fill
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                className="object-cover transition-transform duration-700 hover:scale-105"
                            />
                        </div>
                    {story.altText && (
                        <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black/80 to-transparent text-white">
                            <p className="font-semibold text-sm drop-shadow-md">{story.altText}</p>
                        </div>
                    )}
                </div>
              )})}
            </div>
        )}

        <div className="mt-16 flex justify-center">
          <a href="/placements" className="inline-flex items-center gap-2 text-black dark:text-white font-bold hover:gap-4 transition-all group">
            View All Placement Records 
            <ArrowRight className="w-5 h-5 group-hover:text-slate-500 transition-colors" />
          </a>
        </div>
      </div>
    </section>
  )
}
