"use client"

import * as React from 'react'
import Link from 'next/link'
import {
    Cpu,
    Building,
    TrendingUp,
    XCircle,
    AlertTriangle,
    MessageCircle,
    Brain,
    Code2,
    Mic,
    Target,
    Terminal,
    BarChart3,
    Check,
    Share2,
    Copy,
    Mail,
    Linkedin,
    Twitter
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'

export default function ForCollegesPage() {
    const [referralLink] = React.useState('https://techwell.co.in/join?ref=YOUR_COLLEGE_CODE')

    const copyReferralLink = () => {
        navigator.clipboard.writeText(referralLink)
        alert('Referral link copied!')
    }

    const shareVia = (platform: string) => {
        const text = encodeURIComponent('Prepare for your interviews with TechWell - AI-powered mock interviews!')
        const link = encodeURIComponent(referralLink)

        let url = ''
        switch (platform) {
            case 'whatsapp':
                url = `https://wa.me/?text=${text}%20${link}`
                break
            case 'email':
                url = `mailto:?subject=Interview Preparation with TechWell&body=${text}%0A%0A${link}`
                break
            case 'linkedin':
                url = `https://www.linkedin.com/sharing/share-offsite/?url=${link}`
                break
            case 'twitter':
                url = `https://twitter.com/intent/tweet?text=${text}&url=${link}`
                break
        }
        window.open(url, '_blank')
    }

    const handleCollegeForm = (e: React.FormEvent) => {
        e.preventDefault()
        alert('Thank you for your interest! Our team will contact you within 24 hours.')
    }

    return (
        <div className="bg-background text-foreground min-h-screen font-sans">
            <main>
                {/* Hero Section */}
                <section className="relative py-24 overflow-hidden border-b">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10"></div>
                    <div className="max-w-7xl mx-auto px-4 relative">
                        <div className="grid lg:grid-cols-2 gap-12 items-center">
                            <div>
                                <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/20 rounded-full text-primary text-sm font-bold mb-6">
                                    <Building className="w-4 h-4" /> For Educational Institutions
                                </div>
                                <h1 className="text-4xl lg:text-6xl font-bold mb-6 leading-tight">
                                    Transform Your Students Into <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Interview Champions</span>
                                </h1>
                                <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                                    Partner with TechWell to revolutionize your placement cell. Our AI-powered platform helps students build confidence, master technical skills, and ace interviews at top companies.
                                </p>
                                <div className="flex flex-wrap gap-4">
                                    <Button size="lg" className="rounded-full shadow-lg shadow-primary/20" asChild>
                                        <a href="#contact">Schedule a Demo</a>
                                    </Button>
                                    <Button size="lg" variant="outline" className="rounded-full" asChild>
                                        <a href="#features">Learn More</a>
                                    </Button>
                                </div>
                            </div>
                            <div className="relative">
                                <Card className="p-8 border-primary/20 bg-card/50 backdrop-blur-xl">
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
                                        <div className="bg-muted p-4 rounded-xl text-center">
                                            <p className="text-3xl font-bold text-primary">500+</p>
                                            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Partner Colleges</p>
                                        </div>
                                        <div className="bg-muted p-4 rounded-xl text-center">
                                            <p className="text-3xl font-bold text-secondary">2M+</p>
                                            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Students Trained</p>
                                        </div>
                                        <div className="bg-muted p-4 rounded-xl text-center">
                                            <p className="text-3xl font-bold text-rose-500">92%</p>
                                            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Student Satisfaction</p>
                                        </div>
                                        <div className="bg-muted p-4 rounded-xl text-center">
                                            <p className="text-3xl font-bold text-yellow-500">4.9★</p>
                                            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Average Rating</p>
                                        </div>
                                    </div>
                                </Card>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Problem Statement */}
                <section className="py-20 bg-muted/30">
                    <div className="max-w-7xl mx-auto px-4">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-4xl font-bold mb-4">The Placement Challenge</h2>
                            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Most students struggle not because they lack knowledge, but because they lack interview preparation.</p>
                        </div>
                        <div className="grid md:grid-cols-3 gap-8">
                            <Card className="p-8 border-red-500/10 bg-red-500/5 transition-all hover:scale-105">
                                <div className="w-14 h-14 bg-red-500/20 rounded-2xl flex items-center justify-center mb-4">
                                    <XCircle className="w-7 h-7 text-red-500" />
                                </div>
                                <h3 className="text-xl font-bold mb-2">Interview Anxiety</h3>
                                <p className="text-sm text-muted-foreground">70% of students experience severe anxiety during interviews, affecting their performance.</p>
                            </Card>
                            <Card className="p-8 border-yellow-500/10 bg-yellow-500/5 transition-all hover:scale-105">
                                <div className="w-14 h-14 bg-yellow-500/20 rounded-2xl flex items-center justify-center mb-4">
                                    <AlertTriangle className="w-7 h-7 text-yellow-500" />
                                </div>
                                <h3 className="text-xl font-bold mb-2">Lack of Practice</h3>
                                <p className="text-sm text-muted-foreground">Students rarely get real interview practice before facing actual recruiters.</p>
                            </Card>
                            <Card className="p-8 border-orange-500/10 bg-orange-500/5 transition-all hover:scale-105">
                                <div className="w-14 h-14 bg-orange-500/20 rounded-2xl flex items-center justify-center mb-4">
                                    <MessageCircle className="w-7 h-7 text-orange-500" />
                                </div>
                                <h3 className="text-xl font-bold mb-2">Communication Gap</h3>
                                <p className="text-sm text-muted-foreground">Technical skills are there, but articulation and soft skills need development.</p>
                            </Card>
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section id="features" className="py-24">
                    <div className="max-w-7xl mx-auto px-4">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-4xl font-bold mb-4">How TechWell Helps Your Students</h2>
                            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">A comprehensive platform designed to develop industry-ready professionals.</p>
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {[
                                { icon: Brain, title: "Build Self-Confidence", colorClass: "bg-primary/10 text-primary", desc: "Unlimited practice sessions help students overcome interview anxiety and build unshakeable confidence.", items: ["Safe practice environment", "Instant AI feedback", "Progress tracking"] },
                                { icon: Code2, title: "Technical Skills", colorClass: "bg-secondary/10 text-secondary", desc: "Role-specific technical questions covering data structures, algorithms, system design, and more.", items: ["Coding challenges", "System design questions", "Domain-specific prep"] },
                                { icon: Mic, title: "Communication Skills", colorClass: "bg-rose-500/10 text-rose-500", desc: "Real-time speech analysis helps students articulate their thoughts clearly and professionally.", items: ["Voice recognition", "Clarity scoring", "Vocabulary enhancement"] },
                                { icon: Target, title: "Domain Expertise", colorClass: "bg-green-500/10 text-green-500", desc: "Customized interview prep for IT, Finance, Healthcare, Marketing, and more industries.", items: ["Industry-specific questions", "Company research", "Role simulations"] },
                                { icon: Terminal, title: "Coding Practice", colorClass: "bg-yellow-500/10 text-yellow-500", desc: "Integrated coding environment for live coding rounds with real-time evaluation.", items: ["DSA problems", "Multiple languages", "Timed challenges"] },
                                { icon: BarChart3, title: "Placement Analytics", colorClass: "bg-blue-500/10 text-blue-500", desc: "Comprehensive dashboard for placement officers to track student progress and placement readiness.", items: ["Batch analytics", "Skills gap report", "Readiness scores"] },
                            ].map((feature, i) => (
                                <Card key={i} className="p-8 transition-all hover:shadow-xl hover:-translate-y-1">
                                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 ${feature.colorClass.split(' ')[0]}`}>
                                        <feature.icon className={`w-8 h-8 ${feature.colorClass.split(' ')[1]}`} />
                                    </div>
                                    <h3 className="text-2xl font-bold mb-3">{feature.title}</h3>
                                    <p className="text-muted-foreground leading-relaxed mb-4">{feature.desc}</p>
                                    <ul className="space-y-2 text-sm">
                                        {feature.items.map((item, j) => (
                                            <li key={j} className="flex items-center gap-2 text-muted-foreground">
                                                <Check className="w-4 h-4 text-green-500" /> {item}
                                            </li>
                                        ))}
                                    </ul>
                                </Card>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Results Section */}
                <section className="py-24 bg-primary/5">
                    <div className="max-w-7xl mx-auto px-4">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-4xl font-bold mb-4">Real Results for Real Colleges</h2>
                            <p className="text-lg text-muted-foreground">See how our partner institutions have transformed their placement outcomes.</p>
                        </div>

                        <div className="grid md:grid-cols-4 gap-8 mb-24">
                            {[
                                { val: "47%", label: "Higher Placement Rate", from: "from-primary", to: "to-secondary" },
                                { val: "3x", label: "More Mock Interviews", from: "from-secondary", to: "to-rose-500" },
                                { val: "85%", label: "Confidence Increase", from: "from-rose-500", to: "to-yellow-500" },
                                { val: "₹2L+", label: "Avg Package Increase", from: "from-yellow-500", to: "to-green-500" },
                            ].map((stat, i) => (
                                <div key={i} className="text-center">
                                    <p className={`text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r ${stat.from} ${stat.to}`}>
                                        {stat.val}
                                    </p>
                                    <p className="text-muted-foreground mt-2 font-medium">{stat.label}</p>
                                </div>
                            ))}
                        </div>

                        <div className="grid md:grid-cols-2 gap-8">
                            <Card className="p-8 border-primary/10">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                                        <span className="text-xl font-bold text-primary">ID</span>
                                    </div>
                                    <div>
                                        <p className="font-bold">IIT Delhi</p>
                                        <p className="text-xs text-muted-foreground uppercase">Training & Placement Cell</p>
                                    </div>
                                </div>
                                <p className="text-muted-foreground italic">&quot;TechWell has become an integral part of our placement preparation. Students are more confident and better prepared than ever before.&quot;</p>
                            </Card>
                            <Card className="p-8 border-secondary/10">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-12 h-12 bg-secondary/20 rounded-full flex items-center justify-center">
                                        <span className="text-xl font-bold text-secondary">VV</span>
                                    </div>
                                    <div>
                                        <p className="font-bold">VIT Vellore</p>
                                        <p className="text-xs text-muted-foreground uppercase">Career Development Centre</p>
                                    </div>
                                </div>
                                <p className="text-muted-foreground italic">&quot;We&apos;ve seen a remarkable improvement in student placement rates. The AI-powered feedback is incredibly valuable.&quot;</p>
                            </Card>
                        </div>
                    </div>
                </section>

                {/* Refer Section */}
                <section className="py-24" id="share">
                    <div className="max-w-4xl mx-auto px-4">
                        <Card className="p-12 border-primary/30 bg-primary/5 text-center rounded-3xl">
                            <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Share2 className="w-10 h-10 text-primary" />
                            </div>
                            <h2 className="text-3xl font-bold mb-4">Share with Your Students</h2>
                            <p className="text-lg text-muted-foreground mb-8">Get your unique referral link and invite students to start their interview preparation journey.</p>

                            <div className="flex gap-4 max-w-xl mx-auto mb-8">
                                <Input
                                    value={referralLink}
                                    readOnly
                                    className="bg-background flex-1"
                                />
                                <Button onClick={copyReferralLink} className="gap-2 shrink-0">
                                    <Copy className="w-4 h-4" /> Copy
                                </Button>
                            </div>

                            <div className="flex justify-center gap-4">
                                {[
                                    { platform: 'whatsapp', icon: MessageCircle, color: 'text-green-500', hover: 'hover:bg-green-500/10 hover:border-green-500/50' },
                                    { platform: 'email', icon: Mail, color: 'text-blue-500', hover: 'hover:bg-blue-500/10 hover:border-blue-500/50' },
                                    { platform: 'linkedin', icon: Linkedin, color: 'text-indigo-500', hover: 'hover:bg-indigo-500/10 hover:border-indigo-500/50' },
                                    { platform: 'twitter', icon: Twitter, color: 'text-sky-500', hover: 'hover:bg-sky-500/10 hover:border-sky-500/50' }
                                ].map((s, i) => (
                                    <Button key={i} variant="outline" size="icon" className={`h-12 w-12 ${s.hover}`} onClick={() => shareVia(s.platform)}>
                                        <s.icon className={`w-6 h-6 ${s.color}`} />
                                    </Button>
                                ))}
                            </div>
                        </Card>
                    </div>
                </section>

                {/* Contact Form */}
                <section id="contact" className="py-24 border-t">
                    <div className="max-w-3xl mx-auto px-4">
                        <div className="text-center mb-12">
                            <h2 className="text-4xl font-bold mb-4">Partner With Us</h2>
                            <p className="text-xl text-muted-foreground">Fill out the form and our team will reach out within 24 hours.</p>
                        </div>

                        <Card className="p-8 border-primary/10 shadow-2xl">
                            <form className="space-y-6" onSubmit={handleCollegeForm}>
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">College Name *</label>
                                        <Input required placeholder="Enter college name" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Your Name *</label>
                                        <Input required placeholder="Your full name" />
                                    </div>
                                </div>
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Email *</label>
                                        <Input type="email" required placeholder="name@college.edu" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Phone *</label>
                                        <Input type="tel" required placeholder="+91 ..." />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="student-count" className="text-sm font-medium">Number of Students</label>
                                    <select
                                        id="student-count"
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        <option>Less than 100</option>
                                        <option>100 - 500</option>
                                        <option>500 - 1000</option>
                                        <option>1000+</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Message</label>
                                    <textarea
                                        className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        placeholder="Tell us about your placement goals..."
                                    />
                                </div>
                                <Button type="submit" size="lg" className="w-full text-lg shadow-xl shadow-primary/20">
                                    Request a Demo
                                </Button>
                            </form>
                        </Card>
                    </div>
                </section>
            </main>
        </div>
    )
}
