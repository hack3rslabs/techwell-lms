"use client"

import * as React from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Search, Filter, Upload, FileText, Loader2, Sparkles, Phone, Mail, Award, CheckCircle, RefreshCw, MoreVertical, Briefcase, GraduationCap, DollarSign, ExternalLink } from 'lucide-react'
import api from '@/lib/api'
import { toast } from 'sonner'
import { format } from 'date-fns'

interface Candidate {
    id: string
    name: string
    email: string | null
    phone: string | null
    skills: string[]
    category: string
    atsScore: number
    readinessScore: number
    interestType?: string
    experienceLevel?: string
    interestedRole?: string
    paymentStatus: string
    status: string
    createdAt: string
}

const CATEGORIES = [
    { value: 'ALL', label: 'All Categories' },
    { value: 'IT_CLOUD', label: 'Cloud & Infrastructure' },
    { value: 'IT_DEVOPS', label: 'DevOps & CI/CD' },
    { value: 'IT_CYBER_SECURITY', label: 'Cyber Security' },
    { value: 'IT_JAVA', label: 'Java Backend' },
    { value: 'IT_PYTHON', label: 'Python Backend' },
    { value: 'IT_DATA_SCIENCE', label: 'AI & Data Science' },
    { value: 'IT_FULL_STACK', label: 'Full Stack Web' },
    { value: 'NON_IT_HR', label: 'Human Resources' },
    { value: 'NON_IT_SALES', label: 'Sales & BD' },
    { value: 'NON_IT_OTHERS', label: 'General/Other' }
]

