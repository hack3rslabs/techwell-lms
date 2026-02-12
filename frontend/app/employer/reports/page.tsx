"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import api from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import {
    ArrowLeft, Printer, Download, Briefcase, Users, CheckCircle, XCircle,
    TrendingUp, Calendar, Filter, FileText, ChevronRight
} from "lucide-react"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

export default function EmployerReportsPage() {
    const [reportPeriod, setReportPeriod] = useState("this_month")
    const router = useRouter()

    // Mock data for UI
    const stats = {
        totalJobs: 12,
        activeJobs: 5,
        totalApplicants: 148,
        hired: 8,
        rejected: 45,
        avgTime: 18,
        interviewRate: 35,
        offerRate: 12
    }

    const recentReports = [
        { id: '1', title: 'Monthly Hiring Summary - Jan 2026', type: 'PDF', generatedAt: '2026-02-01', size: '1.2 MB' },
        { id: '2', title: 'Q4 2025 Performance Report', type: 'PDF', generatedAt: '2026-01-15', size: '2.4 MB' },
        { id: '3', title: 'Candidate Pipeline Export', type: 'CSV', generatedAt: '2026-02-08', size: '450 KB' },
    ]

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-100 pb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                        Analytics & Reports
                    </h1>
                    <p className="text-gray-500 mt-1 text-sm font-medium">Track your recruitment performance and generate insights.</p>
                </div>
                <div className="flex gap-3">
                    <Select value={reportPeriod} onValueChange={setReportPeriod}>
                        <SelectTrigger className="w-[160px] bg-white border-gray-200 text-sm font-medium">
                            <SelectValue placeholder="Select period" />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-gray-200">
                            <SelectItem value="this_week">This Week</SelectItem>
                            <SelectItem value="this_month">This Month</SelectItem>
                            <SelectItem value="last_month">Last Month</SelectItem>
                            <SelectItem value="this_year">This Year</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button variant="outline" className="bg-white border-gray-200 text-gray-700 hover:bg-gray-50 font-medium shadow-sm">
                        <Download className="mr-2 h-4 w-4" /> Export Data
                    </Button>
                </div>
            </div>

            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="bg-white border border-gray-200 shadow-sm rounded-xl overflow-hidden hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-blue-50 rounded-xl">
                                <Briefcase className="h-6 w-6 text-blue-600" />
                            </div>
                            <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full">+12%</span>
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-3xl font-bold text-gray-900">{stats.totalJobs}</h3>
                            <p className="text-sm font-medium text-gray-500">Jobs Posted</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-white border border-gray-200 shadow-sm rounded-xl overflow-hidden hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-indigo-50 rounded-xl">
                                <Users className="h-6 w-6 text-indigo-600" />
                            </div>
                            <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full">+24%</span>
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-3xl font-bold text-gray-900">{stats.totalApplicants}</h3>
                            <p className="text-sm font-medium text-gray-500">Total Applicants</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-white border border-gray-200 shadow-sm rounded-xl overflow-hidden hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-green-50 rounded-xl">
                                <CheckCircle className="h-6 w-6 text-green-600" />
                            </div>
                            <span className="text-xs font-semibold text-gray-500 bg-gray-50 px-2 py-1 rounded-full">--</span>
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-3xl font-bold text-gray-900">{stats.hired}</h3>
                            <p className="text-sm font-medium text-gray-500">Candidates Hired</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-white border border-gray-200 shadow-sm rounded-xl overflow-hidden hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-amber-50 rounded-xl">
                                <TrendingUp className="h-6 w-6 text-amber-600" />
                            </div>
                            <span className="text-xs font-semibold text-red-600 bg-red-50 px-2 py-1 rounded-full">-2 days</span>
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-3xl font-bold text-gray-900">{stats.avgTime}d</h3>
                            <p className="text-sm font-medium text-gray-500">Avg Time to Hire</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Funnel Chart (Simplified Visual) */}
                <Card className="lg:col-span-2 bg-white border border-gray-200 shadow-sm rounded-xl overflow-hidden">
                    <CardHeader className="border-b border-gray-100 bg-gray-50/50 py-4">
                        <CardTitle className="text-base font-bold text-gray-900">Conversion Funnel</CardTitle>
                        <CardDescription className="text-xs text-gray-500">Applicant progression through hiring stages</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm font-medium text-gray-700">
                                <span>Applied ({stats.totalApplicants})</span>
                                <span>100%</span>
                            </div>
                            <Progress value={100} className="h-3 bg-blue-100" indicatorClassName="bg-blue-600" />
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm font-medium text-gray-700">
                                <span>Interviewed ({Math.round(stats.totalApplicants * 0.35)})</span>
                                <span>{stats.interviewRate}%</span>
                            </div>
                            <Progress value={stats.interviewRate} className="h-3 bg-indigo-100" indicatorClassName="bg-indigo-600" />
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm font-medium text-gray-700">
                                <span>Offers Made ({Math.round(stats.totalApplicants * 0.12)})</span>
                                <span>{stats.offerRate}%</span>
                            </div>
                            <Progress value={stats.offerRate} className="h-3 bg-purple-100" indicatorClassName="bg-purple-600" />
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm font-medium text-gray-700">
                                <span>Hired ({stats.hired})</span>
                                <span>5.4%</span>
                            </div>
                            <Progress value={5.4} className="h-3 bg-green-100" indicatorClassName="bg-green-600" />
                        </div>
                    </CardContent>
                </Card>

                {/* Recent Reports List */}
                <Card className="bg-white border border-gray-200 shadow-sm rounded-xl overflow-hidden">
                    <CardHeader className="border-b border-gray-100 bg-gray-50/50 py-4">
                        <CardTitle className="text-base font-bold text-gray-900">Generated Reports</CardTitle>
                        <CardDescription className="text-xs text-gray-500">Download past reports</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y divide-gray-100">
                            {recentReports.map((report) => (
                                <div key={report.id} className="p-4 hover:bg-gray-50/50 transition-colors flex items-center justify-between group cursor-pointer">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                                            <FileText className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">{report.title}</p>
                                            <p className="text-xs text-gray-500 mt-0.5">{report.generatedAt} • {report.size}</p>
                                        </div>
                                    </div>
                                    <Button size="icon" variant="ghost" className="h-8 w-8 text-gray-400 group-hover:text-gray-900">
                                        <Download className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                        <div className="p-4 border-t border-gray-100">
                            <Button variant="ghost" size="sm" className="w-full text-blue-600 hover:text-blue-700 hover:bg-blue-50 font-medium text-xs">
                                View All Reports <ChevronRight className="ml-1 h-3 w-3" />
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
