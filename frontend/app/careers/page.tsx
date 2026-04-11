"use client"

import Link from 'next/link'
import { Briefcase, MapPin, Clock, ArrowRight, Users, Rocket, Heart, Coffee } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

const openPositions = [
    {
        id: 1,
        title: 'Senior Full-Stack Engineer',
        department: 'Engineering',
        location: 'Bangalore, India',
        type: 'Full-time',
        experience: '5+ years',
        description: 'Build and scale our AI-powered learning platform using Next.js, Node.js, and PostgreSQL.'
    },
    {
        id: 2,
        title: 'AI/ML Engineer',
        department: 'AI Research',
        location: 'Remote (India)',
        type: 'Full-time',
        experience: '3+ years',
        description: 'Develop and improve our AI interview evaluation and adaptive learning algorithms.'
    },
    {
        id: 3,
        title: 'Product Designer',
        department: 'Design',
        location: 'Bangalore, India',
        type: 'Full-time',
        experience: '3+ years',
        description: 'Create beautiful, intuitive experiences for our learning and interview preparation platform.'
    },
    {
        id: 4,
        title: 'Content Writer',
        department: 'Content',
        location: 'Remote (India)',
        type: 'Full-time',
        experience: '2+ years',
        description: 'Create engaging educational content, interview guides, and blog posts.'
    }
]

const perks = [
    { icon: Users, title: 'Great Team', description: 'Work with talented, passionate people' },
    { icon: Rocket, title: 'Fast Growth', description: 'Join a high-growth startup' },
    { icon: Heart, title: 'Health Benefits', description: 'Medical insurance for you & family' },
    { icon: Coffee, title: 'Remote Flexible', description: 'Work from anywhere option' }
]

export default function CareersPage() {
    return (
        <div className="min-h-screen py-20">
            <div className="container">
                {/* Hero */}
                <div className="text-center mb-16">
                    <Badge variant="outline" className="mb-4">We&apos;re Hiring!</Badge>
                    <h1 className="text-5xl font-bold mb-4">Join the TechWell Team</h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        Help us revolutionize how people prepare for interviews and learn new skills
                    </p>
                </div>

                {/* Perks */}
                <div className="grid md:grid-cols-4 gap-6 mb-16">
                    {perks.map((perk, idx) => (
                        <Card key={idx} className="text-center">
                            <CardContent className="pt-6">
                                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                                    <perk.icon className="h-6 w-6 text-primary" />
                                </div>
                                <h3 className="font-semibold mb-1">{perk.title}</h3>
                                <p className="text-sm text-muted-foreground">{perk.description}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Open Positions */}
                <h2 className="text-3xl font-bold mb-8">Open Positions</h2>
                <div className="space-y-4 mb-16">
                    {openPositions.map((job) => (
                        <Card key={job.id} className="hover:shadow-lg transition-shadow">
                            <CardContent className="py-6">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <h3 className="text-xl font-bold">{job.title}</h3>
                                            <Badge variant="secondary">{job.department}</Badge>
                                        </div>
                                        <p className="text-muted-foreground mb-3">{job.description}</p>
                                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                                            <span className="flex items-center gap-1">
                                                <MapPin className="h-4 w-4" />
                                                {job.location}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Clock className="h-4 w-4" />
                                                {job.type}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Briefcase className="h-4 w-4" />
                                                {job.experience}
                                            </span>
                                        </div>
                                    </div>
                                    <Link href={`/contact?job=${encodeURIComponent(job.title)}`}>
                                        <Button className="gap-2">
                                            Apply Now
                                            <ArrowRight className="h-4 w-4" />
                                        </Button>
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* No Match CTA */}
                <Card className="bg-muted/50">
                    <CardContent className="py-8 text-center">
                        <h3 className="text-2xl font-bold mb-2">Don&apos;t see a perfect match?</h3>
                        <p className="text-muted-foreground mb-4">
                            We&apos;re always looking for talented people. Send us your resume and we&apos;ll keep you in mind for future openings.
                        </p>
                        <Link href="/contact">
                            <Button variant="outline">Send Us Your Resume</Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
