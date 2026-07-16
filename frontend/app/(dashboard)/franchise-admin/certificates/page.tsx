'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Loader2, Search, GraduationCap, Download, ExternalLink, Plus } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { api } from '@/lib/api'
import { format } from 'date-fns'
import IssueCertificateModal from '@/components/franchise/IssueCertificateModal'
import Link from 'next/link'

export default function FranchiseCertificatesPage() {
    const [certificates, setCertificates] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [isIssueModalOpen, setIsIssueModalOpen] = useState(false)

    const fetchCertificates = async () => {
        try {
            setIsLoading(true)
            const res = await api.get('/certificates')
            setCertificates(res.data.certificates || [])
        } catch (error) {
            console.error('Failed to load certificates', error)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchCertificates()
    }, [])

    const filteredCertificates = certificates.filter(c => 
        c.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
        c.certificateId?.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-primary">Certificate Management</h2>
                    <p className="text-muted-foreground mt-1">Generate and manage course completion certificates for your students.</p>
                </div>
                <Button onClick={() => setIsIssueModalOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" /> Issue New Certificate
                </Button>
            </div>

            <Card className="border shadow-sm">
                <CardHeader className="bg-muted/30 pb-4">
                    <div className="relative max-w-sm">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                        <Input
                            placeholder="Search by student name or ID..."
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
                    ) : filteredCertificates.length === 0 ? (
                        <div className="text-center py-16 text-muted-foreground">
                            <GraduationCap className="h-12 w-12 mx-auto mb-4 opacity-50 text-primary" />
                            <p className="text-lg font-medium text-foreground">No certificates found</p>
                            <p>You haven't issued any certificates yet.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted/50">
                                        <TableHead>Certificate ID</TableHead>
                                        <TableHead>Student</TableHead>
                                        <TableHead>Course</TableHead>
                                        <TableHead>Issued Date</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredCertificates.map((cert) => (
                                        <TableRow key={cert.id} className="hover:bg-muted/20">
                                            <TableCell className="font-mono text-xs">{cert.uniqueId}</TableCell>
                                            <TableCell>
                                                <div className="font-semibold text-foreground">{cert.user?.name || cert.studentName}</div>
                                                <div className="text-xs text-muted-foreground">{cert.user?.email || cert.regId}</div>
                                            </TableCell>
                                            <TableCell>
                                                <span className="font-medium text-sm">{cert.course?.title || cert.courseName}</span>
                                            </TableCell>
                                            <TableCell className="text-sm">
                                                {cert.issueDate ? format(new Date(cert.issueDate), 'MMM dd, yyyy') : '-'}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className={cert.status === 'VALID' || cert.status === 'ISSUED' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                                                    {cert.status || 'VALID'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Link href={`/certificate/${cert.uniqueId}`} target="_blank">
                                                        <Button variant="ghost" size="icon" title="View Certificate">
                                                            <ExternalLink className="h-4 w-4 text-primary" />
                                                        </Button>
                                                    </Link>
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

            <IssueCertificateModal 
                isOpen={isIssueModalOpen} 
                onClose={() => setIsIssueModalOpen(false)} 
                onSuccess={fetchCertificates} 
            />
        </div>
    )
}
