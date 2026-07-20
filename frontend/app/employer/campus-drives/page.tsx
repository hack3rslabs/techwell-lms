"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';

export default function EmployerCampusDrives() {
    const { user } = useAuth();
    const [drives, setDrives] = useState<any[]>([]);
    const [institutes, setInstitutes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    
    const [formData, setFormData] = useState({
        instituteIds: [] as string[],
        title: '',
        description: '',
        skills: '',
        jobRole: '',
        salary: '',
        openings: '',
        hiringMode: 'VIRTUAL',
        targetYear: '',
        departments: '',
        location: '',
        scheduledDate: ''
    });

    async function fetchDrives() {
        try {
            const res = await fetch('/api/campus-drives/employer', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            if (res.ok) setDrives(await res.json());
        } catch (error) {
            console.error('Error fetching drives:', error);
        } finally {
            setLoading(false);
        }
    }

    async function fetchInstitutes() {
        try {
            const res = await fetch('/api/institutes?status=APPROVED', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            if (res.ok) setInstitutes(await res.json());
        } catch (error) {
            console.error('Error fetching institutes:', error);
        }
    }



    useEffect(() => {
        if (user && user.role === 'EMPLOYER') {
            fetchDrives();
            fetchInstitutes();
        }
    }, [user]);


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            // Validate before sending
            if (formData.instituteIds.length === 0) {
                alert('Please select at least one institute');
                return;
            }

            const res = await fetch('/api/campus-drives/request', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(formData)
            });
            if (res.ok) {
                alert('Campus drive requested successfully');
                setShowForm(false);
                fetchDrives();
            } else {
                const data = await res.json();
                alert(data.error || 'Failed to request drive');
            }
        } catch (error) {
            console.error('Error submitting drive:', error);
        }
    };

    if (loading) return <div className="p-8">Loading...</div>;

    return (
        <div className="p-8 space-y-6">
            <div className="mb-10 relative bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-800 rounded-3xl p-8 md:p-12 text-white shadow-2xl overflow-hidden border border-indigo-500/30">
                <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
                <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-teal-500 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>
                
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-extrabold mb-2 tracking-tight text-white drop-shadow-md">
                            Campus <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-indigo-300">Drives</span>
                        </h1>
                        <p className="text-indigo-100/80 text-lg max-w-xl leading-relaxed">
                            Request and manage recruitment drives with top institutions. Source the best early-career talent efficiently.
                        </p>
                    </div>
                    <div className="shrink-0">
                        <button 
                            onClick={() => setShowForm(!showForm)}
                            className="bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg transition-transform hover:scale-105"
                        >
                            {showForm ? 'Cancel Request' : 'Request New Drive'}
                        </button>
                    </div>
                </div>
            </div>

            {showForm && (
                <div className="bg-white shadow p-6 rounded-lg">
                    <h2 className="text-lg font-medium mb-4">Request a Campus Drive</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium mb-2">Select Institutes <span className="text-red-500">*</span></label>
                                <div className="max-h-48 overflow-y-auto border rounded-md p-3 bg-slate-50 space-y-2">
                                    {institutes.length === 0 ? <p className="text-sm text-slate-500">No approved institutes found.</p> : null}
                                    {institutes.map(inst => (
                                        <label key={inst.id} className="flex items-center space-x-3 cursor-pointer p-2 hover:bg-slate-200 rounded transition-colors">
                                            <input 
                                                type="checkbox" 
                                                className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                                checked={formData.instituteIds.includes(inst.id)}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setFormData(prev => ({ ...prev, instituteIds: [...prev.instituteIds, inst.id] }))
                                                    } else {
                                                        setFormData(prev => ({ ...prev, instituteIds: prev.instituteIds.filter(id => id !== inst.id) }))
                                                    }
                                                }}
                                            />
                                            <span className="text-sm font-medium text-slate-700">{inst.name} <span className="text-slate-500 font-normal">({inst.city || 'N/A'})</span></span>
                                        </label>
                                    ))}
                                </div>
                                {formData.instituteIds.length === 0 && <p className="text-xs text-red-500 mt-1">Please select at least one institute.</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium">Drive Title</label>
                                <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="mt-1 block w-full p-2 border rounded-md" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium">Job Role</label>
                                <input required type="text" value={formData.jobRole} onChange={e => setFormData({...formData, jobRole: e.target.value})} className="mt-1 block w-full p-2 border rounded-md" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium">Target Year(s) (e.g. 2024, 2025)</label>
                                <input required type="text" value={formData.targetYear} onChange={e => setFormData({...formData, targetYear: e.target.value})} className="mt-1 block w-full p-2 border rounded-md" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium">Salary Package (LPA)</label>
                                <input type="text" value={formData.salary} onChange={e => setFormData({...formData, salary: e.target.value})} className="mt-1 block w-full p-2 border rounded-md" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium">Number of Openings</label>
                                <input type="number" value={formData.openings} onChange={e => setFormData({...formData, openings: e.target.value})} className="mt-1 block w-full p-2 border rounded-md" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium">Hiring Mode</label>
                                <select value={formData.hiringMode} onChange={e => setFormData({...formData, hiringMode: e.target.value})} className="mt-1 block w-full p-2 border rounded-md">
                                    <option value="VIRTUAL">Virtual</option>
                                    <option value="ON_CAMPUS">On Campus</option>
                                    <option value="POOL_CAMPUS">Pool Campus</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium">Preferred Date (Optional)</label>
                                <input type="date" value={formData.scheduledDate} onChange={e => setFormData({...formData, scheduledDate: e.target.value})} className="mt-1 block w-full p-2 border rounded-md" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Required Skills</label>
                            <input required type="text" value={formData.skills} onChange={e => setFormData({...formData, skills: e.target.value})} className="mt-1 block w-full p-2 border rounded-md" placeholder="e.g. React, Node.js, Python" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Job Description</label>
                            <textarea required rows={4} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="mt-1 block w-full p-2 border rounded-md"></textarea>
                        </div>
                        <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">Submit Request</button>
                    </form>
                </div>
            )}

            <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200">
                    {drives.length === 0 ? (
                        <li className="p-4 text-center text-gray-500">No campus drives requested yet.</li>
                    ) : (
                        drives.map(drive => (
                            <li key={drive.id} className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-lg font-medium text-indigo-600">{drive.title}</h3>
                                        <p className="text-sm text-gray-500">
                                            Institutes: {drive.institutes?.length > 0 
                                                ? drive.institutes.map((link: any) => link.institute?.name).join(', ') 
                                                : 'None'}
                                        </p>
                                        <div className="mt-2 flex space-x-4 text-sm text-gray-500">
                                            <span>Role: {drive.jobRole}</span>
                                            <span>Target: {drive.targetYear}</span>
                                            <span>Mode: {drive.hiringMode}</span>
                                        </div>
                                    </div>
                                    <div>
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                            ${drive.status === 'APPROVED' ? 'bg-green-100 text-green-800' : 
                                              drive.status === 'REQUESTED' ? 'bg-yellow-100 text-yellow-800' : 
                                              drive.status === 'SCHEDULED' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'}`}>
                                            {drive.status}
                                        </span>
                                    </div>
                                </div>
                            </li>
                        ))
                    )}
                </ul>
            </div>
        </div>
    );
}
