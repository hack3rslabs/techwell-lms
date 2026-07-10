"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, ExternalLink, Calendar, Star, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import api from "@/lib/api";
import { useRouter } from "next/navigation";

export default function EmployerCandidateAIHistoryPage({ params }: { params: { id: string } }) {
    const [interviews, setInterviews] = useState<any[]>([]);
    const [candidateName, setCandidateName] = useState("");
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    async function fetchInterviews() {
        try {
            const res = await api.get(`/interviews/employer/candidate/${params.id}`);
            setInterviews(res.data.interviews || []);
            setCandidateName(res.data.candidateName || "Candidate");
        } catch (error) {
            console.error("Failed to fetch candidate AI interviews", error);
        } finally {
            setLoading(false);
        }
    }


    useEffect(() => {
        fetchInterviews();
    }, [params.id]);
;

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-12 max-w-5xl mx-auto mt-6">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{candidateName}'s AI Mock History</h1>
                    <p className="text-muted-foreground">Review the candidate's performance in AI-driven technical and HR interviews.</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Star className="h-5 w-5 text-purple-500"/> AI Assessment Records</CardTitle>
                    <CardDescription>Click View Report to see detailed transcript, technical scores, and AI feedback.</CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="py-12 flex justify-center">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : (
                        <div className="rounded-md border overflow-hidden">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50 border-b">
                                    <tr>
                                        <th className="px-6 py-3 font-medium text-slate-500">Domain/Role</th>
                                        <th className="px-6 py-3 font-medium text-slate-500">Difficulty</th>
                                        <th className="px-6 py-3 font-medium text-slate-500">Overall Score</th>
                                        <th className="px-6 py-3 font-medium text-slate-500">Technical</th>
                                        <th className="px-6 py-3 font-medium text-slate-500">Date</th>
                                        <th className="px-6 py-3 text-right font-medium text-slate-500">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {interviews.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-12 text-center text-slate-500 bg-white">
                                                This candidate has not completed any AI Mock Interviews yet.
                                            </td>
                                        </tr>
                                    ) : interviews.map((interview) => (
                                        <tr key={interview.id} className="border-b last:border-0 hover:bg-slate-50 bg-white">
                                            <td className="px-6 py-4 font-medium">{interview.role} <br/><span className="text-xs text-muted-foreground">{interview.domain}</span></td>
                                            <td className="px-6 py-4">
                                                <span className="text-xs border px-2 py-1 rounded bg-slate-100">{interview.difficulty}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                {interview.evaluation?.overallScore ? (
                                                    <span className={`font-bold ${interview.evaluation.overallScore >= 70 ? 'text-green-600' : interview.evaluation.overallScore >= 40 ? 'text-yellow-600' : 'text-red-600'}`}>
                                                        {interview.evaluation.overallScore}/100
                                                    </span>
                                                ) : (
                                                    <span className="text-muted-foreground">-</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                {interview.evaluation?.technicalScore ? (
                                                    <span className="font-semibold text-slate-700">
                                                        {interview.evaluation.technicalScore}%
                                                    </span>
                                                ) : (
                                                    <span className="text-muted-foreground">-</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-muted-foreground flex items-center gap-2">
                                                <Calendar className="h-4 w-4" />
                                                {new Date(interview.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <Button variant="outline" size="sm" asChild>
                                                    {/* Employer views the same report template */}
                                                    <Link href={`/student/career-hub/mock-interview/${interview.id}/feedback`} target="_blank">
                                                        View Full Report <ExternalLink className="ml-2 h-3 w-3" />
                                                    </Link>
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
