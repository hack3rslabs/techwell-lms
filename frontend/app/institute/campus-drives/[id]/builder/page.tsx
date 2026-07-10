"use client";

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Plus, Trash2, Save, Layout, ChevronLeft, GripVertical, QrCode, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { QRCodeSVG } from 'qrcode.react';

export default function JobMelaBuilder() {
    const params = useParams();
    const router = useRouter();
    const driveId = params.id as string;
    
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showShare, setShowShare] = useState(false);
    
    const [driveData, setDriveData] = useState<any>(null);
    
    // Builder State
    const [companies, setCompanies] = useState<any[]>([{ id: '1', name: '', roles: '' }]);
    const [fields, setFields] = useState<any[]>([
        { id: 'f1', label: 'Full Name', type: 'text', required: true, builtin: true },
        { id: 'f2', label: 'Email', type: 'email', required: true, builtin: true },
        { id: 'f3', label: 'Phone', type: 'tel', required: true, builtin: true }
    ]);
    const [branding, setBranding] = useState({
        primaryColor: '#4f46e5',
        bannerUrl: '',
        title: 'Campus Job Mela'
    });
    const [hostConfig, setHostConfig] = useState({
        hostType: 'TECHWELL',
        hostName: 'Techwell Global',
        hostLogo: ''
    });

    async function fetchDriveConfig() {
        try {
            const res = await fetch(`/api/campus-drives/${driveId}`);
            const data = await res.json();
            if (res.ok) {
                setDriveData(data);
                if (data.participatingCompanies?.length) setCompanies(data.participatingCompanies);
                if (data.customFormFields?.length) setFields(data.customFormFields);
                if (data.brandingAssets) setBranding(data.brandingAssets);
                else setBranding(prev => ({ ...prev, title: data.title || 'Campus Job Mela' }));
                
                setHostConfig({
                    hostType: data.hostType || 'TECHWELL',
                    hostName: data.hostName || 'Techwell Global',
                    hostLogo: data.hostLogo || ''
                });
            }
        } catch (error) {
            console.error('Error fetching config');
        } finally {
            setLoading(false);
        }
    }


    useEffect(() => {
        if (driveId) {
            fetchDriveConfig();
        }
    }, [driveId]);
