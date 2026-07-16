"use client"

import * as React from 'react'
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { interviewApi } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
    ArrowLeft,
    Download,
    Share2,
    TrendingUp,
    TrendingDown,
    Target,
    MessageSquare,
    Brain,
    Sparkles,
    CheckCircle2,
    AlertCircle,
    Lightbulb,
    BarChart3,
    Loader2,
    Star,
    Award
} from 'lucide-react'

interface Evaluation {
    overallScore: number
    technicalScore: number
    communicationScore: number
    confidenceScore: number
    starMethodScore: number
    strengths: string[]
    weaknesses: string[]
    recommendations: string[]
    aiInsights: string
}

interface QuestionResult {
    question: string
    type: string
    answer: string
    score: number
    feedback: string
}

// Removed mock data

export default function InterviewReportPage() {
    const router = useRouter()
    const params = useParams()
    const { isAuthenticated, isLoading: authLoading } = useAuth()

    const [isLoading, setIsLoading] = useState(true)
    const [interview, setInterview] = useState<{ role?: string; domain?: string } | null>(null)
    const [evaluation, setEvaluation] = useState<Evaluation | null>(null)
    const [questions, setQuestions] = useState<QuestionResult[]>([])

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push('/login')
        }
    }, [authLoading, isAuthenticated, router])

    useEffect(() => {
        const fetchReport = async () => {
            try {
                // Fetch the detailed report from the API
                const res = await interviewApi.getReport(params.id as string)
                const report = res.data.report

                if (report) {
                    setInterview(report.interview)

                    // Map evaluation data
                    const evalData = report.evaluation
                    setEvaluation({
                        overallScore: evalData.overallScore || 75,
                        technicalScore: evalData.technicalScore || 70,
                        communicationScore: evalData.communicationScore || 75,
                        confidenceScore: evalData.problemSolvingScore || 72,
                        starMethodScore: evalData.starMethodScore || 68,
                        strengths: evalData.strengths || [],
                        weaknesses: evalData.weaknesses || [],
                        recommendations: evalData.recommendations || [],
                        aiInsights: evalData.aiInsights || ""
                    })

                    // Use question breakdown from API or fallback
                    if (report.questionBreakdown && report.questionBreakdown.length > 0) {
                        setQuestions(report.questionBreakdown)
                    } else {
                        setQuestions([])
                    }
                } else {
                    setEvaluation(null)
                    setQuestions([])
                }
            } catch (error) {
                console.error('Failed to fetch report:', error)
                setEvaluation(null)
                setQuestions([])
            } finally {
                setIsLoading(false)
            }
        }

        if (params.id) {
            fetchReport()
        }
    }, [params.id])

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-green-600'
        if (score >= 60) return 'text-yellow-600'
        return 'text-red-600'
    }

    const getScoreGradient = (score: number) => {
        if (score >= 80) return 'from-green-500 to-emerald-400'
        if (score >= 60) return 'from-yellow-500 to-amber-400'
        return 'from-red-500 to-orange-400'
    }

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'TECHNICAL': return 'bg-blue-100 text-blue-700'
            case 'BEHAVIORAL': return 'bg-purple-100 text-purple-700'
            case 'HR': return 'bg-pink-100 text-pink-700'
            default: return 'bg-gray-100 text-gray-700'
        }
    }

    if (authLoading || isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
                    <p className="text-muted-foreground">Generating your AI analysis report...</p>
                </div>
            </div>
        )
    }

    if (!evaluation) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h2 className="text-xl font-medium mb-2">Report Not Available</h2>
                    <p className="text-muted-foreground mb-4">This interview hasn&apos;t been evaluated yet.</p>
                    <Button onClick={() => router.push('/interviews')}>Back to Interviews</Button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 py-8">
            <div className="container max-w-5xl">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <Button variant="ghost" onClick={() => router.push('/interviews')} className="mb-2">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Interviews
                        </Button>
                        <h1 className="text-3xl font-bold flex items-center gap-2">
                            <Award className="h-8 w-8 text-primary" />
                            Interview Report
                        </h1>
                        <p className="text-muted-foreground">
                            {interview?.role || 'Mock Interview'} • {interview?.domain || 'Technology'}
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline">
                            <Share2 className="h-4 w-4 mr-2" />
                            Share
                        </Button>
                        <Button>
                            <Download className="h-4 w-4 mr-2" />
                            Download PDF
                        </Button>
                    </div>
                </div>

                {/* Overall Score Card */}
                <Card className="mb-6 overflow-hidden">
                    <div className={`h-2 bg-gradient-to-r ${getScoreGradient(evaluation.overallScore)}`} />
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-medium text-muted-foreground">Overall Score</h2>
                                <div className={`text-5xl font-bold ${getScoreColor(evaluation.overallScore)}`}>
                                    {evaluation.overallScore}%
                                </div>
                                <p className="text-sm text-muted-foreground mt-1">
                                    {evaluation.overallScore >= 80 ? 'Excellent Performance!' :
                                        evaluation.overallScore >= 60 ? 'Good Performance' : 'Needs Improvement'}
                                </p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                {[
                                    { label: 'Technical', score: evaluation.technicalScore, icon: Brain },
                                    { label: 'Communication', score: evaluation.communicationScore, icon: MessageSquare },
                                    { label: 'Confidence', score: evaluation.confidenceScore, icon: TrendingUp },
                                    { label: 'STAR Method', score: evaluation.starMethodScore, icon: Star },
                                ].map(item => (
                                    <div key={item.label} className="text-center p-3 bg-muted/50 rounded-lg min-w-[120px]">
                                        <item.icon className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                                        <div className={`text-xl font-bold ${getScoreColor(item.score)}`}>{item.score}%</div>
                                        <div className="text-xs text-muted-foreground">{item.label}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* AI Insights */}
                <Card className="mb-6 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Sparkles className="h-5 w-5 text-primary" />
                            AI Insights
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground leading-relaxed">{evaluation.aiInsights}</p>
                    </CardContent>
                </Card>

                {/* Strengths & Weaknesses */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-green-600">
                                <CheckCircle2 className="h-5 w-5" />
                                Strengths
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-3">
                                {evaluation.strengths.map((strength, idx) => (
                                    <li key={idx} className="flex items-start gap-2">
                                        <TrendingUp className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                                        <span className="text-sm">{strength}</span>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-amber-600">
                                <Target className="h-5 w-5" />
                                Areas to Improve
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-3">
                                {evaluation.weaknesses.map((weakness, idx) => (
                                    <li key={idx} className="flex items-start gap-2">
                                        <TrendingDown className="h-4 w-4 text-amber-500 mt-1 flex-shrink-0" />
                                        <span className="text-sm">{weakness}</span>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                </div>

                {/* Per-Question Breakdown */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BarChart3 className="h-5 w-5" />
                            Question-by-Question Breakdown
                        </CardTitle>
                        <CardDescription>Detailed analysis of each interview question</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {questions.map((q, idx) => (
                            <div key={idx} className="p-4 bg-muted/30 rounded-lg space-y-3">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={`text-xs px-2 py-0.5 rounded-full ${getTypeColor(q.type)}`}>
                                                {q.type}
                                            </span>
                                            <span className="text-xs text-muted-foreground">Q{idx + 1}</span>
                                        </div>
                                        <h4 className="font-medium">{q.question}</h4>
                                    </div>
                                    <div className={`text-lg font-bold ${getScoreColor(q.score)}`}>
                                        {q.score}%
                                    </div>
                                </div>
                                <div className="pl-4 border-l-2 border-muted">
                                    <p className="text-sm text-muted-foreground italic mb-2">Your answer: &quot;{q.answer}&quot;</p>
                                    <p className="text-sm"><span className="font-medium">Feedback:</span> {q.feedback}</p>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* Recommendations */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Lightbulb className="h-5 w-5 text-yellow-500" />
                            Personalized Recommendations
                        </CardTitle>
                        <CardDescription>Based on your performance, here&apos;s what to focus on next</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {evaluation.recommendations.map((rec, idx) => (
                                <div key={idx} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                                    <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                        <span className="text-xs font-medium text-primary">{idx + 1}</span>
                                    </div>
                                    <p className="text-sm">{rec}</p>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Action Buttons */}
                <div className="flex justify-center gap-4">
                    <Button variant="outline" onClick={() => router.push('/interviews/new')}>
                        <Target className="h-4 w-4 mr-2" />
                        Practice Again
                    </Button>
                    <Button onClick={() => router.push('/courses')}>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Explore Courses
                    </Button>
                </div>
            </div>
        </div>
    )
}
