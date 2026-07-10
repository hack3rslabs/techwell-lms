"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';

type Employer = {
    id: string;
    userId: string;
    companyName: string;
    industry: string;
    status: string;
    contactName: string;
    contactEmail: string;
    contactPhone: string;
    createdAt: string;
};

export default function AdminCompanies() {
    const { user } = useAuth();
    const [employers, setEmployers] = useState<Employer[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('ALL');

    async function fetchEmployers() {
        setLoading(true);
        try {
            // In a real scenario, you'd fetch ALL or PENDING based on the filter.
            // Currently backend only has /pending, let's fetch pending if filter is PENDING, else we might need to fetch all employers.
            // Assuming we will just use the pending endpoint for approvals.
            if (filter === 'PENDING') {
                 const res = await fetch(`/api/employers/pending`, {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                });
                const data = await res.json();
                if (res.ok) setEmployers(data);
            } else {
                 // For ALL/APPROVED we need an endpoint, fallback to an empty array for now or a mock if it doesn't exist
                 setEmployers([]); // TODO: Add fetch all employers endpoint
            }
        } catch (error) {
            console.error('Error fetching employers:', error);
        } finally {
            setLoading(false);
        }
    }


    useEffect(() => {
        if (user && user.role === 'SUPER_ADMIN') {
            fetchEmployers();
        }
    }, [user, filter]);
;

    const handleStatusUpdate = async (id: string, newStatus: string) => {
        if (!confirm(`Are you sure you want to mark this company as ${newStatus}?`)) return;
        
        try {
            const res = await fetch(`/api/employers/${id}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ status: newStatus })
            });

            if (res.ok) {
                fetchEmployers();
            } else {
                alert('Failed to update status');
            }
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    return (
        <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
                        <div className="sm:flex sm:justify-between sm:items-center mb-8">
                            <div className="mb-4 sm:mb-0">
                                <h1 className="text-2xl md:text-3xl text-slate-800 dark:text-slate-100 font-bold">Companies (Employers) ✨</h1>
                            </div>
                            <select
                                value={filter}
                                onChange={(e) => setFilter(e.target.value)}
                                className="border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2 border bg-white"
                            >
                                <option value="ALL">All Companies (Coming Soon)</option>
                                <option value="PENDING">Pending Approvals</option>
                            </select>
                        </div>

                        <div className="bg-white dark:bg-slate-800 shadow-lg rounded-sm border border-slate-200 dark:border-slate-700">
                            {loading ? (
                                <div className="p-8 text-center">Loading companies...</div>
                            ) : (
                                <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {employers.length === 0 ? (
                                        <li className="p-8 text-center text-gray-500">No companies found for this filter. Select "Pending Approvals" to see requests.</li>
                                    ) : (
                                        employers.map((emp) => (
                                            <li key={emp.id} className="p-4 flex items-center justify-between">
                                                <div>
                                                    <h3 className="text-lg font-medium text-indigo-600 dark:text-indigo-400">{emp.companyName}</h3>
                                                    <div className="mt-1 flex flex-wrap items-center text-sm text-gray-500 dark:text-gray-400 gap-4">
                                                        <span>Industry: {emp.industry}</span>
                                                        <span>Contact: {emp.contactName} ({emp.contactEmail})</span>
                                                        <span>Joined: {new Date(emp.createdAt).toLocaleDateString()}</span>
                                                    </div>
                                                    <div className="mt-2">
                                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                                            ${emp.status === 'APPROVED' ? 'bg-green-100 text-green-800' : 
                                                              emp.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                                                            {emp.status}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex space-x-2">
                                                    {emp.status === 'PENDING' && (
                                                        <>
                                                            <button onClick={() => handleStatusUpdate(emp.id, 'APPROVED')} className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm">Approve</button>
                                                            <button onClick={() => handleStatusUpdate(emp.id, 'REJECTED')} className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm">Reject</button>
                                                        </>
                                                    )}
                                                </div>
                                            </li>
                                        ))
                                    )}
                                </ul>
                            )}
                        </div>
        </div>
    );
}
