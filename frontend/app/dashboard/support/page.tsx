"use client"

import * as React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Plus, Phone, Mail, FileText, Bot } from 'lucide-react'
import { format } from 'date-fns'
import api from '@/lib/api'

interface Ticket {
    id: string
    subject: string
    description: string
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
    category: 'GENERAL' | 'TECHNICAL' | 'BILLING' | 'COURSE_CONTENT'
    status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED'
    createdAt: string
}

export default function UserSupportPage() {
    const [tickets, setTickets] = React.useState<Ticket[]>([])
    const [loading, setLoading] = React.useState(true)
    const [isCreateOpen, setIsCreateOpen] = React.useState(false)

    // New Ticket Form
    const [formData, setFormData] = React.useState({
        subject: '',
        description: '',
        priority: 'MEDIUM',
        category: 'GENERAL'
    })
    const [isSubmitting, setIsSubmitting] = React.useState(false)

    React.useEffect(() => {
        fetchTickets()
    }, [])

    const fetchTickets = async () => {
        try {
            const res = await api.get('/tickets')
            setTickets(res.data)
        } catch {
            // Error handling
        } finally {
            setLoading(false)
        }
    }

    const handleCreateTicket = async () => {
        if (!formData.subject || !formData.description) return

        setIsSubmitting(true)
        try {
            await api.post('/tickets', formData)
            setIsCreateOpen(false)
            setFormData({ subject: '', description: '', priority: 'MEDIUM', category: 'GENERAL' })
            fetchTickets()
            alert('Ticket created successfully!')
        } catch {
            alert('Failed to create ticket')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="space-y-6 container mx-auto py-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Help & Support</h1>
                    <p className="text-muted-foreground">We are here to help you 24/7.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => window.open('https://wa.me/917997473473', '_blank')}>
                        <Phone className="mr-2 h-4 w-4" /> WhatsApp
                    </Button>
                    <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="mr-2 h-4 w-4" /> New Ticket
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[500px]">
                            <DialogHeader>
                                <DialogTitle>Create Support Ticket</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label>Subject</Label>
                                    <Input
                                        placeholder="Brief summary of issue"
                                        value={formData.subject}
                                        onChange={e => setFormData({ ...formData, subject: e.target.value })}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Category</Label>
                                        <Select
                                            value={formData.category}
                                            onValueChange={val => setFormData({ ...formData, category: val })}
                                        >
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="GENERAL">General</SelectItem>
                                                <SelectItem value="TECHNICAL">Technical</SelectItem>
                                                <SelectItem value="BILLING">Billing</SelectItem>
                                                <SelectItem value="COURSE_CONTENT">Course Content</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Priority</Label>
                                        <Select
                                            value={formData.priority}
                                            onValueChange={val => setFormData({ ...formData, priority: val })}
                                        >
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
                                    <Label>Description</Label>
                                    <Textarea
                                        placeholder="Describe your issue in detail..."
                                        className="h-32"
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    />
                                </div>
                                <Button className="w-full" onClick={handleCreateTicket} disabled={isSubmitting}>
                                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Submit Ticket
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-blue-50 border-blue-100 cursor-pointer hover:shadow-md transition">
                    <CardContent className="p-6 flex items-center gap-4" onClick={() => window.open('https://wa.me/917997473473', '_blank')}>
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                            <Phone className="h-5 w-5" />
                        </div>
                        <div>
                            <h3 className="font-semibold">WhatsApp Support</h3>
                            <p className="text-sm text-muted-foreground">+91 79974 73473</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-green-50 border-green-100 cursor-pointer hover:shadow-md transition">
                    <CardContent className="p-6 flex items-center gap-4" onClick={() => window.location.href = 'mailto:support@techwell.co.in'}>
                        <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                            <Mail className="h-5 w-5" />
                        </div>
                        <div>
                            <h3 className="font-semibold">Email Support</h3>
                            <p className="text-sm text-muted-foreground">support@techwell.co.in</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-purple-50 border-purple-100 cursor-pointer hover:shadow-md transition">
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                            <Bot className="h-5 w-5" />
                        </div>
                        <div>
                            <h3 className="font-semibold">AI Assistant</h3>
                            <p className="text-sm text-muted-foreground">Instant Answers (Beta)</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* My Tickets */}
            <Card>
                <CardHeader>
                    <CardTitle>My Tickets</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center p-8"><Loader2 className="animate-spin text-muted-foreground" /></div>
                    ) : tickets.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            You haven&apos;t created any support tickets yet.
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {tickets.map((ticket) => (
                                <div key={ticket.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/30 transition">
                                    <div className="flex items-start gap-4">
                                        <div className={`mt-1 p-2 rounded-full ${ticket.status === 'RESOLVED' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'}`}>
                                            <FileText className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold">{ticket.subject}</h4>
                                            <p className="text-sm text-muted-foreground line-clamp-1">{ticket.description}</p>
                                            <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                                                <span>#{ticket.id.slice(-6)}</span>
                                                <span>•</span>
                                                <span>{format(new Date(ticket.createdAt), 'MMM d, yyyy')}</span>
                                                <span>•</span>
                                                <Badge variant="outline">{ticket.status}</Badge>
                                            </div>
                                        </div>
                                    </div>
                                    {/* Link to detail view would go here */}
                                    <Button variant="ghost">View</Button>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}

interface BadgeProps {
    children: React.ReactNode
    variant?: 'outline' | 'default' | 'secondary'
    className?: string
}

function Badge({ children, className }: BadgeProps) {
    return <span className={`px-2 py-0.5 rounded text-xs font-medium border ${className}`}>{children}</span>
}
