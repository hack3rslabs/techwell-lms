'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Loader2, Users, Calendar, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { api } from '@/lib/api'
import { format } from 'date-fns'

export default function FranchiseBatchesPage() {
    const [batches, setBatches] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')

    useEffect(() => {
        const fetchBatches = async () => {
            try {
                setIsLoading(true)
                const res = await api.get('/batches')
                setBatches(res.data || [])
            } catch (error) {
                console.error('Failed to load batches', error)
            } finally {
                setIsLoading(false)
            }
        }
        fetchBatches()
    }, [])

    const filteredBatches = batches.filter(b => 
        b.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
        b.batchCode?.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-primary">Batch Management</h2>
                    <p className="text-muted-foreground mt-1">View and manage learning batches for your institute.</p>
                </div>
                <Button>Create Batch</Button>
            </div>

            <Card className="border shadow-sm">
                <CardHeader className="bg-muted/30 pb-4">
                    <div className="relative max-w-sm">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                        <Input
                            placeholder="Search batches..."
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
                    ) : filteredBatches.length === 0 ? (
                        <div className="text-center py-16 text-muted-foreground">
                            <Users className="h-12 w-12 mx-auto mb-4 opacity-50 text-primary" />
                            <p className="text-lg font-medium text-foreground">No batches found</p>
                            <p>You haven't assigned any batches yet.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted/50">
                                        <TableHead>Batch Details</TableHead>
                                        <TableHead>Course</TableHead>
                                        <TableHead>Schedule</TableHead>
                                        <TableHead>Students</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredBatches.map((batch) => (
                                        <TableRow key={batch.id} className="hover:bg-muted/20">
                                            <TableCell>
                                                <div className="font-semibold text-foreground">{batch.name}</div>
                                                <div className="text-xs text-muted-foreground">{batch.batchCode}</div>
                                            </TableCell>
                                            <TableCell>
                                                <span className="font-medium">{batch.course?.title || '-'}</span>
                                            </TableCell>
                                            <TableCell className="text-sm">
                                                <div className="flex items-center text-muted-foreground mb-1">
                                                    <Calendar className="w-3 h-3 mr-2 opacity-70" />
                                                    {batch.startDate ? format(new Date(batch.startDate), 'MMM dd, yyyy') : 'TBD'} 
                                                    {batch.endDate ? ` - ${format(new Date(batch.endDate), 'MMM dd, yyyy')}` : ''}
                                                </div>
                                                <div className="text-xs">{batch.timings}</div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center">
                                                    <Users className="w-4 h-4 mr-2 opacity-70 text-primary" />
                                                    <span className="font-medium">{batch._count?.enrollments || 0}</span>
                                                    <span className="text-muted-foreground ml-1">
                                                        {batch.maxStudents ? `/ ${batch.maxStudents}` : ''}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className={batch.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : ''}>
                                                    {batch.status || 'UPCOMING'}
                                                </Badge>
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
