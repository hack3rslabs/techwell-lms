"use client"

import { useState, useEffect } from 'react'
import { liveClassApi } from '@/lib/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Loader2, Video, Calendar, Clock } from 'lucide-react'

export default function StudentLiveClassesPage() {
    interface LiveClass {
        id: string
        platform: string
        status?: string
        title: string
        course?: { title: string }
        scheduledAt: string
        duration: number
        meetingLink?: string
    }
    const [classes, setClasses] = useState<LiveClass[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchClasses = async () => {
            try {
                const res = await liveClassApi.getAll({ upcoming: true })
                setClasses(res.data)
            } catch (error) {
                console.error(error)
            } finally {
                setIsLoading(false)
            }
        }
        fetchClasses()
    }, [])

    if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin h-8 w-8" /></div>

    return (
        <div className="container py-8 space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Your Live Classes</h1>
                <p className="text-muted-foreground">Upcoming live sessions for your enrolled courses.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {classes.length > 0 ? classes.map((cls) => (
                    <Card key={cls.id} className="flex flex-col">
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <Badge variant="secondary">{cls.platform}</Badge>
                                <Badge>{cls.status || 'SCHEDULED'}</Badge>
                            </div>
                            <CardTitle className="mt-2 line-clamp-1">{cls.title}</CardTitle>
                            <CardDescription className="line-clamp-1">{cls.course?.title}</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1 space-y-4">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Calendar className="h-4 w-4" />
                                <span>{new Date(cls.scheduledAt).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Clock className="h-4 w-4" />
                                <span>{new Date(cls.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({cls.duration} mins)</span>
                            </div>

                            <div className="pt-4 mt-auto">
                                <Button className="w-full" asChild disabled={!cls.meetingLink}>
                                    <a href={cls.meetingLink} target="_blank" rel="noopener noreferrer">
                                        <Video className="mr-2 h-4 w-4" />
                                        Join Class
                                    </a>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )) : (
                    <div className="col-span-full text-center py-12 border rounded-lg bg-muted/20">
                        <Video className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium">No Classes Scheduled</h3>
                        <p className="text-muted-foreground">You don&apos;t have any upcoming live classes for your courses.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
