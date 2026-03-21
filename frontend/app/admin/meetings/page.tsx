"use client"

import * as React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, Video, Clock, Users, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function MeetingsPage() {
    return (
        <div className="p-8 max-w-[1600px] mx-auto space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Meetings Calendar</h1>
                    <p className="text-muted-foreground mt-2">
                        Schedule and manage video meetings with leads and students
                    </p>
                </div>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Schedule Meeting
                </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card className="col-span-1">
                    <CardHeader>
                        <CardTitle className="text-sm font-medium">Upcoming Meetings</CardTitle>
                        <CardDescription>Next 7 days</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">0</div>
                    </CardContent>
                </Card>
                <Card className="col-span-1">
                    <CardHeader>
                        <CardTitle className="text-sm font-medium">Completed</CardTitle>
                        <CardDescription>This month</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">0</div>
                    </CardContent>
                </Card>
                <Card className="col-span-1">
                    <CardHeader>
                        <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
                        <CardDescription>This month</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">0h</div>
                    </CardContent>
                </Card>
            </div>

            <Card className="border-dashed bg-muted/30">
                <CardContent className="flex flex-col items-center justify-center py-24 text-center">
                    <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
                        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 mb-4">
                            <Calendar className="h-10 w-10 text-primary" />
                        </div>
                        <h2 className="text-xl font-semibold mb-2">No meetings scheduled</h2>
                        <p className="mb-6 text-muted-foreground">
                            You don't have any upcoming meetings. Integrate your calendar or schedule one manually to get started.
                        </p>
                        <div className="flex gap-4">
                            <Button variant="outline">
                                <Video className="mr-2 h-4 w-4" />
                                Connect Zoom/Meet
                            </Button>
                            <Button>
                                <Plus className="mr-2 h-4 w-4" />
                                New Meeting
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
