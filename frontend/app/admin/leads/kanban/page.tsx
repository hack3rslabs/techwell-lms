"use client"

import * as React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Phone, Calendar, User, FileText, ChevronRight, ChevronLeft, Plus, Loader2, ArrowLeft, RefreshCw, MessageSquare } from 'lucide-react'
import Link from 'next/link'
import api from '@/lib/api'
import { toast } from 'sonner'
import { format } from 'date-fns'

const STAGES = [
    { id: 'NEW', label: 'New Lead', color: 'bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-950/20 dark:border-indigo-900/50' },
    { id: 'CONTACTED', label: 'Contacted', color: 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-950/20 dark:border-blue-900/50' },
    { id: 'FOLLOW_UP_SCHEDULED', label: 'Follow-Up Scheduled', color: 'bg-yellow-50 border-yellow-200 text-yellow-700 dark:bg-yellow-950/20 dark:border-yellow-900/50' },
    { id: 'INTERESTED', label: 'Interested', color: 'bg-teal-50 border-teal-200 text-teal-700 dark:bg-teal-950/20 dark:border-teal-900/50' },
    { id: 'COUNSELLING_DONE', label: 'Counselling Done', color: 'bg-purple-50 border-purple-200 text-purple-700 dark:bg-purple-950/20 dark:border-purple-900/50' },
    { id: 'COURSE_ENROLLED', label: 'Course Enrolled', color: 'bg-green-50 border-green-200 text-green-700 dark:bg-green-950/20 dark:border-green-900/50' }
]

interface Lead {
    id: string
    name: string
    email: string
    phone: string
    source: string
    status: string
    college?: string
    location?: string
    qualification?: string
    notes?: string
    courseName?: string
    createdAt: string
    assignedTo?: string
}

interface ActivityLog {
    id: string
    actionType: string
    notes: string
    performedBy: string
    createdAt: string
}

interface Reminder {
    id: string
    title: string
    remindAt: string
    isCompleted: boolean
}

export default function LeadKanbanPage() {
    const [leads, setLeads] = React.useState<Lead[]>([])
    const [isLoading, setIsLoading] = React.useState(true)
    const [searchQuery, setSearchQuery] = React.useState('')
    
    // Activity / Details Dialog
    const [selectedLead, setSelectedLead] = React.useState<Lead | null>(null)
    const [activityLogs, setActivityLogs] = React.useState<ActivityLog[]>([])
    const [reminders, setReminders] = React.useState<Reminder[]>([])
    const [isLoadingDetails, setIsLoadingDetails] = React.useState(false)

    // Form inputs for Dialog
    const [actionType, setActionType] = React.useState('CALL')
    const [activityNotes, setActivityNotes] = React.useState('')
    const [reminderTitle, setReminderTitle] = React.useState('')
    const [reminderDate, setReminderDate] = React.useState('')
    const [isSavingActivity, setIsSavingActivity] = React.useState(false)
    const [isSavingReminder, setIsSavingReminder] = React.useState(false)

    const fetchLeads = async () => {
        setIsLoading(true)
        try {
            const res = await api.get('/leads')
            setLeads(res.data || [])
        } catch (err) {
            console.error('Failed to fetch leads:', err)
            toast.error('Failed to load leads directory')
        } finally {
            setIsLoading(false)
        }
    }

    React.useEffect(() => {
        fetchLeads()
    }, [])

    const handleStageChange = async (leadId: string, newStatus: string) => {
        try {
            await api.put(`/leads/${leadId}`, { status: newStatus })
            setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status: newStatus } : l))
            toast.success(`Lead stage updated to ${newStatus}`)
            
            // Log automatically if lead details dialog is open
            if (selectedLead && selectedLead.id === leadId) {
                fetchLeadDetails(leadId)
            }
        } catch (err) {
            console.error('Stage change failed:', err)
            toast.error('Failed to update stage')
        }
    }

    const fetchLeadDetails = async (leadId: string) => {
        setIsLoadingDetails(true)
        try {
            const res = await api.get(`/leads/${leadId}/activity`)
            setActivityLogs(res.data.logs || [])
            setReminders(res.data.reminders || [])
        } catch (err) {
            console.error('Failed to load lead details:', err)
        } finally {
            setIsLoadingDetails(false)
        }
    }

    const handleCardClick = (lead: Lead) => {
        setSelectedLead(lead)
        fetchLeadDetails(lead.id)
    }

    const handleAddActivity = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedLead || !activityNotes.trim()) return
        setIsSavingActivity(true)
        try {
            await api.post(`/leads/${selectedLead.id}/activity`, {
                actionType,
                notes: activityNotes
            })
            setActivityNotes('')
            toast.success('Activity logged successfully')
            fetchLeadDetails(selectedLead.id)
        } catch (err) {
            console.error('Failed to save activity:', err)
            toast.error('Failed to save activity log')
        } finally {
            setIsSavingActivity(false)
        }
    }

    const handleAddReminder = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedLead || !reminderTitle.trim() || !reminderDate) return
        setIsSavingReminder(true)
        try {
            await api.post(`/leads/${selectedLead.id}/reminder`, {
                title: reminderTitle,
                remindAt: reminderDate
            })
            setReminderTitle('')
            setReminderDate('')
            toast.success('Reminder scheduled successfully')
            fetchLeadDetails(selectedLead.id)
        } catch (err) {
            console.error('Failed to schedule reminder:', err)
            toast.error('Failed to schedule reminder')
        } finally {
            setIsSavingReminder(false)
        }
    }

    // Filter leads by search query
    const filteredLeads = leads.filter(l => 
        l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.phone?.includes(searchQuery) ||
        l.courseName?.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <div className="space-y-6 p-6 min-h-screen bg-slate-950 text-slate-50">
            {/* Header */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <div className="flex items-center gap-2 text-indigo-400 mb-1">
                        <Link href="/admin/leads" className="flex items-center gap-1 hover:underline">
                            <ArrowLeft className="h-4 w-4" /> Back to List
                        </Link>
                    </div>
                    <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-400 to-teal-400 bg-clip-text text-transparent">
                        CRM Lead Pipeline
                    </h1>
                    <p className="text-slate-400 text-sm">
                        Track counsellor actions, schedule reminders, and log candidate conversions.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <Input
                        placeholder="Search leads..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full md:w-64 bg-slate-900 border-slate-800 text-slate-100 focus:ring-indigo-500 placeholder:text-slate-500"
                    />
                    <Button variant="outline" size="icon" onClick={fetchLeads} className="border-slate-800 bg-slate-900 text-indigo-400 hover:text-indigo-300">
                        <RefreshCw className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Stages Columns container */}
            {isLoading ? (
                <div className="flex h-96 items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-4 overflow-x-auto pb-4">
                    {STAGES.map(stage => {
                        const stageLeads = filteredLeads.filter(l => l.status === stage.id)
                        return (
                            <div key={stage.id} className="flex flex-col min-w-[240px] bg-slate-900/60 border border-slate-800/80 rounded-xl p-3 h-[75vh]">
                                {/* Column Header */}
                                <div className="flex items-center justify-between mb-3 border-b border-slate-800/60 pb-2">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">{stage.label}</span>
                                        <Badge className="bg-indigo-500/10 text-indigo-300 border-indigo-500/20">{stageLeads.length}</Badge>
                                    </div>
                                </div>

                                {/* Cards List */}
                                <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar">
                                    {stageLeads.length === 0 ? (
                                        <div className="h-24 flex items-center justify-center border border-dashed border-slate-800/50 rounded-lg text-slate-600 text-xs">
                                            No leads
                                        </div>
                                    ) : (
                                        stageLeads.map(lead => (
                                            <div
                                                key={lead.id}
                                                className="group bg-slate-900 border border-slate-800 hover:border-indigo-500/50 transition-all rounded-lg p-3 cursor-pointer shadow-sm relative"
                                                onClick={() => handleCardClick(lead)}
                                            >
                                                <div className="font-semibold text-slate-200 text-sm mb-1 group-hover:text-indigo-400 transition-colors">
                                                    {lead.name}
                                                </div>
                                                <div className="text-slate-400 text-xs flex items-center gap-1 mb-2">
                                                    <Phone className="h-3 w-3 text-slate-500" /> {lead.phone || 'No phone'}
                                                </div>
                                                
                                                {lead.courseName && (
                                                    <Badge className="bg-indigo-950 border-indigo-900 text-indigo-300 text-[10px] px-1.5 py-0">
                                                        {lead.courseName}
                                                    </Badge>
                                                )}

                                                {/* Card Stage Stepper */}
                                                <div className="flex justify-end gap-1 mt-3 pt-2 border-t border-slate-800/60" onClick={e => e.stopPropagation()}>
                                                    <Select
                                                        value={lead.status}
                                                        onValueChange={val => handleStageChange(lead.id, val)}
                                                    >
                                                        <SelectTrigger className="h-6 w-full text-[10px] bg-slate-950 border-slate-800 text-slate-300">
                                                            <SelectValue placeholder="Move status" />
                                                        </SelectTrigger>
                                                        <SelectContent className="bg-slate-950 border-slate-800 text-slate-200">
                                                            {STAGES.map(st => (
                                                                <SelectItem key={st.id} value={st.id} className="text-xs">
                                                                    {st.label}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}

            {/* Lead Action Drawer / Dialog */}
            <Dialog open={!!selectedLead} onOpenChange={open => !open && setSelectedLead(null)}>
                <DialogContent className="max-w-xl bg-slate-900 border-slate-800 text-slate-100">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold flex items-center gap-2 text-indigo-400">
                            {selectedLead?.name}
                        </DialogTitle>
                        <DialogDescription className="text-slate-400 text-xs">
                            Manage candidate status, add caller activity notes, and schedule counselor follow-ups.
                        </DialogDescription>
                    </DialogHeader>

                    {selectedLead && (
                        <Tabs defaultValue="activity" className="w-full mt-2">
                            <TabsList className="grid w-full grid-cols-2 bg-slate-950 border border-slate-800">
                                <TabsTrigger value="activity" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white">Activity Logs</TabsTrigger>
                                <TabsTrigger value="reminder" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white">Reminders</TabsTrigger>
                            </TabsList>

                            {/* Tab 1: Log Activity */}
                            <TabsContent value="activity" className="space-y-4 pt-4">
                                <form onSubmit={handleAddActivity} className="space-y-3">
                                    <div className="flex gap-2">
                                        <div className="w-1/3">
                                            <Select value={actionType} onValueChange={setActionType}>
                                                <SelectTrigger className="bg-slate-950 border-slate-800 text-slate-100">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent className="bg-slate-950 border-slate-800 text-slate-100">
                                                    <SelectItem value="CALL">Call Log</SelectItem>
                                                    <SelectItem value="WHATSAPP">WhatsApp</SelectItem>
                                                    <SelectItem value="NOTE">Counselling Note</SelectItem>
                                                    <SelectItem value="FOLLOW_UP_SCHEDULED">Scheduled follow-up</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="flex-1">
                                            <Input
                                                placeholder="Write logs (e.g. Discussed cloud pricing, wants DevOps)"
                                                value={activityNotes}
                                                onChange={e => setActivityNotes(e.target.value)}
                                                className="bg-slate-950 border-slate-800 text-slate-100"
                                                required
                                            />
                                        </div>
                                        <Button type="submit" disabled={isSavingActivity} className="bg-indigo-600 hover:bg-indigo-500 text-white">
                                            {isSavingActivity ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Log'}
                                        </Button>
                                    </div>
                                </form>

                                {/* Activity Logs List */}
                                <div className="border border-slate-800/80 rounded-lg p-3 bg-slate-950 max-h-48 overflow-y-auto space-y-3 custom-scrollbar">
                                    {isLoadingDetails ? (
                                        <div className="flex justify-center p-4">
                                            <Loader2 className="h-5 w-5 animate-spin text-slate-500" />
                                        </div>
                                    ) : activityLogs.length === 0 ? (
                                        <div className="text-center text-slate-500 text-xs py-4">No logged activity logs yet.</div>
                                    ) : (
                                        activityLogs.map(log => (
                                            <div key={log.id} className="text-xs border-b border-slate-800/60 pb-2 last:border-0 last:pb-0">
                                                <div className="flex justify-between text-slate-400 mb-1">
                                                    <span className="font-semibold text-indigo-400">{log.actionType}</span>
                                                    <span>{format(new Date(log.createdAt), 'MMM dd, yyyy h:mm a')}</span>
                                                </div>
                                                <p className="text-slate-200">{log.notes}</p>
                                                <div className="text-[10px] text-slate-500 mt-1">Performed by: {log.performedBy}</div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </TabsContent>

                            {/* Tab 2: Reminders */}
                            <TabsContent value="reminder" className="space-y-4 pt-4">
                                <form onSubmit={handleAddReminder} className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                    <div className="md:col-span-2">
                                        <Input
                                            placeholder="Reminder title (e.g. Call back at 5 PM)"
                                            value={reminderTitle}
                                            onChange={e => setReminderTitle(e.target.value)}
                                            className="bg-slate-950 border-slate-800 text-slate-100"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <Input
                                            type="datetime-local"
                                            value={reminderDate}
                                            onChange={e => setReminderDate(e.target.value)}
                                            className="bg-slate-950 border-slate-800 text-slate-100"
                                            required
                                        />
                                    </div>
                                    <div className="md:col-span-3 flex justify-end">
                                        <Button type="submit" disabled={isSavingReminder} className="bg-teal-600 hover:bg-teal-500 text-white w-full md:w-auto">
                                            {isSavingReminder ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Schedule'}
                                        </Button>
                                    </div>
                                </form>

                                {/* Reminders List */}
                                <div className="border border-slate-800/80 rounded-lg p-3 bg-slate-950 max-h-48 overflow-y-auto space-y-3 custom-scrollbar">
                                    {isLoadingDetails ? (
                                        <div className="flex justify-center p-4">
                                            <Loader2 className="h-5 w-5 animate-spin text-slate-500" />
                                        </div>
                                    ) : reminders.length === 0 ? (
                                        <div className="text-center text-slate-500 text-xs py-4">No follow-up reminders scheduled.</div>
                                    ) : (
                                        reminders.map(rem => (
                                            <div key={rem.id} className="flex justify-between items-center text-xs border-b border-slate-800/60 pb-2 last:border-0 last:pb-0">
                                                <div>
                                                    <p className="font-medium text-slate-200">{rem.title}</p>
                                                    <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                                                        <Calendar className="h-3 w-3 text-slate-500" /> {format(new Date(rem.remindAt), 'MMM dd, yyyy h:mm a')}
                                                    </span>
                                                </div>
                                                <Badge className={rem.isCompleted ? 'bg-green-500/10 text-green-300' : 'bg-yellow-500/10 text-yellow-300'}>
                                                    {rem.isCompleted ? 'Completed' : 'Pending'}
                                                </Badge>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </TabsContent>
                        </Tabs>
                    )}

                    <DialogFooter>
                        <Button onClick={() => setSelectedLead(null)} className="bg-slate-800 hover:bg-slate-700 text-slate-300 border-0">
                            Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
