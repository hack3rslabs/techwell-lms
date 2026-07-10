"use client"

import * as React from 'react'
import {
    Users,
    Plus,
    Search,
    Calendar,
    MoreVertical,
    Loader2,
    BookOpen,
    Edit,
    Trash2
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from '@/components/ui/dialog'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import api from '@/lib/api'

interface Course {
    id: string
    title: string
}

interface Batch {
    id: string
    name: string
    description: string | null
    startDate: string | null
    endDate: string | null
    maxStudents: number | null
    course: { title: string; thumbnail: string | null }
    _count: { enrollments: number }
}

export default function BatchesPage() {
    const [batches, setBatches] = React.useState<Batch[]>([])
    const [courses, setCourses] = React.useState<Course[]>([])
    const [loading, setLoading] = React.useState(true)
    const [searchQuery, setSearchQuery] = React.useState('')
    const [isCreateOpen, setIsCreateOpen] = React.useState(false)
    const [creating, setCreating] = React.useState(false)

    const [formData, setFormData] = React.useState({
        name: '',
        courseId: '',
        description: '',
        startDate: '',
        endDate: '',
        maxStudents: ''
    })

    async function fetchData() {
        try {
            const [batchesRes, coursesRes] = await Promise.all([
                api.get('/trainer/batches'),
                api.get('/courses/my-courses')
            ])
            setBatches(batchesRes.data || [])
            setCourses(coursesRes.data || [])
        } catch (error) {
            console.error('Failed to fetch data:', error)
        } finally {
            setLoading(false)
        }
    }


    React.useEffect(() => {
        fetchData()
    }, [])


    const handleCreate = async () => {
        if (!formData.name || !formData.courseId) return

        setCreating(true)
        try {
            await api.post('/trainer/batches', {
                name: formData.name,
                courseId: formData.courseId,
                description: formData.description || null,
                startDate: formData.startDate || null,
                endDate: formData.endDate || null,
                maxStudents: formData.maxStudents ? parseInt(formData.maxStudents) : null
            })
            setFormData({ name: '', courseId: '', description: '', startDate: '', endDate: '', maxStudents: '' })
            setIsCreateOpen(false)
            fetchData()
        } catch (error) {
            console.error('Failed to create batch:', error)
            alert('Failed to create batch')
        } finally {
            setCreating(false)
        }
    }

    const filteredBatches = batches.filter(b =>
        b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.course.title.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-800">Batch Management</h1>
                    <p className="text-sm text-slate-500 mt-1">Create and manage student batches for your courses</p>
                </div>
                <Button onClick={() => setIsCreateOpen(true)} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Create Batch
                </Button>
            </div>

            {/* Search */}
            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                    placeholder="Search batches..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                />
            </div>

            {/* Batches Grid */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : filteredBatches.length === 0 ? (
                <Card className="border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-16">
                        <Users className="h-16 w-16 text-slate-300 mb-4" />
                        <h3 className="text-lg font-bold text-slate-600">No batches yet</h3>
                        <p className="text-sm text-slate-500 mt-1 mb-4">Create your first batch to start organizing students</p>
                        <Button onClick={() => setIsCreateOpen(true)}>
                            <Plus className="h-4 w-4 mr-2" />
                            Create Batch
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredBatches.map((batch) => (
                        <Card key={batch.id} className="group hover:shadow-lg transition-all duration-300 border-none shadow-sm">
                            <CardHeader className="pb-2">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <Users className="h-6 w-6 text-primary" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-lg">{batch.name}</CardTitle>
                                            <CardDescription className="text-xs flex items-center gap-1 mt-1">
                                                <BookOpen className="h-3 w-3" />
                                                {batch.course.title}
                                            </CardDescription>
                                        </div>
                                    </div>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem>
                                                <Edit className="h-4 w-4 mr-2" />
                                                Edit Batch
                                            </DropdownMenuItem>
                                            <DropdownMenuItem className="text-red-600">
                                                <Trash2 className="h-4 w-4 mr-2" />
                                                Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {batch.description && (
                                    <p className="text-sm text-slate-600 line-clamp-2">{batch.description}</p>
                                )}

                                <div className="flex items-center gap-4">
                                    <Badge variant="secondary" className="font-bold">
                                        <Users className="h-3 w-3 mr-1" />
                                        {batch._count.enrollments} Students
                                    </Badge>
                                    {batch.maxStudents && (
                                        <span className="text-xs text-slate-500">
                                            Max: {batch.maxStudents}
                                        </span>
                                    )}
                                </div>

                                {(batch.startDate || batch.endDate) && (
                                    <div className="flex items-center gap-2 text-xs text-slate-500">
                                        <Calendar className="h-3.5 w-3.5" />
                                        {batch.startDate && new Date(batch.startDate).toLocaleDateString()}
                                        {batch.startDate && batch.endDate && ' - '}
                                        {batch.endDate && new Date(batch.endDate).toLocaleDateString()}
                                    </div>
                                )}

                                <Button variant="outline" className="w-full mt-2">
                                    View Students
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Create Batch Dialog */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Create New Batch</DialogTitle>
                        <DialogDescription>
                            Group students together for a specific course
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Batch Name *</label>
                            <Input
                                placeholder="e.g., January 2026 Cohort"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Course *</label>
                            <select
                                aria-label="Select Course"
                                className="w-full p-2 border rounded-md bg-background"
                                value={formData.courseId}
                                onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                            >
                                <option value="">Select a course</option>
                                {courses.map((course) => (
                                    <option key={course.id} value={course.id}>
                                        {course.title}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Description</label>
                            <Input
                                placeholder="Optional description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Start Date</label>
                                <Input
                                    type="date"
                                    value={formData.startDate}
                                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">End Date</label>
                                <Input
                                    type="date"
                                    value={formData.endDate}
                                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Max Students</label>
                            <Input
                                type="number"
                                placeholder="Leave empty for unlimited"
                                value={formData.maxStudents}
                                onChange={(e) => setFormData({ ...formData, maxStudents: e.target.value })}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleCreate} disabled={creating || !formData.name || !formData.courseId}>
                            {creating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                            Create Batch
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
