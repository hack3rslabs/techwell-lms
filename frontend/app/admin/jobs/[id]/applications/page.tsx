"use client"

import { useEffect, useState } from "react";
import React from "react";
import { useParams, useRouter } from "next/navigation";
import {
    ChevronLeft, User, Mail, Phone, Calendar, ExternalLink, CheckCircle2,
    XCircle, List, LayoutGrid, Plus, Award, MessageSquare, Video,
    Loader2, ClipboardList, Star
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { jobsApi } from "@/lib/api";
import PipelineBoard from "./PipelineBoard";

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
    statusHistory?: any[];
    applicant?: {
        id?: string;
        name: string;
        email: string;
        phone: string;
        avatar?: string;
        aiScore?: number;
    };
    interviews?: any[];
    offers?: any[];
    atsScore?: number;
}

const STATUS_OPTIONS = [
    'APPLIED', 'VIEWED', 'SCREENED', 'SHORTLISTED',
    'INTERVIEW_SCHEDULED', 'INTERVIEWED', 'SELECTED',
    'OFFER_RELEASED', 'OFFER_ACCEPTED', 'BG_VERIFICATION',
    'DOCS_VERIFIED', 'JOINED', 'NOT_JOINED', 'REJECTED', 'ON_HOLD', 'WITHDRAWN'
];

const STATUS_COLOR: Record<string, string> = {
    APPLIED: 'bg-blue-100 text-blue-700',
    VIEWED: 'bg-indigo-100 text-indigo-700',
    SCREENED: 'bg-violet-100 text-violet-700',
    SHORTLISTED: 'bg-amber-100 text-amber-700',
    INTERVIEW_SCHEDULED: 'bg-orange-100 text-orange-700',
    INTERVIEWED: 'bg-orange-100 text-orange-600',
    SELECTED: 'bg-emerald-100 text-emerald-700',
    OFFER_RELEASED: 'bg-emerald-100 text-emerald-700',
    OFFER_ACCEPTED: 'bg-green-100 text-green-800',
    JOINED: 'bg-green-200 text-green-900',
    NOT_JOINED: 'bg-slate-100 text-slate-600',
    REJECTED: 'bg-red-100 text-red-700',
    ON_HOLD: 'bg-yellow-100 text-yellow-700',
    WITHDRAWN: 'bg-slate-100 text-slate-500',
    BG_VERIFICATION: 'bg-cyan-100 text-cyan-700',
    DOCS_VERIFIED: 'bg-teal-100 text-teal-700',
};

