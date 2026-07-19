"use client"

import { useEffect, useState } from "react"
import api from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription
} from "@/components/ui/dialog"
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select"
import { Plus, Calendar, ChevronLeft, ChevronRight, Building2, GraduationCap, MapPin, Clock, Loader2 } from "lucide-react"
import { format, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek, isSameMonth, isSameDay, isToday, addMonths, subMonths } from "date-fns"
import { useToast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"

interface DriveEvent {
    id: string
    title: string
    scheduledDate: string
    location?: string
    jobRole?: string
    status: string
    employer?: { name: string; companyName: string }
    institutes?: { institute: { name: string } }[]
}

const STATUS_COLORS: Record<string, string> = {
    UPCOMING: "bg-blue-500",
    ONGOING: "bg-green-500",
    COMPLETED: "bg-slate-400",
    CANCELLED: "bg-red-500",
}

export default function CHMSCalendarPage() {
    const { toast } = useToast()
    const [drives, setDrives] = useState<DriveEvent[]>([])
    const [loading, setLoading] = useState(true)
    const [currentMonth, setCurrentMonth] = useState(new Date())
    const [selectedDate, setSelectedDate] = useState<Date | null>(null)
    const [selectedDrives, setSelectedDrives] = useState<DriveEvent[]>([])
    const [isAddOpen, setIsAddOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [form, setForm] = useState({
        title: "", jobRole: "", location: "", scheduledDate: "", description: ""
    })

    const fetchDrives = async () => {
        try {
            const res = await api.get('/campus-drives')
            setDrives(res.data || [])
        } catch {
            setDrives([])
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { fetchDrives() }, [])

    const monthStart = startOfMonth(currentMonth)
    const monthEnd = endOfMonth(currentMonth)
    const calStart = startOfWeek(monthStart)
    const calEnd = endOfWeek(monthEnd)
    const calDays = eachDayOfInterval({ start: calStart, end: calEnd })

    const getDrivesForDay = (day: Date) =>
        drives.filter(d => d.scheduledDate && isSameDay(new Date(d.scheduledDate), day))

    const handleDayClick = (day: Date) => {
        setSelectedDate(day)
        setSelectedDrives(getDrivesForDay(day))
    }

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        try {
            await api.post('/campus-drives', {
                ...form,
                scheduledDate: form.scheduledDate ? new Date(form.scheduledDate).toISOString() : null
            })
            toast({ title: "Drive scheduled", description: "Campus drive added to calendar." })
            setIsAddOpen(false)
            setForm({ title: "", jobRole: "", location: "", scheduledDate: "", description: "" })
            fetchDrives()
        } catch {
            toast({ title: "Error", description: "Failed to create drive.", variant: "destructive" })
        } finally {
            setIsSubmitting(false)
        }
    }

    const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Hiring Calendar</h1>
                    <p className="text-muted-foreground mt-1">View and manage campus drive schedules.</p>
                </div>
                <Button onClick={() => setIsAddOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" /> Schedule Drive
                </Button>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Calendar */}
                <Card className="lg:col-span-2 shadow-sm">
                    <CardHeader className="pb-4">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-xl font-bold">
                                {format(currentMonth, 'MMMM yyyy')}
                            </CardTitle>
                            <div className="flex gap-2">
                                <Button variant="outline" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
                                    <ChevronLeft className="w-4 h-4" />
                                </Button>
                                <Button variant="outline" size="sm" onClick={() => setCurrentMonth(new Date())}>Today</Button>
                                <Button variant="outline" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
                                    <ChevronRight className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="flex items-center justify-center h-64"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
                        ) : (
                            <div className="grid grid-cols-7 gap-1">
                                {DAYS_OF_WEEK.map(d => (
                                    <div key={d} className="text-center text-xs font-semibold text-muted-foreground py-2">{d}</div>
                                ))}
                                {calDays.map(day => {
                                    const dayDrives = getDrivesForDay(day)
                                    const isSelected = selectedDate && isSameDay(day, selectedDate)
                                    return (
                                        <button
                                            key={day.toString()}
                                            onClick={() => handleDayClick(day)}
                                            className={cn(
                                                "min-h-[72px] rounded-xl p-1.5 text-left transition-all border border-transparent hover:border-primary/30 hover:bg-primary/5",
                                                !isSameMonth(day, currentMonth) && "opacity-30",
                                                isToday(day) && "bg-primary/10 border-primary/30 font-bold",
                                                isSelected && "bg-primary/20 border-primary ring-2 ring-primary/30"
                                            )}
                                        >
                                            <span className={cn(
                                                "text-xs font-medium inline-flex items-center justify-center w-6 h-6 rounded-full",
                                                isToday(day) && "bg-primary text-primary-foreground"
                                            )}>
                                                {format(day, 'd')}
                                            </span>
                                            <div className="mt-1 space-y-0.5">
                                                {dayDrives.slice(0, 2).map(d => (
                                                    <div key={d.id} className={cn(
                                                        "text-[10px] font-medium px-1.5 py-0.5 rounded text-white truncate",
                                                        STATUS_COLORS[d.status] || "bg-blue-500"
                                                    )}>
                                                        {d.title}
                                                    </div>
                                                ))}
                                                {dayDrives.length > 2 && (
                                                    <div className="text-[10px] text-muted-foreground font-medium px-1">+{dayDrives.length - 2} more</div>
                                                )}
                                            </div>
                                        </button>
                                    )
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Side Panel */}
                <div className="space-y-4">
                    <Card className="shadow-sm">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base font-semibold flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-primary" />
                                {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : 'Select a date'}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {!selectedDate ? (
                                <p className="text-sm text-muted-foreground">Click on a date to see its drives.</p>
                            ) : selectedDrives.length === 0 ? (
                                <div className="text-center py-6 text-muted-foreground">
                                    <Calendar className="w-8 h-8 mx-auto mb-2 opacity-30" />
                                    <p className="text-sm font-medium">No drives on this date</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {selectedDrives.map(d => (
                                        <div key={d.id} className="rounded-xl border p-3 space-y-2">
                                            <div className="flex items-start justify-between gap-2">
                                                <p className="font-semibold text-sm">{d.title}</p>
                                                <Badge variant="outline" className="text-xs shrink-0">{d.status}</Badge>
                                            </div>
                                            {d.jobRole && <p className="text-xs text-muted-foreground flex items-center gap-1"><Building2 className="w-3 h-3" /> {d.jobRole}</p>}
                                            {d.location && <p className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="w-3 h-3" /> {d.location}</p>}
                                            {d.scheduledDate && <p className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" /> {format(new Date(d.scheduledDate), 'hh:mm a')}</p>}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Upcoming drives */}
                    <Card className="shadow-sm">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base font-semibold">Upcoming Drives</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {drives
                                .filter(d => d.scheduledDate && new Date(d.scheduledDate) >= new Date())
                                .sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime())
                                .slice(0, 5)
                                .map(d => (
                                    <div key={d.id} className="flex items-center gap-3 py-2 border-b last:border-0">
                                        <div className={cn("w-2 h-2 rounded-full shrink-0", STATUS_COLORS[d.status] || "bg-blue-500")} />
                                        <div className="min-w-0">
                                            <p className="text-sm font-medium truncate">{d.title}</p>
                                            <p className="text-xs text-muted-foreground">{format(new Date(d.scheduledDate), 'MMM d, yyyy')}</p>
                                        </div>
                                    </div>
                                ))}
                            {drives.filter(d => d.scheduledDate && new Date(d.scheduledDate) >= new Date()).length === 0 && (
                                <p className="text-sm text-muted-foreground text-center py-4">No upcoming drives.</p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Create Drive Modal */}
            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Schedule Campus Drive</DialogTitle>
                        <DialogDescription>Add a new campus hiring event to the calendar.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreate} className="space-y-4">
                        <div className="space-y-2">
                            <Label>Drive Title *</Label>
                            <Input required value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="e.g. TCS BPS Hiring 2025" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Job Role</Label>
                                <Input value={form.jobRole} onChange={e => setForm(p => ({ ...p, jobRole: e.target.value }))} placeholder="Software Engineer" />
                            </div>
                            <div className="space-y-2">
                                <Label>Location</Label>
                                <Input value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))} placeholder="Hyderabad" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Scheduled Date & Time</Label>
                            <Input type="datetime-local" value={form.scheduledDate} onChange={e => setForm(p => ({ ...p, scheduledDate: e.target.value }))} />
                        </div>
                        <div className="space-y-2">
                            <Label>Description</Label>
                            <Textarea rows={3} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Additional details..." />
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
                            <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Saving..." : "Schedule Drive"}</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    )
}
