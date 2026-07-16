"use client"

import { useState, useEffect } from "react"
import { studentsApi, consultancyApi, employerRequestApi } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Download, Search, RefreshCw, Loader2, FileDown } from "lucide-react"
import { toast } from "sonner"

export default function GlobalDataPage() {
    const [activeTab, setActiveTab] = useState<'students' | 'employers' | 'consultancy'>('students')
    const [data, setData] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const [searchTerm, setSearchTerm] = useState("")
    const [isAdvancedFiltersOpen, setIsAdvancedFiltersOpen] = useState(false)
    const [filters, setFilters] = useState({
        status: 'ALL',
        source: 'ALL',
        dynamicField: '',
        dynamicValue: ''
    })

    async function fetchData(tab: string) {
        setLoading(true)
        try {
            if (tab === 'students') {
                const res = await studentsApi.getAll()
                // Deduplicate students by email or userId to fix the enrollment duplication issue
                const uniqueStudentsMap = new Map()
                res.data.students?.forEach((s: any) => {
                    const key = s.email || s.userId
                    if (!uniqueStudentsMap.has(key)) {
                        uniqueStudentsMap.set(key, s)
                    }
                })
                setData(Array.from(uniqueStudentsMap.values()))
            } else if (tab === 'employers') {
                const res = await employerRequestApi.getAll()
                setData(res.data.data || [])
            } else if (tab === 'consultancy') {
                const res = await consultancyApi.getInvitations()
                setData(res.data.invitations || [])
            }
        } catch (error) {
            console.error(error)
            toast.error(`Failed to load ${tab} data`)
        } finally {
            setLoading(false)
        }
    }


    useEffect(() => {
        fetchData(activeTab)
    }, [activeTab])


    const exportToCSV = () => {
        if (data.length === 0) {
            toast.error("No data to export")
            return
        }

        const filteredData = data.filter(item => 
            JSON.stringify(item).toLowerCase().includes(searchTerm.toLowerCase())
        )

        if (filteredData.length === 0) {
            toast.error("No data matches current search")
            return
        }

        // Get headers
        const headers = Object.keys(filteredData[0]).filter(key => typeof filteredData[0][key] !== 'object')
        
        // Convert data to CSV format
        const csvContent = [
            headers.join(','),
            ...filteredData.map(item => 
                headers.map(header => {
                    const val = item[header]
                    // Escape commas and quotes for CSV
                    const stringVal = val === null || val === undefined ? '' : String(val)
                    return `"${stringVal.replace(/"/g, '""')}"`
                }).join(',')
            )
        ].join('\n')

        // Trigger download
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const link = document.createElement('a')
        const url = URL.createObjectURL(blob)
        link.setAttribute('href', url)
        link.setAttribute('download', `${activeTab}_export_${new Date().toISOString().split('T')[0]}.csv`)
        link.style.visibility = 'hidden'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        toast.success("Export successful!")
    }

    const filteredData = data.filter(item => {
        // 1. Search text filter
        const matchesSearch = JSON.stringify(item).toLowerCase().includes(searchTerm.toLowerCase())
        if (!matchesSearch) return false

        // 2. Advanced filters
        if (filters.status !== 'ALL') {
            const itemStatus = item.status || item.publishStatus || ''
            if (itemStatus.toLowerCase() !== filters.status.toLowerCase()) return false
        }
        
        if (filters.source !== 'ALL') {
            const itemSource = item.source || item.industry || ''
            if (itemSource.toLowerCase() !== filters.source.toLowerCase()) return false
        }
        
        // 3. Dynamic Field filter
        if (filters.dynamicField && filters.dynamicValue) {
            const val = item[filters.dynamicField];
            const stringVal = val === null || val === undefined ? '' : String(val).toLowerCase();
            if (!stringVal.includes(filters.dynamicValue.toLowerCase())) return false;
        }

        return true
    })

    const availableFields = data.length > 0 ? Object.keys(data[0]).filter(k => typeof data[0][k] !== 'object') : []

    return (
        <div className="mx-auto max-w-7xl space-y-6 p-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Global Data Management</h1>
                    <p className="mt-2 text-muted-foreground">
                        Centralized view to search, filter, and export all system data.
                    </p>
                </div>
                <Button onClick={exportToCSV} className="bg-green-600 hover:bg-green-700">
                    <FileDown className="mr-2 h-4 w-4" /> Export CSV
                </Button>
            </div>

            <div className="flex border-b">
                {['students', 'employers', 'consultancy'].map(tab => (
                    <button 
                        key={tab}
                        onClick={() => setActiveTab(tab as any)}
                        className={`px-6 py-3 text-sm font-medium border-b-2 capitalize transition-colors
                            ${activeTab === tab ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300'}
                        `}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                        placeholder={`Search ${activeTab}...`} 
                        className="pl-9"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
                <Button 
                    variant={isAdvancedFiltersOpen ? "default" : "outline"} 
                    onClick={() => setIsAdvancedFiltersOpen(!isAdvancedFiltersOpen)}
                >
                    Advanced Filters
                </Button>
                <Button variant="outline" size="icon" onClick={() => fetchData(activeTab)} disabled={loading}>
                    <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                </Button>
            </div>

            {isAdvancedFiltersOpen && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border rounded-lg bg-muted/20">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Status</label>
                        <select 
                            className="w-full h-10 px-3 rounded-md border bg-background text-sm"
                            value={filters.status}
                            onChange={e => setFilters({...filters, status: e.target.value})}
                        >
                            <option value="ALL">All Statuses</option>
                            <option value="ACTIVE">Active</option>
                            <option value="COMPLETED">Completed</option>
                            <option value="PENDING">Pending</option>
                            <option value="APPROVED">Approved</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Category / Source</label>
                        <select 
                            className="w-full h-10 px-3 rounded-md border bg-background text-sm"
                            value={filters.source}
                            onChange={e => setFilters({...filters, source: e.target.value})}
                        >
                            <option value="ALL">All Categories</option>
                            <option value="ORGANIC">Organic</option>
                            <option value="REFERRAL">Referral</option>
                            <option value="IT">IT</option>
                            <option value="Healthcare">Healthcare</option>
                        </select>
                    </div>
                    <div className="space-y-2 md:col-span-2">
                        <label className="text-sm font-medium">Custom Field Filter</label>
                        <div className="flex gap-2">
                            <select 
                                className="w-1/3 h-10 px-3 rounded-md border bg-background text-sm"
                                value={filters.dynamicField}
                                onChange={e => setFilters({...filters, dynamicField: e.target.value})}
                            >
                                <option value="">Select Field...</option>
                                {availableFields.map(f => <option key={f} value={f}>{f}</option>)}
                            </select>
                            <Input 
                                placeholder="Value contains..." 
                                className="flex-1"
                                value={filters.dynamicValue}
                                onChange={e => setFilters({...filters, dynamicValue: e.target.value})}
                                disabled={!filters.dynamicField}
                            />
                        </div>
                    </div>
                    <div className="flex items-end col-span-full">
                        <Button 
                            variant="secondary" 
                            className="w-full"
                            onClick={() => setFilters({ status: 'ALL', source: 'ALL', dynamicField: '', dynamicValue: '' })}
                        >
                            Reset Filters
                        </Button>
                    </div>
                </div>
            )}

            <div className="border rounded-lg bg-card overflow-hidden">
                <div className="overflow-x-auto max-h-[600px]">
                    <Table>
                        <TableHeader className="bg-muted/50 sticky top-0 z-10">
                            {data.length > 0 && (
                                <TableRow>
                                    {Object.keys(data[0]).filter(k => typeof data[0][k] !== 'object').slice(0, 7).map(key => (
                                        <TableHead key={key} className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</TableHead>
                                    ))}
                                </TableRow>
                            )}
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-64 text-center">
                                        <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                                    </TableCell>
                                </TableRow>
                            ) : filteredData.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-64 text-center text-muted-foreground">
                                        No records found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredData.map((item, i) => (
                                    <TableRow key={item.id || i}>
                                        {Object.keys(item).filter(k => typeof item[k] !== 'object').slice(0, 7).map((key, j) => (
                                            <TableCell key={j} className="max-w-[200px] truncate" title={String(item[key])}>
                                                {String(item[key])}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
            <div className="text-sm text-muted-foreground text-right">
                Showing {filteredData.length} of {data.length} total records
            </div>
        </div>
    )
}
