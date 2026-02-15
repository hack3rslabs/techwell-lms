
"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Play, Calendar, User, Briefcase, Linkedin } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"

export default function SkillcastPage() {
    const [skillcasts, setSkillcasts] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/skillcasts`)
            .then(res => res.json())
            .then(data => {
                setSkillcasts(Array.isArray(data) ? data : [])
                setLoading(false)
            })
            .catch(err => {
                console.error(err)
                setLoading(false)
            })
    }, [])

    return (
        <div className="min-h-screen bg-background">
            {/* Hero Section */}
            <section className="relative pt-32 pb-20 overflow-hidden">
                <div className="absolute inset-0 bg-grid-white/5 [mask-image:linear-gradient(to_bottom,transparent,black,transparent)]" />
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-background" />

                <div className="container relative z-10 px-4 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <Badge variant="outline" className="mb-4 bg-primary/10 text-primary border-primary/20 backdrop-blur-sm">
                            Expert Insights
                        </Badge>
                        <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
                            Skillcast <span className="text-primary">Series</span>
                        </h1>
                        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
                            Learn from industry veterans through exclusive interviews, case studies, and career advice.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Content Grid */}
            <section className="container px-4 pb-20">
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-[400px] rounded-2xl bg-muted/50 animate-pulse" />
                        ))}
                    </div>
                ) : skillcasts.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-muted mb-4">
                            <Play className="h-10 w-10 text-muted-foreground" />
                        </div>
                        <h3 className="text-xl font-semibold">No Skillcasts Yet</h3>
                        <p className="text-muted-foreground">Check back soon for new episodes!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {skillcasts.map((item, idx) => (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                            >
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Card className="group cursor-pointer overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/50 transition-all hover:shadow-2xl hover:shadow-primary/5 h-full flex flex-col">
                                            {/* Thumbnail */}
                                            <div className="relative aspect-video overflow-hidden">
                                                <Image
                                                    src={item.thumbnail || "/images/placeholder-video.jpg"} // You'd need a placeholder
                                                    alt={item.title}
                                                    fill
                                                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                                                />
                                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <div className="h-16 w-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
                                                        <Play className="h-8 w-8 text-white fill-white" />
                                                    </div>
                                                </div>
                                                <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                                                    <Badge className="bg-black/60 backdrop-blur-md border-none text-white hover:bg-black/70">
                                                        {item.experience || "Expert"} Exp
                                                    </Badge>
                                                </div>
                                            </div>

                                            <CardContent className="p-6 flex-1 flex flex-col">
                                                <div className="flex items-start justify-between gap-4 mb-4">
                                                    <div>
                                                        <h3 className="text-xl font-bold leading-tight mb-2 group-hover:text-primary transition-colors line-clamp-2">
                                                            {item.title}
                                                        </h3>
                                                        <p className="text-sm text-muted-foreground line-clamp-2">
                                                            {item.description}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="mt-auto pt-6 border-t border-border/50">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                                            <User className="h-5 w-5 text-primary" />
                                                        </div>
                                                        <div>
                                                            <div className="font-semibold text-sm">{item.expertName}</div>
                                                            <div className="text-xs text-muted-foreground">{item.designation} @ {item.company}</div>
                                                        </div>
                                                        {item.linkedinUrl && (
                                                            <Link
                                                                href={item.linkedinUrl}
                                                                target="_blank"
                                                                onClick={(e) => e.stopPropagation()}
                                                                className="ml-auto text-muted-foreground hover:text-[#0077b5] transition-colors"
                                                            >
                                                                <Linkedin className="h-5 w-5" />
                                                            </Link>
                                                        )}
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-4xl p-0 overflow-hidden bg-black border-none">
                                        <div className="aspect-video w-full">
                                            {/* Support mostly YouTube embeds for now */}
                                            {item.videoUrl.includes('youtube') || item.videoUrl.includes('youtu.be') ? (
                                                <iframe
                                                    width="100%"
                                                    height="100%"
                                                    src={item.videoUrl.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')}
                                                    title={item.title}
                                                    frameBorder="0"
                                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                    allowFullScreen
                                                />
                                            ) : (
                                                <video src={item.videoUrl} controls className="w-full h-full" />
                                            )}
                                        </div>
                                        <div className="p-6 bg-card">
                                            <h2 className="text-2xl font-bold mb-2">{item.title}</h2>
                                            <p className="text-muted-foreground">{item.description}</p>
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            </motion.div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    )
}
