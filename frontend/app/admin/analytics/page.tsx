"use client"

import * as React from 'react'
import { useState, useEffect, useCallback } from 'react'
import { subDays } from "date-fns"
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Total Leads</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {data?.summary?.totalLeads}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Total Revenue</CardTitle>
                    </CardHeader>
                    <CardContent>
                        ₹{data?.summary?.totalRevenue?.toLocaleString()}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}