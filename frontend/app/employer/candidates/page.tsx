"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import api from "@/lib/api"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
    Search, Users, CheckCircle2,
    Loader2, MoreHorizontal, Star, Eye, Calendar, Mail, Briefcase, FileText
} from "lucide-react"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

interface Candidate {
    id: string
    applicationId: string
    name: string
    email: string
    jobTitle: string
    jobId: string
    status: string
    appliedAt: string
    atsScore: number | null
    source: string
}

export default function EmployerCandidatesPage() {
    const [candidates, setCandidates] = useState<Candidate[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [statusFilter, setStatusFilter] = useState("ALL")
    const [selected, setSelected] = useState<Set<string>>(new Set())
    const router = useRouter()

    useEffect(() => {
        fetchCandidates()
    }, [])

    const fetchCandidates = async () => {
        try {
            const jobsRes = await api.get('/jobs/my/listings')
            const jobs = jobsRes.data || []
            const allCandidates: Candidate[] = []

            for (const job of jobs) {
                try {
                    const appsRes = await api.get(`/ats/applications/${job.id}`)
                    const apps = appsRes.data || []
                    for (const app of apps) {
                        allCandidates.push({
                            id: app.id,
                            applicationId: app.id,
                            name: app.applicant?.name || app.externalName || 'Unknown Candidate',
                            email: app.applicant?.email || app.externalEmail || '',
                            jobTitle: job.title,
                            jobId: job.id,
                            status: app.status || 'APPLIED',
                            appliedAt: app.createdAt || app.appliedAt || new Date().toISOString(),
                            atsScore: app.atsScore || null,
                            source: app.applicant ? 'Internal' : 'External',
                        })
                    }
                } catch {
                    // Skip jobs with errors
                }
            }

            setCandidates(allCandidates.sort((a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime()))
        } catch {
            // Error handling
        } finally {
            setIsLoading(false)
        }
    }

    const filteredCandidates = candidates.filter(c => {
        const matchesSearch =
            c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.jobTitle.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter
        return matchesSearch && matchesStatus
    })

    const toggleSelect = (id: string) => {
        setSelected(prev => {
            const next = new Set(prev)
            if (next.has(id)) next.delete(id)
            else next.add(id)
            return next
        })
    }

    const toggleAll = () => {
        if (selected.size === filteredCandidates.length) {
            setSelected(new Set())
        } else {
            setSelected(new Set(filteredCandidates.map(c => c.id)))
        }
    }

    const getStatusBadge = (status: string) => {
        const map: Record<string, { bg: string; text: string; label: string }> = {
            'APPLIED': { bg: 'bg-blue-50', text: 'text-blue-700', label: 'Applied' },
            'SCREENED': { bg: 'bg-indigo-50', text: 'text-indigo-700', label: 'Screened' },
            'SHORTLISTED': { bg: 'bg-purple-50', text: 'text-purple-700', label: 'Shortlisted' },
            'INTERVIEW_SCHEDULED': { bg: 'bg-violet-50', text: 'text-violet-700', label: 'Interview' },
            'INTERVIEWED': { bg: 'bg-amber-50', text: 'text-amber-700', label: 'Interviewed' },
            'HIRED': { bg: 'bg-green-50', text: 'text-green-700', label: 'Hired' },
            'SELECTED': { bg: 'bg-green-50', text: 'text-green-700', label: 'Selected' },
            'REJECTED': { bg: 'bg-red-50', text: 'text-red-700', label: 'Rejected' },
        }
        const s = map[status] || { bg: 'bg-gray-100', text: 'text-gray-600', label: status }
        return (
            <Badge className={cn("border hover:opacity-90 font-medium text-[11px] shadow-none", s.bg, s.text, s.bg.replace('bg-', 'border-').replace('50', '200'))}>
                {s.label}
            </Badge>
        )
    }

    // Stats
    const totalCount = candidates.length
    const shortlistedCount = candidates.filter(c => c.status === 'SHORTLISTED').length
    const interviewCount = candidates.filter(c => ['INTERVIEW_SCHEDULED', 'INTERVIEWED'].includes(c.status)).length
    const hiredCount = candidates.filter(c => ['HIRED', 'SELECTED'].includes(c.status)).length

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        )
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-100 pb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                        Candidates
                    </h1>
                    <p className="text-gray-500 mt-1 text-sm font-medium">View and manage candidates across all job listings.</p>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <Card className="bg-white border border-gray-200 shadow-sm rounded-xl overflow-hidden hover:shadow-md transition-shadow">
                    <CardContent className="p-5 flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                            <Users className="h-6 w-6" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-gray-900">{totalCount}</div>
                            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Total</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-white border border-gray-200 shadow-sm rounded-xl overflow-hidden hover:shadow-md transition-shadow">
                    <CardContent className="p-5 flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
                            <Star className="h-6 w-6" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-gray-900">{shortlistedCount}</div>
                            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Shortlisted</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-white border border-gray-200 shadow-sm rounded-xl overflow-hidden hover:shadow-md transition-shadow">
                    <CardContent className="p-5 flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
                            <Briefcase className="h-6 w-6" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-gray-900">{interviewCount}</div>
                            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Interview</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-white border border-gray-200 shadow-sm rounded-xl overflow-hidden hover:shadow-md transition-shadow">
                    <CardContent className="p-5 flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-green-50 flex items-center justify-center text-green-600">
                            <CheckCircle2 className="h-6 w-6" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-gray-900">{hiredCount}</div>
                            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Hired</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Search & Filter */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        placeholder="Search by name, email, or job title..."
                        className="pl-10 bg-white border-gray-200 rounded-xl h-11 text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all shadow-sm"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full md:w-56 bg-white border-gray-200 rounded-xl h-11 text-sm text-gray-700 shadow-sm">
                        <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-gray-200 shadow-xl rounded-xl">
                        <SelectItem value="ALL">All Statuses</SelectItem>
                        <SelectItem value="APPLIED">Applied</SelectItem>
                        <SelectItem value="SCREENED">Screened</SelectItem>
                        <SelectItem value="SHORTLISTED">Shortlisted</SelectItem>
                        <SelectItem value="INTERVIEW_SCHEDULED">Interview</SelectItem>
                        <SelectItem value="HIRED">Hired</SelectItem>
                        <SelectItem value="REJECTED">Rejected</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Candidates Table */}
            <Card className="bg-white border border-gray-200 shadow-sm rounded-xl overflow-hidden">
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-gray-50/50 hover:bg-gray-50/50 border-b border-gray-100">
                                <TableHead className="w-12 py-4 pl-6">
                                    <input
                                        type="checkbox"
                                        className="rounded border-gray-300 h-4 w-4 text-blue-600 focus:ring-blue-500"
                                        checked={selected.size === filteredCandidates.length && filteredCandidates.length > 0}
                                        onChange={toggleAll}
                                        title="Select All"
                                    />
                                </TableHead>
                                <TableHead className="font-semibold text-gray-600 text-xs uppercase tracking-wider py-4">Candidate</TableHead>
                                <TableHead className="font-semibold text-gray-600 text-xs uppercase tracking-wider py-4">Applied For</TableHead>
                                <TableHead className="font-semibold text-gray-600 text-xs uppercase tracking-wider py-4">Status</TableHead>
                                <TableHead className="font-semibold text-gray-600 text-xs uppercase tracking-wider py-4">ATS Score</TableHead>
                                <TableHead className="font-semibold text-gray-600 text-xs uppercase tracking-wider py-4">Applied</TableHead>
                                <TableHead className="text-right font-semibold text-gray-600 text-xs uppercase tracking-wider py-4 pr-6">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredCandidates.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-24 text-gray-400">
                                        <div className="flex flex-col items-center justify-center gap-3">
                                            <div className="h-16 w-16 bg-gray-50 rounded-full flex items-center justify-center">
                                                <Users className="h-8 w-8 text-gray-300" />
                                            </div>
                                            <h3 className="text-lg font-semibold text-gray-900">No candidates found</h3>
                                            <p className="text-sm text-gray-500">Try adjusting your search or filters.</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : filteredCandidates.map((candidate) => (
                                <TableRow key={candidate.id} className="hover:bg-blue-50/30 transition-colors border-b border-gray-100 last:border-0 group cursor-pointer" onClick={() => router.push(`/employer/dashboard/ats/candidate/${candidate.applicationId}`)}>
                                    <TableCell className="py-4 pl-6" onClick={(e) => e.stopPropagation()}>
                                        <input
                                            type="checkbox"
                                            className="rounded border-gray-300 h-4 w-4 text-blue-600 focus:ring-blue-500"
                                            checked={selected.has(candidate.id)}
                                            onChange={() => toggleSelect(candidate.id)}
                                            title="Select Candidate"
                                        />
                                    </TableCell>
                                    <TableCell className="py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-blue-700 font-bold text-sm flex-shrink-0 border border-blue-200">
                                                {candidate.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <div className="font-semibold text-gray-900 text-sm group-hover:text-blue-700 transition-colors">{candidate.name}</div>
                                                <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                                                    <Mail className="h-3 w-3" /> {candidate.email}
                                                </div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="py-4">
                                        <span className="text-sm text-gray-700 font-medium flex items-center gap-1.5">
                                            <Briefcase className="h-3.5 w-3.5 text-gray-400" />
                                            {candidate.jobTitle}
                                        </span>
                                    </TableCell>
                                    <TableCell className="py-4">
                                        {getStatusBadge(candidate.status)}
                                    </TableCell>
                                    <TableCell className="py-4">
                                        {candidate.atsScore !== null ? (
                                            <div className="flex items-center gap-2">
                                                <div className="w-12 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                    <div
                                                        className={cn("h-full rounded-full",
                                                            candidate.atsScore >= 80 ? "bg-green-500" :
                                                                candidate.atsScore >= 60 ? "bg-blue-500" :
                                                                    candidate.atsScore >= 40 ? "bg-amber-500" : "bg-red-500"
                                                        )}
                                                        style={{ width: `${candidate.atsScore}%` }}
                                                    />
                                                </div>
                                                <span className={cn("text-xs font-bold",
                                                    candidate.atsScore >= 80 ? "text-green-700" :
                                                        candidate.atsScore >= 60 ? "text-blue-700" :
                                                            candidate.atsScore >= 40 ? "text-amber-700" : "text-red-700"
                                                )}>{candidate.atsScore}</span>
                                            </div>
                                        ) : (
                                            <span className="text-xs text-gray-400">—</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="py-4">
                                        <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                                            <Calendar className="h-3 w-3" />
                                            {new Date(candidate.appliedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right py-4 pr-6" onClick={(e) => e.stopPropagation()}>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-900 transition-all">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-48 bg-white border border-gray-200 shadow-xl rounded-xl p-1">
                                                <DropdownMenuItem
                                                    onClick={() => router.push(`/employer/dashboard/ats/candidate/${candidate.applicationId}`)}
                                                    className="cursor-pointer text-gray-700 font-medium rounded-lg"
                                                >
                                                    <Eye className="mr-2 h-4 w-4 text-gray-400" /> View Profile
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator className="bg-gray-100" />
                                                <DropdownMenuItem
                                                    onClick={() => router.push(`/employer/jobs/${candidate.jobId}`)}
                                                    className="cursor-pointer text-gray-700 font-medium rounded-lg"
                                                >
                                                    <FileText className="mr-2 h-4 w-4 text-gray-400" /> View Application
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Bulk Actions Bar */}
            {selected.size > 0 && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white rounded-2xl px-6 py-3 shadow-2xl flex items-center gap-4 z-50 animate-in slide-in-from-bottom-6 duration-300">
                    <span className="text-sm font-semibold pl-1">{selected.size} candidates selected</span>
                    <div className="h-5 w-px bg-gray-700" />
                    <Button size="sm" variant="ghost" className="text-white hover:bg-white/10 hover:text-white text-xs h-8 font-medium rounded-lg">
                        Shortlist
                    </Button>
                    <Button size="sm" variant="ghost" className="text-white hover:bg-white/10 hover:text-white text-xs h-8 font-medium rounded-lg">
                        Reject
                    </Button>
                    <div className="h-5 w-px bg-gray-700" />
                    <Button size="sm" variant="ghost" className="text-gray-300 hover:text-white hover:bg-transparent text-xs h-8 px-2"
                        onClick={() => setSelected(new Set())}>
                        Clear
                    </Button>
                </div>
            )}
        </div>
    )
}
