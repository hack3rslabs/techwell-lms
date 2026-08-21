"use client"

import Link from 'next/link'
import { Briefcase, MapPin, Clock, ArrowRight, Users, Rocket, Heart, Coffee, ChevronRight, ShieldCheck, Sparkles, Building2, Globe2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

const openPositions = [
    {
        id: 1,
        jobId: 'TW-ENG-001',
        title: 'Senior Full-Stack Engineer',
        department: 'Engineering',
        location: 'Bangalore, India',
        type: 'Full-time',
        experience: '5+ years',
        description: 'Build and scale our AI-powered learning platform using Next.js, Node.js, and PostgreSQL.'
    },
    {
        id: 2,
        jobId: 'TW-AIR-002',
        title: 'AI/ML Engineer',
        department: 'AI Research',
        location: 'Remote (India)',
        type: 'Full-time',
        experience: '3+ years',
        description: 'Develop and improve our AI interview evaluation and adaptive learning algorithms.'
    },
    {
        id: 3,
        jobId: 'TW-DSN-003',
        title: 'Product Designer',
        department: 'Design',
        location: 'Bangalore, India',
        type: 'Full-time',
        experience: '3+ years',
        description: 'Create beautiful, intuitive experiences for our learning and interview preparation platform.'
    },
    {
        id: 4,
        jobId: 'TW-CNT-004',
        title: 'Content Writer',
        department: 'Content',
        location: 'Remote (India)',
        type: 'Full-time',
        experience: '2+ years',
        description: 'Create engaging educational content, interview guides, and blog posts.'
    },
    {
        id: 5,
        jobId: 'TW-CLN-005',
        title: 'Senior Frontend Developer',
        department: 'Consulting',
        location: 'Hybrid (Pune)',
        type: 'Contract',
        experience: '4+ years',
        description: 'Join our client team to build a high-performance enterprise fintech dashboard.',
        isClientRole: true,
        clientName: 'Global Fintech Corp',
        clientPortalUrl: 'https://example.com/careers/apply'
    }
]

const perks = [
    { icon: Globe2, title: 'Work Anywhere', description: 'Remote-first culture with flexible working hours.' },
    { icon: Rocket, title: 'Hyper Growth', description: 'Fast-track your career in a rapidly scaling startup.' },
    { icon: ShieldCheck, title: 'Premium Health', description: 'Top-tier medical insurance for you and your family.' },
    { icon: Coffee, title: 'Modern Workspace', description: 'Stipend for home office setup and coworking spaces.' }
]

export default function CareersPage() {
    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-[#030712] selection:bg-sky-500/30">
            {/* Immersive Premium Hero Section */}
            <section className="relative pt-32 pb-24 lg:pt-40 lg:pb-32 overflow-hidden border-b border-zinc-200 dark:border-zinc-800">
                {/* Background Textures */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
                <div className="absolute top-0 inset-x-0 h-[500px] bg-gradient-to-b from-sky-50/50 dark:from-sky-950/20 to-transparent"></div>
                <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-sky-500/10 dark:bg-sky-500/5 rounded-full blur-[100px] pointer-events-none"></div>
                
                <div className="container relative z-10 max-w-5xl mx-auto px-4 sm:px-6">
                    <div className="text-center">
                        <Badge className="bg-sky-100 dark:bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-200 dark:border-sky-500/20 px-4 py-1.5 rounded-full backdrop-blur-sm mb-6 inline-flex items-center shadow-sm">
                            <Sparkles className="w-4 h-4 mr-2" />
                            <span className="text-xs font-bold uppercase tracking-widest">We are hiring</span>
                        </Badge>
                        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-zinc-900 dark:text-white mb-6 drop-shadow-sm">
                            Build the <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-500 to-sky-600">Future</span> of Learning
                        </h1>
                        <p className="text-lg md:text-xl text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed font-medium">
                            Join our mission to revolutionize career preparation, enterprise SaaS, and IT training. We&apos;re looking for passionate builders.
                        </p>
                        
                        <div className="mt-10 flex flex-wrap justify-center gap-4">
                            <a href="#open-positions">
                                <Button size="lg" className="h-14 px-8 rounded-full bg-sky-600 hover:bg-sky-700 text-white shadow-[0_8px_30px_rgb(79,70,229,0.3)] transition-all hover:-translate-y-1 text-base font-semibold">
                                    View Openings <ArrowRight className="ml-2 w-5 h-5" />
                                </Button>
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* Premium Perks Section */}
            <section className="py-24 bg-white dark:bg-zinc-950 relative">
                <div className="container max-w-6xl mx-auto px-4 sm:px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 dark:text-white mb-4">Why Techwell?</h2>
                        <p className="text-zinc-500 dark:text-zinc-400 font-medium">We invest in our people because they are our greatest asset.</p>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {perks.map((perk, idx) => (
                            <div key={idx} className="group relative p-8 bg-zinc-50 dark:bg-zinc-900/50 rounded-3xl border border-zinc-100 dark:border-zinc-800 hover:border-sky-200 dark:hover:border-sky-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-sky-500/5 hover:-translate-y-1 overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-br from-sky-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                <div className="h-14 w-14 rounded-2xl bg-white dark:bg-zinc-800 shadow-sm border border-zinc-100 dark:border-zinc-700 flex items-center justify-center mb-6 text-sky-600 dark:text-sky-400 group-hover:scale-110 transition-transform">
                                    <perk.icon className="h-7 w-7" />
                                </div>
                                <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-3">{perk.title}</h3>
                                <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed text-sm">{perk.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Rich Job Listings Section */}
            <section id="open-positions" className="py-24 bg-zinc-50 dark:bg-[#030712] border-t border-zinc-200 dark:border-zinc-800/50">
                <div className="container max-w-5xl mx-auto px-4 sm:px-6">
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
                        <div>
                            <h2 className="text-3xl md:text-5xl font-bold text-zinc-900 dark:text-white tracking-tight mb-4">Open Positions</h2>
                            <p className="text-zinc-500 dark:text-zinc-400 text-lg">Find your next big opportunity.</p>
                        </div>
                        <Badge variant="secondary" className="px-4 py-2 rounded-full text-sm font-medium self-start md:self-auto bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200">
                            {openPositions.length} Roles Available
                        </Badge>
                    </div>

                    <div className="space-y-6">
                        {openPositions.map((job) => (
                            <div key={job.id} className="group relative bg-white dark:bg-zinc-900/80 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-1 transition-all duration-300 hover:shadow-2xl hover:shadow-sky-500/10 hover:border-sky-300 dark:hover:border-sky-500/50 overflow-hidden">
                                {/* Hover Glow */}
                                <div className="absolute inset-0 bg-gradient-to-r from-sky-500/0 via-sky-500/5 to-sky-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                                
                                <div className="bg-white dark:bg-zinc-950 rounded-[22px] p-6 sm:p-8 flex flex-col md:flex-row gap-8 justify-between items-start md:items-center relative z-10 h-full w-full">
                                    <div className="flex-1 space-y-4">
                                        <div className="flex flex-wrap items-center gap-3">
                                            <Badge variant="outline" className="text-xs font-mono bg-zinc-100 dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 border-zinc-300 dark:border-zinc-700">
                                                ID: {job.jobId}
                                            </Badge>
                                            <Badge className="bg-sky-50 dark:bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-200 dark:border-sky-500/20">
                                                {job.department}
                                            </Badge>
                                            {job.isClientRole && job.clientName && (
                                                <Badge className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20">
                                                    <Building2 className="w-3 h-3 mr-1" />
                                                    Client: {job.clientName}
                                                </Badge>
                                            )}
                                        </div>
                                        
                                        <h3 className="text-2xl font-bold text-zinc-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
                                            {job.title}
                                        </h3>
                                        
                                        <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-2xl">
                                            {job.description}
                                        </p>
                                        
                                        <div className="flex flex-wrap items-center gap-4 pt-2">
                                            <div className="flex items-center text-sm font-medium text-zinc-600 dark:text-zinc-400">
                                                <MapPin className="w-4 h-4 mr-1.5 text-zinc-400 dark:text-zinc-500" />
                                                {job.location}
                                            </div>
                                            <div className="hidden sm:block w-1 h-1 rounded-full bg-zinc-300 dark:bg-zinc-700"></div>
                                            <div className="flex items-center text-sm font-medium text-zinc-600 dark:text-zinc-400">
                                                <Clock className="w-4 h-4 mr-1.5 text-zinc-400 dark:text-zinc-500" />
                                                {job.type}
                                            </div>
                                            <div className="hidden sm:block w-1 h-1 rounded-full bg-zinc-300 dark:bg-zinc-700"></div>
                                            <div className="flex items-center text-sm font-medium text-zinc-600 dark:text-zinc-400">
                                                <Briefcase className="w-4 h-4 mr-1.5 text-zinc-400 dark:text-zinc-500" />
                                                {job.experience}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="w-full md:w-auto shrink-0 flex items-center justify-end">
                                        {job.isClientRole && job.clientPortalUrl ? (
                                            <a href={job.clientPortalUrl} target="_blank" rel="noopener noreferrer" className="w-full md:w-auto">
                                                <Button className="w-full md:w-auto h-12 px-8 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white transition-all font-semibold group/btn">
                                                    Apply on Client Portal
                                                    <ArrowRight className="ml-2 w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                                                </Button>
                                            </a>
                                        ) : (
                                            <Link href={`/contact?jobId=${job.jobId}&job=${encodeURIComponent(job.title)}`} className="w-full md:w-auto">
                                                <Button className="w-full md:w-auto h-12 px-8 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-sky-600 dark:hover:bg-sky-500 hover:text-white transition-all font-semibold group/btn">
                                                    Apply Now
                                                    <ArrowRight className="ml-2 w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                                                </Button>
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Spontaneous Application CTA */}
                    <div className="mt-16 p-8 sm:p-12 bg-gradient-to-br from-zinc-900 to-zinc-950 dark:from-zinc-900 dark:to-zinc-950 rounded-3xl relative overflow-hidden text-center shadow-2xl">
                        <div className="absolute inset-0 bg-[url('/images/noise.png')] opacity-[0.03] mix-blend-overlay"></div>
                        <div className="absolute -top-24 -right-24 w-48 h-48 bg-sky-500/30 rounded-full blur-[60px]"></div>
                        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-sky-500/30 rounded-full blur-[60px]"></div>
                        
                        <div className="relative z-10 max-w-2xl mx-auto">
                            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6 backdrop-blur-md border border-white/10">
                                <Users className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-3xl font-bold text-white mb-4">Don&apos;t see a perfect match?</h3>
                            <p className="text-zinc-400 mb-8 text-lg">
                                We&apos;re always on the lookout for exceptional talent. Drop your resume, and we&apos;ll reach out when the right opportunity opens up.
                            </p>
                            <Link href="/contact">
                                <Button variant="outline" className="h-14 px-8 rounded-full border-white/20 text-zinc-900 hover:bg-white hover:text-zinc-900 transition-colors font-bold bg-white/90 backdrop-blur-md">
                                    Send Spontaneous Application
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}
