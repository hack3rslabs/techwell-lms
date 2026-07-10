'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Loader2, Search, Calendar, Plus, ExternalLink, Video } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { api } from '@/lib/api'
import { format } from 'date-fns'

export default function FranchiseInterviewsPage() {
    const [interviews, setInterviews] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')

    useEffect(() => {
        const fetchInterviews = async () => {
            try {
                setIsLoading(true)
                const res = await api.get('/interviews') 
                setInterviews(res.data.interviews || [])
            } catch (error) {
                console.error('Failed to load interviews', error)
            } finally {
                setIsLoading(false)
            }
        }
        fetchInterviews()
    }, [])

    const filteredInterviews = interviews.filter(i => 
        i.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
        i.company?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-primary">Interview Scheduling</h2>
                    <p className="text-muted-foreground mt-1">Schedule and track interviews for your students.</p>
                </div>
                <Button>
                    <Plus className="mr-2 h-4 w-4" /> Schedule Interview
                </Button>
            </div>

            <Card className="border shadow-sm">
                <CardHeader className="bg-muted/30 pb-4">
                    <div className="relative max-w-sm">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                        <Input
                            placeholder="Search by student or company..."
                            className="pl-9"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {isLoading ? (
                        <div className="flex justify-center p-12">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : filteredInterviews.length === 0 ? (
                        <div className="text-center py-16 text-muted-foreground">
                            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50 text-primary" />
                            <p className="text-lg font-medium text-foreground">No interviews found</p>
                            <p>You haven't scheduled any interviews yet.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted/50">
                                        <TableHead>Student</TableHead>
                                        <TableHead>Company</TableHead>
                                        <TableHead>Date & Time</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredInterviews.map((interview) => (
                                        <TableRow key={interview.id} className="hover:bg-muted/20">
                                            <TableCell>
                                                <div className="font-semibold text-foreground">{interview.user?.name}</div>
                                                <div className="text-xs text-muted-foreground">{interview.user?.email}</div>
                                            </TableCell>
                                            <TableCell>
                                                <span className="font-medium text-sm">{interview.company?.name || '-'}</span>
                                            </TableCell>
                                            <TableCell className="text-sm">
                                                {interview.scheduledAt ? format(new Date(interview.scheduledAt), 'MMM dd, yyyy h:mm a') : '-'}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center text-sm">
                                                    <Video className="w-3 h-3 mr-1" />
                                                    {interview.type || 'Technical'}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className={
                                                    interview.status === 'PASSED' ? 'bg-green-100 text-green-700' : 
                                                    interview.status === 'FAILED' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                                                }>
                                                    {interview.status || 'SCHEDULED'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="icon" title="View Details">
                                                    <ExternalLink className="h-4 w-4 text-primary" />
                                                </Button>
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
