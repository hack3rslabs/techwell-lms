"use client"

import * as React from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Download, Search, Filter, Loader2, Database, ArrowRight } from 'lucide-react'
import api from '@/lib/api'
import * as XLSX from 'xlsx'
import { format } from 'date-fns'
import { toast } from 'sonner'

export default function GlobalDataPage() {
    const [data, setData] = React.useState<any[]>([])
    const [isLoading, setIsLoading] = React.useState(true)

    // Filters
    const [filters, setFilters] = React.useState({
        name: '',
        phone: '',
        email: '',
        college: '',
        district: '',
        pinCode: '',
        qualification: '',
        referralName: '',
        leadType: 'ALL',
        startDate: '',
        endDate: ''
    })

    const fetchData = React.useCallback(async () => {
        setIsLoading(true)
        try {
            const params = new URLSearchParams()
            
            if (filters.name) params.append('name', filters.name)
            if (filters.phone) params.append('phone', filters.phone)
            if (filters.email) params.append('email', filters.email)
            if (filters.college) params.append('college', filters.college)
            if (filters.district) params.append('district', filters.district)
            if (filters.pinCode) params.append('pinCode', filters.pinCode)
            if (filters.qualification) params.append('qualification', filters.qualification)
            if (filters.referralName) params.append('referralName', filters.referralName)
            if (filters.leadType !== 'ALL') params.append('leadType', filters.leadType)
            if (filters.startDate) params.append('startDate', filters.startDate)
            if (filters.endDate) params.append('endDate', filters.endDate)

            const res = await api.get(`/leads?${params.toString()}`)
            setData(res.data || [])
        } catch (error) {
            console.error('Failed to fetch global data:', error)
            toast.error('Failed to load data')
        } finally {
            setIsLoading(false)
        }
    }, [filters])

    React.useEffect(() => {
        fetchData()
    }, [fetchData])

    const handleFilterChange = (key: string, value: string) => {
        setFilters(prev => ({ ...prev, [key]: value }))
    }

    const resetFilters = () => {
        setFilters({
            name: '',
            phone: '',
            email: '',
            college: '',
            district: '',
            pinCode: '',
            qualification: '',
            referralName: '',
            leadType: 'ALL',
            startDate: '',
            endDate: ''
        })
    }

    const handleExportExcel = () => {
        try {
            const dataToExport = data.map(item => ({
                Name: item.name,
                Email: item.email || '',
                Mobile: item.phone || '',
                Type: item.leadType,
                College: item.college || '',
                Qualification: item.qualification || '',
                District: item.district || item.location || '',
                PinCode: item.pinCode || '',
                Referral: item.referralName || item.source || '',
                Date: format(new Date(item.createdAt), 'dd MMM yyyy')
            }))
            
            const ws = XLSX.utils.json_to_sheet(dataToExport)
            const wb = XLSX.utils.book_new()
            XLSX.utils.book_append_sheet(wb, ws, "GlobalData")
            XLSX.writeFile(wb, `GlobalData_Export_${format(new Date(), 'yyyy-MM-dd')}.xlsx`)
            toast.success("Exported successfully")
        } catch (error) {
            toast.error("Failed to export")
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                        <Database className="w-8 h-8 text-indigo-600" />
                        Global Data
                    </h1>
                    <p className="text-muted-foreground">Centralized database for all registrations, events, and leads.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={resetFilters}>Clear Filters</Button>
                    <Button onClick={handleExportExcel} className="bg-emerald-600 hover:bg-emerald-700">
                        <Download className="mr-2 h-4 w-4" />
                        Export Data
                    </Button>
                </div>
            </div>

            {/* Filters Section */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                        <Filter className="w-4 h-4" /> Advanced Filtering
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                        <Input placeholder="Search Name..." value={filters.name} onChange={e => handleFilterChange('name', e.target.value)} />
                        <Input placeholder="Search Mobile..." value={filters.phone} onChange={e => handleFilterChange('phone', e.target.value)} />
                        <Input placeholder="Search Email..." value={filters.email} onChange={e => handleFilterChange('email', e.target.value)} />
                        
                        <Select value={filters.leadType} onValueChange={v => handleFilterChange('leadType', v)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Registration Type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">All Types</SelectItem>
                                <SelectItem value="EVENT">Event Registration</SelectItem>
                                <SelectItem value="TRAINING">Course Training</SelectItem>
                                <SelectItem value="JOB_ENQUIRY">Job Enquiry</SelectItem>
                                <SelectItem value="GENERAL">General</SelectItem>
                            </SelectContent>
                        </Select>

                        <Input placeholder="Search College..." value={filters.college} onChange={e => handleFilterChange('college', e.target.value)} />
                        <Input placeholder="Search Qualification..." value={filters.qualification} onChange={e => handleFilterChange('qualification', e.target.value)} />
                        <Input placeholder="Search District..." value={filters.district} onChange={e => handleFilterChange('district', e.target.value)} />
                        <Input placeholder="Search Pin Code..." value={filters.pinCode} onChange={e => handleFilterChange('pinCode', e.target.value)} />
                        <Input placeholder="Search Referral..." value={filters.referralName} onChange={e => handleFilterChange('referralName', e.target.value)} />

                        <div className="flex gap-2 col-span-1 lg:col-span-2">
                            <Input type="date" title="Start Date" value={filters.startDate} onChange={e => handleFilterChange('startDate', e.target.value)} />
                            <ArrowRight className="w-6 h-6 mt-2 text-muted-foreground" />
                            <Input type="date" title="End Date" value={filters.endDate} onChange={e => handleFilterChange('endDate', e.target.value)} />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Data Table */}
            <Card>
                <CardContent className="p-0">
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/50">
                                    <TableHead>Date</TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Contact Info</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>College / Qual.</TableHead>
                                    <TableHead>Location Details</TableHead>
                                    <TableHead>Referral/Source</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="h-48 text-center">
                                            <Loader2 className="h-8 w-8 animate-spin mx-auto text-indigo-500 mb-2" />
                                            <p className="text-muted-foreground">Fetching data...</p>
                                        </TableCell>
                                    </TableRow>
                                ) : data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="h-48 text-center text-muted-foreground">
                                            No records found matching your criteria.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    data.map((item) => (
                                        <TableRow key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50">
                                            <TableCell className="whitespace-nowrap">
                                                {format(new Date(item.createdAt), 'dd MMM yyyy')}
                                            </TableCell>
                                            <TableCell className="font-medium">
                                                {item.name}
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm">{item.email}</div>
                                                <div className="text-sm text-muted-foreground">{item.phone}</div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-400">
                                                    {item.leadType === 'EVENT' ? 'Event' : item.leadType}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm">{item.college || '-'}</div>
                                                <div className="text-xs text-muted-foreground">{item.qualification || ''}</div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm">{item.district || item.location || '-'}</div>
                                                <div className="text-xs text-muted-foreground">{item.pinCode ? `PIN: ${item.pinCode}` : ''}</div>
                                            </TableCell>
                                            <TableCell>
                                                {item.referralName || item.source || '-'}
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
