'use client';

import React, { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Activity, GraduationCap, IndianRupee } from 'lucide-react';
import Link from 'next/link';

export default function FranchiseAdminDashboard() {
    const [stats, setStats] = useState({ 
        revenue: 0, 
        studentCount: 0, 
        coursesSold: 0, 
        certificatesIssued: 0 
    });
    const [ledgerBalance, setLedgerBalance] = useState(0);
    const [resources, setResources] = useState<any[]>([]);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                // Since user is logged in as FRANCHISE_ADMIN, the backend infers franchiseId from token
                const res = await api.get('/franchise/stats');
                if (res.data.success) {
                    setStats(res.data.data);
                }
                const resResources = await api.get('/franchise/resources');
                if (resResources.data.success) {
                    setResources(resResources.data.data);
                }
                // (Optional) fetch latest ledger balance here or show in detailed view
            } catch (err) {
                console.error('Failed to fetch stats', err);
            }
        };
        fetchStats();
    }, []);

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">My Franchise Portal</h1>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">My Revenue Share</CardTitle>
                        <IndianRupee className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">₹{stats.revenue.toLocaleString()}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Students Enrolled</CardTitle>
                        <Users className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.studentCount}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Courses Sold</CardTitle>
                        <Activity className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.coursesSold}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Certificates Issued</CardTitle>
                        <GraduationCap className="h-4 w-4 text-purple-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.certificatesIssued}</div>
                    </CardContent>
                </Card>
            </div>
            
            <div className="mt-8 grid gap-4 grid-cols-1 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Marketing Resource Hub</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {resources.length > 0 ? (
                            <ul className="space-y-2 text-sm text-blue-500">
                                {resources.map(r => (
                                    <li key={r.id}>
                                        <a href={r.fileUrl} target="_blank" rel="noreferrer" className="hover:underline">
                                            {r.title} ({r.resourceType})
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-gray-500 text-sm">No marketing resources available yet.</p>
                        )}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Revenue & Settlements (Ledger)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-gray-500 text-sm">Your cash collections and royalty settlement history will appear in the Ledger tab.</p>
                        <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded text-sm">View Ledger</button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
