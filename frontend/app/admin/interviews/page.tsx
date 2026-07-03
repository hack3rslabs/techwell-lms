"use client"

import * as React from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Video, Calendar, Search, BrainCircuit } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { InterviewAnalytics } from '@/components/admin/InterviewAnalytics'

export default function InterviewsPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Interview Management</h1>
                    <p className="text-muted-foreground">Manage AI mock interviews and live schedules.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline">
                        <BrainCircuit className="mr-2 h-4 w-4" />
                        AI Settings
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Total Interviews</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">1,245</div>
                        <p className="text-xs text-muted-foreground">Lifetime mock sessions</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Scheduled Today</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">12</div>
                        <p className="text-xs text-muted-foreground">Live sessions pending</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Avg. Score</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">78%</div>
                        <p className="text-xs text-muted-foreground text-green-600">+5% this week</p>
                    </CardContent>
                </Card>
            </div>

            {/* Analytics Dashboard */}
            <InterviewAnalytics />

            <Tabs defaultValue="ai" className="w-full mt-8">
                <TabsList>
                    <TabsTrigger value="ai">AI Sessions</TabsTrigger>
                    <TabsTrigger value="live">Live Scheduling</TabsTrigger>
                </TabsList>

                <TabsContent value="ai" className="mt-6">
                    <Card>
                        <CardHeader>
                            <div className="relative max-w-sm">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input placeholder="Search student..." className="pl-9" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                                <Video className="h-12 w-12 mb-4 opacity-20" />
                                <p>Recent AI interview recordings will appear here.</p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="live">
                    <Card>
                        <CardHeader>
                            <CardTitle>Upcoming Live Interviews</CardTitle>
                            <CardDescription>Integrations with Zoom, Meet, and Teams available in Settings.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
                                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                <h3 className="text-lg font-medium">No live interviews scheduled</h3>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div >
    )
}
