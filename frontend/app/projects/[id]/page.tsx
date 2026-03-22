"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import { motion } from "framer-motion"
import { ArrowLeft, CheckCircle2, Download, ExternalLink, ShieldCheck, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"

export default function ProjectDetailsPage() {
    const params = useParams()
    const router = useRouter()
    const [project, setProject] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (params.id) {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
            fetch(`${API_URL}/projects/${params.id}`)
                .then(res => res.json())
                .then(data => {
                    setProject(data)
                    setLoading(false)
                })
                .catch(err => {
                    console.error(err)
                    setLoading(false)
                })
        }
    }, [params.id])

    if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div></div>
    if (!project) return <div className="min-h-screen flex items-center justify-center">Project not found</div>

    const features = Array.isArray(project.features) ? project.features : []
    const techStack = Array.isArray(project.techStack) ? project.techStack : []

    return (
        <div className="min-h-screen bg-background pb-20">
            {/* Header / Breadcrumb */}
            <div className="container py-6">
                <Button variant="ghost" className="gap-2 mb-4" onClick={() => router.back()}>
                    <ArrowLeft className="w-4 h-4" /> Back to Projects
                </Button>
            </div>

            <div className="container px-4">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    {/* Left Column: Image & Details */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Project Image */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="relative aspect-video rounded-3xl overflow-hidden border border-border/50 shadow-2xl"
                        >
                            <Image
                                src={project.image || "/images/placeholder-project.jpg"}
                                alt={project.title}
                                fill
                                className="object-cover"
                            />
                            <div className="absolute top-4 left-4">
                                <Badge className="bg-primary/90 text-primary-foreground backdrop-blur-md border-none px-3 py-1 text-sm">
                                    {project.category}
                                </Badge>
                            </div>
                        </motion.div>

                        {/* Title & Description */}
                        <div>
                            <h1 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight">{project.title}</h1>
                            <p className="text-xl text-muted-foreground leading-relaxed">{project.description}</p>
                        </div>

                        {/* Features Grid */}
                        {features.length > 0 && (
                            <div>
                                <h3 className="text-2xl font-semibold mb-6 flex items-center gap-2">
                                    <Zap className="w-6 h-6 text-yellow-500" /> Key Features
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {features.map((feature: string, i: number) => (
                                        <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-card border border-border/50">
                                            <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
                                            <span className="text-card-foreground">{feature}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Technical Details / Report Snapshot */}
                        <div>
                            <h3 className="text-2xl font-semibold mb-6 flex items-center gap-2">
                                <ShieldCheck className="w-6 h-6 text-blue-500" /> Project Specifications
                            </h3>
                            <Card className="bg-muted/30 border-none">
                                <CardContent className="p-6 space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
                                        <div>
                                            <label className="text-sm font-medium text-muted-foreground block mb-1">Tech Stack / Tools</label>
                                            <div className="flex flex-wrap gap-2">
                                                {techStack.map((tech: string, i: number) => (
                                                    <Badge key={i} variant="outline" className="bg-background">{tech}</Badge>
                                                ))}
                                            </div>
                                        </div>
                                        {project.capex && (
                                            <div>
                                                <label className="text-sm font-medium text-muted-foreground block mb-1">Estimated CAPEX / Cost</label>
                                                <div className="text-lg font-semibold">{project.capex}</div>
                                            </div>
                                        )}
                                        {project.roi && (
                                            <div>
                                                <label className="text-sm font-medium text-muted-foreground block mb-1">Projected ROI</label>
                                                <div className="text-lg font-semibold text-green-600">{project.roi}</div>
                                            </div>
                                        )}
                                        <div>
                                            <label className="text-sm font-medium text-muted-foreground block mb-1">Project Type</label>
                                            <div className="text-lg font-medium capitalize">{project.projectType?.replace('_', ' ').toLowerCase() || "Standard"}</div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Right Column: Pricing & CTA */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-24">
                            <Card className="border-border/50 shadow-xl bg-card/50 backdrop-blur-xl overflow-hidden">
                                <div className="p-6 md:p-8 space-y-6">
                                    <div>
                                        <div className="text-sm text-muted-foreground mb-1">Total Project Cost</div>
                                        <div className="flex items-baseline gap-3">
                                            <span className="text-4xl font-bold text-primary">{project.price}</span>
                                            {project.originalPrice && (
                                                <span className="text-xl text-muted-foreground line-through decoration-red-500/50">{project.originalPrice}</span>
                                            )}
                                        </div>
                                        <p className="text-xs text-green-600 font-medium mt-2 bg-green-500/10 inline-block px-2 py-1 rounded">
                                            Includes Source Code & Documentation
                                        </p>
                                    </div>

                                    <div className="space-y-3">
                                        <Button className="w-full h-12 text-lg font-semibold shadow-lg shadow-primary/25" size="lg">
                                            Buy Project Now
                                        </Button>
                                        {project.demoLink && (
                                            <Button variant="outline" className="w-full h-12" asChild>
                                                <a href={project.demoLink} target="_blank" rel="noopener noreferrer">
                                                    <ExternalLink className="w-4 h-4 mr-2" /> Live Demo
                                                </a>
                                            </Button>
                                        )}
                                    </div>

                                    <Separator />

                                    <div className="space-y-4">
                                        <h4 className="font-semibold text-sm">What&apos;s Included:</h4>
                                        <ul className="space-y-3 text-sm text-muted-foreground">
                                            <li className="flex gap-2">
                                                <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                                                Complete Source Code
                                            </li>
                                            <li className="flex gap-2">
                                                <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                                                Project Report (PDF/Word)
                                            </li>
                                            <li className="flex gap-2">
                                                <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                                                Database Schema & Setup Guide
                                            </li>
                                            <li className="flex gap-2">
                                                <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                                                Video Explanation / Walkthrough
                                            </li>
                                            {project.projectType?.includes('DPR') && (
                                                <li className="flex gap-2">
                                                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                                                    Bankable Financial Projections
                                                </li>
                                            )}
                                        </ul>
                                    </div>

                                    <div className="bg-muted/50 rounded-lg p-4 text-xs text-muted-foreground text-center">
                                        <p>Secure payment via Razorpay/Stripe.</p>
                                        <p>Instant download after purchase.</p>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
