"use client"

import * as React from "react"
import { useAuth } from "@/lib/auth-context"
import api from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Loader2, Download, TrendingUp, DollarSign, Users } from "lucide-react"
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    LineChart,
    Line
} from "recharts"

export default function ReportsPage() {
    const { user, hasPermission } = useAuth()
    const [activeTab, setActiveTab] = React.useState("business")
    const [loading, setLoading] = React.useState(false)
    const [data, setData] = React.useState<Record<string, any> | null>(null)

    const fetchReport = React.useCallback(async (type: string) => {
        setLoading(true)
        try {
            let endpoint = ""
            switch (type) {
                case "business":
                    endpoint = "/reports/business-summary"
                    break
                case "sales":
                    endpoint = "/reports/sales-performance"
                    break
                case "courses":
                    endpoint = "/reports/course-performance"
                    break
                case "employer":
                    endpoint = "/reports/employer"
                    break
            }

            if (endpoint) {
                const res = await api.get(endpoint)
                setData(res.data)
            }
        } catch (error) {
            console.error("Failed to fetch report:", error)
        } finally {
            setLoading(false)
        }
    }, [])

    React.useEffect(() => {
        fetchReport(activeTab)
    }, [activeTab, fetchReport])

    const canViewFinance = user?.role === "SUPER_ADMIN" || hasPermission("VIEW_FINANCE")
    const isEmployer = user?.role === "EMPLOYER"

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Analytics & Reports</h1>
                    <p className="text-muted-foreground">
                        Data-driven insights for {user?.role === "INSTITUTE_ADMIN" ? "your institute" : "the platform"}.
                    </p>
                </div>
                <Button variant="outline">
                    <Download className="mr-2 h-4 w-4" /> Export PDF
                </Button>
            </div>

            <Tabs defaultValue="business" value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                    {canViewFinance && <TabsTrigger value="business">Business Summary</TabsTrigger>}
                    {canViewFinance && <TabsTrigger value="sales">Sales & Targets</TabsTrigger>}
                    <TabsTrigger value="courses">Course Performance</TabsTrigger>
                    {isEmployer && <TabsTrigger value="employer">Hiring Stats</TabsTrigger>}
                </TabsList>

                <div className="mt-6">
                    {loading ? (
                        <div className="h-64 flex items-center justify-center">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : (
                        <>
                            <TabsContent value="business" className="space-y-4">
                                {data && (
                                    <>
                                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                                            <Card>
                                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                                    <CardTitle className="text-sm font-medium">Total Revenue (YTD)</CardTitle>
                                                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                                                </CardHeader>
                                                <CardContent>
                                                    <div className="text-2xl font-bold">₹{data.totalRevenue?.toLocaleString()}</div>
                                                </CardContent>
                                            </Card>
                                            <Card>
                                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                                    <CardTitle className="text-sm font-medium">User Growth</CardTitle>
                                                    <Users className="h-4 w-4 text-muted-foreground" />
                                                </CardHeader>
                                                <CardContent>
                                                    <div className="text-2xl font-bold">+{data.userGrowth}</div>
                                                </CardContent>
                                            </Card>
                                            <Card>
                                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                                    <CardTitle className="text-sm font-medium">Lead Conversion</CardTitle>
                                                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                                                </CardHeader>
                                                <CardContent>
                                                    <div className="text-2xl font-bold">{data.leadConversionRate?.toFixed(1)}%</div>
                                                </CardContent>
                                            </Card>
                                        </div>

                                        <Card>
                                            <CardHeader>
                                                <CardTitle>Monthly Revenue Trend</CardTitle>
                                            </CardHeader>
                                            <CardContent className="h-[300px]">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <BarChart data={data.monthlyRevenue}>
                                                        <CartesianGrid strokeDasharray="3 3" />
                                                        <XAxis dataKey="month" />
                                                        <YAxis />
                                                        <Tooltip />
                                                        <Bar dataKey="amount" fill="#8884d8" name="Revenue" />
                                                    </BarChart>
                                                </ResponsiveContainer>
                                            </CardContent>
                                        </Card>
                                    </>
                                )}
                            </TabsContent>

                            <TabsContent value="sales" className="space-y-4">
                                {data && (
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <Card>
                                            <CardHeader>
                                                <CardTitle>Sales vs Target ({data.period})</CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="text-center py-8">
                                                    <div className="text-5xl font-bold text-primary mb-2">
                                                        {data.percentage?.toFixed(1)}%
                                                    </div>
                                                    <p className="text-muted-foreground">of ₹{data.target?.toLocaleString()} Target</p>
                                                    <div className="mt-4 inline-block px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-sm font-medium">
                                                        {data.status}
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                )}
                            </TabsContent>

                            <TabsContent value="courses" className="space-y-4">
                                {data && Array.isArray(data) && (
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Top Performing Courses</CardTitle>
                                        </CardHeader>
                                        <CardContent className="h-[400px]">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart data={data} layout="vertical" margin={{ left: 50 }}>
                                                    <CartesianGrid strokeDasharray="3 3" />
                                                    <XAxis type="number" />
                                                    <YAxis dataKey="title" type="category" width={150} tick={{ fontSize: 12 }} />
                                                    <Tooltip />
                                                    <Legend />
                                                    <Bar dataKey="enrollments" fill="#82ca9d" name="Enrollments" />
                                                    <Bar dataKey="estimatedRevenue" fill="#8884d8" name="Est. Revenue" />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </CardContent>
                                    </Card>
                                )}
                            </TabsContent>
                        </>
                    )}
                </div>
            </Tabs>
        </div>
    )
}
