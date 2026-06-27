"use client"

import * as React from 'react'
import { useSearchParams } from 'next/navigation'
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
    MapPin,
    School,
    MessageCircle,
    Send,
    Eye,
    FileText,
    CheckCircle2,
    Video,
    TrendingUp,
    Phone
} from 'lucide-react'
import { exportToCSV } from '@/lib/export-utils'
import * as XLSX from 'xlsx'
import api, { leadApi } from '@/lib/api'
import { format } from 'date-fns'
import { toast } from 'sonner'

const initialLeadForm = {
    name: '',
    email: '',
    phone: '',
    source: 'Website',
    leadType: 'GENERAL',
    status: 'NEW',
    college: '',
    companyName: '',
    location: '',
    qualification: '',
    dob: '',
    experienceLevel: '',
    currentCTC: '',
    expectedCTC: '',
    noticePeriod: '',
    interestedRole: '',
    courseName: '',
    resumeUrl: '',
    notes: '',
    assignedTo: ''
}

export default function LeadsPage() {
    interface Lead {
        id: string
        name: string
        email: string
        phone: string
        source: string
        leadType: string
        status: string
        college?: string
        companyName?: string
        location?: string
        qualification?: string
        dob?: string
        notes?: string
        courseName?: string
        experienceLevel?: string
        currentCTC?: string
        expectedCTC?: string
        noticePeriod?: string
        interestedRole?: string
        resumeUrl?: string
        createdAt: string
        lifecycleStage?: string
        whatsappOptIn?: boolean
        resumeBuilt?: boolean
        placementStatus?: string
        revenueGenerated?: number
        assignedTo?: string
        isMasked?: boolean
        demoSchedules?: any[]
    }
    interface StaffUser {
        id: string
        name: string
        role: string
    }
    const [leads, setLeads] = React.useState<Lead[]>([])
    const [staff, setStaff] = React.useState<StaffUser[]>([])
    const [isLoading, setIsLoading] = React.useState(true)
    const [searchQuery, setSearchQuery] = React.useState('')

    const searchParams = useSearchParams()
    
    // Filters
    const [statusFilter, setStatusFilter] = React.useState('ALL')
    const [sourceFilter, setSourceFilter] = React.useState('ALL')
    const [leadTypeFilter, setLeadTypeFilter] = React.useState(searchParams.get('type') || 'ALL')

    // Advanced Filters
    const [experienceLevelFilter, setExperienceLevelFilter] = React.useState('ALL')
    const [interestedRoleFilter, setInterestedRoleFilter] = React.useState('')
    const [courseNameFilter, setCourseNameFilter] = React.useState('')
    const [companyNameFilter, setCompanyNameFilter] = React.useState('')
    const [collegeFilter, setCollegeFilter] = React.useState('')
    const [hasDemoFilter, setHasDemoFilter] = React.useState('ALL')

    React.useEffect(() => {
        const typeParam = searchParams.get('type')
        if (typeParam) {
            setLeadTypeFilter(typeParam)
        } else {
            setLeadTypeFilter('ALL')
        }
        // Clear advanced filters on category switch
        setExperienceLevelFilter('ALL')
        setInterestedRoleFilter('')
        setCourseNameFilter('')
        setCompanyNameFilter('')
        setCollegeFilter('')
        setHasDemoFilter('ALL')
    }, [searchParams])

    // Dialogs
    const [isAddOpen, setIsAddOpen] = React.useState(false)
    const [editingLeadId, setEditingLeadId] = React.useState<string | null>(null)
    const [isImportOpen, setIsImportOpen] = React.useState(false)
    const [importFile, setImportFile] = React.useState<File | null>(null)
    const [isUploading, setIsUploading] = React.useState(false)
    const [isSavingLead, setIsSavingLead] = React.useState(false)
    
    // View Dialog
    const [viewingLead, setViewingLead] = React.useState<Lead | null>(null)

    // Email Dialog
    const [emailLead, setEmailLead] = React.useState<Lead | null>(null)

    // WhatsApp Dialog
    const [whatsAppLead, setWhatsAppLead] = React.useState<Lead | null>(null)

    // Demo Management Dialog
    const [manageDemoLead, setManageDemoLead] = React.useState<Lead | null>(null)
    const [meetingLink, setMeetingLink] = React.useState('')
    const [sendEmailInvite, setSendEmailInvite] = React.useState(true)
    const [sendWhatsAppInvite, setSendWhatsAppInvite] = React.useState(true)
    const [isSendingDemo, setIsSendingDemo] = React.useState(false)
    const [whatsAppLogs, setWhatsAppLogs] = React.useState<{ id: string, phone: string, sender: string, message: string, createdAt: string }[]>([])
    const [isWhatsAppLoading, setIsWhatsAppLoading] = React.useState(false)
    const [whatsAppInput, setWhatsAppInput] = React.useState('')
    const [isSendingMessage, setIsSendingMessage] = React.useState(false)

    // Templates
    const [templates, setTemplates] = React.useState<{id: string, title: string, content: string, type: string, category: string}[]>([])
    const [showTemplates, setShowTemplates] = React.useState(false)

    // Form Data
    const [newLead, setNewLead] = React.useState(initialLeadForm)

    const fetchWhatsAppLogs = React.useCallback(async (phone: string) => {
        setIsWhatsAppLoading(true)
        try {
            const res = await api.get(`/whatsapp/logs/${phone}`)
            setWhatsAppLogs(res.data || [])
        } catch (err) {
            console.error("Failed to load logs:", err)
        } finally {
            setIsWhatsAppLoading(false)
        }
    }, [])

    React.useEffect(() => {
        if (whatsAppLead?.phone) {
            fetchWhatsAppLogs(whatsAppLead.phone)
        } else {
            setWhatsAppLogs([])
        }
    }, [whatsAppLead, fetchWhatsAppLogs])

    const handleSendWhatsApp = async () => {
        if (!whatsAppLead?.phone || !whatsAppInput.trim()) return
        setIsSendingMessage(true)
        try {
            await api.post('/whatsapp/send', {
                phone: whatsAppLead.phone,
                message: whatsAppInput
            })
            setWhatsAppInput('')
            await fetchWhatsAppLogs(whatsAppLead.phone)
        } catch {
            alert('Failed to send WhatsApp message')
        } finally {
            setIsSendingMessage(false)
        }
    }

    const refreshLeadCounts = React.useCallback(() => {
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new Event('lead-counts:refresh'))
        }
    }, [])

    const fetchStaff = React.useCallback(async () => {
        try {
            const res = await api.get('/users?role=SUPER_ADMIN,ADMIN,STAFF&limit=100')
            setStaff(res.data.users || res.data || [])
        } catch (error) {
            console.error('Failed to fetch staff:', error)
        }
    }, [])

    const fetchTemplates = React.useCallback(async () => {
        try {
            const res = await api.get('/sales/templates')
            setTemplates(res.data || [])
        } catch (error) {
            console.error('Failed to fetch templates:', error)
        }
    }, [])

    const fetchLeads = React.useCallback(async () => {
        setIsLoading(true)
        try {
            const params = new URLSearchParams()
            if (statusFilter !== 'ALL') params.append('status', statusFilter)
            if (sourceFilter !== 'ALL') params.append('source', sourceFilter)
            if (leadTypeFilter !== 'ALL') params.append('leadType', leadTypeFilter)
            
            if (experienceLevelFilter !== 'ALL') params.append('experienceLevel', experienceLevelFilter)
            if (interestedRoleFilter) params.append('interestedRole', interestedRoleFilter)
            if (courseNameFilter) params.append('courseName', courseNameFilter)
            if (companyNameFilter) params.append('companyName', companyNameFilter)
            if (collegeFilter) params.append('college', collegeFilter)

            const res = await api.get(`/leads?${params.toString()}`)
            setLeads(res.data || [])
        } catch (error) {
            console.error('Failed to fetch leads:', error)
            // Fallback mock data if API fails (during dev)
            setLeads([])
        } finally {
            setIsLoading(false)
        }
    }, [sourceFilter, statusFilter, leadTypeFilter, experienceLevelFilter, interestedRoleFilter, courseNameFilter, companyNameFilter, collegeFilter])

    React.useEffect(() => {
        fetchLeads()
        fetchStaff()
        fetchTemplates()
    }, [fetchLeads, fetchStaff, fetchTemplates])

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
        setNewLead({
            ...initialLeadForm,
            leadType: leadTypeFilter === 'ALL' ? 'GENERAL' : leadTypeFilter
        })
        setEditingLeadId(null)
    }

    const handleAddLead = async () => {
        setIsSavingLead(true)
        try {
            const payload = {
                ...newLead,
                assignedTo: newLead.assignedTo === 'UNASSIGNED' || !newLead.assignedTo ? null : newLead.assignedTo,
                dob: newLead.dob || null
            }
            if (editingLeadId) {
                await api.put(`/leads/${editingLeadId}`, payload)
            } else {
                await api.post('/leads', payload)
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
            leadType: lead.leadType || 'GENERAL',
            college: lead.college || '',
            companyName: lead.companyName || '',
            location: lead.location || '',
            qualification: lead.qualification || '',
            dob: lead.dob ? format(new Date(lead.dob), 'yyyy-MM-dd') : '',
            experienceLevel: lead.experienceLevel || '',
            currentCTC: lead.currentCTC || '',
            expectedCTC: lead.expectedCTC || '',
            noticePeriod: lead.noticePeriod || '',
            interestedRole: lead.interestedRole || '',
            courseName: lead.courseName || '',
            resumeUrl: lead.resumeUrl || '',
            notes: lead.notes || '',
            assignedTo: lead.assignedTo || ''
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

    const handleAssigneeChange = async (id: string, newAssignee: string) => {
        const val = newAssignee === 'UNASSIGNED' ? null : newAssignee
        try {
            // Optimistic update
            setLeads(prev => prev.map(l => l.id === id ? { ...l, assignedTo: val || undefined } : l))
            await api.put(`/leads/${id}`, { assignedTo: val })
            toast.success('Lead assignment updated')
        } catch {
            fetchLeads() // Revert on error
            alert('Failed to assign lead')
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

    const handleDemoStatusChange = async (leadId: string, demoId: string, status: string) => {
        try {
            await api.put(`/leads/${leadId}/demo/${demoId}/status`, { status });
            toast.success(`Demo marked as ${status}`);
            fetchLeads();
            refreshLeadCounts();
        } catch (error) {
            toast.error('Failed to update demo status');
        }
    }

    const handleManageDemoSubmit = async () => {
        if (!manageDemoLead || !manageDemoLead.demoSchedules?.[0]) return;
        if (!meetingLink) {
            toast.error('Please enter a meeting link');
            return;
        }

        setIsSendingDemo(true);
        try {
            const demoId = manageDemoLead.demoSchedules[0].id;
            const res = await api.put(`/leads/${manageDemoLead.id}/demo/${demoId}/meeting`, {
                meetingLink,
                sendEmail: sendEmailInvite,
                sendWhatsApp: sendWhatsAppInvite
            });
            
            if (res.data.success) {
                let msg = 'Meeting link saved.';
                if (res.data.notifications.emailSent) msg += ' Email sent.';
                if (res.data.notifications.whatsappSent) msg += ' WhatsApp sent.';
                
                toast.success(msg);
                setManageDemoLead(null);
                setMeetingLink('');
                fetchLeads();
            }
        } catch (error) {
            console.error(error);
            toast.error('Failed to save meeting link and send notifications');
        } finally {
            setIsSendingDemo(false);
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

    const handleExportExcel = () => {
        try {
            const dataToExport = filteredLeads.map(l => ({
                Name: l.name,
                Email: l.email,
                Phone: l.phone,
                Source: l.source,
                LeadType: l.leadType,
                Status: l.status,
                College: l.college || '',
                CompanyName: l.companyName || '',
                Location: l.location || '',
                Qualification: l.qualification || '',
                Experience: l.experienceLevel || '',
                InterestedRole: l.interestedRole || '',
                Course: l.courseName || '',
                Date: new Date(l.createdAt).toLocaleDateString()
            }))
            const ws = XLSX.utils.json_to_sheet(dataToExport)
            const wb = XLSX.utils.book_new()
            XLSX.utils.book_append_sheet(wb, ws, "Leads")
            XLSX.writeFile(wb, `Leads_Export_${new Date().toISOString().split('T')[0]}.xlsx`)
            toast.success("Exported to Excel successfully")
        } catch (error) {
            toast.error("Failed to export to Excel")
        }
    }

    const filteredLeads = leads.filter(lead => {
        const matchesSearch = lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            lead.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            lead.phone?.includes(searchQuery) ||
            lead.college?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            lead.courseName?.toLowerCase().includes(searchQuery.toLowerCase())
            
        let matchesDemo = true;
        if (hasDemoFilter === 'WITH_DEMO') matchesDemo = !!(lead.demoSchedules && lead.demoSchedules.length > 0);
        if (hasDemoFilter === 'WITHOUT_DEMO') matchesDemo = !lead.demoSchedules || lead.demoSchedules.length === 0;
        
        return matchesSearch && matchesDemo;
    })

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

    const getLifecycleColor = (stage: string) => {
        switch (stage) {
            case 'NEW': return 'bg-slate-100 text-slate-700 border-slate-200'
            case 'ENROLLED': return 'bg-indigo-50 text-indigo-700 border border-indigo-200'
            case 'LEARNING': return 'bg-blue-50 text-blue-700 border border-blue-200'
            case 'PRACTICING': return 'bg-cyan-50 text-cyan-700 border border-cyan-200'
            case 'CERTIFIED': return 'bg-amber-50 text-amber-700 border border-amber-200'
            case 'RESUME_BUILT': return 'bg-purple-50 text-purple-700 border border-purple-200'
            case 'PLACED': return 'bg-emerald-50 text-emerald-700 border border-emerald-200'
            case 'ALUMNI_EXIT': return 'bg-rose-50 text-rose-700 border border-rose-200'
            default: return 'bg-gray-50 text-gray-700 border-gray-200'
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Central CRM</h1>
                    <p className="text-muted-foreground">Advanced lead management, candidate tracking, and enquiries.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="default" className="bg-indigo-600 text-white" onClick={() => window.location.href='/admin/leads/analytics'}>
                        <TrendingUp className="mr-2 h-4 w-4" />
                        Lead Analytics
                    </Button>
                    <Button variant="outline" onClick={handleExportExcel}>
                        <Download className="mr-2 h-4 w-4" />
                        Export Excel
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
                            <div className="grid grid-cols-2 gap-4 py-4 max-h-[70vh] overflow-y-auto px-1">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Lead Type</label>
                                    <Select value={newLead.leadType} onValueChange={v => setNewLead({ ...newLead, leadType: v })}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="GENERAL">General</SelectItem>
                                            <SelectItem value="TRAINING">Training</SelectItem>
                                            <SelectItem value="JOB_ENQUIRY">Job Enquiry</SelectItem>
                                            <SelectItem value="SOFTWARE_REQUEST">Software Request</SelectItem>
                                            <SelectItem value="SERVICE_REQUEST">Service Request</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
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
                                    <label className="text-sm font-medium">Assign To Counselor/Staff</label>
                                    <Select value={newLead.assignedTo || 'UNASSIGNED'} onValueChange={v => setNewLead({ ...newLead, assignedTo: v })}>
                                        <SelectTrigger><SelectValue placeholder="Unassigned" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="UNASSIGNED">Unassigned</SelectItem>
                                            {staff.map(member => (
                                                <SelectItem key={member.id} value={member.id}>{member.name} ({member.role})</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                
                                {newLead.leadType === 'TRAINING' && (
                                    <>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Course Name</label>
                                            <Input value={newLead.courseName} onChange={e => setNewLead({ ...newLead, courseName: e.target.value })} placeholder="React Native" />
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
                                            <label className="text-sm font-medium">Date of Birth</label>
                                            <Input type="date" value={newLead.dob} onChange={e => setNewLead({ ...newLead, dob: e.target.value })} />
                                        </div>
                                    </>
                                )}

                                {newLead.leadType === 'JOB_ENQUIRY' && (
                                    <>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Experience Level</label>
                                            <Select value={newLead.experienceLevel} onValueChange={v => setNewLead({ ...newLead, experienceLevel: v })}>
                                                <SelectTrigger><SelectValue placeholder="Select Experience" /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="FRESHER">Fresher</SelectItem>
                                                    <SelectItem value="1_3_YEARS">1-3 Years</SelectItem>
                                                    <SelectItem value="3_5_YEARS">3-5 Years</SelectItem>
                                                    <SelectItem value="5_PLUS_YEARS">5+ Years</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Interested Role</label>
                                            <Input value={newLead.interestedRole} onChange={e => setNewLead({ ...newLead, interestedRole: e.target.value })} placeholder="Full Stack Developer" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Current CTC</label>
                                            <Input value={newLead.currentCTC} onChange={e => setNewLead({ ...newLead, currentCTC: e.target.value })} placeholder="e.g. 5 LPA" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Expected CTC</label>
                                            <Input value={newLead.expectedCTC} onChange={e => setNewLead({ ...newLead, expectedCTC: e.target.value })} placeholder="e.g. 8 LPA" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Notice Period</label>
                                            <Input value={newLead.noticePeriod} onChange={e => setNewLead({ ...newLead, noticePeriod: e.target.value })} placeholder="e.g. 30 days" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Resume Link</label>
                                            <Input value={newLead.resumeUrl} onChange={e => setNewLead({ ...newLead, resumeUrl: e.target.value })} placeholder="https://drive.google.com/..." />
                                        </div>
                                    </>
                                )}

                                {(newLead.leadType === 'SERVICE_REQUEST' || newLead.leadType === 'SOFTWARE_REQUEST') && (
                                    <>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Company Name</label>
                                            <Input value={newLead.companyName} onChange={e => setNewLead({ ...newLead, companyName: e.target.value })} placeholder="Acme Corp" />
                                        </div>
                                    </>
                                )}

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Location</label>
                                    <Input value={newLead.location} onChange={e => setNewLead({ ...newLead, location: e.target.value })} placeholder="City, State" />
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
                                    <SelectItem value="LOST">Lost</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={leadTypeFilter} onValueChange={setLeadTypeFilter}>
                                <SelectTrigger className="w-[160px]">
                                    <SelectValue placeholder="Lead Type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL">All Types</SelectItem>
                                    <SelectItem value="GENERAL">General</SelectItem>
                                    <SelectItem value="TRAINING">Training</SelectItem>
                                    <SelectItem value="JOB_ENQUIRY">Job Enquiry</SelectItem>
                                    <SelectItem value="SOFTWARE_REQUEST">Software Request</SelectItem>
                                    <SelectItem value="SERVICE_REQUEST">Service Request</SelectItem>
                                </SelectContent>
                            </Select>
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
                    
                    {/* Advanced Filters based on Lead Type */}
                    {leadTypeFilter !== 'ALL' && leadTypeFilter !== 'GENERAL' && (
                        <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-dashed border-border/60">
                            <span className="text-sm font-medium text-muted-foreground flex items-center mr-2">Advanced Filters:</span>
                            
                            {leadTypeFilter === 'JOB_ENQUIRY' && (
                                <>
                                    <Select value={experienceLevelFilter} onValueChange={setExperienceLevelFilter}>
                                        <SelectTrigger className="w-[150px] h-8 text-xs">
                                            <SelectValue placeholder="Experience" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="ALL">All Experience</SelectItem>
                                            <SelectItem value="FRESHER">Fresher</SelectItem>
                                            <SelectItem value="1_3_YEARS">1-3 Years</SelectItem>
                                            <SelectItem value="3_5_YEARS">3-5 Years</SelectItem>
                                            <SelectItem value="5_PLUS_YEARS">5+ Years</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <Input 
                                        className="w-[180px] h-8 text-xs" 
                                        placeholder="Interested Role..." 
                                        value={interestedRoleFilter} 
                                        onChange={(e) => setInterestedRoleFilter(e.target.value)} 
                                    />
                                </>
                            )}

                            {leadTypeFilter === 'TRAINING' && (
                                <>
                                    <Input 
                                        className="w-[180px] h-8 text-xs" 
                                        placeholder="Course Name..." 
                                        value={courseNameFilter} 
                                        onChange={(e) => setCourseNameFilter(e.target.value)} 
                                    />
                                    <Input 
                                        className="w-[180px] h-8 text-xs" 
                                        placeholder="College / University..." 
                                        value={collegeFilter} 
                                        onChange={(e) => setCollegeFilter(e.target.value)} 
                                    />
                                    <Select value={hasDemoFilter} onValueChange={setHasDemoFilter}>
                                        <SelectTrigger className="w-[150px] h-8 text-xs">
                                            <SelectValue placeholder="Demo Status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="ALL">All Demo Status</SelectItem>
                                            <SelectItem value="WITH_DEMO">Has Demo Scheduled</SelectItem>
                                            <SelectItem value="WITHOUT_DEMO">No Demo</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </>
                            )}

                            {(leadTypeFilter === 'SERVICE_REQUEST' || leadTypeFilter === 'SOFTWARE_REQUEST') && (
                                <>
                                    <Input 
                                        className="w-[200px] h-8 text-xs" 
                                        placeholder="Company Name..." 
                                        value={companyNameFilter} 
                                        onChange={(e) => setCompanyNameFilter(e.target.value)} 
                                    />
                                </>
                            )}
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
                                            <TableHead>Name & Contact</TableHead>
                                            {leadTypeFilter === 'JOB_ENQUIRY' ? (
                                                <>
                                                    <TableHead>Role & Experience</TableHead>
                                                    <TableHead>Resume & CTC</TableHead>
                                                </>
                                            ) : leadTypeFilter === 'TRAINING' ? (
                                                <>
                                                    <TableHead>Course</TableHead>
                                                    <TableHead>College & Qual.</TableHead>
                                                </>
                                            ) : (leadTypeFilter === 'SERVICE_REQUEST' || leadTypeFilter === 'SOFTWARE_REQUEST') ? (
                                                <>
                                                    <TableHead>Company</TableHead>
                                                    <TableHead>Request Notes</TableHead>
                                                </>
                                            ) : (
                                                <TableHead>Category/Interest</TableHead>
                                            )}
                                            <TableHead>Source</TableHead>
                                            <TableHead>Assigned To</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Added On</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredLeads.map((lead) => (
                                        <React.Fragment key={lead.id}>
<TableRow className={viewingLead?.id === lead.id ? "bg-primary/5 shadow-[inset_4px_0_0_0_rgb(99,102,241)] transition-all" : "hover:bg-slate-50 transition-colors"}>
                                            <TableCell>
                                                <div className="font-medium flex items-center gap-2">
                                                    {lead.name}
                                                    {lead.isMasked && <Badge variant="secondary" className="text-[9px] px-1 py-0 h-4">MASKED</Badge>}
                                                </div>
                                                <div className="text-xs text-muted-foreground">{lead.email}</div>
                                                <div className="text-xs text-muted-foreground flex items-center gap-1">
                                                    {lead.phone}
                                                    {lead.phone && !lead.isMasked && (
                                                        <a href={`tel:${lead.phone}`} className="text-indigo-600 hover:text-indigo-800 p-0.5 rounded-md hover:bg-indigo-50 transition-colors" title="Call">
                                                            <Phone className="h-3 w-3" />
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
                                                {lead.revenueGenerated !== undefined && lead.revenueGenerated > 0 && (
                                                    <div className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 rounded px-1.5 py-0.5 inline-block mt-1">
                                                        Revenue: Rs. {lead.revenueGenerated}
                                                    </div>
                                                )}
                                            </TableCell>
                                            {leadTypeFilter === 'JOB_ENQUIRY' ? (
                                                <>
                                                    <TableCell>
                                                        <div className="font-semibold text-sm text-primary">{lead.interestedRole || '-'}</div>
                                                        <div className="text-xs text-muted-foreground mt-0.5">Exp: {lead.experienceLevel?.replace(/_/g, ' ') || 'Fresher'}</div>
                                                    </TableCell>
                                                    <TableCell>
                                                        {lead.resumeUrl ? (
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <a href={lead.resumeUrl} target="_blank" rel="noreferrer" className="text-[11px] font-medium text-blue-600 bg-blue-50 border border-blue-100 rounded px-2 py-0.5 hover:bg-blue-100 transition-colors">View</a>
                                                                <a href={lead.resumeUrl} download target="_blank" rel="noreferrer" className="text-[11px] font-medium text-slate-600 bg-slate-50 border border-slate-200 rounded px-2 py-0.5 hover:bg-slate-100 transition-colors">Download</a>
                                                            </div>
                                                        ) : (
                                                            <div className="text-xs text-muted-foreground mt-1">-</div>
                                                        )}
                                                        {(lead.currentCTC || lead.expectedCTC) && (
                                                            <div className="text-[10px] text-muted-foreground mt-1">
                                                                CTC: {lead.currentCTC || '-'} / {lead.expectedCTC || '-'}
                                                            </div>
                                                        )}
                                                    </TableCell>
                                                </>
                                            ) : leadTypeFilter === 'TRAINING' ? (
                                                <>
                                                    <TableCell>
                                                        <div className="font-semibold text-sm text-primary">{lead.courseName || '-'}</div>
                                                        {lead.demoSchedules && lead.demoSchedules.length > 0 && (
                                                            <div className="mt-1">
                                                                <Badge variant={lead.demoSchedules[0].status === 'COMPLETED' ? 'outline' : 'default'} className="text-[10px] py-0">
                                                                    {lead.demoSchedules[0].status === 'COMPLETED' ? 'Demo Completed' : 'Demo Scheduled'}
                                                                </Badge>
                                                                <div className="text-[10px] text-muted-foreground mt-0.5">
                                                                    {format(new Date(lead.demoSchedules[0].scheduledAt), 'dd MMM, hh:mm a')}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="text-xs text-foreground font-medium">{lead.college || '-'}</div>
                                                        <div className="text-[10px] text-muted-foreground mt-0.5">{lead.qualification || '-'}</div>
                                                    </TableCell>
                                                </>
                                            ) : (leadTypeFilter === 'SERVICE_REQUEST' || leadTypeFilter === 'SOFTWARE_REQUEST') ? (
                                                <>
                                                    <TableCell>
                                                        <div className="font-semibold text-sm text-primary">{lead.companyName || '-'}</div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="text-xs text-muted-foreground max-w-[150px] truncate" title={lead.notes || ''}>
                                                            {lead.notes || '-'}
                                                        </div>
                                                    </TableCell>
                                                </>
                                            ) : (
                                                <TableCell>
                                                    <Badge variant="outline" className="mb-1 text-[10px]">{lead.leadType?.replace(/_/g, ' ') || 'GENERAL'}</Badge>
                                                    <div className="font-semibold text-sm text-primary">
                                                        {lead.courseName || (lead.notes?.includes('course:') ? lead.notes.split('course:')[1].split('|')[0].trim() : '-')}
                                                    </div>
                                                </TableCell>
                                            )}
                                            
                                            <TableCell>
                                                <Badge variant="outline">{lead.source}</Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Select
                                                    value={lead.assignedTo || 'UNASSIGNED'}
                                                    onValueChange={(val) => handleAssigneeChange(lead.id, val)}
                                                >
                                                    <SelectTrigger className="h-8 w-[140px] border border-input bg-background">
                                                        <SelectValue placeholder="Unassigned" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="UNASSIGNED">Unassigned</SelectItem>
                                                        {staff.map(member => (
                                                            <SelectItem key={member.id} value={member.id}>{member.name}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
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
                                                {format(new Date(lead.createdAt), 'dd MMM yyyy')}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {leadTypeFilter === 'TRAINING' && lead.demoSchedules && lead.demoSchedules.length > 0 && lead.demoSchedules[0].status === 'SCHEDULED' && (
                                                    <>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-8 text-[11px] text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 mr-1 border border-indigo-200"
                                                            onClick={() => {
                                                                setManageDemoLead(lead);
                                                                setMeetingLink(lead.demoSchedules![0].meetingLink || '');
                                                            }}
                                                        >
                                                            <Video className="h-3 w-3 mr-1" /> Manage Demo
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-8 text-[11px] text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 mr-1 border border-emerald-200"
                                                            onClick={() => handleDemoStatusChange(lead.id, lead.demoSchedules![0].id, 'COMPLETED')}
                                                        >
                                                            <CheckCircle2 className="h-3 w-3 mr-1" /> Demo Done
                                                        </Button>
                                                    </>
                                                )}

                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-slate-600 hover:text-slate-900 hover:bg-slate-100 mr-1"
                                                    onClick={() => setViewingLead(viewingLead?.id === lead.id ? null : lead)}
                                                    title={viewingLead?.id === lead.id ? "Close Details" : "View Details"}
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 mr-1"
                                                    onClick={() => handleEditLead(lead)}
                                                    title="Edit Lead"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-purple-600 hover:text-purple-700 hover:bg-purple-50 mr-1"
                                                    onClick={() => setEmailLead(lead)}
                                                    title="Send Email"
                                                >
                                                    <Mail className="h-4 w-4" />
                                                </Button>
                                                
                                                {lead.phone && (
                                                    <>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 mr-1"
                                                            onClick={() => window.open(`tel:${lead.phone}`, '_self')}
                                                            title="Call Lead"
                                                        >
                                                            <Phone className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50 mr-1"
                                                            onClick={() => setWhatsAppLead(lead)}
                                                            title="WhatsApp AI Chat Log"
                                                        >
                                                            <MessageCircle className="h-4 w-4" />
                                                        </Button>
                                                    </>
                                                )}
                                                
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                                                    onClick={() => handleDelete(lead.id)}
                                                    title="Delete"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                        {viewingLead?.id === lead.id && (
                                            <TableRow className="bg-slate-50/80 hover:bg-slate-50/80 border-b-2 border-primary/20">
                                                <TableCell colSpan={8} className="p-0">
                                                    <div className="p-6 animate-in slide-in-from-top-2 duration-300 shadow-inner border-t border-slate-200">
                                                        <div className="flex justify-between items-center mb-4">
                                                            <h3 className="text-lg font-bold text-slate-800">Lead Profile</h3>
                                                            <Button variant="ghost" size="sm" onClick={() => setViewingLead(null)}>Close</Button>
                                                        </div>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                            <div className="space-y-4">
                                                                <div>
                                                                    <h4 className="text-sm font-semibold text-muted-foreground border-b pb-1 mb-2">Contact Info</h4>
                                                                    <div className="space-y-2 text-sm">
                                                                        <p><span className="font-medium">Name:</span> {viewingLead.name}</p>
                                                                        <p><span className="font-medium">Email:</span> {viewingLead.email || 'N/A'}</p>
                                                                        <p><span className="font-medium">Phone:</span> {viewingLead.phone || 'N/A'}</p>
                                                                        <p><span className="font-medium">Location:</span> {viewingLead.location || 'N/A'}</p>
                                                                    </div>
                                                                </div>
                                                                <div>
                                                                    <h4 className="text-sm font-semibold text-muted-foreground border-b pb-1 mb-2">Academic & Career</h4>
                                                                    <div className="space-y-2 text-sm">
                                                                        <p><span className="font-medium">College:</span> {viewingLead.college || 'N/A'}</p>
                                                                        <p><span className="font-medium">Qualification:</span> {viewingLead.qualification || 'N/A'}</p>
                                                                        <p><span className="font-medium">Experience:</span> {viewingLead.experienceLevel?.replace(/_/g, ' ') || 'N/A'}</p>
                                                                        {viewingLead.resumeUrl && (
                                                                            <p><span className="font-medium">Resume:</span> <a href={viewingLead.resumeUrl} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline">View PDF</a></p>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="space-y-4">
                                                                <div>
                                                                    <h4 className="text-sm font-semibold text-muted-foreground border-b pb-1 mb-2">Lead Specifics</h4>
                                                                    <div className="space-y-2 text-sm">
                                                                        <p><span className="font-medium">Type:</span> <Badge variant="secondary">{viewingLead.leadType}</Badge></p>
                                                                        <p><span className="font-medium">Status:</span> <Badge className={getStatusColor(viewingLead.status)}>{viewingLead.status}</Badge></p>
                                                                        <p><span className="font-medium">Source:</span> {viewingLead.source}</p>
                                                                        {viewingLead.courseName && <p><span className="font-medium">Course:</span> {viewingLead.courseName}</p>}
                                                                        {viewingLead.interestedRole && <p><span className="font-medium">Role:</span> {viewingLead.interestedRole}</p>}
                                                                        {viewingLead.companyName && <p><span className="font-medium">Company:</span> {viewingLead.companyName}</p>}
                                                                    </div>
                                                                </div>
                                                                <div>
                                                                    <h4 className="text-sm font-semibold text-muted-foreground border-b pb-1 mb-2">Financials</h4>
                                                                    <div className="space-y-2 text-sm">
                                                                        <p><span className="font-medium">Current CTC:</span> {viewingLead.currentCTC || 'N/A'}</p>
                                                                        <p><span className="font-medium">Expected CTC:</span> {viewingLead.expectedCTC || 'N/A'}</p>
                                                                        {(viewingLead.revenueGenerated ?? 0) > 0 && <p><span className="font-medium text-emerald-600">Revenue:</span> Rs. {viewingLead.revenueGenerated}</p>}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="md:col-span-2">
                                                                <h4 className="text-sm font-semibold text-muted-foreground border-b pb-1 mb-2">Notes</h4>
                                                                <div className="bg-muted/50 p-3 rounded-md text-sm whitespace-pre-wrap min-h-[60px]">
                                                                    {viewingLead.notes || 'No notes available.'}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </React.Fragment>
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

            {/* Manage Demo Dialog */}
            <Dialog open={!!manageDemoLead} onOpenChange={(open) => { if (!open) setManageDemoLead(null) }}>
                <DialogContent className="sm:max-w-md p-6">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-indigo-900">
                            <Video className="w-5 h-5 text-indigo-600" />
                            <span>Manage Demo Meeting</span>
                        </DialogTitle>
                        <DialogDescription>
                            Assign a meeting link and notify the student.
                        </DialogDescription>
                    </DialogHeader>

                    {manageDemoLead && manageDemoLead.demoSchedules && manageDemoLead.demoSchedules[0] && (
                        <div className="space-y-4 my-4">
                            <div className="bg-slate-50 p-3 rounded-lg text-sm border">
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="text-slate-500">Student:</div>
                                    <div className="font-medium text-slate-800">{manageDemoLead.name}</div>
                                    <div className="text-slate-500">Scheduled For:</div>
                                    <div className="font-medium text-slate-800">{format(new Date(manageDemoLead.demoSchedules[0].scheduledAt), 'dd MMM yyyy, hh:mm a')}</div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">Meeting Link (Google Meet / Zoom)</label>
                                <Input 
                                    placeholder="https://meet.google.com/xyz-abcd-efg" 
                                    value={meetingLink} 
                                    onChange={(e) => setMeetingLink(e.target.value)} 
                                />
                            </div>

                            <div className="space-y-3 pt-2">
                                <label className="text-sm font-semibold text-slate-700">Automated Notifications</label>
                                <div className="flex items-center gap-2">
                                    <input 
                                        type="checkbox" 
                                        id="sendEmailCheck" 
                                        checked={sendEmailInvite} 
                                        onChange={(e) => setSendEmailInvite(e.target.checked)}
                                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                                    />
                                    <label htmlFor="sendEmailCheck" className="text-sm text-slate-600 flex items-center gap-1 cursor-pointer">
                                        <Mail className="h-4 w-4" /> Send Email Invitation
                                    </label>
                                </div>
                                <div className="flex items-center gap-2">
                                    <input 
                                        type="checkbox" 
                                        id="sendWhatsappCheck" 
                                        checked={sendWhatsAppInvite} 
                                        onChange={(e) => setSendWhatsAppInvite(e.target.checked)}
                                        className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-600"
                                    />
                                    <label htmlFor="sendWhatsappCheck" className="text-sm text-slate-600 flex items-center gap-1 cursor-pointer">
                                        <MessageCircle className="h-4 w-4" /> Send WhatsApp Invitation
                                    </label>
                                </div>
                            </div>
                        </div>
                    )}

                    <DialogFooter className="sm:justify-end">
                        <Button variant="outline" onClick={() => setManageDemoLead(null)}>Cancel</Button>
                        <Button onClick={handleManageDemoSubmit} disabled={isSendingDemo || !meetingLink}>
                            {isSendingDemo ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                            Save & Send Invite
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* WhatsApp AI Agent Chat logs & manual send modal */}
            <Dialog open={!!whatsAppLead} onOpenChange={(open) => { if (!open) setWhatsAppLead(null) }}>
                <DialogContent className="sm:max-w-md max-h-[85vh] flex flex-col p-6">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-indigo-900">
                            <MessageCircle className="w-5 h-5 text-green-600" />
                            <span>WhatsApp AI Agent Chat</span>
                        </DialogTitle>
                        <DialogDescription>
                            Chat logs for <strong>{whatsAppLead?.name}</strong> ({whatsAppLead?.phone})
                        </DialogDescription>
                    </DialogHeader>

                    {/* Chat Bubble History Workspace */}
                    <div className="flex-1 overflow-y-auto my-4 p-4 border rounded-xl bg-slate-50 space-y-3 min-h-[300px] max-h-[450px]">
                        {isWhatsAppLoading ? (
                            <div className="flex justify-center items-center h-full py-12">
                                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                            </div>
                        ) : whatsAppLogs.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground text-xs">
                                No chat history found for this number. Start typing below to send a message.
                            </div>
                        ) : (
                            whatsAppLogs.map(log => (
                                <div key={log.id} className={`flex flex-col ${log.sender === 'USER' ? 'items-start' : 'items-end'}`}>
                                    <span className="text-[10px] text-slate-400 font-bold mb-0.5">
                                        {log.sender === 'USER' ? 'User' : 'AI Agent / Counselor'} • {format(new Date(log.createdAt), 'hh:mm a')}
                                    </span>
                                    <div className={`p-3 rounded-2xl text-xs max-w-[85%] leading-relaxed ${
                                        log.sender === 'USER' 
                                            ? 'bg-white border border-slate-200 text-slate-800 rounded-tl-none' 
                                            : 'bg-indigo-600 text-white rounded-tr-none'
                                    }`}>
                                        {log.message}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {showTemplates && (
                        <div className="bg-slate-100 border rounded-xl p-3 mb-2 max-h-48 overflow-y-auto">
                            <div className="flex justify-between items-center mb-2">
                                <h4 className="text-xs font-bold text-slate-500 uppercase">Quick Templates</h4>
                                <Button variant="ghost" size="sm" className="h-5 w-5 p-0 text-slate-500 hover:bg-slate-200" onClick={() => setShowTemplates(false)}>✕</Button>
                            </div>
                            <div className="grid gap-2">
                                {templates.filter(t => t.type === 'WHATSAPP').length === 0 ? (
                                    <p className="text-xs text-muted-foreground">No WhatsApp templates available.</p>
                                ) : (
                                    templates.filter(t => t.type === 'WHATSAPP').map(t => (
                                        <div 
                                            key={t.id} 
                                            onClick={() => { setWhatsAppInput(t.content); setShowTemplates(false); }} 
                                            className="p-2 bg-white rounded cursor-pointer border hover:border-indigo-300 transition text-xs"
                                        >
                                            <p className="font-semibold text-indigo-600 mb-0.5">{t.title}</p>
                                            <p className="text-muted-foreground line-clamp-2">{t.content}</p>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}

                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-10 w-10 flex-shrink-0"
                            onClick={() => setShowTemplates(!showTemplates)}
                            title="Insert Template"
                        >
                            <FileText className="h-4 w-4 text-slate-600" />
                        </Button>
                        <Input
                            placeholder="Type a message to send..."
                            value={whatsAppInput}
                            onChange={e => setWhatsAppInput(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter') handleSendWhatsApp() }}
                            className="bg-white text-xs h-10"
                        />
                        <Button 
                            onClick={handleSendWhatsApp} 
                            disabled={isSendingMessage || !whatsAppInput.trim()}
                            className="h-10 bg-indigo-600 hover:bg-indigo-700"
                        >
                            {isSendingMessage ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                                <Send className="w-3.5 h-3.5" />
                            )}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>


        </div>
    )
}
