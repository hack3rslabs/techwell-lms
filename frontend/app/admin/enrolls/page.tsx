"use client"

import * as React from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { courseApi, userApi as userApi2 } from '@/lib/api'
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
    const [isManualModalOpen, setIsManualModalOpen] = React.useState(false)
    const [manualForm, setManualForm] = React.useState({
        userId: '',
        courseId: '',
        batchId: '',
        couponCode: '',
        paymentMethod: 'CASH',
        amountPaid: ''
    })
    const [isSubmitting, setIsSubmitting] = React.useState(false)
    
    // Dropdown options
    const [courses, setCourses] = React.useState<any[]>([])

    React.useEffect(() => {
        if (isManualModalOpen) {
            courseApi.getAll().then(res => setCourses(res.data)).catch(console.error)
        }
    }, [isManualModalOpen])

    const handleManualEnrollment = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        try {
            const { default: api } = await import('@/lib/api')
            await api.post('/admin/enrollments/manual', manualForm)
            setIsManualModalOpen(false)
            fetchEnrollments()
            setManualForm({
                userId: '',
                courseId: '',
                batchId: '',
                couponCode: '',
                paymentMethod: 'CASH',
                amountPaid: ''
            })
            alert('Student enrolled successfully!')
        } catch (error: any) {
            alert(error.response?.data?.error || 'Failed to enroll student')
        } finally {
            setIsSubmitting(false)
        }
    }


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
                
                    <Dialog open={isManualModalOpen} onOpenChange={setIsManualModalOpen}>
                        <DialogTrigger asChild>
                            <Button className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white">
                                <GraduationCap className="h-4 w-4" />
                                New Enrollment
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                            <form onSubmit={handleManualEnrollment}>
                                <DialogHeader>
                                    <DialogTitle>Manual Student Enrollment</DialogTitle>
                                    <DialogDescription>
                                        Enroll an existing student into a course and collect cash or online payment.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="userId">Student User ID</Label>
                                        <Input
                                            id="userId"
                                            placeholder="Enter User ID (cuid)"
                                            value={manualForm.userId}
                                            onChange={(e) => setManualForm({ ...manualForm, userId: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="course">Course</Label>
                                        <Select onValueChange={(v) => setManualForm({ ...manualForm, courseId: v })} required>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select course" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {courses.map(c => (
                                                    <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="paymentMethod">Payment Method</Label>
                                        <Select value={manualForm.paymentMethod} onValueChange={(v) => setManualForm({ ...manualForm, paymentMethod: v })}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="CASH">Cash (Collected by Admin/Staff)</SelectItem>
                                                <SelectItem value="ONLINE">Online (Paid via other means)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="couponCode">Coupon / Promo Code (Optional)</Label>
                                        <Input
                                            id="couponCode"
                                            placeholder="e.g. SUMMER50"
                                            value={manualForm.couponCode}
                                            onChange={(e) => setManualForm({ ...manualForm, couponCode: e.target.value })}
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="amountPaid">Override Amount Paid (Optional)</Label>
                                        <Input
                                            id="amountPaid"
                                            type="number"
                                            placeholder="Leave empty to auto-calculate"
                                            value={manualForm.amountPaid}
                                            onChange={(e) => setManualForm({ ...manualForm, amountPaid: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button type="submit" disabled={isSubmitting}>
                                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Enroll Student
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>

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
