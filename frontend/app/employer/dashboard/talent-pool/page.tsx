"use client";

import React, { useState, useEffect } from "react";
import api from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Loader2, Star, BookOpen, ExternalLink, Zap } from "lucide-react";
import { useRouter } from "next/navigation";

interface Talent {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    skills: string[];
    avgAiScore: number;
    interviewCount: number;
    expectedCTC?: string;
    interestedRole?: string;
    enrollments: {
        progress: number;
        status: string;
        course: { title: string; difficulty: string };
    }[];
}

export default function TalentPoolPage() {
    const [talent, setTalent] = useState<Talent[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [minScore, setMinScore] = useState("");
    const router = useRouter();

    async function fetchTalent() {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (searchQuery) params.append("search", searchQuery);
            if (minScore) params.append("minAiScore", minScore);
            const res = await api.get(`/ats/talent-pool?${params.toString()}`);
            setTalent(res.data.talent || []);
        } catch (error) {
            console.error("Failed to fetch talent pool", error);
        } finally {
            setLoading(false);
        }
    }


    useEffect(() => {
        fetchTalent();
    }, []);
;

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchTalent();
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-12 max-w-6xl mx-auto">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Active Talent Pool</h1>
                <p className="text-muted-foreground mt-1">Source top-performing Techwell students based on their course progress and AI interview scores.</p>
            </div>

            <Card className="bg-white/50 backdrop-blur border-primary/20">
                <CardContent className="p-4">
                    <form onSubmit={handleSearch} className="flex gap-4 items-end">
                        <div className="flex-1 space-y-1.5">
                            <label className="text-sm font-medium text-gray-700">Search Skills or Names</label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input 
                                    className="pl-10" 
                                    placeholder="e.g. React, Node.js, John..." 
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="w-48 space-y-1.5">
                            <label className="text-sm font-medium text-gray-700">Min AI Technical Score</label>
                            <Input 
                                type="number" 
                                placeholder="e.g. 70" 
                                value={minScore}
                                onChange={(e) => setMinScore(e.target.value)}
                            />
                        </div>
                        <Button type="submit" className="gap-2">
                            <Search className="h-4 w-4" /> Search
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {loading ? (
                <div className="py-20 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
            ) : talent.length === 0 ? (
                <div className="text-center py-20 text-muted-foreground border rounded-xl bg-slate-50/50">
                    <Search className="h-10 w-10 mx-auto mb-3 opacity-20" />
                    <p className="text-lg font-medium text-slate-700">No candidates found.</p>
                    <p className="text-sm">Try adjusting your filters to broaden your search.</p>
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {talent.map((t) => (
                        <Card key={t.id} className="hover:shadow-lg transition-shadow border-gray-200 overflow-hidden flex flex-col">
                            <CardContent className="p-0 flex-1 flex flex-col">
                                <div className="p-6 pb-4">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex gap-3 items-center">
                                            <Avatar className="h-12 w-12 border">
                                                <AvatarImage src={t.avatar} />
                                                <AvatarFallback className="bg-primary/10 text-primary font-bold">
                                                    {t.name.charAt(0)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <h3 className="font-bold text-gray-900">{t.name}</h3>
                                                <p className="text-xs text-muted-foreground">{t.interestedRole || "Student"}</p>
                                            </div>
                                        </div>
                                        {t.avgAiScore > 0 && (
                                            <Badge variant={t.avgAiScore >= 75 ? "default" : "secondary"} className={t.avgAiScore >= 75 ? "bg-green-600 hover:bg-green-700" : "bg-amber-500"}>
                                                <Zap className="h-3 w-3 mr-1" /> {t.avgAiScore}% AI Score
                                            </Badge>
                                        )}
                                    </div>

                                    <div className="space-y-4 flex-1">
                                        {/* Skills */}
                                        {t.skills && t.skills.length > 0 && (
                                            <div className="flex flex-wrap gap-1.5">
                                                {t.skills.slice(0, 4).map((s, i) => (
                                                    <Badge key={i} variant="outline" className="text-[10px] bg-slate-50">{s}</Badge>
                                                ))}
                                                {t.skills.length > 4 && <Badge variant="outline" className="text-[10px] bg-slate-50">+{t.skills.length - 4}</Badge>}
                                            </div>
                                        )}

                                        {/* Course Highlight */}
                                        {t.enrollments && t.enrollments.length > 0 ? (
                                            <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                                                <div className="text-xs font-semibold text-slate-700 flex items-center gap-1.5 mb-2">
                                                    <BookOpen className="h-3 w-3 text-blue-500" /> Top Courses
                                                </div>
                                                <div className="space-y-2">
                                                    {t.enrollments.slice(0, 2).map((e, i) => (
                                                        <div key={i}>
                                                            <div className="flex justify-between text-[10px] mb-1">
                                                                <span className="truncate pr-2 font-medium">{e.course.title}</span>
                                                                <span className={e.progress === 100 ? "text-green-600 font-bold" : "text-slate-500"}>{e.progress}%</span>
                                                            </div>
                                                            <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
                                                                <div className={`h-full rounded-full ${e.progress === 100 ? 'bg-green-500' : 'bg-blue-500'}`} style={{ width: `${e.progress}%` }} />
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="bg-slate-50 rounded-lg p-3 border border-slate-100 text-center">
                                                <span className="text-xs text-muted-foreground">No course enrollments</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="p-4 bg-slate-50 border-t mt-auto">
                                    <Button className="w-full font-semibold shadow-sm" variant="default" onClick={() => router.push(`/employer/dashboard/talent-pool/candidate/${t.id}`)}>
                                        View Full Profile <ExternalLink className="h-3 w-3 ml-2" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
