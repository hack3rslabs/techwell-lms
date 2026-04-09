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
import { userApi } from '@/lib/api'
import { GraduationCap, Loader2, RefreshCw } from 'lucide-react'

interface Enrollment {
    id: string
    userId: string
    courseId: string
    enrolledAt: string
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
                <Button variant="outline" onClick={fetchEnrollments} className="gap-2">
                    <RefreshCw className="h-4 w-4" />
                    Refresh
                </Button>
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
                                                Rs. {enrollment.course?.price || 0}
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
