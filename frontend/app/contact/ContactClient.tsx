"use client"

import * as React from 'react'
import Link from 'next/link'
import { Mail, Phone, MapPin, Send, Loader2, CheckCircle2, Instagram, ExternalLink, Building2, GraduationCap, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { leadApi } from '@/lib/api'

const contactInfo = [
    { icon: Mail, label: 'Email', value: 'info@techwell.co.in', href: 'mailto:info@techwell.co.in' },
    { icon: Phone, label: 'Phone', value: '+91 7997473473', href: 'tel:+917997473473' },
    {
        icon: MapPin,
        label: 'Address',
        value: 'Techwell HQ',
        href: 'https://www.google.com/maps/place/Techwell(Twiis+Innovations)/@18.2899025,83.9033944,17z/data=!3m1!4b1!4m6!3m5!1s0x3a3c1517a45fc9e1:0x39c24e2311f003a!8m2!3d18.2899025!4d83.9033944!16s%2Fg%2F11c2j7m7xv?entry=ttu&g_ep=EgoyMDI2MDIxMS4wIKXMDSoASAFQAw%3D%3D'
    },
    {
        icon: Instagram,
        label: 'Instagram',
        value: '@techwell_official',
        href: 'https://www.instagram.com/techwell_official/'
    },
    {
        icon: ExternalLink,
        label: 'Justdial Reviews',
        value: 'Verified on Justdial',
        href: 'https://www.justdial.com/Srikakulam/Techwell-It-Solutions-Opposite-Psnmh-Schoolabove-Andhra-Bank-Atm-O-Arasavilli/9999P8942-8942-161117181501-G1M1_BZDET'
    },
    {
        icon: ExternalLink,
        label: 'Google Reviews',
        value: 'Rate us on Google',
        href: 'https://share.google/hEEd5G027yQXanCDt'
    },
]

export default function ContactClient() {
    const [formData, setFormData] = React.useState({
        name: '',
        email: '',
        phone: '',
        inquiryType: 'it-solutions',
        subject: '',
        message: '',
    })
    const [isSubmitting, setIsSubmitting] = React.useState(false)
    const [isSubmitted, setIsSubmitted] = React.useState(false)

    // Listen to query parameters to pre-fill inquiry type if needed
    React.useEffect(() => {
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            const type = params.get('type');
            if (type === 'it-solutions' || type === 'training' || type === 'ai-interview-prep' || type === 'general') {
                setFormData(prev => ({ ...prev, inquiryType: type }));
            }
        }
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)

        try {
            await leadApi.capture(formData)
            setIsSubmitted(true)
            setFormData({ name: '', email: '', phone: '', inquiryType: 'it-solutions', subject: '', message: '' })
        } catch (error) {
            console.error('Failed to submit lead:', error)
            alert('Failed to submit inquiry. Please try again or reach us via email.')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="min-h-screen py-20 bg-background text-foreground">
            <div className="container">
                {/* Header */}
                <div className="text-center mb-16 max-w-2xl mx-auto">
                    <h1 className="text-4xl font-extrabold mb-4 tracking-tight">Contact Techwell IT Solutions</h1>
                    <p className="text-lg text-muted-foreground">
                        Have questions about our enterprise Software & IT Solutions, live training batch options, or our AI placement preparation tools? Get in touch with our team.
                    </p>
                </div>

                {/* Core Pillars Quick Info Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-5xl mx-auto">
                    <Card className="bg-card/50 border-white/10 backdrop-blur-sm">
                        <CardHeader className="pb-2">
                            <div className="h-10 w-10 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center mb-2">
                                <Building2 className="h-5 w-5" />
                            </div>
                            <CardTitle className="text-lg">Software & IT Solutions</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">Enterprise software engineering, customized CRM/ERP developments, and expert corporate technical consulting.</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-card/50 border-white/10 backdrop-blur-sm">
                        <CardHeader className="pb-2">
                            <div className="h-10 w-10 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center mb-2">
                                <GraduationCap className="h-5 w-5" />
                            </div>
                            <CardTitle className="text-lg">Course & Corporate Training</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">Live trainer-led courses, custom corporate upskilling programs, skills upgrades, and placement assistance.</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-card/50 border-white/10 backdrop-blur-sm">
                        <CardHeader className="pb-2">
                            <div className="h-10 w-10 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-2">
                                <Users className="h-5 w-5" />
                            </div>
                            <CardTitle className="text-lg">AI Interview Prep & Placements</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">Adaptive AI mock interview preparation, automated ATS resume building, and placement pipelines for students and developers.</p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
                    {/* Contact Form */}
                    <Card className="border-white/10 shadow-xl">
                        <CardHeader>
                            <CardTitle>Inquiry & Request Form</CardTitle>
                            <CardDescription>Fill out the form and our expert team will contact you within 24 hours.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {isSubmitted ? (
                                <div className="text-center py-8">
                                    <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium mb-2">Request Submitted Successfully!</h3>
                                    <p className="text-muted-foreground mb-6">
                                        Thank you for reaching out. A representative from the respective division will connect with you shortly.
                                    </p>
                                    <Button variant="outline" onClick={() => setIsSubmitted(false)}>
                                        Submit Another Request
                                    </Button>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Name</label>
                                            <Input
                                                placeholder="Your name"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Email</label>
                                            <Input
                                                type="email"
                                                placeholder="you@example.com"
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Phone Number</label>
                                            <Input
                                                type="tel"
                                                placeholder="+91 98765 43210"
                                                value={formData.phone}
                                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Inquiry Type</label>
                                            <select
                                                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                                                value={formData.inquiryType}
                                                onChange={(e) => setFormData({ ...formData, inquiryType: e.target.value })}
                                            >
                                                <option value="training">Course & Corporate Training (Trainer-Led, Skills Upgrade)</option>
                                                <option value="it-solutions">Software & IT Solutions (Custom CRM/ERP, App Development)</option>
                                                <option value="ai-interview-prep">AI Interview Preparation & Placement Assistance</option>
                                                <option value="general">General Support / Other Inquiry</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Subject</label>
                                        <Input
                                            placeholder="What is this inquiry regarding?"
                                            value={formData.subject}
                                            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Message / Project Requirements</label>
                                        <textarea
                                            className="w-full min-h-[150px] px-3 py-2 text-sm rounded-md border border-input bg-background resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                                            placeholder="Please describe your requirements, questions, or project description..."
                                            value={formData.message}
                                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Submitting Request...
                                            </>
                                        ) : (
                                            <>
                                                <Send className="mr-2 h-4 w-4" />
                                                Send Inquiry
                                            </>
                                        )}
                                    </Button>
                                </form>
                            )}
                        </CardContent>
                    </Card>

                    {/* Contact Info */}
                    <div className="space-y-6">
                        <Card className="border-white/10">
                            <CardHeader>
                                <CardTitle>Corporate Contact Details</CardTitle>
                                <CardDescription>Reach out to Techwell IT Solutions directly.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {contactInfo.map((info, idx) => (
                                    <div key={idx} className="flex items-start gap-4">
                                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                            <info.icon className="h-5 w-5 text-primary" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium">{info.label}</p>
                                            {info.href ? (
                                                <a href={info.href} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                                                    {info.value}
                                                </a>
                                            ) : (
                                                <p className="text-sm text-muted-foreground">{info.value}</p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        <Card className="border-white/10">
                            <CardHeader>
                                <CardTitle>Office Hours</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Monday - Friday</span>
                                        <span>9:00 AM - 6:00 PM IST</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Saturday</span>
                                        <span>10:00 AM - 4:00 PM IST</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Sunday</span>
                                        <span className="text-red-500 font-semibold">Closed</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
)
}
