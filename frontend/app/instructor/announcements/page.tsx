"use client"

import * as React from 'react'
import {
    Bell,
    Plus,
    Search,
    Loader2,
    Megaphone,
    Users,
    BookOpen,
    MoreVertical,
    Edit,
    Trash2,
    Send
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
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
    course: { title: string }
}

interface Announcement {
    id: string
    title: string
    content: string
    priority: string
    courseId: string | null
    batchId: string | null
    course?: { title: string } | null
    batch?: { name: string } | null
    createdAt: string
}

export default function AnnouncementsPage() {
    const [announcements, setAnnouncements] = React.useState<Announcement[]>([])
    const [courses, setCourses] = React.useState<Course[]>([])
    const [batches, setBatches] = React.useState<Batch[]>([])
    const [loading, setLoading] = React.useState(true)
    const [searchQuery, setSearchQuery] = React.useState('')
    const [isCreateOpen, setIsCreateOpen] = React.useState(false)
    const [creating, setCreating] = React.useState(false)

    const [formData, setFormData] = React.useState({
        title: '',
        content: '',
        priority: 'NORMAL',
        targetType: 'course', // 'course' or 'batch'
        courseId: '',
        batchId: ''
    })

    async function fetchData() {
        try {
            const [announcementsRes, coursesRes, batchesRes] = await Promise.all([
                api.get('/trainer/announcements'),
                api.get('/courses/my-courses'),
                api.get('/trainer/batches')
            ])
            setAnnouncements(announcementsRes.data || [])
            setCourses(coursesRes.data || [])
            setBatches(batchesRes.data || [])
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
        if (!formData.title || !formData.content) return

        setCreating(true)
        try {
            await api.post('/trainer/announcements', {
                title: formData.title,
                content: formData.content,
                priority: formData.priority,
                courseId: formData.targetType === 'course' ? formData.courseId : null,
                batchId: formData.targetType === 'batch' ? formData.batchId : null
            })
            setFormData({ title: '', content: '', priority: 'NORMAL', targetType: 'course', courseId: '', batchId: '' })
            setIsCreateOpen(false)
            fetchData()
        } catch (error) {
            console.error('Failed to create announcement:', error)
            alert('Failed to create announcement')
        } finally {
            setCreating(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this announcement?')) return

        try {
            await api.delete(`/trainer/announcements/${id}`)
            fetchData()
        } catch (error) {
            console.error('Failed to delete announcement:', error)
            alert('Failed to delete announcement')
        }
    }

    const filteredAnnouncements = announcements.filter(a =>
        a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.content.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-800">Announcements</h1>
                    <p className="text-sm text-slate-500 mt-1">Communicate with your students and batches</p>
                </div>
                <Button onClick={() => setIsCreateOpen(true)} className="gap-2">
                    <Plus className="h-4 w-4" />
                    New Announcement
                </Button>
            </div>

            {/* Search */}
            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                    placeholder="Search announcements..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                />
            </div>

            {/* Announcements List */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : filteredAnnouncements.length === 0 ? (
                <Card className="border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-16">
                        <Megaphone className="h-16 w-16 text-slate-300 mb-4" />
                        <h3 className="text-lg font-bold text-slate-600">No announcements yet</h3>
                        <p className="text-sm text-slate-500 mt-1 mb-4">Create your first announcement to communicate with students</p>
                        <Button onClick={() => setIsCreateOpen(true)}>
                            <Plus className="h-4 w-4 mr-2" />
                            New Announcement
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {filteredAnnouncements.map((announcement) => (
                        <Card key={announcement.id} className="border-none shadow-sm hover:shadow-md transition-all">
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex items-start gap-4">
                                        <div className={`p-3 rounded-xl ${announcement.priority === 'URGENT' ? 'bg-red-100' : 'bg-primary/10'}`}>
                                            <Megaphone className={`h-5 w-5 ${announcement.priority === 'URGENT' ? 'text-red-600' : 'text-primary'}`} />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="font-bold text-slate-800">{announcement.title}</h3>
                                                {announcement.priority === 'URGENT' && (
                                                    <Badge variant="destructive" className="text-xs">Urgent</Badge>
                                                )}
                                            </div>
                                            <p className="text-sm text-slate-600 mb-3 whitespace-pre-wrap">{announcement.content}</p>
                                            <div className="flex items-center gap-4 text-xs text-slate-500">
                                                {announcement.course && (
                                                    <span className="flex items-center gap-1">
                                                        <BookOpen className="h-3 w-3" />
                                                        {announcement.course.title}
                                                    </span>
                                                )}
                                                {announcement.batch && (
                                                    <span className="flex items-center gap-1">
                                                        <Users className="h-3 w-3" />
                                                        {announcement.batch.name}
                                                    </span>
                                                )}
                                                <span>{new Date(announcement.createdAt).toLocaleDateString()}</span>
                                            </div>
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
                                                Edit
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                className="text-red-600"
                                                onClick={() => handleDelete(announcement.id)}
                                            >
                                                <Trash2 className="h-4 w-4 mr-2" />
                                                Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Create Dialog */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>New Announcement</DialogTitle>
                        <DialogDescription>
                            Send an announcement to your students
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Title *</label>
                            <Input
                                placeholder="Announcement title..."
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Message *</label>
                            <Textarea
                                placeholder="Write your announcement..."
                                value={formData.content}
                                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                rows={4}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Priority</label>
                            <select
                                aria-label="Priority"
                                className="w-full p-2 border rounded-md bg-background"
                                value={formData.priority}
                                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                            >
                                <option value="NORMAL">Normal</option>
                                <option value="URGENT">Urgent</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Send To</label>
                            <div className="flex gap-2">
                                <Button
                                    type="button"
                                    variant={formData.targetType === 'course' ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setFormData({ ...formData, targetType: 'course', batchId: '' })}
                                >
                                    <BookOpen className="h-4 w-4 mr-1" />
                                    Course
                                </Button>
                                <Button
                                    type="button"
                                    variant={formData.targetType === 'batch' ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setFormData({ ...formData, targetType: 'batch', courseId: '' })}
                                >
                                    <Users className="h-4 w-4 mr-1" />
                                    Batch
                                </Button>
                            </div>
                        </div>

                        {formData.targetType === 'course' && (
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Select Course</label>
                                <select
                                    aria-label="Select Course"
                                    className="w-full p-2 border rounded-md bg-background"
                                    value={formData.courseId}
                                    onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                                >
                                    <option value="">All courses</option>
                                    {courses.map((course) => (
                                        <option key={course.id} value={course.id}>{course.title}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {formData.targetType === 'batch' && (
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Select Batch</label>
                                <select
                                    aria-label="Select Batch"
                                    className="w-full p-2 border rounded-md bg-background"
                                    value={formData.batchId}
                                    onChange={(e) => setFormData({ ...formData, batchId: e.target.value })}
                                >
                                    <option value="">Select a batch</option>
                                    {batches.map((batch) => (
                                        <option key={batch.id} value={batch.id}>{batch.name} ({batch.course.title})</option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleCreate} disabled={creating || !formData.title || !formData.content}>
                            {creating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                            <Send className="h-4 w-4 mr-2" />
                            Send Announcement
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
