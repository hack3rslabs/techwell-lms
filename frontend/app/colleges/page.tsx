"use client"

import * as React from "react"
import Link from "next/link"
import {
    Cpu, Building, TrendingUp, XCircle, AlertTriangle,
    MessageCircle, Brain, Code2, Mic, Target, Terminal,
    BarChart3, Share2, Copy, Mail, Linkedin, Twitter, Check
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card } from "@/components/ui/card"
// import { toast } from "sonner"

export default function CollegesPage() {
    const [referralLink] = React.useState("https://elevateai.com/join?ref=YOUR_COLLEGE_CODE")

    const copyReferralLink = () => {
        navigator.clipboard.writeText(referralLink)
        // alert('Referral link copied!') 
        // Using simple alert for now as per original HTML, or better:
        window.alert("Referral link copied!")
    }

    const shareVia = (platform: string) => {
        const text = encodeURIComponent('Prepare for your interviews with ElevateAI - AI-powered mock interviews!')
        const link = encodeURIComponent(referralLink)
        let url = ''

        switch (platform) {
            case 'whatsapp':
                url = `https://wa.me/?text=${text}%20${link}`
                break
            case 'email':
                url = `mailto:?subject=Interview Preparation with ElevateAI&body=${text}%0A%0A${link}`
                break
            case 'linkedin':
                url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent('https://www.linkedin.com/in/techwell-it')}`
                break
            case 'twitter':
                url = `https://twitter.com/intent/tweet?text=${text}&url=${link}`
                break
        }
        window.open(url, '_blank')
    }

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        window.alert("Thank you for your interest! Our team will contact you within 24 hours.")
    }

    return (
        <div className="bg-background min-h-screen">
            {/* Hero Section */}
            <section className="relative py-24 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-secondary/20 pointer-events-none"></div>
                <div className="container relative">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/20 rounded-full text-primary text-sm font-bold mb-6">
                                <Building className="w-4 h-4" /> For Educational Institutions
                            </div>
                            <h1 className="text-5xl lg:text-6xl font-bold tracking-tight mb-6 leading-tight">
                                Transform Your Students Into <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Interview Champions</span>
                            </h1>
                            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                                Partner with ElevateAI to revolutionize your placement cell. Our AI-powered platform helps
                                students build confidence, master technical skills, and ace interviews at top companies.
                            </p>
                            <div className="flex flex-wrap gap-4">
                                <Button size="lg" className="rounded-full text-lg px-8 py-6 bg-gradient-to-r from-primary to-secondary hover:scale-105 transition-transform">
                                    <a href="#contact">Schedule a Demo</a>
                                </Button>
                                <Button variant="outline" size="lg" className="rounded-full text-lg px-8 py-6">
                                    <a href="#features">Learn More</a>
                                </Button>
                            </div>
                        </div>
                        <div className="relative">
                            <div className="bg-card/50 backdrop-blur-sm rounded-3xl p-8 border border-white/10 shadow-xl">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-16 h-16 bg-green-500/20 rounded-2xl flex items-center justify-center">
                                        <TrendingUp className="w-8 h-8 text-green-500" />
                                    </div>
                                    <div>
                                        <p className="text-4xl font-bold text-green-500">47%</p>
                                        <p className="text-muted-foreground">Average Placement Rate Increase</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-background/50 rounded-xl p-4 text-center">
                                        <p className="text-3xl font-bold text-primary">500+</p>
                                        <p className="text-xs text-muted-foreground">Partner Colleges</p>
                                    </div>
                                    <div className="bg-background/50 rounded-xl p-4 text-center">
                                        <p className="text-3xl font-bold text-secondary">2M+</p>
                                        <p className="text-xs text-muted-foreground">Students Trained</p>
                                    </div>
                                    <div className="bg-background/50 rounded-xl p-4 text-center">
                                        <p className="text-3xl font-bold text-pink-500">92%</p>
                                        <p className="text-xs text-muted-foreground">Student Satisfaction</p>
                                    </div>
                                    <div className="bg-background/50 rounded-xl p-4 text-center">
                                        <p className="text-3xl font-bold text-yellow-400">4.9★</p>
                                        <p className="text-xs text-muted-foreground">Average Rating</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Problem Statement */}
            <section className="py-20 bg-muted/50">
                <div className="container">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold mb-4">The Placement Challenge</h2>
                        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                            Most students struggle not because they lack knowledge, but because they lack interview preparation.
                        </p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8">
                        <Card className="p-8 border-red-500/20 bg-red-500/5">
                            <div className="w-14 h-14 bg-red-500/20 rounded-2xl flex items-center justify-center mb-4">
                                <XCircle className="w-7 h-7 text-red-500" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">Interview Anxiety</h3>
                            <p className="text-muted-foreground">70% of students experience severe anxiety during interviews, affecting their performance.</p>
                        </Card>
                        <Card className="p-8 border-yellow-500/20 bg-yellow-500/5">
                            <div className="w-14 h-14 bg-yellow-500/20 rounded-2xl flex items-center justify-center mb-4">
                                <AlertTriangle className="w-7 h-7 text-yellow-500" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">Lack of Practice</h3>
                            <p className="text-muted-foreground">Students rarely get real interview practice before facing actual recruiters.</p>
                        </Card>
                        <Card className="p-8 border-orange-500/20 bg-orange-500/5">
                            <div className="w-14 h-14 bg-orange-500/20 rounded-2xl flex items-center justify-center mb-4">
                                <MessageCircle className="w-7 h-7 text-orange-500" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">Communication Gap</h3>
                            <p className="text-muted-foreground">Technical skills are there, but articulation and soft skills need development.</p>
                        </Card>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-24">
                <div className="container">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold mb-4">How ElevateAI Helps Your Students</h2>
                        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                            A comprehensive platform designed to develop industry-ready professionals.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[
                            {
                                icon: Brain, color: "text-primary", bg: "bg-primary/20", border: "hover:border-primary/50",
                                title: "Build Self-Confidence", desc: "Unlimited practice sessions help students overcome interview anxiety and build unshakeable confidence."
                            },
                            {
                                icon: Code2, color: "text-secondary", bg: "bg-secondary/20", border: "hover:border-secondary/50",
                                title: "Technical Skills", desc: "Role-specific technical questions covering data structures, algorithms, system design, and more."
                            },
                            {
                                icon: Mic, color: "text-pink-500", bg: "bg-pink-500/20", border: "hover:border-pink-500/50",
                                title: "Communication Skills", desc: "Real-time speech analysis helps students articulate their thoughts clearly and professionally."
                            },
                            {
                                icon: Target, color: "text-green-500", bg: "bg-green-500/20", border: "hover:border-green-500/50",
                                title: "Domain Expertise", desc: "Customized interview prep for IT, Finance, Healthcare, Marketing, and more industries."
                            },
                            {
                                icon: Terminal, color: "text-yellow-500", bg: "bg-yellow-500/20", border: "hover:border-yellow-500/50",
                                title: "Coding Practice", desc: "Integrated coding environment for live coding rounds with real-time evaluation."
                            },
                            {
                                icon: BarChart3, color: "text-blue-500", bg: "bg-blue-500/20", border: "hover:border-blue-500/50",
                                title: "Placement Analytics", desc: "Comprehensive dashboard for placement officers to track student progress and placement readiness."
                            }
                        ].map((feature, i) => (
                            <div key={i} className={`p-8 rounded-3xl border border-muted bg-card hover:bg-muted/50 transition-all group ${feature.border}`}>
                                <div className={`w-16 h-16 ${feature.bg} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                                    <feature.icon className={`w-8 h-8 ${feature.color}`} />
                                </div>
                                <h3 className="text-2xl font-bold mb-3">{feature.title}</h3>
                                <p className="text-muted-foreground leading-relaxed">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Results Section */}
            <section className="py-24 bg-gradient-to-br from-primary/10 to-secondary/10">
                <div className="container">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold mb-4">Real Results for Real Colleges</h2>
                        <p className="text-xl text-muted-foreground">See how our partner institutions have transformed their placement outcomes.</p>
                    </div>

                    <div className="grid md:grid-cols-4 gap-8 mb-16">
                        {[
                            { val: "47%", label: "Higher Placement Rate", grad: "from-primary to-secondary" },
                            { val: "3x", label: "More Mock Interviews", grad: "from-secondary to-pink-500" },
                            { val: "85%", label: "Confidence Increase", grad: "from-pink-500 to-yellow-500" },
                            { val: "₹2L+", label: "Avg Package Increase", grad: "from-yellow-500 to-green-500" }
                        ].map((stat, i) => (
                            <div key={i} className="text-center">
                                <p className={`text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r ${stat.grad}`}>
                                    {stat.val}
                                </p>
                                <p className="text-muted-foreground mt-2">{stat.label}</p>
                            </div>
                        ))}
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="bg-card/40 backdrop-blur p-8 rounded-2xl border border-white/10">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                                    <Check className="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                    <p className="font-bold">Increased Placement Efficiency</p>
                                    <p className="text-sm text-muted-foreground">Streamlined mock interviews and progress tracking.</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-card/40 backdrop-blur p-8 rounded-2xl border border-white/10">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 bg-secondary/20 rounded-full flex items-center justify-center">
                                    <TrendingUp className="w-6 h-6 text-secondary" />
                                </div>
                                <div>
                                    <p className="font-bold">Student Success Focused</p>
                                    <p className="text-sm text-muted-foreground">Personalized feedback for every candidate.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
           

            {/* Share Section */}
            <section className="py-24" id="share">
                <div className="container max-w-4xl">
                    <div className="bg-primary/5 rounded-3xl p-12 border border-primary/20 text-center">
                        <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Share2 className="w-10 h-10 text-primary" />
                        </div>
                        <h2 className="text-4xl font-bold mb-4">Share with Your Students</h2>
                        <p className="text-xl text-muted-foreground mb-8">Get your unique referral link and invite students to start their interview preparation journey.</p>

                        <div className="flex gap-4 max-w-xl mx-auto mb-8">
                            <Input readOnly value={referralLink} className="bg-background/50 h-12" />
                            <Button onClick={copyReferralLink} size="lg" className="h-12 px-6">
                                <Copy className="w-4 h-4 mr-2" /> Copy
                            </Button>
                        </div>

                        <div className="flex justify-center gap-4">
                            <Button variant="ghost" className="h-14 w-14 rounded-xl bg-green-500/10 hover:bg-green-500/20 text-green-600" onClick={() => shareVia('whatsapp')}>
                                <MessageCircle className="w-6 h-6" />
                            </Button>
                            <Button variant="ghost" className="h-14 w-14 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-600" onClick={() => shareVia('email')}>
                                <Mail className="w-6 h-6" />
                            </Button>
                            <Button variant="ghost" className="h-14 w-14 rounded-xl bg-blue-700/10 hover:bg-blue-700/20 text-blue-700" onClick={() => shareVia('linkedin')}>
                                <Linkedin className="w-6 h-6" />
                            </Button>
                            <Button variant="ghost" className="h-14 w-14 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-500" onClick={() => shareVia('twitter')}>
                                <Twitter className="w-6 h-6" />
                            </Button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Contact Form */}
            <section id="contact" className="py-24 border-t">
                <div className="max-w-3xl mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-bold mb-4">Partner With Us</h2>
                        <p className="text-xl text-muted-foreground">Fill out the form and our team will reach out within 24 hours.</p>
                    </div>

                    <form onSubmit={handleFormSubmit} className="bg-card border rounded-3xl p-8 space-y-6 shadow-sm">
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">College Name *</label>
                                <Input required placeholder="University of Technology" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Your Name *</label>
                                <Input required placeholder="John Doe" />
                            </div>
                        </div>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Email *</label>
                                <Input required type="email" placeholder="john@university.edu" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Phone *</label>
                                <Input required type="tel" placeholder="+91 98765 43210" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Number of Students</label>
                            <Select>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select batch size" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="<100">Less than 100</SelectItem>
                                    <SelectItem value="100-500">100 - 500</SelectItem>
                                    <SelectItem value="500-1000">500 - 1000</SelectItem>
                                    <SelectItem value="1000+">1000+</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Message</label>
                            <Textarea placeholder="Tell us about your placement goals..." rows={4} />
                        </div>
                        <Button type="submit" size="lg" className="w-full h-14 text-lg bg-gradient-to-r from-primary to-secondary font-bold">
                            Request a Demo
                        </Button>
                    </form>
                </div>
            </section>
        </div>
    )
}

