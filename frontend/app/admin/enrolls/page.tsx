"use client"

import * as React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import api, { userApi } from '@/lib/api'
import { GraduationCap, Loader2, RefreshCw, Download, MoreHorizontal, CheckCircle2, XCircle, PauseCircle } from 'lucide-react'
import ExcelJS from 'exceljs'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'

interface Enrollment {
    id: string
    userId: string
    courseId: string
    enrolledAt: string
    status: string
    user?: { name: string; email: string; phone?: string }
    course?: { title: string; price: number }
}

export default function EnrollmentOverviewPage() {
    const [enrollments, setEnrollments] = React.useState<Enrollment[]>([])
    const [isLoading, setIsLoading] = React.useState(true)

    const fetchEnrollments = React.useCallback(async () => {
        setIsLoading(true)
        try {
            const res = await userApi.getEnrollments()
            setEnrollments(res.data.enrollments)
        } catch (error) {
            console.error('Failed to fetch enrollments:', error)
        } finally {
            setIsLoading(false)
        }
    }, [])

    React.useEffect(() => {
        fetchEnrollments()
    }, [fetchEnrollments])

    const handleExportExcel = () => {
        try {
            const dataToExport = enrollments.map(e => ({
                'Student Name': e.user?.name || 'Unknown',
                'Email': e.user?.email || 'N/A',
                'Phone': e.user?.phone || 'N/A',
                'Course': e.course?.title || 'Unknown',
                'Price': e.course?.price || 0,
                'Status': e.status || 'ACTIVE',
                'Enrolled Date': new Date(e.enrolledAt).toLocaleDateString()
            }))
            
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Enrollments");
        
        if (dataToExport && dataToExport.length > 0) {
            worksheet.columns = Object.keys(dataToExport[0]).map(key => ({ header: key, key }));
            worksheet.addRows(dataToExport);
        }
        
        workbook.xlsx.writeBuffer().then((buffer) => {
            const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Enrollments_Export_${new Date().toISOString().split('T')[0]}.xlsx`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        });
            toast.success("Exported to Excel successfully")
        } catch (error) {
            toast.error("Failed to export to Excel")
        }
    }

    const handleStatusChange = async (id: string, status: string) => {
        try {
            await api.patch(`/admin/enrollments/${id}/status`, { status })
            toast.success(`Enrollment marked as ${status}`)
            fetchEnrollments()
        } catch (error) {
            toast.error("Failed to update status")
        }
    }

    return (
        <div className="p-8 max-w-[1600px] mx-auto space-y-8">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
                        Enrollment Overview
                    </h1>
                    <p className="text-muted-foreground mt-2 text-lg">
                        Confirmed student enrollments created after successful checkout
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={handleExportExcel} disabled={isLoading || enrollments.length === 0} className="gap-2">
                        <Download className="h-4 w-4" />
                        Export Excel
                    </Button>
                    <Button variant="outline" onClick={fetchEnrollments} className="gap-2" disabled={isLoading}>
                        <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <GraduationCap className="h-5 w-5 text-primary" />
                        Active Enrollments
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="py-8 flex justify-center">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : enrollments.length > 0 ? (
                        <div className="rounded-md border text-sm">
                            <Table>
                                <TableHeader className="bg-muted/50">
                                    <TableRow>
                                        <TableHead>Student</TableHead>
                                        <TableHead>Contact</TableHead>
                                        <TableHead>Course</TableHead>
                                        <TableHead>Course Price</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Enrollment Date</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {enrollments.map((enrollment) => (
                                        <TableRow key={enrollment.id}>
                                            <TableCell className="font-medium">
                                                {enrollment.user?.name}
                                            </TableCell>
                                            <TableCell>
                                                <div>{enrollment.user?.email}</div>
                                                <div className="text-xs text-muted-foreground">{enrollment.user?.phone || '-'}</div>
                                            </TableCell>
                                            <TableCell className="font-medium">
                                                {enrollment.course?.title}
                                            </TableCell>
                                            <TableCell>
                                                Rs. {enrollment.course?.price || 0}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={enrollment.status === 'COMPLETED' ? 'default' : enrollment.status === 'CANCELLED' ? 'destructive' : 'secondary'}>
                                                    {enrollment.status || 'ACTIVE'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {new Date(enrollment.enrolledAt).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={() => handleStatusChange(enrollment.id, 'ACTIVE')}>
                                                            <CheckCircle2 className="mr-2 h-4 w-4 text-green-600" /> Mark Active
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleStatusChange(enrollment.id, 'COMPLETED')}>
                                                            <CheckCircle2 className="mr-2 h-4 w-4 text-blue-600" /> Mark Completed
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleStatusChange(enrollment.id, 'PAUSED')}>
                                                            <PauseCircle className="mr-2 h-4 w-4 text-yellow-600" /> Mark Paused
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleStatusChange(enrollment.id, 'CANCELLED')} className="text-red-600">
                                                            <XCircle className="mr-2 h-4 w-4" /> Mark Cancelled
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    ) : (
                        <div className="text-center py-12 border rounded-lg bg-muted/20">
                            <GraduationCap className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
                            <p className="text-lg font-medium">No active enrollments found</p>
                            <p className="text-muted-foreground text-sm">
                                Students appear here after successful payment creates an enrollment.
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
