"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { FileText, Plus, Search, Eye, Edit, Trash2, Link as LinkIcon } from 'lucide-react'
import axios from 'axios'
import { toast } from 'react-hot-toast'
import { format } from 'date-fns'
import Link from 'next/link'

export default function AgreementsDashboard() {
    const [agreements, setAgreements] = useState<any[]>([])
    const [search, setSearch] = useState('')
    const [loading, setLoading] = useState(true)

    async function fetchAgreements() {
        try {
            setLoading(true)
            const res = await axios.get('/api/crm/agreements')
            setAgreements(res.data)
        } catch (error) {
            console.error("Failed to fetch agreements:", error)
            toast.error("Failed to load agreements")
        } finally {
            setLoading(false)
        }
    }


    useEffect(() => {
        fetchAgreements()
    }, [])


    const filteredAgreements = agreements.filter(a => 
        a.title?.toLowerCase().includes(search.toLowerCase()) || 
        a.agreementNum?.toLowerCase().includes(search.toLowerCase()) ||
        a.customer?.name?.toLowerCase().includes(search.toLowerCase())
    )

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'DRAFT': return 'bg-gray-100 text-gray-700'
            case 'SENT': return 'bg-blue-100 text-blue-700'
            case 'SIGNED': return 'bg-green-100 text-green-700'
            case 'ACTIVE': return 'bg-emerald-100 text-emerald-700'
            case 'EXPIRED': return 'bg-red-100 text-red-700'
            default: return 'bg-gray-100 text-gray-700'
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Client Agreements</h1>
                    <p className="text-muted-foreground">Manage contracts, NDAs, and SLAs</p>
                </div>
                <Link href="/admin/crm/agreements/builder">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" /> New Agreement
                    </Button>
                </Link>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Agreements</CardTitle>
                        <div className="relative w-64">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search agreements..."
                                className="pl-8"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Agreement No.</TableHead>
                                    <TableHead>Client</TableHead>
                                    <TableHead>Title</TableHead>
                                    <TableHead>Value</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Created</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center py-8">Loading agreements...</TableCell>
                                    </TableRow>
                                ) : filteredAgreements.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                            No agreements found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredAgreements.map((agreement) => (
                                        <TableRow key={agreement.id}>
                                            <TableCell className="font-medium">{agreement.agreementNum}</TableCell>
                                            <TableCell>{agreement.customer?.name || 'Unknown'}</TableCell>
                                            <TableCell>{agreement.title}</TableCell>
                                            <TableCell>₹{agreement.grandTotal?.toLocaleString()}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className={getStatusColor(agreement.status)}>
                                                    {agreement.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>{format(new Date(agreement.createdAt), 'dd MMM yyyy')}</TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <Button variant="ghost" size="icon" title="Copy Share Link" onClick={() => {
                                                        navigator.clipboard.writeText(`${window.location.origin}/agreements/${agreement.id}`)
                                                        toast.success("Share link copied to clipboard!")
                                                    }}>
                                                        <LinkIcon className="h-4 w-4 text-blue-600" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" title="Download PDF" onClick={async () => {
                                                        toast.loading("Generating PDF...", { id: 'pdf' })
                                                        try {
                                                            const res = await axios.get(`/api/crm/agreements/${agreement.id}/pdf`, { responseType: 'blob' })
                                                            const url = window.URL.createObjectURL(new Blob([res.data]))
                                                            const link = document.createElement('a')
                                                            link.href = url
                                                            link.setAttribute('download', `${agreement.agreementNum}.pdf`)
                                                            document.body.appendChild(link)
                                                            link.click()
                                                            link.remove()
                                                            toast.success("PDF Downloaded!", { id: 'pdf' })
                                                        } catch(e) {
                                                            toast.error("Failed to generate PDF", { id: 'pdf' })
                                                        }
                                                    }}>
                                                        <FileText className="h-4 w-4 text-green-500" />
                                                    </Button>
                                                    <Link href={`/admin/crm/agreements/builder?id=${agreement.id}`}>
                                                        <Button variant="ghost" size="icon" title="Edit">
                                                            <Edit className="h-4 w-4 text-gray-500" />
                                                        </Button>
                                                    </Link>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
