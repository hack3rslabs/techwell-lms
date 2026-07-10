"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
    Users, Briefcase, GraduationCap, TrendingUp, UploadCloud, Plus, Settings, ArrowRight, Activity, Building2
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export default function InstituteDashboard() {
    const { user } = useAuth()
    const [institute, setInstitute] = useState<any>(null)
    const [drives, setDrives] = useState<any[]>([])
    const [logs, setLogs] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    // Form for bulk upload
    const [csvContent, setCsvContent] = useState('')
    const [uploading, setUploading] = useState(false)
    const [uploadMode, setUploadMode] = useState(false)

    async function fetchData() {
        try {
            const headers = { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            const [instRes, drivesRes, logsRes] = await Promise.all([
                fetch('/api/institutes/my-institute', { headers }),
                fetch('/api/campus-drives/institute', { headers }),
                fetch('/api/bulk-upload/logs', { headers })
            ])

            if (instRes.ok) setInstitute(await instRes.json())
            if (drivesRes.ok) setDrives(await drivesRes.json())
            if (logsRes.ok) setLogs(await logsRes.json())
        } catch (error) {
            console.error('Error fetching data:', error)
        } finally {
            setLoading(false)
        }
    }


    useEffect(() => {
        if (user && user.role === 'INSTITUTE_ADMIN') {
            fetchData()
        }
    }, [user])


    const handleBulkUpload = async (e: React.FormEvent) => {
        e.preventDefault()
        setUploading(true)
        try {
            const rows = csvContent.split('\n').slice(1) // skip header
            const students = rows.filter(row => row.trim()).map(row => {
                const [name, email, phone, password] = row.split(',')
                return { name, email, phone, password }
            })

            const res = await fetch('/api/bulk-upload', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ filename: 'manual-upload.csv', students })
            })

            const data = await res.json()
            if (res.ok) {
                alert(`Upload complete. Success: ${data.successCount}, Failed: ${data.failedCount}`)
                setCsvContent('')
                setUploadMode(false)
                fetchData()
            } else {
                alert(data.error || 'Upload failed')
            }
        } catch (error) {
            alert('Upload failed')
        } finally {
            setUploading(false)
        }
    }

    if (loading) {
        return <div className="flex h-[60vh] items-center justify-center">Loading dashboard...</div>
    }

    return (
        <div className="container space-y-8 animate-in fade-in duration-500 pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-100 pb-6">
                <div>
                    <h1 className="text-3xl font-bold text-foreground tracking-tight">
                        Placement Overview
                    </h1>
                    <p className="text-muted-foreground mt-1 text-sm font-medium">Welcome back, {institute?.name}</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setUploadMode(!uploadMode)} className="bg-white border-gray-200 text-gray-700 hover:bg-gray-50 shadow-sm">
                        <UploadCloud className="mr-2 h-4 w-4 text-gray-500" /> Upload Students
                    </Button>
                </div>
            </div>

            {uploadMode && (
                <Card className="bg-white border border-gray-200 shadow-sm rounded-xl">
                    <CardHeader className="border-b border-gray-100 bg-gray-50/50 py-4">
                        <CardTitle className="text-base font-bold text-gray-900 flex items-center gap-2">
                            <UploadCloud className="h-4 w-4 text-indigo-600" /> Bulk Student Upload
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <form onSubmit={handleBulkUpload} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Paste CSV Data (name,email,phone,password)</label>
                                <textarea
                                    rows={5}
                                    value={csvContent}
                                    onChange={e => setCsvContent(e.target.value)}
                                    className="block w-full border border-gray-300 rounded-md p-2 font-mono text-sm focus:ring-indigo-500 focus:border-indigo-500"
                                    placeholder="name,email,phone,password\nJohn Doe,john@test.com,1234567890,pass123"
                                    required
                                />
                            </div>
                            <Button type="submit" disabled={uploading} className="bg-indigo-600 text-white hover:bg-indigo-700">
                                {uploading ? 'Processing...' : 'Upload Data'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            )}

            {/* Stats */}
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-3">
                <Card className="bg-white border border-gray-200 shadow-sm rounded-xl hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-indigo-50 rounded-xl">
                                <GraduationCap className="h-6 w-6 text-indigo-600" />
                            </div>
                            <Badge variant="outline" className="text-indigo-600 bg-indigo-50 border-indigo-100 font-medium">Students</Badge>
                        </div>
                        <h3 className="text-3xl font-bold text-gray-900">2,450</h3>
                        <p className="text-sm font-medium text-gray-500 mt-1">Total Enrolled</p>
                    </CardContent>
                </Card>
                <Card className="bg-white border border-gray-200 shadow-sm rounded-xl hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-green-50 rounded-xl">
                                <Briefcase className="h-6 w-6 text-green-600" />
                            </div>
                            <Badge variant="outline" className="text-green-600 bg-green-50 border-green-100 font-medium">Placed</Badge>
                        </div>
                        <h3 className="text-3xl font-bold text-gray-900">1,240</h3>
                        <p className="text-sm font-medium text-gray-500 mt-1">Students Placed</p>
                    </CardContent>
                </Card>
                <Card className="bg-white border border-gray-200 shadow-sm rounded-xl hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-blue-50 rounded-xl">
                                <Building2 className="h-6 w-6 text-blue-600" />
                            </div>
                            <Badge variant="outline" className="text-blue-600 bg-blue-50 border-blue-100 font-medium">Drives</Badge>
                        </div>
                        <h3 className="text-3xl font-bold text-gray-900">{drives.length}</h3>
                        <p className="text-sm font-medium text-gray-500 mt-1">Active Drives</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Drives Table */}
                <Card className="lg:col-span-2 bg-white border border-gray-200 shadow-sm rounded-xl overflow-hidden">
                    <CardHeader className="border-b border-gray-100 bg-gray-50/50 py-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-base font-bold text-gray-900">Recent Campus Drives</CardTitle>
                            </div>
                            <Button variant="ghost" size="sm" className="text-xs font-medium text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50">
                                View All <ArrowRight className="ml-1.5 h-3 w-3" />
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-white border-b border-gray-100">
                                        <TableHead className="font-semibold text-gray-700 text-xs uppercase pl-6">Company</TableHead>
                                        <TableHead className="font-semibold text-gray-700 text-xs uppercase">Role</TableHead>
                                        <TableHead className="font-semibold text-gray-700 text-xs uppercase">Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {drives.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={3} className="text-center py-8 text-gray-500">No drives yet.</TableCell>
                                        </TableRow>
                                    ) : (
                                        drives.slice(0, 5).map(drive => (
                                            <TableRow key={drive.id} className="hover:bg-indigo-50/30">
                                                <TableCell className="pl-6 py-4 font-bold text-sm text-gray-900">{drive.employer.name || drive.employer.companyName || drive.employer.email}</TableCell>
                                                <TableCell className="text-sm text-gray-500">{drive.jobRole}</TableCell>
                                                <TableCell>
                                                    <Badge variant="secondary" className="bg-indigo-50 text-indigo-700">{drive.instituteLinkStatus || drive.status}</Badge>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>

                {/* Upload History */}
                <Card className="bg-white border border-gray-200 shadow-sm rounded-xl overflow-hidden">
                    <CardHeader className="border-b border-gray-100 bg-gray-50/50 py-4">
                        <CardTitle className="text-base font-bold text-gray-900 flex items-center gap-2">
                            <Activity className="h-4 w-4 text-indigo-600" /> Upload History
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        {logs.length === 0 ? (
                            <p className="text-sm text-gray-400 text-center py-8">No uploads yet.</p>
                        ) : (
                            <div className="max-h-[350px] overflow-y-auto">
                                {logs.map(log => (
                                    <div key={log.id} className="p-4 border-b border-gray-50 text-sm">
                                        <p className="font-medium text-gray-900">{log.filename}</p>
                                        <div className="mt-1 flex items-center gap-4 text-xs">
                                            <span className="text-green-600 font-semibold">{log.successCount} Success</span>
                                            <span className="text-red-500 font-semibold">{log.failedCount} Failed</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
