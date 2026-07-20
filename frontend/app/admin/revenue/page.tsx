"use client"
import * as React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
    IndianRupee, TrendingUp, BookOpen, Building2, Briefcase,
    BrainCircuit, FileText, Users, RefreshCcw, BarChart3, Loader2
} from "lucide-react"
import api from "@/lib/api"

type RevenueBreakdown = {
    payments: number
    consulting: number
    franchise: number
    leads: number
    universalLog: number
}

type RevenueData = {
    revenue: {
        total: number
        breakdown: RevenueBreakdown
    }
    pipeline: {
        totalLeads: number
        convertedLeads: number
        conversionRate: string | number
    }
    resources: {
        totalStudents: number
        totalStaff: number
        activeFranchises: number
        activeProjects: number
        activeCourses: number
    }
    recentTransactions: Array<{
        id: string
        amount: number
        status: string
        createdAt: string
        user?: { name: string }
        course?: { title: string }
    }>
}

const SOURCE_CONFIG = [
    {
        key: "payments" as keyof RevenueBreakdown,
        label: "Course Payments",
        icon: BookOpen,
        color: "from-blue-500 to-indigo-600",
        bg: "bg-blue-500/10",
        text: "text-blue-400",
        description: "Online / offline course enrollments"
    },
    {
        key: "consulting" as keyof RevenueBreakdown,
        label: "Consultancy",
        icon: Briefcase,
        color: "from-purple-500 to-violet-600",
        bg: "bg-purple-500/10",
        text: "text-purple-400",
        description: "IT & career consulting services"
    },
    {
        key: "franchise" as keyof RevenueBreakdown,
        label: "Franchise Fees",
        icon: Building2,
        color: "from-orange-500 to-amber-600",
        bg: "bg-orange-500/10",
        text: "text-orange-400",
        description: "Franchise registration & royalties"
    },
    {
        key: "leads" as keyof RevenueBreakdown,
        label: "Lead Conversions",
        icon: Users,
        color: "from-teal-500 to-emerald-600",
        bg: "bg-teal-500/10",
        text: "text-teal-400",
        description: "Revenue from enrolled CRM leads"
    },
    {
        key: "universalLog" as keyof RevenueBreakdown,
        label: "Other Services",
        icon: BrainCircuit,
        color: "from-pink-500 to-rose-600",
        bg: "bg-pink-500/10",
        text: "text-pink-400",
        description: "AI Interviews, Resume Builder, Jobs, Campus, Projects"
    },
]

function fmt(n: number) {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n)
}

