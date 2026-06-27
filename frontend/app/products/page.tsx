"use client"

import * as React from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Sparkles, Layout, CheckCircle2, ChevronRight, MonitorPlay } from 'lucide-react'

const STATIC_PRODUCTS = [
    {
        id: 'p-1',
        name: 'Ledger Book (Live)',
        category: 'Billing & Ledger',
        description: 'A powerful, cloud-based GST billing and inventory management software for Indian SMEs. Generate invoices, track stock, and manage accounting seamlessly.',
        features: [
            'GST Compliant Invoicing',
            'Real-time Inventory Tracking',
            'Financial Reporting & Analytics',
            'Multi-user Access Control',
            'Automated Payment Reminders'
        ],
        demoUrl: 'https://ledgerbook.techwell.co.in',
        isActive: true
    },
    // We can add "Coming Soon" products here in the future if needed, 
    // but the user requested to hide them.
]

export default function ProductsPage() {
    return (
        <div className="min-h-screen bg-slate-50/50 dark:bg-zinc-950 py-12 px-4 md:px-8">
            <div className="max-w-6xl mx-auto space-y-12">
                {/* Header banner */}
                <div className="text-center space-y-4 max-w-2xl mx-auto animate-in fade-in duration-700">
                    <Badge className="bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border-indigo-200 uppercase font-bold py-1 px-3">
                        <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                        Commercial Software Products
                    </Badge>
                    <h1 className="text-4xl md:text-5xl font-black tracking-tight text-zinc-900 dark:text-white">
                        Enterprise <span className="text-indigo-600 dark:text-indigo-400">SaaS Ecosystems</span>
                    </h1>
                    <p className="text-zinc-500 dark:text-zinc-400 text-sm md:text-base leading-relaxed">
                        Scale your business operations with our modern, automated digital management systems.
                    </p>
                </div>

                {/* Products Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {STATIC_PRODUCTS.map((product) => (
                        <Card 
                            key={product.id} 
                            className="bg-white dark:bg-zinc-900/50 border-zinc-200/60 dark:border-zinc-800/80 shadow-md hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden flex flex-col group"
                        >
                            <CardHeader className="p-6 border-b border-zinc-100/60 dark:border-zinc-800/60 bg-gradient-to-br from-zinc-50/50 to-white dark:from-zinc-900/10 dark:to-transparent">
                                <div className="flex justify-between items-start gap-4">
                                    <div>
                                        <Badge className="bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/40 text-[10px] uppercase font-bold px-2 py-0.5 rounded-md mb-2">
                                            {product.category}
                                        </Badge>
                                        <CardTitle className="text-xl font-extrabold text-zinc-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                            {product.name}
                                        </CardTitle>
                                    </div>
                                </div>
                                <CardDescription className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed mt-2">
                                    {product.description}
                                </CardDescription>
                            </CardHeader>
                            
                            <CardContent className="p-6 flex-1 space-y-5">
                                <div className="space-y-2">
                                    <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Core Specifications</span>
                                    <ul className="grid gap-2">
                                        {product.features.map((feat: string, i: number) => (
                                            <li key={i} className="flex items-start gap-2.5 text-xs text-zinc-600 dark:text-zinc-300">
                                                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                                                <span>{feat}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </CardContent>

                            <CardFooter className="p-6 bg-zinc-50/50 dark:bg-zinc-900/30 border-t border-zinc-100 dark:border-zinc-800/80 flex flex-wrap gap-2 justify-between items-center">
                                <div className="flex gap-2">
                                    {product.demoUrl && (
                                        <Button 
                                            variant="outline" 
                                            size="sm" 
                                            asChild 
                                            className="h-9 px-3 text-xs border-zinc-200 hover:bg-zinc-100 hover:text-zinc-900 dark:border-zinc-800 gap-1.5"
                                        >
                                            <a href={product.demoUrl} target="_blank" rel="noopener noreferrer">
                                                <MonitorPlay className="w-3.5 h-3.5" />
                                                Live Demo
                                            </a>
                                        </Button>
                                    )}
                                </div>

                                <Button asChild size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white h-9 px-4 text-xs font-semibold rounded-lg shadow-sm">
                                    <Link href={`/contact?product=${encodeURIComponent(product.name)}`}>
                                        Request Quote
                                        <ChevronRight className="w-4 h-4 ml-1" />
                                    </Link>
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>

                {/* SaaS Promotion Quote capture panel */}
                <div className="bg-gradient-to-br from-indigo-900 to-indigo-950 text-white rounded-3xl p-8 md:p-12 relative overflow-hidden shadow-xl border border-indigo-800/30 animate-in zoom-in duration-500">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-32 -mt-32" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -ml-32 -mb-32" />
                    
                    <div className="relative z-10 max-w-2xl space-y-6">
                        <Badge className="bg-indigo-500/20 text-indigo-200 border-indigo-500/30 uppercase text-[10px] font-bold">
                            Corporate Scaling
                        </Badge>
                        <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">Need a custom software product for your enterprise?</h2>
                        <p className="text-indigo-200 text-xs md:text-sm leading-relaxed">
                            Connect with our software R&D division. We build bespoke SaaS portals, custom ERP implementations, and automated billing ledgers tailored to your business needs.
                        </p>
                        <div className="pt-2 flex flex-wrap gap-3">
                            <Button asChild className="bg-white hover:bg-zinc-100 text-indigo-950 font-bold text-xs px-6 h-11 rounded-xl shadow-md">
                                <Link href="/contact?type=it-solutions">
                                    Consult our Architects
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
