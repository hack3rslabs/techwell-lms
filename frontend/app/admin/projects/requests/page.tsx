"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { format } from "date-fns"

export default function ProjectRequestsPage() {
    const { user, isAuthenticated } = useAuth()
    const router = useRouter()
    const [requests, setRequests] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!isAuthenticated) return;
        if (!['ADMIN', 'SUPER_ADMIN', 'CONSULTANCY'].includes(user?.role ?? '')) {
            router.push('/dashboard')
            return;
        }

        const fetchRequests = async () => {
            try {
                const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
                const token = localStorage.getItem('token')
                const res = await fetch(`${API_URL}/projects/requests/all`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                })
                if (res.ok) {
                    const data = await res.json()
                    setRequests(data)
                }
            } catch (error) {
                console.error("Failed to fetch requests", error)
            } finally {
                setLoading(false)
            }
        }
        fetchRequests()
    }, [user, isAuthenticated, router])

    if (loading) return <div className="p-8 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>

    return (
        <div className="p-8 space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Project Requests</h1>
            
            <Card>
                <CardHeader>
                    <CardTitle>All Student Requests</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Student</TableHead>
                                <TableHead>College</TableHead>
                                <TableHead>Project</TableHead>
                                <TableHead>Price</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {requests.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                        No requests found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                requests.map((req) => (
                                    <TableRow key={req.id}>
                                        <TableCell>{format(new Date(req.createdAt), 'MMM d, yyyy')}</TableCell>
                                        <TableCell>
                                            <div className="font-medium">{req.user.name}</div>
                                            <div className="text-sm text-muted-foreground">{req.user.email}</div>
                                            <div className="text-sm text-muted-foreground">{req.user.phone}</div>
                                        </TableCell>
                                        <TableCell>
                                            {req.user.institute?.name || <span className="text-muted-foreground italic">N/A</span>}
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-medium">{req.project.title}</div>
                                            <Badge variant="outline" className="mt-1">{req.project.category}</Badge>
                                        </TableCell>
                                        <TableCell>{req.project.price}</TableCell>
                                        <TableCell>
                                            <Badge variant={req.status === 'PENDING' ? 'default' : 'secondary'}>
                                                {req.status}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
