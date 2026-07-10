"use client";

import { useState, useEffect } from 'react';
import { Users, GraduationCap, Briefcase, TrendingUp, CheckCircle, Clock } from 'lucide-react';

export default function InstitutePlacements() {
    const [drives, setDrives] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    async function fetchPlacements() {
        try {
            const res = await fetch('/api/campus-drives', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            const data = await res.json();
            if (res.ok) setDrives(data);
        } catch (error) {
            console.error('Error fetching placements');
        } finally {
            setLoading(false);
        }
    }


    useEffect(() => {
        fetchPlacements();
    }, []);
;

    // Calculate mock stats
    const totalDrives = drives.length;
    const totalOffers = drives.reduce((sum, d) => sum + (d.students?.filter((s: any) => s.status === 'OFFERED' || s.status === 'JOINED').length || 0), 0);
    const avgSalary = "4.5 LPA"; // Mocked
    const topSalary = "12.0 LPA"; // Mocked

    return (
        <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
            <div className="sm:flex sm:justify-between sm:items-center mb-8">
                <div>
                    <h1 className="text-2xl md:text-3xl text-slate-800 font-bold">Placement Tracker</h1>
                    <p className="text-slate-500 mt-1">Track your students' hiring progress across all campus drives.</p>
                </div>
            </div>

            {/* Top Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Total Drives</div>
                                        <div className="text-3xl font-bold text-slate-800">{loading ? '...' : totalDrives}</div>
                                    </div>
                                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-500">
                                        <Briefcase className="w-5 h-5" />
                                    </div>
                                </div>
                            </div>
                            
                            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Students Placed</div>
                                        <div className="text-3xl font-bold text-slate-800">24</div>
                                    </div>
                                    <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-500">
                                        <CheckCircle className="w-5 h-5" />
                                    </div>
                                </div>
                                <div className="mt-2 text-xs text-emerald-600 font-medium">+5 this week</div>
                            </div>

                            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">In Process</div>
                                        <div className="text-3xl font-bold text-slate-800">45</div>
                                    </div>
                                    <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-500">
                                        <Clock className="w-5 h-5" />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Avg CTC</div>
                                        <div className="text-3xl font-bold text-slate-800">4.5L</div>
                                    </div>
                                    <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-500">
                                        <TrendingUp className="w-5 h-5" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Drives List */}
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                            <div className="px-5 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                                <h2 className="font-semibold text-slate-800">Recent Campus Drives</h2>
                                <button className="text-sm font-medium text-indigo-500 hover:text-indigo-600">View All</button>
                            </div>
                            <div className="p-0">
                                {loading ? (
                                    <div className="p-6 text-center text-slate-500">Loading...</div>
                                ) : drives.length === 0 ? (
                                    <div className="p-6 text-center text-slate-500">No active drives found for your institute.</div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="border-b border-slate-200 text-xs uppercase text-slate-500 bg-white">
                                                    <th className="px-5 py-3 font-semibold">Drive Title & Role</th>
                                                    <th className="px-5 py-3 font-semibold">Company</th>
                                                    <th className="px-5 py-3 font-semibold">Location</th>
                                                    <th className="px-5 py-3 font-semibold text-right">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {drives.map((drive) => (
                                                    <tr key={drive.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                                                        <td className="px-5 py-4">
                                                            <div className="font-medium text-slate-800">{drive.title}</div>
                                                            <div className="text-xs text-slate-500">{drive.jobRole}</div>
                                                        </td>
                                                        <td className="px-5 py-4 text-sm text-slate-600">
                                                            {drive.employer?.companyName || 'Multiple MNCs'}
                                                        </td>
                                                        <td className="px-5 py-4 text-sm text-slate-600">
                                                            {drive.location || 'Remote'}
                                                        </td>
                                                        <td className="px-5 py-4 text-right">
                                                            <button className="text-indigo-600 text-sm font-medium hover:text-indigo-800">
                                                                View Pipeline
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>

        </div>
    );
}
