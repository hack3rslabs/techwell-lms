"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, ExternalLink, Calendar, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import api from "@/lib/api";

export default function AdminInterviewHistoryPage() {
    const [interviews, setInterviews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    async function fetchInterviews() {
        try {
            const res = await api.get('/interviews/admin/all');
            setInterviews(res.data.interviews || []);
        } catch (error) {
            console.error("Failed to fetch interviews", error);
        } finally {
            setLoading(false);
        }
    }


    useEffect(() => {
        fetchInterviews();
    }, []);
;

    const filtered = interviews.filter(i => 
        i.user?.name?.toLowerCase().includes(search.toLowerCase()) || 
        i.role?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">AI Interview History</h1>
                    <p className="text-muted-foreground">Global log of all AI Mock Interviews taken by students.</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Interview Logs</CardTitle>
                    <CardDescription>Review candidate performances and AI evaluations.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="relative mb-6">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by student name or job role..."
                            className="pl-10 max-w-md"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    {loading ? (
                        <div className="py-12 flex justify-center">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : (
                        <div className="rounded-md border">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50 border-b">
                                    <tr>
                                        <th className="px-6 py-3 font-medium text-slate-500">Student</th>
                                        <th className="px-6 py-3 font-medium text-slate-500">Target Role</th>
                                        <th className="px-6 py-3 font-medium text-slate-500">Status</th>
                                        <th className="px-6 py-3 font-medium text-slate-500">AI Score</th>
                                        <th className="px-6 py-3 font-medium text-slate-500">Date</th>
                                        <th className="px-6 py-3 text-right font-medium text-slate-500">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                                                No interviews found.
                                            </td>
                                        </tr>
                                    ) : filtered.map((interview) => (
                                        <tr key={interview.id} className="border-b last:border-0 hover:bg-slate-50">
                                            <td className="px-6 py-4 font-medium">{interview.user?.name || 'Unknown'}</td>
                                            <td className="px-6 py-4">{interview.role} ({interview.difficulty})</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                                                    interview.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 
                                                    interview.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700'
                                                }`}>
                                                    {interview.status}
                                                </span>
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
                                            <td className="px-6 py-4 text-muted-foreground flex items-center gap-2">
                                                <Calendar className="h-4 w-4" />
                                                {new Date(interview.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                {interview.status === 'COMPLETED' && (
                                                    <Button variant="outline" size="sm" asChild>
                                                        {/* Reuses the student feedback view which works based on interview ID */}
                                                        <Link href={`/student/career-hub/mock-interview/${interview.id}/feedback`} target="_blank">
                                                            View Report <ExternalLink className="ml-2 h-3 w-3" />
                                                        </Link>
                                                    </Button>
                                                )}
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
