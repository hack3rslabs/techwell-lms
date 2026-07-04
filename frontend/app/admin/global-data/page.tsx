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

    useEffect(() => {
        fetchData(activeTab)
    }, [activeTab])

    const fetchData = async (tab: string) => {
        setLoading(true)
        try {
            if (tab === 'students') {
                const res = await studentsApi.getAll()
                setData(res.data.students || [])
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

    const filteredData = data.filter(item => 
        JSON.stringify(item).toLowerCase().includes(searchTerm.toLowerCase())
    )

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
                <Button variant="outline" size="icon" onClick={() => fetchData(activeTab)} disabled={loading}>
                    <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                </Button>
            </div>

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
