

import Link from 'next/link'
import { GraduationCap, Users, Award, Target, ArrowRight, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { WhyTrust } from '@/components/home/WhyTrust'
import { CredentialsSection } from '@/components/home/CredentialsSection'
import { TeamSection } from '@/components/about/TeamSection'
import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'About Techwell | IT Training, Career & Placement Services',
    description: 'Techwell is an IT training, career development, and placement services company based in Srikakulam and Visakhapatnam, Andhra Pradesh. We have supported 10,000+ students in building IT careers.',
    keywords: [
        'About Techwell', 'Techwell IT Solutions', 'IT Training Srikakulam',
        'IT Training Visakhapatnam', 'Career Guidance Andhra Pradesh',
        'Placement Assistance', 'Job Assistance', 'Campus Hiring'
    ],
    alternates: { canonical: 'https://techwell.co.in/about' },
    openGraph: {
        title: 'About Techwell | IT Training, Career & Placement Services',
        description: 'Techwell provides IT training, career guidance, job assistance, and campus hiring services across Andhra Pradesh. Trusted by 10,000+ students and growing.',
        type: 'website',
        url: 'https://techwell.co.in/about',
        images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'About Techwell' }]
    },
    twitter: {
        card: 'summary_large_image',
        title: 'About Techwell | IT Training & Career Services',
        description: 'Professional IT training, career development, and placement assistance in Andhra Pradesh.'
    }
}

// AboutPage + Entity JSON-LD — injected in component below
const aboutSchema = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    "@id": "https://techwell.co.in/about",
    "name": "About Techwell",
    "url": "https://techwell.co.in/about",
    "description": "Techwell is a professional IT training, career development, job assistance, and placement services company based in Srikakulam and Visakhapatnam, Andhra Pradesh, India.",
    "mainEntity": {
        "@type": "Organization",
        "@id": "https://techwell.co.in/#organization",
        "name": "Techwell",
        "alternateName": "Techwell IT Solutions",
        "url": "https://techwell.co.in",
        "foundingDate": "2018",
        "description": "IT Training · Career Development · Job Assistance · Placement Assistance · Campus Hiring · Recruitment Consultancy · IT Consulting · Software Development",
        "areaServed": ["Srikakulam", "Visakhapatnam", "Andhra Pradesh", "India"]
    }
}

const stats = [
    { value: '10,000+', label: 'Students & Professionals Supported' },
    { value: '500+', label: 'Partner Companies' },
    { value: '11+', label: 'IT Training Domains' },
    { value: '50+', label: 'Industry Practitioners' },
]

const values = [
    { icon: Target, title: 'Mission-Driven', description: 'Empowering careers through accessible, AI-enhanced education.' },
    { icon: Users, title: 'Community First', description: 'Building a supportive network of learners and mentors.' },
    { icon: Award, title: 'Excellence', description: 'Delivering industry-relevant curriculum with proven outcomes.' },
    { icon: GraduationCap, title: 'Innovation', description: 'Leveraging AI to personalize every learning journey.' },
]



export default function AboutPage() {
    return (
        <div>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutSchema) }} />
            {/* Hero */}
            <section className="bg-gradient-to-br from-primary/10 via-background to-sky-500/10 py-20">
                <div className="container text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-background border shadow-sm mb-6 animate-fade-in-up">
                        <Calendar className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium">Techwell Founded in 2014</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold mb-6">
                        Transforming Tech Education with AI
                    </h1>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
                        Techwell is on a mission to make world-class tech education accessible to everyone.
                        Our AI-powered platform adapts to your learning style and prepares you for real-world success.
                    </p>
                    <div className="flex justify-center gap-4">
                        <Link href="/courses">
                            <Button size="lg">
                                Explore Courses
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </Link>
                        <Link href="/register">
                            <Button variant="outline" size="lg">
                                Join Free
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Why Choose Techwell */}
            <WhyTrust />

            {/* Credentials Section */}
            <CredentialsSection />


            {/* Stats */}
            <section className="py-16 border-b">
                <div className="container">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {stats.map((stat, idx) => (
                            <div key={idx} className="text-center">
                                <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
                                    {stat.value}
                                </div>
                                <div className="text-sm text-muted-foreground">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Our Story */}
            <section className="py-20">
                <div className="container">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-3xl font-bold mb-6">Our Story</h2>
                            <div className="space-y-4 text-muted-foreground">
                                <p>
                                    Founded in 2015, Techwell emerged from a simple observation: traditional education
                                    wasn&apos;t keeping pace with the rapidly evolving tech industry. Graduates struggled
                                    to bridge the gap between academic knowledge and job-ready skills.
                                </p>
                                <p>
                                    Our founders, having experienced this gap firsthand, set out to create a platform
                                    that combines cutting-edge AI technology with practical, industry-relevant curriculum.
                                    The result is a learning experience that adapts to each student&apos;s pace and prepares
                                    them for real interviews at top tech companies.
                                </p>
                                <p>
                                    Today, Techwell has helped thousands of students land their dream jobs at companies
                                    like Google, Amazon, Microsoft, and leading Indian startups.
                                </p>
                            </div>
                        </div>
                        <div className="bg-gradient-to-br from-primary/20 to-sky-500/20 rounded-2xl h-80 flex items-center justify-center">
                            <GraduationCap className="h-32 w-32 text-primary/30" />
                        </div>
                    </div>
                </div>
            </section>

            {/* Values */}
            <section className="py-20 bg-muted/30">
                <div className="container">
                    <h2 className="text-3xl font-bold text-center mb-12">Our Values</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {values.map((value, idx) => (
                            <div key={idx} className="bg-card p-6 rounded-xl border hover:shadow-lg transition-shadow text-center">
                                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                                    <value.icon className="h-6 w-6 text-primary" />
                                </div>
                                <h3 className="font-semibold mb-2">{value.title}</h3>
                                <p className="text-sm text-muted-foreground">{value.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Team */}
            <TeamSection />

            {/* CTA */}
            {/* <section className="py-20 bg-primary text-primary-foreground">
                <div className="container text-center">
                    <h2 className="text-3xl font-bold mb-4">Ready to Start Your Journey?</h2>
                    <p className="text-lg opacity-90 mb-8 max-w-xl mx-auto">
                        Join thousands of students who have transformed their careers with Techwell.
                    </p>
                    <Link href="/register">
                        <Button size="lg" variant="secondary">
                            Get Started Free
                        </Button>
                    </Link>
                </div>
            </section> */}
        </div>
    )
}
