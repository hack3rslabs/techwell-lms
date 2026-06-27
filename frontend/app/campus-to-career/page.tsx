"use client"

import * as React from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { BookOpen, Award, CheckCircle2, ChevronRight, Play, Star, Sparkles, Code, Cpu, Trophy } from 'lucide-react'

// Campus to Career Ecosystem details
export default function CampusToCareerPage() {
    return (
        <div className="min-h-screen bg-slate-50/50 dark:bg-zinc-950 py-12 px-4 md:px-8">
            <div className="max-w-5xl mx-auto space-y-12 animate-in fade-in duration-700">
                {/* Header Banner */}
                <div className="text-center space-y-4 max-w-3xl mx-auto">
                    <Badge className="bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 border-purple-200 uppercase font-bold py-1 px-3">
                        <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                        Placement Assistance Ecosystem
                    </Badge>
                    <h1 className="text-4xl md:text-5xl font-black tracking-tight text-zinc-900 dark:text-white">
                        Campus to Career <span className="text-purple-600 dark:text-purple-400">Ecosystem</span>
                    </h1>
                    <p className="text-zinc-500 dark:text-zinc-400 text-sm md:text-base leading-relaxed">
                        Ace your upcoming MNC assessments, coding challenges, technical exams, and competitive aptitude tests with structured preparation tracks and placement drives.
                    </p>
                </div>

                {/* Core Pillars of Campus to Career */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-md">
                        <CardHeader>
                            <div className="h-10 w-10 rounded-lg bg-purple-500/10 text-purple-500 flex items-center justify-center mb-2">
                                <BookOpen className="w-5 h-5" />
                            </div>
                            <CardTitle className="text-lg">MNC Prep Tracks</CardTitle>
                            <CardDescription className="text-xs">
                                Quantitative Aptitude, Reasoning Ability, and coding questions structured exactly like recruiters assessments.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="text-xs text-muted-foreground leading-relaxed">
                            Tailored mock assessments for top MNC recruiters (TCS NQT, Infosys SP/DSE, Accenture technical exams, Wipro Elite, and Cognizant GenC).
                        </CardContent>
                    </Card>

                    <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-md">
                        <CardHeader>
                            <div className="h-10 w-10 rounded-lg bg-purple-500/10 text-purple-500 flex items-center justify-center mb-2">
                                <Code className="w-5 h-5" />
                            </div>
                            <CardTitle className="text-lg">Diagnostic Portals</CardTitle>
                            <CardDescription className="text-xs">
                                Access technical diagnostic tests across coding, databases, and full stack developments.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="text-xs text-muted-foreground leading-relaxed">
                            Includes DSA mock challenges, SQL query assessments, OOP design tests, and core logical ability benchmarks to measure your progress.
                        </CardContent>
                    </Card>

                    <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-md">
                        <CardHeader>
                            <div className="h-10 w-10 rounded-lg bg-purple-500/10 text-purple-500 flex items-center justify-center mb-2">
                                <Trophy className="w-5 h-5" />
                            </div>
                            <CardTitle className="text-lg">Placement Drives</CardTitle>
                            <CardDescription className="text-xs">
                                Dynamic integration with placement partners and automatic shortlisting algorithms.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="text-xs text-muted-foreground leading-relaxed">
                            We match your skills metrics with verified hiring partners. Eligible profiles are automatically referred for interviews.
                        </CardContent>
                    </Card>
                </div>

                {/* How to Access Assessment Panel */}
                <Card className="bg-gradient-to-br from-purple-50/50 to-white dark:from-purple-950/10 dark:to-transparent border-zinc-200 dark:border-zinc-800 shadow-md p-6">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-xl font-bold flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-purple-500" />
                            Elearnstack Test Engine Integration
                        </CardTitle>
                        <CardDescription className="text-xs">
                            Active assessment dashboards and mock test systems are powered by our partner portal.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                            All mock exams, coding diagnostic indices, and aptitude evaluations are synchronized directly with **Elearnstack.com**. 
                            Enrolled Techwell students receive their assessment account credentials during batches activation.
                        </p>
                        <div className="flex flex-wrap gap-3">
                            <Button asChild className="bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs px-5 h-10 rounded-lg shadow-sm">
                                <a href="https://elearnstack.com" target="_blank" rel="noopener noreferrer">
                                    Launch Elearnstack Engine
                                </a>
                            </Button>
                            <Button variant="outline" asChild className="border-zinc-200 hover:bg-zinc-100 hover:text-zinc-900 text-xs px-5 h-10 rounded-lg dark:border-zinc-800">
                                <Link href="/contact?type=training">
                                    Consult Placement Cell
                                </Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
