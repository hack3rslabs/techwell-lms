"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import api from "@/lib/api"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Briefcase, Search, Filter, MoreHorizontal, Eye, Edit, Trash2, MapPin, Users, Calendar } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface Job {
    id: string
    title: string
    location: string
    type: string
    status: string
    createdAt: string
    _count?: {
        applications: number
    }
}

export default function EmployerJobsPage() {
    const [jobs, setJobs] = useState<Job[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const router = useRouter()

    useEffect(() => {
        fetchJobs()
    }, [])

    const fetchJobs = async () => {
        try {
            const res = await api.get('/jobs/my/listings')
            setJobs(res.data)
        } catch {
            // Error handling
        } finally {
            setIsLoading(false)
        }
    }

    const filteredJobs = jobs.filter(job =>
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.location.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'PUBLISHED':
            case 'OPEN':
                return <Badge className="bg-green-50 text-green-700 border-green-200 hover:bg-green-50 shadow-none font-semibold text-[11px]">Active</Badge>
            case 'DRAFT':
                return <Badge className="bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-100 shadow-none font-medium text-[11px]">Draft</Badge>
            case 'CLOSED':
                return <Badge className="bg-red-50 text-red-700 border-red-200 hover:bg-red-50 shadow-none font-medium text-[11px]">Closed</Badge>
            case 'PAUSED':
                return <Badge className="bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-50 shadow-none font-medium text-[11px]">Paused</Badge>
            default:
                return <Badge className="bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-50 shadow-none font-medium text-[11px]">{status}</Badge>
        }
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-100 pb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                        Job Management
                    </h1>
                    <p className="text-gray-500 mt-1 text-sm font-medium">Create and manage your open positions.</p>
                </div>
                <Button
                    onClick={() => router.push('/employer/jobs/new')}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-sm shadow-blue-200"
                >
                    <Plus className="mr-2 h-4 w-4" /> Post New Job
                </Button>
            </div>

            {/* Search & Filter */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        placeholder="Search jobs by title, location, or keyword..."
                        className="pl-10 bg-white border-gray-200 rounded-xl h-11 text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all shadow-sm"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <Button variant="outline" className="rounded-xl border-gray-200 text-gray-700 hover:bg-gray-50 h-11 px-5 shadow-sm font-medium">
                    <Filter className="mr-2 h-4 w-4 text-gray-500" /> Filter
                </Button>
            </div>

            {/* Jobs Table */}
            <Card className="bg-white border border-gray-200 shadow-sm rounded-xl overflow-hidden">
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-gray-50/50 hover:bg-gray-50/50 border-b border-gray-100">
                                <TableHead className="font-semibold text-gray-600 text-xs uppercase tracking-wider py-4 pl-6">Job Details</TableHead>
                                <TableHead className="font-semibold text-gray-600 text-xs uppercase tracking-wider py-4">Applicants</TableHead>
                                <TableHead className="font-semibold text-gray-600 text-xs uppercase tracking-wider py-4">Status</TableHead>
                                <TableHead className="font-semibold text-gray-600 text-xs uppercase tracking-wider py-4">Posted Date</TableHead>
                                <TableHead className="text-right font-semibold text-gray-600 text-xs uppercase tracking-wider py-4 pr-6">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                [1, 2, 3, 4, 5].map(i => (
                                    <TableRow key={i} className="border-b border-gray-100">
                                        <TableCell className="pl-6 py-4"><div className="h-5 w-48 bg-gray-100 animate-pulse rounded lg:w-64" /></TableCell>
                                        <TableCell className="py-4"><div className="h-4 w-16 bg-gray-100 animate-pulse rounded" /></TableCell>
                                        <TableCell className="py-4"><div className="h-5 w-20 bg-gray-100 animate-pulse rounded" /></TableCell>
                                        <TableCell className="py-4"><div className="h-4 w-24 bg-gray-100 animate-pulse rounded" /></TableCell>
                                        <TableCell className="text-right pr-6 py-4"><div className="h-8 w-8 bg-gray-100 animate-pulse rounded-full ml-auto" /></TableCell>
                                    </TableRow>
                                ))
                            ) : filteredJobs.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-24 text-gray-400">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="h-16 w-16 bg-gray-50 rounded-full flex items-center justify-center">
                                                <Briefcase className="h-8 w-8 text-gray-300" />
                                            </div>
                                            <h3 className="text-lg font-semibold text-gray-900">No jobs found</h3>
                                            <p className="text-sm text-gray-500 max-w-sm">
                                                {searchQuery ? "We couldn't find any jobs matching your search." : "You haven't posted any jobs yet. Start hiring by creating your first listing."}
                                            </p>
                                            <Button
                                                onClick={() => router.push('/employer/jobs/new')}
                                                className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-medium"
                                            >
                                                Post New Job
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : filteredJobs.map((job) => (
                                <TableRow
                                    key={job.id}
                                    className="hover:bg-blue-50/30 transition-colors border-b border-gray-100 cursor-pointer group last:border-0"
                                    onClick={() => router.push(`/employer/jobs/${job.id}`)}
                                >
                                    <TableCell className="py-4 pl-6">
                                        <div className="flex flex-col gap-1">
                                            <span className="font-bold text-gray-900 text-sm group-hover:text-blue-700 transition-colors">{job.title}</span>
                                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                                <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {job.location}</span>
                                                <span className="w-1 h-1 bg-gray-300 rounded-full" />
                                                <span>{job.type?.replace(/_/g, ' ')}</span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="flex -space-x-2">
                                                {[1, 2, 3].map(i => (
                                                    <div key={i} className="h-6 w-6 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-[8px] font-bold text-gray-500">
                                                        <Users className="h-3 w-3" />
                                                    </div>
                                                ))}
                                            </div>
                                            <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-100 hover:bg-blue-100 h-6">
                                                {job._count?.applications || 0}
                                            </Badge>
                                        </div>
                                    </TableCell>
                                    <TableCell className="py-4">
                                        {getStatusBadge(job.status)}
                                    </TableCell>
                                    <TableCell className="py-4">
                                        <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
                                            <Calendar className="h-3.5 w-3.5 text-gray-400" />
                                            {new Date(job.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right py-4 pr-6" onClick={(e) => e.stopPropagation()}>
                                        <div className="flex items-center justify-end gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="hidden md:flex h-8 border-gray-200 text-gray-700 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 rounded-lg text-xs font-semibold shadow-sm"
                                                onClick={() => router.push(`/employer/jobs/${job.id}`)}
                                            >
                                                <Eye className="mr-1.5 h-3.5 w-3.5" /> View Applicants
                                            </Button>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-900 transition-colors">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-56 bg-white border border-gray-200 shadow-xl rounded-xl p-1">
                                                    <DropdownMenuLabel className="text-xs text-gray-500 font-medium px-2 py-1.5 uppercase tracking-wider">{job.title}</DropdownMenuLabel>
                                                    <DropdownMenuSeparator className="bg-gray-100" />
                                                    <DropdownMenuItem
                                                        onClick={() => router.push(`/employer/jobs/${job.id}`)}
                                                        className="cursor-pointer text-gray-700 rounded-lg focus:bg-blue-50 focus:text-blue-700 md:hidden font-medium"
                                                    >
                                                        <Eye className="mr-2 h-4 w-4 text-gray-400" /> View Applicants
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => router.push(`/employer/jobs/${job.id}/edit`)}
                                                        className="cursor-pointer text-gray-700 rounded-lg focus:bg-blue-50 focus:text-blue-700 font-medium"
                                                    >
                                                        <Edit className="mr-2 h-4 w-4 text-gray-400" /> Edit Details
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        disabled
                                                        className="text-gray-400 rounded-lg font-medium opacity-50 cursor-not-allowed"
                                                    >
                                                        <Briefcase className="mr-2 h-4 w-4" /> Close Job
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator className="bg-gray-100" />
                                                    <DropdownMenuItem className="cursor-pointer text-red-600 rounded-lg focus:bg-red-50 focus:text-red-700 font-medium">
                                                        <Trash2 className="mr-2 h-4 w-4" /> Delete Listing
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
