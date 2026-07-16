"use client"

import * as React from 'react'
import { useState, useEffect, useCallback } from 'react'
import { subDays } from "date-fns"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell, AreaChart, Area, ComposedChart, Line
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
    const [data, setData] = useState<AnalyticsData | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [dateRange, _setDateRange] = useState({
        from: subDays(new Date(), 30),
        to: new Date()
    })

    // ✅ FIX: moved above useEffect
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

            // Remove mock data and show empty state on failure
            setData({
                summary: { totalLeads: 0, totalRevenue: 0 },
                charts: {
                    status: [],
                    source: [],
                    college: [],
                    location: []
                }
            })
        } finally {
            setIsLoading(false)
        }
    }, [dateRange])

    useEffect(() => {
        fetchAnalytics()
    }, [fetchAnalytics])

    if (isLoading) {
        
    // --- Mock Data for Stock-market style charts ---
    const financialData = [
        { name: 'Jan', income: 4000, expenses: 2400, goal: 5000, estimated: 4500 },
        { name: 'Feb', income: 3000, expenses: 1398, goal: 5000, estimated: 3200 },
        { name: 'Mar', income: 2000, expenses: 9800, goal: 5000, estimated: 2500 },
        { name: 'Apr', income: 2780, expenses: 3908, goal: 5000, estimated: 3000 },
        { name: 'May', income: 1890, expenses: 4800, goal: 5000, estimated: 2000 },
        { name: 'Jun', income: 2390, expenses: 3800, goal: 5000, estimated: 2500 },
        { name: 'Jul', income: 3490, expenses: 4300, goal: 5000, estimated: 3600 },
    ];
    
    if (data?.summary?.totalRevenue) {
        financialData[6].income = data.summary.totalRevenue / 10;
        financialData[6].estimated = (data.summary.totalRevenue / 10) * 1.2;
    }

    const conversionData = [
        { name: 'Week 1', contacted: 40, followUp: 24, converted: 10 },
        { name: 'Week 2', contacted: 30, followUp: 13, converted: 8 },
        { name: 'Week 3', contacted: 20, followUp: 38, converted: 15 },
        { name: 'Week 4', contacted: 27, followUp: 19, converted: 12 },
    ];

    return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

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

    
    // --- Mock Data for Stock-market style charts ---
    const financialData = [
        { name: 'Jan', income: 4000, expenses: 2400, goal: 5000, estimated: 4500 },
        { name: 'Feb', income: 3000, expenses: 1398, goal: 5000, estimated: 3200 },
        { name: 'Mar', income: 2000, expenses: 9800, goal: 5000, estimated: 2500 },
        { name: 'Apr', income: 2780, expenses: 3908, goal: 5000, estimated: 3000 },
        { name: 'May', income: 1890, expenses: 4800, goal: 5000, estimated: 2000 },
        { name: 'Jun', income: 2390, expenses: 3800, goal: 5000, estimated: 2500 },
        { name: 'Jul', income: 3490, expenses: 4300, goal: 5000, estimated: 3600 },
    ];
    
    if (data?.summary?.totalRevenue) {
        financialData[6].income = data.summary.totalRevenue / 10;
        financialData[6].estimated = (data.summary.totalRevenue / 10) * 1.2;
    }

    const conversionData = [
        { name: 'Week 1', contacted: 40, followUp: 24, converted: 10 },
        { name: 'Week 2', contacted: 30, followUp: 13, converted: 8 },
        { name: 'Week 3', contacted: 20, followUp: 38, converted: 15 },
        { name: 'Week 4', contacted: 27, followUp: 19, converted: 12 },
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Advanced Analytics</h1>
                    <p className="text-muted-foreground">Deep dive into business performance and demographics.</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="border rounded-md px-3 py-2 text-sm">
                        Last 30 Days
                    </div>
                    <Button onClick={fetchAnalytics}>
                        Refresh
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="bg-primary/5 border-primary/20">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center justify-between">
                            Total Leads <Users className="h-4 w-4 text-primary" />
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{data?.summary?.totalLeads || 0}</div>
                        <p className="text-xs text-muted-foreground mt-1">Generated this period</p>
                    </CardContent>
                </Card>

                <Card className="bg-green-500/5 border-green-500/20">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center justify-between">
                            Total Revenue <DollarSign className="h-4 w-4 text-green-500" />
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">₹{data?.summary?.totalRevenue?.toLocaleString() || 0}</div>
                        <p className="text-xs text-muted-foreground mt-1">Total revenue collected</p>
                    </CardContent>
                </Card>
            </div>


            {/* Business Growth & Finance Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Financial Performance (Income vs Expenses)</CardTitle>
                        <CardDescription>Stock-market style view of cash flow and goals</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={financialData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                                <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} contentStyle={{ borderRadius: '8px' }} />
                                <Legend />
                                <Bar dataKey="income" fill="#10b981" radius={[4, 4, 0, 0]} name="Income" />
                                <Bar dataKey="expenses" fill="#ef4444" radius={[4, 4, 0, 0]} name="Expenses" />
                                <Line type="monotone" dataKey="goal" stroke="#f59e0b" strokeWidth={2} strokeDasharray="5 5" name="Goal" />
                                <Line type="monotone" dataKey="estimated" stroke="#3b82f6" strokeWidth={3} name="Estimated Rev." />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Lead Conversion & Follow-up Rate</CardTitle>
                        <CardDescription>Pipeline efficiency over time</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={conversionData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                                <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} contentStyle={{ borderRadius: '8px' }} />
                                <Legend />
                                <Bar dataKey="contacted" fill="#8884d8" radius={[4, 4, 0, 0]} name="Contacted" />
                                <Area type="monotone" dataKey="followUp" fill="#ffc658" stroke="#ffc658" fillOpacity={0.3} name="Follow Up" />
                                <Line type="monotone" dataKey="converted" stroke="#10b981" strokeWidth={3} name="Converted" />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Lead Status Distribution</CardTitle>
                        <CardDescription>Current stage of all leads</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        {statusData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={statusData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                                    <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis fontSize={12} tickLine={false} axisLine={false} />
                                    <Tooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} contentStyle={{ borderRadius: '8px' }} />
                                    <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex h-full items-center justify-center text-muted-foreground text-sm">No data available</div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Lead Sources</CardTitle>
                        <CardDescription>Where your leads are coming from</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        {sourceData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={sourceData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={100}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {sourceData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ borderRadius: '8px' }} />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex h-full items-center justify-center text-muted-foreground text-sm">No data available</div>
                        )}
                    </CardContent>
                </Card>
                
                <Card>
                    <CardHeader>
                        <CardTitle>Top Locations</CardTitle>
                        <CardDescription>Geographic distribution of leads</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        {locationData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart layout="vertical" data={locationData.slice(0, 5)} margin={{ top: 20, right: 30, left: 40, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} horizontal={false} />
                                    <XAxis type="number" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis type="category" dataKey="name" fontSize={12} tickLine={false} axisLine={false} width={100} />
                                    <Tooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} contentStyle={{ borderRadius: '8px' }} />
                                    <Bar dataKey="value" fill="#10b981" radius={[0, 4, 4, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex h-full items-center justify-center text-muted-foreground text-sm">No data available</div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Top Colleges/Universities</CardTitle>
                        <CardDescription>Educational background of leads</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        {collegeData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={collegeData.slice(0, 5)}
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={100}
                                        dataKey="value"
                                        label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                                    >
                                        {collegeData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ borderRadius: '8px' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex h-full items-center justify-center text-muted-foreground text-sm">No data available</div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}