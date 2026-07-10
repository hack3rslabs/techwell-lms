"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';

export default function ConsultancyRevenueDashboard() {
    const { user } = useAuth();
    const [analytics, setAnalytics] = useState<any>(null);
    const [records, setRecords] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    async function fetchData() {
        try {
            const headers = { 'Authorization': `Bearer ${localStorage.getItem('token')}` };
            
            const [analyticsRes, recordsRes] = await Promise.all([
                fetch(`${process.env.NEXT_PUBLIC_API_URL}/consultancy-analytics/analytics`, { headers }),
                fetch(`${process.env.NEXT_PUBLIC_API_URL}/consultancy-analytics/coordination`, { headers })
            ]);

            if (analyticsRes.ok) setAnalytics(await analyticsRes.json());
            if (recordsRes.ok) setRecords(await recordsRes.json());
        } catch (error) {
            console.error('Error fetching consultancy data:', error);
        } finally {
            setLoading(false);
        }
    }


    useEffect(() => {
        if (user && user.role === 'SUPER_ADMIN') {
            fetchData();
        }
    }, [user]);
;

    if (loading) return <div className="p-8">Loading analytics...</div>;

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Consultancy & Placement Analytics</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-lg shadow p-6 border-t-4 border-indigo-500">
                    <p className="text-sm text-gray-500 font-medium uppercase">Total Revenue</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">${analytics?.totalRevenue?.toLocaleString() || 0}</p>
                </div>
                <div className="bg-white rounded-lg shadow p-6 border-t-4 border-green-500">
                    <p className="text-sm text-gray-500 font-medium uppercase">Total Placed</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{analytics?.totalStudentsPlaced || 0}</p>
                </div>
                <div className="bg-white rounded-lg shadow p-6 border-t-4 border-blue-500">
                    <p className="text-sm text-gray-500 font-medium uppercase">Total Drives</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{analytics?.totalDrives || 0}</p>
                </div>
                <div className="bg-white rounded-lg shadow p-6 border-t-4 border-yellow-500">
                    <p className="text-sm text-gray-500 font-medium uppercase">Pending Drives</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{analytics?.pendingDrives || 0}</p>
                </div>
            </div>

            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Consultancy Coordinations</h3>
                </div>
                <div className="border-t border-gray-200">
                    {records.length === 0 ? (
                        <p className="p-4 text-gray-500 text-center">No coordination records found.</p>
                    ) : (
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employer</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Institute</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {records.map((record) => (
                                    <tr key={record.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(record.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {record.employer?.name || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {record.institute?.name || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-green-600">
                                            ${record.revenue.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {record.notes || '-'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}
