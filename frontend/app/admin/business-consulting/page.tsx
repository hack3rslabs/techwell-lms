"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
    Briefcase,
    FileSignature,
    CheckCircle2,
    Clock,
    PlusCircle,
    ArrowRight,
    Users,
    CreditCard
} from "lucide-react"
import Link from "next/link"

export default function BusinessConsultingDashboard() {
    // Mocked for UI construction - will wire up to real endpoints (projectRoutes, crm-agreements) later
    const [stats, setStats] = React.useState({
        activeProjects: 12,
        pendingAgreements: 4,
        totalClients: 38,
        monthlyRevenue: "₹1,250,000",
    })

    return (
        <div className="p-8 space-y-8 min-h-screen bg-slate-50/50">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-slate-900">IT Consulting & Business</h1>
                    <p className="text-muted-foreground mt-1 font-medium">Manage IT projects, client agreements, and billing milestones.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="rounded-xl font-bold bg-white" asChild>
                        <Link href="/admin/crm/customers/new">
                            <PlusCircle className="mr-2 h-4 w-4" /> New Client
                        </Link>
                    </Button>
                    <Button className="rounded-xl font-bold" asChild>
                        <Link href="/admin/business-consulting/projects/new">
                            <PlusCircle className="mr-2 h-4 w-4" /> Create IT Project
                        </Link>
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="rounded-[1.5rem] border-none shadow-xl shadow-slate-200/50 bg-gradient-to-br from-blue-50 to-blue-100/50">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-black text-blue-600 uppercase tracking-widest">Active Projects</CardTitle>
                        <Briefcase className="h-5 w-5 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-black text-slate-900">{stats.activeProjects}</div>
                        <p className="text-xs text-blue-600 mt-2 font-bold">+2 this week</p>
                    </CardContent>
                </Card>

                <Card className="rounded-[1.5rem] border-none shadow-xl shadow-slate-200/50 bg-gradient-to-br from-amber-50 to-amber-100/50">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-black text-amber-600 uppercase tracking-widest">Draft Agreements</CardTitle>
                        <FileSignature className="h-5 w-5 text-amber-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-black text-slate-900">{stats.pendingAgreements}</div>
                        <p className="text-xs text-amber-600 mt-2 font-bold">Awaiting signatures</p>
                    </CardContent>
                </Card>

                <Card className="rounded-[1.5rem] border-none shadow-xl shadow-slate-200/50">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-black text-slate-500 uppercase tracking-widest">Total Clients</CardTitle>
                        <Users className="h-5 w-5 text-slate-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-black text-slate-900">{stats.totalClients}</div>
                    </CardContent>
                </Card>

                <Card className="rounded-[1.5rem] border-none shadow-xl shadow-emerald-200/50 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-black uppercase tracking-widest text-emerald-100">MRR</CardTitle>
                        <CreditCard className="h-5 w-5 text-emerald-100" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black">{stats.monthlyRevenue}</div>
                        <p className="text-xs text-emerald-100 mt-2 font-bold border-t border-emerald-400/50 pt-2">+12% from last month</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card className="rounded-[2rem] border-none shadow-xl shadow-slate-200/40">
                    <CardHeader>
                        <CardTitle className="text-xl font-bold">Recent Client Agreements</CardTitle>
                        <CardDescription>Draft and manage legal agreements directly connected to CRM.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                            <div className="flex items-center gap-4">
                                <div className="h-10 w-10 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center">
                                    <Clock className="h-5 w-5" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-bold text-slate-900">Reliance Digital (TW-AGR-2024-001)</span>
                                    <span className="text-xs font-semibold text-slate-500">Drafted 2 days ago</span>
                                </div>
                            </div>
                            <Button variant="ghost" className="font-bold" asChild>
                                <Link href="/admin/business-consulting/agreements">View <ArrowRight className="ml-1 w-4 h-4" /></Link>
                            </Button>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                            <div className="flex items-center gap-4">
                                <div className="h-10 w-10 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
                                    <CheckCircle2 className="h-5 w-5" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-bold text-slate-900">TechNova Pvt Ltd (TW-AGR-2024-002)</span>
                                    <span className="text-xs font-semibold text-slug-500">Signed on May 12</span>
                                </div>
                            </div>
                            <Button variant="ghost" className="font-bold" asChild>
                                <Link href="/admin/business-consulting/agreements">View <ArrowRight className="ml-1 w-4 h-4" /></Link>
                            </Button>
                        </div>
                        <Button variant="outline" className="w-full mt-2 font-bold rounded-xl" asChild>
                            <Link href="/admin/business-consulting/agreements">Manage All Agreements</Link>
                        </Button>
                    </CardContent>
                </Card>

                <Card className="rounded-[2rem] border-none shadow-xl shadow-slate-200/40">
                    <CardHeader>
                        <CardTitle className="text-xl font-bold">Active IT Projects</CardTitle>
                        <CardDescription>Milestone tracking and deliveries for service clients.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                            <div className="flex flex-col gap-2">
                                <span className="font-bold text-slate-900">LMS Migration for EDU Corp</span>
                                <div className="w-48 bg-slate-200 rounded-full h-2">
                                    <div className="bg-primary h-2 rounded-full" style={{ width: '65%' }}></div>
                                </div>
                            </div>
                            <span className="text-sm font-black text-slate-700">65%</span>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                            <div className="flex flex-col gap-2">
                                <span className="font-bold text-slate-900">Cybersecurity Audit - FinanceWeb</span>
                                <div className="w-48 bg-slate-200 rounded-full h-2">
                                    <div className="bg-orange-500 h-2 rounded-full" style={{ width: '25%' }}></div>
                                </div>
                            </div>
                            <span className="text-sm font-black text-slate-700">25%</span>
                        </div>
                        <Button variant="outline" className="w-full mt-2 font-bold rounded-xl" asChild>
                            <Link href="/admin/business-consulting/projects">Manage IT Projects</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
