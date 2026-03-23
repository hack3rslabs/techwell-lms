"use client"

import * as React from "react"
import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import api from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import {
    Plus, Calendar, Clock, Video, User, CheckCircle2, XCircle, MoreVertical,
    FileText, Link as LinkIcon, AlertCircle, Search, Filter, Loader2
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
// import NewInterviewDialog from "@/components/interviews/NewInterviewDialog" // Use if available, else inline

interface Interview {
    id: string
    candidateName: string
    jobTitle: string
    scheduledAt: string
    status: string
    meetingLink?: string
    feedback?: string
    duration?: number
    interviewerName?: string
}

export default function EmployerInterviewsPage() {
    const [interviews, setInterviews] = useState<Interview[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [activeTab, setActiveTab] = useState("upcoming")
    const [searchQuery, setSearchQuery] = useState("")
    const router = useRouter()

    const fetchInterviews = useCallback(async () => {
        try {
            // Mock data or API call
            // const res = await api.get('/interviews/my') 
            // setInterviews(res.data)

            // Mocking for UI dev
            setTimeout(() => {
                setInterviews([
                    {
                        id: '1',
                        candidateName: 'John Doe',
                        jobTitle: 'Frontend Engineer',
                        scheduledAt: new Date(Date.now() + 86400000).toISOString(),
                        status: 'SCHEDULED',
                        meetingLink: 'https://meet.google.com/abc-defg-hij',
                        duration: 45,
                        interviewerName: 'Alice Smith'
                    },
                    {
                        id: '2',
                        candidateName: 'Jane Smith',
                        jobTitle: 'Product Manager',
                        scheduledAt: new Date(Date.now() - 86400000).toISOString(),
                        status: 'COMPLETED',
                        feedback: 'Strong candidate, good communication.',
                        duration: 60,
                        interviewerName: 'Bob Jones'
                    },
                    {
                        id: '3',
                        candidateName: 'Mike Johnson',
                        jobTitle: 'Backend Developer',
                        scheduledAt: new Date(Date.now() + 172800000).toISOString(),
                        status: 'SCHEDULED',
                        meetingLink: 'https://zoom.us/j/123456789',
                        duration: 30,
                        interviewerName: 'Alice Smith'
                    }
                ])
                setIsLoading(false)
            }, 800)
        } catch {
            setIsLoading(false)
        }
    }, [])

    // eslint-disable-next-line react-hooks/set-state-in-effect
    useEffect(() => {
        fetchInterviews()
    }, [])

    const filteredInterviews = interviews.filter(interview => {
        const matchesSearch = interview.candidateName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            interview.jobTitle.toLowerCase().includes(searchQuery.toLowerCase())

        if (activeTab === 'upcoming') {
            return matchesSearch && (interview.status === 'SCHEDULED' || interview.status === 'RESCHEDULED')
        } else if (activeTab === 'past') {
            return matchesSearch && (interview.status === 'COMPLETED' || interview.status === 'CANCELLED' || interview.status === 'NO_SHOW')
        }
        return matchesSearch
    })

    const getStatusBadge = (status: string) => {
        const map: Record<string, { bg: string; text: string; label: string }> = {
            'SCHEDULED': { bg: 'bg-blue-50', text: 'text-blue-700', label: 'Scheduled' },
            'COMPLETED': { bg: 'bg-green-50', text: 'text-green-700', label: 'Completed' },
            'CANCELLED': { bg: 'bg-red-50', text: 'text-red-700', label: 'Cancelled' },
            'RESCHEDULED': { bg: 'bg-amber-50', text: 'text-amber-700', label: 'Rescheduled' },
            'NO_SHOW': { bg: 'bg-gray-100', text: 'text-gray-600', label: 'No Show' },
        }
        const s = map[status] || { bg: 'bg-gray-50', text: 'text-gray-600', label: status }
        return (
            <Badge className={cn("border hover:opacity-90 font-medium text-[11px] shadow-none", s.bg, s.text, s.bg.replace('bg-', 'border-').replace('50', '200'))}>
                {s.label}
            </Badge>
        )
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-100 pb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                        Interviews
                    </h1>
                    <p className="text-gray-500 mt-1 text-sm font-medium">Schedule and manage candidate interviews.</p>
                </div>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-sm shadow-blue-200">
                    <Plus className="mr-2 h-4 w-4" /> Schedule Interview
                </Button>
            </div>

            <Tabs defaultValue="upcoming" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <TabsList className="bg-gray-100 p-1 rounded-xl h-12">
                        <TabsTrigger
                            value="upcoming"
                            className="rounded-lg px-6 h-10 text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm transition-all"
                        >
                            Upcoming
                        </TabsTrigger>
                        <TabsTrigger
                            value="past"
                            className="rounded-lg px-6 h-10 text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm transition-all"
                        >
                            Past & Completed
                        </TabsTrigger>
                    </TabsList>

                    <div className="relative w-full sm:w-72">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Search interviews..."
                            className="pl-10 bg-white border-gray-200 rounded-xl h-11 text-sm shadow-sm"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <TabsContent value="upcoming" className="mt-0">
                    <Card className="bg-white border border-gray-200 shadow-sm rounded-xl overflow-hidden">
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-gray-50/50 hover:bg-gray-50/50 border-b border-gray-100">
                                        <TableHead className="font-semibold text-gray-600 text-xs uppercase tracking-wider py-4 pl-6">Candidate / Role</TableHead>
                                        <TableHead className="font-semibold text-gray-600 text-xs uppercase tracking-wider py-4">Date & Time</TableHead>
                                        <TableHead className="font-semibold text-gray-600 text-xs uppercase tracking-wider py-4">Interviewer</TableHead>
                                        <TableHead className="font-semibold text-gray-600 text-xs uppercase tracking-wider py-4">Status</TableHead>
                                        <TableHead className="text-right font-semibold text-gray-600 text-xs uppercase tracking-wider py-4 pr-6">Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {isLoading ? (
                                        [1, 2, 3].map(i => (
                                            <TableRow key={i} className="border-b border-gray-100">
                                                <TableCell className="pl-6 py-4"><div className="h-5 w-40 bg-gray-100 animate-pulse rounded" /></TableCell>
                                                <TableCell className="py-4"><div className="h-5 w-32 bg-gray-100 animate-pulse rounded" /></TableCell>
                                                <TableCell className="py-4"><div className="h-5 w-24 bg-gray-100 animate-pulse rounded" /></TableCell>
                                                <TableCell className="py-4"><div className="h-6 w-20 bg-gray-100 animate-pulse rounded-full" /></TableCell>
                                                <TableCell className="text-right pr-6 py-4"><div className="h-8 w-8 bg-gray-100 animate-pulse rounded-full ml-auto" /></TableCell>
                                            </TableRow>
                                        ))
                                    ) : filteredInterviews.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-20 text-gray-400">
                                                <div className="flex flex-col items-center justify-center gap-3">
                                                    <div className="h-16 w-16 bg-blue-50 rounded-full flex items-center justify-center">
                                                        <Calendar className="h-8 w-8 text-blue-300" />
                                                    </div>
                                                    <h3 className="text-lg font-semibold text-gray-900">No upcoming interviews</h3>
                                                    <p className="text-sm text-gray-500">Your scheduled interviews will appear here.</p>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : filteredInterviews.map((interview) => (
                                        <TableRow key={interview.id} className="hover:bg-blue-50/30 transition-colors border-b border-gray-100 last:border-0 group">
                                            <TableCell className="pl-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-gray-900 text-sm group-hover:text-blue-700 transition-colors">{interview.candidateName}</span>
                                                    <span className="text-xs text-gray-500 mt-0.5">{interview.jobTitle}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-4">
                                                <div className="flex flex-col">
                                                    <div className="flex items-center gap-1.5 font-medium text-gray-900 text-sm">
                                                        <Calendar className="h-3.5 w-3.5 text-gray-400" />
                                                        {new Date(interview.scheduledAt).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                                                    </div>
                                                    <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-0.5 ml-0.5">
                                                        <Clock className="h-3 w-3" />
                                                        {new Date(interview.scheduledAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })} ({interview.duration}m)
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="h-6 w-6 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-500 border border-gray-200">
                                                        {interview.interviewerName?.charAt(0) || 'U'}
                                                    </div>
                                                    <span className="text-sm text-gray-700 font-medium">{interview.interviewerName || 'Unassigned'}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-4">
                                                {getStatusBadge(interview.status)}
                                            </TableCell>
                                            <TableCell className="text-right pr-6 py-4">
                                                <div className="flex items-center justify-end gap-2">
                                                    {interview.meetingLink && (
                                                        <Button variant="outline" size="sm" className="h-8 text-xs font-semibold px-3 border-blue-200 text-blue-700 hover:bg-blue-50 bg-blue-50/50" onClick={() => window.open(interview.meetingLink, '_blank')}>
                                                            <Video className="mr-1.5 h-3.5 w-3.5" /> Join
                                                        </Button>
                                                    )}
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-900">
                                                                <MoreVertical className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end" className="w-48 bg-white border border-gray-200 shadow-xl rounded-xl p-1">
                                                            <DropdownMenuItem className="cursor-pointer text-gray-700 font-medium rounded-lg">Reschedule</DropdownMenuItem>
                                                            <DropdownMenuItem className="cursor-pointer text-gray-700 font-medium rounded-lg">View Details</DropdownMenuItem>
                                                            <DropdownMenuSeparator className="bg-gray-100" />
                                                            <DropdownMenuItem className="cursor-pointer text-red-600 font-medium rounded-lg">Cancel Interview</DropdownMenuItem>
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
                </TabsContent>

                <TabsContent value="past" className="mt-0">
                    <Card className="bg-white border border-gray-200 shadow-sm rounded-xl overflow-hidden">
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-gray-50/50 hover:bg-gray-50/50 border-b border-gray-100">
                                        <TableHead className="font-semibold text-gray-600 text-xs uppercase tracking-wider py-4 pl-6">Candidate / Role</TableHead>
                                        <TableHead className="font-semibold text-gray-600 text-xs uppercase tracking-wider py-4">Date</TableHead>
                                        <TableHead className="font-semibold text-gray-600 text-xs uppercase tracking-wider py-4">Status</TableHead>
                                        <TableHead className="font-semibold text-gray-600 text-xs uppercase tracking-wider py-4">Feedback Summary</TableHead>
                                        <TableHead className="text-right font-semibold text-gray-600 text-xs uppercase tracking-wider py-4 pr-6">Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredInterviews.map((interview) => (
                                        <TableRow key={interview.id} className="hover:bg-gray-50/50 transition-colors border-b border-gray-100 last:border-0">
                                            <TableCell className="pl-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-gray-900 text-sm">{interview.candidateName}</span>
                                                    <span className="text-xs text-gray-500 mt-0.5">{interview.jobTitle}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-4">
                                                <span className="text-sm text-gray-500 font-medium">{new Date(interview.scheduledAt).toLocaleDateString()}</span>
                                            </TableCell>
                                            <TableCell className="py-4">
                                                {getStatusBadge(interview.status)}
                                            </TableCell>
                                            <TableCell className="py-4">
                                                <span className="text-sm text-gray-600 italic truncate max-w-[200px] block">{interview.feedback || "No feedback recorded"}</span>
                                            </TableCell>
                                            <TableCell className="text-right pr-6 py-4">
                                                <Button variant="ghost" size="sm" className="h-8 text-xs font-medium text-gray-500 hover:text-gray-900">
                                                    View Feedback
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {filteredInterviews.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-12 text-gray-400 text-sm font-medium">No past interviews found.</TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
