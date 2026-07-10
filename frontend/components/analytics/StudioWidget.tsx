"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend } from 'recharts'
import axios from 'axios'
import { Loader2 } from 'lucide-react'

type WidgetType = 'bar' | 'line' | 'pie' | 'kpi'
type Metric = 'leads' | 'revenue' | 'enrollments' | 'profit_loss' | 'expenses'
type Dimension = 'status' | 'source' | 'time_daily' | 'payment_method' | 'course' | 'category'

interface StudioWidgetProps {
    title: string
    type: WidgetType
    metric: Metric
    dimension: Dimension
    startDate?: Date
    endDate?: Date
    color?: string
}

const COLORS = ['#1469E2', '#78C1B5', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#10b981']

export function StudioWidget({ title, type, metric, dimension, startDate, endDate, color = '#1469E2' }: StudioWidgetProps) {
    const [data, setData] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [total, setTotal] = useState(0)

    const fetchData = async () => {
        try {
            setLoading(true)
            const params = new URLSearchParams()
            params.append('metric', metric)
            params.append('dimension', dimension)
            if (startDate) params.append('startDate', startDate.toISOString())
            if (endDate) params.append('endDate', endDate.toISOString())

            const res = await axios.get(`/api/analytics/studio?${params.toString()}`)
            const fetchedData = res.data.data || []
            
            setData(fetchedData)
            
            // Calculate total for KPI
            const sum = fetchedData.reduce((acc: number, curr: any) => acc + (Number(curr.value) || 0), 0)
            setTotal(sum)
        } catch (error) {
            console.error("Failed to fetch widget data", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [metric, dimension, startDate, endDate])

    const renderChart = () => {
        if (loading) {
            return (
                <div className="flex h-[250px] items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            )
        }

        if (!data || data.length === 0) {
            return (
                <div className="flex h-[250px] items-center justify-center text-muted-foreground">
                    No data available
                </div>
            )
        }

        if (type === 'kpi') {
            return (
                <div className="flex h-[250px] flex-col items-center justify-center">
                    <div className="text-5xl font-bold text-gray-900 dark:text-white">
                        {metric === 'revenue' ? `₹${total.toLocaleString()}` : total.toLocaleString()}
                    </div>
                </div>
            )
        }

        return (
            <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    {type === 'bar' ? (
                        <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="name" tick={{ fontSize: 12 }} angle={-45} textAnchor="end" height={60} />
                            <YAxis tick={{ fontSize: 12 }} />
                            <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                            <Bar dataKey="value" fill={color} radius={[4, 4, 0, 0]} />
                        </BarChart>
                    ) : type === 'line' ? (
                        <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="name" tick={{ fontSize: 12 }} angle={-45} textAnchor="end" height={60} />
                            <YAxis tick={{ fontSize: 12 }} />
                            <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                            <Line type="monotone" dataKey="value" stroke={color} strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                        </LineChart>
                    ) : (
                        <PieChart margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                            <Pie
                                data={data}
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                            <Legend verticalAlign="bottom" height={36} />
                        </PieChart>
                    )}
                </ResponsiveContainer>
            </div>
        )
    }

    return (
        <Card className="hover:shadow-md transition-shadow duration-200">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{title}</CardTitle>
            </CardHeader>
            <CardContent>
                {renderChart()}
            </CardContent>
        </Card>
    )
}
