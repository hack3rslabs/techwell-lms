"use client"

import { useState, useEffect } from 'react'
import api from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Plus, MessageSquare, Send, Loader2, Ticket, HelpCircle, Clock } from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'

interface TicketType {
    id: string
    subject: string
    description: string
    status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED'
    priority: string
    category: string
    messages: {
        id: string
        message: string
        isStaffReply: boolean
        createdAt: string
    }[]
    createdAt: string
    updatedAt: string
}

export default function SupportPage() {
    const [tickets, setTickets] = useState<TicketType[]>([])
    const [selectedTicket, setSelectedTicket] = useState<TicketType | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [createOpen, setCreateOpen] = useState(false)
    const [detailOpen, setDetailOpen] = useState(false)
    const [replyText, setReplyText] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    const [newTicket, setNewTicket] = useState({
        subject: '',
        description: '',
        priority: 'MEDIUM',
        category: 'GENERAL'
    })

    async function fetchTickets() {
        setIsLoading(true)
        try {
            const res = await api.get('/tickets')
            setTickets(res.data || [])
        } catch {
            // Error handling
        } finally {
            setIsLoading(false)
        }
    }


    useEffect(() => {
        fetchTickets()
    }, [])


    const handleCreateTicket = async () => {
        if (!newTicket.subject || !newTicket.description) {
            toast.error('Please fill all required fields')
            return
        }
        setIsSubmitting(true)
        try {
            await api.post('/tickets', newTicket)
            toast.success('Ticket created successfully')
            setCreateOpen(false)
            setNewTicket({ subject: '', description: '', priority: 'MEDIUM', category: 'GENERAL' })
            fetchTickets()
        } catch {
            toast.error('Failed to create ticket')
        } finally {
            setIsSubmitting(false)
        }
    }

    const openTicketDetail = async (ticketId: string) => {
        try {
            const res = await api.get(`/tickets/${ticketId}`)
            setSelectedTicket(res.data)
            setDetailOpen(true)
        } catch {
            toast.error('Failed to load ticket')
        }
    }

    const handleReply = async () => {
        if (!selectedTicket || !replyText.trim()) return
        try {
            await api.post(`/tickets/${selectedTicket.id}/reply`, { message: replyText })
            toast.success('Reply sent')
            setReplyText('')
            openTicketDetail(selectedTicket.id)
        } catch {
            toast.error('Failed to send reply')
        }
    }

    const getStatusBadge = (status: string) => {
        const styles: Record<string, string> = {
            OPEN: 'bg-yellow-100 text-yellow-700',
            IN_PROGRESS: 'bg-blue-100 text-blue-700',
            RESOLVED: 'bg-green-100 text-green-700',
            CLOSED: 'bg-gray-100 text-gray-700'
        }
        return <Badge className={styles[status] || styles.OPEN}>{status.replace('_', ' ')}</Badge>
    }

    return (
        <div className="container py-8 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Support Center</h1>
                    <p className="text-muted-foreground">Get help with your account or report issues.</p>
                </div>
                <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> New Ticket
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg">
                        <DialogHeader>
                            <DialogTitle>Create Support Ticket</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Subject *</label>
                                <Input
                                    value={newTicket.subject}
                                    onChange={e => setNewTicket({ ...newTicket, subject: e.target.value })}
                                    placeholder="Brief summary of your issue"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Category</label>
                                    <Select value={newTicket.category} onValueChange={v => setNewTicket({ ...newTicket, category: v })}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="GENERAL">General</SelectItem>
                                            <SelectItem value="TECHNICAL">Technical Issue</SelectItem>
                                            <SelectItem value="BILLING">Billing</SelectItem>
                                            <SelectItem value="COURSE_CONTENT">Course Content</SelectItem>
                                            <SelectItem value="FEATURE_REQUEST">Feature Request</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Priority</label>
                                    <Select value={newTicket.priority} onValueChange={v => setNewTicket({ ...newTicket, priority: v })}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="LOW">Low</SelectItem>
                                            <SelectItem value="MEDIUM">Medium</SelectItem>
                                            <SelectItem value="HIGH">High</SelectItem>
                                            <SelectItem value="URGENT">Urgent</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Description *</label>
                                <Textarea
                                    value={newTicket.description}
                                    onChange={e => setNewTicket({ ...newTicket, description: e.target.value })}
                                    placeholder="Describe your issue in detail..."
                                    className="min-h-[120px]"
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button onClick={handleCreateTicket} disabled={isSubmitting}>
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Submit Ticket
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {isLoading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="animate-spin h-8 w-8" />
                </div>
            ) : tickets.length === 0 ? (
                <Card>
                    <CardContent className="text-center py-12">
                        <HelpCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                        <h3 className="font-semibold text-lg mb-2">No Tickets Yet</h3>
                        <p className="text-muted-foreground mb-4">You havent created any support tickets.</p>
                        <Button onClick={() => setCreateOpen(true)}>Create Your First Ticket</Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4">
                    {tickets.map(ticket => (
                        <Card key={ticket.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => openTicketDetail(ticket.id)}>
                            <CardContent className="py-4">
                                <div className="flex justify-between items-start">
                                    <div className="space-y-1">
                                        <h3 className="font-semibold">{ticket.subject}</h3>
                                        <p className="text-sm text-muted-foreground line-clamp-1">{ticket.description}</p>
                                        <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2">
                                            <span className="flex items-center gap-1">
                                                <Ticket className="h-3 w-3" /> {ticket.category}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Clock className="h-3 w-3" /> {format(new Date(ticket.updatedAt), 'MMM d, yyyy')}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        {getStatusBadge(ticket.status)}
                                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                                            <MessageSquare className="h-3 w-3" /> {ticket.messages?.length || 0} messages
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Ticket Detail Modal */}
            <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
                    <DialogHeader>
                        <DialogTitle className="flex items-center justify-between pr-8">
                            <span className="truncate max-w-md">{selectedTicket?.subject}</span>
                            {selectedTicket && getStatusBadge(selectedTicket.status)}
                        </DialogTitle>
                    </DialogHeader>

                    <ScrollArea className="flex-1 pr-4 max-h-[400px]">
                        <div className="space-y-4">
                            {selectedTicket?.messages?.map((msg, idx) => (
                                <div key={msg.id || idx} className={`flex gap-3 ${msg.isStaffReply ? 'flex-row-reverse' : ''}`}>
                                    <Avatar className="h-8 w-8">
                                        <AvatarFallback>{msg.isStaffReply ? 'S' : 'Y'}</AvatarFallback>
                                    </Avatar>
                                    <div className={`flex-1 p-3 rounded-lg max-w-[80%] ${msg.isStaffReply ? 'bg-primary/10 ml-auto' : 'bg-muted'}`}>
                                        <p className="text-sm">{msg.message}</p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {format(new Date(msg.createdAt), 'MMM d, h:mm a')}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>

                    {selectedTicket?.status !== 'CLOSED' && (
                        <div className="pt-4 border-t flex gap-2">
                            <Textarea
                                placeholder="Write a reply..."
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                className="min-h-[60px]"
                            />
                            <Button size="icon" className="shrink-0" onClick={handleReply} disabled={!replyText.trim()}>
                                <Send className="h-4 w-4" />
                            </Button>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}