export default function JobApplicationsPage() {
    const params = useParams();
    const router = useRouter();
    const jobId = params.id as string;

    const [applications, setApplications] = useState<Application[]>([]);
    const [loading, setLoading] = useState(true);
    const [jobDetails, setJobDetails] = useState<any>(null);
    const [viewMode, setViewMode] = useState<'list' | 'kanban'>('kanban');

    // Selected app for timeline/detail
    const [selectedApp, setSelectedApp] = useState<Application | null>(null);

    // Interview scheduling
    const [scheduleApp, setScheduleApp] = useState<Application | null>(null);
    const [scheduleForm, setScheduleForm] = useState({
        roundName: '', roundType: 'TECHNICAL', scheduledAt: '', duration: 45, meetingLink: '', location: ''
    });
    const [scheduling, setScheduling] = useState(false);

    // Offer release
    const [offerApp, setOfferApp] = useState<Application | null>(null);
    const [offerForm, setOfferForm] = useState({
        ctc: '', designation: '', department: '', doj: '', reportingManager: '', offerLetterUrl: ''
    });
    const [releasingOffer, setReleasingOffer] = useState(false);

    // Feedback
    const [feedbackApp, setFeedbackApp] = useState<Application | null>(null);
    const [feedbackForm, setFeedbackForm] = useState({ joinedStatus: 'JOINED', feedback: '', suggestions: '' });
    const [submittingFeedback, setSubmittingFeedback] = useState(false);

    // Interview feedback
    const [feedbackInterview, setFeedbackInterview] = useState<any>(null);
    const [ivFeedbackForm, setIvFeedbackForm] = useState({ feedback: '', score: 70, result: 'PASSED', status: 'COMPLETED' });
    const [savingIvFeedback, setSavingIvFeedback] = useState(false);

    const fetchData = React.useCallback(async () => {
        try {
            setLoading(true);
            const [appsRes, jobRes] = await Promise.all([
                jobsApi.getApplications(jobId),
                jobsApi.getAdminListings()
            ]);
            setApplications(appsRes.data || []);
            const currentJob = jobRes.data?.find((j: any) => j.id === jobId);
            setJobDetails(currentJob);
        } catch {
            toast.error("Failed to load applications");
        } finally {
            setLoading(false);
        }
    }, [jobId]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleUpdateStatus = async (appId: string, newStatus: string, note?: string) => {
        try {
            await jobsApi.updateApplicationStatus(jobId, appId, newStatus, note);
            toast.success(`Status → ${newStatus}`);
            fetchData();
        } catch {
            toast.error("Failed to update status");
        }
    };

    const handleScheduleInterview = async () => {
        if (!scheduleApp || !scheduleForm.roundName || !scheduleForm.scheduledAt) {
            return toast.error('Round name and scheduled time are required');
        }
        setScheduling(true);
        try {
            await jobsApi.scheduleInterview(scheduleApp.id, scheduleForm);
            toast.success('Interview scheduled!');
            setScheduleApp(null);
            setScheduleForm({ roundName: '', roundType: 'TECHNICAL', scheduledAt: '', duration: 45, meetingLink: '', location: '' });
            fetchData();
        } catch (err: any) {
            toast.error(err.response?.data?.error || 'Failed to schedule interview');
        } finally {
            setScheduling(false);
        }
    };

    const handleReleaseOffer = async () => {
        if (!offerApp) return;
        setReleasingOffer(true);
        try {
            await jobsApi.releaseOffer(offerApp.id, offerForm);
            toast.success('Offer released successfully!');
            setOfferApp(null);
            setOfferForm({ ctc: '', designation: '', department: '', doj: '', reportingManager: '', offerLetterUrl: '' });
            fetchData();
        } catch (err: any) {
            toast.error(err.response?.data?.error || 'Failed to release offer');
        } finally {
            setReleasingOffer(false);
        }
    };

    const handleSubmitFeedback = async () => {
        if (!feedbackApp) return;
        setSubmittingFeedback(true);
        try {
            await jobsApi.submitFeedback(feedbackApp.id, feedbackForm);
            toast.success('Feedback submitted!');
            setFeedbackApp(null);
            fetchData();
        } catch {
            toast.error('Failed to submit feedback');
        } finally {
            setSubmittingFeedback(false);
        }
    };

    const handleSaveIvFeedback = async () => {
        if (!feedbackInterview) return;
        setSavingIvFeedback(true);
        try {
            await jobsApi.updateInterview(feedbackInterview.id, ivFeedbackForm);
            toast.success('Interview feedback saved!');
            setFeedbackInterview(null);
            fetchData();
        } catch {
            toast.error('Failed to save feedback');
        } finally {
            setSavingIvFeedback(false);
        }
    };

    const getName = (app: Application) =>
        app.source === 'INTERNAL' ? app.applicant?.name : app.externalName;
    const getEmail = (app: Application) =>
        app.source === 'INTERNAL' ? app.applicant?.email : app.externalEmail;
    const getPhone = (app: Application) =>
        app.source === 'INTERNAL' ? app.applicant?.phone : app.externalPhone;

    const stats = {
        total: applications.length,
        shortlisted: applications.filter(a => ['SHORTLISTED', 'INTERVIEW_SCHEDULED', 'INTERVIEWED', 'SELECTED', 'OFFER_RELEASED', 'OFFER_ACCEPTED', 'JOINED'].includes(a.status)).length,
        interviewing: applications.filter(a => ['INTERVIEW_SCHEDULED', 'INTERVIEWED'].includes(a.status)).length,
        offered: applications.filter(a => ['OFFER_RELEASED', 'OFFER_ACCEPTED'].includes(a.status)).length,
        joined: applications.filter(a => a.status === 'JOINED').length,
    };

    return (
        <div className="p-6 space-y-6 min-h-screen bg-gray-50/50">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" onClick={() => router.back()} className="rounded-xl">
                    <ChevronLeft className="w-5 h-5" />
                </Button>
                <div className="flex-1">
                    <h1 className="text-2xl font-black tracking-tight text-gray-900">Applicant Tracking</h1>
                    <p className="text-muted-foreground text-sm font-medium">
                        {jobDetails?.title || 'Loading...'} · Full Placement Pipeline
                    </p>
                </div>
                <div className="flex items-center gap-2 bg-white p-1 rounded-xl shadow-sm border border-slate-200">
                    <Button variant={viewMode === 'kanban' ? 'default' : 'ghost'} size="sm" onClick={() => setViewMode('kanban')} className="rounded-lg">
                        <LayoutGrid className="w-4 h-4 mr-2" /> Pipeline
                    </Button>
                    <Button variant={viewMode === 'list' ? 'default' : 'ghost'} size="sm" onClick={() => setViewMode('list')} className="rounded-lg">
                        <List className="w-4 h-4 mr-2" /> List
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {[
                    { label: 'Total', value: stats.total, color: 'text-slate-800' },
                    { label: 'Shortlisted', value: stats.shortlisted, color: 'text-amber-600' },
                    { label: 'Interviewing', value: stats.interviewing, color: 'text-orange-600' },
                    { label: 'Offered', value: stats.offered, color: 'text-emerald-600' },
                    { label: 'Joined', value: stats.joined, color: 'text-green-700' },
                ].map(s => (
                    <Card key={s.label} className="rounded-2xl border-none shadow-md">
                        <CardHeader className="pb-1 pt-4 px-5">
                            <CardTitle className="text-xs font-black uppercase text-slate-400 tracking-widest">{s.label}</CardTitle>
                        </CardHeader>
                        <CardContent className="px-5 pb-4">
                            <div className={`text-3xl font-black ${s.color}`}>{s.value}</div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Kanban / List */}
            {viewMode === 'kanban' ? (
                <PipelineBoard applications={applications} onStatusChange={handleUpdateStatus} />
            ) : (
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-slate-50/50 border-b border-slate-100">
                                    <TableHead className="font-black text-[11px] uppercase tracking-widest text-slate-500 py-5">Candidate</TableHead>
                                    <TableHead className="font-black text-[11px] uppercase tracking-widest text-slate-500">Contact</TableHead>
                                    <TableHead className="font-black text-[11px] uppercase tracking-widest text-slate-500">AI Score</TableHead>
                                    <TableHead className="font-black text-[11px] uppercase tracking-widest text-slate-500">Applied</TableHead>
                                    <TableHead className="font-black text-[11px] uppercase tracking-widest text-slate-500">Status</TableHead>
                                    <TableHead className="text-right font-black text-[11px] uppercase tracking-widest text-slate-500 pr-6">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    Array.from({ length: 5 }).map((_, i) => (
                                        <TableRow key={i} className="animate-pulse">
                                            <TableCell colSpan={6} className="h-20 bg-slate-50/20" />
                                        </TableRow>
                                    ))
                                ) : applications.map(app => (
                                    <TableRow key={app.id} className="hover:bg-slate-50/80 transition-colors">
                                        <TableCell className="py-4">
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-10 w-10 border">
                                                    <AvatarImage src={app.applicant?.avatar} />
                                                    <AvatarFallback className="bg-primary/5 text-primary text-xs font-black">
                                                        {getName(app)?.substring(0, 2).toUpperCase() || '??'}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-bold text-slate-900 text-sm">{getName(app)}</p>
                                                    <Badge variant="outline" className="text-[9px] font-bold uppercase mt-0.5">{app.source}</Badge>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="space-y-1 text-xs text-slate-600">
                                                <div className="flex items-center gap-1.5"><Mail className="w-3 h-3 text-slate-400" />{getEmail(app)}</div>
                                                <div className="flex items-center gap-1.5"><Phone className="w-3 h-3 text-slate-400" />{getPhone(app) || 'N/A'}</div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {app.applicant?.aiScore ? (
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-bold text-emerald-600">AI: {app.applicant.aiScore}/100</span>
                                                </div>
                                            ) : <span className="text-xs text-slate-400">—</span>}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                                <Calendar className="w-3.5 h-3.5" />
                                                {new Date(app.createdAt).toLocaleDateString()}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <select
                                                value={app.status}
                                                onChange={e => handleUpdateStatus(app.id, e.target.value)}
                                                className={`text-xs font-bold px-2 py-1 rounded-full border-0 cursor-pointer focus:ring-1 ${STATUS_COLOR[app.status] || 'bg-gray-100 text-gray-700'}`}
                                            >
                                                {STATUS_OPTIONS.map(s => (
                                                    <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
                                                ))}
                                            </select>
                                        </TableCell>
                                        <TableCell className="text-right pr-6">
                                            <div className="flex items-center justify-end gap-1">
                                                {app.resumeUrl && (
                                                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0" asChild title="View Resume">
                                                        <a href={app.resumeUrl} target="_blank" rel="noreferrer">
                                                            <ExternalLink className="w-3.5 h-3.5 text-blue-600" />
                                                        </a>
                                                    </Button>
                                                )}
                                                <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-violet-600 hover:bg-violet-50" title="Timeline" onClick={() => setSelectedApp(app)}>
                                                    <ClipboardList className="w-3.5 h-3.5" />
                                                </Button>
                                                <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-orange-600 hover:bg-orange-50" title="Schedule Interview" onClick={() => setScheduleApp(app)}>
                                                    <Video className="w-3.5 h-3.5" />
                                                </Button>
                                                <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-emerald-600 hover:bg-emerald-50" title="Release Offer" onClick={() => setOfferApp(app)}>
                                                    <Award className="w-3.5 h-3.5" />
                                                </Button>
                                                <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-blue-600 hover:bg-blue-50" title="Feedback / Onboarding" onClick={() => setFeedbackApp(app)}>
                                                    <MessageSquare className="w-3.5 h-3.5" />
                                                </Button>
                                                {app.status !== 'SHORTLISTED' && (
                                                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-emerald-600 hover:bg-emerald-50" title="Shortlist" onClick={() => handleUpdateStatus(app.id, 'SHORTLISTED')}>
                                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                                    </Button>
                                                )}
                                                {app.status !== 'REJECTED' && (
                                                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-red-600 hover:bg-red-50" title="Reject" onClick={() => handleUpdateStatus(app.id, 'REJECTED')}>
                                                        <XCircle className="w-3.5 h-3.5" />
                                                    </Button>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {!loading && applications.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-20">
                                            <User className="h-12 w-12 text-slate-200 mx-auto mb-3" />
                                            <p className="font-bold text-slate-400">No Applications Yet</p>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            )}

            {/* ═══ TIMELINE / DETAIL DIALOG ═══ */}
            <Dialog open={!!selectedApp} onOpenChange={v => !v && setSelectedApp(null)}>
                <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="font-black">{getName(selectedApp!)} — Application Timeline</DialogTitle>
                        <p className="text-sm text-slate-500">{jobDetails?.title}</p>
                    </DialogHeader>
                    {selectedApp && (
                        <div className="space-y-5">
                            {/* Interviews */}
                            {selectedApp.interviews && selectedApp.interviews.length > 0 && (
                                <div>
                                    <h4 className="font-black text-xs uppercase tracking-widest text-slate-500 mb-3">Interview Rounds</h4>
                                    <div className="space-y-3">
                                        {selectedApp.interviews.map((iv: any) => (
                                            <div key={iv.id} className={`rounded-xl border p-4 ${iv.result === 'PASSED' ? 'border-emerald-200 bg-emerald-50' : iv.result === 'FAILED' ? 'border-red-100 bg-red-50' : 'border-slate-100'}`}>
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="font-bold text-sm">{iv.roundName}</span>
                                                    <Badge className={`text-xs ${iv.result === 'PASSED' ? 'bg-emerald-100 text-emerald-700' : iv.result === 'FAILED' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>
                                                        {iv.result || iv.status}
                                                    </Badge>
                                                </div>
                                                <p className="text-xs text-slate-500">📅 {new Date(iv.scheduledAt).toLocaleString('en-IN')}</p>
                                                {iv.meetingLink && <a href={iv.meetingLink} target="_blank" rel="noreferrer" className="text-xs text-blue-600 underline block mt-1">Join Link</a>}
                                                {iv.feedback && <p className="text-xs text-slate-600 mt-2 italic">{iv.feedback}</p>}
                                                {iv.score && (
                                                    <div className="flex items-center gap-1 mt-1">
                                                        {Array.from({ length: 5 }).map((_, si) => (
                                                            <Star key={si} className={`w-3 h-3 ${si < Math.round(iv.score / 20) ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
                                                        ))}
                                                        <span className="text-xs text-slate-400 ml-1">{iv.score}/100</span>
                                                    </div>
                                                )}
                                                {iv.status !== 'COMPLETED' && (
                                                    <Button size="sm" variant="outline" className="mt-2 text-xs h-7" onClick={() => { setFeedbackInterview(iv); setIvFeedbackForm({ feedback: iv.feedback || '', score: iv.score || 70, result: iv.result || 'PASSED', status: 'COMPLETED' }); }}>
                                                        Add Feedback
                                                    </Button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Offers */}
                            {selectedApp.offers && selectedApp.offers.length > 0 && (
                                <div>
                                    <h4 className="font-black text-xs uppercase tracking-widest text-slate-500 mb-3">Offers</h4>
                                    {selectedApp.offers.map((offer: any) => (
                                        <div key={offer.id} className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                                            {offer.ctc && <p className="text-sm font-bold text-emerald-800">💰 CTC: {offer.ctc}</p>}
                                            {offer.designation && <p className="text-sm text-emerald-700">Role: {offer.designation}</p>}
                                            {offer.doj && <p className="text-sm text-emerald-700">DOJ: {new Date(offer.doj).toLocaleDateString()}</p>}
                                            <Badge className={`mt-2 text-xs ${offer.status === 'ACCEPTED' ? 'bg-green-200 text-green-800' : offer.status === 'DECLINED' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                                {offer.status}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Status History */}
                            {selectedApp.statusHistory && Array.isArray(selectedApp.statusHistory) && selectedApp.statusHistory.length > 0 && (
                                <div>
                                    <h4 className="font-black text-xs uppercase tracking-widest text-slate-500 mb-3">Status History</h4>
                                    <div className="relative">
                                        <div className="absolute left-3.5 top-0 bottom-0 w-0.5 bg-slate-100" />
                                        <div className="space-y-3">
                                            {[...selectedApp.statusHistory].reverse().map((h: any, i) => (
                                                <div key={i} className="flex items-start gap-3">
                                                    <div className="w-7 h-7 rounded-full bg-white border-2 border-blue-200 flex items-center justify-center shrink-0 z-10">
                                                        <div className="w-2 h-2 rounded-full bg-blue-400" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-slate-700">{h.status?.replace(/_/g, ' ')}</p>
                                                        {h.note && <p className="text-xs text-slate-500">{h.note}</p>}
                                                        <p className="text-[10px] text-slate-400">{new Date(h.timestamp).toLocaleString('en-IN')}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="flex gap-2 pt-4 border-t flex-wrap">
                                <Button size="sm" variant="outline" className="text-xs gap-1.5" onClick={() => { setScheduleApp(selectedApp); setSelectedApp(null); }}>
                                    <Video className="w-3 h-3" /> Schedule Interview
                                </Button>
                                <Button size="sm" variant="outline" className="text-xs gap-1.5 text-emerald-600 border-emerald-200" onClick={() => { setOfferApp(selectedApp); setSelectedApp(null); }}>
                                    <Award className="w-3 h-3" /> Release Offer
                                </Button>
                                <Button size="sm" variant="outline" className="text-xs gap-1.5 text-blue-600 border-blue-200" onClick={() => { setFeedbackApp(selectedApp); setSelectedApp(null); }}>
                                    <MessageSquare className="w-3 h-3" /> Placement Feedback
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* ═══ SCHEDULE INTERVIEW DIALOG ═══ */}
            <Dialog open={!!scheduleApp} onOpenChange={v => !v && setScheduleApp(null)}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="font-black">Schedule Interview</DialogTitle>
                        <p className="text-sm text-slate-500">{getName(scheduleApp!)} · {jobDetails?.title}</p>
                    </DialogHeader>
                    <div className="space-y-4 mt-2">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label className="text-sm font-semibold">Round Name *</Label>
                                <Input placeholder="e.g. Technical Round 1" value={scheduleForm.roundName} onChange={e => setScheduleForm(p => ({ ...p, roundName: e.target.value }))} />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-sm font-semibold">Round Type</Label>
                                <Select value={scheduleForm.roundType} onValueChange={v => setScheduleForm(p => ({ ...p, roundType: v }))}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {['SCREENING', 'TECHNICAL', 'MANAGERIAL', 'HR', 'FINAL', 'OTHER'].map(t => (
                                            <SelectItem key={t} value={t}>{t}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label className="text-sm font-semibold">Date & Time *</Label>
                                <Input type="datetime-local" value={scheduleForm.scheduledAt} onChange={e => setScheduleForm(p => ({ ...p, scheduledAt: e.target.value }))} />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-sm font-semibold">Duration (min)</Label>
                                <Input type="number" value={scheduleForm.duration} onChange={e => setScheduleForm(p => ({ ...p, duration: parseInt(e.target.value) }))} />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-sm font-semibold">Meeting Link</Label>
                            <Input placeholder="https://meet.google.com/..." value={scheduleForm.meetingLink} onChange={e => setScheduleForm(p => ({ ...p, meetingLink: e.target.value }))} />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-sm font-semibold">Location <span className="text-slate-400">(if in-person)</span></Label>
                            <Input placeholder="Office address or room number" value={scheduleForm.location} onChange={e => setScheduleForm(p => ({ ...p, location: e.target.value }))} />
                        </div>
                    </div>
                    <div className="flex gap-3 mt-4">
                        <Button variant="outline" className="flex-1" onClick={() => setScheduleApp(null)}>Cancel</Button>
                        <Button className="flex-1 bg-orange-600 hover:bg-orange-700 text-white" onClick={handleScheduleInterview} disabled={scheduling}>
                            {scheduling ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />} Schedule
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* ═══ INTERVIEW FEEDBACK DIALOG ═══ */}
            <Dialog open={!!feedbackInterview} onOpenChange={v => !v && setFeedbackInterview(null)}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="font-black">Interview Feedback</DialogTitle>
                        <p className="text-sm text-slate-500">{feedbackInterview?.roundName}</p>
                    </DialogHeader>
                    <div className="space-y-4 mt-2">
                        <div>
                            <Label className="text-sm font-semibold">Result</Label>
                            <Select value={ivFeedbackForm.result} onValueChange={v => setIvFeedbackForm(p => ({ ...p, result: v }))}>
                                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="PASSED">✅ Passed</SelectItem>
                                    <SelectItem value="FAILED">❌ Failed</SelectItem>
                                    <SelectItem value="ON_HOLD">⏸️ On Hold</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label className="text-sm font-semibold">Score (0–100)</Label>
                            <div className="flex items-center gap-3 mt-1">
                                <input type="range" min={0} max={100} value={ivFeedbackForm.score} onChange={e => setIvFeedbackForm(p => ({ ...p, score: parseInt(e.target.value) }))} className="flex-1" />
                                <span className="font-black text-slate-700 w-12 text-right">{ivFeedbackForm.score}</span>
                            </div>
                        </div>
                        <div>
                            <Label className="text-sm font-semibold">Feedback Notes</Label>
                            <Textarea className="mt-1" rows={4} placeholder="Strengths, weaknesses, technical assessment..." value={ivFeedbackForm.feedback} onChange={e => setIvFeedbackForm(p => ({ ...p, feedback: e.target.value }))} />
                        </div>
                    </div>
                    <div className="flex gap-3 mt-4">
                        <Button variant="outline" className="flex-1" onClick={() => setFeedbackInterview(null)}>Cancel</Button>
                        <Button className="flex-1 bg-violet-600 hover:bg-violet-700 text-white" onClick={handleSaveIvFeedback} disabled={savingIvFeedback}>
                            {savingIvFeedback ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Star className="w-4 h-4 mr-2" />} Save Feedback
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* ═══ OFFER RELEASE DIALOG ═══ */}
            <Dialog open={!!offerApp} onOpenChange={v => !v && setOfferApp(null)}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="font-black">Release Offer Letter</DialogTitle>
                        <p className="text-sm text-slate-500">{getName(offerApp!)} · {jobDetails?.title}</p>
                    </DialogHeader>
                    <div className="grid grid-cols-2 gap-4 mt-2">
                        <div className="space-y-1.5">
                            <Label className="text-sm font-semibold">CTC / Package</Label>
                            <Input placeholder="e.g. ₹5 LPA" value={offerForm.ctc} onChange={e => setOfferForm(p => ({ ...p, ctc: e.target.value }))} />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-sm font-semibold">Designation</Label>
                            <Input placeholder="e.g. Software Engineer" value={offerForm.designation} onChange={e => setOfferForm(p => ({ ...p, designation: e.target.value }))} />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-sm font-semibold">Department</Label>
                            <Input placeholder="e.g. Engineering" value={offerForm.department} onChange={e => setOfferForm(p => ({ ...p, department: e.target.value }))} />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-sm font-semibold">Date of Joining</Label>
                            <Input type="date" value={offerForm.doj} onChange={e => setOfferForm(p => ({ ...p, doj: e.target.value }))} />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-sm font-semibold">Reporting Manager</Label>
                            <Input placeholder="Manager name" value={offerForm.reportingManager} onChange={e => setOfferForm(p => ({ ...p, reportingManager: e.target.value }))} />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-sm font-semibold">Offer Letter URL</Label>
                            <Input placeholder="https://drive.google.com/..." value={offerForm.offerLetterUrl} onChange={e => setOfferForm(p => ({ ...p, offerLetterUrl: e.target.value }))} />
                        </div>
                    </div>
                    <div className="flex gap-3 mt-4">
                        <Button variant="outline" className="flex-1" onClick={() => setOfferApp(null)}>Cancel</Button>
                        <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white" onClick={handleReleaseOffer} disabled={releasingOffer}>
                            {releasingOffer ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Award className="w-4 h-4 mr-2" />} Release Offer
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* ═══ PLACEMENT FEEDBACK DIALOG ═══ */}
            <Dialog open={!!feedbackApp} onOpenChange={v => !v && setFeedbackApp(null)}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="font-black">Placement Feedback</DialogTitle>
                        <p className="text-sm text-slate-500">{getName(feedbackApp!)} — Post-Placement Update</p>
                    </DialogHeader>
                    <div className="space-y-4 mt-2">
                        <div>
                            <Label className="text-sm font-semibold">Candidate Joining Status</Label>
                            <Select value={feedbackForm.joinedStatus} onValueChange={v => setFeedbackForm(p => ({ ...p, joinedStatus: v }))}>
                                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="JOINED">✅ Joined</SelectItem>
                                    <SelectItem value="NOT_JOINED">❌ Did Not Join</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label className="text-sm font-semibold">Feedback / Notes</Label>
                            <Textarea className="mt-1" rows={3} placeholder="Any notes about the candidate or placement process..." value={feedbackForm.feedback} onChange={e => setFeedbackForm(p => ({ ...p, feedback: e.target.value }))} />
                        </div>
                        <div>
                            <Label className="text-sm font-semibold">Suggestions</Label>
                            <Textarea className="mt-1" rows={2} placeholder="Suggestions to improve future placements..." value={feedbackForm.suggestions} onChange={e => setFeedbackForm(p => ({ ...p, suggestions: e.target.value }))} />
                        </div>
                    </div>
                    <div className="flex gap-3 mt-4">
                        <Button variant="outline" className="flex-1" onClick={() => setFeedbackApp(null)}>Cancel</Button>
                        <Button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white" onClick={handleSubmitFeedback} disabled={submittingFeedback}>
                            {submittingFeedback ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <MessageSquare className="w-4 h-4 mr-2" />} Submit
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
