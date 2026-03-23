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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { enrollmentRequestApi, userApi } from '@/lib/api'
import { CheckCircle2, XCircle, Loader2, BookOpen, GraduationCap } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface EnrollmentRequest {
    id: string
    userId: string
    courseId: string
    status: 'PENDING' | 'APPROVED' | 'REJECTED'
    requestedAt: string
    createdAt: string
    email?: string
    phone?: string
    qualification?: string
    user?: { name: string; email: string }
    course?: { title: string; price?: number }
}

interface Enrollment {
    id: string
    userId: string
    courseId: string
    enrolledAt: string
    user?: { name: string; email: string; phone?: string }
    course?: { title: string; price: number }
}

export default function EnrollmentRequestsPage() {
    const [requests, setRequests] = React.useState<EnrollmentRequest[]>([])
    const [enrollments, setEnrollments] = React.useState<Enrollment[]>([])
    const [isLoading, setIsLoading] = React.useState(true)
    const [isLoadingEnrollments, setIsLoadingEnrollments] = React.useState(true)
    const [processingId, setProcessingId] = React.useState<string | null>(null)

    const fetchRequests = async () => {
        try {
            const res = await enrollmentRequestApi.getAll()
            setRequests(res.data.requests)
        } catch (error) {
            console.error('Failed to fetch enrollment requests:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const fetchEnrollments = async () => {
        try {
            const res = await userApi.getEnrollments()
            setEnrollments(res.data.enrollments)
        } catch (error) {
            console.error('Failed to fetch enrollments:', error)
        } finally {
            setIsLoadingEnrollments(false)
        }
    }

    React.useEffect(() => {
        fetchRequests()
        fetchEnrollments()
    }, [])

    const handleStatusUpdate = async (id: string, status: 'APPROVED' | 'REJECTED') => {
        setProcessingId(id)
        try {
            await enrollmentRequestApi.updateStatus(id, status)
            alert(`Request ${status.toLowerCase()} successfully`)
            fetchRequests()
            if (status === 'APPROVED') {
                fetchEnrollments() // Refresh active enrollments on approval
            }
        } catch (error: unknown) {
            const err = error as { response?: { data?: { error?: string } } };
            console.error(`Failed to update request to ${status}:`, error)
            alert(err.response?.data?.error || 'Failed to update request status')
        } finally {
            setProcessingId(null)
        }
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'APPROVED':
                return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Approved</Badge>
            case 'PENDING':
                return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">Pending</Badge>
            case 'REJECTED':
                return <Badge className="bg-red-100 text-red-700 hover:bg-red-100">Rejected</Badge>
            default:
                return <Badge>{status}</Badge>
        }
    }

    return (
        <div className="p-8 max-w-[1600px] mx-auto space-y-8">
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">Enrollment Management</h1>
                    <p className="text-muted-foreground mt-2 text-lg">
                        Manage active enrollments and approve requests
                    </p>
                </div>
            </div>

            <Tabs defaultValue="enrollments" className="w-full">
                <TabsList className="grid w-full grid-cols-2 max-w-[400px] mb-6">
                    <TabsTrigger value="enrollments">Active Enrollments</TabsTrigger>
                    <TabsTrigger value="requests">Enrollment Requests</TabsTrigger>
                </TabsList>
                
                <TabsContent value="enrollments" className="mt-0">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <GraduationCap className="h-5 w-5 text-primary" />
                                Active Enrollments
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {isLoadingEnrollments ? (
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
                                                <TableHead>Enrollment Date</TableHead>
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
                                                        ₹{enrollment.course?.price || '0'}
                                                    </TableCell>
                                                    <TableCell>
                                                        {new Date(enrollment.enrolledAt).toLocaleDateString()}
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
                                    <p className="text-muted-foreground text-sm">When students enroll in courses, they will appear here.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="requests" className="mt-0">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <BookOpen className="h-5 w-5 text-primary" />
                                Requests Ledger
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {isLoading ? (
                                <div className="py-8 flex justify-center">
                                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                </div>
                            ) : requests.length > 0 ? (
                                <div className="rounded-md border text-sm">
                                    <Table>
                                        <TableHeader className="bg-muted/50">
                                            <TableRow>
                                                <TableHead>Student</TableHead>
                                                <TableHead>Course</TableHead>
                                                <TableHead>Contact</TableHead>
                                                <TableHead>Qualification</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead>Date</TableHead>
                                                <TableHead className="text-right">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {requests.map((req) => (
                                                <TableRow key={req.id}>
                                                    <TableCell>
                                                        <div className="font-medium text-foreground">{req.user?.name || '-'}</div>
                                                        <div className="text-xs text-muted-foreground">{req.email}</div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="font-medium">{req.course?.title}</div>
                                                        <div className="text-xs text-muted-foreground">₹{req.course?.price || '0'}</div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div>{req.email}</div>
                                                        <div className="text-muted-foreground">{req.phone || '-'}</div>
                                                    </TableCell>
                                                    <TableCell>{req.qualification || '-'}</TableCell>
                                                    <TableCell>{getStatusBadge(req.status)}</TableCell>
                                                    <TableCell>
                                                        {new Date(req.createdAt).toLocaleDateString()}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        {req.status === 'PENDING' ? (
                                                            <div className="flex items-center justify-end gap-2">
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    className="h-8 bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-800 border-green-200"
                                                                    disabled={processingId === req.id}
                                                                    onClick={() => handleStatusUpdate(req.id, 'APPROVED')}
                                                                >
                                                                    {processingId === req.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-1 h-4 w-4" />}
                                                                    Approve
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    className="h-8 bg-red-50 text-red-700 hover:bg-red-100 hover:text-red-800 border-red-200"
                                                                    disabled={processingId === req.id}
                                                                    onClick={() => handleStatusUpdate(req.id, 'REJECTED')}
                                                                >
                                                                    {processingId === req.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="mr-1 h-4 w-4" />}
                                                                    Cancel
                                                                </Button>
                                                            </div>
                                                        ) : req.status === 'APPROVED' ? (
                                                            <div className="flex items-center justify-end gap-2">
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    className="h-8 bg-red-50 text-red-700 hover:bg-red-100 hover:text-red-800 border-red-200"
                                                                    disabled={processingId === req.id}
                                                                    onClick={() => handleStatusUpdate(req.id, 'REJECTED')}
                                                                >
                                                                    {processingId === req.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="mr-1 h-4 w-4" />}
                                                                    Revoke Admission
                                                                </Button>
                                                            </div>
                                                        ) : (
                                                            <span className="text-xs text-muted-foreground">Rejected / Cancelled</span>
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            ) : (
                                <div className="text-center py-12 border rounded-lg bg-muted/20">
                                    <BookOpen className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
                                    <p className="text-lg font-medium">No enrollment requests found</p>
                                    <p className="text-muted-foreground text-sm">When students request enrollment, they will appear here.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
