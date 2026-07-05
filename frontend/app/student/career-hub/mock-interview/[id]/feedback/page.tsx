"use client";

import React, { useEffect, useState } from "react";
import { ChevronDown, Loader2, ArrowLeft, Download } from "lucide-react";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import Link from "next/link";
import { Progress } from "@/components/ui/progress";

export default function FeedbackPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const [reportData, setReportData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchFeedback();
    }, [params.id]);

    const fetchFeedback = async () => {
        try {
            const res = await api.get(`/interviews/${params.id}/report`);
            setReportData(res.data.report);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col justify-center items-center min-h-[50vh]">
                <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">Analyzing your responses...</p>
            </div>
        );
    }

    if (!reportData) {
        return (
            <div className="p-10 text-center">
                <h2 className="font-bold text-xl text-gray-500 my-5">
                    No interview feedback record found.
                </h2>
                <Button onClick={() => router.replace("/student/career-hub/mock-interview")}>
                    Go Back
                </Button>
            </div>
        );
    }

    const { evaluation, questionBreakdown, interview } = reportData;

    return (
        <div className="container mx-auto p-6 max-w-5xl my-6 space-y-8">
            <div className="flex justify-between items-center">
                <Button variant="ghost" asChild>
                    <Link href="/student/career-hub/mock-interview"><ArrowLeft className="h-4 w-4 mr-2"/> Back to Interviews</Link>
                </Button>
                <Button variant="outline">
                    <Download className="h-4 w-4 mr-2"/> Download Report
                </Button>
            </div>

            <div>
                <h2 className="text-3xl font-bold text-primary">Interview Performance Report</h2>
                <p className="text-muted-foreground mt-2">
                    Role: {interview.role} • Domain: {interview.domain}
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="md:col-span-1 bg-primary/5 border-primary/20">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Overall Score</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col items-center justify-center py-4">
                            <span className="text-5xl font-bold text-primary">{evaluation.overallScore}</span>
                            <span className="text-sm text-muted-foreground">out of 100</span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="md:col-span-3">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Skill Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-4">
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span>Technical Knowledge</span>
                                <span className="font-bold">{evaluation.technicalScore}%</span>
                            </div>
                            <Progress value={evaluation.technicalScore} className="h-2" />
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span>Communication</span>
                                <span className="font-bold">{evaluation.communicationScore}%</span>
                            </div>
                            <Progress value={evaluation.communicationScore} className="h-2" />
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span>Confidence</span>
                                <span className="font-bold">{evaluation.confidenceScore}%</span>
                            </div>
                            <Progress value={evaluation.confidenceScore} className="h-2" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>AI Insights & Feedback</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="p-4 bg-blue-50 text-blue-900 rounded-lg whitespace-pre-wrap text-sm leading-relaxed border border-blue-100">
                        {evaluation.aiInsights}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h3 className="font-semibold text-green-700 mb-3 flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full bg-green-500"></div> Strengths
                            </h3>
                            <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                                {evaluation.strengths.map((str: string, i: number) => (
                                    <li key={i}>{str}</li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-semibold text-red-700 mb-3 flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full bg-red-500"></div> Areas to Improve
                            </h3>
                            <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                                {evaluation.weaknesses && evaluation.weaknesses.map((imp: string, i: number) => (
                                    <li key={i}>{imp}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                    
                    {evaluation.recommendations && evaluation.recommendations.length > 0 && (
                        <div className="mt-6 border-t pt-4">
                            <h3 className="font-semibold text-purple-700 mb-3 flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full bg-purple-500"></div> Action Items
                            </h3>
                            <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
                                {evaluation.recommendations.map((rec: string, i: number) => (
                                    <li key={i}>{rec}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </CardContent>
            </Card>

            <div className="flex justify-end mb-4">
                 <Button onClick={() => router.push("/student/career-hub/mock-interview")}>
                     Start Quick Drill on Weaknesses 🚀
                 </Button>
            </div>

            <div className="space-y-4">
                <h3 className="text-xl font-bold">Question by Question Breakdown</h3>
                <p className="text-sm text-muted-foreground">Review your answers and the specific feedback for each question.</p>
                
                {questionBreakdown.map((item: any, index: number) => (
                    <Collapsible key={index} className="border rounded-lg bg-card">
                        <CollapsibleTrigger className="p-4 flex justify-between items-center w-full hover:bg-slate-50 transition-colors">
                            <div className="flex items-center gap-4 text-left">
                                <span className="bg-primary/10 text-primary font-bold w-8 h-8 flex items-center justify-center rounded-full shrink-0">
                                    Q{index + 1}
                                </span>
                                <span className="font-medium text-sm md:text-base">{item.question}</span>
                            </div>
                            <div className="flex items-center gap-4 shrink-0">
                                <span className={`text-sm font-bold ${item.score >= 70 ? 'text-green-600' : item.score >= 40 ? 'text-yellow-600' : 'text-red-600'}`}>
                                    Score: {item.score}
                                </span>
                                <ChevronDown className="h-5 w-5 text-muted-foreground" />
                            </div>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="p-4 border-t bg-slate-50/50">
                            <div className="flex flex-col gap-4">
                                <div>
                                    <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Your Answer</h4>
                                    <div className="p-3 bg-white border rounded text-sm text-slate-700">
                                        {item.answer}
                                    </div>
                                </div>
                                <div>
                                    <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Feedback</h4>
                                    <div className="p-3 bg-blue-50 border border-blue-100 rounded text-sm text-blue-900">
                                        {item.feedback}
                                    </div>
                                </div>
                            </div>
                        </CollapsibleContent>
                    </Collapsible>
                ))}
            </div>

            <div className="flex justify-center pt-8 pb-12">
                <Button size="lg" onClick={() => router.push("/student/career-hub/mock-interview")}>
                    Return to Dashboard
                </Button>
            </div>
        </div>
    );
}