const STATUSES = [
    { value: 'ALL', label: 'All Statuses' },
    { value: 'SCREENING', label: 'Screening', color: 'bg-amber-500/10 text-amber-500 border-amber-500/20' },
    { value: 'TRAINING', label: 'Training Recommended', color: 'bg-blue-500/10 text-blue-500 border-blue-500/20' },
    { value: 'INTERVIEW_READY', label: 'Interview Ready', color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' },
    { value: 'PLACED', label: 'Placed', color: 'bg-purple-500/10 text-purple-500 border-purple-500/20' }
]

const PAYMENT_TIERS = [
    { value: 'UNPAID', label: 'Free Tier', color: 'bg-slate-500/10 text-slate-400 border-slate-500/20' },
    { value: 'BASIC', label: 'Basic Paid', color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' },
    { value: 'PROFESSIONAL', label: 'Professional', color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' },
    { value: 'PREMIUM', label: 'Premium VIP', color: 'bg-rose-500/10 text-rose-400 border-rose-500/20 shadow-[0_0_15px_rgba(244,63,94,0.3)]' }
]

export default function CandidatesPage() {
    const [candidates, setCandidates] = React.useState<Candidate[]>([])
    const [isLoading, setIsLoading] = React.useState(true)
    const [searchQuery, setSearchQuery] = React.useState('')
    const [categoryFilter, setCategoryFilter] = React.useState('ALL')
    const [statusFilter, setStatusFilter] = React.useState('ALL')
    const [page, setPage] = React.useState(1)
    const [totalPages, setTotalPages] = React.useState(1)

    // Advanced Filters State
    const [advExp, setAdvExp] = React.useState('')
    const [advSkills, setAdvSkills] = React.useState('')
    const [advPinCode, setAdvPinCode] = React.useState('')
    const [advState, setAdvState] = React.useState('')
    const [advDistrict, setAdvDistrict] = React.useState('')
    const [advEducation, setAdvEducation] = React.useState('')
    const [advYear, setAdvYear] = React.useState('')
    const [advIndustry, setAdvIndustry] = React.useState('')

    // Upload & Parse Dialog
    const [isUploadOpen, setIsUploadOpen] = React.useState(false)
    const [uploadFile, setUploadFile] = React.useState<File | null>(null)
    const [isParsing, setIsParsing] = React.useState(false)

    const [selectedCandidate, setSelectedCandidate] = React.useState<Candidate | null>(null)

    const fetchCandidates = React.useCallback(async () => {
        setIsLoading(true)
        try {
            const params = new URLSearchParams()
            params.append('page', page.toString())
            params.append('limit', '10')
            if (searchQuery) params.append('search', searchQuery)
            if (categoryFilter !== 'ALL') params.append('category', categoryFilter)
            if (statusFilter !== 'ALL') params.append('status', statusFilter)
            
            // Advanced Filters
            if (advExp) params.append('experienceLevel', advExp)
            if (advSkills) params.append('skills', advSkills)
            if (advPinCode) params.append('pinCode', advPinCode)
            if (advState) params.append('state', advState)
            if (advDistrict) params.append('district', advDistrict)
            if (advEducation) params.append('education', advEducation)
            if (advYear) params.append('passedOutYear', advYear)
            if (advIndustry) params.append('industry', advIndustry)

            const res = await api.get(`/candidates?${params.toString()}`)
            setCandidates(res.data.candidates || [])
            setTotalPages(res.data.pagination?.pages || 1)
        } catch (err) {
            console.error('Failed to load candidate list:', err)
            toast.error('Could not fetch candidate database')
        } finally {
            setIsLoading(false)
        }
    }, [page, searchQuery, categoryFilter, statusFilter, advExp, advSkills, advPinCode, advState, advDistrict, advEducation, advYear, advIndustry])

    React.useEffect(() => {
        fetchCandidates()
    }, [fetchCandidates])

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setUploadFile(e.target.files[0])
        }
    }

    const handleParseUpload = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!uploadFile) return
        setIsParsing(true)

        const formData = new FormData()
        formData.append('resume', uploadFile)

        try {
            const res = await api.post('/candidates/parse-upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            })
            toast.success(res.data.message || 'Resume parsed successfully!')
            setUploadFile(null)
            setIsUploadOpen(false)
            fetchCandidates()
        } catch (err: any) {
            console.error('Failed to upload/parse resume:', err)
            const errMsg = err.response?.data?.error || 'Failed to process resume parser'
            toast.error(errMsg)
        } finally {
            setIsParsing(false)
        }
    }

    const handleStatusUpdate = async (id: string, newStatus: string) => {
        try {
            await api.patch(`/candidates/${id}/status`, { status: newStatus })
            setCandidates(prev => prev.map(c => c.id === id ? { ...c, status: newStatus } : c))
            toast.success('Candidate progress status updated')
        } catch (err) {
            console.error('Failed to update candidate status:', err)
            toast.error('Could not update candidate status')
        }
    }

    const handlePaymentUpdate = async (id: string, paymentStatus: string) => {
        try {
            await api.patch(`/candidates/${id}/payment`, { paymentStatus })
            setCandidates(prev => prev.map(c => c.id === id ? { ...c, paymentStatus } : c))
            toast.success('Payment tier updated')
        } catch (err) {
            console.error('Failed to update payment status:', err)
            toast.error('Could not update payment status')
        }
    }

    const handleExportCSV = () => {
        if (candidates.length === 0) {
            toast.error('No candidates to export')
            return
        }

        const headers = ['Name', 'Email', 'Phone', 'Interest', 'Experience', 'Role', 'Category', 'ATS Score', 'Readiness Score', 'Status', 'Payment Tier', 'Joined']
        const csvRows = [headers.join(',')]

        for (const c of candidates) {
            const row = [
                `"${c.name}"`,
                `"${c.email || ''}"`,
                `"${c.phone || ''}"`,
                `"${c.interestType || ''}"`,
                `"${c.experienceLevel || ''}"`,
                `"${c.interestedRole || ''}"`,
                `"${c.category}"`,
                c.atsScore,
                c.readinessScore,
                `"${c.status}"`,
                `"${c.paymentStatus}"`,
                `"${format(new Date(c.createdAt), 'yyyy-MM-dd')}"`
            ]
            csvRows.push(row.join(','))
        }

        const csvString = csvRows.join('\n')
        const blob = new Blob([csvString], { type: 'text/csv' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `candidates_export_${format(new Date(), 'yyyy-MM-dd')}.csv`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
    }

    return (
        <div className="space-y-8 p-6 md:p-8 min-h-screen bg-slate-50 dark:bg-[#020817] text-slate-900 dark:text-slate-50 selection:bg-indigo-500/30">
            {/* Header */}
            <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                <div className="space-y-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-sm font-medium mb-2">
                        <Briefcase className="w-4 h-4" /> CRM Directory
                    </div>
                    <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                        Talent <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-cyan-500 dark:from-indigo-400 dark:to-cyan-400">Pipeline</span>
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 max-w-2xl text-base">
                        Manage your candidate leads, upgrade payment tiers, and track interview readiness through our AI-powered recruitment engine.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white shadow-lg shadow-indigo-500/20 border-0">
                                <Upload className="h-4 w-4 mr-2" /> Resume Parser
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-slate-900 border-slate-800 text-slate-100 sm:max-w-md">
                            <DialogHeader>
                                <DialogTitle className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400 flex items-center gap-2">
                                    <Sparkles className="h-5 w-5 text-indigo-400" /> AI Resume Parser
                                </DialogTitle>
                                <DialogDescription className="text-slate-400">
                                    Upload a PDF resume. Gemini AI will auto-extract skills, education, contact details, and classify the candidate.
                                </DialogDescription>
                            </DialogHeader>

                            <form onSubmit={handleParseUpload} className="space-y-4 mt-4">
                                <div className="border-2 border-dashed border-slate-800 hover:border-indigo-500/50 rounded-xl p-8 bg-slate-950/50 text-center cursor-pointer transition-colors group">
                                    <input
                                        type="file"
                                        accept=".pdf"
                                        onChange={handleFileChange}
                                        className="hidden"
                                        id="resume-file-input"
                                        required
                                    />
                                    <label htmlFor="resume-file-input" className="cursor-pointer space-y-4 flex flex-col items-center">
                                        <div className="p-4 bg-indigo-500/10 rounded-full group-hover:bg-indigo-500/20 transition-colors">
                                            <FileText className="h-8 w-8 text-indigo-400" />
                                        </div>
                                        <span className="text-sm text-slate-300 font-medium">
                                            {uploadFile ? uploadFile.name : 'Click to select PDF Resume (Max 5MB)'}
                                        </span>
                                    </label>
                                </div>

                                <DialogFooter className="pt-4">
                                    <Button type="button" variant="outline" onClick={() => setIsUploadOpen(false)} className="border-slate-800 bg-transparent text-slate-300 hover:bg-slate-800">
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={isParsing || !uploadFile} className="bg-indigo-600 hover:bg-indigo-500 text-white">
                                        {isParsing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                        {isParsing ? 'Extracting Data...' : 'Parse & Save Lead'}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                    
                    <Button variant="outline" onClick={handleExportCSV} className="border-slate-800 bg-slate-900/50 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10">
                        <FileText className="h-4 w-4 mr-2" /> Export
                    </Button>
                    
                    <Button variant="outline" size="icon" onClick={fetchCandidates} className="border-slate-800 bg-slate-900/50 text-slate-400 hover:text-white hover:bg-slate-800">
                        <RefreshCw className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Filters Section */}
            <Card className="bg-slate-900/40 border-slate-800/60 backdrop-blur-sm">
                <CardContent className="p-4 flex flex-col md:flex-row gap-4 items-center">
                    <div className="flex-1 relative w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                        <Input
                            placeholder="Search by name, skills, or role..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="pl-9 bg-slate-950/50 border-slate-800 text-slate-100 placeholder:text-slate-500 h-11 rounded-lg focus-visible:ring-indigo-500/50"
                        />
                    </div>
                    <div className="w-full md:w-56">
                        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                            <SelectTrigger className="bg-slate-950/50 border-slate-800 text-slate-100 h-11 rounded-lg">
                                <SelectValue placeholder="Category" />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-900 border-slate-800 text-slate-100">
                                {CATEGORIES.map(cat => (
                                    <SelectItem key={cat.value} value={cat.value} className="focus:bg-slate-800 focus:text-white cursor-pointer">
                                        {cat.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="w-full md:w-48">
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="bg-slate-950/50 border-slate-800 text-slate-100 h-11 rounded-lg">
                                <SelectValue placeholder="Pipeline Status" />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-900 border-slate-800 text-slate-100">
                                {STATUSES.map(st => (
                                    <SelectItem key={st.value} value={st.value} className="focus:bg-slate-800 focus:text-white cursor-pointer">
                                        {st.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="outline" className="border-slate-800 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 hover:text-indigo-300 h-11">
                                <Filter className="h-4 w-4 mr-2" /> Advanced
                            </Button>
                        </SheetTrigger>
                        <SheetContent className="bg-slate-950 border-l border-slate-800 text-slate-100 w-[400px] sm:max-w-[500px] overflow-y-auto">
                            <SheetHeader className="mb-6">
                                <SheetTitle className="text-2xl font-bold text-white flex items-center gap-2">
                                    <Filter className="h-5 w-5 text-indigo-400" /> Advanced Filters
                                </SheetTitle>
                                <SheetDescription className="text-slate-400">
                                    Filter the candidate pipeline by deep demographics and professional details.
                                </SheetDescription>
                            </SheetHeader>
                            
                            <div className="space-y-6">
                                <div className="space-y-4 border-b border-slate-800 pb-6">
                                    <h4 className="text-sm font-semibold text-indigo-400 uppercase tracking-wider">Demographics</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-xs text-slate-400 font-medium">State</label>
                                            <Input value={advState} onChange={e => setAdvState(e.target.value)} placeholder="State" className="bg-slate-900 border-slate-800 text-sm h-10" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs text-slate-400 font-medium">District</label>
                                            <Input value={advDistrict} onChange={e => setAdvDistrict(e.target.value)} placeholder="District" className="bg-slate-900 border-slate-800 text-sm h-10" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs text-slate-400 font-medium">Pin Code</label>
                                            <Input value={advPinCode} onChange={e => setAdvPinCode(e.target.value)} placeholder="Pin Code" className="bg-slate-900 border-slate-800 text-sm h-10" />
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="space-y-4 border-b border-slate-800 pb-6">
                                    <h4 className="text-sm font-semibold text-indigo-400 uppercase tracking-wider">Education</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-xs text-slate-400 font-medium">Highest Degree</label>
                                            <Input value={advEducation} onChange={e => setAdvEducation(e.target.value)} placeholder="e.g. B.Tech" className="bg-slate-900 border-slate-800 text-sm h-10" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs text-slate-400 font-medium">Pass Out Year</label>
                                            <Input value={advYear} onChange={e => setAdvYear(e.target.value)} placeholder="e.g. 2024" className="bg-slate-900 border-slate-800 text-sm h-10" />
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="space-y-4">
                                    <h4 className="text-sm font-semibold text-indigo-400 uppercase tracking-wider">Professional</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-xs text-slate-400 font-medium">Experience Level</label>
                                            <Select value={advExp} onValueChange={setAdvExp}>
                                                <SelectTrigger className="bg-slate-900 border-slate-800 text-sm h-10">
                                                    <SelectValue placeholder="Any" />
                                                </SelectTrigger>
                                                <SelectContent className="bg-slate-800 border-slate-700 text-white">
                                                    <SelectItem value="">Any</SelectItem>
                                                    <SelectItem value="FRESHER">Fresher</SelectItem>
                                                    <SelectItem value="EXPERIENCED">Experienced</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs text-slate-400 font-medium">Industry</label>
                                            <Input value={advIndustry} onChange={e => setAdvIndustry(e.target.value)} placeholder="e.g. IT" className="bg-slate-900 border-slate-800 text-sm h-10" />
                                        </div>
                                        <div className="space-y-2 col-span-2">
                                            <label className="text-xs text-slate-400 font-medium">Top Skills (Comma Separated)</label>
                                            <Input value={advSkills} onChange={e => setAdvSkills(e.target.value)} placeholder="React, Node, Python" className="bg-slate-900 border-slate-800 text-sm h-10" />
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="pt-6">
                                    <Button 
                                        className="w-full bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg"
                                        onClick={fetchCandidates}
                                    >
                                        Apply Advanced Filters
                                    </Button>
                                    <Button 
                                        variant="ghost"
                                        className="w-full mt-2 text-slate-400 hover:text-white hover:bg-slate-800"
                                        onClick={() => {
                                            setAdvExp('')
                                            setAdvSkills('')
                                            setAdvPinCode('')
                                            setAdvState('')
                                            setAdvDistrict('')
                                            setAdvEducation('')
                                            setAdvYear('')
                                            setAdvIndustry('')
                                            setCategoryFilter('ALL')
                                            setStatusFilter('ALL')
                                            setSearchQuery('')
                                        }}
                                    >
                                        Clear Filters
                                    </Button>
                                </div>
                            </div>
                        </SheetContent>
                    </Sheet>
                </CardContent>
            </Card>

            {/* Candidates Table */}
            <Card className="bg-slate-900/40 border-slate-800/60 shadow-xl overflow-hidden backdrop-blur-sm">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader className="bg-slate-950/50 border-b border-slate-800">
                            <TableRow className="border-none hover:bg-transparent">
                                <TableHead className="text-slate-400 font-semibold h-12 py-3 px-4">Candidate</TableHead>
                                <TableHead className="text-slate-400 font-semibold h-12 py-3 px-4">Role & Domain</TableHead>
                                <TableHead className="text-slate-400 font-semibold h-12 py-3 px-4 text-center">AI Scores</TableHead>
                                <TableHead className="text-slate-400 font-semibold h-12 py-3 px-4">Top Skills</TableHead>
                                <TableHead className="text-slate-400 font-semibold h-12 py-3 px-4">Monetization</TableHead>
                                <TableHead className="text-slate-400 font-semibold h-12 py-3 px-4">Status</TableHead>
                                <TableHead className="text-slate-400 font-semibold h-12 py-3 px-4 text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-64 text-center">
                                        <Loader2 className="h-8 w-8 animate-spin text-indigo-500 mx-auto" />
                                        <p className="text-slate-400 mt-4 text-sm">Loading talent pipeline...</p>
                                    </TableCell>
                                </TableRow>
                            ) : candidates.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-64 text-center">
                                        <div className="flex flex-col items-center justify-center text-slate-500">
                                            <Briefcase className="h-12 w-12 mb-4 text-slate-700" />
                                            <p className="text-base font-medium text-slate-300">No candidates found</p>
                                            <p className="text-sm mt-1">Try adjusting your search filters or add a new lead.</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                candidates.map(candidate => {
                                    const statusObj = STATUSES.find(s => s.value === candidate.status)
                                    const tierObj = PAYMENT_TIERS.find(t => t.value === candidate.paymentStatus)
                                    
                                    return (
                                        <TableRow key={candidate.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors group">
                                            <TableCell className="px-4 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-300 font-bold border border-indigo-500/30">
                                                        {candidate.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <div className="font-semibold text-slate-200">{candidate.name}</div>
                                                        <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-500">
                                                            {candidate.email && (
                                                                <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> {candidate.email}</span>
                                                            )}
                                                            {candidate.phone && (
                                                                <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {candidate.phone}</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            
                                            <TableCell className="px-4 py-4">
                                                <div className="font-medium text-slate-300 text-sm">
                                                    {candidate.interestedRole || 'Open to Roles'}
                                                </div>
                                                <div className="flex items-center gap-2 mt-1.5">
                                                    <Badge variant="outline" className="text-[10px] bg-slate-900 border-slate-700 text-slate-400 font-normal px-1.5 rounded">
                                                        {CATEGORIES.find(c => c.value === candidate.category)?.label || candidate.category}
                                                    </Badge>
                                                    {candidate.experienceLevel === 'FRESHER' && (
                                                        <Badge variant="outline" className="text-[10px] bg-emerald-500/10 border-emerald-500/20 text-emerald-400 font-normal px-1.5 rounded">
                                                            Fresher
                                                        </Badge>
                                                    )}
                                                    {candidate.experienceLevel === 'EXPERIENCED' && (
                                                        <Badge variant="outline" className="text-[10px] bg-amber-500/10 border-amber-500/20 text-amber-400 font-normal px-1.5 rounded">
                                                            Exp
                                                        </Badge>
                                                    )}
                                                </div>
                                            </TableCell>
                                            
                                            <TableCell className="px-4 py-4 text-center">
                                                <div className="flex flex-col items-center justify-center gap-1.5">
                                                    <div className="flex items-center gap-2 text-xs w-24">
                                                        <span className="text-slate-500 w-8 text-right">ATS:</span>
                                                        <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                                            <div className="h-full bg-cyan-400 rounded-full" style={{ width: `${candidate.atsScore}%` }} />
                                                        </div>
                                                        <span className="font-medium text-cyan-400 w-6">{candidate.atsScore}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-xs w-24">
                                                        <span className="text-slate-500 w-8 text-right">Read:</span>
                                                        <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                                            <div className="h-full bg-indigo-400 rounded-full" style={{ width: `${candidate.readinessScore}%` }} />
                                                        </div>
                                                        <span className="font-medium text-indigo-400 w-6">{candidate.readinessScore}</span>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            
                                            <TableCell className="px-4 py-4 max-w-[200px]">
                                                <div className="flex flex-wrap gap-1.5">
                                                    {(Array.isArray(candidate.skills) ? candidate.skills : []).slice(0, 3).map((skill, idx) => (
                                                        <Badge key={idx} variant="outline" className="text-[10px] bg-slate-100 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/50 text-slate-700 dark:text-slate-300 font-normal">
                                                            {skill}
                                                        </Badge>
                                                    ))}
                                                    {Array.isArray(candidate.skills) && candidate.skills.length > 3 && (
                                                        <Badge variant="outline" className="text-[10px] bg-slate-100 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/50 text-slate-600 dark:text-slate-400 font-normal">
                                                            +{candidate.skills.length - 3}
                                                        </Badge>
                                                    )}
                                                </div>
                                            </TableCell>

                                            <TableCell className="px-4 py-4 w-[160px]">
                                                <Select
                                                    value={candidate.paymentStatus}
                                                    onValueChange={(val) => handlePaymentUpdate(candidate.id, val)}
                                                >
                                                    <SelectTrigger className={`h-8 text-xs border-0 ${tierObj?.color} bg-white dark:bg-slate-900/50 hover:bg-slate-50 dark:hover:bg-slate-800/80`}>
                                                        <div className="flex items-center gap-1.5 font-semibold">
                                                            <DollarSign className="w-3 h-3" />
                                                            {tierObj?.label}
                                                        </div>
                                                    </SelectTrigger>
                                                    <SelectContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-200 min-w-[140px]">
                                                        {PAYMENT_TIERS.map(t => (
                                                            <SelectItem key={t.value} value={t.value} className="text-xs focus:bg-slate-100 dark:focus:bg-slate-800 cursor-pointer py-2">
                                                                {t.label}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </TableCell>
                                            
                                            <TableCell className="px-4 py-4 w-[180px]">
                                                <Select
                                                    value={candidate.status}
                                                    onValueChange={(val) => handleStatusUpdate(candidate.id, val)}
                                                >
                                                    <SelectTrigger className={`h-8 text-xs border-0 ${statusObj?.color} bg-white dark:bg-slate-900/50 hover:bg-slate-50 dark:hover:bg-slate-800/80`}>
                                                        <span className="font-semibold">{statusObj?.label}</span>
                                                    </SelectTrigger>
                                                    <SelectContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-200 min-w-[160px]">
                                                        {STATUSES.filter(s => s.value !== 'ALL').map(s => (
                                                            <SelectItem key={s.value} value={s.value} className="text-xs focus:bg-slate-100 dark:focus:bg-slate-800 cursor-pointer py-2">
                                                                {s.label}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </TableCell>

                                            <TableCell className="px-4 py-4 text-right">
                                                <Button 
                                                    variant="ghost" 
                                                    size="sm" 
                                                    className="h-8 px-2 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 hover:bg-indigo-500/10"
                                                    onClick={() => setSelectedCandidate(candidate)}
                                                >
                                                    <ExternalLink className="h-4 w-4 mr-1" /> View
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    )
                                })
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination Controls */}
                {!isLoading && totalPages > 1 && (
                    <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-800/60 bg-slate-950/30">
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={page === 1}
                            onClick={() => setPage(p => p - 1)}
                            className="border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white"
                        >
                            Previous
                        </Button>
                        <span className="text-xs font-medium text-slate-400">
                            Page <span className="text-white">{page}</span> of {totalPages}
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={page === totalPages}
                            onClick={() => setPage(p => p + 1)}
                            className="border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white"
                        >
                            Next
                        </Button>
                    </div>
                )}
            </Card>

            {/* Candidate Details Sheet */}
            <Sheet open={!!selectedCandidate} onOpenChange={(open) => !open && setSelectedCandidate(null)}>
                <SheetContent className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 sm:max-w-xl overflow-y-auto w-[400px] sm:w-[540px]">
                    <SheetHeader className="border-b border-slate-100 dark:border-slate-800 pb-6 mb-6">
                        <div className="flex items-start gap-4">
                            <div className="w-16 h-16 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 text-2xl font-bold border border-indigo-500/30 shrink-0">
                                {selectedCandidate?.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <SheetTitle className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                                    {selectedCandidate?.name}
                                </SheetTitle>
                                <div className="text-sm font-medium text-slate-600 dark:text-slate-400 mt-1">
                                    {selectedCandidate?.interestedRole || 'Open to Roles'}
                                </div>
                                <div className="flex items-center gap-3 mt-2 text-xs text-slate-500 dark:text-slate-400">
                                    {selectedCandidate?.email && (
                                        <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> {selectedCandidate.email}</span>
                                    )}
                                    {selectedCandidate?.phone && (
                                        <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {selectedCandidate.phone}</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </SheetHeader>
                    
                    <div className="space-y-6 pb-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                                <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">ATS Match Score</div>
                                <div className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">{selectedCandidate?.atsScore}%</div>
                            </div>
                            <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                                <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Interview Readiness</div>
                                <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{selectedCandidate?.readinessScore}/100</div>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-200 mb-3 flex items-center gap-2">
                                <Award className="h-4 w-4 text-indigo-500" /> Extracted Skills
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {Array.isArray(selectedCandidate?.skills) && selectedCandidate.skills.map((skill, idx) => (
                                    <Badge key={idx} variant="secondary" className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-medium">
                                        {skill}
                                    </Badge>
                                ))}
                                {(!Array.isArray(selectedCandidate?.skills) || selectedCandidate.skills.length === 0) && (
                                    <span className="text-sm text-slate-400 italic">No skills extracted yet.</span>
                                )}
                            </div>
                        </div>

                        <div>
                            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-200 mb-3 flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-emerald-500" /> System Metrics
                            </h3>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="text-slate-500 block text-xs mb-1">Payment Tier</span>
                                    <span className="font-semibold text-slate-800 dark:text-slate-300">{selectedCandidate?.paymentStatus}</span>
                                </div>
                                <div>
                                    <span className="text-slate-500 block text-xs mb-1">Recruitment Status</span>
                                    <span className="font-semibold text-slate-800 dark:text-slate-300">{selectedCandidate?.status}</span>
                                </div>
                                <div>
                                    <span className="text-slate-500 block text-xs mb-1">Category</span>
                                    <span className="font-semibold text-slate-800 dark:text-slate-300">{selectedCandidate?.category.replace('IT_', '').replace('_', ' ')}</span>
                                </div>
                                <div>
                                    <span className="text-slate-500 block text-xs mb-1">Experience</span>
                                    <span className="font-semibold text-slate-800 dark:text-slate-300">{selectedCandidate?.experienceLevel || 'Not set'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </SheetContent>
            </Sheet>
        </div>
    )
}
