"use client"

import * as React from 'react'
import Link from 'next/link'
import EmailComposer from '@/components/admin/EmailComposer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
    Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger
} from "@/components/ui/dialog"
import {
    Download,
    Loader2,
    Plus,
    Mail,
    Edit,
    Search,
    Filter,
    Upload,
    Trash2,
    User,
    Phone,
    MessageCircle,
    Eye,
    Clock,
    UserCheck,
    Wand2
} from 'lucide-react'
import { exportToCSV } from '@/lib/export-utils'
import api, { leadApi } from '@/lib/api'
import { format } from 'date-fns'

const initialLeadForm = {
    name: '',
    email: '',
    phone: '',
    source: 'Website',
    status: 'NEW',
    college: '',
    location: '',
    qualification: '',
    dob: '',
    notes: '',
    assignedTo: '',
    franchiseId: ''
}

export default function LeadsPage() {
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
        dob?: string
        notes?: string
        courseName?: string
        createdAt: string
        assignedTo?: string
        aiSummary?: string
        aiNextBestAction?: string
        aiPriority?: string
        franchiseId?: string
    }
    const [leads, setLeads] = React.useState<Lead[]>([])
    const [staffUsers, setStaffUsers] = React.useState<{id: string, name: string}[]>([])
    const [franchises, setFranchises] = React.useState<{id: string, name: string}[]>([])
    const [isLoading, setIsLoading] = React.useState(true)

    const [leadCounts, setLeadCounts] = React.useState<any>({ totalCount: 0, statusCounts: {} })

    const fetchLeadCounts = React.useCallback(async () => {
        try {
            const res = await leadApi.getCounts()
            if (res.data) {
                setLeadCounts(res.data)
            }
        } catch (error) {
            console.error('Failed to fetch lead counts', error)
        }
    }, [])

    React.useEffect(() => {
        fetchLeadCounts()
        
        const handleRefresh = () => fetchLeadCounts()
        if (typeof window !== 'undefined') {
            window.addEventListener('lead-counts:refresh', handleRefresh)
            return () => window.removeEventListener('lead-counts:refresh', handleRefresh)
        }
    }, [fetchLeadCounts])

    const [searchQuery, setSearchQuery] = React.useState('')
    const [selectedLeads, setSelectedLeads] = React.useState<string[]>([])

    // Advanced Filters
    const [isAdvancedFiltersOpen, setIsAdvancedFiltersOpen] = React.useState(false)
    const [filters, setFilters] = React.useState({
        leadType: 'ALL',
        experienceLevel: 'ALL',
        college: '',
        qualification: '',
        pinCode: '',
        dob: '',
        name: '',
        phone: '',
        franchiseId: 'ALL'
    })

    // History Modal State
    const [historyLead, setHistoryLead] = React.useState<Lead | null>(null)
    const [historyLogs, setHistoryLogs] = React.useState<any[]>([])
    const [newLogType, setNewLogType] = React.useState('CALL')
    const [newLogNotes, setNewLogNotes] = React.useState('')
    const [isLoggingActivity, setIsLoggingActivity] = React.useState(false)
    const [isGeneratingAI, setIsGeneratingAI] = React.useState(false)

    // Filters
    const [statusFilter, setStatusFilter] = React.useState('ALL')
    const [sourceFilter, setSourceFilter] = React.useState('ALL')

    // Dialogs
    const [isAddOpen, setIsAddOpen] = React.useState(false)
    const [editingLeadId, setEditingLeadId] = React.useState<string | null>(null)
    const [isImportOpen, setIsImportOpen] = React.useState(false)
    const [importFile, setImportFile] = React.useState<File | null>(null)
    const [isUploading, setIsUploading] = React.useState(false)
    const [isSavingLead, setIsSavingLead] = React.useState(false)

    // Email Dialog
    const [emailLead, setEmailLead] = React.useState<Lead | null>(null)

    // Form Data
    const [newLead, setNewLead] = React.useState(initialLeadForm)

    const refreshLeadCounts = React.useCallback(() => {
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new Event('lead-counts:refresh'))
        }
    }, [])

    const fetchLeads = React.useCallback(async () => {
        setIsLoading(true)
        try {
            const params = new URLSearchParams()
            if (statusFilter !== 'ALL') params.append('status', statusFilter)
            if (sourceFilter !== 'ALL') params.append('source', sourceFilter)
            
            // Apply advanced filters
            if (filters.leadType !== 'ALL') params.append('leadType', filters.leadType)
            if (filters.experienceLevel !== 'ALL') params.append('experienceLevel', filters.experienceLevel)
            if (filters.college) params.append('college', filters.college)
            if (filters.qualification) params.append('qualification', filters.qualification)
            if (filters.pinCode) params.append('pinCode', filters.pinCode)
            if (filters.name) params.append('name', filters.name)
            if (filters.phone) params.append('phone', filters.phone)
            if (filters.franchiseId !== 'ALL') params.append('franchiseId', filters.franchiseId)

            const res = await api.get(`/leads?${params.toString()}`)
            setLeads(res.data || [])
            setSelectedLeads([])
        } catch (_error) {
            console.error('Failed to fetch leads:', _error)
            setLeads([])
        } finally {
            setIsLoading(false)
        }
    }, [sourceFilter, statusFilter, filters])

    React.useEffect(() => {
        fetchLeads()
    }, [fetchLeads])
    
    React.useEffect(() => {
        const fetchStaffAndFranchises = async () => {
            try {
                const [resStaff, resFranchises] = await Promise.all([
                    api.get('/users?role=STAFF,ADMIN,SUPER_ADMIN'),
                    api.get('/franchise')
                ]);
                setStaffUsers(resStaff.data.users || resStaff.data || []);
                setFranchises(resFranchises.data.data || []);
            } catch (e) {
                console.error('Failed to fetch staff or franchises', e);
            }
        };
        fetchStaffAndFranchises();
    }, []);

    React.useEffect(() => {
        const markLeadsAsSeen = async () => {
            try {
                await leadApi.markSeen()
                refreshLeadCounts()
            } catch (error) {
                console.error('Failed to mark leads as seen:', error)
            }
        }

        markLeadsAsSeen()
    }, [refreshLeadCounts])

    const resetLeadForm = () => {
        setNewLead(initialLeadForm)
        setEditingLeadId(null)
    }

    const handleAddLead = async () => {
        setIsSavingLead(true)
        try {
            if (editingLeadId) {
                await api.put(`/leads/${editingLeadId}`, {
                    ...newLead,
                    dob: newLead.dob || null
                })
            } else {
                await api.post('/leads', newLead)
            }
            setIsAddOpen(false)
            resetLeadForm()
            await fetchLeads()
            refreshLeadCounts()
        } catch {
            alert(editingLeadId ? 'Failed to update lead' : 'Failed to add lead')
        } finally {
            setIsSavingLead(false)
        }
    }

    const handleEditLead = (lead: Lead) => {
        setEditingLeadId(lead.id)
        setNewLead({
            name: lead.name || '',
            email: lead.email || '',
            phone: lead.phone || '',
            source: lead.source || 'Website',
            status: lead.status === 'CONVERTED' ? 'QUALIFIED' : (lead.status || 'NEW'),
            college: lead.college || '',
            location: lead.location || '',
            qualification: lead.qualification || '',
            dob: lead.dob ? format(new Date(lead.dob), 'yyyy-MM-dd') : '',
            notes: lead.notes || '',
            assignedTo: lead.assignedTo || '',
            franchiseId: lead.franchiseId || ''
        })
        setIsAddOpen(true)
    }

    const handleImportCSV = async () => {
        if (!importFile) return

        setIsUploading(true)
        const formData = new FormData()
        formData.append('file', importFile)

        try {
            await api.post('/leads/import', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            })
            setIsImportOpen(false)
            fetchLeads()
            refreshLeadCounts()
            alert('Leads imported successfully')
        } catch {
            alert('Failed to import leads')
        } finally {
            setIsUploading(false)
            setImportFile(null)
        }
    }

    const handleConvertToStudent = async (id: string) => {
        if (!confirm('This will create a new Student account and email login credentials to the user. Continue?')) {
            return
        }

        try {
            // Call convert endpoint
            await api.post(`/leads/${id}/convert`)
            alert('Lead converted successfully! Credentials sent to user.')

            // Update local state
            setLeads(prev => prev.map(l => l.id === id ? { ...l, status: 'CONVERTED' } : l))
            refreshLeadCounts()
        } catch (error) {
            console.error('Conversion failed:', error)
            alert('Failed to convert lead. Check console for details.')
        }
    }

    const handleStatusChange = async (id: string, newStatus: string) => {
        // Special handling for CONVERTED status
        if (newStatus === 'CONVERTED') {
            await handleConvertToStudent(id)
            return
        }

        try {
            // Optimistic update
            setLeads(prev => prev.map(l => l.id === id ? { ...l, status: newStatus } : l))
            await api.put(`/leads/${id}`, { status: newStatus })
        } catch {
            fetchLeads() // Revert on error
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure?')) return
        try {
            await api.delete(`/leads/${id}`)
            setLeads(prev => prev.filter(l => l.id !== id))
            refreshLeadCounts()
        } catch {
            alert('Failed to delete lead')
        }
    }

    const handleExportCSV = () => {
        exportToCSV(leads as unknown as Record<string, unknown>[], {
            filename: `leads_export_${new Date().toISOString().split('T')[0]}`,
            headers: ['name', 'email', 'phone', 'source', 'status', 'college', 'location', 'qualification']
        })
    }

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) setSelectedLeads(filteredLeads.map(l => l.id))
        else setSelectedLeads([])
    }

    const handleSelectLead = (id: string) => {
        setSelectedLeads(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
    }

    const handleBulkDelete = async () => {
        if (!selectedLeads.length) return
        if (!confirm(`Are you sure you want to delete ${selectedLeads.length} leads?`)) return
        try {
            await api.delete('/crm/leads/bulk', { data: { leadIds: selectedLeads } })
            fetchLeads()
        } catch {
            alert('Failed to delete leads')
        }
    }

    const handleBulkAssign = async () => {
        if (!selectedLeads.length) return
        const assignedToId = prompt('Enter Staff ID to assign to:\n(Or use individual lead assignment dropdown if prompt is inconvenient)')
        if (!assignedToId) return
        try {
            await api.put('/crm/leads/bulk/assign', { leadIds: selectedLeads, assignedToId })
            fetchLeads()
            alert('Assigned successfully')
        } catch {
            alert('Failed to assign leads')
        }
    }

    const openHistory = async (lead: Lead) => {
        setHistoryLead(lead)
        try {
            const res = await api.get(`/leads/${lead.id}/activity`)
            setHistoryLogs(res.data.logs || [])
        } catch (e) {
            console.error('Failed to load history', e)
        }
    }

    const handleLogActivity = async () => {
        if (!historyLead || !newLogNotes) return
        setIsLoggingActivity(true)
        try {
            const res = await api.post(`/leads/${historyLead.id}/activity`, {
                actionType: newLogType,
                notes: newLogNotes
            })
            setHistoryLogs([res.data.log, ...historyLogs])
            setNewLogNotes('')
        } catch (e) {
            console.error('Failed to log activity', e)
            alert('Failed to save log')
        } finally {
            setIsLoggingActivity(false)
        }
    }

    const handleGenerateAI = async () => {
        if (!historyLead) return
        setIsGeneratingAI(true)
        try {
            const res = await api.post(`/leads/${historyLead.id}/ai/summary`)
            setHistoryLead(res.data.data) // Update local lead with new AI fields
            setLeads(prev => prev.map(l => l.id === historyLead.id ? res.data.data : l))
        } catch (error) {
            console.error(error)
            alert('Failed to generate AI summary')
        } finally {
            setIsGeneratingAI(false)
        }
    }

    const filteredLeads = leads.filter(lead =>
        lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.phone?.includes(searchQuery) ||
        lead.college?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.courseName?.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'NEW': return 'bg-blue-100 text-blue-700 hover:bg-blue-200'
            case 'CONTACTED': return 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
            case 'INTERESTED': return 'bg-purple-100 text-purple-700 hover:bg-purple-200'
            case 'QUALIFIED': return 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
            case 'CONVERTED': return 'bg-green-100 text-green-700 hover:bg-green-200'
            case 'LOST': return 'bg-red-100 text-red-700 hover:bg-red-200'
            default: return 'bg-gray-100 text-gray-700'
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Lead Management</h1>
                    <p className="text-muted-foreground">Track enquiries, manage status, and analyze sources.</p>
                </div>
                <div className="flex gap-2">
                    {selectedLeads.length > 0 && (
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={handleBulkAssign}>Assign ({selectedLeads.length})</Button>
                            <Button variant="destructive" onClick={handleBulkDelete}>Delete ({selectedLeads.length})</Button>
                        </div>
                    )}
                    <Button variant="outline" onClick={handleExportCSV}>
                        <Download className="mr-2 h-4 w-4" />
                        Export
                    </Button>
                    <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline">
                                <Upload className="mr-2 h-4 w-4" />
                                Import CSV
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Import Leads from CSV</DialogTitle>
                                <DialogDescription>
                                    Upload a CSV file with headers: Name, Email, Phone, Source, College, Location
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <Input
                                    type="file"
                                    accept=".csv"
                                    onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                                />
                                <div className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
                                    <p className="font-semibold mb-1">Sample CSV Format:</p>
                                    <code>Name,Email,Phone,Source,College,Location</code><br />
                                    <code>John Doe,john@test.com,9876543210,Website,IIT Delhi,Delhi</code>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button onClick={handleImportCSV} disabled={!importFile || isUploading}>
                                    {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                                    Upload & Import
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                    <Dialog
                        open={isAddOpen}
                        onOpenChange={(open) => {
                            setIsAddOpen(open)
                            if (!open) resetLeadForm()
                        }}
                    >
                        <DialogTrigger asChild>
                            <Button onClick={resetLeadForm}>
                                <Plus className="mr-2 h-4 w-4" />
                                Add Lead
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                            <DialogHeader>
                                <DialogTitle>{editingLeadId ? 'Edit Lead' : 'Add New Lead'}</DialogTitle>
                                <DialogDescription>
                                    {editingLeadId ? 'Update the lead details and save your changes.' : 'Create a new lead and add it to your pipeline.'}
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid grid-cols-2 gap-4 py-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Full Name</label>
                                    <Input value={newLead.name} onChange={e => setNewLead({ ...newLead, name: e.target.value })} placeholder="John Doe" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Email</label>
                                    <Input value={newLead.email} onChange={e => setNewLead({ ...newLead, email: e.target.value })} placeholder="john@example.com" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Phone</label>
                                    <Input value={newLead.phone} onChange={e => setNewLead({ ...newLead, phone: e.target.value })} placeholder="+91 9876543210" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Source</label>
                                    <Select value={newLead.source} onValueChange={v => setNewLead({ ...newLead, source: v })}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Website">Website</SelectItem>
                                            <SelectItem value="Referral">Referral</SelectItem>
                                            <SelectItem value="LinkedIn">LinkedIn</SelectItem>
                                            <SelectItem value="Google Ads">Google Ads</SelectItem>
                                            <SelectItem value="Walk-in">Walk-in</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Status</label>
                                    <Select value={newLead.status} onValueChange={v => setNewLead({ ...newLead, status: v })}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="NEW">New</SelectItem>
                                            <SelectItem value="CONTACTED">Contacted</SelectItem>
                                            <SelectItem value="INTERESTED">Interested</SelectItem>
                                            <SelectItem value="QUALIFIED">Qualified</SelectItem>
                                            <SelectItem value="LOST">Lost</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Assign To Staff</label>
                                    <Select value={newLead.assignedTo || "UNASSIGNED"} onValueChange={v => setNewLead({ ...newLead, assignedTo: v === "UNASSIGNED" ? '' : v })}>
                                        <SelectTrigger><SelectValue placeholder="Unassigned" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="UNASSIGNED">Unassigned</SelectItem>
                                            {staffUsers.map(staff => (
                                                <SelectItem key={staff.id} value={staff.id}>{staff.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Assigned Franchise</label>
                                    <Select value={newLead.franchiseId || 'UNASSIGNED'} onValueChange={v => setNewLead({ ...newLead, franchiseId: v === 'UNASSIGNED' ? '' : v })}>
                                        <SelectTrigger><SelectValue placeholder="Select Franchise" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="UNASSIGNED">Unassigned</SelectItem>
                                            {franchises.map(franchise => (
                                                <SelectItem key={franchise.id} value={franchise.id}>{franchise.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">College/University</label>
                                    <Input value={newLead.college} onChange={e => setNewLead({ ...newLead, college: e.target.value })} placeholder="XYZ University" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Qualification</label>
                                    <Input value={newLead.qualification} onChange={e => setNewLead({ ...newLead, qualification: e.target.value })} placeholder="B.Tech CS" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Location</label>
                                    <Input value={newLead.location} onChange={e => setNewLead({ ...newLead, location: e.target.value })} placeholder="City, State" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Date of Birth</label>
                                    <Input type="date" value={newLead.dob} onChange={e => setNewLead({ ...newLead, dob: e.target.value })} />
                                </div>
                                <div className="col-span-2 space-y-2">
                                    <label className="text-sm font-medium">Notes</label>
                                    <Input value={newLead.notes} onChange={e => setNewLead({ ...newLead, notes: e.target.value })} placeholder="Additional details..." />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button onClick={handleAddLead} disabled={isSavingLead}>
                                    {isSavingLead ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                    {editingLeadId ? 'Update Lead' : 'Save Lead'}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Quick Status Filters */}
            <div className="flex overflow-x-auto pb-2 gap-2 hide-scrollbar">
                {[
                    { label: 'Total Leads', value: 'ALL', count: leadCounts.totalCount || 0 },
                    { label: 'New', value: 'NEW', count: leadCounts.statusCounts?.NEW || 0 },
                    { label: 'Contacted', value: 'CONTACTED', count: leadCounts.statusCounts?.CONTACTED || 0 },
                    { label: 'Pending / Interested', value: 'INTERESTED', count: leadCounts.statusCounts?.INTERESTED || 0 },
                    { label: 'Qualified', value: 'QUALIFIED', count: leadCounts.statusCounts?.QUALIFIED || 0 },
                    { label: 'Converted', value: 'CONVERTED', count: leadCounts.statusCounts?.CONVERTED || 0 },
                    { label: 'Follow Up', value: 'FOLLOW_UP', count: leadCounts.statusCounts?.FOLLOW_UP || 0 },
                    { label: 'Not Interested', value: 'LOST', count: leadCounts.statusCounts?.LOST || 0 },
                ].map((status) => (
                    <Button
                        key={status.value}
                        variant={statusFilter === status.value ? "default" : "outline"}
                        size="sm"
                        className={`whitespace-nowrap h-8 px-4 rounded-md font-medium text-xs shadow-sm ${statusFilter === status.value ? 'bg-primary text-primary-foreground' : 'bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                        onClick={() => setStatusFilter(status.value)}
                    >
                        {status.label} {status.count > 0 && `(${status.count})`}
                    </Button>
                ))}
            </div>

            <Card>
                <CardHeader>
                    <div className="flex flex-col md:flex-row justify-between gap-4">
                        <CardTitle>All Leads</CardTitle>
                        <div className="flex flex-wrap gap-2">
                            <div className="relative w-full md:w-64">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search leads..."
                                    className="pl-8"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-[150px]">
                                    <div className="flex items-center gap-2">
                                        <Filter className="h-4 w-4" />
                                        <SelectValue placeholder="Status" />
                                    </div>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL">All Status</SelectItem>
                                    <SelectItem value="NEW">New</SelectItem>
                                    <SelectItem value="CONTACTED">Contacted</SelectItem>
                                    <SelectItem value="INTERESTED">Interested</SelectItem>
                                    <SelectItem value="QUALIFIED">Qualified</SelectItem>
                                    <SelectItem value="CONVERTED">Converted</SelectItem>
                                    <SelectItem value="FOLLOW_UP">Follow Up</SelectItem>
                                    <SelectItem value="LOST">Lost</SelectItem>
                                </SelectContent>
                            </Select>
                            
                            <Button variant={isAdvancedFiltersOpen ? "default" : "outline"} onClick={() => setIsAdvancedFiltersOpen(!isAdvancedFiltersOpen)}>
                                <Filter className="mr-2 h-4 w-4" />
                                Advanced Filters
                            </Button>
                            <Select value={sourceFilter} onValueChange={setSourceFilter}>
                                <SelectTrigger className="w-[150px]">
                                    <SelectValue placeholder="Source" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL">All Sources</SelectItem>
                                    <SelectItem value="Website">Website</SelectItem>
                                    <SelectItem value="Website Interest">Website Interest</SelectItem>
                                    <SelectItem value="Referral">Referral</SelectItem>
                                    <SelectItem value="LinkedIn">LinkedIn</SelectItem>
                                    <SelectItem value="Google Ads">Google Ads</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    
                    {/* Advanced Filters Panel */}
                    {isAdvancedFiltersOpen && (
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4 p-4 border rounded-md bg-muted/20">
                            <Input placeholder="Filter by Name..." value={filters.name} onChange={e => setFilters({...filters, name: e.target.value})} />
                            <Input placeholder="Filter by Phone..." value={filters.phone} onChange={e => setFilters({...filters, phone: e.target.value})} />
                            <Input placeholder="Filter by College..." value={filters.college} onChange={e => setFilters({...filters, college: e.target.value})} />
                            <Input placeholder="Filter by Qualification..." value={filters.qualification} onChange={e => setFilters({...filters, qualification: e.target.value})} />
                            <Input placeholder="Filter by Pin Code..." value={filters.pinCode} onChange={e => setFilters({...filters, pinCode: e.target.value})} />
                            <Input type="date" placeholder="Filter by DOB..." value={filters.dob} onChange={e => setFilters({...filters, dob: e.target.value})} />
                            
                            <Select value={filters.leadType} onValueChange={v => setFilters({...filters, leadType: v})}>
                                <SelectTrigger><SelectValue placeholder="Lead Type" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL">All Types</SelectItem>
                                    <SelectItem value="GENERAL">General</SelectItem>
                                    <SelectItem value="TRAINING">Training</SelectItem>
                                    <SelectItem value="JOB_ENQUIRY">Job Enquiry</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={filters.experienceLevel} onValueChange={v => setFilters({...filters, experienceLevel: v})}>
                                <SelectTrigger><SelectValue placeholder="Experience Level" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL">All Levels</SelectItem>
                                    <SelectItem value="Fresher">Fresher</SelectItem>
                                    <SelectItem value="1-3 Years">1-3 Years</SelectItem>
                                    <SelectItem value="3+ Years">3+ Years</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={filters.franchiseId} onValueChange={v => setFilters({...filters, franchiseId: v})}>
                                <SelectTrigger><SelectValue placeholder="Franchise" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL">All Franchises</SelectItem>
                                    <SelectItem value="UNASSIGNED">Unassigned</SelectItem>
                                    {franchises.map(franchise => (
                                        <SelectItem key={franchise.id} value={franchise.id}>{franchise.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex justify-center p-8">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : filteredLeads.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            No leads found matching your criteria.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-12">
                                                <input type="checkbox" checked={selectedLeads.length > 0 && selectedLeads.length === filteredLeads.length} onChange={handleSelectAll} />
                                            </TableHead>
                                            <TableHead>Name & Details</TableHead>
                                            <TableHead>Course Interest</TableHead>
                                            <TableHead>Source</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Remarks</TableHead>
                                            <TableHead>Added On</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredLeads.map((lead) => (
                                        <TableRow key={lead.id}>
                                            <TableCell>
                                                <input type="checkbox" checked={selectedLeads.includes(lead.id)} onChange={() => handleSelectLead(lead.id)} />
                                            </TableCell>
                                            <TableCell>
                                                <div className="font-medium">{lead.name}</div>
                                                <div className="text-xs text-muted-foreground">{lead.email}</div>
                                                <div className="text-xs text-muted-foreground flex items-center gap-1">
                                                    {lead.phone}
                                                    {lead.phone && (
                                                        <a href={`tel:${lead.phone}`} className="text-blue-500 hover:text-blue-700 ml-1" title="Call Lead">
                                                            <Phone className="w-3 h-3" />
                                                        </a>
                                                    )}
                                                </div>
                                                <div className="text-[10px] text-primary font-medium mt-1 uppercase italic">
                                                    {lead.qualification || 'General Enquiry'}
                                                </div>
                                                {(lead.college || lead.location) && (
                                                    <div className="text-[10px] text-muted-foreground mt-0.5 opacity-70">
                                                        {lead.college}{lead.college && lead.location ? ' • ' : ''}{lead.location}
                                                    </div>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <div className="font-semibold text-sm text-primary">
                                                    {lead.courseName || (lead.notes?.includes('course:') ? lead.notes.split('course:')[1].split('|')[0].trim() : '-')}
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
                                                    <SelectTrigger className={`h-8 w-[130px] border-none ${getStatusColor(lead.status)}`}>
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

                                           <TableCell className="text-muted-foreground text-sm">
                                                {lead.notes}
                                            </TableCell>

                                            <TableCell className="text-muted-foreground text-sm">
                                                {format(new Date(lead.createdAt), 'dd MMM yyyy')}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-1">
                                                    {lead.phone && (
                                                        <>
                                                            <a
                                                                href={`tel:${lead.phone}`}
                                                                className="inline-flex items-center justify-center h-8 w-8 rounded-md text-green-600 hover:text-green-700 hover:bg-green-50"
                                                                title="Call Lead"
                                                            >
                                                                <Phone className="h-4 w-4" />
                                                            </a>
                                                            <a
                                                                href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}`}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="inline-flex items-center justify-center h-8 w-8 rounded-md text-emerald-500 hover:text-emerald-700 hover:bg-emerald-50"
                                                                title="WhatsApp Lead"
                                                            >
                                                                <MessageCircle className="h-4 w-4" />
                                                            </a>
                                                        </>
                                                    )}
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                                                        onClick={() => setEmailLead(lead)}
                                                        title="Email Lead"
                                                    >
                                                        <Mail className="h-4 w-4" />
                                                    </Button>
                                                    <Link href={`/admin/crm/customers/${lead.id}`}>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
                                                            title="View 360 Profile"
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                                                        onClick={() => openHistory(lead)}
                                                        title="Lead History"
                                                    >
                                                        <Clock className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                                        onClick={() => handleEditLead(lead)}
                                                        title="Edit Lead"
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                                                        onClick={() => handleDelete(lead.id)}
                                                        title="Delete Lead"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
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

            <EmailComposer
                lead={emailLead}
                isOpen={!!emailLead}
                onClose={() => setEmailLead(null)}
            />

            <Dialog open={!!historyLead} onOpenChange={(open) => !open && setHistoryLead(null)}>
                <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Activity History for {historyLead?.name}</DialogTitle>
                        <DialogDescription>Track calls, notes, and status changes</DialogDescription>
                    </DialogHeader>
                    
                    <div className="grid gap-4 py-4">
                        <div className="flex gap-2">
                            <Select value={newLogType} onValueChange={setNewLogType}>
                                <SelectTrigger className="w-[150px]">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="CALL">Phone Call</SelectItem>
                                    <SelectItem value="NOTE">Internal Note</SelectItem>
                                    <SelectItem value="MEETING">Meeting</SelectItem>
                                    <SelectItem value="EMAIL">Email Sent</SelectItem>
                                </SelectContent>
                            </Select>
                            <Input 
                                placeholder="Add comments..." 
                                value={newLogNotes} 
                                onChange={e => setNewLogNotes(e.target.value)} 
                                className="flex-1"
                            />
                            <Button onClick={handleLogActivity} disabled={isLoggingActivity || !newLogNotes}>
                                {isLoggingActivity ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                                Log
                            </Button>
                        </div>

                        <div className="flex justify-end">
                            <Button variant="outline" onClick={handleGenerateAI} disabled={isGeneratingAI} className="border-purple-200 text-purple-700 hover:bg-purple-50">
                                {isGeneratingAI ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Wand2 className="h-4 w-4 mr-2" />}
                                Generate AI Insights
                            </Button>
                        </div>

                        {historyLead?.aiSummary && (
                            <Card className="border-purple-200 bg-purple-50/50">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-semibold flex items-center gap-2 text-purple-800">
                                        <Wand2 className="h-4 w-4" /> AI Lead Insights
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div>
                                        <h4 className="text-xs font-semibold text-purple-900/60 uppercase mb-1">Summary</h4>
                                        <p className="text-sm text-purple-900">{historyLead.aiSummary}</p>
                                    </div>
                                    <div className="flex items-start gap-4">
                                        <div className="flex-1">
                                            <h4 className="text-xs font-semibold text-purple-900/60 uppercase mb-1">Next Best Action</h4>
                                            <p className="text-sm font-medium text-purple-900">{historyLead.aiNextBestAction}</p>
                                        </div>
                                        <div>
                                            <h4 className="text-xs font-semibold text-purple-900/60 uppercase mb-1">Priority</h4>
                                            <Badge variant="outline" className={
                                                historyLead.aiPriority === 'HIGH' ? 'border-red-200 text-red-700 bg-red-50' :
                                                historyLead.aiPriority === 'MEDIUM' ? 'border-orange-200 text-orange-700 bg-orange-50' :
                                                'border-green-200 text-green-700 bg-green-50'
                                            }>
                                                {historyLead.aiPriority}
                                            </Badge>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        <div className="space-y-4 mt-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
                            {historyLogs.length === 0 ? (
                                <p className="text-center text-muted-foreground py-8">No activity logged yet.</p>
                            ) : (
                                historyLogs.map((log) => (
                                    <div key={log.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                        <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-slate-100 text-slate-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                                            {log.actionType === 'CALL' ? <Phone className="h-4 w-4" /> : 
                                             log.actionType === 'NOTE' ? <MessageCircle className="h-4 w-4" /> : 
                                             <Clock className="h-4 w-4" />}
                                        </div>
                                        <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded border border-slate-200 bg-white shadow-sm">
                                            <div className="flex items-center justify-between space-x-2 mb-1">
                                                <div className="font-bold text-slate-900">{log.actionType}</div>
                                                <time className="font-mono text-xs text-indigo-500">{format(new Date(log.createdAt), 'dd MMM, hh:mm a')}</time>
                                            </div>
                                            <div className="text-slate-500 text-sm">{log.notes}</div>
                                            <div className="text-[10px] text-muted-foreground mt-2 font-mono">By {log.performedBy}</div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
