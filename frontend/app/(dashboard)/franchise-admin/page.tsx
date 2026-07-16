'use client';

import React, { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Users, Activity, GraduationCap, IndianRupee, MapPin, TrendingUp,
    FileText, Phone, ArrowRight, Star, Briefcase, AlertCircle,
    ChevronRight, BarChart3, ClipboardList, CheckCircle2
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';

interface FranchiseStats {
    revenue: number;
    studentCount: number;
    coursesSold: number;
    certificatesIssued: number;
    leads?: number;
    activeLeads?: number;
    convertedLeads?: number;
    conversionRate?: number;
    territory?: {
        state: string;
        district: string;
        pincodes: string[];
    };
    performance?: {
        rank: number;
        rating: number;
        totalFranchises: number;
    };
}

interface RecentLead {
    id: string;
    name: string;
    phone: string;
    courseName: string;
    status: string;
    createdAt: string;
}

export default function FranchiseAdminDashboard() {
    const { user } = useAuth();
    const [stats, setStats] = useState<FranchiseStats>({
        revenue: 0,
        studentCount: 0,
        coursesSold: 0,
        certificatesIssued: 0,
        leads: 0,
        activeLeads: 0,
        convertedLeads: 0,
        conversionRate: 0,
    });
    const [recentLeads, setRecentLeads] = useState<RecentLead[]>([]);
    const [resources, setResources] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsRes, leadsRes, resourcesRes] = await Promise.allSettled([
                    api.get('/franchise/stats'),
                    api.get('/leads?limit=5'),
                    api.get('/franchise/resources'),
                ]);

                if (statsRes.status === 'fulfilled' && statsRes.value.data.success) {
                    setStats(statsRes.value.data.data);
                }
                if (leadsRes.status === 'fulfilled') {
                    setRecentLeads(leadsRes.value.data?.slice(0, 5) || []);
                }
                if (resourcesRes.status === 'fulfilled' && resourcesRes.value.data.success) {
                    setResources(resourcesRes.value.data.data?.slice(0, 4) || []);
                }
            } catch (err) {
                console.error('Failed to fetch franchise data', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const getLeadStatusColor = (status: string) => {
        switch (status) {
            case 'NEW': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'CONTACTED': return 'bg-amber-100 text-amber-700 border-amber-200';
            case 'QUALIFIED': return 'bg-purple-100 text-purple-700 border-purple-200';
            case 'CONVERTED': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'LOST': return 'bg-red-100 text-red-700 border-red-200';
            default: return 'bg-slate-100 text-slate-700 border-slate-200';
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="h-10 w-10 rounded-full border-2 border-t-indigo-600 border-r-indigo-600 border-b-transparent border-l-transparent animate-spin" />
            </div>
        );
    }

    const conversionRate = stats.leads && stats.leads > 0
        ? Math.round(((stats.convertedLeads || 0) / stats.leads) * 100)
        : 0;

    return (
        <div className="space-y-8 p-6 max-w-[1400px] mx-auto">
            {/* Hero Header */}
            <div className="relative bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-8 text-white overflow-hidden border border-slate-700 shadow-xl">
                <div className="absolute top-0 right-0 -mt-16 -mr-16 w-72 h-72 bg-indigo-500/20 rounded-full filter blur-3xl" />
                <div className="absolute bottom-0 left-0 -mb-16 -ml-16 w-72 h-72 bg-blue-500/20 rounded-full filter blur-3xl" />
                <div className="relative z-10">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <p className="text-indigo-300 text-sm font-semibold uppercase tracking-widest mb-1">Franchise Portal</p>
                            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
                                Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">{user?.name?.split(' ')[0]}</span>
                            </h1>
                            {stats.territory && (
                                <div className="flex items-center gap-2 mt-2 text-slate-300">
                                    <MapPin className="w-4 h-4 text-indigo-400" />
                                    <span className="text-sm">{stats.territory.district}, {stats.territory.state}</span>
                                    {stats.territory.pincodes?.length > 0 && (
                                        <span className="text-xs text-slate-400">| {stats.territory.pincodes.length} Pincodes</span>
                                    )}
                                </div>
                            )}
                        </div>
                        {stats.performance && (
                            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl px-6 py-4 text-center">
                                <div className="flex items-center gap-2 mb-1">
                                    <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                                    <span className="text-2xl font-bold">{stats.performance.rating?.toFixed(1)}</span>
                                </div>
                                <p className="text-xs text-slate-300">Rank #{stats.performance.rank} of {stats.performance.totalFranchises}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* KPI Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {[
                    {
                        label: 'Net Revenue', value: `₹${stats.revenue.toLocaleString()}`, icon: IndianRupee,
                        iconBg: 'bg-emerald-100 dark:bg-emerald-900/30', iconColor: 'text-emerald-600 dark:text-emerald-400',
                        cardBg: 'from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20',
                        badge: 'Revenue Share', badgeColor: 'bg-emerald-100 text-emerald-700',
                        href: '/franchise-admin/finance'
                    },
                    {
                        label: 'Total Students', value: stats.studentCount, icon: Users,
                        iconBg: 'bg-blue-100 dark:bg-blue-900/30', iconColor: 'text-blue-600 dark:text-blue-400',
                        cardBg: 'from-blue-50 to-sky-50 dark:from-blue-950/20 dark:to-sky-950/20',
                        badge: 'Enrolled', badgeColor: 'bg-blue-100 text-blue-700',
                        href: '/franchise-admin/students'
                    },
                    {
                        label: 'Active Leads', value: stats.activeLeads ?? 0, icon: Activity,
                        iconBg: 'bg-violet-100 dark:bg-violet-900/30', iconColor: 'text-violet-600 dark:text-violet-400',
                        cardBg: 'from-violet-50 to-purple-50 dark:from-violet-950/20 dark:to-purple-950/20',
                        badge: `${conversionRate}% CVR`, badgeColor: 'bg-violet-100 text-violet-700',
                        href: '/franchise-admin/leads'
                    },
                    {
                        label: 'Certificates Issued', value: stats.certificatesIssued, icon: GraduationCap,
                        iconBg: 'bg-amber-100 dark:bg-amber-900/30', iconColor: 'text-amber-600 dark:text-amber-400',
                        cardBg: 'from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20',
                        badge: 'This Month', badgeColor: 'bg-amber-100 text-amber-700',
                        href: '/franchise-admin/certificates'
                    },
                ].map((kpi) => (
                    <Link href={kpi.href} key={kpi.label}>
                        <Card className={`group relative overflow-hidden border-0 shadow-md bg-gradient-to-br ${kpi.cardBg} hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer`}>
                            <CardContent className="p-5">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">{kpi.label}</p>
                                        <p className="text-3xl font-extrabold mt-1 text-foreground">{kpi.value}</p>
                                        <span className={`inline-block mt-2 text-xs px-2 py-0.5 rounded-full font-medium ${kpi.badgeColor}`}>{kpi.badge}</span>
                                    </div>
                                    <div className={`h-12 w-12 rounded-2xl flex items-center justify-center ${kpi.iconBg} ${kpi.iconColor} shadow-sm group-hover:scale-110 transition-transform`}>
                                        <kpi.icon className="w-5 h-5" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Leads */}
                <div className="lg:col-span-2">
                    <Card className="shadow-md border">
                        <CardHeader className="flex flex-row items-center justify-between pb-3">
                            <div>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <ClipboardList className="w-5 h-5 text-indigo-500" />
                                    Recent Leads
                                </CardTitle>
                                <CardDescription>Latest enquiries from your territory</CardDescription>
                            </div>
                            <Link href="/franchise-admin/leads">
                                <Button variant="ghost" size="sm" className="gap-1 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50">
                                    View All <ChevronRight className="w-4 h-4" />
                                </Button>
                            </Link>
                        </CardHeader>
                        <CardContent className="p-0">
                            {recentLeads.length === 0 ? (
                                <div className="text-center py-10 text-muted-foreground">
                                    <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-40" />
                                    <p className="text-sm">No recent leads. Add your first enquiry!</p>
                                </div>
                            ) : (
                                <div className="divide-y">
                                    {recentLeads.map((lead) => (
                                        <div key={lead.id} className="flex items-center justify-between px-6 py-3 hover:bg-muted/20 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <div className="h-9 w-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold">
                                                    {lead.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-sm text-foreground">{lead.name}</p>
                                                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                                                        <Phone className="w-3 h-3" /> {lead.phone}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="text-xs text-muted-foreground hidden sm:block">{lead.courseName || 'Not specified'}</span>
                                                <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${getLeadStatusColor(lead.status)}`}>
                                                    {lead.status}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Quick Actions + Resources */}
                <div className="space-y-5">
                    {/* Quick Actions */}
                    <Card className="shadow-md border">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base flex items-center gap-2">
                                <BarChart3 className="w-4 h-4 text-indigo-500" /> Quick Actions
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {[
                                { label: 'Add New Lead', href: '/franchise-admin/leads', icon: Phone, color: 'text-blue-600' },
                                { label: 'Manage Students', href: '/franchise-admin/students', icon: Users, color: 'text-purple-600' },
                                { label: 'View Batches', href: '/franchise-admin/batches', icon: Briefcase, color: 'text-amber-600' },
                                { label: 'Issue Certificate', href: '/franchise-admin/certificates', icon: GraduationCap, color: 'text-emerald-600' },
                                { label: 'Revenue & Ledger', href: '/franchise-admin/finance', icon: IndianRupee, color: 'text-indigo-600' },
                                { label: 'Staff Management', href: '/franchise-admin/staff', icon: CheckCircle2, color: 'text-rose-600' },
                            ].map((action) => (
                                <Link key={action.href} href={action.href}>
                                    <div className="flex items-center justify-between p-3 rounded-xl hover:bg-muted/50 transition-colors group cursor-pointer">
                                        <div className="flex items-center gap-3">
                                            <action.icon className={`w-4 h-4 ${action.color}`} />
                                            <span className="text-sm font-medium">{action.label}</span>
                                        </div>
                                        <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                                    </div>
                                </Link>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Marketing Resources */}
                    <Card className="shadow-md border">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base flex items-center gap-2">
                                <FileText className="w-4 h-4 text-indigo-500" /> Resources
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {resources.length > 0 ? (
                                <ul className="space-y-2">
                                    {resources.map((r) => (
                                        <li key={r.id}>
                                            <a
                                                href={r.fileUrl}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-800 hover:underline"
                                            >
                                                <FileText className="w-3.5 h-3.5 shrink-0" />
                                                <span className="truncate">{r.title}</span>
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-sm text-muted-foreground text-center py-4">No resources shared yet.</p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
