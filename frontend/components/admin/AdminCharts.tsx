"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"

interface AdminChartsProps {
    stats: {
        users: number
        courses: number
        enrollments: number
        interviews: number
        analytics?: any
    }
}

export function AdminCharts({ stats }: AdminChartsProps) {
    // Mock data transformation or use real stats if time-series available
    // For V1 analytics, we will visualize the distribution of counts

    const data = [
        { name: "Users", total: stats.users || 0 }, // Ensure fallback
        { name: "Courses", total: stats.courses || 0 },
        { name: "Enrollments", total: stats.enrollments || 0 },
        { name: "Interviews", total: stats.interviews || 0 },
    ]


    return (
        <div className="grid grid-cols-1 gap-6">
            <Card className="col-span-4 shadow-sm">
                <CardHeader>
                    <CardTitle>Platform Distribution</CardTitle>
                </CardHeader>
                <CardContent className="pl-2">
                    <div className="h-[240px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data}>
                                <XAxis
                                    dataKey="name"
                                    stroke="#888888"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <YAxis
                                    stroke="#888888"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(value: number) => `${value}`}
                                />
                                <Tooltip
                                    cursor={{ fill: 'transparent' }}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                />
                                <Bar
                                    dataKey="total"
                                    fill="currentColor"
                                    radius={[4, 4, 0, 0]}
                                    className="fill-primary"
                                    barSize={40}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            {/* Dynamic Trend Chart from API */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-sm font-medium">Revenue Trend</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[200px]">
                            {stats.analytics?.charts?.revenueData?.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={stats.analytics.charts.revenueData}>
                                        <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                        <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value: number) => `₹${value}`} />
                                        <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                                        <Bar dataKey="revenue" fill="#22c55e" radius={[4, 4, 0, 0]} barSize={30} />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex items-center justify-center text-muted-foreground text-sm">No revenue data available</div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card className="shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-sm font-medium">Growth Metrics</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[200px] flex items-end justify-center gap-2">
                            {/* Retaining visual CSS bar for UI diversity, scaling it to real data */}
                            {[stats.analytics?.stats?.activeCourses || 10, stats.analytics?.stats?.activeBatches || 20, stats.analytics?.stats?.totalStudents || 30].map((h, i) => (
                                <div key={i} className="w-full bg-blue-100 rounded-t-sm relative group" style={{ height: '100%' }}>
                                    <div className="absolute bottom-0 w-full bg-blue-500 rounded-t-sm transition-all duration-500 group-hover:bg-blue-600" style={{ height: `${Math.min(h, 100)}%` }}></div>
                                    <div className="absolute -bottom-6 w-full text-center text-xs text-muted-foreground">
                                        {['Courses', 'Batches', 'Students'][i]}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
