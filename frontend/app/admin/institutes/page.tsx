"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';

type Institute = {
    id: string;
    name: string;
    type: string;
    status: string;
    contactPerson: string;
    email: string;
    phone: string;
    city: string;
    createdAt: string;
};

export default function AdminInstitutes() {
    const { user } = useAuth();
    const [institutes, setInstitutes] = useState<Institute[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('ALL');

    useEffect(() => {
        if (user && user.role === 'SUPER_ADMIN') {
            fetchInstitutes();
        }
    }, [user, filter]);

    const fetchInstitutes = async () => {
        try {
            const statusQuery = filter !== 'ALL' ? `?status=${filter}` : '';
            const res = await fetch(`/api/institutes${statusQuery}`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            const data = await res.json();
            if (res.ok) setInstitutes(data);
        } catch (error) {
            console.error('Error fetching institutes:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (id: string, newStatus: string) => {
        if (!confirm(`Are you sure you want to mark this institute as ${newStatus}?`)) return;
        
        try {
            const res = await fetch(`/api/institutes/${id}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ status: newStatus })
            });

            if (res.ok) {
                fetchInstitutes();
            } else {
                alert('Failed to update status');
            }
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    if (loading) return <div className="p-8">Loading institutes...</div>;

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Institute Management</h1>
                <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2 border"
                >
                    <option value="ALL">All Institutes</option>
                    <option value="PENDING">Pending</option>
                    <option value="APPROVED">Approved</option>
                    <option value="REJECTED">Rejected</option>
                </select>
            </div>

            <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200">
                    {institutes.length === 0 ? (
                        <li className="p-4 text-center text-gray-500">No institutes found.</li>
                    ) : (
                        institutes.map((inst) => (
                            <li key={inst.id} className="p-4 flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-medium text-indigo-600">{inst.name}</h3>
                                    <div className="mt-1 flex items-center text-sm text-gray-500 space-x-4">
                                        <span>Type: {inst.type.replace('_', ' ')}</span>
                                        <span>Contact: {inst.contactPerson} ({inst.email})</span>
                                        <span>Location: {inst.city || 'N/A'}</span>
                                        <span>Joined: {new Date(inst.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <div className="mt-2">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                            ${inst.status === 'APPROVED' ? 'bg-green-100 text-green-800' : 
                                              inst.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                                            {inst.status}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex space-x-2">
                                    {inst.status === 'PENDING' && (
                                        <>
                                            <button onClick={() => handleStatusUpdate(inst.id, 'APPROVED')} className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm">Approve</button>
                                            <button onClick={() => handleStatusUpdate(inst.id, 'REJECTED')} className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm">Reject</button>
                                        </>
                                    )}
                                    {inst.status === 'APPROVED' && (
                                        <button onClick={() => handleStatusUpdate(inst.id, 'REJECTED')} className="bg-red-100 text-red-700 hover:bg-red-200 px-3 py-1 rounded text-sm border border-red-300">Suspend</button>
                                    )}
                                    {inst.status === 'REJECTED' && (
                                        <button onClick={() => handleStatusUpdate(inst.id, 'APPROVED')} className="bg-green-100 text-green-700 hover:bg-green-200 px-3 py-1 rounded text-sm border border-green-300">Restore</button>
                                    )}
                                </div>
                            </li>
                        ))
                    )}
                </ul>
            </div>
        </div>
    );
}