;

    const handleSaveConfig = async () => {
        setSaving(true);
        try {
            const res = await fetch(`/api/campus-drives/${driveId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    participatingCompanies: companies,
                    customFormFields: fields,
                    brandingAssets: branding,
                    hostType: hostConfig.hostType,
                    hostName: hostConfig.hostName,
                    hostLogo: hostConfig.hostLogo
                })
            });
            if (res.ok) {
                toast.success('Configuration saved successfully!');
            } else {
                toast.error('Failed to save configuration');
            }
        } catch (error) {
            console.error('Save error', error);
            toast.error('Error saving configuration');
        } finally {
            setSaving(false);
        }
    };

    const addCompany = () => {
        setCompanies([...companies, { id: Date.now().toString(), name: '', roles: '' }]);
    };
    const updateCompany = (id: string, key: string, value: string) => {
        setCompanies(companies.map(c => c.id === id ? { ...c, [key]: value } : c));
    };
    const removeCompany = (id: string) => {
        if(companies.length === 1) return;
        setCompanies(companies.filter(c => c.id !== id));
    };

    const addField = () => {
        setFields([...fields, { id: Date.now().toString(), label: 'New Field', type: 'text', required: false, builtin: false }]);
    };
    const updateField = (id: string, key: string, value: any) => {
        setFields(fields.map(f => f.id === id ? { ...f, [key]: value } : f));
    };
    const removeField = (id: string) => {
        setFields(fields.filter(f => f.id !== id && !f.builtin));
    };

    if (loading) return <div className="p-12 text-center text-slate-500">Loading Builder...</div>;

    const publicUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/job-mela/${driveId}`;

    return (
        <div className="min-h-screen bg-slate-50 p-4 md:p-8">
            <div className="max-w-6xl mx-auto space-y-6">
                
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <div>
                        <button onClick={() => router.back()} className="text-slate-500 hover:text-slate-800 flex items-center text-sm font-medium mb-2">
                            <ChevronLeft className="w-4 h-4 mr-1" /> Back to Drives
                        </button>
                        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                            <Layout className="w-6 h-6 text-indigo-600" />
                            Job Mela Page Builder
                        </h1>
                        <p className="text-slate-500 mt-1">Configure the public registration page for {driveData?.title || 'this drive'}</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button variant="outline" onClick={() => setShowShare(true)} className="text-slate-700">
                            <QrCode className="w-4 h-4 mr-2" /> Share QR
                        </Button>
                        <Button variant="outline" onClick={() => window.open(publicUrl, '_blank')}>Preview Page</Button>
                        <Button onClick={handleSaveConfig} disabled={saving} className="bg-indigo-600 hover:bg-indigo-700">
                            <Save className="w-4 h-4 mr-2" />
                            {saving ? 'Saving...' : 'Save Configuration'}
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* Left Column: Branding & Form Config */}
                    <div className="lg:col-span-2 space-y-6">
                        
                        {/* Host Config */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                            <h2 className="text-lg font-bold text-slate-800 mb-6">Organizer / Host Details</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">Host Type</label>
                                    <select 
                                        value={hostConfig.hostType}
                                        onChange={(e) => setHostConfig({...hostConfig, hostType: e.target.value})}
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                                    >
                                        <option value="TECHWELL">Techwell</option>
                                        <option value="INSTITUTE">College / Institute</option>
                                        <option value="EMPLOYER">Employer Directly</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">Host Name</label>
                                    <Input value={hostConfig.hostName} onChange={(e) => setHostConfig({...hostConfig, hostName: e.target.value})} placeholder="e.g. Stanford University" />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">Host Logo URL</label>
                                    <Input value={hostConfig.hostLogo} onChange={(e) => setHostConfig({...hostConfig, hostLogo: e.target.value})} placeholder="https://..." />
                                </div>
                            </div>
                        </div>

                        {/* Participating Companies */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h2 className="text-lg font-bold text-slate-800">Participating Companies</h2>
                                    <p className="text-sm text-slate-500">Students will be able to select which company they are applying for.</p>
                                </div>
                                <Button variant="outline" size="sm" onClick={addCompany}><Plus className="w-4 h-4 mr-1"/> Add</Button>
                            </div>
                            <div className="space-y-4">
                                {companies.map((c, i) => (
                                    <div key={c.id} className="flex gap-4 items-start p-4 bg-slate-50 rounded-xl border border-slate-100">
                                        <div className="flex-1 space-y-3">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="text-xs font-semibold text-slate-500 mb-1 block">Company Name</label>
                                                    <Input value={c.name} onChange={(e) => updateCompany(c.id, 'name', e.target.value)} placeholder="e.g. Google" />
                                                </div>
                                                <div>
                                                    <label className="text-xs font-semibold text-slate-500 mb-1 block">Roles Available</label>
                                                    <Input value={c.roles} onChange={(e) => updateCompany(c.id, 'roles', e.target.value)} placeholder="e.g. SDE, Data Analyst" />
                                                </div>
                                            </div>
                                        </div>
                                        <button onClick={() => removeCompany(c.id)} className="mt-6 p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Custom Form Fields */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h2 className="text-lg font-bold text-slate-800">Registration Form Builder</h2>
                                    <p className="text-sm text-slate-500">Customize the fields students must fill out</p>
                                </div>
                                <Button variant="outline" size="sm" onClick={addField}><Plus className="w-4 h-4 mr-1"/> Add Field</Button>
                            </div>
                            <div className="space-y-3">
                                {fields.map((f, i) => (
                                    <div key={f.id} className={`flex items-center gap-3 p-3 rounded-lg border ${f.builtin ? 'bg-slate-100 border-slate-200 opacity-70' : 'bg-white border-slate-200 shadow-sm'}`}>
                                        <GripVertical className="w-5 h-5 text-slate-400 cursor-move" />
                                        <div className="flex-1 grid grid-cols-3 gap-3">
                                            <Input value={f.label} disabled={f.builtin} onChange={(e) => updateField(f.id, 'label', e.target.value)} placeholder="Field Label" />
                                            <select 
                                                value={f.type} 
                                                disabled={f.builtin}
                                                onChange={(e) => updateField(f.id, 'type', e.target.value)} 
                                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                                            >
                                                <option value="text">Short Text</option>
                                                <option value="email">Email</option>
                                                <option value="tel">Phone</option>
                                                <option value="file">File Upload</option>
                                            </select>
                                            <div className="flex items-center gap-2 px-2">
                                                <input type="checkbox" id={`req-${f.id}`} checked={f.required} disabled={f.builtin} onChange={(e) => updateField(f.id, 'required', e.target.checked)} />
                                                <label htmlFor={`req-${f.id}`} className="text-sm font-medium">Required</label>
                                            </div>
                                        </div>
                                        {!f.builtin && (
                                            <button onClick={() => removeField(f.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>

                    {/* Right Column: Branding */}
                    <div className="space-y-6">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 sticky top-6">
                            <h2 className="text-lg font-bold text-slate-800 mb-6">Page Branding</h2>
                            
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-semibold text-slate-700 mb-1 block">Page Title</label>
                                    <Input value={branding.title} onChange={(e) => setBranding({...branding, title: e.target.value})} placeholder="e.g. Mega Job Mela 2026" />
                                </div>
                                
                                <div>
                                    <label className="text-sm font-semibold text-slate-700 mb-1 block">Banner Image URL</label>
                                    <Input value={branding.bannerUrl} onChange={(e) => setBranding({...branding, bannerUrl: e.target.value})} placeholder="https://..." />
                                </div>
                                
                                <div>
                                    <label className="text-sm font-semibold text-slate-700 mb-1 block">Primary Theme Color</label>
                                    <div className="flex gap-2">
                                        <input 
                                            type="color" 
                                            value={branding.primaryColor} 
                                            onChange={(e) => setBranding({...branding, primaryColor: e.target.value})}
                                            className="h-10 w-14 p-1 rounded border border-slate-200"
                                        />
                                        <Input value={branding.primaryColor} onChange={(e) => setBranding({...branding, primaryColor: e.target.value})} />
                                    </div>
                                </div>

                                <div className="pt-4 mt-4 border-t border-slate-100">
                                    <div className="text-sm font-medium text-slate-500 mb-3">Live Preview</div>
                                    <div className="w-full h-32 rounded-lg border-2 border-dashed flex flex-col items-center justify-center overflow-hidden relative" style={{ borderColor: branding.primaryColor }}>
                                        {branding.bannerUrl ? (
                                            <img src={branding.bannerUrl} className="absolute inset-0 w-full h-full object-cover opacity-50" alt="Preview"/>
                                        ) : null}
                                        <div className="relative z-10 p-2 text-center" style={{ color: branding.primaryColor }}>
                                            <span className="font-bold block">{branding.title}</span>
                                            <span className="text-xs">Preview Area</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Share QR Modal */}
            {showShare && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative">
                        <button onClick={() => setShowShare(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
                            ✕
                        </button>
                        <div className="text-center mb-6">
                            <h3 className="text-xl font-bold text-slate-900">Share Job Mela</h3>
                            <p className="text-slate-500 text-sm mt-1">Scan to open the registration page directly.</p>
                        </div>
                        
                        <div className="flex justify-center mb-6 p-4 bg-slate-50 rounded-xl border border-slate-100">
                            <QRCodeSVG value={publicUrl} size={200} level="H" includeMargin />
                        </div>
                        
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Registration Link</label>
                            <div className="flex gap-2">
                                <Input readOnly value={publicUrl} className="bg-slate-50" />
                                <Button variant="outline" onClick={() => { navigator.clipboard.writeText(publicUrl); toast.success("Link copied!"); }}>Copy</Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
