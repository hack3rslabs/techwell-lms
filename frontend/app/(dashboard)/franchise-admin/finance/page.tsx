'use client';

import React, { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    IndianRupee, ArrowUpRight, TrendingUp, TrendingDown, Activity,
    Download, RefreshCw, Loader2, Calendar, Info, BarChart3,
    CheckCircle2, Clock, AlertCircle
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';

interface RevenueRecord {
    id: string;
    totalAmount: number;
    franchiseShare: number;
    techwellShare: number;
    status: string;
    paymentMethod?: string;
    createdAt: string;
}

interface RoyaltySummary {
    totalRoyalty: number;
    pendingRoyalty: number;
    settledRoyalty: number;
}

export default function FranchiseFinancePage() {
    const { user } = useAuth();
    const [stats, setStats] = useState({ revenue: 0, studentCount: 0, coursesSold: 0 });
    const [revenues, setRevenues] = useState<RevenueRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState('ALL');

    const fetchData = async () => {
        if (!user?.franchiseId) return;
        setLoading(true);
        try {
            const [statsRes, revRes] = await Promise.allSettled([
                api.get('/franchise/stats'),
                api.get(`/franchise/${user.franchiseId}/revenue`),
            ]);

            if (statsRes.status === 'fulfilled' && statsRes.value.data.success) {
                setStats(statsRes.value.data.data);
            }
            if (revRes.status === 'fulfilled' && revRes.value.data.success) {
                setRevenues(revRes.value.data.data || []);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [user?.franchiseId]);

    const filteredRevenues = revenues.filter((r) => {
        if (period === 'ALL') return true;
        const now = new Date();
        const d = new Date(r.createdAt);
        if (period === 'THIS_MONTH') return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        if (period === 'LAST_30') {
            const diff = (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24);
            return diff <= 30;
        }
        if (period === 'LAST_90') {
            const diff = (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24);
            return diff <= 90;
        }
        return true;
    });

    const totalCollected = filteredRevenues.reduce((s, r) => s + r.totalAmount, 0);
    const myShare = filteredRevenues.reduce((s, r) => s + r.franchiseShare, 0);
    const techwellShare = filteredRevenues.reduce((s, r) => s + r.techwellShare, 0);
    const pendingSettlement = filteredRevenues.filter(r => r.status !== 'SETTLED').reduce((s, r) => s + r.techwellShare, 0);
    const royaltyRate = totalCollected > 0 ? ((techwellShare / totalCollected) * 100).toFixed(1) : '0.0';

    const handleExportCSV = () => {
        const headers = ['Date', 'Gross Amount', 'My Share', 'Techwell Share', 'Method', 'Status'];
        const rows = filteredRevenues.map(r => [
            new Date(r.createdAt).toLocaleDateString(),
            r.totalAmount,
            r.franchiseShare,
            r.techwellShare,
            r.paymentMethod || '-',
            r.status,
        ]);
        const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `franchise_revenue_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'SETTLED': return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
            case 'PENDING': return <Clock className="w-4 h-4 text-amber-500" />;
            default: return <AlertCircle className="w-4 h-4 text-slate-400" />;
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    return (
        <div className="space-y-8 p-6 max-w-[1400px] mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                        Revenue & Royalty
                    </h1>
                    <p className="text-muted-foreground mt-1">Track collections, royalties, and settlements with HQ.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Select value={period} onValueChange={setPeriod}>
                        <SelectTrigger className="w-[180px]">
                            <Calendar className="w-4 h-4 mr-2 text-muted-foreground" />
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">All Time</SelectItem>
                            <SelectItem value="THIS_MONTH">This Month</SelectItem>
                            <SelectItem value="LAST_30">Last 30 Days</SelectItem>
                            <SelectItem value="LAST_90">Last 90 Days</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button variant="outline" size="sm" onClick={fetchData} className="gap-2">
                        <RefreshCw className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleExportCSV} className="gap-2" disabled={filteredRevenues.length === 0}>
                        <Download className="w-4 h-4" /> Export
                    </Button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {[
                    {
                        label: 'My Net Earnings', value: `₹${myShare.toLocaleString()}`, icon: IndianRupee,
                        bg: 'from-emerald-50 to-teal-50 dark:from-emerald-950/20', iconBg: 'bg-emerald-100 dark:bg-emerald-900/30',
                        iconColor: 'text-emerald-600', sub: 'After royalties', subColor: 'text-emerald-600',
                    },
                    {
                        label: 'Gross Collected', value: `₹${totalCollected.toLocaleString()}`, icon: Activity,
                        bg: 'from-blue-50 to-sky-50 dark:from-blue-950/20', iconBg: 'bg-blue-100 dark:bg-blue-900/30',
                        iconColor: 'text-blue-600', sub: `${filteredRevenues.length} transactions`, subColor: 'text-blue-600',
                    },
                    {
                        label: 'Royalties Paid (HQ)', value: `₹${techwellShare.toLocaleString()}`, icon: ArrowUpRight,
                        bg: 'from-red-50 to-rose-50 dark:from-red-950/20', iconBg: 'bg-red-100 dark:bg-red-900/30',
                        iconColor: 'text-red-500', sub: `${royaltyRate}% royalty rate`, subColor: 'text-red-500',
                    },
                    {
                        label: 'Pending Settlement', value: `₹${pendingSettlement.toLocaleString()}`, icon: Clock,
                        bg: 'from-amber-50 to-yellow-50 dark:from-amber-950/20', iconBg: 'bg-amber-100 dark:bg-amber-900/30',
                        iconColor: 'text-amber-600', sub: 'Awaiting settlement', subColor: 'text-amber-600',
                    },
                ].map((k) => (
                    <Card key={k.label} className={`bg-gradient-to-br ${k.bg} border-0 shadow-md`}>
                        <CardContent className="p-5">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">{k.label}</p>
                                    <p className="text-2xl font-extrabold mt-1 text-foreground">{k.value}</p>
                                    <p className={`text-xs mt-1.5 font-medium ${k.subColor}`}>{k.sub}</p>
                                </div>
                                <div className={`h-11 w-11 rounded-xl flex items-center justify-center ${k.iconBg} ${k.iconColor} shadow-sm`}>
                                    <k.icon className="w-5 h-5" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Royalty Breakdown Info */}
            <Card className="border-indigo-100 dark:border-indigo-900/40 bg-indigo-50/50 dark:bg-indigo-950/20 shadow-sm">
                <CardContent className="flex items-start gap-3 p-4">
                    <Info className="w-5 h-5 text-indigo-500 mt-0.5 shrink-0" />
                    <div>
                        <p className="text-sm font-semibold text-indigo-800 dark:text-indigo-300">How Royalties Work</p>
                        <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-1">
                            A percentage of every fee collected by your franchise is remitted to Techwell HQ as a royalty fee. The remainder is your earnings.
                            Settlements are processed monthly. Contact HQ for disputes or adjustments.
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Transactions Table */}
            <Card className="shadow-md border">
                <CardHeader className="flex flex-row items-center justify-between pb-3">
                    <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <BarChart3 className="w-5 h-5 text-indigo-500" /> Transaction Ledger
                        </CardTitle>
                        <CardDescription>All revenue records for your franchise</CardDescription>
                    </div>
                    <Badge variant="secondary">{filteredRevenues.length} records</Badge>
                </CardHeader>
                <CardContent className="p-0">
                    {filteredRevenues.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-muted/50 border-b text-left">
                                        <th className="px-6 py-3 font-semibold text-muted-foreground">Date</th>
                                        <th className="px-6 py-3 font-semibold text-muted-foreground">Gross Collected</th>
                                        <th className="px-6 py-3 font-semibold text-muted-foreground">My Share</th>
                                        <th className="px-6 py-3 font-semibold text-muted-foreground">HQ Royalty</th>
                                        <th className="px-6 py-3 font-semibold text-muted-foreground">Method</th>
                                        <th className="px-6 py-3 font-semibold text-muted-foreground">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {filteredRevenues.map((r) => (
                                        <tr key={r.id} className="hover:bg-muted/20 transition-colors">
                                            <td className="px-6 py-3 text-muted-foreground">
                                                {new Date(r.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                            </td>
                                            <td className="px-6 py-3 font-semibold">₹{r.totalAmount.toLocaleString()}</td>
                                            <td className="px-6 py-3 text-emerald-600 font-semibold">₹{r.franchiseShare.toLocaleString()}</td>
                                            <td className="px-6 py-3 text-red-500 font-medium">₹{r.techwellShare.toLocaleString()}</td>
                                            <td className="px-6 py-3 text-muted-foreground">{r.paymentMethod || 'CASH'}</td>
                                            <td className="px-6 py-3">
                                                <div className="flex items-center gap-2">
                                                    {getStatusIcon(r.status)}
                                                    <Badge variant={r.status === 'SETTLED' ? 'default' : 'secondary'} className={r.status === 'SETTLED' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : ''}>
                                                        {r.status}
                                                    </Badge>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-16 text-muted-foreground">
                            <IndianRupee className="mx-auto h-10 w-10 opacity-20 mb-3" />
                            <p className="font-medium">No transactions found</p>
                            <p className="text-sm mt-1">Revenue generated by your franchise will appear here.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
