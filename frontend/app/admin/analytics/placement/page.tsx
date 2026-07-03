"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3, Users, Briefcase, GraduationCap, TrendingUp, CheckCircle, ArrowUpRight } from "lucide-react"

export default function PlacementAnalytics() {
    const [stats, setStats] = useState({
        totalStudents: 15420,
        placedStudents: 9840,
        totalDrives: 245,
        totalEmployers: 120,
        placementRate: 64,
        avgCtc: '7.5 LPA',
        highestCtc: '42 LPA'
    })

    return (
        <div className="container space-y-8 animate-in fade-in duration-500 pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-100 pb-6">
                <div>
                    <h1 className="text-3xl font-bold text-foreground tracking-tight">
                        Global Placement Analytics
                    </h1>
                    <p className="text-muted-foreground mt-1 text-sm font-medium">Platform-wide overview of campus hiring performance.</p>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="bg-white border-none shadow-md rounded-xl overflow-hidden relative">
                    <div className="absolute top-0 left-0 w-1 h-full bg-blue-600"></div>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-blue-50 rounded-xl">
                                <GraduationCap className="h-6 w-6 text-blue-600" />
                            </div>
                            <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full flex items-center gap-1">
                                <ArrowUpRight className="h-3 w-3" /> +12%
                            </span>
                        </div>
                        <h3 className="text-3xl font-black text-gray-900">{stats.placedStudents.toLocaleString()}</h3>
                        <p className="text-sm font-medium text-gray-500 mt-1">Total Placed Students</p>
                        <p className="text-xs text-gray-400 mt-4 pt-4 border-t border-gray-50">Out of {stats.totalStudents.toLocaleString()} eligible</p>
                    </CardContent>
                </Card>

                <Card className="bg-white border-none shadow-md rounded-xl overflow-hidden relative">
                    <div className="absolute top-0 left-0 w-1 h-full bg-indigo-600"></div>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-indigo-50 rounded-xl">
                                <Briefcase className="h-6 w-6 text-indigo-600" />
                            </div>
                        </div>
                        <h3 className="text-3xl font-black text-gray-900">{stats.totalDrives}</h3>
                        <p className="text-sm font-medium text-gray-500 mt-1">Total Campus Drives</p>
                        <p className="text-xs text-gray-400 mt-4 pt-4 border-t border-gray-50">Conducted this academic year</p>
                    </CardContent>
                </Card>

                <Card className="bg-white border-none shadow-md rounded-xl overflow-hidden relative">
                    <div className="absolute top-0 left-0 w-1 h-full bg-amber-500"></div>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-amber-50 rounded-xl">
                                <TrendingUp className="h-6 w-6 text-amber-500" />
                            </div>
                        </div>
                        <h3 className="text-3xl font-black text-gray-900">{stats.placementRate}%</h3>
                        <p className="text-sm font-medium text-gray-500 mt-1">Average Placement Rate</p>
                        <div className="w-full bg-gray-100 h-1.5 rounded-full mt-4">
                            <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: `${stats.placementRate}%` }}></div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white border-none shadow-md rounded-xl overflow-hidden relative bg-gradient-to-br from-green-50 to-green-100/50">
                    <div className="absolute top-0 left-0 w-1 h-full bg-green-600"></div>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-green-100 rounded-xl">
                                <CheckCircle className="h-6 w-6 text-green-700" />
                            </div>
                        </div>
                        <h3 className="text-3xl font-black text-green-900">{stats.avgCtc}</h3>
                        <p className="text-sm font-medium text-green-700 mt-1">Average CTC Offered</p>
                        <p className="text-xs text-green-600 font-bold mt-4 pt-4 border-t border-green-200">Highest: {stats.highestCtc}</p>
                    </CardContent>
                </Card>
            </div>

            {/* Funnel & Analytics Charts placeholder */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
                <Card className="bg-white border border-gray-100 shadow-sm rounded-xl">
                    <CardHeader className="border-b border-gray-50 pb-4">
                        <CardTitle className="text-base font-bold text-gray-900 flex items-center gap-2">
                            <BarChart3 className="h-4 w-4 text-indigo-600" /> Hiring Funnel
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-8">
                        <div className="space-y-6">
                            {[
                                { stage: 'Registered', count: 15420, pct: 100, color: 'bg-blue-500' },
                                { stage: 'Applied', count: 12500, pct: 81, color: 'bg-indigo-500' },
                                { stage: 'Interviewed', count: 8200, pct: 53, color: 'bg-purple-500' },
                                { stage: 'Offered', count: 4100, pct: 26, color: 'bg-green-500' },
                            ].map(item => (
                                <div key={item.stage} className="relative">
                                    <div className="flex justify-between mb-1.5 font-semibold text-sm text-gray-700">
                                        <span>{item.stage}</span>
                                        <span>{item.count.toLocaleString()}</span>
                                    </div>
                                    <div className="h-4 bg-gray-100 rounded-r-md">
                                        <div className={`h-4 rounded-r-md ${item.color} flex items-center px-2 text-[10px] text-white font-bold transition-all duration-1000`} style={{ width: `${item.pct}%` }}>
                                            {item.pct}%
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white border border-gray-100 shadow-sm rounded-xl">
                    <CardHeader className="border-b border-gray-50 pb-4">
                        <CardTitle className="text-base font-bold text-gray-900 flex items-center gap-2">
                            <Users className="h-4 w-4 text-blue-600" /> Top Recruiting Domains
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-8">
                        <div className="space-y-6">
                            {[
                                { domain: 'Software Development', count: 145 },
                                { domain: 'Data Science & AI', count: 85 },
                                { domain: 'Product Management', count: 32 },
                                { domain: 'Cloud & DevOps', count: 28 },
                            ].map((item, idx) => (
                                <div key={item.domain} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">
                                            #{idx + 1}
                                        </div>
                                        <span className="font-semibold text-sm text-gray-800">{item.domain}</span>
                                    </div>
                                    <span className="text-sm font-bold text-gray-900">{item.count} Drives</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