export default function RevenueCenterPage() {
    const [data, setData] = useState<RevenueData | null>(null)
    const [loading, setLoading] = useState(true)

    const fetchData = async () => {
        setLoading(true)
        try {
            const res = await api.get("/analytics/master-dashboard")
            setData(res.data)
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { fetchData() }, [])

    const totalRevenue = data?.revenue?.total || 0
    const breakdown = data?.revenue?.breakdown

    return (
        <div className="space-y-8 p-2 md:p-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tight">
                        Revenue <span className="text-primary">Center</span>
                    </h1>
                    <p className="text-muted-foreground text-sm mt-1">
                        Central view of all income across every product & service on the platform.
                    </p>
                </div>
                <Button variant="outline" size="sm" onClick={fetchData} disabled={loading}>
                    <RefreshCcw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                </Button>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-32">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                </div>
            ) : (
                <>
                    {/* Total Revenue Hero */}
                    <Card className="bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-700 text-white border-0 shadow-2xl relative overflow-hidden">
                        <div className="absolute inset-0 bg-grid-white/10 opacity-30" />
                        <div className="absolute top-0 right-0 p-8 opacity-10">
                            <IndianRupee className="w-40 h-40" />
                        </div>
                        <CardContent className="pt-8 pb-8 relative z-10">
                            <p className="text-emerald-100 text-sm font-bold uppercase tracking-widest mb-1">Total Unified Revenue</p>
                            <div className="text-6xl font-black mb-4">{fmt(totalRevenue)}</div>
                            <div className="flex flex-wrap gap-4">
                                {SOURCE_CONFIG.map(s => (
                                    <div key={s.key} className="bg-white/10 px-3 py-1.5 rounded-lg text-xs font-bold">
                                        {s.label}: {fmt(breakdown?.[s.key] || 0)}
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Revenue Breakdown Cards */}
                    <div>
                        <h2 className="text-lg font-black uppercase tracking-wider text-muted-foreground mb-4">
                            📊 Revenue by Source
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                            {SOURCE_CONFIG.map(src => {
                                const amount = breakdown?.[src.key] || 0
                                const pct = totalRevenue > 0 ? ((amount / totalRevenue) * 100).toFixed(1) : 0
                                const Icon = src.icon
                                return (
                                    <Card key={src.key} className="glass-card border-white/10 relative overflow-hidden group hover:border-white/20 transition-all">
                                        <div className={`absolute top-0 left-0 h-1 w-full bg-gradient-to-r ${src.color}`} />
                                        <CardContent className="pt-6 pb-6">
                                            <div className="flex items-start justify-between mb-4">
                                                <div className={`p-3 rounded-xl ${src.bg} ${src.text}`}>
                                                    <Icon className="w-5 h-5" />
                                                </div>
                                                <Badge className={`${src.bg} ${src.text} border-0 text-xs font-bold`}>
                                                    {pct}%
                                                </Badge>
                                            </div>
                                            <div className="text-2xl font-black mb-0.5">{fmt(amount)}</div>
                                            <div className="font-bold text-sm">{src.label}</div>
                                            <div className="text-xs text-muted-foreground mt-1">{src.description}</div>

                                            {/* Progress bar */}
                                            <div className="mt-4 h-1.5 bg-white/10 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full bg-gradient-to-r ${src.color} rounded-full transition-all duration-700`}
                                                    style={{ width: `${pct}%` }}
                                                />
                                            </div>
                                        </CardContent>
                                    </Card>
                                )
                            })}

                            {/* Lead Pipeline Card */}
                            <Card className="glass-card border-white/10 relative overflow-hidden">
                                <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-sky-500 to-blue-600" />
                                <CardContent className="pt-6 pb-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="p-3 rounded-xl bg-sky-500/10 text-sky-400">
                                            <TrendingUp className="w-5 h-5" />
                                        </div>
                                        <Badge className="bg-sky-500/10 text-sky-400 border-0 text-xs font-bold">
                                            Leads
                                        </Badge>
                                    </div>
                                    <div className="text-2xl font-black mb-0.5">{data?.pipeline?.totalLeads || 0}</div>
                                    <div className="font-bold text-sm">Lead Pipeline</div>
                                    <div className="text-xs text-muted-foreground mt-1">
                                        {data?.pipeline?.convertedLeads || 0} converted · {data?.pipeline?.conversionRate || 0}% rate
                                    </div>
                                    <div className="mt-4 h-1.5 bg-white/10 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-sky-500 to-blue-600 rounded-full"
                                            style={{ width: `${data?.pipeline?.conversionRate || 0}%` }}
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Platform Resources Card */}
                            <Card className="glass-card border-white/10 relative overflow-hidden">
                                <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-violet-500 to-purple-600" />
                                <CardContent className="pt-6 pb-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="p-3 rounded-xl bg-violet-500/10 text-violet-400">
                                            <BarChart3 className="w-5 h-5" />
                                        </div>
                                        <Badge className="bg-violet-500/10 text-violet-400 border-0 text-xs font-bold">
                                            Platform
                                        </Badge>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3 mt-2">
                                        {[
                                            { label: "Students", val: data?.resources?.totalStudents || 0 },
                                            { label: "Staff", val: data?.resources?.totalStaff || 0 },
                                            { label: "Franchises", val: data?.resources?.activeFranchises || 0 },
                                            { label: "Live Courses", val: data?.resources?.activeCourses || 0 },
                                        ].map(({ label, val }) => (
                                            <div key={label}>
                                                <div className="text-xl font-black">{val}</div>
                                                <div className="text-xs text-muted-foreground">{label}</div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Recent Transactions */}
                    {data?.recentTransactions && data.recentTransactions.length > 0 && (
                        <div>
                            <h2 className="text-lg font-black uppercase tracking-wider text-muted-foreground mb-4">
                                💳 Recent Transactions
                            </h2>
                            <Card className="glass-card border-white/10 overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead className="bg-white/5 text-muted-foreground">
                                            <tr>
                                                <th className="p-4 text-left text-[10px] font-bold uppercase tracking-wider">Student</th>
                                                <th className="p-4 text-left text-[10px] font-bold uppercase tracking-wider">Course / Item</th>
                                                <th className="p-4 text-left text-[10px] font-bold uppercase tracking-wider">Amount</th>
                                                <th className="p-4 text-left text-[10px] font-bold uppercase tracking-wider">Status</th>
                                                <th className="p-4 text-left text-[10px] font-bold uppercase tracking-wider">Date</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5">
                                            {data.recentTransactions.map(tx => (
                                                <tr key={tx.id} className="hover:bg-white/5 transition-colors">
                                                    <td className="p-4 font-semibold">{tx.user?.name || '—'}</td>
                                                    <td className="p-4 text-muted-foreground">{tx.course?.title || '—'}</td>
                                                    <td className="p-4 font-black text-emerald-400">{fmt(tx.amount)}</td>
                                                    <td className="p-4">
                                                        <Badge className="bg-emerald-500/10 text-emerald-400 border-0 text-[10px] font-bold uppercase">
                                                            {tx.status}
                                                        </Badge>
                                                    </td>
                                                    <td className="p-4 text-xs text-muted-foreground">
                                                        {new Date(tx.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </Card>
                        </div>
                    )}

                    {/* Quick nav to old consultancy page */}
                    <div className="flex items-center gap-3 p-4 bg-white/5 rounded-xl border border-white/10 text-sm text-muted-foreground">
                        <FileText className="w-4 h-4 shrink-0" />
                        <span>Need detailed consultancy breakdown?</span>
                        <a href="/admin/consultancy-revenue" className="text-primary font-bold underline underline-offset-2 hover:text-primary/80">
                            Open Consultancy Revenue →
                        </a>
                    </div>
                </>
            )}
        </div>
    )
}
