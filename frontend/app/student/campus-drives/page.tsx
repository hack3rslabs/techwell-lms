"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Building2, MapPin, Calendar, Briefcase, CheckCircle2 } from "lucide-react"

export default function StudentCampusDrives() {
    const { user } = useAuth();
    const [drives, setDrives] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDrives();
    }, []);

    const fetchDrives = async () => {
        try {
            // For now, we fetch all drives. In a real app, backend would filter by student's institute or public drives.
            const res = await fetch('/api/campus-drives', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            const data = await res.json();
            if (res.ok) setDrives(data);
        } catch (error) {
            console.error('Error fetching drives');
        } finally {
            setLoading(false);
        }
    };

    const handleApply = async (driveId: string) => {
        if (!confirm('Are you sure you want to apply for this campus drive?')) return;
        
        try {
            const res = await fetch(`/api/campus-applications/drive/${driveId}/apply`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            
            if (res.ok) {
                alert('Applied successfully!');
                // Update UI state
                setDrives(prev => prev.map(d => d.id === driveId ? { ...d, hasApplied: true } : d));
            } else {
                const data = await res.json();
                alert(data.error || 'Failed to apply');
            }
        } catch (error) {
            console.error('Apply error');
        }
    };

    return (
        <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
            <div className="mb-10 relative bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-800 rounded-3xl p-8 md:p-12 text-white shadow-2xl overflow-hidden border border-indigo-500/30">
                <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
                <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-teal-500 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>
                
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex-1">
                        <div className="inline-flex items-center rounded-full border border-indigo-400/50 bg-indigo-500/20 px-3 py-1 text-xs font-semibold text-indigo-100 mb-6 backdrop-blur-md">
                            <span className="flex h-2 w-2 rounded-full bg-teal-400 mr-2 animate-pulse"></span>
                            Career Opportunities
                        </div>
                        <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight leading-tight text-white drop-shadow-md">
                            Campus <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-indigo-300">Placements & Melas</span>
                        </h1>
                        <p className="text-indigo-100/80 text-lg max-w-2xl leading-relaxed">
                            Discover exclusive recruitment drives and Mega Job Melas. Connect with top-tier employers, submit your applications, and launch your career journey with Techwell.
                        </p>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="p-8 text-center text-slate-500">Loading opportunities...</div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {drives.length === 0 ? (
                        <div className="col-span-full p-8 text-center bg-white rounded-xl border border-slate-200">
                            No upcoming drives found. Check back later!
                        </div>
                    ) : (
                        drives.map(drive => (
                            <div key={drive.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                                            <Building2 className="w-7 h-7" />
                                        </div>
                                        <div>
                                            <h2 className="text-lg font-bold text-slate-800">{drive.title}</h2>
                                            <div className="text-sm font-medium text-indigo-600">{drive.employer?.companyName || 'Multiple Companies'}</div>
                                        </div>
                                    </div>
                                    {drive.isOffCampus && (
                                        <span className="bg-amber-100 text-amber-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                                            Job Mela
                                        </span>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <div className="flex items-center gap-2 text-sm text-slate-600">
                                        <Briefcase className="w-4 h-4 text-slate-400" />
                                        <span className="truncate">{drive.jobRole}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-slate-600">
                                        <MapPin className="w-4 h-4 text-slate-400" />
                                        <span className="truncate">{drive.location}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-slate-600">
                                        <Calendar className="w-4 h-4 text-slate-400" />
                                        <span>{drive.scheduledDate ? new Date(drive.scheduledDate).toLocaleDateString() : 'TBD'}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-slate-600">
                                        <span className="font-semibold text-slate-700">CTC:</span>
                                        <span>{drive.salary || 'Not disclosed'}</span>
                                    </div>
                                </div>

                                <div className="text-sm text-slate-600 mb-6 line-clamp-2">
                                    {drive.description}
                                </div>

                                <div className="mt-auto pt-4 border-t border-slate-100 flex justify-between items-center">
                                    <div className="text-xs text-slate-500">
                                        Target Batch: <span className="font-semibold text-slate-700">{drive.targetYear || 'All'}</span>
                                    </div>
                                    
                                    {drive.hasApplied ? (
                                        <button disabled className="btn-sm bg-green-50 text-green-600 border border-green-200 cursor-not-allowed py-2 px-4 rounded-lg font-medium flex items-center">
                                            <CheckCircle2 className="w-4 h-4 mr-1.5" /> Applied
                                        </button>
                                    ) : (
                                        <button onClick={() => handleApply(drive.id)} className="btn-sm bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-6 rounded-lg font-medium transition-colors">
                                            Apply Now
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
