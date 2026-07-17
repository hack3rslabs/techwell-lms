"use client";

import { useState, useEffect } from 'react';
import { Building2, Calendar, MapPin, Briefcase, Check, X, UploadCloud, Plus } from "lucide-react"

export default function InstituteCampusDrives() {
    const [drives, setDrives] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'INVITATIONS' | 'HOSTED' | 'NEW'>('INVITATIONS');

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        skills: '',
        jobRole: 'Multiple Roles',
        salary: 'Varies',
        hiringMode: 'ON_CAMPUS',
        targetYear: '',
        departments: '',
        location: '',
        scheduledDate: ''
    });

    async function fetchDrives() {
        setLoading(true);
        try {
            const res = await fetch('/api/campus-drives/institute', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            const data = await res.json();
            if (res.ok) setDrives(data);
        } catch (error) {
            console.error('Error fetching drives');
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchDrives();
    }, []);

    const handleAccept = async (driveId: string) => {
        try {
            await fetch(`/api/campus-drives/${driveId}/status`, {
                method: 'PATCH',
                headers: { 
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json' 
                },
                body: JSON.stringify({ status: 'ACCEPTED' })
            });
            alert('Invitation Accepted! You can now manage eligible students.');
            fetchDrives();
        } catch (error) {
            console.error(error);
        }
    };

    const handleReject = async (driveId: string) => {
        try {
            await fetch(`/api/campus-drives/${driveId}/status`, {
                method: 'PATCH',
                headers: { 
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json' 
                },
                body: JSON.stringify({ status: 'REJECTED' })
            });
            alert('Invitation Rejected.');
            fetchDrives();
        } catch (error) {
            console.error(error);
        }
    };

    const handleCreateHostedDrive = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/campus-drives/request', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(formData)
            });
            if (res.ok) {
                alert('Hosted Campus Drive created successfully');
                setActiveTab('HOSTED');
                fetchDrives();
            } else {
                const data = await res.json();
                alert(data.error || 'Failed to create drive');
            }
        } catch (error) {
            console.error('Error submitting drive:', error);
        }
    };

    const invitations = drives.filter(d => d.hostType === 'TECHWELL' || !d.hostType);
    const hostedDrives = drives.filter(d => d.hostType === 'INSTITUTE');

    return (
        <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
            <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl text-slate-800 font-bold">Campus Drives & Job Melas</h1>
                    <p className="text-slate-500 mt-1">Manage employer invitations or host your own placement events.</p>
                </div>
                <div className="flex bg-slate-100 p-1 rounded-lg">
                    <button 
                        onClick={() => setActiveTab('INVITATIONS')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'INVITATIONS' ? 'bg-white shadow text-indigo-600' : 'text-slate-600 hover:text-slate-900'}`}
                    >
                        Employer Invitations
                    </button>
                    <button 
                        onClick={() => setActiveTab('HOSTED')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'HOSTED' ? 'bg-white shadow text-indigo-600' : 'text-slate-600 hover:text-slate-900'}`}
                    >
                        Hosted Events
                    </button>
                    <button 
                        onClick={() => setActiveTab('NEW')}
                        className={`px-4 py-2 rounded-md text-sm font-medium flex items-center transition-colors ${activeTab === 'NEW' ? 'bg-indigo-600 text-white shadow' : 'text-slate-600 hover:text-slate-900'}`}
                    >
                        <Plus className="w-4 h-4 mr-1" /> Host New Event
                    </button>
                </div>
            </div>

            {activeTab === 'NEW' && (
                <div className="bg-white shadow-sm border border-slate-200 p-6 rounded-xl max-w-3xl">
                    <h2 className="text-xl font-bold text-slate-800 mb-6">Host a Job Mela / Campus Drive</h2>
                    <form onSubmit={handleCreateHostedDrive} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Event Title</label>
                                <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="mt-1 block w-full p-2 border border-slate-300 rounded-lg shadow-sm" placeholder="e.g. Mega Tech Job Mela 2024" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Expected Job Roles</label>
                                <input required type="text" value={formData.jobRole} onChange={e => setFormData({...formData, jobRole: e.target.value})} className="mt-1 block w-full p-2 border border-slate-300 rounded-lg shadow-sm" placeholder="e.g. SDE, QA, Analyst" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Target Passout Year(s)</label>
                                <input required type="text" value={formData.targetYear} onChange={e => setFormData({...formData, targetYear: e.target.value})} className="mt-1 block w-full p-2 border border-slate-300 rounded-lg shadow-sm" placeholder="e.g. 2024, 2025" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Hiring Mode</label>
                                <select value={formData.hiringMode} onChange={e => setFormData({...formData, hiringMode: e.target.value})} className="mt-1 block w-full p-2 border border-slate-300 rounded-lg shadow-sm">
                                    <option value="ON_CAMPUS">On Campus</option>
                                    <option value="VIRTUAL">Virtual</option>
                                    <option value="POOL_CAMPUS">Pool Campus</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Event Date</label>
                                <input type="date" value={formData.scheduledDate} onChange={e => setFormData({...formData, scheduledDate: e.target.value})} className="mt-1 block w-full p-2 border border-slate-300 rounded-lg shadow-sm" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Target Skills</label>
                                <input required type="text" value={formData.skills} onChange={e => setFormData({...formData, skills: e.target.value})} className="mt-1 block w-full p-2 border border-slate-300 rounded-lg shadow-sm" placeholder="e.g. Java, Python, React" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Event Description</label>
                            <textarea required rows={4} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="mt-1 block w-full p-2 border border-slate-300 rounded-lg shadow-sm"></textarea>
                        </div>
                        <div className="pt-4 flex justify-end">
                            <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg font-semibold shadow-sm transition-colors">
                                Create Hosted Event
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {activeTab !== 'NEW' && (
                loading ? (
                    <div className="p-8 text-center text-slate-500">Loading...</div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {(activeTab === 'INVITATIONS' ? invitations : hostedDrives).length === 0 ? (
                            <div className="col-span-full p-12 text-center bg-white rounded-xl border border-slate-200 border-dashed">
                                <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-slate-900">No {activeTab === 'INVITATIONS' ? 'Invitations' : 'Hosted Events'}</h3>
                                <p className="text-slate-500 mt-1">
                                    {activeTab === 'INVITATIONS' 
                                        ? "You haven't received any campus drive invitations from employers yet." 
                                        : "You haven't hosted any job melas yet."}
                                </p>
                            </div>
                        ) : (
                            (activeTab === 'INVITATIONS' ? invitations : hostedDrives).map(drive => (
                                <div key={drive.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col hover:border-indigo-300 transition-colors">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                                                <Building2 className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <h2 className="text-lg font-bold text-slate-800 line-clamp-1">{drive.title}</h2>
                                                <div className="text-sm font-medium text-indigo-600">
                                                    {drive.hostType === 'INSTITUTE' ? 'Hosted by your Institute' : (drive.employer?.companyName || drive.employer?.name || 'Multiple Companies')}
                                                </div>
                                            </div>
                                        </div>
                                        <span className={`text-[10px] uppercase font-bold px-3 py-1 rounded-full whitespace-nowrap ${
                                            drive.instituteLinkStatus === 'ACCEPTED' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' :
                                            drive.instituteLinkStatus === 'REJECTED' ? 'bg-rose-100 text-rose-700 border border-rose-200' :
                                            'bg-amber-100 text-amber-700 border border-amber-200'
                                        }`}>
                                            {drive.instituteLinkStatus || 'PENDING'}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 mb-5 bg-slate-50/80 p-3 rounded-lg border border-slate-100">
                                        <div className="flex items-center gap-2 text-sm text-slate-700">
                                            <Briefcase className="w-4 h-4 text-slate-400" />
                                            <span className="font-medium truncate">{drive.jobRole}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-slate-700">
                                            <Calendar className="w-4 h-4 text-slate-400" />
                                            <span className="font-medium">{drive.scheduledDate ? new Date(drive.scheduledDate).toLocaleDateString() : 'TBD'}</span>
                                        </div>
                                    </div>

                                    <div className="text-sm text-slate-600 mb-6 line-clamp-2">
                                        {drive.description}
                                    </div>

                                    <div className="mt-auto pt-4 border-t border-slate-100 flex gap-3">
                                        {drive.hostType === 'INSTITUTE' ? (
                                            <div className="w-full flex gap-3">
                                                <button onClick={() => window.location.href = `/institute/campus-drives/${drive.id}/builder`} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg font-medium text-sm transition-colors shadow-sm">
                                                    Manage Job Mela
                                                </button>
                                            </div>
                                        ) : drive.instituteLinkStatus === 'ACCEPTED' ? (
                                            <div className="w-full flex gap-3">
                                                <button onClick={() => alert('Add students feature')} className="flex-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 py-2 rounded-lg font-medium text-sm transition-colors border border-indigo-200">
                                                    Manage Students
                                                </button>
                                            </div>
                                        ) : drive.instituteLinkStatus === 'REJECTED' ? (
                                            <div className="w-full text-center text-sm text-slate-500 py-2">You declined this drive.</div>
                                        ) : (
                                            <>
                                                <button onClick={() => handleAccept(drive.id)} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-lg font-medium text-sm flex justify-center items-center shadow-sm transition-colors">
                                                    <Check className="w-4 h-4 mr-1" /> Accept Invite
                                                </button>
                                                <button onClick={() => handleReject(drive.id)} className="flex-1 bg-white hover:bg-slate-50 text-slate-700 py-2 rounded-lg font-medium text-sm border border-slate-300 transition-colors">
                                                    Decline
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )
            )}
        </div>
    );
}
