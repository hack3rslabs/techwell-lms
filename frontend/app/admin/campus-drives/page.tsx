"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Building2, Users, MapPin, Calendar, ExternalLink } from "lucide-react"
import Link from 'next/link';

type CampusDrive = {
    id: string;
    title: string;
    isOffCampus: boolean;
    jobRole: string;
    location: string;
    scheduledDate: string;
    status: string;
    employer: { companyName: string };
    institutes: any[];
    students: any[];
};

export default function AdminCampusDrives() {
    const { user } = useAuth();
    const [drives, setDrives] = useState<CampusDrive[]>([]);
    const [loading, setLoading] = useState(true);

    async function fetchDrives() {
        try {
            const res = await fetch('/api/campus-drives', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            const data = await res.json();
            if (res.ok) setDrives(data);
        } catch (error) {
            console.error('Error fetching drives:', error);
        } finally {
            setLoading(false);
        }
    }


    useEffect(() => {
        fetchDrives();
    }, []);
;

    return (
        <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
            <div className="mb-10 relative bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-8 md:p-10 text-white shadow-xl overflow-hidden border border-slate-700">
                <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-indigo-500/30 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
                <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-blue-500/30 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>
                
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-extrabold mb-2 tracking-tight text-white drop-shadow-md">
                            Master <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">Campus Drives</span>
                        </h1>
                        <p className="text-slate-300 text-lg max-w-xl leading-relaxed">
                            Orchestrate and manage all upcoming Job Melas, off-campus recruitment drives, and on-campus events across the platform.
                        </p>
                    </div>
                    <div className="shrink-0">
                        <Link href="/admin/campus-drives/create" className="btn bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg transition-transform hover:scale-105 flex items-center gap-2">
                            + Create Job Mela / Drive
                        </Link>
                    </div>
                </div>
            </div>

                        {loading ? (
                            <div className="p-8 text-center text-slate-500">Loading drives...</div>
                        ) : (
                            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                                {drives.length === 0 ? (
                                    <div className="col-span-full p-8 text-center bg-white rounded-lg border border-slate-200">
                                        No drives found. Click "Create Job Mela / Drive" to orchestrate an event.
                                    </div>
                                ) : (
                                    drives.map(drive => (
                                        <div key={drive.id} className="bg-white dark:bg-slate-800 shadow-lg rounded-sm border border-slate-200 dark:border-slate-700 flex flex-col">
                                            <div className="p-5 flex-1">
                                                <header className="flex justify-between items-start mb-2">
                                                    <div className="flex items-center space-x-2">
                                                        <div className="w-10 h-10 rounded-full flex items-center justify-center bg-indigo-100 text-indigo-500">
                                                            <Building2 className="w-5 h-5" />
                                                        </div>
                                                        <div>
                                                            <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">{drive.title}</h2>
                                                            <p className="text-xs text-slate-500">{drive.employer?.companyName || 'Techwell Admin'}</p>
                                                        </div>
                                                    </div>
                                                    <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${drive.isOffCampus ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                                        {drive.isOffCampus ? 'Job Mela (Public)' : 'On-Campus'}
                                                    </span>
                                                </header>
                                                
                                                <div className="mt-4 flex flex-col space-y-2 text-sm text-slate-600 dark:text-slate-400">
                                                    <div className="flex items-center gap-2"><MapPin className="w-4 h-4" /> {drive.location || 'Remote'}</div>
                                                    <div className="flex items-center gap-2"><Calendar className="w-4 h-4" /> {drive.scheduledDate ? new Date(drive.scheduledDate).toLocaleDateString() : 'TBD'}</div>
                                                    <div className="flex items-center gap-2"><Users className="w-4 h-4" /> {drive.students?.length || 0} Registered Candidates</div>
                                                </div>
                                            </div>
                                            <div className="border-t border-slate-200 dark:border-slate-700 p-4">
                                                <div className="flex gap-2">
                                                    {drive.isOffCampus && (
                                                        <a href={`/job-mela/${drive.id}`} target="_blank" className="flex-1 btn-sm border-slate-200 hover:border-slate-300 text-indigo-500 flex justify-center items-center py-2 border rounded text-sm font-medium">
                                                            <ExternalLink className="w-4 h-4 mr-2" />
                                                            Registration Link
                                                        </a>
                                                    )}
                                                    <button className="flex-1 btn-sm bg-slate-800 hover:bg-slate-700 text-white rounded text-sm py-2 font-medium">
                                                        Manage Pipeline
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
        </div>
    );
}
