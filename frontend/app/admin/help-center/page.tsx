"use client"

import { useState, useEffect } from 'react'
import React from 'react'
import api from '@/lib/api'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { MessageSquare, Send, Loader2, Search } from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'

interface Message {
    id: string
    message: string
    isStaffReply: boolean
    createdAt: string
}

interface TicketType {
    id: string
    subject: string
    description: string
    status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED'
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
    category: string
    user: { name: string; email: string }
    messages: Message[]
    _count?: { messages: number }
    createdAt: string
    updatedAt: string
}

export default function HelpCenterPage() {
    const [tickets, setTickets] = useState<TicketType[]>([])
    const [selectedTicket, setSelectedTicket] = useState<TicketType | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [detailOpen, setDetailOpen] = useState(false)
    const [replyText, setReplyText] = useState('')
    const [search, setSearch] = useState('')
    const [statusFilter, setStatusFilter] = useState('')


    const fetchTickets = React.useCallback(async () => {
        setIsLoading(true)
        try {
            const params = new URLSearchParams()
            if (statusFilter) params.append('status', statusFilter)
            const res = await api.get(`/tickets?${params.toString()}`)
            setTickets(res.data || [])
        } catch {
            // Error handling
        } finally {
            setIsLoading(false)
        }
    }, [statusFilter])
    useEffect(() => {
        fetchTickets()
    }, [statusFilter, fetchTickets])

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

    const handleStatusChange = async (ticketId: string, status: string) => {
        try {
            await api.put(`/tickets/${ticketId}/status`, { status })
            toast.success('Status updated')
            fetchTickets()
            if (selectedTicket?.id === ticketId) {
                setSelectedTicket({ ...selectedTicket, status: status as TicketType['status'] })
            }
        } catch {
            toast.error('Failed to update status')
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

    const getPriorityBadge = (priority: string) => {
        const styles: Record<string, string> = {
            URGENT: 'bg-red-100 text-red-700',
            HIGH: 'bg-orange-100 text-orange-700',
            MEDIUM: 'bg-blue-100 text-blue-700',
            LOW: 'bg-gray-100 text-gray-700'
        }
        return <Badge variant="outline" className={styles[priority] || styles.MEDIUM}>{priority}</Badge>
    }

    const filteredTickets = tickets.filter(t =>
        t.subject.toLowerCase().includes(search.toLowerCase()) ||
        t.user?.email?.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div className="container py-8 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Help Center</h1>
                    <p className="text-muted-foreground">Manage support tickets and user inquiries.</p>
                </div>
            </div>

            <div className="flex gap-4 items-center">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search tickets..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-40">
                        <SelectValue placeholder="All Statuses" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="">All Statuses</SelectItem>
                        <SelectItem value="OPEN">Open</SelectItem>
                        <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                        <SelectItem value="RESOLVED">Resolved</SelectItem>
                        <SelectItem value="CLOSED">Closed</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <Card>
                <CardContent className="p-0">
                    {isLoading ? (
                        <div className="flex justify-center py-12">
                            <Loader2 className="animate-spin h-8 w-8" />
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Subject</TableHead>
                                    <TableHead>User</TableHead>
                                    <TableHead>Category</TableHead>
                                    <TableHead>Priority</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Messages</TableHead>
                                    <TableHead>Last Updated</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredTickets.length > 0 ? filteredTickets.map(ticket => (
                                    <TableRow key={ticket.id} className="cursor-pointer hover:bg-muted/50" onClick={() => openTicketDetail(ticket.id)}>
                                        <TableCell className="font-medium max-w-xs truncate">{ticket.subject}</TableCell>
                                        <TableCell>
                                            <div className="text-sm">
                                                <p>{ticket.user?.name}</p>
                                                <p className="text-muted-foreground text-xs">{ticket.user?.email}</p>
                                            </div>
                                        </TableCell>
                                        <TableCell>{ticket.category}</TableCell>
                                        <TableCell>{getPriorityBadge(ticket.priority)}</TableCell>
                                        <TableCell>{getStatusBadge(ticket.status)}</TableCell>
                                        <TableCell>
                                            <span className="flex items-center gap-1">
                                                <MessageSquare className="h-3 w-3" />
                                                {ticket._count?.messages || 0}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground text-sm">
                                            {format(new Date(ticket.updatedAt), 'MMM d, h:mm a')}
                                        </TableCell>
                                        <TableCell className="text-right" onClick={e => e.stopPropagation()}>
                                            <Select value={ticket.status} onValueChange={v => handleStatusChange(ticket.id, v)}>
                                                <SelectTrigger className="w-32 h-8">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="OPEN">Open</SelectItem>
                                                    <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                                                    <SelectItem value="RESOLVED">Resolved</SelectItem>
                                                    <SelectItem value="CLOSED">Closed</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </TableCell>
                                    </TableRow>
                                )) : (
                                    <TableRow>
                                        <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                                            No tickets found.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {/* Ticket Detail Modal */}
            <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
                <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
                    <DialogHeader>
                        <DialogTitle className="flex items-center justify-between pr-8">
                            <span className="truncate max-w-md">{selectedTicket?.subject}</span>
                            {selectedTicket && getStatusBadge(selectedTicket.status)}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="flex gap-4 text-sm text-muted-foreground mb-4">
                        <span>From: {selectedTicket?.user?.name}</span>
                        <span>•</span>
                        <span>Category: {selectedTicket?.category}</span>
                        <span>•</span>
                        <span>Priority: {selectedTicket?.priority}</span>
                    </div>

                    <ScrollArea className="flex-1 pr-4 max-h-[400px]">
                        <div className="space-y-4">
                            {selectedTicket?.messages?.map((msg, idx) => (
                                <div key={msg.id || idx} className={`flex gap-3 ${msg.isStaffReply ? 'flex-row-reverse' : ''}`}>
                                    <Avatar className="h-8 w-8">
                                        <AvatarFallback>{msg.isStaffReply ? 'S' : selectedTicket?.user?.name?.[0]}</AvatarFallback>
                                    </Avatar>
                                    <div className={`flex-1 p-3 rounded-lg ${msg.isStaffReply ? 'bg-primary/10 text-right' : 'bg-muted'}`}>
                                        <p className="text-sm">{msg.message}</p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {format(new Date(msg.createdAt), 'MMM d, h:mm a')}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>

                    <div className="pt-4 border-t flex gap-2">
                        <Textarea
                            placeholder="Write a reply..."
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            className="min-h-[80px]"
                        />
                    </div>
                    <DialogFooter>
                        <Button onClick={handleReply} disabled={!replyText.trim()}>
                            <Send className="mr-2 h-4 w-4" /> Send Reply
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
