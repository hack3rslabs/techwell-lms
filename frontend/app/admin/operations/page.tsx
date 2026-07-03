"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, ArrowRight, UserPlus, BookOpen, CheckCircle, Briefcase, TrendingUp, Users, Target, Activity } from 'lucide-react'
import Link from 'next/link'
import api from '@/lib/api'

interface KanbanItem {
    id: string
    name: string
    email?: string
    type: 'LEAD' | 'STUDENT' | 'CANDIDATE'
    stage: 'NEW_LEAD' | 'IN_TRAINING' | 'PLACEMENT_READY' | 'HIRED'
    category?: string
    atsScore?: number
}

interface KPIs {
    totalLeads: number
    activeStudents: number
    placementReady: number
    hiredCandidates: number
    conversionRate: string
    monthlyRevenue: string
    activeBatches: number
}

export default function OperationsCommandCenter() {
    const [data, setData] = useState<{
        leads: KanbanItem[]
        students: KanbanItem[]
        ready: KanbanItem[]
        hired: KanbanItem[]
    } | null>(null)
    const [kpis, setKpis] = useState<KPIs | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [kanbanRes, kpisRes] = await Promise.all([
                    api.get('/operations/kanban'),
                    api.get('/operations/kpis')
                ])
                setData(kanbanRes.data)
                setKpis(kpisRes.data.metrics)
            } catch (err: any) {
                console.error("Failed to load operations data:", err)
                setError(err?.response?.data?.error || err.message || "Failed to load dashboard")
            } finally {
                setLoading(false)
            }
        }
        fetchDashboardData()
    }, [])

    if (error) {
        return (
            <div className="flex flex-col h-[60vh] items-center justify-center space-y-4">
                <div className="text-red-500 font-bold text-xl">Error Loading Dashboard</div>
                <div className="text-slate-600">{error}</div>
                <p className="text-sm text-slate-400">Please make sure the backend server is running and updated.</p>
            </div>
        )
    }

    if (loading || !data || !kpis) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
        )
    }

    const columns = [
        {
            title: "New Leads",
            icon: UserPlus,
            color: "text-blue-500",
            bg: "bg-blue-500/10",
            border: "border-blue-200",
            items: data.leads
        },
        {
            title: "In Training (Students)",
            icon: BookOpen,
            color: "text-amber-500",
            bg: "bg-amber-500/10",
            border: "border-amber-200",
            items: data.students
        },
        {
            title: "Placement Ready",
            icon: CheckCircle,
            color: "text-emerald-500",
            bg: "bg-emerald-500/10",
            border: "border-emerald-200",
            items: data.ready
        },
        {
            title: "Hired / Placed",
            icon: Briefcase,
            color: "text-purple-500",
            bg: "bg-purple-500/10",
            border: "border-purple-200",
            items: data.hired
        }
    ]

    return (
        <div className="p-6 space-y-8 max-w-full overflow-x-hidden">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Operations Command Center</h1>
                <p className="text-muted-foreground mt-1 text-lg">God-mode pipeline for end-to-end lifecycle management.</p>
            </div>

            {/* KPI Metrics Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="bg-gradient-to-br from-indigo-500 to-indigo-700 text-white shadow-lg border-none">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-indigo-100 text-sm font-medium">Total Active Leads</p>
                                <h3 className="text-3xl font-bold mt-2">{kpis.totalLeads}</h3>
                            </div>
                            <div className="p-2 bg-white/20 rounded-lg"><Users className="h-5 w-5 text-white" /></div>
                        </div>
                        <div className="mt-4 flex items-center text-indigo-100 text-sm">
                            <TrendingUp className="h-4 w-4 mr-1" /> +12% from last month
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-emerald-500 to-emerald-700 text-white shadow-lg border-none">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-emerald-100 text-sm font-medium">Lead Conversion Rate</p>
                                <h3 className="text-3xl font-bold mt-2">{kpis.conversionRate}</h3>
                            </div>
                            <div className="p-2 bg-white/20 rounded-lg"><Target className="h-5 w-5 text-white" /></div>
                        </div>
                        <div className="mt-4 flex items-center text-emerald-100 text-sm">
                            <Activity className="h-4 w-4 mr-1" /> Industry avg is 2%
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-lg border-none">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-amber-100 text-sm font-medium">Active Students</p>
                                <h3 className="text-3xl font-bold mt-2">{kpis.activeStudents}</h3>
                            </div>
                            <div className="p-2 bg-white/20 rounded-lg"><BookOpen className="h-5 w-5 text-white" /></div>
                        </div>
                        <div className="mt-4 flex items-center text-amber-100 text-sm">
                            Across {kpis.activeBatches} active batches
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-violet-600 to-purple-800 text-white shadow-lg border-none">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-purple-100 text-sm font-medium">Estimated Revenue</p>
                                <h3 className="text-3xl font-bold mt-2">{kpis.monthlyRevenue}</h3>
                            </div>
                            <div className="p-2 bg-white/20 rounded-lg"><TrendingUp className="h-5 w-5 text-white" /></div>
                        </div>
                        <div className="mt-4 flex items-center text-purple-100 text-sm">
                            Projected for this month
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="flex items-center justify-between mt-8 mb-4">
                <h2 className="text-xl font-bold text-slate-800">Pipeline Tracking</h2>
            </div>

            {/* Kanban Board */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
                {columns.map((col, idx) => (
                    <Card key={idx} className={`border-t-4 ${col.border} bg-slate-50/50 shadow-sm`}>
                        <CardHeader className="pb-3 flex flex-row items-center justify-between">
                            <CardTitle className="text-lg font-bold flex items-center gap-2">
                                <div className={`p-1.5 rounded-md ${col.bg}`}>
                                    <col.icon className={`h-4 w-4 ${col.color}`} />
                                </div>
                                {col.title}
                            </CardTitle>
                            <Badge variant="secondary">{col.items.length}</Badge>
                        </CardHeader>
                        <CardContent className="space-y-3 min-h-[500px] max-h-[70vh] overflow-y-auto custom-scrollbar">
                            {col.items.length === 0 ? (
                                <div className="text-center text-sm text-slate-400 py-10 italic">
                                    No records in this stage.
                                </div>
                            ) : (
                                col.items.map((item, i) => (
                                    <div key={item.id || i} className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-shadow cursor-grab group relative">
                                        <div className="font-semibold text-slate-800 line-clamp-1">{item.name}</div>
                                        {item.email && <div className="text-xs text-slate-500 line-clamp-1 mt-0.5">{item.email}</div>}
                                        
                                        <div className="flex justify-between items-center mt-3">
                                            <Badge variant="outline" className="text-[10px] bg-slate-50">
                                                {item.type}
                                            </Badge>
                                            {item.atsScore && (
                                                <Badge className="text-[10px] bg-emerald-100 text-emerald-700 border-none hover:bg-emerald-100">
                                                    ATS: {item.atsScore}
                                                </Badge>
                                            )}
                                        </div>
                                        
                                        {/* Action Link (Always Visible) */}
                                        <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
                                            <Link href={item.type === 'LEAD' ? '/admin/leads' : item.type === 'STUDENT' ? '/admin/students' : '/admin/operations'} className="text-xs font-bold text-indigo-600 flex items-center gap-1 hover:underline">
                                                Manage <ArrowRight className="h-3 w-3" />
                                            </Link>
                                        </div>
                                    </div>
                                ))
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}
