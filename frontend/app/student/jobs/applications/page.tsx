'use client';

import { useState, useEffect } from 'react';
import {
    Briefcase, MapPin, Clock, Building2, CheckCircle2, Circle, ChevronRight,
    Calendar, ExternalLink, MessageSquare, Loader2, Star, AlertCircle,
    FileText, Award, XCircle, ArrowLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { jobsApi } from '@/lib/api';
import { toast } from 'sonner';
import Link from 'next/link';

const STATUS_PIPELINE = [
    { status: 'APPLIED', label: 'Applied', color: 'bg-blue-500' },
    { status: 'VIEWED', label: 'Viewed', color: 'bg-indigo-400' },
    { status: 'SCREENED', label: 'Screened', color: 'bg-violet-500' },
    { status: 'SHORTLISTED', label: 'Shortlisted', color: 'bg-amber-500' },
    { status: 'INTERVIEW_SCHEDULED', label: 'Interview', color: 'bg-orange-500' },
    { status: 'OFFER_RELEASED', label: 'Offer', color: 'bg-emerald-500' },
    { status: 'JOINED', label: 'Joined', color: 'bg-green-600' },
];

const STATUS_META: Record<string, { label: string; color: string; bg: string }> = {
    APPLIED:            { label: 'Applied',             color: 'text-blue-700',    bg: 'bg-blue-50 border-blue-200' },
    VIEWED:             { label: 'Viewed',              color: 'text-indigo-700',  bg: 'bg-indigo-50 border-indigo-200' },
    SCREENED:           { label: 'Screened',            color: 'text-violet-700',  bg: 'bg-violet-50 border-violet-200' },
    SHORTLISTED:        { label: 'Shortlisted',         color: 'text-amber-700',   bg: 'bg-amber-50 border-amber-200' },
    INTERVIEW_SCHEDULED:{ label: 'Interview Scheduled', color: 'text-orange-700',  bg: 'bg-orange-50 border-orange-200' },
    INTERVIEWED:        { label: 'Interviewed',         color: 'text-orange-600',  bg: 'bg-orange-50 border-orange-200' },
    SELECTED:           { label: 'Selected',            color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' },
    OFFER_RELEASED:     { label: 'Offer Released',      color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' },
    OFFER_ACCEPTED:     { label: 'Offer Accepted',      color: 'text-green-700',   bg: 'bg-green-50 border-green-200' },
    OFFER_DECLINED:     { label: 'Offer Declined',      color: 'text-red-700',     bg: 'bg-red-50 border-red-200' },
    JOINED:             { label: 'Joined 🎉',           color: 'text-green-800',   bg: 'bg-green-50 border-green-300' },
    NOT_JOINED:         { label: 'Not Joined',          color: 'text-slate-600',   bg: 'bg-slate-50 border-slate-200' },
    REJECTED:           { label: 'Rejected',            color: 'text-red-700',     bg: 'bg-red-50 border-red-200' },
    WITHDRAWN:          { label: 'Withdrawn',           color: 'text-slate-600',   bg: 'bg-slate-100 border-slate-200' },
    ON_HOLD:            { label: 'On Hold',             color: 'text-yellow-700',  bg: 'bg-yellow-50 border-yellow-200' },
};

function getPipelineStep(status: string): number {
    const negatives = ['REJECTED', 'WITHDRAWN', 'OFFER_DECLINED', 'NOT_JOINED', 'ON_HOLD'];
    if (negatives.includes(status)) return -1;
    const steps = STATUS_PIPELINE.map(s => s.status);
    const statusGroups: Record<string, string> = {
        VIEWED: 'VIEWED', SCREENED: 'SCREENED', SHORTLISTED: 'SHORTLISTED',
        INTERVIEW_SCHEDULED: 'INTERVIEW_SCHEDULED', INTERVIEWED: 'INTERVIEW_SCHEDULED',
        SELECTED: 'OFFER_RELEASED', OFFER_RELEASED: 'OFFER_RELEASED',
        OFFER_ACCEPTED: 'OFFER_RELEASED', JOINED: 'JOINED',
    };
    const mapped = statusGroups[status] || status;
    return steps.indexOf(mapped);
}

interface Application {
    id: string;
    jobId: string;
    status: string;
    resumeUrl?: string;
    coverLetter?: string;
    createdAt: string;
    statusHistory?: any[];
    job: {
        id: string;
        title: string;
        location: string;
        type: string;
        salary?: string;
        skills?: string;
        employer: {
            name: string;
            employerProfile?: { companyName?: string; logo?: string };
        };
    };
    interviews?: {
        id: string;
        roundName: string;
        roundType: string;
        scheduledAt: string;
        duration: number;
        meetingLink?: string;
        location?: string;
        status: string;
        feedback?: string;
        score?: number;
        result?: string;
    }[];
    offers?: {
        id: string;
        ctc?: string;
        designation?: string;
        doj?: string;
        status: string;
        offerLetterUrl?: string;
    }[];
}

export default function MyApplicationsPage() {
    const [applications, setApplications] = useState<Application[]>([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState<Application | null>(null);
    const [feedbackApp, setFeedbackApp] = useState<Application | null>(null);
    const [feedbackData, setFeedbackData] = useState({ joinedStatus: 'JOINED', feedback: '', suggestions: '' });
    const [submittingFeedback, setSubmittingFeedback] = useState(false);
    const [declineOfferId, setDeclineOfferId] = useState<string | null>(null);
    const [acceptingOffer, setAcceptingOffer] = useState(false);

    useEffect(() => { fetchApplications(); }, []);

    async function fetchApplications() {
        try {
            const res = await jobsApi.getMyApplications();
            setApplications(res.data || []);
        } catch {
            toast.error('Failed to load your applications');
        } finally {
            setLoading(false);
        }
    }

    async function handleOfferAction(offerId: string, action: 'ACCEPTED' | 'DECLINED') {
        setAcceptingOffer(true);
        try {
            await jobsApi.updateOfferStatus(offerId, action);
            toast.success(action === 'ACCEPTED' ? '🎉 Offer accepted! Congratulations!' : 'Offer declined.');
            fetchApplications();
            if (selected) {
                const updated = await jobsApi.getApplicationTimeline(selected.id);
                setSelected(updated.data);
            }
        } catch {
            toast.error('Failed to update offer status');
        } finally {
            setAcceptingOffer(false);
        }
    }

    async function handleFeedback() {
        if (!feedbackApp) return;
        setSubmittingFeedback(true);
        try {
            await jobsApi.submitFeedback(feedbackApp.id, feedbackData);
            toast.success('Feedback submitted. Thank you!');
            setFeedbackApp(null);
            fetchApplications();
        } catch {
            toast.error('Failed to submit feedback');
        } finally {
            setSubmittingFeedback(false);
        }
    }

    const companyName = (app: Application) =>
        app.job?.employer?.employerProfile?.companyName || app.job?.employer?.name || 'Company';

    const activeApps = applications.filter(a => !['REJECTED', 'WITHDRAWN', 'NOT_JOINED'].includes(a.status));
    const closedApps = applications.filter(a => ['REJECTED', 'WITHDRAWN', 'NOT_JOINED'].includes(a.status));

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <div className="bg-white border-b border-slate-100 sticky top-0 z-10">
                <div className="max-w-5xl mx-auto px-6 py-4 flex items-center gap-4">
                    <Link href="/student/jobs">
                        <Button variant="ghost" size="icon" className="rounded-xl">
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-black text-slate-900">My Applications</h1>
                        <p className="text-sm text-slate-500">Track your job applications from applied to hired</p>
                    </div>
                    <div className="ml-auto flex items-center gap-3">
                        <div className="text-right">
                            <p className="text-2xl font-black text-blue-600">{applications.length}</p>
                            <p className="text-xs text-slate-500">Total Applied</p>
                        </div>
                        <div className="text-right">
                            <p className="text-2xl font-black text-emerald-600">{applications.filter(a => a.status === 'JOINED').length}</p>
                            <p className="text-xs text-slate-500">Joined</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">
                {loading && (
                    <div className="flex items-center justify-center py-24">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                    </div>
                )}

                {!loading && applications.length === 0 && (
                    <div className="text-center py-24">
                        <Briefcase className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-slate-400">No applications yet</h3>
                        <p className="text-slate-400 mt-1 mb-6">Start applying to jobs to see your status here.</p>
                        <Link href="/student/jobs">
                            <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl">Browse Jobs</Button>
                        </Link>
                    </div>
                )}

                {/* Active Applications */}
                {activeApps.length > 0 && (
                    <section>
                        <h2 className="text-lg font-black text-slate-700 mb-4 flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                            Active Applications ({activeApps.length})
                        </h2>
                        <div className="space-y-4">
                            {activeApps.map(app => {
                                const step = getPipelineStep(app.status);
                                const meta = STATUS_META[app.status] || { label: app.status, color: 'text-slate-700', bg: 'bg-slate-50 border-slate-200' };
                                const hasOffer = app.offers && app.offers.length > 0 && app.offers[0].status === 'RELEASED';
                                const upcomingInterview = app.interviews?.find(i => i.status === 'SCHEDULED');

                                return (
                                    <div
                                        key={app.id}
                                        className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-blue-100 transition-all cursor-pointer"
                                        onClick={() => setSelected(app)}
                                    >
                                        <div className="p-5">
                                            <div className="flex items-start gap-4">
                                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center shrink-0">
                                                    {app.job?.employer?.employerProfile?.logo ? (
                                                        <img src={app.job.employer.employerProfile.logo} alt="" className="w-10 h-10 object-contain rounded-lg" />
                                                    ) : (
                                                        <Building2 className="w-6 h-6 text-blue-500" />
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-black text-slate-900 text-base">{app.job?.title}</h3>
                                                    <p className="text-sm text-slate-500">{companyName(app)}</p>
                                                    <div className="flex flex-wrap gap-2 mt-1 text-xs text-slate-400">
                                                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{app.job?.location}</span>
                                                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />Applied {new Date(app.createdAt).toLocaleDateString('en-IN')}</span>
                                                    </div>
                                                </div>
                                                <div className={`px-3 py-1 rounded-full text-xs font-black border ${meta.bg} ${meta.color}`}>
                                                    {meta.label}
                                                </div>
                                            </div>

                                            {/* Progress Pipeline */}
                                            {step >= 0 && (
                                                <div className="mt-4">
                                                    <div className="flex items-center">
                                                        {STATUS_PIPELINE.map((s, idx) => {
                                                            const done = idx <= step;
                                                            const current = idx === step;
                                                            return (
                                                                <div key={s.status} className="flex items-center flex-1 last:flex-none">
                                                                    <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-all ${done ? s.color : 'bg-slate-100'}`}>
                                                                        {done ? (
                                                                            <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                                                                        ) : (
                                                                            <Circle className="w-3.5 h-3.5 text-slate-300" />
                                                                        )}
                                                                    </div>
                                                                    {idx < STATUS_PIPELINE.length - 1 && (
                                                                        <div className={`h-0.5 flex-1 mx-0.5 transition-all ${idx < step ? 'bg-blue-300' : 'bg-slate-100'}`} />
                                                                    )}
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                    <div className="flex justify-between mt-1">
                                                        {STATUS_PIPELINE.map((s, idx) => (
                                                            <span key={s.status} className={`text-[9px] font-semibold ${idx <= step ? 'text-slate-600' : 'text-slate-300'} ${idx > 0 && 'text-center flex-1'}`}>
                                                                {s.label}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Alerts */}
                                            {upcomingInterview && (
                                                <div className="mt-3 bg-orange-50 border border-orange-200 rounded-xl px-3 py-2 flex items-center gap-2 text-xs text-orange-700">
                                                    <AlertCircle className="w-4 h-4 shrink-0" />
                                                    <span><strong>{upcomingInterview.roundName}</strong> scheduled on {new Date(upcomingInterview.scheduledAt).toLocaleString('en-IN')}</span>
                                                    {upcomingInterview.meetingLink && (
                                                        <a href={upcomingInterview.meetingLink} target="_blank" rel="noreferrer" className="ml-auto underline font-bold" onClick={e => e.stopPropagation()}>Join</a>
                                                    )}
                                                </div>
                                            )}

                                            {hasOffer && (
                                                <div className="mt-3 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2 flex items-center gap-2 text-xs text-emerald-700">
                                                    <Award className="w-4 h-4 shrink-0" />
                                                    <span><strong>Offer received!</strong> {app.offers![0].ctc && `CTC: ${app.offers![0].ctc}`} — Click to view & respond</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="px-5 py-3 border-t border-slate-50 flex items-center justify-between">
                                            <span className="text-xs text-slate-400">{app.interviews?.length || 0} interview round(s)</span>
                                            <span className="text-xs font-bold text-blue-600 flex items-center gap-1">View Timeline <ChevronRight className="w-3 h-3" /></span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </section>
                )}

                {/* Closed Applications */}
                {closedApps.length > 0 && (
                    <section>
                        <h2 className="text-lg font-black text-slate-400 mb-4 flex items-center gap-2">
                            <XCircle className="w-4 h-4" />
                            Closed Applications ({closedApps.length})
                        </h2>
                        <div className="space-y-3">
                            {closedApps.map(app => {
                                const meta = STATUS_META[app.status] || { label: app.status, color: 'text-slate-500', bg: 'bg-slate-50 border-slate-200' };
                                return (
                                    <div key={app.id} className="bg-white rounded-xl border border-slate-100 p-4 flex items-center gap-4 opacity-70">
                                        <Building2 className="w-8 h-8 text-slate-300 shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-slate-700 text-sm">{app.job?.title}</p>
                                            <p className="text-xs text-slate-400">{companyName(app)} · {new Date(app.createdAt).toLocaleDateString()}</p>
                                        </div>
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${meta.bg} ${meta.color}`}>{meta.label}</span>
                                        {app.status === 'JOINED' && (
                                            <Button size="sm" variant="outline" className="text-emerald-600 border-emerald-200 text-xs" onClick={() => setFeedbackApp(app)}>
                                                <MessageSquare className="w-3 h-3 mr-1" /> Feedback
                                            </Button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </section>
                )}
            </div>

            {/* Application Timeline Dialog */}
            <Dialog open={!!selected} onOpenChange={v => !v && setSelected(null)}>
                <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
                    {selected && (
                        <>
                            <DialogHeader>
                                <DialogTitle className="text-xl font-black">{selected.job?.title}</DialogTitle>
                                <p className="text-sm text-slate-500">{companyName(selected)} · {selected.job?.location}</p>
                            </DialogHeader>

                            {/* Current Status */}
                            <div className={`rounded-xl p-3 border text-sm font-bold flex items-center gap-2 ${STATUS_META[selected.status]?.bg} ${STATUS_META[selected.status]?.color}`}>
                                <CheckCircle2 className="w-4 h-4" />
                                Current Status: {STATUS_META[selected.status]?.label || selected.status}
                            </div>

                            {/* Interview Rounds */}
                            {selected.interviews && selected.interviews.length > 0 && (
                                <div>
                                    <h4 className="font-black text-sm text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                                        <Calendar className="w-4 h-4" /> Interview Rounds
                                    </h4>
                                    <div className="space-y-3">
                                        {selected.interviews.map((iv, i) => (
                                            <div key={iv.id} className={`rounded-xl border p-4 ${iv.status === 'SCHEDULED' ? 'border-orange-200 bg-orange-50' : iv.result === 'PASSED' ? 'border-emerald-200 bg-emerald-50' : iv.result === 'FAILED' ? 'border-red-100 bg-red-50' : 'border-slate-100'}`}>
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="font-black text-sm text-slate-800">Round {i + 1}: {iv.roundName}</span>
                                                    <Badge className={`text-xs ${iv.status === 'SCHEDULED' ? 'bg-orange-100 text-orange-700' : iv.result === 'PASSED' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                                                        {iv.result || iv.status}
                                                    </Badge>
                                                </div>
                                                <p className="text-xs text-slate-600">📅 {new Date(iv.scheduledAt).toLocaleString('en-IN')} · {iv.duration} min</p>
                                                {iv.location && <p className="text-xs text-slate-500 mt-1">📍 {iv.location}</p>}
                                                {iv.meetingLink && (
                                                    <a href={iv.meetingLink} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-blue-600 underline font-semibold mt-1">
                                                        <ExternalLink className="w-3 h-3" /> Join Meeting
                                                    </a>
                                                )}
                                                {iv.feedback && <p className="text-xs text-slate-600 mt-2 italic border-t border-slate-100 pt-2">Feedback: {iv.feedback}</p>}
                                                {iv.score !== undefined && iv.score !== null && (
                                                    <div className="flex items-center gap-1 mt-1">
                                                        {Array.from({ length: 5 }).map((_, si) => (
                                                            <Star key={si} className={`w-3 h-3 ${si < Math.round(iv.score! / 20) ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`} />
                                                        ))}
                                                        <span className="text-xs text-slate-500 ml-1">{iv.score}/100</span>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Offers */}
                            {selected.offers && selected.offers.length > 0 && (
                                <div>
                                    <h4 className="font-black text-sm text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                                        <Award className="w-4 h-4" /> Offer Letter
                                    </h4>
                                    {selected.offers.map(offer => (
                                        <div key={offer.id} className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 space-y-2">
                                            {offer.ctc && <p className="text-sm font-black text-emerald-800">💰 CTC: {offer.ctc}</p>}
                                            {offer.designation && <p className="text-sm text-emerald-700">Role: {offer.designation}</p>}
                                            {offer.doj && <p className="text-sm text-emerald-700">Date of Joining: {new Date(offer.doj).toLocaleDateString('en-IN')}</p>}
                                            {offer.offerLetterUrl && (
                                                <a href={offer.offerLetterUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-blue-600 underline font-semibold">
                                                    <FileText className="w-3 h-3" /> View Offer Letter
                                                </a>
                                            )}
                                            {offer.status === 'RELEASED' && (
                                                <div className="flex gap-2 mt-3 pt-3 border-t border-emerald-200">
                                                    <Button
                                                        size="sm"
                                                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs"
                                                        onClick={() => handleOfferAction(offer.id, 'ACCEPTED')}
                                                        disabled={acceptingOffer}
                                                    >
                                                        {acceptingOffer ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <CheckCircle2 className="w-3 h-3 mr-1" />}
                                                        Accept Offer
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="flex-1 text-red-600 border-red-200 text-xs"
                                                        onClick={() => handleOfferAction(offer.id, 'DECLINED')}
                                                        disabled={acceptingOffer}
                                                    >
                                                        <XCircle className="w-3 h-3 mr-1" /> Decline
                                                    </Button>
                                                </div>
                                            )}
                                            {offer.status !== 'RELEASED' && (
                                                <Badge className={offer.status === 'ACCEPTED' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                                                    {offer.status}
                                                </Badge>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Status History */}
                            {selected.statusHistory && Array.isArray(selected.statusHistory) && selected.statusHistory.length > 0 && (
                                <div>
                                    <h4 className="font-black text-sm text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                                        <Clock className="w-4 h-4" /> Status History
                                    </h4>
                                    <div className="relative">
                                        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-100" />
                                        <div className="space-y-3">
                                            {[...selected.statusHistory].reverse().map((h: any, i) => (
                                                <div key={i} className="flex items-start gap-4 relative">
                                                    <div className="w-8 h-8 rounded-full bg-white border-2 border-blue-300 flex items-center justify-center shrink-0 z-10">
                                                        <div className="w-2 h-2 rounded-full bg-blue-400" />
                                                    </div>
                                                    <div className="flex-1 pb-2">
                                                        <p className="text-sm font-bold text-slate-700">{STATUS_META[h.status]?.label || h.status}</p>
                                                        {h.note && <p className="text-xs text-slate-500 mt-0.5">{h.note}</p>}
                                                        <p className="text-[10px] text-slate-400 mt-1">{new Date(h.timestamp).toLocaleString('en-IN')}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Post-join Feedback CTA */}
                            {selected.status === 'JOINED' && (
                                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
                                    <p className="text-sm font-bold text-emerald-800 mb-2">🎉 Congratulations on joining!</p>
                                    <p className="text-xs text-emerald-700 mb-3">Share your experience to help others and improve placement services.</p>
                                    <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => { setFeedbackApp(selected); setSelected(null); }}>
                                        <MessageSquare className="w-3 h-3 mr-2" /> Share Feedback
                                    </Button>
                                </div>
                            )}
                        </>
                    )}
                </DialogContent>
            </Dialog>

            {/* Placement Feedback Dialog */}
            <Dialog open={!!feedbackApp} onOpenChange={v => !v && setFeedbackApp(null)}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="font-black">Placement Feedback</DialogTitle>
                        <p className="text-sm text-slate-500">{feedbackApp?.job?.title} · {feedbackApp && (feedbackApp.job?.employer?.employerProfile?.companyName || feedbackApp.job?.employer?.name)}</p>
                    </DialogHeader>
                    <div className="space-y-4 mt-2">
                        <div>
                            <Label className="font-semibold text-sm">Joining Status</Label>
                            <Select value={feedbackData.joinedStatus} onValueChange={v => setFeedbackData(prev => ({ ...prev, joinedStatus: v }))}>
                                <SelectTrigger className="mt-1">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="JOINED">✅ Joined the company</SelectItem>
                                    <SelectItem value="NOT_JOINED">❌ Did not join</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label className="font-semibold text-sm">Your Experience & Feedback</Label>
                            <Textarea
                                className="mt-1"
                                rows={4}
                                placeholder="How was your interview experience? What was the work culture like?"
                                value={feedbackData.feedback}
                                onChange={e => setFeedbackData(prev => ({ ...prev, feedback: e.target.value }))}
                            />
                        </div>
                        <div>
                            <Label className="font-semibold text-sm">Suggestions for the Institute</Label>
                            <Textarea
                                className="mt-1"
                                rows={3}
                                placeholder="Any suggestions for improving the placement process or curriculum?"
                                value={feedbackData.suggestions}
                                onChange={e => setFeedbackData(prev => ({ ...prev, suggestions: e.target.value }))}
                            />
                        </div>
                    </div>
                    <div className="flex gap-3 mt-4">
                        <Button variant="outline" className="flex-1" onClick={() => setFeedbackApp(null)}>Cancel</Button>
                        <Button
                            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                            onClick={handleFeedback}
                            disabled={submittingFeedback}
                        >
                            {submittingFeedback ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                            Submit Feedback
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
