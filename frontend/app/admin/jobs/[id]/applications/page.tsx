"use client"

import { useEffect, useState } from "react";
import React from "react";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft, User, Mail, Phone, Calendar, ExternalLink, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { jobsApi } from "@/lib/api";

interface Application {
    id: string;
    source: string;
    status: string;
    resumeUrl: string;
    coverLetter?: string;
    createdAt: string;
    externalName?: string;
    externalEmail?: string;
    externalPhone?: string;
    applicant?: {
        name: string;
        email: string;
        phone: string;
        avatar?: string;
    };
    atsScore?: number;
}

export default function JobApplicationsPage() {
    const params = useParams();
    const router = useRouter();
    const [applications, setApplications] = useState<Application[]>([]);
    const [loading, setLoading] = useState(true);
    const [jobDetails, setJobDetails] = useState<any>(null);



    const fetchData = React.useCallback(async () => {
        try {
            setLoading(true);
            const [appsRes, jobRes] = await Promise.all([
                jobsApi.getApplications(params.id as string),
                jobsApi.getAdminListings() // We'll find ours in the list or fetch specifically if needed
            ]);
            setApplications(appsRes.data || []);

            const currentJob = jobRes.data?.find((j: any) => j.id === params.id);
            setJobDetails(currentJob);
        } catch (_error) {
            console.error("Failed to fetch applications", _error);
            toast.error("Failed to load applications");
        } finally {
            setLoading(false);
        }
    }, [params.id]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'APPLIED': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'REVIEWING': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case 'SHORTLISTED': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'INTERVIEWING': return 'bg-purple-100 text-purple-700 border-purple-200';
            case 'OFFERED': return 'bg-green-100 text-green-700 border-green-200';
            case 'REJECTED': return 'bg-red-100 text-red-700 border-red-200';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const handleUpdateStatus = async (appId: string, newStatus: string) => {
        try {
            await jobsApi.updateApplicationStatus(params.id as string, appId, newStatus);
            toast.success(`Status updated to ${newStatus}`);
            fetchData();
        } catch (_error) {
            toast.error("Failed to update status");
        }
    };

    return (
        <div className="p-8 space-y-8 min-h-screen bg-gray-50/50">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" onClick={() => router.back()} className="rounded-xl">
                    <ChevronLeft className="w-5 h-5" />
                </Button>
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-gray-900">Job Applications</h1>
                    <p className="text-muted-foreground font-medium">
                        Managing candidates for <span className="text-primary font-bold">{jobDetails?.title || 'Loading...'}</span>
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="rounded-[2rem] border-none shadow-xl shadow-slate-200/50">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-black uppercase text-slate-400 tracking-widest">Total Apps</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-black text-slate-900">{applications.length}</div>
                    </CardContent>
                </Card>
                <Card className="rounded-[2rem] border-none shadow-xl shadow-slate-200/50">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-black uppercase text-slate-400 tracking-widest">In Review</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-black text-blue-600">
                            {applications.filter(a => a.status === 'APPLIED' || a.status === 'REVIEWING').length}
                        </div>
                    </CardContent>
                </Card>
                <Card className="rounded-[2rem] border-none shadow-xl shadow-slate-200/50">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-black uppercase text-slate-400 tracking-widest">Shortlisted</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-black text-emerald-600">
                            {applications.filter(a => a.status === 'SHORTLISTED').length}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="bg-white rounded-[2rem] border border-gray-200 shadow-xl shadow-slate-200/40 overflow-hidden">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-slate-50/50 border-b border-slate-100">
                                <TableHead className="font-black text-[11px] uppercase tracking-widest text-slate-500 py-6">Candidate</TableHead>
                                <TableHead className="font-black text-[11px] uppercase tracking-widest text-slate-500">Contact</TableHead>
                                <TableHead className="font-black text-[11px] uppercase tracking-widest text-slate-500">Source</TableHead>
                                <TableHead className="font-black text-[11px] uppercase tracking-widest text-slate-500">AI Score</TableHead>
                                <TableHead className="font-black text-[11px] uppercase tracking-widest text-slate-500">Applied On</TableHead>
                                <TableHead className="font-black text-[11px] uppercase tracking-widest text-slate-500">Status</TableHead>
                                <TableHead className="text-right font-black text-[11px] uppercase tracking-widest text-slate-500 pr-8">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <TableRow key={i} className="animate-pulse">
                                        <TableCell colSpan={6} className="h-20 bg-slate-50/20"></TableCell>
                                    </TableRow>
                                ))
                            ) : applications.map((app) => {
                                const name = app.source === 'INTERNAL' ? app.applicant?.name : app.externalName;
                                const email = app.source === 'INTERNAL' ? app.applicant?.email : app.externalEmail;
                                const phone = app.source === 'INTERNAL' ? app.applicant?.phone : app.externalPhone;

                                return (
                                    <TableRow key={app.id} className="hover:bg-slate-50/80 transition-colors">
                                        <TableCell className="py-5">
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-10 w-10 border border-slate-100 p-0.5">
                                                    <AvatarImage src={app.applicant?.avatar} />
                                                    <AvatarFallback className="bg-primary/5 text-primary text-xs font-black">
                                                        {name?.substring(0, 2).toUpperCase() || '??'}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-slate-900">{name}</span>
                                                    <Badge variant="outline" className="w-fit text-[9px] h-4 font-black uppercase tracking-tighter mt-1">
                                                        {app.source} Match
                                                    </Badge>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
                                                    <Mail className="w-3.5 h-3.5 text-slate-400" /> {email}
                                                </div>
                                                <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
                                                    <Phone className="w-3.5 h-3.5 text-slate-400" /> {phone || 'N/A'}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={app.source === 'INTERNAL' ? 'bg-indigo-50 text-indigo-600' : 'bg-orange-50 text-orange-600'}>
                                                {app.source}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {app.applicant?.aiScore ? (
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-bold text-emerald-600">AI: {app.applicant.aiScore}/100</span>
                                                    <span className="text-[10px] text-muted-foreground">STAR: {app.applicant.starScore}/100</span>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-muted-foreground">-</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                                                <Calendar className="w-3.5 h-3.5" />
                                                {new Date(app.createdAt).toLocaleDateString()}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={`border shadow-none font-black text-[10px] uppercase tracking-widest ${getStatusColor(app.status)}`}>
                                                {app.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right pr-8">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button size="sm" variant="ghost" className="h-8 w-8 p-0" title="View Resume" asChild>
                                                    <a href={app.resumeUrl} target="_blank" rel="noreferrer">
                                                        <ExternalLink className="w-4 h-4 text-blue-600" />
                                                    </a>
                                                </Button>
                                                <div className="flex gap-1">
                                                    {app.status !== 'SHORTLISTED' && (
                                                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-emerald-600 hover:bg-emerald-50" onClick={() => handleUpdateStatus(app.id, 'SHORTLISTED')} title="Shortlist">
                                                            <CheckCircle2 className="w-4 h-4" />
                                                        </Button>
                                                    )}
                                                    {app.status !== 'REJECTED' && (
                                                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-red-600 hover:bg-red-50" onClick={() => handleUpdateStatus(app.id, 'REJECTED')} title="Reject">
                                                            <XCircle className="w-4 h-4" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                            {applications.length === 0 && !loading && (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-20 text-slate-400">
                                        <div className="flex flex-col items-center">
                                            <User className="h-12 w-12 opacity-10 mb-4" />
                                            <p className="font-bold text-lg">No Applications Yet</p>
                                            <p className="text-sm">Candidates who apply will appear here.</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    );
}
