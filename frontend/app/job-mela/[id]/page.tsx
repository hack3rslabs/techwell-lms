"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Calendar, MapPin, Building2, Briefcase, ArrowRight, Loader2, CheckCircle2, Users, ChevronDown, ChevronUp, Tag, Clock } from 'lucide-react';

interface Company {
    id: string;
    name: string;
    logo?: string;
    industry?: string;
    roles: string[]; // array of designations
    locations: string[]; // array of work locations
    salary?: string;
    openings?: number;
}

interface FormField {
    id: string;
    label: string;
    type: string;
    required: boolean;
    options?: string[];
}

interface DriveData {
    id: string;
    title: string;
    description?: string;
    scheduledDate?: string;
    location?: string;
    participatingCompanies?: Company[];
    customFormFields?: FormField[];
    brandingAssets?: {
        primaryColor?: string;
        bannerUrl?: string;
        title?: string;
    };
    hostName?: string;
    hostLogo?: string;
}

export default function JobMelaRegistration() {
    const params = useParams();
    const router = useRouter();
    const [drive, setDrive] = useState<DriveData | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    const [formData, setFormData] = useState<Record<string, string>>({});
    // Track selected role per company: { companyId: { role, location } }
    const [selections, setSelections] = useState<Record<string, { role: string; location: string }>>({});
    const [expandedCompany, setExpandedCompany] = useState<string | null>(null);

    useEffect(() => {
        if (params.id) {
            fetchDriveDetails(params.id as string);
        }
    }, [params.id]);

    const fetchDriveDetails = async (id: string) => {
        try {
            const res = await fetch(`/api/campus-drives/${id}`);
            const data = await res.json();
            if (res.ok) {
                setDrive(data);
                const initialData: Record<string, string> = { password: '' };
                (data.customFormFields || []).forEach((field: FormField) => {
                    initialData[field.id] = '';
                });
                setFormData(initialData);
                // Auto-expand first company
                const companies = data.participatingCompanies || [];
                if (companies.length > 0) setExpandedCompany(companies[0].id);
            }
        } catch {
            console.error('Failed to fetch drive');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const toggleCompanySelection = (company: Company, role: string, location: string) => {
        setSelections(prev => {
            const existing = prev[company.id];
            if (existing?.role === role && existing?.location === location) {
                // Deselect
                const next = { ...prev };
                delete next[company.id];
                return next;
            }
            return { ...prev, [company.id]: { role, location } };
        });
    };

    const isSelected = (companyId: string, role: string, location: string) => {
        return selections[companyId]?.role === role && selections[companyId]?.location === location;
    };

    const isCompanySelected = (companyId: string) => !!selections[companyId];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const companies = drive?.participatingCompanies || [];
        if (companies.length > 0 && Object.keys(selections).length === 0) {
            alert('Please select at least one position to apply for.');
            return;
        }

        setSubmitting(true);
        try {
            const selectedCompanies = Object.entries(selections).map(([companyId, sel]) => {
                const company = companies.find(c => c.id === companyId);
                return { companyId, companyName: company?.name, role: sel.role, location: sel.location };
            });

            const payload = {
                name: formData['name'] || formData['f1'],
                email: formData['email'] || formData['f2'],
                phone: formData['phone'] || formData['f3'],
                password: formData.password,
                customData: formData,
                selectedCompanies
            };

            const res = await fetch(`/api/campus-drives/${params.id}/mela-register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                setSuccess(true);
            } else {
                const data = await res.json();
                alert(data.error || 'Registration failed');
            }
        } catch {
            alert('An error occurred during registration.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
        </div>
    );
    if (!drive) return <div className="min-h-screen flex items-center justify-center">Event not found</div>;

    const branding = drive.brandingAssets || {};
    const primaryColor = branding.primaryColor || '#4f46e5';
    const bannerUrl = branding.bannerUrl;
    const companies = drive.participatingCompanies || [];
    const fields: FormField[] = drive.customFormFields || [
        { id: 'name', label: 'Full Name', type: 'text', required: true },
        { id: 'email', label: 'Email Address', type: 'email', required: true },
        { id: 'phone', label: 'Phone Number', type: 'tel', required: true },
        { id: 'college', label: 'College / Institute', type: 'text', required: true },
        { id: 'branch', label: 'Branch / Specialization', type: 'text', required: false },
        { id: 'year', label: 'Graduation Year', type: 'text', required: false },
    ];

    const hostName = drive.hostName || 'Techwell';
    const hostLogo = drive.hostLogo || '/logo-dark.png';
    const selectedCount = Object.keys(selections).length;

    if (success) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)' }}>
                <div className="max-w-lg w-full bg-white rounded-3xl shadow-2xl p-10 text-center">
                    <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 className="w-12 h-12 text-green-600" />
                    </div>
                    <h2 className="text-3xl font-bold text-slate-800 mb-3">You&apos;re Registered!</h2>
                    <p className="text-slate-500 mb-4 leading-relaxed">
                        You have successfully registered for <strong>{branding.title || drive.title}</strong>. 
                        We&apos;ve created your account — check your email for login credentials.
                    </p>
                    {selectedCount > 0 && (
                        <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 mb-6 text-left">
                            <p className="text-sm font-semibold text-indigo-700 mb-2">Applied for {selectedCount} position{selectedCount > 1 ? 's' : ''}:</p>
                            {Object.entries(selections).map(([cid, sel]) => {
                                const c = companies.find(x => x.id === cid);
                                return (
                                    <div key={cid} className="flex items-center gap-2 text-sm text-indigo-600 mt-1">
                                        <Building2 className="w-3.5 h-3.5" />
                                        <span>{c?.name} — {sel.role} ({sel.location})</span>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                    <button onClick={() => router.push('/login')} className="w-full text-white font-semibold py-3.5 rounded-2xl transition-all hover:opacity-90 shadow-lg" style={{ backgroundColor: primaryColor }}>
                        Login to Track Application
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col lg:flex-row">
            {/* ===== LEFT PANEL – Event Info ===== */}
            <div 
                className="w-full lg:w-5/12 xl:w-2/5 text-white flex flex-col relative overflow-hidden lg:min-h-screen lg:sticky lg:top-0"
                style={{ background: `linear-gradient(160deg, ${primaryColor}ee 0%, #0f172a 100%)` }}
            >
                {bannerUrl && (
                    <div className="absolute inset-0 bg-cover bg-center mix-blend-overlay opacity-20" style={{ backgroundImage: `url(${bannerUrl})` }} />
                )}
                <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-80 h-80 bg-black/10 rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10 flex flex-col h-full p-8 lg:p-12">
                    {/* Host Logo */}
                    <div className="mb-10">
                        <div className="text-xs font-bold tracking-widest uppercase text-white/60 mb-3">Organized By</div>
                        <img src={hostLogo} alt={hostName} className="h-10 object-contain brightness-0 invert drop-shadow-md" />
                    </div>

                    {/* Title */}
                    <h1 className="text-3xl lg:text-4xl xl:text-5xl font-extrabold leading-tight mb-4 drop-shadow-md">
                        {branding.title || drive.title}
                    </h1>
                    <p className="text-white/80 text-base lg:text-lg leading-relaxed mb-8">{drive.description}</p>

                    {/* Event Details */}
                    <div className="space-y-4 mb-8">
                        {drive.scheduledDate && (
                            <div className="flex items-center gap-4">
                                <div className="w-11 h-11 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center backdrop-blur-sm flex-shrink-0">
                                    <Calendar className="w-5 h-5" />
                                </div>
                                <div>
                                    <div className="text-white/60 text-xs uppercase tracking-wide">Date</div>
                                    <div className="font-semibold">{new Date(drive.scheduledDate).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
                                </div>
                            </div>
                        )}
                        {drive.location && (
                            <div className="flex items-center gap-4">
                                <div className="w-11 h-11 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center backdrop-blur-sm flex-shrink-0">
                                    <MapPin className="w-5 h-5" />
                                </div>
                                <div>
                                    <div className="text-white/60 text-xs uppercase tracking-wide">Venue</div>
                                    <div className="font-semibold">{drive.location}</div>
                                </div>
                            </div>
                        )}
                        <div className="flex items-center gap-4">
                            <div className="w-11 h-11 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center backdrop-blur-sm flex-shrink-0">
                                <Building2 className="w-5 h-5" />
                            </div>
                            <div>
                                <div className="text-white/60 text-xs uppercase tracking-wide">Participating Companies</div>
                                <div className="font-semibold">{companies.length > 0 ? `${companies.length} Company${companies.length > 1 ? 'ies' : ''}` : 'Multiple Companies'}</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="w-11 h-11 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center backdrop-blur-sm flex-shrink-0">
                                <Briefcase className="w-5 h-5" />
                            </div>
                            <div>
                                <div className="text-white/60 text-xs uppercase tracking-wide">Total Openings</div>
                                <div className="font-semibold">
                                    {companies.reduce((sum, c) => sum + (c.openings || 0), 0) || 'Multiple Positions'}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Company quick logos */}
                    {companies.length > 0 && (
                        <div className="mt-auto pt-6 border-t border-white/10">
                            <div className="text-xs font-bold tracking-widest uppercase text-white/50 mb-3">Companies Participating</div>
                            <div className="flex flex-wrap gap-2">
                                {companies.map(c => (
                                    <span key={c.id} className="text-xs bg-white/10 border border-white/20 rounded-full px-3 py-1 font-medium">
                                        {c.name}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ===== RIGHT PANEL – Registration Form ===== */}
            <div className="w-full lg:w-7/12 xl:w-3/5 bg-slate-50 flex flex-col overflow-y-auto">
                <div className="flex-1 p-6 md:p-10 lg:p-12 max-w-2xl mx-auto w-full">
                    
                    <div className="mb-8">
                        <h2 className="text-2xl md:text-3xl font-extrabold text-slate-800 mb-1">Secure Your Spot</h2>
                        <p className="text-slate-500">Fill in your details and select the positions you want to apply for.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        
                        {/* ── COMPANY SELECTOR ── */}
                        {companies.length > 0 && (
                            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                                <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                                    <div>
                                        <h3 className="font-bold text-slate-800 text-base">Select Positions to Apply</h3>
                                        <p className="text-xs text-slate-500 mt-0.5">Choose one role per company. You can apply to multiple companies.</p>
                                    </div>
                                    {selectedCount > 0 && (
                                        <span className="bg-indigo-100 text-indigo-700 text-xs font-bold rounded-full px-3 py-1">
                                            {selectedCount} selected
                                        </span>
                                    )}
                                </div>

                                <div className="divide-y divide-slate-100">
                                    {companies.map((company) => {
                                        const isExpanded = expandedCompany === company.id;
                                        const companySelected = isCompanySelected(company.id);
                                        const sel = selections[company.id];

                                        return (
                                            <div key={company.id} className={`transition-colors ${companySelected ? 'bg-indigo-50/60' : 'bg-white'}`}>
                                                {/* Company Header */}
                                                <button
                                                    type="button"
                                                    className="w-full flex items-center justify-between px-5 py-4 text-left"
                                                    onClick={() => setExpandedCompany(isExpanded ? null : company.id)}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        {company.logo ? (
                                                            <img src={company.logo} alt={company.name} className="w-10 h-10 rounded-xl object-contain border border-slate-100 bg-white p-1" />
                                                        ) : (
                                                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                                                                {company.name.charAt(0)}
                                                            </div>
                                                        )}
                                                        <div>
                                                            <div className="font-semibold text-slate-800 text-sm">{company.name}</div>
                                                            <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                                                                {company.industry && <span>{company.industry}</span>}
                                                                {company.salary && <><span className="w-1 h-1 bg-slate-300 rounded-full inline-block"></span><span className="text-green-600 font-medium">{company.salary}</span></>}
                                                            </div>
                                                            {companySelected && (
                                                                <div className="text-xs text-indigo-600 font-semibold mt-1 flex items-center gap-1">
                                                                    <CheckCircle2 className="w-3 h-3" />
                                                                    {sel.role} · {sel.location}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        {companySelected && <span className="w-2.5 h-2.5 bg-green-500 rounded-full"></span>}
                                                        {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                                                    </div>
                                                </button>

                                                {/* Expanded: Roles & Locations */}
                                                {isExpanded && (
                                                    <div className="px-5 pb-5 space-y-3">
                                                        {(company.roles || []).map(role => (
                                                            <div key={role}>
                                                                <div className="flex items-center gap-1.5 mb-2">
                                                                    <Briefcase className="w-3.5 h-3.5 text-indigo-500" />
                                                                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">{role}</span>
                                                                </div>
                                                                <div className="flex flex-wrap gap-2 pl-5">
                                                                    {(company.locations || ['Remote']).map(loc => {
                                                                        const active = isSelected(company.id, role, loc);
                                                                        return (
                                                                            <button
                                                                                key={loc}
                                                                                type="button"
                                                                                onClick={() => toggleCompanySelection(company, role, loc)}
                                                                                className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border transition-all ${
                                                                                    active
                                                                                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                                                                                        : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300 hover:text-indigo-600'
                                                                                }`}
                                                                            >
                                                                                <MapPin className="w-3 h-3" />
                                                                                {loc}
                                                                                {active && <CheckCircle2 className="w-3 h-3" />}
                                                                            </button>
                                                                        );
                                                                    })}
                                                                </div>
                                                            </div>
                                                        ))}
                                                        {(!company.roles || company.roles.length === 0) && (
                                                            <p className="text-xs text-slate-400 italic">Roles to be announced.</p>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* ── PERSONAL DETAILS ── */}
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="px-5 py-4 border-b border-slate-100">
                                <h3 className="font-bold text-slate-800 text-base">Your Details</h3>
                                <p className="text-xs text-slate-500 mt-0.5">We&apos;ll create your profile using this information.</p>
                            </div>
                            <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {fields.map((field) => (
                                    <div key={field.id} className={field.type === 'textarea' ? 'sm:col-span-2' : ''}>
                                        <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                                            {field.label}{field.required && <span className="text-red-400 ml-1">*</span>}
                                        </label>
                                        {field.type === 'select' && field.options ? (
                                            <select
                                                name={field.id}
                                                required={field.required}
                                                value={formData[field.id] || ''}
                                                onChange={handleChange}
                                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none text-slate-700 bg-white text-sm"
                                            >
                                                <option value="">Select...</option>
                                                {field.options.map(o => <option key={o} value={o}>{o}</option>)}
                                            </select>
                                        ) : field.type === 'textarea' ? (
                                            <textarea
                                                name={field.id}
                                                required={field.required}
                                                value={formData[field.id] || ''}
                                                onChange={handleChange}
                                                rows={3}
                                                placeholder={field.label}
                                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none text-slate-700 text-sm resize-none"
                                            />
                                        ) : (
                                            <input
                                                type={field.type}
                                                name={field.id}
                                                required={field.required}
                                                value={formData[field.id] || ''}
                                                onChange={handleChange}
                                                placeholder={field.label}
                                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none text-slate-700 text-sm"
                                            />
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* ── PASSWORD ── */}
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                                Set Password <span className="normal-case font-normal text-slate-400">(to login and track your application)</span>
                            </label>
                            <input
                                type="password"
                                name="password"
                                required
                                value={formData.password || ''}
                                onChange={handleChange}
                                placeholder="Create a strong password"
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none text-slate-700 text-sm"
                            />
                        </div>

                        {/* ── SUBMIT ── */}
                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full text-white font-bold py-4 rounded-2xl transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 text-base disabled:opacity-70"
                            style={{ backgroundColor: primaryColor }}
                        >
                            {submitting ? (
                                <><Loader2 className="w-5 h-5 animate-spin" /> Registering...</>
                            ) : (
                                <>Confirm Registration <ArrowRight className="w-5 h-5" /></>
                            )}
                        </button>

                        <p className="text-center text-xs text-slate-400 pb-4">
                            By registering, you agree to our Terms of Service and Privacy Policy.
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
}
