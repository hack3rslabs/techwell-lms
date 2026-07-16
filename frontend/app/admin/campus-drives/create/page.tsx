"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, Plus, Trash2, Building2, Briefcase, MapPin, X } from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api';

interface Company {
    id: string;
    name: string;
    logo?: string;
    industry?: string;
    salary?: string;
    openings?: number;
    roles: string[];
    locations: string[];
}

export default function CreateCampusDrive() {
    const router = useRouter();
    const [submitting, setSubmitting] = useState(false);
    const [activeTab, setActiveTab] = useState<'basic' | 'companies'>('basic');

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        jobRole: '',
        salary: '',
        openings: '',
        targetYear: '',
        location: '',
        scheduledDate: '',
        isOffCampus: false,
        skills: ''
    });

    const [companies, setCompanies] = useState<Company[]>([]);
    const [addingCompany, setAddingCompany] = useState(false);
    const [newCompany, setNewCompany] = useState<Omit<Company, 'id'>>({
        name: '', logo: '', industry: '', salary: '', openings: undefined,
        roles: [''], locations: ['']
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
        }));
    };

    const addRole = () => setNewCompany(prev => ({ ...prev, roles: [...prev.roles, ''] }));
    const updateRole = (i: number, val: string) => setNewCompany(prev => {
        const roles = [...prev.roles]; roles[i] = val; return { ...prev, roles };
    });
    const removeRole = (i: number) => setNewCompany(prev => ({ ...prev, roles: prev.roles.filter((_, idx) => idx !== i) }));

    const addLocation = () => setNewCompany(prev => ({ ...prev, locations: [...prev.locations, ''] }));
    const updateLocation = (i: number, val: string) => setNewCompany(prev => {
        const locations = [...prev.locations]; locations[i] = val; return { ...prev, locations };
    });
    const removeLocation = (i: number) => setNewCompany(prev => ({ ...prev, locations: prev.locations.filter((_, idx) => idx !== i) }));

    const saveCompany = () => {
        if (!newCompany.name.trim()) { alert('Company name is required.'); return; }
        const filtered = {
            ...newCompany,
            roles: newCompany.roles.filter(r => r.trim()),
            locations: newCompany.locations.filter(l => l.trim())
        };
        setCompanies(prev => [...prev, { ...filtered, id: Date.now().toString() }]);
        setNewCompany({ name: '', logo: '', industry: '', salary: '', openings: undefined, roles: [''], locations: [''] });
        setAddingCompany(false);
    };

    const removeCompany = (id: string) => setCompanies(prev => prev.filter(c => c.id !== id));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const res = await api.post('/campus-drives', {
                ...formData,
                skills: formData.skills.split(',').map(s => s.trim()).filter(Boolean),
                participatingCompanies: companies.length > 0 ? companies : undefined
            });

            if (res.status === 201 || res.data?.success || res.status === 200) {
                alert('Campus Drive created successfully!');
                router.push('/admin/campus-drives');
            } else {
                alert(res.data?.error || res.data?.message || 'Failed to create drive');
            }
        } catch (error: any) {
            alert(error.response?.data?.error || 'An error occurred');
        } finally {
            setSubmitting(false);
        }
    };

    const inputCls = "w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none text-slate-700 text-sm bg-white";
    const labelCls = "block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide";

    return (
        <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-5xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <Link href="/admin/campus-drives" className="inline-flex items-center text-sm font-medium text-indigo-500 hover:text-indigo-600 mb-4">
                    <ArrowLeft className="w-4 h-4 mr-1" /> Back to Drives
                </Link>
                <h1 className="text-2xl md:text-3xl text-slate-800 font-bold">Launch Campus Drive / Job Mela</h1>
                <p className="text-slate-500 mt-1 text-sm">Create a new drive or a multi-company Job Mela event.</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-slate-100 rounded-xl p-1 mb-6 w-fit">
                {(['basic', 'companies'] as const).map(tab => (
                    <button
                        key={tab}
                        type="button"
                        onClick={() => setActiveTab(tab)}
                        className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all capitalize ${activeTab === tab ? 'bg-white shadow text-indigo-700' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        {tab === 'basic' ? 'Basic Details' : `Participating Companies ${companies.length > 0 ? `(${companies.length})` : ''}`}
                    </button>
                ))}
            </div>

            <form onSubmit={handleSubmit}>

                {/* ===== TAB: BASIC DETAILS ===== */}
                {activeTab === 'basic' && (
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8 space-y-6">
                        {/* Job Mela Toggle */}
                        <label className="flex items-start gap-4 p-4 bg-indigo-50 rounded-xl border border-indigo-100 cursor-pointer">
                            <input
                                type="checkbox"
                                name="isOffCampus"
                                checked={formData.isOffCampus}
                                onChange={handleChange}
                                className="w-5 h-5 mt-0.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                            />
                            <div>
                                <div className="font-semibold text-indigo-900">Make this a Job Mela (Public / Off-Campus)</div>
                                <div className="text-sm text-indigo-700 mt-0.5">This will generate a public registration link for anyone to apply — not limited to specific institutes.</div>
                            </div>
                        </label>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="md:col-span-2">
                                <label className={labelCls}>Drive / Event Title *</label>
                                <input type="text" name="title" required value={formData.title} onChange={handleChange} className={inputCls} placeholder="e.g. Techwell Mega Job Mela – Hyderabad 2026" />
                            </div>

                            <div>
                                <label className={labelCls}>Primary Job Role</label>
                                <input type="text" name="jobRole" value={formData.jobRole} onChange={handleChange} className={inputCls} placeholder="Software Engineer" />
                            </div>

                            <div>
                                <label className={labelCls}>Target Graduation Year</label>
                                <input type="text" name="targetYear" value={formData.targetYear} onChange={handleChange} className={inputCls} placeholder="e.g. 2024, 2025" />
                            </div>

                            <div>
                                <label className={labelCls}>Salary / CTC Range</label>
                                <input type="text" name="salary" value={formData.salary} onChange={handleChange} className={inputCls} placeholder="e.g. 3–12 LPA" />
                            </div>

                            <div>
                                <label className={labelCls}>Total Openings</label>
                                <input type="number" name="openings" value={formData.openings} onChange={handleChange} className={inputCls} placeholder="50" />
                            </div>

                            <div>
                                <label className={labelCls}>Venue / City *</label>
                                <input type="text" name="location" required value={formData.location} onChange={handleChange} className={inputCls} placeholder="Hyderabad Convention Centre" />
                            </div>

                            <div>
                                <label className={labelCls}>Scheduled Date *</label>
                                <input type="date" name="scheduledDate" required value={formData.scheduledDate} onChange={handleChange} className={inputCls} />
                            </div>

                            <div className="md:col-span-2">
                                <label className={labelCls}>Required Skills (comma separated)</label>
                                <input type="text" name="skills" value={formData.skills} onChange={handleChange} className={inputCls} placeholder="React, Java, Python, Communication" />
                            </div>

                            <div className="md:col-span-2">
                                <label className={labelCls}>Description / Eligibility Criteria</label>
                                <textarea name="description" rows={4} value={formData.description} onChange={handleChange} className={inputCls + ' resize-none'} placeholder="Who can apply, process, what to bring, etc." />
                            </div>
                        </div>

                        <div className="flex justify-end pt-4 border-t border-slate-100">
                            <button type="button" onClick={() => setActiveTab('companies')} className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-semibold text-sm transition-all">
                                Next: Add Companies →
                            </button>
                        </div>
                    </div>
                )}

                {/* ===== TAB: COMPANIES ===== */}
                {activeTab === 'companies' && (
                    <div className="space-y-4">
                        {/* Existing companies */}
                        {companies.map(c => (
                            <div key={c.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex items-start justify-between gap-4">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                                        {c.name.charAt(0)}
                                    </div>
                                    <div>
                                        <div className="font-bold text-slate-800">{c.name}</div>
                                        {c.industry && <div className="text-xs text-slate-500">{c.industry}</div>}
                                        {c.salary && <div className="text-xs text-green-600 font-medium mt-0.5">{c.salary}</div>}
                                        <div className="flex flex-wrap gap-1 mt-2">
                                            {c.roles.map(r => (
                                                <span key={r} className="inline-flex items-center gap-1 text-xs bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-full px-2.5 py-0.5">
                                                    <Briefcase className="w-3 h-3" />{r}
                                                </span>
                                            ))}
                                            {c.locations.map(l => (
                                                <span key={l} className="inline-flex items-center gap-1 text-xs bg-slate-50 text-slate-600 border border-slate-100 rounded-full px-2.5 py-0.5">
                                                    <MapPin className="w-3 h-3" />{l}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <button type="button" onClick={() => removeCompany(c.id)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))}

                        {/* Add company form */}
                        {addingCompany ? (
                            <div className="bg-white rounded-2xl border-2 border-indigo-200 shadow-md p-6 space-y-5">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-bold text-slate-800 flex items-center gap-2"><Building2 className="w-4 h-4 text-indigo-500" />Add Participating Company</h3>
                                    <button type="button" onClick={() => setAddingCompany(false)} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg">
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className={labelCls}>Company Name *</label>
                                        <input type="text" value={newCompany.name} onChange={e => setNewCompany(p => ({ ...p, name: e.target.value }))} className={inputCls} placeholder="e.g. TCS, Infosys" />
                                    </div>
                                    <div>
                                        <label className={labelCls}>Industry</label>
                                        <input type="text" value={newCompany.industry} onChange={e => setNewCompany(p => ({ ...p, industry: e.target.value }))} className={inputCls} placeholder="e.g. IT Services" />
                                    </div>
                                    <div>
                                        <label className={labelCls}>Package / CTC</label>
                                        <input type="text" value={newCompany.salary} onChange={e => setNewCompany(p => ({ ...p, salary: e.target.value }))} className={inputCls} placeholder="e.g. 4.5 LPA" />
                                    </div>
                                    <div>
                                        <label className={labelCls}>Openings</label>
                                        <input type="number" value={newCompany.openings || ''} onChange={e => setNewCompany(p => ({ ...p, openings: parseInt(e.target.value) || undefined }))} className={inputCls} placeholder="10" />
                                    </div>
                                    <div>
                                        <label className={labelCls}>Logo URL (optional)</label>
                                        <input type="url" value={newCompany.logo} onChange={e => setNewCompany(p => ({ ...p, logo: e.target.value }))} className={inputCls} placeholder="https://..." />
                                    </div>
                                </div>

                                {/* Designations */}
                                <div>
                                    <label className={labelCls + ' flex items-center gap-1'}><Briefcase className="w-3.5 h-3.5" />Designations / Roles</label>
                                    <div className="space-y-2">
                                        {newCompany.roles.map((role, i) => (
                                            <div key={i} className="flex gap-2">
                                                <input type="text" value={role} onChange={e => updateRole(i, e.target.value)} className={inputCls + ' flex-1'} placeholder="e.g. Software Engineer, HR Executive" />
                                                {newCompany.roles.length > 1 && (
                                                    <button type="button" onClick={() => removeRole(i)} className="p-2.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl border border-slate-200">
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                        <button type="button" onClick={addRole} className="text-indigo-600 hover:text-indigo-700 text-sm font-medium flex items-center gap-1">
                                            <Plus className="w-4 h-4" />Add Designation
                                        </button>
                                    </div>
                                </div>

                                {/* Locations */}
                                <div>
                                    <label className={labelCls + ' flex items-center gap-1'}><MapPin className="w-3.5 h-3.5" />Work Locations</label>
                                    <div className="space-y-2">
                                        {newCompany.locations.map((loc, i) => (
                                            <div key={i} className="flex gap-2">
                                                <input type="text" value={loc} onChange={e => updateLocation(i, e.target.value)} className={inputCls + ' flex-1'} placeholder="e.g. Hyderabad, Remote, Bengaluru" />
                                                {newCompany.locations.length > 1 && (
                                                    <button type="button" onClick={() => removeLocation(i)} className="p-2.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl border border-slate-200">
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                        <button type="button" onClick={addLocation} className="text-indigo-600 hover:text-indigo-700 text-sm font-medium flex items-center gap-1">
                                            <Plus className="w-4 h-4" />Add Location
                                        </button>
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-2 border-t border-slate-100">
                                    <button type="button" onClick={saveCompany} className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-xl font-semibold text-sm transition-all">
                                        Save Company
                                    </button>
                                    <button type="button" onClick={() => setAddingCompany(false)} className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-5 py-2 rounded-xl font-semibold text-sm transition-all">
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <button
                                type="button"
                                onClick={() => setAddingCompany(true)}
                                className="w-full flex items-center justify-center gap-2 text-indigo-600 border-2 border-dashed border-indigo-200 hover:border-indigo-400 hover:bg-indigo-50 rounded-2xl py-5 font-semibold text-sm transition-all"
                            >
                                <Plus className="w-5 h-5" /> Add Participating Company
                            </button>
                        )}

                        <div className="flex justify-between items-center pt-4 border-t border-slate-200">
                            <button type="button" onClick={() => setActiveTab('basic')} className="text-slate-500 hover:text-slate-700 text-sm font-medium flex items-center gap-1">
                                ← Back to Basic Details
                            </button>
                            <button type="submit" disabled={submitting} className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-2.5 rounded-xl font-semibold text-sm transition-all flex items-center gap-2 disabled:opacity-70 shadow-lg">
                                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                                {submitting ? 'Launching...' : '🚀 Launch Drive'}
                            </button>
                        </div>
                    </div>
                )}
            </form>
        </div>
    );
}
