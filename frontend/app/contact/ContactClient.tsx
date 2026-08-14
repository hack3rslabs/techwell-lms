"use client"

import * as React from 'react'
import Link from 'next/link'
import { Mail, Phone, MapPin, Send, Loader2, CheckCircle2, Instagram, ExternalLink, Building2, GraduationCap, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { leadApi } from '@/lib/api'

const defaultLocations = [
    {
        id: 'vijayawada',
        city: 'Vijayawada',
        title: 'Techwell – Business & Consultation Workspace',
        address: 'Flat No. F.F.A, Mallika Apartments, M.G. Road, Opp. D.V. Manor, Beside Sundaram Honda, Vijayawada – 520010, Andhra Pradesh.',
        phone: '+91 79974 73473',
        email: 'support@techwell.co.in',
        googleMapsUrl: 'https://maps.google.com/?q=Mallika+Apartments,M.G.+Road,Vijayawada'
    },
    {
        id: 'srikakulam',
        city: 'Srikakulam',
        title: 'Techwell – Business & Consultation Workspace',
        address: 'Opp. SBI, Arasavalli Road, Ambedkar Junction, Srikakulam – 532001, Andhra Pradesh.',
        phone: '+91 79974 73473',
        email: 'support@techwell.co.in',
        googleMapsUrl: 'https://maps.google.com/?q=Techwell,Opp.+SBI,Arasavalli+Road,Srikakulam'
    }
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

    const [locations, setLocations] = React.useState(defaultLocations)
    
    React.useEffect(() => {
        // Fetch public settings for locations
        const fetchSettings = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/settings/public`);
                if (res.ok) {
                    const data = await res.json();
                    if (data.address) {
                        try {
                            const parsed = JSON.parse(data.address);
                            if (Array.isArray(parsed) && parsed.length > 0) {
                                setLocations(parsed);
                            }
                        } catch (e) {
                            // Keep default locations if JSON parsing fails
                        }
                    }
                }
            } catch (err) {
                console.error("Failed to fetch settings", err);
            }
        }
        fetchSettings();
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
                                <CardTitle>Global Contacts</CardTitle>
                                <CardDescription>Reach out to Techwell IT Solutions directly.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-start gap-4">
                                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                        <Mail className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">Business Support</p>
                                        <a href="mailto:support@techwell.co.in" className="text-sm text-muted-foreground hover:text-primary transition-colors">support@techwell.co.in</a>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                        <Mail className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">Recruitment & Careers</p>
                                        <a href="mailto:hr@techwell.co.in" className="text-sm text-muted-foreground hover:text-primary transition-colors">hr@techwell.co.in</a>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                        <Phone className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">Phone</p>
                                        <a href="tel:+917997473473" className="text-sm text-muted-foreground hover:text-primary transition-colors">+91 79974 73473</a>
                                    </div>
                                </div>
                                <div className="mt-4 p-4 bg-muted/50 rounded-lg border border-border">
                                    <p className="text-sm font-medium text-center text-primary">Visits are available by prior appointment.</p>
                                </div>
                            </CardContent>
                        </Card>

                        {locations.map((loc) => (
                            <Card key={loc.id} className="border-white/10">
                                <CardHeader>
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <MapPin className="h-5 w-5 text-primary" />
                                        {loc.city}
                                    </CardTitle>
                                    <CardDescription className="font-medium text-foreground">{loc.title}</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <p className="text-sm text-muted-foreground leading-relaxed">{loc.address}</p>
                                    <div className="flex flex-wrap gap-3">
                                        {loc.googleMapsUrl && (
                                            <Button variant="outline" size="sm" asChild className="flex-1">
                                                <a href={loc.googleMapsUrl} target="_blank" rel="noopener noreferrer">
                                                    <MapPin className="w-4 h-4 mr-2" />
                                                    Get Directions
                                                </a>
                                            </Button>
                                        )}
                                        {loc.phone && (
                                            <Button variant="outline" size="sm" asChild>
                                                <a href={`tel:${loc.phone}`}>
                                                    <Phone className="w-4 h-4" />
                                                </a>
                                            </Button>
                                        )}
                                        {loc.email && (
                                            <Button variant="outline" size="sm" asChild>
                                                <a href={`mailto:${loc.email}`}>
                                                    <Mail className="w-4 h-4" />
                                                </a>
                                            </Button>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
