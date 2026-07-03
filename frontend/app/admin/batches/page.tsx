"use client"

import * as React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { batchesApi, courseApi, studentsApi } from '@/lib/api'
import { useToast } from '@/components/ui/use-toast'
import {
    Loader2,
    Search,
    Users,
    RefreshCw,
    Filter,
    ChevronLeft,
    ChevronRight,
    MessageSquare,
    CheckCircle2,
    Edit2,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

interface BatchRecord {
    id: string
    name: string
    batchCode: string
    courseId: string
    course: { title: string }
    createdAt: string
    status: 'ACTIVE' | 'COMPLETED'
    _count: { BatchStudent: number }
}

export default function BatchesPage() {
    const { toast } = useToast()
    const [batches, setBatches] = React.useState<BatchRecord[]>([])
    const [courses, setCourses] = React.useState<{id: string, title: string}[]>([])
    const [isLoading, setIsLoading] = React.useState(true)
    const [searchQuery, setSearchQuery] = React.useState('')
    const [selectedCourse, setSelectedCourse] = React.useState<string>('all')
    const [pagination, setPagination] = React.useState({
        total: 0,
        page: 1,
        limit: 50,
        totalPages: 0,
    })

    // Batch Students View
    const [selectedBatchForList, setSelectedBatchForList] = React.useState<BatchRecord | null>(null)
    const [batchStudents, setBatchStudents] = React.useState<any[]>([])
    const [isFetchingStudents, setIsFetchingStudents] = React.useState(false)

    // Batch Edit
    const [selectedBatchForEdit, setSelectedBatchForEdit] = React.useState<BatchRecord | null>(null)
    const [editName, setEditName] = React.useState('')
    const [isUpdating, setIsUpdating] = React.useState(false)

    const handleEditClick = (batch: BatchRecord) => {
        setSelectedBatchForEdit(batch)
        setEditName(batch.name)
    }

    const handleUpdateBatch = async () => {
        if (!selectedBatchForEdit || !editName.trim()) return

        setIsUpdating(true)
        try {
            await batchesApi.update(selectedBatchForEdit.id, { name: editName })
            toast({
                title: 'Success',
                description: 'Batch renamed successfully.',
            })
            setSelectedBatchForEdit(null)
            fetchBatches(pagination.page)
        } catch (error: any) {
            console.error('Failed to update batch:', error)
            toast({
                title: 'Error',
                description: error.response?.data?.error || 'Failed to update batch name.',
                variant: 'destructive',
            })
        } finally {
            setIsUpdating(false)
        }
    }

    const fetchBatchStudents = React.useCallback(async (batchId: string) => {
        setIsFetchingStudents(true)
        try {
            const res = await studentsApi.getAll({ batchId, limit: 200 })
            setBatchStudents(res.data.students || [])
        } catch (error) {
            console.error('Failed to fetch batch students:', error)
            toast({
                title: 'Error',
                description: 'Failed to load students for this batch.',
                variant: 'destructive',
            })
        } finally {
            setIsFetchingStudents(false)
        }
    }, [toast])

    const handleViewStudents = (batch: BatchRecord) => {
        setSelectedBatchForList(batch)
        fetchBatchStudents(batch.id)
    }

    const fetchBatches = React.useCallback(async (page = 1) => {
        setIsLoading(true)
        try {
            const params: any = { page, limit: 50 }
            if (searchQuery) params.search = searchQuery
            if (selectedCourse !== 'all') params.courseId = selectedCourse

            const res = await batchesApi.getAll(params)
            setBatches(res.data.batches)
            setPagination(res.data.pagination)
        } catch (error) {
            console.error('Failed to fetch batches:', error)
            toast({
                title: 'Error',
                description: 'Failed to load batches.',
                variant: 'destructive',
            })
        } finally {
            setIsLoading(false)
        }
    }, [searchQuery, selectedCourse, toast])

    const fetchCourses = React.useCallback(async () => {
        try {
            const res = await courseApi.getAll() 
            setCourses(res.data.courses || [])
        } catch (error) {
            console.error('Failed to fetch courses:', error)
        }
    }, [])
    
    const handleCompleteBatch = async (batchId: string) => {
        if (!confirm("Are you sure you want to mark this batch as COMPLETED? This will automatically generate certificates for all students and cannot be undone.")) {
            return;
        }

        try {
            const res = await batchesApi.complete(batchId);
            toast({
                title: "Success",
                description: res.data.message || "Batch completed successfully.",
            });
            fetchBatches(pagination.page);
        } catch (error: any) {
            console.error('Failed to complete batch:', error);
            toast({
                title: "Error",
                description: error.response?.data?.error || "Failed to complete batch.",
                variant: "destructive",
            });
        }
    }

    React.useEffect(() => {
        fetchBatches(1)
        fetchCourses()
    }, [fetchBatches, fetchCourses])

    return (
        <div className="p-8 max-w-[1600px] mx-auto space-y-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                        Batches
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        Manage student groups and batch-wise communication
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Link href="/admin/students">
                        <Button variant="outline" size="sm" className="gap-2">
                            <Users className="h-4 w-4" />
                            Create New Batch
                        </Button>
                    </Link>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fetchBatches(pagination.page)}
                        className="gap-2"
                    >
                        <RefreshCw className="h-4 w-4" />
                        Refresh
                    </Button>
                </div>
            </div>

            <Card className="border shadow-sm">
                <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Filter className="h-4 w-4" />
                            <span className="text-sm font-medium">Filters</span>
                        </div>
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by name or code..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                            <SelectTrigger className="w-full sm:w-[250px]">
                                <SelectValue placeholder="All Courses" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Courses</SelectItem>
                                {courses.map((course) => (
                                    <SelectItem key={course.id} value={course.id}>
                                        {course.title}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            <Card className="border shadow-sm">
                <CardContent className="p-0">
                    {isLoading ? (
                        <div className="py-20 flex flex-col items-center justify-center gap-3">
                            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                            <p className="text-sm text-muted-foreground">Loading batches...</p>
                        </div>
                    ) : batches.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/50">
                                    <TableHead>Batch Detail</TableHead>
                                    <TableHead>Course</TableHead>
                                    <TableHead>Students</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Created At</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {batches.map((batch) => (
                                    <TableRow key={batch.id}>
                                        <TableCell>
                                            <div>
                                                <div className="font-bold flex items-center gap-2">
                                                    {batch.name}
                                                    <Badge variant="outline" className="font-mono text-[10px] bg-blue-50 text-blue-700 border-blue-200">
                                                        #{batch.batchCode}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-sm">{batch.course?.title}</div>
                                        </TableCell>
                                        <TableCell>
                                            <div 
                                                className="flex items-center gap-2 cursor-pointer hover:text-blue-600 transition-colors"
                                                onClick={() => handleViewStudents(batch)}
                                            >
                                                <Users className="h-4 w-4 text-muted-foreground" />
                                                <span className="font-medium text-sm border-b border-dotted border-muted-foreground hover:border-blue-600">
                                                    {batch._count.BatchStudent} Students
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge 
                                                variant={batch.status === 'COMPLETED' ? 'default' : 'secondary'}
                                                className={batch.status === 'COMPLETED' ? 'bg-emerald-500' : ''}
                                            >
                                                {batch.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-sm text-muted-foreground">
                                                {new Date(batch.createdAt).toLocaleDateString()}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {batch.status !== 'COMPLETED' && (
                                                    <Button 
                                                        variant="ghost" 
                                                        size="sm" 
                                                        className="gap-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                                        onClick={() => handleEditClick(batch)}
                                                    >
                                                        <Edit2 className="h-4 w-4" />
                                                        Edit
                                                    </Button>
                                                )}
                                                {batch.status !== 'COMPLETED' && (
                                                    <Button 
                                                        variant="ghost" 
                                                        size="sm" 
                                                        className="gap-2 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                                                        onClick={() => handleCompleteBatch(batch.id)}
                                                    >
                                                        <CheckCircle2 className="h-4 w-4" />
                                                        Complete
                                                    </Button>
                                                )}
                                                <Link href={`/admin/messages?batchId=${batch.id}`}>
                                                    <Button variant="ghost" size="sm" className="gap-2 text-blue-600">
                                                        <MessageSquare className="h-4 w-4" />
                                                        Message
                                                    </Button>
                                                </Link>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <div className="text-center py-20">
                            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                            <p className="text-lg font-medium">No batches found</p>
                            <p className="text-muted-foreground text-sm mt-1">
                                Try adjusting your filters or create a new batch.
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {pagination.totalPages > 1 && (
                <div className="flex items-center justify-end gap-2 mt-4">
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={pagination.page <= 1}
                        onClick={() => fetchBatches(pagination.page - 1)}
                    >
                        <ChevronLeft className="h-4 w-4" />
                        Previous
                    </Button>
                    <div className="text-sm font-medium px-2">
                        Page {pagination.page} of {pagination.totalPages}
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={pagination.page >= pagination.totalPages}
                        onClick={() => fetchBatches(pagination.page + 1)}
                    >
                        Next
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            )}

            {/* Edit Batch Dialog */}
            <Dialog open={!!selectedBatchForEdit} onOpenChange={(open) => !open && setSelectedBatchForEdit(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Batch Name</DialogTitle>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Batch Name</label>
                            <Input 
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                placeholder="Enter new batch name"
                            />
                        </div>
                        <div className="flex justify-end gap-2 pt-2">
                            <Button variant="outline" onClick={() => setSelectedBatchForEdit(null)}>
                                Cancel
                            </Button>
                            <Button 
                                onClick={handleUpdateBatch}
                                disabled={isUpdating || !editName.trim()}
                                className="bg-blue-600 hover:bg-blue-700"
                            >
                                {isUpdating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                Save Changes
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Batch Students Dialog */}
            <Dialog open={!!selectedBatchForList} onOpenChange={(open) => !open && setSelectedBatchForList(null)}>
                <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5 text-blue-600" />
                            Students in {selectedBatchForList?.name}
                            <Badge variant="outline" className="ml-2">
                                {selectedBatchForList?.batchCode}
                            </Badge>
                        </DialogTitle>
                    </DialogHeader>
                    
                    <div className="flex-1 overflow-auto py-4">
                        {isFetchingStudents ? (
                            <div className="py-20 flex flex-col items-center justify-center gap-3">
                                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                                <p className="text-sm text-muted-foreground">Fetching student list...</p>
                            </div>
                        ) : batchStudents.length > 0 ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Student Name</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Phone</TableHead>
                                        <TableHead>Progress</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {batchStudents.map((student) => (
                                        <TableRow key={student.id}>
                                            <TableCell className="font-medium">{student.name}</TableCell>
                                            <TableCell className="text-sm">{student.email}</TableCell>
                                            <TableCell className="text-sm">{student.phone || 'N/A'}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                                                        <div 
                                                            className="h-full bg-blue-500" 
                                                            style={{ width: `${student.progress || 0}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-xs font-medium">
                                                        {student.progress || 0}%
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={student.enrollmentStatus === 'COMPLETED' ? 'default' : 'secondary'} className={student.enrollmentStatus === 'COMPLETED' ? 'bg-emerald-500' : ''}>
                                                    {student.enrollmentStatus || 'ACTIVE'}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <div className="text-center py-10 text-muted-foreground">
                                No students found in this batch.
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
