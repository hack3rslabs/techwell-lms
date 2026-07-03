"use client"

import React, { useState, useEffect } from 'react'
import { Sparkles, Loader2, BookOpen, AlertCircle, TrendingUp } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import api from '@/lib/api'
import { useRouter } from 'next/navigation'

interface SkillGapData {
    skillGaps: string[]
    recommendations: { title: string, reason: string }[]
}

export function AICareerCoach() {
    const [data, setData] = useState<SkillGapData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const router = useRouter()

    useEffect(() => {
        const fetchGaps = async () => {
            try {
                const res = await api.get('/candidates/me/skill-gaps')
                setData(res.data)
            } catch (err: any) {
                setError(err.response?.data?.error || 'Failed to load AI Insights.')
            } finally {
                setLoading(false)
            }
        }
        fetchGaps()
    }, [])

    if (loading) {
        return (
            <Card className="border-indigo-100 bg-indigo-50/30">
                <CardContent className="flex justify-center items-center py-10">
                    <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
                    <span className="ml-2 text-indigo-600 font-medium">AI Career Coach is analyzing your profile...</span>
                </CardContent>
            </Card>
        )
    }

    if (error || !data) {
        return (
            <Card className="border-slate-200">
                <CardContent className="flex flex-col justify-center items-center py-8 text-center">
                    <AlertCircle className="h-8 w-8 text-slate-400 mb-2" />
                    <h3 className="font-semibold text-slate-700">AI Career Coach</h3>
                    <p className="text-sm text-slate-500 max-w-sm">{error || 'Create your ATS Resume or take a Mock Interview to unlock AI personalized coaching.'}</p>
                    <Button variant="outline" className="mt-4" onClick={() => router.push('/resume-builder')}>Build ATS Resume</Button>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="border-indigo-200 bg-gradient-to-br from-indigo-50 to-purple-50 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-200/40 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
            <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-indigo-900">
                    <div className="p-2 bg-indigo-100 rounded-lg">
                        <Sparkles className="h-5 w-5 text-indigo-600" />
                    </div>
                    AI Career Coach Insights
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                    <div>
                        <h4 className="text-sm font-bold uppercase tracking-wider text-indigo-400 mb-3 flex items-center gap-2">
                            <AlertCircle className="h-4 w-4" /> Identified Skill Gaps
                        </h4>
                        <div className="flex flex-wrap gap-2">
                            {data.skillGaps.map((gap, i) => (
                                <span key={i} className="px-3 py-1 bg-white border border-rose-100 text-rose-600 rounded-full text-sm font-medium shadow-sm">
                                    {gap}
                                </span>
                            ))}
                        </div>
                        <p className="text-xs text-indigo-500 mt-4 leading-relaxed">
                            Based on your ATS Resume and Mock Interview scores, improving these areas will significantly boost your placement probability for Senior/Mid roles.
                        </p>
                    </div>

                    <div>
                        <h4 className="text-sm font-bold uppercase tracking-wider text-purple-400 mb-3 flex items-center gap-2">
                            <TrendingUp className="h-4 w-4" /> Recommended Micro-Learning
                        </h4>
                        <div className="space-y-3">
                            {data.recommendations.map((rec, i) => (
                                <div key={i} className="bg-white p-3 rounded-xl border border-purple-100 shadow-sm flex items-start gap-3">
                                    <div className="mt-0.5 p-1.5 bg-purple-50 rounded-md">
                                        <BookOpen className="h-4 w-4 text-purple-600" />
                                    </div>
                                    <div>
                                        <h5 className="font-semibold text-slate-800 text-sm">{rec.title}</h5>
                                        <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{rec.reason}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
