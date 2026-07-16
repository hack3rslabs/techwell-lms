"use client"

import * as React from 'react'
import Link from 'next/link'
import { Compass, GraduationCap, Rocket, TrendingUp, Crown, FileText, Video, BookOpen, Check, ArrowLeft } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

const careerStages = [
    {
        icon: GraduationCap,
        title: 'Student',
        description: 'Build foundation, learn core skills, get internships',
        color: 'green'
    },
    {
        icon: Rocket,
        title: 'Fresher',
        description: 'First job hunt, resume building, interview prep',
        color: 'blue'
    },
    {
        icon: TrendingUp,
        title: 'Professional',
        description: 'Career growth, skill upgrades, leadership',
        color: 'purple'
    },
    {
        icon: Crown,
        title: 'Leader',
        description: 'Management, strategy, team building',
        color: 'orange'
    }
]

const resources = [
    {
        icon: FileText,
        title: 'Resume Templates',
        description: 'ATS-friendly resume templates for different roles and experience levels.',
        link: '#',
        linkText: 'Download Free →'
    },
    {
        icon: Video,
        title: 'Mock Interviews',
        description: 'Practice with AI-powered interviewers tailored to your target role.',
        link: '/interviews',
        linkText: 'Start Practicing →'
    },
    {
        icon: BookOpen,
        title: 'Interview Guides',
        description: 'Comprehensive guides for technical, behavioral, and HR rounds.',
        link: '/blog',
        linkText: 'Read Guides →'
    }
]

export default function CareerGuidePage() {
    const [formData, setFormData] = React.useState({
        name: '',
        email: '',
        phone: '',
        status: 'student',
        role: '',
        message: ''
    })
    const [submitted, setSubmitted] = React.useState(false)

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        // Simulate form submission
        console.log('Career enquiry:', formData)
        setSubmitted(true)
        setTimeout(() => {
            setSubmitted(false)
            setFormData({ name: '', email: '', phone: '', status: 'student', role: '', message: '' })
        }, 3000)
    }

    return (
        <div className="min-h-screen py-20">
            <div className="container max-w-6xl">
                {/* Header */}
                <div className="text-center mb-16">
                    <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center mx-auto mb-6">
                        <Compass className="h-10 w-10 text-white" />
                    </div>
                    <h1 className="text-5xl font-bold mb-4">Career Guide</h1>
                    <p className="text-xl text-muted-foreground">Your roadmap to a successful tech career</p>
                </div>

                {/* Career Stages */}
                <div className="grid md:grid-cols-4 gap-6 mb-16">
                    {careerStages.map((stage, idx) => (
                        <Card key={idx} className="text-center hover:border-primary/50 transition-all">
                            <CardContent className="pt-6">
                                <div className={`h-16 w-16 bg-${stage.color}-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                                    <stage.icon className={`h-8 w-8 text-${stage.color}-500`} />
                                </div>
                                <h3 className="font-bold mb-2">{stage.title}</h3>
                                <p className="text-sm text-muted-foreground">{stage.description}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Resources Grid */}
                <h2 className="text-3xl font-bold mb-8 text-center">Career Resources</h2>
                <div className="grid md:grid-cols-3 gap-6 mb-16">
                    {resources.map((resource, idx) => (
                        <Card key={idx}>
                            <CardContent className="pt-6">
                                <resource.icon className="h-10 w-10 text-primary mb-4" />
                                <h3 className="font-bold text-lg mb-2">{resource.title}</h3>
                                <p className="text-muted-foreground text-sm mb-4">{resource.description}</p>
                                <Link href={resource.link} className="text-primary text-sm hover:underline">
                                    {resource.linkText}
                                </Link>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Enquiry Form */}
                <Card className="border-primary/30">
                    <CardContent className="pt-8">
                        <div className="grid md:grid-cols-2 gap-12">
                            <div>
                                <h2 className="text-3xl font-bold mb-4">Need Personalized Guidance?</h2>
                                <p className="text-muted-foreground mb-6">
                                    Fill out the enquiry form and our career experts will reach out to
                                    you with customized advice for your situation.
                                </p>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                                            <Check className="h-5 w-5 text-green-500" />
                                        </div>
                                        <p className="text-sm">Free 15-minute career consultation</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                                            <Check className="h-5 w-5 text-green-500" />
                                        </div>
                                        <p className="text-sm">Resume review by industry experts</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                                            <Check className="h-5 w-5 text-green-500" />
                                        </div>
                                        <p className="text-sm">Personalized interview preparation plan</p>
                                    </div>
                                </div>
                            </div>
                            <div>
                                {submitted ? (
                                    <div className="h-full flex items-center justify-center">
                                        <div className="text-center">
                                            <div className="h-16 w-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                                <Check className="h-8 w-8 text-green-500" />
                                            </div>
                                            <h3 className="text-xl font-bold mb-2">Thank You!</h3>
                                            <p className="text-muted-foreground">Our career experts will contact you within 24 hours.</p>
                                        </div>
                                    </div>
                                ) : (
                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm text-muted-foreground mb-2">Full Name *</label>
                                                <Input
                                                    value={formData.name}
                                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm text-muted-foreground mb-2">Email *</label>
                                                <Input
                                                    type="email"
                                                    value={formData.email}
                                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm text-muted-foreground mb-2">Phone</label>
                                                <Input
                                                    type="tel"
                                                    value={formData.phone}
                                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm text-muted-foreground mb-2">Current Status</label>
                                                <select
                                                    value={formData.status}
                                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                                                >
                                                    <option value="student">Student</option>
                                                    <option value="fresher">Fresher</option>
                                                    <option value="experienced">Experienced (1-3 yrs)</option>
                                                    <option value="senior">Senior (3+ yrs)</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm text-muted-foreground mb-2">Target Role</label>
                                            <Input
                                                placeholder="e.g., Software Engineer, Data Scientist"
                                                value={formData.role}
                                                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm text-muted-foreground mb-2">How can we help? *</label>
                                            <Textarea
                                                placeholder="Describe your career goals or challenges..."
                                                value={formData.message}
                                                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                                required
                                                rows={3}
                                            />
                                        </div>
                                        <Button type="submit" className="w-full" size="lg">
                                            Submit Enquiry
                                        </Button>
                                    </form>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Back Link */}
                <div className="mt-12 text-center">
                    <Link href="/" className="inline-flex items-center gap-2 text-primary hover:underline">
                        <ArrowLeft className="h-4 w-4" /> Back to Home
                    </Link>
                </div>
            </div>
        </div>
    )
}
