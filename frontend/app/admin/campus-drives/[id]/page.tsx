"use client";

import { useState, useEffect } from "react";
import { campusApi, instituteApi } from "@/lib/api";
import {
    Users, MapPin, Calendar, Briefcase, GraduationCap, Building2,
    ArrowLeft, Settings2, Plus, CheckCircle, XCircle, Clock,
    ChevronDown, Loader2, Search, Download, RefreshCw, Brain, Mail
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

const PIPELINE_STAGES = [
    { key: "APPLIED",        label: "Applied",          color: "bg-slate-100 text-slate-700 border-slate-200" },
    { key: "SHORTLISTED",    label: "Shortlisted",      color: "bg-blue-100 text-blue-700 border-blue-200" },
    { key: "TECH_INTERVIEW", label: "Tech Interview",   color: "bg-indigo-100 text-indigo-700 border-indigo-200" },
    { key: "HR_INTERVIEW",   label: "HR Interview",     color: "bg-purple-100 text-purple-700 border-purple-200" },
    { key: "SELECTED",       label: "Selected",         color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
    { key: "OFFERED",        label: "Offered",          color: "bg-teal-100 text-teal-700 border-teal-200" },
    { key: "JOINED",         label: "Joined",           color: "bg-green-100 text-green-700 border-green-200" },
    { key: "REJECTED",       label: "Rejected",         color: "bg-red-100 text-red-700 border-red-200" },
];

type Drive = {
    id: string; title: string; isOffCampus: boolean; jobRole: string;
    location: string; scheduledDate: string; status: string;
    employer: { companyName: string; name: string };
    institutes: { id: string; name: string }[];
    students: Candidate[];
    openings?: number; salary?: string; targetYear?: string;
    participatingCompanies?: Company[];
    description?: string;
};

type Candidate = {
    id: string; status: string; targetRole?: string; atsScore?: number;
    notes?: string; offerLetterUrl?: string; ctc?: string;
    user?: { id: string; name: string; email: string; phone?: string; college?: string; avatar?: string };
};

type Company = { id?: string; name: string; industry?: string; salary?: string; openings?: number; roles?: string[]; locations?: string[] };

export default function DrivePipelinePage({ params }: { params: { id: string } }) {
    const [drive, setDrive] = useState<Drive | null>(null);
    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [institutes, setInstitutes] = useState<{ id: string; name: string }[]>([]);
    const [allInstitutes, setAllInstitutes] = useState<{ id: string; name: string }[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<"pipeline" | "companies" | "institutes" | "settings">("pipeline");
    const [search, setSearch] = useState("");
    const [filterStatus, setFilterStatus] = useState("ALL");
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [bulkStatus, setBulkStatus] = useState("");
    const [matching, setMatching] = useState(false);

    useEffect(() => { fetchData(); }, [params.id]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [driveRes, studentsRes, institutesRes] = await Promise.allSettled([
                campusApi.getById(params.id),
                campusApi.getStudents(params.id),
                instituteApi.getAll(),
            ]);
            if (driveRes.status === "fulfilled") setDrive(driveRes.value.data);
            if (studentsRes.status === "fulfilled") {
                const data = studentsRes.value.data;
                setCandidates(Array.isArray(data) ? data : data?.students ?? []);
            }
            if (institutesRes.status === "fulfilled") {
                setAllInstitutes(institutesRes.value.data ?? []);
            }
        } catch { toast.error("Failed to load drive data"); }
        finally { setLoading(false); }
    };

    const handleStatusChange = async (candidateId: string, newStatus: string) => {
        try {
            await campusApi.updateStudentStatus(candidateId, newStatus);
            setCandidates(prev => prev.map(c => c.id === candidateId ? { ...c, status: newStatus } : c));
            toast.success(`Status updated to ${newStatus}`);
        } catch { toast.error("Failed to update status"); }
    };

    const handleBulkStatus = async () => {
        if (!bulkStatus || selectedIds.size === 0) return;
        try {
            await Promise.all([...selectedIds].map(id => campusApi.updateStudentStatus(id, bulkStatus)));
            setCandidates(prev => prev.map(c => selectedIds.has(c.id) ? { ...c, status: bulkStatus } : c));
            setSelectedIds(new Set()); setBulkStatus("");
            toast.success(`Updated ${selectedIds.size} candidates`);
        } catch { toast.error("Bulk update failed"); }
    };

    const handleMatch = async () => {
        setMatching(true);
        try {
            const res = await campusApi.matchStudents(params.id);
            toast.success(`AI matched ${res.data?.matched ?? 0} candidates!`);
            fetchData();
        } catch { toast.error("AI matching failed"); }
        finally { setMatching(false); }
    };

    const exportCSV = () => {
        const rows = [
            ["Name", "Email", "Phone", "College", "Company Applied", "Status", "ATS Score"],
            ...filtered.map(c => [
                c.user?.name ?? "", c.user?.email ?? "", c.user?.phone ?? "",
                c.user?.college ?? "", c.targetRole ?? "", c.status, c.atsScore ?? ""
            ])
        ];
        const csv = rows.map(r => r.join(",")).join("\n");
        const a = document.createElement("a");
        a.href = "data:text/csv;charset=utf-8," + encodeURIComponent(csv);
        a.download = `drive-${params.id}-candidates.csv`; a.click();
    };

    const filtered = candidates.filter(c => {
        const s = search.toLowerCase();
        const matchSearch = !s || c.user?.name?.toLowerCase().includes(s) ||
            c.user?.email?.toLowerCase().includes(s) || c.user?.college?.toLowerCase().includes(s) ||
            c.targetRole?.toLowerCase().includes(s);
        const matchStatus = filterStatus === "ALL" || c.status === filterStatus;
        return matchSearch && matchStatus;
    });

    const stageCounts = PIPELINE_STAGES.reduce((acc, s) => {
        acc[s.key] = candidates.filter(c => c.status === s.key).length;
        return acc;
    }, {} as Record<string, number>);

    if (loading) return (
        <div className="flex h-[400px] items-center justify-center gap-3 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin" /><span>Loading drive...</span>
        </div>
    );

    const companies: Company[] = Array.isArray(drive?.participatingCompanies)
        ? drive!.participatingCompanies as Company[] : [];

    return (
        <div className="space-y-6">
            {/* Back + Header */}
            <div className="flex flex-col gap-4">
                <Link href="/admin/campus-drives" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground w-fit">
                    <ArrowLeft className="h-4 w-4" /> Back to Drives
                </Link>
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-6 text-white border border-slate-700">
                    <div className="absolute -top-16 -right-16 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
                    <div className="relative flex flex-col md:flex-row justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${drive?.isOffCampus ? "bg-amber-500/20 text-amber-300 border border-amber-500/30" : "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"}`}>
                                    {drive?.isOffCampus ? "Job Mela (Public)" : "On-Campus Drive"}
                                </span>
                                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${drive?.status === "ACTIVE" ? "bg-emerald-500/20 text-emerald-300" : "bg-slate-500/20 text-slate-300"}`}>
                                    {drive?.status}
                                </span>
                            </div>
                            <h1 className="text-2xl font-bold">{drive?.title ?? "Drive"}</h1>
                            <div className="flex flex-wrap gap-4 mt-2 text-sm text-slate-300">
                                {drive?.location && <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{drive.location}</span>}
                                {drive?.scheduledDate && <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{new Date(drive.scheduledDate).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</span>}
                                {drive?.jobRole && <span className="flex items-center gap-1"><Briefcase className="h-3.5 w-3.5" />{drive.jobRole}</span>}
                            </div>
                        </div>
                        <div className="flex flex-col gap-2 shrink-0 text-right">
                            <div className="text-3xl font-extrabold text-white">{candidates.length}</div>
                            <div className="text-xs text-slate-400">Total Candidates</div>
                            <div className="text-lg font-semibold text-emerald-400">{stageCounts.JOINED ?? 0} Joined</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stage Summary Bar */}
            <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
                {PIPELINE_STAGES.map(s => (
                    <button key={s.key} onClick={() => setFilterStatus(filterStatus === s.key ? "ALL" : s.key)}
                        className={`rounded-xl border p-3 text-center transition-all ${filterStatus === s.key ? s.color + " ring-2 ring-offset-1" : "bg-card border-border hover:border-primary/30"}`}>
                        <div className="text-xl font-bold">{stageCounts[s.key] ?? 0}</div>
                        <div className="text-xs mt-0.5 leading-tight">{s.label}</div>
                    </button>
                ))}
            </div>

            {/* Tabs */}
            <div className="flex gap-1 border-b">
                {([
                    { key: "pipeline", label: `Candidates (${candidates.length})`, icon: Users },
                    { key: "companies", label: `Companies (${companies.length})`, icon: Building2 },
                    { key: "institutes", label: `Institutes (${drive?.institutes?.length ?? 0})`, icon: GraduationCap },
                    { key: "settings", label: "Settings", icon: Settings2 },
                ] as const).map(t => (
                    <button key={t.key} onClick={() => setActiveTab(t.key)}
                        className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${activeTab === t.key ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
                        <t.icon className="h-4 w-4" />{t.label}
                    </button>
                ))}
            </div>

            {/* ── PIPELINE TAB ── */}
            {activeTab === "pipeline" && (
                <div className="space-y-4">
                    {/* Toolbar */}
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="relative flex-1 min-w-48">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, email, college..."
                                className="w-full pl-9 pr-4 py-2 text-sm border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30" />
                        </div>
                        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                            className="text-sm border rounded-lg px-3 py-2 bg-background focus:outline-none">
                            <option value="ALL">All Statuses</option>
                            {PIPELINE_STAGES.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
                        </select>
                        {selectedIds.size > 0 && (
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground">{selectedIds.size} selected</span>
                                <select value={bulkStatus} onChange={e => setBulkStatus(e.target.value)}
                                    className="text-sm border rounded-lg px-2 py-2 bg-background">
                                    <option value="">Move to...</option>
                                    {PIPELINE_STAGES.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
                                </select>
                                <button onClick={handleBulkStatus} disabled={!bulkStatus}
                                    className="px-3 py-2 bg-primary text-primary-foreground text-sm rounded-lg font-medium disabled:opacity-50">Apply</button>
                            </div>
                        )}
                        <div className="flex items-center gap-2 ml-auto">
                            <button onClick={handleMatch} disabled={matching}
                                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm rounded-lg font-medium disabled:opacity-60 transition-colors">
                                {matching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Brain className="h-4 w-4" />}
                                AI Match
                            </button>
                            <button onClick={exportCSV}
                                className="flex items-center gap-2 px-4 py-2 border text-sm rounded-lg hover:bg-muted transition-colors">
                                <Download className="h-4 w-4" /> Export CSV
                            </button>
                            <button onClick={fetchData} className="p-2 border rounded-lg hover:bg-muted transition-colors">
                                <RefreshCw className="h-4 w-4" />
                            </button>
                        </div>
                    </div>

                    {/* Candidate Table */}
                    <div className="rounded-xl border overflow-hidden">
                        <table className="w-full text-sm">
                            <thead className="bg-muted/50">
                                <tr>
                                    <th className="py-3 px-4 text-left">
                                        <input type="checkbox"
                                            checked={selectedIds.size === filtered.length && filtered.length > 0}
                                            onChange={e => setSelectedIds(e.target.checked ? new Set(filtered.map(c => c.id)) : new Set())}
                                            className="rounded" />
                                    </th>
                                    <th className="py-3 px-4 text-left font-semibold">Candidate</th>
                                    <th className="py-3 px-4 text-left font-semibold">College</th>
                                    <th className="py-3 px-4 text-left font-semibold">Company / Role</th>
                                    <th className="py-3 px-4 text-left font-semibold">ATS Score</th>
                                    <th className="py-3 px-4 text-left font-semibold">Status</th>
                                    <th className="py-3 px-4 text-right font-semibold">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {filtered.length === 0 ? (
                                    <tr><td colSpan={7} className="py-12 text-center text-muted-foreground">
                                        No candidates found.
                                    </td></tr>
                                ) : filtered.map(c => {
                                    const stage = PIPELINE_STAGES.find(s => s.key === c.status);
                                    return (
                                        <tr key={c.id} className="hover:bg-muted/20 transition-colors">
                                            <td className="py-3 px-4">
                                                <input type="checkbox" checked={selectedIds.has(c.id)}
                                                    onChange={e => {
                                                        const next = new Set(selectedIds);
                                                        if (e.target.checked) {
                                                            next.add(c.id);
                                                        } else {
                                                            next.delete(c.id);
                                                        }
                                                        setSelectedIds(next);
                                                    }} className="rounded" />
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                                                        {c.user?.name?.charAt(0) ?? "?"}
                                                    </div>
                                                    <div>
                                                        <div className="font-medium">{c.user?.name ?? "Unknown"}</div>
                                                        <div className="text-xs text-muted-foreground">{c.user?.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4 text-muted-foreground">{c.user?.college ?? "—"}</td>
                                            <td className="py-3 px-4">
                                                <span className="text-xs bg-primary/5 text-primary border border-primary/10 px-2 py-0.5 rounded-full">
                                                    {c.targetRole ?? drive?.jobRole ?? "—"}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4">
                                                {c.atsScore != null ? (
                                                    <span className={`font-semibold ${c.atsScore >= 80 ? "text-emerald-600" : c.atsScore >= 60 ? "text-amber-600" : "text-red-500"}`}>
                                                        {c.atsScore}%
                                                    </span>
                                                ) : <span className="text-muted-foreground">—</span>}
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${stage?.color ?? "bg-muted text-muted-foreground"}`}>
                                                    {stage?.label ?? c.status}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="flex items-center justify-end gap-2">
                                                    <a href={`mailto:${c.user?.email}`} className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors" title="Email">
                                                        <Mail className="h-4 w-4" />
                                                    </a>
                                                    <div className="relative group">
                                                        <select value={c.status}
                                                            onChange={e => handleStatusChange(c.id, e.target.value)}
                                                            className="text-xs border rounded-lg px-2 py-1.5 bg-background cursor-pointer appearance-none pr-6">
                                                            {PIPELINE_STAGES.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
                                                        </select>
                                                        <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 h-3 w-3 pointer-events-none text-muted-foreground" />
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* ── COMPANIES TAB ── */}
            {activeTab === "companies" && (
                <div className="space-y-4">
                    {companies.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 rounded-xl border-2 border-dashed gap-3">
                            <Building2 className="h-8 w-8 text-muted-foreground/40" />
                            <p className="text-muted-foreground text-sm">No participating companies added yet.</p>
                            <Link href={`/admin/campus-drives/create`} className="text-sm text-primary underline">Edit drive to add companies</Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {companies.map((co, i) => (
                                <div key={i} className="rounded-xl border bg-card p-5 space-y-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                                            {co.name?.charAt(0) ?? "?"}
                                        </div>
                                        <div>
                                            <div className="font-semibold">{co.name}</div>
                                            <div className="text-xs text-muted-foreground">{co.industry ?? "—"}</div>
                                        </div>
                                    </div>
                                    {co.salary && <div className="text-sm font-medium text-emerald-600">{co.salary}</div>}
                                    {co.openings && <div className="text-xs text-muted-foreground">{co.openings} openings</div>}
                                    {co.roles && co.roles.length > 0 && (
                                        <div className="flex flex-wrap gap-1">
                                            {co.roles.map(r => (
                                                <span key={r} className="text-xs bg-indigo-50 text-indigo-700 border border-indigo-100 px-2 py-0.5 rounded-full">{r}</span>
                                            ))}
                                        </div>
                                    )}
                                    <div className="text-xs text-muted-foreground">
                                        {candidates.filter(c => c.targetRole === co.name).length} candidates applied
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* ── INSTITUTES TAB ── */}
            {activeTab === "institutes" && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">Colleges linked to this drive</p>
                        <select className="text-sm border rounded-lg px-3 py-2 bg-background"
                            onChange={async e => {
                                if (!e.target.value) return;
                                try {
                                    await campusApi.addInstitute(params.id, e.target.value);
                                    toast.success("Institute linked!"); fetchData();
                                } catch { toast.error("Failed to link institute"); }
                                e.target.value = "";
                            }}>
                            <option value="">+ Link a college</option>
                            {allInstitutes.map((inst: { id: string; name: string }) => (
                                <option key={inst.id} value={inst.id}>{inst.name}</option>
                            ))}
                        </select>
                    </div>
                    {(drive?.institutes?.length ?? 0) === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 rounded-xl border-2 border-dashed gap-3">
                            <GraduationCap className="h-8 w-8 text-muted-foreground/40" />
                            <p className="text-muted-foreground text-sm">No institutes linked. Link colleges above to invite their students.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {drive?.institutes?.map(inst => (
                                <div key={inst.id} className="rounded-xl border bg-card p-5 flex items-center gap-4">
                                    <div className="p-3 rounded-xl bg-indigo-50"><GraduationCap className="h-5 w-5 text-indigo-600" /></div>
                                    <div>
                                        <div className="font-semibold">{inst.name}</div>
                                        <div className="text-xs text-muted-foreground">
                                            {candidates.filter(c => c.user?.college === inst.name).length} registered candidates
                                        </div>
                                    </div>
                                    <CheckCircle className="ml-auto h-4 w-4 text-emerald-500" />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* ── SETTINGS TAB ── */}
            {activeTab === "settings" && (
                <div className="rounded-xl border bg-card p-6 space-y-4">
                    <h3 className="font-semibold text-base">Drive Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        {[
                            ["Title", drive?.title],
                            ["Location", drive?.location],
                            ["Job Role", drive?.jobRole],
                            ["Salary", drive?.salary],
                            ["Openings", drive?.openings],
                            ["Target Year", drive?.targetYear],
                            ["Type", drive?.isOffCampus ? "Job Mela (Public)" : "On-Campus"],
                            ["Status", drive?.status],
                            ["Scheduled", drive?.scheduledDate ? new Date(drive.scheduledDate).toLocaleDateString() : "TBD"],
                            ["Employer", drive?.employer?.companyName ?? drive?.employer?.name],
                        ].map(([k, v]) => (
                            <div key={String(k)} className="flex justify-between py-2 border-b">
                                <span className="text-muted-foreground">{k}</span>
                                <span className="font-medium">{v ?? "—"}</span>
                            </div>
                        ))}
                    </div>
                    {drive?.description && (
                        <div>
                            <p className="text-sm text-muted-foreground mb-1">Description</p>
                            <p className="text-sm bg-muted/50 p-3 rounded-lg">{drive.description}</p>
                        </div>
                    )}
                    <div className="pt-2">
                        <Link href="/admin/campus-drives"
                            className="flex items-center gap-2 text-sm text-primary hover:underline">
                            <ArrowLeft className="h-4 w-4" /> Back to all drives
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}
