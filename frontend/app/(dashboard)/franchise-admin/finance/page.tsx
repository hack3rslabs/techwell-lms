'use client';

import React, { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { IndianRupee, ArrowUpRight, ArrowDownRight, Activity } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { Badge } from '@/components/ui/badge';

export default function FranchiseFinancePage() {
    const { user } = useAuth();
    const [stats, setStats] = useState({ revenue: 0, studentCount: 0, coursesSold: 0 });
    const [revenues, setRevenues] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (!user?.franchiseId) return;
            try {
                const resStats = await api.get('/franchise/stats');
                if (resStats.data.success) {
                    setStats(resStats.data.data);
                }
                
                const resRev = await api.get(`/franchise/${user.franchiseId}/revenue`);
                if (resRev.data.success) {
                    setRevenues(resRev.data.data);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [user?.franchiseId]);

    if (loading) return <div className="p-6">Loading finance dashboard...</div>;

    const totalCollected = revenues.reduce((sum, r) => sum + r.totalAmount, 0);
    const techwellShare = revenues.reduce((sum, r) => sum + r.techwellShare, 0);

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Finance & Ledger</h1>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">My Net Earnings</CardTitle>
                        <IndianRupee className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">₹{stats.revenue.toLocaleString()}</div>
                        <p className="text-xs text-gray-500 mt-1">Total revenue after royalties</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Gross Collections</CardTitle>
                        <Activity className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">₹{totalCollected.toLocaleString()}</div>
                        <p className="text-xs text-gray-500 mt-1">Total amount collected from students</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Royalties Paid (HQ)</CardTitle>
                        <ArrowUpRight className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-500">₹{techwellShare.toLocaleString()}</div>
                        <p className="text-xs text-gray-500 mt-1">Techwell's share of revenue</p>
                    </CardContent>
                </Card>
            </div>

            <div className="mt-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Transactions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {revenues.length > 0 ? (
                            <table className="w-full text-sm text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 dark:bg-gray-900 border-b">
                                        <th className="px-4 py-2 font-medium">Date</th>
                                        <th className="px-4 py-2 font-medium">Gross Amount</th>
                                        <th className="px-4 py-2 font-medium">My Share</th>
                                        <th className="px-4 py-2 font-medium">Techwell Share</th>
                                        <th className="px-4 py-2 font-medium">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {revenues.map((r: any) => (
                                        <tr key={r.id}>
                                            <td className="px-4 py-2">{new Date(r.createdAt).toLocaleDateString()}</td>
                                            <td className="px-4 py-2 font-semibold">₹{r.totalAmount.toLocaleString()}</td>
                                            <td className="px-4 py-2 text-green-600 font-medium">₹{r.franchiseShare.toLocaleString()}</td>
                                            <td className="px-4 py-2 text-red-500">₹{r.techwellShare.toLocaleString()}</td>
                                            <td className="px-4 py-2"><Badge variant={r.status === 'SETTLED' ? 'default' : 'secondary'}>{r.status}</Badge></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div className="text-center p-8 text-gray-500 border border-dashed rounded-md">
                                <IndianRupee className="mx-auto h-8 w-8 text-gray-300 mb-2" />
                                <p>No transactions found.</p>
                                <p className="text-sm">Revenue generated by your franchise will appear here.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
