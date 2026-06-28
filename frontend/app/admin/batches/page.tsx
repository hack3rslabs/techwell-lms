"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { 
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Plus, Users, Calendar } from "lucide-react"
import api from "@/lib/api"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import ExcelJS from 'exceljs'
import { toast } from "sonner"
import { Download, Trash2 } from "lucide-react"

export default function BatchesPage() {
    const { hasPermission } = useAuth()
    const router = useRouter()
    const [batches, setBatches] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const handleExportExcel = () => {
        try {
            const dataToExport = batches.map(b => ({
                'Batch Code': b.batchCode,
                'Batch Name': b.name,
                'Course': b.course?.title || 'Unknown Course',
                'Timings': b.timings || 'Not Set',
                'Job Assistance': b.hasJobAssistance ? 'Yes' : 'No',
                'Students Enrolled': b._count?.enrollments || 0,
                'Status': b.isActive ? 'Active' : 'Inactive',
            }))
            
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Batches");
        
        if (dataToExport && dataToExport.length > 0) {
            worksheet.columns = Object.keys(dataToExport[0]).map(key => ({ header: key, key }));
            worksheet.addRows(dataToExport);
        }
        
        workbook.xlsx.writeBuffer().then((buffer) => {
            const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Batches_Export_${new Date().toISOString().split('T')[0]}.xlsx`;
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

    useEffect(() => {
        fetchBatches()
    }, [])

    const fetchBatches = async () => {
        try {
            setLoading(true)
            const res = await api.get('/batches')
            setBatches(res.data)
        } catch (error) {
            console.error("Failed to fetch batches", error)
        } finally {
            setLoading(false)
        }
    }

    if (!hasPermission("COURSES")) {
        return <div className="p-8">Access Denied</div>
    }

    return (
        <div className="p-8 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Batches</h1>
                    <p className="text-muted-foreground mt-2">Manage student batches, assign instructors, and track attendance.</p>
                </div>
                {hasPermission("COURSES") && (
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={handleExportExcel} disabled={loading || batches.length === 0}>
                            <Download className="mr-2 h-4 w-4" />
                            Export Excel
                        </Button>
                        <Button onClick={() => router.push('/admin/batches/new')}>
                            <Plus className="mr-2 h-4 w-4" />
                            Create Batch
                        </Button>
                    </div>
                )}
            </div>

            <div className="border rounded-md">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Batch Code</TableHead>
                            <TableHead>Batch Name</TableHead>
                            <TableHead>Course</TableHead>
                            <TableHead>Timings</TableHead>
                            <TableHead>Job Assistance</TableHead>
                            <TableHead>Students</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                                    Loading batches...
                                </TableCell>
                            </TableRow>
                        ) : batches.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                                    No batches found
                                </TableCell>
                            </TableRow>
                        ) : (
                            batches.map(batch => (
                                <TableRow key={batch.id}>
                                    <TableCell className="font-medium">{batch.batchCode}</TableCell>
                                    <TableCell>{batch.name}</TableCell>
                                    <TableCell>{batch.course?.title || 'Unknown Course'}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center text-sm text-muted-foreground">
                                            <Calendar className="mr-1 h-3 w-3" />
                                            {batch.timings || 'Not Set'}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {batch.hasJobAssistance ? (
                                            <Badge variant="default" className="bg-green-500">Enabled</Badge>
                                        ) : (
                                            <Badge variant="secondary">Disabled</Badge>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1">
                                            <Users className="h-4 w-4 text-muted-foreground" />
                                            {batch._count?.enrollments || 0}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {batch.isActive ? (
                                            <Badge variant="outline" className="text-green-600 border-green-600">Active</Badge>
                                        ) : (
                                            <Badge variant="outline" className="text-red-600 border-red-600">Inactive</Badge>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button size="sm" onClick={() => router.push(`/admin/batches/${batch.id}`)} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                                            Manage Batch
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
