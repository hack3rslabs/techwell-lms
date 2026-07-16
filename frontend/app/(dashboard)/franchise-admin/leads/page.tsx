'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Plus, Search, Loader2, Phone, User, Calendar, MessageSquare, History, Upload, Download, Mail } from 'lucide-react'
import { toast } from 'sonner'
import { api } from '@/lib/api'
import { format } from 'date-fns'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"

interface Lead {
    id: string
    name: string
    email: string
    phone: string
    courseName: string
    status: string
    source: string
    createdAt: string
    notes: string
    qualification: string
    college: string
    location: string
    assignedTo: string
}

export default function FranchiseLeadsPage() {
    const [leads, setLeads] = React.useState<Lead[]>([])
    const [staffUsers, setStaffUsers] = React.useState<{id: string, name: string}[]>([])
    const [isLoading, setIsLoading] = React.useState(true)
    const [searchQuery, setSearchQuery] = React.useState('')
    const [filters, setFilters] = React.useState({
        status: 'ALL',
        source: 'ALL',
    })

    const [isAddModalOpen, setIsAddModalOpen] = React.useState(false)
    const [isSavingLead, setIsSavingLead] = React.useState(false)
    const [newLead, setNewLead] = React.useState({
        name: '', email: '', phone: '', courseName: '',
        source: 'FRANCHISE_WALKIN', qualification: '', college: '', location: '', notes: '',
        assignedTo: 'UNASSIGNED'
    })

    const fetchLeads = React.useCallback(async () => {
        try {
            setIsLoading(true)
            const params = new URLSearchParams()
            if (filters.status !== 'ALL') params.append('status', filters.status)
            if (filters.source !== 'ALL') params.append('source', filters.source)
            if (searchQuery) {
                params.append('name', searchQuery)
            }
            
            // Backend automatically scopes leads to the Franchise Admin's franchiseId
            const res = await api.get(`/leads?${params.toString()}`)
            setLeads(res.data || [])
        } catch (error) {
            console.error('Failed to fetch leads', error)
            toast.error('Failed to load leads')
        } finally {
            setIsLoading(false)
        }
    }, [filters, searchQuery])

    React.useEffect(() => {
        fetchLeads()
    }, [fetchLeads])

    React.useEffect(() => {
        const fetchStaff = async () => {
            try {
                // Fetch staff belonging to this franchise (requires backend support or just fetch all allowed)
                const res = await api.get('/users?role=STAFF,FRANCHISE_ADMIN')
                setStaffUsers(res.data.users || res.data || [])
            } catch (e) {
                console.error('Failed to fetch staff', e)
            }
        }
        fetchStaff()
    }, [])

    const handleAddLead = async () => {
        if (!newLead.name || !newLead.phone) {
            toast.error('Name and Phone are required')
            return
        }
        try {
            setIsSavingLead(true)
            const payload = { ...newLead }
            if (payload.assignedTo === 'UNASSIGNED') delete (payload as any).assignedTo
            
            await api.post('/leads', payload)
            toast.success('Lead added successfully')
            setIsAddModalOpen(false)
            fetchLeads()
            setNewLead({
                name: '', email: '', phone: '', courseName: '',
                source: 'FRANCHISE_WALKIN', qualification: '', college: '', location: '', notes: '',
                assignedTo: 'UNASSIGNED'
            })
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Failed to save lead')
        } finally {
            setIsSavingLead(false)
        }
    }

    const handleStatusChange = async (leadId: string, newStatus: string) => {
        try {
            await api.put(`/leads/${leadId}`, { status: newStatus })
            toast.success('Status updated')
            setLeads(leads.map(l => l.id === leadId ? { ...l, status: newStatus } : l))
        } catch (error) {
            toast.error('Failed to update status')
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'NEW': return 'bg-blue-100 text-blue-700'
            case 'CONTACTED': return 'bg-yellow-100 text-yellow-700'
            case 'INTERESTED': return 'bg-orange-100 text-orange-700'
            case 'QUALIFIED': return 'bg-purple-100 text-purple-700'
            case 'CONVERTED': return 'bg-green-100 text-green-700'
            case 'LOST': return 'bg-red-100 text-red-700'
            default: return 'bg-gray-100 text-gray-700'
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-primary">Lead Management</h2>
                    <p className="text-muted-foreground mt-1">Manage and track your institute's enquiries and admissions.</p>
                </div>
                <div className="flex gap-2">
                    <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                        <DialogTrigger asChild>
                            <Button className="shadow-sm">
                                <Plus className="mr-2 h-4 w-4" /> Add Lead
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                            <DialogHeader>
                                <DialogTitle>Add New Lead</DialogTitle>
                                <DialogDescription>Manually enter a walk-in or phone enquiry.</DialogDescription>
                            </DialogHeader>
                            <div className="grid grid-cols-2 gap-4 py-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Name *</label>
                                    <Input value={newLead.name} onChange={e => setNewLead({ ...newLead, name: e.target.value })} placeholder="John Doe" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Phone *</label>
                                    <Input value={newLead.phone} onChange={e => setNewLead({ ...newLead, phone: e.target.value })} placeholder="9876543210" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Email</label>
                                    <Input type="email" value={newLead.email} onChange={e => setNewLead({ ...newLead, email: e.target.value })} placeholder="john@example.com" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Course Interest</label>
                                    <Input value={newLead.courseName} onChange={e => setNewLead({ ...newLead, courseName: e.target.value })} placeholder="Full Stack Web Dev" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Source</label>
                                    <Select value={newLead.source} onValueChange={v => setNewLead({ ...newLead, source: v })}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="FRANCHISE_WALKIN">Walk-In</SelectItem>
                                            <SelectItem value="FRANCHISE_CALL">Phone Call</SelectItem>
                                            <SelectItem value="REFERRAL">Referral</SelectItem>
                                            <SelectItem value="WEBSITE">Website</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Assign To</label>
                                    <Select value={newLead.assignedTo} onValueChange={v => setNewLead({ ...newLead, assignedTo: v })}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="UNASSIGNED">Unassigned</SelectItem>
                                            {staffUsers.map(staff => (
                                                <SelectItem key={staff.id} value={staff.id}>{staff.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="col-span-2 space-y-2">
                                    <label className="text-sm font-medium">Notes</label>
                                    <Input value={newLead.notes} onChange={e => setNewLead({ ...newLead, notes: e.target.value })} placeholder="Student wants weekend batches..." />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button onClick={handleAddLead} disabled={isSavingLead}>
                                    {isSavingLead ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                    Save Lead
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <Card className="border shadow-sm">
                <CardHeader className="bg-muted/30 pb-4">
                    <div className="flex flex-col md:flex-row gap-4 justify-between">
                        <div className="relative w-full md:max-w-sm">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                            <Input
                                placeholder="Search leads by name..."
                                className="pl-9"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-2 w-full md:w-auto">
                            <Select value={filters.status} onValueChange={(val) => setFilters({ ...filters, status: val })}>
                                <SelectTrigger className="w-[160px]"><SelectValue placeholder="Status" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL">All Statuses</SelectItem>
                                    <SelectItem value="NEW">New</SelectItem>
                                    <SelectItem value="CONTACTED">Contacted</SelectItem>
                                    <SelectItem value="INTERESTED">Interested</SelectItem>
                                    <SelectItem value="QUALIFIED">Qualified</SelectItem>
                                    <SelectItem value="CONVERTED">Converted</SelectItem>
                                    <SelectItem value="LOST">Lost</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {isLoading ? (
                        <div className="flex justify-center p-12">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : leads.length === 0 ? (
                        <div className="text-center py-16 text-muted-foreground">
                            <User className="h-12 w-12 mx-auto mb-4 opacity-50 text-primary" />
                            <p className="text-lg font-medium text-foreground">No leads found</p>
                            <p>Try adjusting your search or filters.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted/50">
                                        <TableHead>Student Details</TableHead>
                                        <TableHead>Course</TableHead>
                                        <TableHead>Source</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Enquiry Date</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {leads.map((lead) => (
                                        <TableRow key={lead.id} className="hover:bg-muted/20">
                                            <TableCell>
                                                <div className="font-semibold text-foreground">{lead.name}</div>
                                                <div className="text-sm text-muted-foreground">{lead.email}</div>
                                                <div className="text-sm text-muted-foreground flex items-center mt-1">
                                                    <Phone className="w-3 h-3 mr-1 opacity-70" /> {lead.phone}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="font-medium text-primary">
                                                    {lead.courseName || '-'}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline">{lead.source}</Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Select
                                                    value={lead.status}
                                                    onValueChange={(val) => handleStatusChange(lead.id, val)}
                                                >
                                                    <SelectTrigger className={`h-8 w-[130px] border-none font-medium ${getStatusColor(lead.status)}`}>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="NEW">New</SelectItem>
                                                        <SelectItem value="CONTACTED">Contacted</SelectItem>
                                                        <SelectItem value="INTERESTED">Interested</SelectItem>
                                                        <SelectItem value="QUALIFIED">Qualified</SelectItem>
                                                        <SelectItem value="CONVERTED">Converted</SelectItem>
                                                        <SelectItem value="LOST">Lost</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">
                                                <div className="flex items-center">
                                                    <Calendar className="w-3 h-3 mr-2 opacity-70" />
                                                    {format(new Date(lead.createdAt), 'dd MMM yyyy')}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
