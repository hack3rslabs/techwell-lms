"use client"

import * as React from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowUpRight, Laptop, Shield, Cloud, Settings, Terminal, Megaphone, CheckCircle2, Bot } from 'lucide-react'

const STATIC_SERVICES = [
    {
        id: 's-1',
        name: 'IT Solutions',
        slug: 'it-infrastructure',
        category: 'IT_INFRASTRUCTURE',
        description: 'Comprehensive IT Solutions. We provide IT Support, remote support, IT Asset management, Asset Audit, AMC, and Infra installation. We have extensive experience in this field providing reliable solutions.',
        features: [
            'IT Support & Remote Support',
            'IT Asset Management & Audit',
            'AMC (Annual Maintenance Contract)',
            'Infra Installation'
        ]
    },
    {
        id: 's-2',
        name: 'Software Solutions',
        slug: 'software-development',
        category: 'SOFTWARE_DEVELOPMENT',
        description: 'Custom required softwares as per client req we can develop. From web development and ERP to applications tailored for business operation problem solving.',
        features: [
            'Custom Software Development',
            'Web Development',
            'Enterprise ERP Solutions',
            'Business Operation Problem Solving'
        ]
    },
    {
        id: 's-4',
        name: 'Cyber Security',
        slug: 'cyber-security',
        category: 'CYBER_SECURITY',
        description: 'Protect your enterprise assets with comprehensive Application security testing, endpoint security and Network security, etc.',
        features: [
            'Application Security Testing',
            'Endpoint Security',
            'Network Security',
            'Comprehensive Audits'
        ]
    },
    {
        id: 's-5',
        name: 'Digital Marketing',
        slug: 'digital-marketing',
        category: 'DIGITAL_SERVICES',
        description: 'Comprehensive Digital Marketing solutions including SEO, Social Media Marketing, PPC campaigns, and content strategy to boost your online presence.',
        features: [
            'Search Engine Optimization (SEO)',
            'Social Media Marketing',
            'Pay-Per-Click (PPC) Advertising',
            'Content Strategy & Branding'
        ]
    },
    {
        id: 's-6',
        name: 'AI Automation & RAG',
        slug: 'ai-automation',
        category: 'AI_AUTOMATION',
        description: 'Advanced AI Automation, RAG (Retrieval-Augmented Generation), and n8n workflows designed to scale enterprise intelligence and radically accelerate operational throughput.',
        features: [
            'n8n Workflow Automation',
            'RAG & LLM Integration',
            'Autonomous AI Agents',
            'AI-Driven Data Analytics'
        ]
    }
]

export default function ServicesPage() {
    const getIcon = (category: string) => {
        switch (category) {
            case 'IT_INFRASTRUCTURE':
                return <Settings className="h-6 w-6 text-indigo-500" />
            case 'CLOUD_SOLUTIONS':
                return <Cloud className="h-6 w-6 text-sky-500" />
            case 'CYBER_SECURITY':
                return <Shield className="h-6 w-6 text-emerald-500" />
            case 'SOFTWARE_DEVELOPMENT':
                return <Terminal className="h-6 w-6 text-purple-500" />
            case 'DIGITAL_SERVICES':
                return <Megaphone className="h-6 w-6 text-amber-500" />
            case 'AI_AUTOMATION':
                return <Bot className="h-6 w-6 text-rose-500" />
            default:
                return <Laptop className="h-6 w-6 text-zinc-500" />
        }
    }

    return (
        <div className="min-h-screen bg-slate-50/50 dark:bg-zinc-950 py-12 px-4 md:px-8">
            <div className="max-w-6xl mx-auto space-y-12">
                {/* Header banner */}
                <div className="text-center space-y-4 max-w-2xl mx-auto animate-in fade-in duration-700">
                    <Badge className="bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border-indigo-200 uppercase font-bold py-1 px-3">
                        <Laptop className="w-3.5 h-3.5 mr-1.5" />
                        10 Years of Excellence
                    </Badge>
                    <h1 className="text-4xl md:text-5xl font-black tracking-tight text-zinc-900 dark:text-white">
                        Enterprise <span className="text-indigo-600 dark:text-indigo-400">IT Solutions</span> & Services
                    </h1>
                    <p className="text-zinc-500 dark:text-zinc-400 text-sm md:text-base leading-relaxed">
                        Backed by a decade of market leadership, Techwell accelerates operational efficiency, fortifies security postures, and engineers bespoke software platforms for enterprise scale.
                    </p>
                </div>

                {/* Services Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {STATIC_SERVICES.map((service) => (
                        <Card 
                            key={service.id} 
                            className="bg-white dark:bg-zinc-900/50 border-zinc-200/60 dark:border-zinc-800/80 shadow-md hover:shadow-lg transition-all duration-300 rounded-2xl overflow-hidden flex flex-col group"
                        >
                            <CardHeader className="p-6 border-b border-zinc-100/60 dark:border-zinc-800/60 bg-gradient-to-br from-zinc-50/50 to-white dark:from-zinc-900/10 dark:to-transparent flex flex-row gap-4 items-start">
                                <div className="p-3 bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-100 dark:border-zinc-800/60 shrink-0">
                                    {getIcon(service.category)}
                                </div>
                                <div className="space-y-1">
                                    <Badge className="bg-zinc-50 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-100 dark:border-zinc-800 text-[9px] uppercase font-bold px-2 py-0.5 rounded-md">
                                        {service.category.replace('_', ' ')}
                                    </Badge>
                                    <CardTitle className="text-base font-extrabold text-zinc-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                        {service.name}
                                    </CardTitle>
                                </div>
                            </CardHeader>
                            
                            <CardContent className="p-6 flex-1 space-y-4">
                                <CardDescription className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                                    {service.description}
                                </CardDescription>

                                <div className="space-y-2">
                                    <span className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Included Solutions</span>
                                    <ul className="grid gap-2">
                                        {service.features.map((feat: string, i: number) => (
                                            <li key={i} className="flex items-start gap-2 text-[11px] text-zinc-600 dark:text-zinc-300">
                                                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
                                                <span>{feat}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </CardContent>

                            <CardFooter className="p-6 border-t border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/30">
                                <Button asChild className="w-full bg-indigo-600 hover:bg-indigo-700 text-white h-10 text-xs font-semibold rounded-lg shadow-sm">
                                    <Link href={`/services/${service.slug}`}>
                                        Read More & Request
                                        <ArrowUpRight className="w-3.5 h-3.5 ml-1.5" />
                                    </Link>
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>

                {/* Consultation Capture Panel */}
                <div className="bg-gradient-to-br from-indigo-900 to-indigo-950 text-white rounded-3xl p-8 md:p-12 relative overflow-hidden shadow-xl border border-indigo-800/30 animate-in zoom-in duration-500">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-32 -mt-32" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -ml-32 -mb-32" />
                    
                    <div className="relative z-10 max-w-2xl space-y-6">
                        <Badge className="bg-indigo-500/20 text-indigo-200 border-indigo-500/30 uppercase text-[10px] font-bold">
                            Direct Contact
                        </Badge>
                        <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">Need a customized service? Reach out immediately.</h2>
                        <p className="text-indigo-200 text-xs md:text-sm leading-relaxed">
                            Techwell offers robust SLAs and customized IT projects for corporations, universities, and SMEs. We handle your technology needs so you can focus on core growth.
                        </p>
                        <div className="pt-2">
                            <Button asChild className="bg-white hover:bg-zinc-100 text-indigo-950 font-bold text-xs px-6 h-11 rounded-xl shadow-md">
                                <Link href="/contact?type=it-solutions">
                                    Contact Us Now
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
