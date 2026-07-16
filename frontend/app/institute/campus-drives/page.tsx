"use client";

import { useState, useEffect } from 'react';
import { Building2, Calendar, MapPin, Briefcase, Check, X, UploadCloud } from "lucide-react"

export default function InstituteCampusDrives() {
    const [drives, setDrives] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    async function fetchDrives() {
        try {
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
    }


    useEffect(() => {
        fetchDrives();
    }, []);
;

    const handleAccept = async (driveId: string) => {
        // In a real app, hit an endpoint to change CampusDriveInstitute status to ACCEPTED
        alert('Invitation Accepted! You can now upload eligible students.');
        setDrives(prev => prev.map(d => d.id === driveId ? { ...d, instituteStatus: 'ACCEPTED' } : d));
    };

    const handleReject = async (driveId: string) => {
        alert('Invitation Rejected.');
        setDrives(prev => prev.map(d => d.id === driveId ? { ...d, instituteStatus: 'REJECTED' } : d));
    };

    const handleBulkUpload = (driveId: string) => {
        alert('Feature coming soon: Bulk upload CSV of eligible students for this drive.');
    };

    return (
        <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
            <div className="mb-8">
                            <h1 className="text-2xl md:text-3xl text-slate-800 font-bold">Campus Drive Invitations</h1>
                            <p className="text-slate-500 mt-1">Review and manage invitations from employers to participate in their recruitment drives.</p>
                        </div>

                        {loading ? (
                            <div className="p-8 text-center text-slate-500">Loading invitations...</div>
                        ) : (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {drives.length === 0 ? (
                                    <div className="col-span-full p-8 text-center bg-white rounded-xl border border-slate-200">
                                        No invitations currently available.
                                    </div>
                                ) : (
                                    drives.map(drive => (
                                        <div key={drive.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                                                        <Building2 className="w-6 h-6" />
                                                    </div>
                                                    <div>
                                                        <h2 className="text-lg font-bold text-slate-800">{drive.title}</h2>
                                                        <div className="text-sm font-medium text-indigo-600">{drive.employer?.companyName || 'Multiple Companies'}</div>
                                                    </div>
                                                </div>
                                                <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                                                    drive.instituteStatus === 'ACCEPTED' ? 'bg-green-100 text-green-700' :
                                                    drive.instituteStatus === 'REJECTED' ? 'bg-red-100 text-red-700' :
                                                    'bg-amber-100 text-amber-700'
                                                }`}>
                                                    {drive.instituteStatus || 'PENDING INVITE'}
                                                </span>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4 mb-6 bg-slate-50 p-4 rounded-lg">
                                                <div className="flex items-center gap-2 text-sm text-slate-700">
                                                    <Briefcase className="w-4 h-4 text-slate-400" />
                                                    <span className="font-medium">{drive.jobRole}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-slate-700">
                                                    <Calendar className="w-4 h-4 text-slate-400" />
                                                    <span className="font-medium">{drive.scheduledDate ? new Date(drive.scheduledDate).toLocaleDateString() : 'TBD'}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-slate-700">
                                                    <MapPin className="w-4 h-4 text-slate-400" />
                                                    <span className="font-medium">{drive.location}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-slate-700">
                                                    <span className="font-bold text-slate-400">CTC:</span>
                                                    <span className="font-medium">{drive.salary || 'Not disclosed'}</span>
                                                </div>
                                            </div>

                                            <div className="text-sm text-slate-600 mb-6 line-clamp-3">
                                                {drive.description}
                                            </div>

                                            <div className="mt-auto pt-4 border-t border-slate-100 flex gap-3">
                                                {drive.instituteStatus === 'ACCEPTED' ? (
                                                    <div className="w-full flex gap-3">
                                                        <button onClick={() => handleBulkUpload(drive.id)} className="flex-1 btn-sm bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg font-medium flex justify-center items-center">
                                                            <UploadCloud className="w-4 h-4 mr-2" /> Bulk Upload
                                                        </button>
                                                        <button onClick={() => window.location.href = `/institute/campus-drives/${drive.id}/builder`} className="flex-1 btn-sm bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg font-medium flex justify-center items-center">
                                                            Build Job Mela
                                                        </button>
                                                    </div>
                                                ) : drive.instituteStatus === 'REJECTED' ? (
                                                    <div className="w-full text-center text-sm text-slate-500 py-2">You declined this drive.</div>
                                                ) : (
                                                    <>
                                                        <button onClick={() => handleAccept(drive.id)} className="flex-1 btn-sm bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-medium flex justify-center items-center">
                                                            <Check className="w-4 h-4 mr-1" /> Accept Invite
                                                        </button>
                                                        <button onClick={() => handleReject(drive.id)} className="flex-1 btn-sm bg-slate-200 hover:bg-slate-300 text-slate-700 py-2 rounded-lg font-medium flex justify-center items-center">
                                                            <X className="w-4 h-4 mr-1" /> Decline
                                                        </button>
                                                    </>
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
