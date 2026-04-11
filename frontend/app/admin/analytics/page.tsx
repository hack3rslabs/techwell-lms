"use client"

import * as React from 'react'
import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell, AreaChart, Area
} from 'recharts'
import {
    Loader2, TrendingUp, Users, DollarSign, Briefcase, GraduationCap, MapPin
} from 'lucide-react'
import api from '@/lib/api'

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

interface AnalyticsData {
    summary: {
        totalLeads: number
        totalRevenue: number
    }
    charts: {
        status: { status: string; _count: number }[]
        source: { source: string; _count: number }[]
        college: { college: string; _count: number }[]
        location: { location: string; _count: number }[]
    }
}

export default function AnalyticsPage() {
    const [data, setData] = React.useState<AnalyticsData | null>(null)
    const [isLoading, setIsLoading] = React.useState(true)
    const [dateRange, _setDateRange] = React.useState({
        from: subDays(new Date(), 30),
        to: new Date()
    })

    React.useEffect(() => {
        fetchAnalytics()
    }, [fetchAnalytics])

    const fetchAnalytics = useCallback(async () => {
        setIsLoading(true)
        try {
            const params = new URLSearchParams({
                startDate: dateRange.from.toISOString(),
                endDate: dateRange.to.toISOString()
            })

            const res = await api.get(`/leads/analytics?${params.toString()}`)
            setData(res.data)
        } catch (error) {
            console.error(error)
            // Fallback Mock Data if API fails during dev/migration
            setData({
                summary: { totalLeads: 1250, totalRevenue: 450000 },
                charts: {
                    status: [
                        { status: 'NEW', _count: 450 },
                        { status: 'CONTACTED', _count: 300 },
                        { status: 'INTERESTED', _count: 200 },
                        { status: 'CONVERTED', _count: 150 },
                        { status: 'LOST', _count: 150 }
                    ],
                    source: [
                        { source: 'Website', _count: 600 },
                        { source: 'Google Ads', _count: 300 },
                        { source: 'Referral', _count: 200 },
                        { source: 'LinkedIn', _count: 150 }
                    ],
                    college: [
                        { college: 'IIT Delhi', _count: 45 },
                        { college: 'BITS Pilani', _count: 38 },
                        { college: 'Delhi University', _count: 120 },
                        { college: 'Amity University', _count: 85 },
                        { college: 'Thapar University', _count: 60 }
                    ],
                    location: [
                        { location: 'Delhi', _count: 400 },
                        { location: 'Mumbai', _count: 350 },
                        { location: 'Bangalore', _count: 300 },
                        { location: 'Pune', _count: 150 },
                        { location: 'Hyderabad', _count: 50 }
                    ]
                }
            })
        } finally {
            setIsLoading(false)
        }
    }, [dateRange])

    if (isLoading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    // Transform Data for Recharts
    const statusData = data?.charts?.status?.map((item) => ({
        name: item.status,
        value: item._count
    })) || []

    const sourceData = data?.charts?.source?.map((item) => ({
        name: item.source,
        value: item._count
    })) || []

    const collegeData = data?.charts?.college?.map((item) => ({
        name: item.college,
        value: item._count
    })) || []

    const locationData = data?.charts?.location?.map((item) => ({
        name: item.location,
        value: item._count
    })) || []

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Advanced Analytics</h1>
                    <p className="text-muted-foreground">Deep dive into business performance and demographics.</p>
                </div>
                <div className="flex items-center gap-2">
                    {/* Placeholder for Date Range Picker if component exists, else just text input for demo */}
                    <div className="border rounded-md px-3 py-2 text-sm">
                        Last 30 Days
                    </div>
                    <Button onClick={fetchAnalytics}>
                        Refresh
                    </Button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{data?.summary?.totalLeads}</div>
                        <p className="text-xs text-muted-foreground">+20.1% from last month</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">₹{data?.summary?.totalRevenue?.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">+15% from last month</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {((statusData.find((s) => s.name === 'CONVERTED')?.value || 0) / (data?.summary?.totalLeads || 1) * 100).toFixed(1)}%
                        </div>
                        <p className="text-xs text-muted-foreground">+2.4% from last month</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Tasks</CardTitle>
                        <Briefcase className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">24</div>
                        <p className="text-xs text-muted-foreground">12 pending, 8 in progress</p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Lead Sources</CardTitle>
                        <CardDescription>Where are your students coming from?</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={sourceData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {sourceData.map((entry, index: number) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Leads by Status</CardTitle>
                        <CardDescription>Current pipeline distribution</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={statusData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip cursor={{ fill: 'transparent' }} />
                                <Bar dataKey="value" fill="#0088FE" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Row 2: Demographics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <GraduationCap className="h-5 w-5" />
                            Top Colleges
                        </CardTitle>
                        <CardDescription>Institutions with most enquiries</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={collegeData} layout="vertical" margin={{ left: 40 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" width={100} fontSize={12} />
                                <Tooltip />
                                <Bar dataKey="value" fill="#82ca9d" radius={[0, 4, 4, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <MapPin className="h-5 w-5" />
                            Geographic Distribution
                        </CardTitle>
                        <CardDescription>Leads by City/Location</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={locationData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" fontSize={12} />
                                <YAxis fontSize={12} />
                                <Tooltip />
                                <Area type="monotone" dataKey="value" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
