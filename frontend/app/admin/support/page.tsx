"use client"

import * as React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, MessageSquare, Paperclip, Send, Lock } from 'lucide-react'
import { format } from 'date-fns'
import api, { ticketApi } from '@/lib/api'
import { useAuth } from '@/lib/auth-context'

// Types
interface Ticket {
    id: string
    subject: string
    description: string
    status: 'OPEN' | 'IN_PROGRESS' | 'WAITING_FOR_USER' | 'RESOLVED' | 'CLOSED'
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
    category: string
    createdAt: string
    user: {
        name: string
        email: string
        role: string
    }
    _count: {
        messages: number
    }
}

interface Message {
    id: string
    message: string
    attachmentUrl?: string
    isStaffReply: boolean
    createdAt: string
}

export default function AdminSupportPage() {
    interface StaffUser {
        id: string
        name: string
        role: string
    }
    const [staffList, setStaffList] = React.useState<StaffUser[]>([])
    const [internalNotes, setInternalNotes] = React.useState('')
    const [activeTab, setActiveTab] = React.useState('conversation')

    const { user } = useAuth()
    const [file, setFile] = React.useState<File | null>(null)

    const [tickets, setTickets] = React.useState<Ticket[]>([])
    const [selectedTicket, setSelectedTicket] = React.useState<Ticket | null>(null)
    const [messages, setMessages] = React.useState<Message[]>([])
    const [isLoading, setIsLoading] = React.useState(true)
    const [isLoadingMessages, setIsLoadingMessages] = React.useState(false)
    const [filterStatus, setFilterStatus] = React.useState('ALL')
    const [filterPriority, setFilterPriority] = React.useState('ALL')
    const [replyText, setReplyText] = React.useState('')
    const [isSending, setIsSending] = React.useState(false)

    // Fetch Tickets & Staff
    React.useEffect(() => {
        fetchTickets()
        fetchStaff()
    }, [filterStatus, filterPriority])

    // Fetch Messages when ticket selected
    React.useEffect(() => {
        if (selectedTicket) {
            fetchMessages(selectedTicket.id)
        }
    }, [selectedTicket])

    const fetchTickets = async () => {
        setIsLoading(true)
        try {
            const params: Record<string, string> = {}
            if (filterStatus !== 'ALL') params.status = filterStatus
            if (filterPriority !== 'ALL') params.priority = filterPriority

            const res = await ticketApi.getAll(params)
            setTickets(res.data)
        } catch (error) {
            console.error(error)
        } finally {
            setIsLoading(false)
        }
    }

    const fetchMessages = async (ticketId: string) => {
        setIsLoadingMessages(true)
        try {
            const res = await api.get(`/tickets/${ticketId}`)
            setMessages(res.data.messages)
        } catch (error) {
            console.error(error)
        } finally {
            setIsLoadingMessages(false)
        }
    }

    const fetchStaff = async () => {
        try {
            const res = await api.get('/users?role=STAFF,ADMIN,INSTRUCTOR')
            if (res.data.users) {
                setStaffList(res.data.users.filter((u: { role: string }) => ['ADMIN', 'SUPER_ADMIN', 'STAFF', 'INSTRUCTOR'].includes(u.role)))
            }
        } catch (error) {
            console.error("Failed to fetch staff", error)
        }
    }

    const handleAssign = async (staffId: string) => {
        if (!selectedTicket) return
        try {
            await api.patch(`/tickets/${selectedTicket.id}/assign`, { assignedTo: staffId })
            setSelectedTicket({ ...selectedTicket, assignedTo: staffId } as Ticket & { assignedTo: string })
            fetchTickets()
        } catch (error) {
            console.error(error)
        }
    }

    const handleSaveNotes = async () => {
        if (!selectedTicket) return
        try {
            await api.patch(`/tickets/${selectedTicket.id}/assign`, { internalNotes })
            alert("Notes saved")
        } catch (error) {
            console.error(error)
        }
    }

    const handleSendReply = async () => {
        if (!selectedTicket || !replyText.trim()) return

        setIsSending(true)
        try {
            const formData = new FormData()
            formData.append('message', replyText)
            if (file) {
                formData.append('attachment', file)
            }

            await ticketApi.reply(selectedTicket.id, formData)

            // Refresh messages and ticket list
            await fetchMessages(selectedTicket.id)
            setReplyText('')
            setFile(null)
            fetchTickets()
        } catch (error) {
            console.error(error)
            alert('Failed to send reply')
        } finally {
            setIsSending(false)
        }
    }

    const handleStatusUpdate = async (newStatus: string) => {
        if (!selectedTicket) return
        try {
            await ticketApi.updateStatus(selectedTicket.id, { status: newStatus })
            setSelectedTicket({ ...selectedTicket, status: newStatus as Ticket['status'] })
            fetchTickets()
        } catch (error) {
            console.error(error)
            alert('Failed to update status')
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'OPEN': return 'bg-yellow-100 text-yellow-800'
            case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800'
            case 'WAITING_FOR_USER': return 'bg-purple-100 text-purple-800'
            case 'RESOLVED': return 'bg-green-100 text-green-800'
            case 'CLOSED': return 'bg-gray-100 text-gray-800'
            default: return 'bg-gray-100'
        }
    }

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'URGENT': return 'text-red-600 font-bold'
            case 'HIGH': return 'text-orange-500 font-semibold'
            default: return 'text-muted-foreground'
        }
    }

    return (
        <div className="flex h-[calc(100vh-6rem)] gap-6">
            {/* Ticket List (Left Panel) */}
            <div className="w-1/3 flex flex-col gap-4 border-r pr-6">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight mb-2">Support Tickets</h2>
                    <div className="flex gap-2 flex-col lg:flex-row">
                        <Select value={filterStatus} onValueChange={setFilterStatus}>
                            <SelectTrigger>
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">All Status</SelectItem>
                                <SelectItem value="OPEN">Open</SelectItem>
                                <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                                <SelectItem value="WAITING_FOR_USER">Waiting for User</SelectItem>
                                <SelectItem value="RESOLVED">Resolved</SelectItem>
                                <SelectItem value="CLOSED">Closed</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={filterPriority} onValueChange={setFilterPriority}>
                            <SelectTrigger>
                                <SelectValue placeholder="Priority" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">All Priority</SelectItem>
                                <SelectItem value="URGENT">Urgent</SelectItem>
                                <SelectItem value="HIGH">High</SelectItem>
                                <SelectItem value="MEDIUM">Medium</SelectItem>
                                <SelectItem value="LOW">Low</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <ScrollArea className="flex-1">
                    <div className="space-y-3">
                        {isLoading ? (
                            <div className="flex justify-center p-4"><Loader2 className="animate-spin text-muted-foreground" /></div>
                        ) : tickets.length === 0 ? (
                            <div className="text-center text-muted-foreground p-8">No tickets found.</div>
                        ) : (
                            tickets.map(ticket => (
                                <Card
                                    key={ticket.id}
                                    className={`cursor-pointer transition-colors hover:bg-muted/50 ${selectedTicket?.id === ticket.id ? 'border-primary bg-primary/5' : ''}`}
                                    onClick={() => setSelectedTicket(ticket)}
                                >
                                    <CardContent className="p-4 space-y-2">
                                        <div className="flex justify-between items-start">
                                            <Badge variant="outline" className={getStatusColor(ticket.status)}>
                                                {ticket.status.replace('_', ' ')}
                                            </Badge>
                                            <span className="text-xs text-muted-foreground">
                                                {format(new Date(ticket.createdAt), 'MMM d, h:mm a')}
                                            </span>
                                        </div>
                                        <h4 className="font-semibold line-clamp-1">{ticket.subject}</h4>
                                        <div className="flex justify-between items-center text-sm text-muted-foreground">
                                            <span className="flex items-center gap-1">
                                                <MessageSquare className="h-3 w-3" />
                                                {ticket._count.messages}
                                            </span>
                                            <span className={getPriorityColor(ticket.priority)}>
                                                {ticket.priority}
                                            </span>
                                        </div>
                                        <div className="text-xs pt-1 border-t mt-2">
                                            {ticket.user.name} ({ticket.user.role})
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </div>
                </ScrollArea>
            </div>

            {/* Right Panel */}
            <div className="flex-1 flex flex-col bg-muted/20 rounded-lg border overflow-hidden">
                {selectedTicket ? (
                    <>
                        {/* Header */}
                        <div className="p-4 border-b bg-background flex justify-between items-center">
                            <div>
                                <h3 className="font-bold text-lg">{selectedTicket.subject}</h3>
                                <p className="text-sm text-muted-foreground">
                                    Ticket #{selectedTicket.id.slice(-6)} • {selectedTicket.category}
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <Select onValueChange={handleAssign} value={(selectedTicket as Ticket & { assignedTo?: string }).assignedTo || ''}>
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder="Assign to..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="unassigned">Unassigned</SelectItem>
                                        {staffList.map(staff => (
                                            <SelectItem key={staff.id} value={staff.id}>{staff.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <Select
                                    value={selectedTicket.status}
                                    onValueChange={handleStatusUpdate}
                                >
                                    <SelectTrigger className="w-[160px]">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="OPEN">Open</SelectItem>
                                        <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                                        <SelectItem value="WAITING_FOR_USER">Waiting for User</SelectItem>
                                        <SelectItem value="RESOLVED">Resolved</SelectItem>
                                        <SelectItem value="CLOSED">Closed</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Tabs for Conversation vs Notes */}
                        <div className="flex border-b bg-background px-4 gap-4">
                            <button
                                className={`py-2 text-sm font-medium border-b-2 ${activeTab === 'conversation' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground'}`}
                                onClick={() => setActiveTab('conversation')}
                            >
                                Conversation
                            </button>
                            <button
                                className={`py-2 text-sm font-medium border-b-2 ${activeTab === 'notes' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground'}`}
                                onClick={() => {
                                    setActiveTab('notes')
                                    setInternalNotes((selectedTicket as Ticket & { internalNotes?: string }).internalNotes || '')
                                }}
                            >
                                Internal Notes
                            </button>
                        </div>

                        {/* Content Area */}
                        {activeTab === 'conversation' ? (
                            <>
                                <ScrollArea className="flex-1 p-4">
                                    <div className="space-y-4">
                                        {isLoadingMessages ? (
                                            <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>
                                        ) : (
                                            messages.map((msg) => (
                                                <div
                                                    key={msg.id}
                                                    className={`flex ${msg.isStaffReply ? 'justify-end' : 'justify-start'}`}
                                                >
                                                    <div
                                                        className={`max-w-[80%] rounded-lg p-3 ${msg.isStaffReply
                                                            ? 'bg-primary text-primary-foreground'
                                                            : 'bg-muted border'
                                                            }`}
                                                    >
                                                        <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                                                        {msg.attachmentUrl && (
                                                            <div className="mt-2">
                                                                <a
                                                                    href={`${process.env.NEXT_PUBLIC_API_URL}${msg.attachmentUrl}`}
                                                                    target="_blank"
                                                                    rel="noreferrer"
                                                                    className="text-xs underline flex items-center gap-1"
                                                                >
                                                                    <Paperclip className="h-3 w-3" />
                                                                    View Attachment
                                                                </a>
                                                            </div>
                                                        )}
                                                        <p className={`text-[10px] mt-1 text-right ${msg.isStaffReply ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                                                            {format(new Date(msg.createdAt), 'h:mm a')}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </ScrollArea>
                                <div className="p-4 border-t bg-background">
                                    <div className="flex gap-2 items-end">
                                        <div className="flex-1 space-y-2">
                                            <Textarea
                                                placeholder="Type your reply..."
                                                className="min-h-[60px]"
                                                value={replyText}
                                                onChange={(e) => setReplyText(e.target.value)}
                                            />
                                            <div className="flex items-center gap-2">
                                                <Input
                                                    type="file"
                                                    className="w-full text-xs"
                                                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                                                />
                                            </div>
                                        </div>
                                        <Button
                                            className="h-[60px] px-4"
                                            onClick={handleSendReply}
                                            disabled={isSending || !replyText.trim()}
                                        >
                                            {isSending ? <Loader2 className="animate-spin" /> : <Send className="h-4 w-4" />}
                                        </Button>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="flex-1 p-4 flex flex-col gap-4">
                                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-md text-sm text-yellow-800">
                                    <h4 className="font-semibold flex items-center gap-2"><Lock className="h-4 w-4" /> Confidential</h4>
                                    <p>These notes are only visible to staff members.</p>
                                </div>
                                <Textarea
                                    className="flex-1 resize-none"
                                    placeholder="Add internal notes about this ticket..."
                                    value={internalNotes}
                                    onChange={(e) => setInternalNotes(e.target.value)}
                                />
                                <div className="flex justify-end">
                                    <Button onClick={handleSaveNotes}>Save Notes</Button>
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-muted-foreground flex-col gap-2">
                        <MessageSquare className="h-12 w-12 opacity-20" />
                        <p>Select a ticket to view conversation</p>
                    </div>
                )}
            </div>
        </div>
    )
}
