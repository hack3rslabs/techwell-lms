"use client"

import React, { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Users, Building2, GraduationCap, Award, TrendingUp, Calendar, Loader2 } from "lucide-react"
import api from "@/lib/api"
import { useAuth } from "@/lib/auth-context"

export default function CHMSDashboardPage() {
    const { hasPermission } = useAuth()
    const [isLoading, setIsLoading] = useState(false) // Will implement real data later
    
    // Stub data for now, since we haven't built the backend analytics yet
    const kpis = [
        { label: "Active Drives", value: "12", icon: Calendar, trend: "+2 this week" },
        { label: "Partner Companies", value: "48", icon: Building2, trend: "+5 this month" },
        { label: "Partner Colleges", value: "15", icon: GraduationCap, trend: "Stable" },
        { label: "Eligible Students", value: "4,250", icon: Users, trend: "+150 this month" },
        { label: "Offers Released", value: "320", icon: Award, trend: "+45 this week" },
        { label: "Placement Rate", value: "68%", icon: TrendingUp, trend: "+5% from last year" },
    ]

    if (!hasPermission("USERS")) {
        return <div className="p-8 text-destructive">Unauthorized access.</div>
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Campus Hiring Dashboard</h1>
                <p className="text-muted-foreground">Overview of all placement activities, drives, and student metrics.</p>
            </div>

            {isLoading ? (
                <div className="flex h-64 items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : (
                <>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {kpis.map((kpi, i) => (
                            <Card key={i}>
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-sm font-medium text-muted-foreground">
                                        {kpi.label}
                                    </CardTitle>
                                    <kpi.icon className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{kpi.value}</div>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {kpi.trend}
                                    </p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                    
                    <div className="grid gap-4 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Upcoming Drives</CardTitle>
                                <CardDescription>Campus drives scheduled for the next 14 days</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-col items-center justify-center h-48 text-muted-foreground border-2 border-dashed rounded-lg">
                                    No upcoming drives found.
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Recent Offers</CardTitle>
                                <CardDescription>Latest offer rollouts across companies</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-col items-center justify-center h-48 text-muted-foreground border-2 border-dashed rounded-lg">
                                    No recent offers.
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </>
            )}
        </div>
    )
}
