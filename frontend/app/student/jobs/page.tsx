'use client';

import { useState, useEffect } from 'react';
import { Search, MapPin, Briefcase, Clock, Filter, ChevronRight, Building2, IndianRupee, Wifi, CheckCircle2, Loader2, X, BrainCircuit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { jobsApi } from '@/lib/api';
import { toast } from 'sonner';
import Link from 'next/link';

const JOB_TYPES = ['All', 'FULL_TIME', 'PART_TIME', 'INTERNSHIP', 'CONTRACT', 'FREELANCE'];
const TYPE_LABELS: Record<string, string> = {
    All: 'All Types',
    FULL_TIME: 'Full Time',
    PART_TIME: 'Part Time',
    INTERNSHIP: 'Internship',
    CONTRACT: 'Contract',
    FREELANCE: 'Freelance',
};

const TYPE_COLORS: Record<string, string> = {
    FULL_TIME: 'bg-blue-100 text-blue-700',
    PART_TIME: 'bg-purple-100 text-purple-700',
    INTERNSHIP: 'bg-amber-100 text-amber-700',
    CONTRACT: 'bg-emerald-100 text-emerald-700',
    FREELANCE: 'bg-rose-100 text-rose-700',
};

interface Job {
    id: string;
    title: string;
    description: string;
    requirements?: string;
    location: string;
    type: string;
    experience?: string;
    salary?: string;
    skills?: string;
    clientName?: string;
    qualification?: string;
    linkedCourseId?: string;
    createdAt: string;
    employer: {
        name: string;
        employerProfile?: {
            companyName?: string;
            logo?: string;
            website?: string;
        };
    };
    _count?: { applications: number };
}

export default function StudentJobsPage() {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [locationFilter, setLocationFilter] = useState('');
    const [typeFilter, setTypeFilter] = useState('All');
    const [selectedJob, setSelectedJob] = useState<Job | null>(null);
    const [atsMatch, setAtsMatch] = useState<any>(null);
    const [loadingAts, setLoadingAts] = useState(false);
    const [applyingJob, setApplyingJob] = useState<Job | null>(null);
    const [applying, setApplying] = useState(false);
    const [appliedIds, setAppliedIds] = useState<Set<string>>(new Set());
    const [coverLetter, setCoverLetter] = useState('');
    const [resumeUrl, setResumeUrl] = useState('');

    async function fetchJobs() {
        try {
            setLoading(true);
            const res = await jobsApi.getAll();
            setJobs(res.data || []);
        } catch {
            toast.error('Failed to load jobs');
        } finally {
            setLoading(false);
        }
    }

    async function fetchMyApplications() {
        try {
            const res = await jobsApi.getMyApplications();
            const apps = res.data || [];
            setAppliedIds(new Set(apps.map((a: any) => a.jobId)));
        } catch {
            // Silently ignore — user may not be logged in
        }
    }

    useEffect(() => {
        fetchJobs();
        fetchMyApplications();
    }, []);

    const handleSelectJob = async (job: Job) => {
        setSelectedJob(job);
        setAtsMatch(null);
        setLoadingAts(true);
        try {
            const res = await jobsApi.getMatchScore(job.id);
            if (res.data) setAtsMatch(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingAts(false);
        }
    };

    const handleApply = async () => {
        if (!applyingJob) return;
        setApplying(true);
        try {
            await jobsApi.applyToJob(applyingJob.id, { resumeUrl, coverLetter });
            setAppliedIds(prev => new Set([...prev, applyingJob.id]));
            toast.success('Application submitted successfully!');
            setApplyingJob(null);
            setCoverLetter('');
            setResumeUrl('');
        } catch (err: any) {
            toast.error(err.response?.data?.error || 'Failed to submit application');
        } finally {
            setApplying(false);
        }
    };

    const filtered = jobs.filter(j => {
        const matchSearch = !search ||
            j.title.toLowerCase().includes(search.toLowerCase()) ||
            j.skills?.toLowerCase().includes(search.toLowerCase()) ||
            j.employer?.employerProfile?.companyName?.toLowerCase().includes(search.toLowerCase());
        const matchLocation = !locationFilter ||
            j.location.toLowerCase().includes(locationFilter.toLowerCase());
        const matchType = typeFilter === 'All' || j.type === typeFilter;
        return matchSearch && matchLocation && matchType;
    });

    const companyName = (job: Job) => job.employer?.employerProfile?.companyName || job.employer?.name || 'Company';

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
            {/* Hero Header */}
            <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 text-white px-6 py-12">
                <div className="max-w-6xl mx-auto">
                    <h1 className="text-4xl font-black tracking-tight mb-2">Job Board</h1>
                    <p className="text-blue-100 text-lg mb-8">Discover opportunities matched to your skills and career goals.</p>

                    {/* Search Bar */}
                    <div className="flex flex-col md:flex-row gap-3 bg-white/10 backdrop-blur rounded-2xl p-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/60" />
                            <Input
                                placeholder="Search by title, skill, or company..."
                                className="pl-10 bg-white/20 border-white/30 text-white placeholder:text-white/50 focus:bg-white/30 h-12 rounded-xl"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                        </div>
                        <div className="relative">
                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/60 z-10" />
                            <Input
                                placeholder="Location..."
                                className="pl-9 bg-white/20 border-white/30 text-white placeholder:text-white/50 h-12 rounded-xl md:w-48"
                                value={locationFilter}
                                onChange={e => setLocationFilter(e.target.value)}
                            />
                        </div>
                        <Select value={typeFilter} onValueChange={setTypeFilter}>
                            <SelectTrigger className="bg-white/20 border-white/30 text-white h-12 rounded-xl md:w-44">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {JOB_TYPES.map(t => (
                                    <SelectItem key={t} value={t}>{TYPE_LABELS[t]}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-6 py-8">
                {/* Stats & Actions Bar */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <span className="text-2xl font-black text-slate-800">{filtered.length}</span>
                        <span className="text-slate-500 font-medium">open positions found</span>
                        {(search || locationFilter || typeFilter !== 'All') && (
                            <button
                                onClick={() => { setSearch(''); setLocationFilter(''); setTypeFilter('All'); }}
                                className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 border border-red-200 rounded-full px-2 py-0.5"
                            >
                                <X className="w-3 h-3" /> Clear filters
                            </button>
                        )}
                    </div>
                    <Link href="/student/jobs/applications">
                        <Button variant="outline" className="gap-2 rounded-xl border-blue-200 text-blue-700 hover:bg-blue-50">
                            <Briefcase className="w-4 h-4" />
                            My Applications
                        </Button>
                    </Link>
                </div>

                {/* Job Type Filter Pills */}
                <div className="flex gap-2 mb-6 flex-wrap">
                    {JOB_TYPES.map(t => (
                        <button
                            key={t}
                            onClick={() => setTypeFilter(t)}
                            className={`px-4 py-2 rounded-full text-sm font-semibold transition-all border ${typeFilter === t
                                ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-100'
                                : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:text-blue-600'
                                }`}
                        >
                            {TYPE_LABELS[t]}
                        </button>
                    ))}
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="bg-white rounded-2xl h-56 border border-slate-100 animate-pulse" />
                        ))}
                    </div>
                )}

                {/* Job Cards Grid */}
                {!loading && (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                        {filtered.map(job => {
                            const applied = appliedIds.has(job.id);
                            const skills = job.skills ? job.skills.split(',').map(s => s.trim()).filter(Boolean) : [];
                            return (
                                <div
                                    key={job.id}
                                    className="group bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all duration-300 cursor-pointer flex flex-col overflow-hidden"
                                    onClick={() => handleSelectJob(job)}
                                >
                                    <div className="p-5 flex-1">
                                        {/* Company Header */}
                                        <div className="flex items-start justify-between gap-3 mb-3">
                                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center shrink-0">
                                                {job.employer?.employerProfile?.logo ? (

                                                    <img src={job.employer.employerProfile.logo} alt="" className="w-10 h-10 rounded-lg object-contain" />
                                                ) : (
                                                    <Building2 className="w-6 h-6 text-blue-500" />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-semibold text-slate-500 truncate">{companyName(job)}</p>
                                                <h3 className="font-bold text-slate-900 text-base leading-tight line-clamp-2 mt-0.5 group-hover:text-blue-700 transition-colors">
                                                    {job.title}
                                                </h3>
                                            </div>
                                            {applied && (
                                                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-1" />
                                            )}
                                        </div>

                                        {/* Meta Info */}
                                        <div className="flex flex-wrap gap-2 text-xs text-slate-500 mb-3">
                                            <span className="flex items-center gap-1">
                                                <MapPin className="w-3 h-3" /> {job.location}
                                            </span>
                                            {job.experience && (
                                                <span className="flex items-center gap-1">
                                                    <Clock className="w-3 h-3" /> {job.experience}
                                                </span>
                                            )}
                                            {job.salary && (
                                                <span className="flex items-center gap-1">
                                                    <IndianRupee className="w-3 h-3" /> {job.salary}
                                                </span>
                                            )}
                                        </div>

                                        {/* Type Badge */}
                                        <div className="flex gap-2">
                                            <Badge className={`text-xs font-bold px-2 py-0.5 rounded-full border-0 ${TYPE_COLORS[job.type] || 'bg-gray-100 text-gray-700'}`}>
                                                {TYPE_LABELS[job.type] || job.type}
                                            </Badge>
                                            {job.linkedCourseId && (
                                                <Badge className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2 py-0.5 rounded-full border-0 flex items-center gap-1">
                                                    <BrainCircuit className="w-3 h-3" /> AI Score Required
                                                </Badge>
                                            )}
                                        </div>

                                        {/* Skills */}
                                        {skills.length > 0 && (
                                            <div className="flex flex-wrap gap-1.5 mt-3">
                                                {skills.slice(0, 4).map(s => (
                                                    <span key={s} className="bg-slate-100 text-slate-600 text-[11px] font-medium px-2 py-0.5 rounded-full">
                                                        {s}
                                                    </span>
                                                ))}
                                                {skills.length > 4 && (
                                                    <span className="text-[11px] text-slate-400">+{skills.length - 4} more</span>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {/* Card Footer */}
                                    <div className="px-5 py-3 border-t border-slate-50 bg-slate-50/50 flex items-center justify-between">
                                        <span className="text-xs text-slate-400">
                                            {new Date(job.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                        </span>
                                        <span className="text-xs font-semibold text-blue-600 flex items-center gap-1 group-hover:gap-2 transition-all">
                                            View Details <ChevronRight className="w-3 h-3" />
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {!loading && filtered.length === 0 && (
                    <div className="text-center py-24">
                        <Wifi className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-slate-400">No jobs found</h3>
                        <p className="text-slate-400 mt-1">Try adjusting your search or filters.</p>
                    </div>
                )}
            </div>

            {/* Job Detail Dialog */}
            <Dialog open={!!selectedJob} onOpenChange={v => !v && setSelectedJob(null)}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    {selectedJob && (
                        <>
                            <DialogHeader>
                                <div className="flex items-start gap-4">
                                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center shrink-0">
                                        {selectedJob.employer?.employerProfile?.logo ? (

                                            <img src={selectedJob.employer.employerProfile.logo} alt="" className="w-12 h-12 rounded-xl object-contain" />
                                        ) : (
                                            <Building2 className="w-7 h-7 text-blue-500" />
                                        )}
                                    </div>
                                    <div>
                                        <DialogTitle className="text-2xl font-black text-slate-900">{selectedJob.title}</DialogTitle>
                                        <p className="text-slate-500 font-semibold mt-0.5">{companyName(selectedJob)}</p>
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            <Badge className={`text-xs font-bold ${TYPE_COLORS[selectedJob.type] || 'bg-gray-100'}`}>
                                                {TYPE_LABELS[selectedJob.type]}
                                            </Badge>
                                            <span className="flex items-center gap-1 text-sm text-slate-500">
                                                <MapPin className="w-3.5 h-3.5" /> {selectedJob.location}
                                            </span>
                                            {selectedJob.salary && (
                                                <span className="flex items-center gap-1 text-sm text-slate-500">
                                                    <IndianRupee className="w-3.5 h-3.5" /> {selectedJob.salary}
                                                </span>
                                            )}
                                            {selectedJob.experience && (
                                                <span className="flex items-center gap-1 text-sm text-slate-500">
                                                    <Clock className="w-3.5 h-3.5" /> {selectedJob.experience}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </DialogHeader>

                            <div className="space-y-5 mt-2">
                                {/* ATS Match Widget */}
                                {loadingAts ? (
                                    <div className="flex items-center gap-2 text-sm text-blue-600 bg-blue-50 p-3 rounded-lg animate-pulse border border-blue-100">
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Analyzing your resume against this job...
                                    </div>
                                ) : atsMatch && atsMatch.matchScore !== null && atsMatch.matchScore !== undefined ? (
                                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <h4 className="font-bold text-blue-900 flex items-center gap-2">
                                                <BrainCircuit className="w-5 h-5" />
                                                AI Match Insights
                                            </h4>
                                            <div className="flex items-center gap-2">
                                                <div className="text-2xl font-black text-blue-600">{atsMatch.matchScore}%</div>
                                                <div className="text-xs text-blue-500 font-medium">Match Score</div>
                                            </div>
                                        </div>
                                        <p className="text-sm text-blue-800/80 mb-3">{atsMatch.briefFeedback || atsMatch.message}</p>
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <span className="font-semibold text-emerald-700 block mb-1">Matched Skills</span>
                                                <div className="flex flex-wrap gap-1">
                                                    {atsMatch.matchedKeywords?.map((k: string) => (
                                                        <span key={k} className="bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded text-[10px] uppercase font-bold">{k}</span>
                                                    ))}
                                                    {(!atsMatch.matchedKeywords || atsMatch.matchedKeywords.length === 0) && <span className="text-xs text-slate-400">None found</span>}
                                                </div>
                                            </div>
                                            <div>
                                                <span className="font-semibold text-rose-700 block mb-1">Missing Skills</span>
                                                <div className="flex flex-wrap gap-1">
                                                    {atsMatch.missingKeywords?.map((k: string) => (
                                                        <span key={k} className="bg-rose-100 text-rose-700 px-1.5 py-0.5 rounded text-[10px] uppercase font-bold">{k}</span>
                                                    ))}
                                                    {(!atsMatch.missingKeywords || atsMatch.missingKeywords.length === 0) && <span className="text-xs text-slate-400">None missing</span>}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : atsMatch && atsMatch.message ? (
                                    <div className="text-sm text-amber-700 bg-amber-50 p-3 rounded-lg border border-amber-200">
                                        {atsMatch.message}
                                    </div>
                                ) : null}

                                <div>
                                    <h4 className="font-black text-slate-700 text-sm uppercase tracking-wider mb-2">Job Description</h4>
                                    <p className="text-slate-600 leading-relaxed whitespace-pre-wrap text-sm">{selectedJob.description}</p>
                                </div>
                                {selectedJob.requirements && (
                                    <div>
                                        <h4 className="font-black text-slate-700 text-sm uppercase tracking-wider mb-2">Requirements</h4>
                                        <p className="text-slate-600 leading-relaxed whitespace-pre-wrap text-sm">{selectedJob.requirements}</p>
                                    </div>
                                )}
                                {selectedJob.skills && (
                                    <div>
                                        <h4 className="font-black text-slate-700 text-sm uppercase tracking-wider mb-2">Required Skills</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedJob.skills.split(',').map(s => s.trim()).filter(Boolean).map(s => (
                                                <span key={s} className="bg-blue-50 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full">{s}</span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {selectedJob.qualification && (
                                    <div>
                                        <h4 className="font-black text-slate-700 text-sm uppercase tracking-wider mb-2">Qualification</h4>
                                        <p className="text-sm text-slate-600">{selectedJob.qualification}</p>
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-3 mt-6 pt-4 border-t">
                                <Button variant="outline" className="flex-1" onClick={() => setSelectedJob(null)}>Close</Button>
                                {appliedIds.has(selectedJob.id) ? (
                                    <Button disabled className="flex-1 bg-emerald-100 text-emerald-700 border-0">
                                        <CheckCircle2 className="w-4 h-4 mr-2" /> Applied
                                    </Button>
                                ) : (
                                    <Button
                                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                                        onClick={() => { setApplyingJob(selectedJob); setSelectedJob(null); }}
                                    >
                                        Apply Now <ChevronRight className="w-4 h-4 ml-1" />
                                    </Button>
                                )}
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>

            {/* Apply Dialog */}
            <Dialog open={!!applyingJob} onOpenChange={v => !v && setApplyingJob(null)}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-black">Apply — {applyingJob?.title}</DialogTitle>
                        <p className="text-sm text-slate-500">{applyingJob && companyName(applyingJob)} · {applyingJob?.location}</p>
                    </DialogHeader>

                    {applyingJob?.linkedCourseId && (
                        <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-3 text-sm text-indigo-800 flex items-start gap-2 mt-2">
                            <BrainCircuit className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
                            <div>
                                <span className="font-bold block">AI Readiness Score will be attached</span>
                                When you apply, the system will automatically fetch your highest AI Mock Interview score and attach it to this application for the employer to review.
                            </div>
                        </div>
                    )}

                    <div className="space-y-4 mt-2">
                        <div className="space-y-2">
                            <Label className="font-semibold text-sm">Resume URL <span className="text-slate-400">(optional — paste your resume/drive link)</span></Label>
                            <Input
                                placeholder="https://drive.google.com/..."
                                value={resumeUrl}
                                onChange={e => setResumeUrl(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="font-semibold text-sm">Cover Letter <span className="text-slate-400">(optional)</span></Label>
                            <Textarea
                                placeholder="Briefly describe why you're a great fit for this role..."
                                rows={5}
                                value={coverLetter}
                                onChange={e => setCoverLetter(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="flex gap-3 mt-4">
                        <Button variant="outline" className="flex-1" onClick={() => setApplyingJob(null)}>Cancel</Button>
                        <Button
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                            onClick={handleApply}
                            disabled={applying}
                        >
                            {applying ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting...</> : 'Submit Application'}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
