"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Loader2, Mail, Phone, GraduationCap, ChevronRight, User as UserIcon } from "lucide-react"
import Image from 'next/image';

const PIPELINE_STAGES = ['APPLIED', 'SHORTLISTED', 'TECH_INTERVIEW', 'HR_INTERVIEW', 'OFFERED', 'JOINED', 'REJECTED'];

export default function EmployerPipeline() {
    const params = useParams();
    const [applications, setApplications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    async function fetchApplications() {
        try {
            const res = await fetch(`/api/campus-applications/drive/${params.id}`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            const data = await res.json();
            if (res.ok) setApplications(data);
        } catch (error) {
            console.error('Error fetching applications');
        } finally {
            setLoading(false);
        }
    }


    useEffect(() => {
        fetchApplications();
    }, [params.id]);
;

    const updateStatus = async (appId: string, newStatus: string) => {
        try {
            const res = await fetch(`/api/campus-applications/${appId}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ status: newStatus })
            });

            if (res.ok) {
                // Update local state for fast UI
                setApplications(prev => prev.map(app => app.id === appId ? { ...app, status: newStatus } : app));
            }
        } catch (error) {
            console.error('Failed to update status');
        }
    };

    const getAppsForStage = (stage: string) => {
        return applications.filter(app => app.status === stage);
    };

    return (
        <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto flex-1 flex flex-col">
            <div className="sm:flex sm:justify-between sm:items-center mb-8">
                            <div>
                                <h1 className="text-2xl md:text-3xl text-slate-800 font-bold">Applicant Tracking System</h1>
                                <p className="text-slate-500 mt-1">Manage and track candidates through your recruitment pipeline.</p>
                            </div>
                        </div>

                        {loading ? (
                            <div className="flex items-center justify-center flex-1">
                                <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                            </div>
                        ) : (
                            <div className="flex-1 overflow-x-auto pb-4">
                                <div className="flex gap-4 h-full min-w-max">
                                    {PIPELINE_STAGES.map(stage => {
                                        const stageApps = getAppsForStage(stage);
                                        return (
                                            <div key={stage} className="w-80 flex flex-col bg-slate-200/50 rounded-xl p-3">
                                                <div className="flex items-center justify-between mb-3 px-1">
                                                    <h3 className="font-semibold text-slate-700 text-sm">{stage.replace('_', ' ')}</h3>
                                                    <span className="bg-slate-300 text-slate-700 text-xs py-0.5 px-2 rounded-full font-medium">
                                                        {stageApps.length}
                                                    </span>
                                                </div>
                                                <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                                                    {stageApps.map(app => (
                                                        <div key={app.id} className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
                                                            <div className="flex items-start gap-3 mb-3">
                                                                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 shrink-0 overflow-hidden">
                                                                    {app.user.avatar ? (
                                                                        <Image src={app.user.avatar} alt="Avatar" width={40} height={40} />
                                                                    ) : (
                                                                        <UserIcon className="w-5 h-5" />
                                                                    )}
                                                                </div>
                                                                <div className="min-w-0 flex-1">
                                                                    <h4 className="font-semibold text-slate-800 truncate" title={app.user.name}>{app.user.name}</h4>
                                                                    <p className="text-xs text-slate-500 flex items-center gap-1 truncate" title={app.user.institute?.name || app.user.college}>
                                                                        <GraduationCap className="w-3 h-3" /> {app.user.institute?.name || app.user.college || 'Unknown College'}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            
                                                            <div className="space-y-1 mb-4">
                                                                <div className="text-xs text-slate-600 flex items-center gap-2">
                                                                    <Mail className="w-3 h-3 text-slate-400" /> <span className="truncate">{app.user.email}</span>
                                                                </div>
                                                                <div className="text-xs text-slate-600 flex items-center gap-2">
                                                                    <Phone className="w-3 h-3 text-slate-400" /> {app.user.phone || 'N/A'}
                                                                </div>
                                                            </div>

                                                            <div className="pt-3 border-t border-slate-100">
                                                                <select
                                                                    className="w-full text-xs border-slate-200 rounded p-1.5 focus:ring-indigo-500 focus:border-indigo-500 font-medium text-slate-700"
                                                                    value={app.status}
                                                                    onChange={(e) => updateStatus(app.id, e.target.value)}
                                                                >
                                                                    {PIPELINE_STAGES.map(s => (
                                                                        <option key={s} value={s}>Move to {s.replace('_', ' ')}</option>
                                                                    ))}
                                                                </select>
                                                            </div>
                                                        </div>
                                                    ))}
                                                    {stageApps.length === 0 && (
                                                        <div className="h-24 border-2 border-dashed border-slate-300 rounded-lg flex items-center justify-center text-xs text-slate-400">
                                                            No candidates
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        )}
        </div>
    );
}
