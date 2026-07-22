"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { ArrowRight, Loader2, Star, Quote } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import api from "@/lib/api"
import Image from "next/image"

const sampleReviews = [
    {
        id: 1,
        name: "Rahul Sharma",
        role: "Software Engineer @ TCS",
        review: "Techwell's corporate training completely transformed my skill set. Their campus drive gave me the exact opportunity I needed to land my dream job.",
        rating: 5
    },
    {
        id: 2,
        name: "Priya Desai",
        role: "Cyber Security Analyst @ Infosys",
        review: "The hands-on cyber security labs were intense. Within 2 months of completing the bootcamp, I cleared my interviews with flying colors.",
        rating: 5
    },
    {
        id: 3,
        name: "Amit Patel",
        role: "Full Stack Developer",
        review: "From zero coding knowledge to a full-stack developer in 6 months. The job consultancy team guided my resume building flawlessly.",
        rating: 5
    }
];

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
      {/* Background glow effects */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-96 h-96 bg-primary/10 blur-[100px] rounded-full mix-blend-multiply dark:mix-blend-screen pointer-events-none"></div>
      <div className="absolute top-1/2 right-0 -translate-y-1/2 w-96 h-96 bg-purple-500/10 blur-[100px] rounded-full mix-blend-multiply dark:mix-blend-screen pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge className="bg-primary/10 text-primary border-none font-bold tracking-widest uppercase mb-4">Alumni Outcomes</Badge>
          <h2 className="text-4xl md:text-5xl font-black tracking-tight text-black dark:text-white mb-6">
            From Classroom to <span className="text-primary">Boardroom</span>
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
            Join thousands of Techwell alumni who have successfully launched and accelerated their careers at top tech companies.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8">
            
            {/* Left Side: Uploaded Visual Proofs */}
            <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="h-px bg-border flex-1"></div>
                    <span className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Visual Proof</span>
                    <div className="h-px bg-border flex-1"></div>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : stories.length === 0 ? (
                    <div className="text-center py-12 opacity-50 bg-slate-100 dark:bg-white/5 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700">
                        <p className="text-sm font-semibold p-8">New success stories are being updated.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {stories.map((story) => {
                        const imageUrl = story.imagePath?.startsWith('http') ? story.imagePath : `${backendBase}${story.imagePath}`
                        const CardWrapper = story.url ? 'a' : 'div'
                        const wrapperProps = story.url ? { href: story.url, target: "_blank", rel: "noopener noreferrer" } : {}
                        
                        return (
                        <CardWrapper 
                        key={story.id} 
                        {...wrapperProps as any}
                        className={`block group relative bg-black dark:bg-white backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden hover:-translate-y-2 transition-all duration-500 shadow-xl hover:shadow-2xl aspect-[4/3] ${story.url ? 'cursor-pointer hover:border-primary/50' : ''}`}
                        >
                                <div className="relative h-full w-full">
                                    <Image 
                                        src={imageUrl} 
                                        alt={story.altText || 'Success Story'}
                                        fill
                                        sizes="(max-width: 768px) 100vw, 50vw"
                                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                                    />
                                </div>
                            {story.altText && (
                                <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black/90 via-black/50 to-transparent text-white">
                                    <p className="font-semibold text-sm drop-shadow-md">{story.altText}</p>
                                </div>
                            )}
                            {story.url && (
                                <div className="absolute top-3 right-3 bg-white/90 dark:bg-black/90 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg backdrop-blur-sm">
                                    <ArrowRight className="w-4 h-4 text-primary" />
                                </div>
                            )}
                        </CardWrapper>
                    )})}
                    </div>
                )}
            </div>

            {/* Right Side: Hardcoded Social Proof Reviews */}
            <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="h-px bg-border flex-1"></div>
                    <span className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Alumni Reviews</span>
                    <div className="h-px bg-border flex-1"></div>
                </div>

                <div className="grid gap-6">
                    {sampleReviews.map((review) => (
                        <div key={review.id} className="relative p-8 rounded-3xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-primary/30 transition-colors shadow-sm">
                            <Quote className="absolute top-6 right-6 w-10 h-10 text-primary/10 dark:text-primary/20 rotate-180" />
                            <div className="flex gap-1 mb-4">
                                {[...Array(review.rating)].map((_, i) => (
                                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                                ))}
                            </div>
                            <p className="text-slate-700 dark:text-slate-300 mb-6 italic leading-relaxed">
                                "{review.review}"
                            </p>
                            <div>
                                <h4 className="font-bold text-black dark:text-white">{review.name}</h4>
                                <p className="text-xs font-semibold text-primary mt-1 uppercase tracking-wider">{review.role}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

        </div>

        <div className="mt-16 flex justify-center">
          <a href="/placements" className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-primary text-primary-foreground font-bold hover:gap-4 hover:shadow-xl hover:shadow-primary/20 transition-all group">
            View All Placement Records 
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </a>
        </div>
      </div>
    </section>
  )
}
