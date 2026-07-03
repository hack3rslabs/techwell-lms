"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"

interface AdminChartsProps {
    stats: {
        users: number
        courses: number
        enrollments: number
        interviews: number
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
                    <div className="h-[240px] min-h-[240px] min-w-0">
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

            {/* Mock Trend Chart - In real app, pass time-series data */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-sm font-medium">Revenue Trend (Last 6 Months)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[200px] flex items-end justify-center gap-2">
                            {[40, 60, 45, 70, 85, 100].map((h, i) => (
                                <div key={i} className="w-full bg-green-100 rounded-t-sm relative group">
                                    <div className="absolute bottom-0 w-full bg-green-500 rounded-t-sm transition-all duration-500 group-hover:bg-green-600" style={{ height: `${h}%` }}></div>
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground mt-2 px-1">
                            <span>Jul</span><span>Aug</span><span>Sep</span><span>Oct</span><span>Nov</span><span>Dec</span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-sm font-medium">User Growth</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[200px] flex items-end justify-center gap-2">
                            {[20, 35, 40, 50, 75, 90].map((h, i) => (
                                <div key={i} className="w-full bg-blue-100 rounded-t-sm relative group">
                                    <div className="absolute bottom-0 w-full bg-blue-500 rounded-t-sm transition-all duration-500 group-hover:bg-blue-600" style={{ height: `${h}%` }}></div>
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground mt-2 px-1">
                            <span>Jul</span><span>Aug</span><span>Sep</span><span>Oct</span><span>Nov</span><span>Dec</span>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
