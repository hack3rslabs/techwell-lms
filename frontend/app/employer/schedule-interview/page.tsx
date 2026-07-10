"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import api from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { Calendar as CalendarIcon, Clock, Link as LinkIcon, User } from "lucide-react"
import { cn } from "@/lib/utils"

interface Application {
    applicant?: {
        name: string
    }
    externalName?: string
    job?: {
        title: string
    }
}

export default function ScheduleInterviewPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const appId = searchParams.get('appId')

    const [application, setApplication] = useState<Application | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const [formData, setFormData] = useState({
        roundName: '',
        type: 'TECHNICAL',
        date: undefined as Date | undefined,
        time: '10:00',
        duration: '30',
        meetingLink: '',
        interviewerId: ''
    })

    async function fetchApplication() {
        try {
            const res = await api.get(`/ats/applications/detail/${appId}`)
            setApplication(res.data)
            // Default round name based on existing interviews count? 
            // For now simple default
            setFormData(prev => ({ ...prev, roundName: 'Technical Round 1' }))
        } catch (error) {
            console.error(error)
            alert("Failed to load application details")
        } finally {
            setIsLoading(false)
        }
    }


    useEffect(() => {
        if (appId) fetchApplication()
    }, [appId])


    const handleSubmit = async () => {
        if (!formData.date || !formData.time || !formData.roundName) {
            alert("Please fill all required fields")
            return
        }

        setIsSubmitting(true)
        try {
            // Combine Date and Time
            const scheduledAt = new Date(formData.date)
            const [hours, minutes] = formData.time.split(':')
            scheduledAt.setHours(parseInt(hours), parseInt(minutes))

            await api.post('/ats/interviews', {
                applicationId: appId,
                roundName: formData.roundName,
                type: formData.type,
                scheduledAt: scheduledAt.toISOString(),
                duration: formData.duration,
                meetingLink: formData.meetingLink
            })

            alert("Interview Scheduled Successfully!")
            router.push(`/employer/dashboard/ats/candidate/${appId}`)
        } catch {
            alert("Failed to schedule interview")
        } finally {
            setIsSubmitting(false)
        }
    }

    if (!appId) return <div className="p-8">Missing Application ID</div>
    if (isLoading) return <div className="p-8">Loading...</div>

    const candidateName = application?.applicant?.name || application?.externalName
    const jobTitle = application?.job?.title

    return (
        <div className="container py-8 max-w-2xl">
            <Card>
                <CardHeader>
                    <CardTitle>Schedule Interview</CardTitle>
                    <CardDescription>
                        For <strong>{candidateName}</strong> - {jobTitle}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Label>Round Name</Label>
                        <Input
                            value={formData.roundName}
                            onChange={e => setFormData({ ...formData, roundName: e.target.value })}
                            placeholder="e.g. Technical Round 1"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Round Type</Label>
                            <Select
                                value={formData.type}
                                onValueChange={val => setFormData({ ...formData, type: val })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="SCREENING">Screening</SelectItem>
                                    <SelectItem value="TECHNICAL">Technical</SelectItem>
                                    <SelectItem value="MANAGERIAL">Managerial</SelectItem>
                                    <SelectItem value="HR">HR</SelectItem>
                                    <SelectItem value="FINAL">Final</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Duration (Minutes)</Label>
                            <Select
                                value={formData.duration}
                                onValueChange={val => setFormData({ ...formData, duration: val })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="15">15 mins</SelectItem>
                                    <SelectItem value="30">30 mins</SelectItem>
                                    <SelectItem value="45">45 mins</SelectItem>
                                    <SelectItem value="60">1 Hour</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2 flex flex-col">
                            <Label className="mb-2">Date</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant={"outline"}
                                        className={cn(
                                            "w-full justify-start text-left font-normal",
                                            !formData.date && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {formData.date ? format(formData.date, "PPP") : <span>Pick a date</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                        mode="single"
                                        selected={formData.date}
                                        onSelect={date => setFormData({ ...formData, date })}
                                        initialFocus
                                        disabled={(date) => date < new Date()}
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                        <div className="space-y-2">
                            <Label>Time</Label>
                            <div className="relative">
                                <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    type="time"
                                    className="pl-9"
                                    value={formData.time}
                                    onChange={e => setFormData({ ...formData, time: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Meeting Link (Google Meet / Zoom)</Label>
                        <div className="relative">
                            <LinkIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                                className="pl-9"
                                placeholder="https://meet.google.com/..."
                                value={formData.meetingLink}
                                onChange={e => setFormData({ ...formData, meetingLink: e.target.value })}
                            />
                        </div>
                        <p className="text-xs text-muted-foreground">The candidate will receive this link via email.</p>
                    </div>

                    <div className="pt-4 flex justify-end gap-2">
                        <Button variant="outline" onClick={() => router.back()}>Cancel</Button>
                        <Button onClick={handleSubmit} disabled={isSubmitting}>
                            {isSubmitting ? 'Scheduling...' : 'Schedule Interview'}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
