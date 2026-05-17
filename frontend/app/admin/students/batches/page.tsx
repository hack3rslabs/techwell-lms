"use client"

import * as React from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogTrigger,
} from '@/components/ui/dialog'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { batchesApi, courseApi } from '@/lib/api'
import api from '@/lib/api'
import { Users, Loader2, Search, Plus, Edit, Trash2, Calendar } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface Batch {
    id: string
    name: string
    batchCode: string
    courseId: string
    instructorId: string
    maxStudents: number | null
    createdAt: string
    updatedAt: string
    course: { id: string; title: string }
    instructor: { id: string; name: string; email: string }
    _count: { students: number }
}

export default function BatchesPage() {
    const [batches, setBatches] = React.useState<Batch[]>([])
    const [isLoading, setIsLoading] = React.useState(true)
    const [searchQuery, setSearchQuery] = React.useState('')
    
    const [isCreateOpen, setIsCreateOpen] = React.useState(false)
    const [formLoading, setFormLoading] = React.useState(false)
    
    // Form data
    const [name, setName] = React.useState('')
    const [batchCode, setBatchCode] = React.useState('')
    const [courseId, setCourseId] = React.useState('')
    const [instructorId, setInstructorId] = React.useState('')
    const [maxStudents, setMaxStudents] = React.useState('')
    const [selectedStudents, setSelectedStudents] = React.useState<string[]>([])
    
    // Select options
    const [courses, setCourses] = React.useState<any[]>([])
    const [instructors, setInstructors] = React.useState<any[]>([])
    const [students, setStudents] = React.useState<any[]>([])
    const [studentSearch, setStudentSearch] = React.useState('')

    const fetchBatches = React.useCallback(async () => {
        setIsLoading(true)
        try {
            const res = await batchesApi.getAll({ search: searchQuery })
            setBatches(res.data.batches)
        } catch (error) {
            console.error('Failed to fetch batches:', error)
        } finally {
            setIsLoading(false)
        }
    }, [searchQuery])

    const fetchOptions = async () => {
        try {
            const coursesRes = await courseApi.getAll()
            setCourses(coursesRes.data.courses || [])
            
            const usersRes = await api.get('/users?limit=1000')
            const allUsers = usersRes.data.users || []
            setInstructors(allUsers.filter((u: any) => u.role === 'INSTRUCTOR' || u.role === 'ADMIN'))
            setStudents(allUsers.filter((u: any) => u.role === 'STUDENT'))
        } catch (error) {
            console.error('Failed to fetch options', error)
        }
    }

    React.useEffect(() => {
        fetchBatches()
    }, [fetchBatches])

    React.useEffect(() => {
        if (isCreateOpen) {
            fetchOptions()
        }
    }, [isCreateOpen])

    const handleCreateSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setFormLoading(true)
        try {
            await batchesApi.create({
                name,
                batchCode,
                courseId,
                instructorId,
                maxStudents: maxStudents ? parseInt(maxStudents) : null,
                studentIds: selectedStudents
            })
            setIsCreateOpen(false)
            // Reset form
            setName('')
            setBatchCode('')
            setCourseId('')
            setInstructorId('')
            setMaxStudents('')
            setSelectedStudents([])
            fetchBatches()
        } catch (error) {
            console.error('Error creating batch', error)
            alert('Failed to create batch')
        } finally {
            setFormLoading(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this batch?')) return
        try {
            await batchesApi.delete(id)
            fetchBatches()
        } catch (error) {
            console.error('Error deleting batch', error)
            alert('Failed to delete batch')
        }
    }

    const toggleStudent = (id: string) => {
        setSelectedStudents(prev => 
            prev.includes(id) ? prev.filter(sId => sId !== id) : [...prev, id]
        )
    }

    return (
        <div className="p-8 max-w-[1600px] mx-auto space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600">
                        Batches
                    </h1>
                    <p className="text-muted-foreground mt-2 text-lg">
                        Manage course batches and student mapping
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                        <DialogTrigger asChild>
                            <Button className="gap-2">
                                <Plus className="h-4 w-4" />
                                Create Batch
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>Create New Batch</DialogTitle>
                                <DialogDescription>
                                    Fill in the details below to create a new batch and assign students.
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleCreateSubmit} className="space-y-6 mt-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Batch Name <span className="text-red-500">*</span></Label>
                                        <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g., Spring 2026 Morning" required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Batch Code <span className="text-red-500">*</span></Label>
                                        <Input value={batchCode} onChange={e => setBatchCode(e.target.value)} placeholder="e.g., SPR26-M" required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Course <span className="text-red-500">*</span></Label>
                                        <Select value={courseId} onValueChange={setCourseId} required>
                                            <SelectTrigger><SelectValue placeholder="Select course" /></SelectTrigger>
                                            <SelectContent>
                                                {courses.map(c => <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Instructor <span className="text-red-500">*</span></Label>
                                        <Select value={instructorId} onValueChange={setInstructorId} required>
                                            <SelectTrigger><SelectValue placeholder="Select instructor" /></SelectTrigger>
                                            <SelectContent>
                                                {instructors.map(i => <SelectItem key={i.id} value={i.id}>{i.name}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Max Students (Optional)</Label>
                                        <Input type="number" value={maxStudents} onChange={e => setMaxStudents(e.target.value)} placeholder="e.g., 50" />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <Label>Assign Students</Label>
                                    <Input 
                                        placeholder="Search students..." 
                                        value={studentSearch} 
                                        onChange={e => setStudentSearch(e.target.value)} 
                                    />
                                    <div className="border rounded-md p-4 h-64 overflow-y-auto space-y-2 bg-slate-50 dark:bg-slate-900">
                                        {students
                                            .filter(s => s.name.toLowerCase().includes(studentSearch.toLowerCase()) || s.email.toLowerCase().includes(studentSearch.toLowerCase()))
                                            .map(s => (
                                                <div key={s.id} className="flex items-center space-x-3 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded">
                                                    <input 
                                                        type="checkbox" 
                                                        id={`student-${s.id}`}
                                                        className="h-4 w-4 rounded border-gray-300 text-violet-600 focus:ring-violet-500"
                                                        checked={selectedStudents.includes(s.id)}
                                                        onChange={() => toggleStudent(s.id)}
                                                    />
                                                    <label htmlFor={`student-${s.id}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1">
                                                        {s.name} <span className="text-muted-foreground font-normal ml-2">({s.email})</span>
                                                    </label>
                                                </div>
                                            ))}
                                        {students.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No students available.</p>}
                                    </div>
                                    <p className="text-sm text-muted-foreground">Selected: {selectedStudents.length} students</p>
                                </div>

                                <DialogFooter>
                                    <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                                    <Button type="submit" disabled={formLoading}>
                                        {formLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Create Batch
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Filters */}
            <Card className="border shadow-sm">
                <CardContent className="p-4">
                    <div className="relative max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by name or code..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Table */}
            <Card className="border shadow-sm">
                <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <Users className="h-5 w-5 text-violet-600" />
                        All Batches
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="py-16 flex flex-col items-center justify-center gap-3">
                            <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
                            <p className="text-sm text-muted-foreground">Loading batches...</p>
                        </div>
                    ) : batches.length > 0 ? (
                        <div className="rounded-lg border overflow-hidden">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted/50 hover:bg-muted/50">
                                        <TableHead className="font-semibold">Batch Details</TableHead>
                                        <TableHead className="font-semibold">Course</TableHead>
                                        <TableHead className="font-semibold">Instructor</TableHead>
                                        <TableHead className="font-semibold">Students</TableHead>
                                        <TableHead className="font-semibold">Created On</TableHead>
                                        <TableHead className="font-semibold text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {batches.map((batch) => (
                                        <TableRow key={batch.id} className="group hover:bg-muted/30 transition-colors">
                                            <TableCell>
                                                <div className="font-medium text-foreground">{batch.name}</div>
                                                <div className="text-xs text-muted-foreground mt-0.5">{batch.batchCode}</div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="font-medium text-sm">{batch.course?.title}</div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm">{batch.instructor?.name}</div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="font-normal">
                                                    {batch._count.students} {batch.maxStudents ? `/ ${batch.maxStudents}` : ''} Enrolled
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1.5 text-sm">
                                                    <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                                                    {new Date(batch.createdAt).toLocaleDateString()}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="icon" onClick={() => handleDelete(batch.id)} className="text-red-500 hover:text-red-700 hover:bg-red-50">
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    ) : (
                        <div className="text-center py-16 border rounded-lg bg-muted/10">
                            <div className="h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-violet-100 dark:bg-violet-900/30 text-violet-400">
                                <Users className="h-8 w-8" />
                            </div>
                            <p className="text-lg font-medium">No batches found</p>
                            <p className="text-muted-foreground text-sm mt-1 max-w-sm mx-auto">
                                Create a batch to start organizing students.
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
