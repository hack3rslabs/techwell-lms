"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Briefcase, Building2, MapPin, Search, CheckCircle, XCircle } from "lucide-react"

export default function InstituteApprovals() {
    const { user } = useAuth()
    const [drives, setDrives] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (user && user.role === 'INSTITUTE_ADMIN') {
            fetchDrives()
        }
    }, [user])

    const fetchDrives = async () => {
        try {
            const res = await fetch('/api/campus-drives/institute', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            })
            if (res.ok) setDrives(await res.json())
        } catch (error) {
            console.error('Error fetching drives:', error)
        } finally {
            setLoading(false)
        }
    }

    const updateDriveStatus = async (driveId: string, status: string) => {
        try {
            const res = await fetch(`/api/campus-drives/${driveId}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ status })
            })
            if (res.ok) {
                alert(`Drive ${status.toLowerCase()} successfully.`)
                fetchDrives()
            }
        } catch (error) {
            console.error('Error updating drive:', error)
        }
    }

    if (loading) {
        return <div className="flex h-[60vh] items-center justify-center">Loading...</div>
    }

    return (
        <div className="container space-y-8 animate-in fade-in duration-500 pb-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-100 pb-6">
                <div>
                    <h1 className="text-3xl font-bold text-foreground tracking-tight">Campus Drives</h1>
                    <p className="text-muted-foreground mt-1 text-sm font-medium">Manage and approve hiring drives requested by employers.</p>
                </div>
            </div>

            <Card className="bg-white border border-gray-200 shadow-sm rounded-xl overflow-hidden">
                <CardHeader className="border-b border-gray-100 bg-gray-50/50 py-4">
                    <CardTitle className="text-base font-bold text-gray-900 flex items-center gap-2">
                        <Briefcase className="h-4 w-4 text-indigo-600" /> All Drives
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-white border-b border-gray-100">
                                    <TableHead className="font-semibold text-gray-700 text-xs uppercase pl-6">Employer Details</TableHead>
                                    <TableHead className="font-semibold text-gray-700 text-xs uppercase">Role & Target</TableHead>
                                    <TableHead className="font-semibold text-gray-700 text-xs uppercase">Status</TableHead>
                                    <TableHead className="font-semibold text-gray-700 text-xs uppercase text-right pr-6">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {drives.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center py-12 text-gray-400">
                                            No campus drives requested yet.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    drives.map(drive => (
                                        <TableRow key={drive.id} className="hover:bg-indigo-50/30 group">
                                            <TableCell className="pl-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-gray-900 text-sm">{drive.employer?.name || drive.employer?.companyName || drive.employer?.email}</span>
                                                    <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                                                        <MapPin className="h-3 w-3" />
                                                        <span>{drive.hiringMode}</span>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-semibold text-sm text-gray-800">{drive.jobRole}</span>
                                                    <span className="text-xs text-gray-500 mt-0.5">Target: {drive.targetYear || 'All'} | Openings: {drive.openings || 'N/A'}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="secondary" className={`font-medium ${
                                                    drive.instituteLinkStatus === 'ACCEPTED' ? 'bg-green-100 text-green-700' :
                                                    drive.instituteLinkStatus === 'REJECTED' ? 'bg-red-100 text-red-700' :
                                                    'bg-amber-100 text-amber-700'
                                                }`}>
                                                    {drive.instituteLinkStatus || 'INVITED'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right pr-6">
                                                {(!drive.instituteLinkStatus || drive.instituteLinkStatus === 'INVITED') ? (
                                                    <div className="flex justify-end gap-2">
                                                        <Button size="sm" variant="outline" className="text-green-600 border-green-200 hover:bg-green-50" onClick={() => updateDriveStatus(drive.id, 'ACCEPTED')}>
                                                            <CheckCircle className="h-4 w-4 mr-1" /> Accept
                                                        </Button>
                                                        <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => updateDriveStatus(drive.id, 'REJECTED')}>
                                                            <XCircle className="h-4 w-4 mr-1" /> Reject
                                                        </Button>
                                                    </div>
                                                ) : drive.instituteLinkStatus === 'ACCEPTED' ? (
                                                    <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white">
                                                        Invite Students
                                                    </Button>
                                                ) : (
                                                    <span className="text-sm text-gray-400">Rejected</span>
                                                )}
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
