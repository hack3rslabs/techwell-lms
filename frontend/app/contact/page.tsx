"use client"

import * as React from 'react'
import { Mail, Phone, MapPin, Send, Loader2, CheckCircle2, Instagram, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const contactInfo = [
    { icon: Mail, label: 'Email', value: 'support@techwell.co.in', href: 'mailto:support@techwell.co.in' },
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
        label: 'Reviews',
        value: 'Verified on Justdial',
        href: 'https://www.justdial.com/Srikakulam/Techwell-It-Solutions-Opposite-Psnmh-Schoolabove-Andhra-Bank-Atm-O-Arasavilli/9999P8942-8942-161117181501-G1M1_BZDET'
    },
]

export default function ContactPage() {
    const [formData, setFormData] = React.useState({
        name: '',
        email: '',
        subject: '',
        message: '',
    })
    const [isSubmitting, setIsSubmitting] = React.useState(false)
    const [isSubmitted, setIsSubmitted] = React.useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500))

        setIsSubmitting(false)
        setIsSubmitted(true)
        setFormData({ name: '', email: '', subject: '', message: '' })
    }

    return (
        <div className="min-h-screen py-20">
            <div className="container">
                {/* Header */}
                <div className="text-center mb-16">
                    <h1 className="text-4xl font-bold mb-4">Get in Touch</h1>
                    <p className="text-lg text-muted-foreground max-w-xl mx-auto">
                        Have questions? We&apos;d love to hear from you. Send us a message and we&apos;ll respond as soon as possible.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
                    {/* Contact Form */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Send a Message</CardTitle>
                            <CardDescription>Fill out the form and we&apos;ll get back to you within 24 hours.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {isSubmitted ? (
                                <div className="text-center py-8">
                                    <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium mb-2">Message Sent!</h3>
                                    <p className="text-muted-foreground mb-4">
                                        Thank you for reaching out. We&apos;ll get back to you soon.
                                    </p>
                                    <Button variant="outline" onClick={() => setIsSubmitted(false)}>
                                        Send Another Message
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
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Subject</label>
                                        <Input
                                            placeholder="How can we help?"
                                            value={formData.subject}
                                            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Message</label>
                                        <textarea
                                            className="w-full min-h-[150px] px-3 py-2 text-sm rounded-md border border-input bg-background resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                                            placeholder="Your message..."
                                            value={formData.message}
                                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Sending...
                                            </>
                                        ) : (
                                            <>
                                                <Send className="mr-2 h-4 w-4" />
                                                Send Message
                                            </>
                                        )}
                                    </Button>
                                </form>
                            )}
                        </CardContent>
                    </Card>

                    {/* Contact Info */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Contact Information</CardTitle>
                                <CardDescription>Reach out through any of these channels.</CardDescription>
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

                        <Card>
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
                                        <span className="text-red-500">Closed</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-primary text-primary-foreground">
                            <CardContent className="pt-6">
                                <h3 className="font-semibold mb-2">Need Quick Help?</h3>
                                <p className="text-sm opacity-90 mb-4">
                                    Check out our Help Center for instant answers to common questions.
                                </p>
                                <Button variant="secondary" size="sm">
                                    Visit Help Center
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}
