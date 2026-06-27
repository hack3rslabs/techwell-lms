"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Mail, Phone, Download, ArrowLeft, BookOpen, Zap, Briefcase, ExternalLink, Calendar } from "lucide-react";
import Link from "next/link";

export default function TalentPoolCandidatePage() {
    const { id } = useParams();
    const router = useRouter();
    const [student, setStudent] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchStudent = async () => {
            try {
                const res = await api.get(`/ats/talent-pool/${id}`);
                setStudent(res.data);
            } catch (error) {
                console.error("Failed to fetch student", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchStudent();
    }, [id]);

    if (isLoading) return (
        <div className="flex justify-center items-center h-[60vh]">
            <Loader2 className="animate-spin h-8 w-8 text-primary" />
        </div>
    );

    if (!student) return (
        <div className="text-center py-20 text-muted-foreground">
            Student not found.
        </div>
    );

    const cp = student.candidateProfile || {};
    const avgScore = student.interviews?.length > 0 
        ? Math.round(student.interviews.reduce((a: any, b: any) => a + (b.evaluation?.overallScore || 0), 0) / student.interviews.length)
        : 0;

    return (
        <div className="max-w-5xl mx-auto py-6 px-4 animate-in fade-in duration-500">
            <Button variant="ghost" onClick={() => router.back()} className="mb-4 gap-2">
                <ArrowLeft className="h-4 w-4" /> Back to Talent Pool
            </Button>

            <div className="grid gap-6 md:grid-cols-3">
                {/* Sidebar Profile */}
                <Card className="md:col-span-1 glass-card">
                    <CardContent className="pt-6 flex flex-col items-center text-center">
                        <Avatar className="h-24 w-24 mb-4 ring-4 ring-primary/10">
                            <AvatarImage src={student.avatar} />
                            <AvatarFallback className="text-xl bg-primary/10 text-primary font-bold">{student.name[0]}</AvatarFallback>
                        </Avatar>
                        <h2 className="text-xl font-bold">{student.name}</h2>
                        <p className="text-sm text-muted-foreground mb-4">{cp.interestedRole || "Techwell Student"}</p>

                        <div className="w-full space-y-2 text-left text-sm bg-slate-50 p-4 rounded-xl border mb-6">
                            <div className="flex items-center gap-2">
                                <Phone className="w-4 h-4 text-muted-foreground" /> {student.phone || "N/A"}
                            </div>
                            <div className="flex items-center gap-2">
                                <Mail className="w-4 h-4 text-muted-foreground" /> {student.email}
                            </div>
                            {cp.expectedCTC && (
                                <div className="flex items-center gap-2 mt-2 pt-2 border-t">
                                    <Briefcase className="w-4 h-4 text-muted-foreground" /> Exp CTC: {cp.expectedCTC}
                                </div>
                            )}
                        </div>

                        <div className="w-full space-y-2">
                            {cp.resumeUrl && (
                                <Button className="w-full" variant="outline" onClick={() => window.open(cp.resumeUrl, '_blank')}>
                                    <Download className="mr-2 h-4 w-4" /> Download Resume
                                </Button>
                            )}
                            {/* Invite to Apply */}
                            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                                <Mail className="mr-2 h-4 w-4" /> Invite to Apply
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Main Content */}
                <div className="md:col-span-2 space-y-6">
                    <Tabs defaultValue="skills">
                        <TabsList className="w-full grid grid-cols-3">
                            <TabsTrigger value="skills">Skills & Education</TabsTrigger>
                            <TabsTrigger value="lms">LMS Progress</TabsTrigger>
                            <TabsTrigger value="ai">AI Interviews ({student.interviews?.length || 0})</TabsTrigger>
                        </TabsList>

                        <TabsContent value="skills" className="space-y-4">
                            <Card className="glass-card">
                                <CardHeader>
                                    <CardTitle className="text-base flex items-center gap-2">
                                        <Zap className="h-4 w-4 text-amber-500" /> Core Skills
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {cp.skills && cp.skills.length > 0 ? (
                                        <div className="flex flex-wrap gap-2">
                                            {cp.skills.map((s: string, i: number) => (
                                                <Badge key={i} variant="secondary" className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800">{s}</Badge>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-muted-foreground text-sm">No skills listed.</p>
                                    )}
                                </CardContent>
                            </Card>

                            <Card className="glass-card">
                                <CardHeader>
                                    <CardTitle className="text-base flex items-center gap-2">
                                        <BookOpen className="h-4 w-4 text-blue-500" /> Education Background
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2 text-sm">
                                    <div className="flex justify-between border-b pb-2">
                                        <span className="text-muted-foreground">Highest Degree</span>
                                        <span className="font-medium">{cp.education || "Not specified"}</span>
                                    </div>
                                    <div className="flex justify-between border-b pb-2">
                                        <span className="text-muted-foreground">Passed Out Year</span>
                                        <span className="font-medium">{cp.passedOutYear || "Not specified"}</span>
                                    </div>
                                    <div className="flex justify-between pb-2">
                                        <span className="text-muted-foreground">Domain Category</span>
                                        <span className="font-medium">{cp.category || "Not specified"}</span>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="lms" className="space-y-4">
                            <Card className="glass-card">
                                <CardHeader>
                                    <CardTitle className="text-base flex items-center gap-2">
                                        <BookOpen className="h-4 w-4 text-blue-600" /> Techwell Learning Progress
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {student.enrollments && student.enrollments.length > 0 ? (
                                        student.enrollments.map((e: any, idx: number) => (
                                            <div key={idx} className="space-y-2 p-4 border rounded-xl bg-slate-50">
                                                <div className="flex justify-between items-center">
                                                    <span className="font-semibold text-slate-800">{e.course.title}</span>
                                                    <span className="text-sm font-bold text-slate-600">{e.progress}%</span>
                                                </div>
                                                <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                                                    <div 
                                                        className={`h-full rounded-full ${e.progress === 100 ? 'bg-green-500' : 'bg-blue-600'}`} 
                                                        style={{ width: `${e.progress}%` }} 
                                                    />
                                                </div>
                                                <div className="flex justify-between items-center mt-1">
                                                    <Badge variant="outline" className="text-[10px] bg-white">{e.course.difficulty}</Badge>
                                                    {e.status === 'COMPLETED' && <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-none text-[10px]">Completed</Badge>}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-muted-foreground text-sm">No course enrollments found.</p>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="ai" className="space-y-4">
                            <Card className="glass-card">
                                <CardHeader className="pb-4 border-b mb-4">
                                    <div className="flex justify-between items-center">
                                        <CardTitle className="text-base flex items-center gap-2">
                                            <Zap className="h-4 w-4 text-amber-500" /> AI Mock Interviews
                                        </CardTitle>
                                        <div className="text-right">
                                            <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold">Average Score</p>
                                            <p className={`text-2xl font-black ${avgScore >= 75 ? 'text-green-600' : avgScore >= 50 ? 'text-amber-500' : 'text-slate-400'}`}>
                                                {avgScore}%
                                            </p>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    {student.interviews && student.interviews.length > 0 ? (
                                        <div className="space-y-3">
                                            {student.interviews.map((interview: any) => (
                                                <div key={interview.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-slate-50 transition-colors">
                                                    <div>
                                                        <div className="font-semibold text-sm text-slate-800">{interview.role} ({interview.domain})</div>
                                                        <div className="text-xs text-muted-foreground gap-2 flex items-center mt-1">
                                                            <Calendar className="h-3 w-3" /> {new Date(interview.createdAt).toLocaleDateString()}
                                                            <span className="mx-1">•</span>
                                                            <Badge variant="outline" className="text-[9px] h-4">{interview.difficulty}</Badge>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-4">
                                                        <div className="text-right">
                                                            <span className="text-[10px] text-muted-foreground uppercase tracking-wider block">Tech Score</span>
                                                            <span className="font-bold text-slate-700">{interview.evaluation?.technicalScore || 0}%</span>
                                                        </div>
                                                        <div className="h-8 w-px bg-slate-200"></div>
                                                        <Button size="sm" variant="outline" asChild>
                                                            <Link href={`/student/career-hub/mock-interview/${interview.id}/feedback`} target="_blank">
                                                                Report <ExternalLink className="ml-1.5 h-3 w-3" />
                                                            </Link>
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 text-muted-foreground">
                                            <Zap className="mx-auto h-8 w-8 mb-2 opacity-20" />
                                            <p>This student hasn't taken any AI mock interviews yet.</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    );
}
