"use client"
import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, FileText, CheckCircle } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function AdminInternshipsPortal() {
    const [enrollments, setEnrollments] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchInterns = async () => {
            try {
                const res = await fetch('/api/internships', {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                });
                const data = await res.json();
                if (data.success) {
                    setEnrollments(data.data);
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        }
        fetchInterns();
    }, [])

    const handleAssignMentor = async (enrollmentId: string) => {
        const mentorId = prompt("Enter Mentor User ID:");
        if (!mentorId) return;

        try {
            const res = await fetch(`/api/internships/${enrollmentId}/mentor`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}` 
                },
                body: JSON.stringify({ mentorId })
            });
            const data = await res.json();
            if (data.success) {
                alert("Mentor assigned!");
                window.location.reload();
            }
        } catch (error) {
            console.error(error);
            alert("Error assigning mentor");
        }
    }

    if (loading) return <div className="p-8">Loading Interns...</div>

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Internship Management</h1>
                    <p className="text-slate-500">Manage intern applications, assign mentors, and review performance.</p>
                </div>
                <Button className="bg-indigo-600">Create Program</Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card>
                    <CardContent className="pt-6 flex items-center gap-4">
                        <div className="p-3 bg-indigo-100 text-indigo-600 rounded-lg"><Users className="w-6 h-6" /></div>
                        <div>
                            <p className="text-sm text-slate-500 font-medium">Total Active Interns</p>
                            <p className="text-2xl font-bold">{enrollments.filter(e => e.status === 'ACTIVE').length}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6 flex items-center gap-4">
                        <div className="p-3 bg-amber-100 text-amber-600 rounded-lg"><FileText className="w-6 h-6" /></div>
                        <div>
                            <p className="text-sm text-slate-500 font-medium">Pending Assignments</p>
                            <p className="text-2xl font-bold">{enrollments.filter(e => e.status === 'PENDING').length}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6 flex items-center gap-4">
                        <div className="p-3 bg-emerald-100 text-emerald-600 rounded-lg"><CheckCircle className="w-6 h-6" /></div>
                        <div>
                            <p className="text-sm text-slate-500 font-medium">Offers Converted</p>
                            <p className="text-2xl font-bold">{enrollments.filter(e => e.offerConverted).length}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Intern Directory</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Student</TableHead>
                                <TableHead>Program</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Mentor</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {enrollments.map((enroll) => (
                                <TableRow key={enroll.id}>
                                    <TableCell>
                                        <p className="font-medium">{enroll.user?.name}</p>
                                        <p className="text-xs text-slate-500">{enroll.user?.email}</p>
                                    </TableCell>
                                    <TableCell>{enroll.program?.title}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={enroll.status === 'ACTIVE' ? 'border-emerald-500 text-emerald-500' : 'border-amber-500 text-amber-500'}>
                                            {enroll.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {enroll.mentor?.name || <Button variant="link" size="sm" onClick={() => handleAssignMentor(enroll.id)}>Assign Mentor</Button>}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="outline" size="sm">View Logs</Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {enrollments.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8 text-slate-500">No interns found in the system.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
