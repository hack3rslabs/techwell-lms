"use client"

import { useState, useEffect } from 'react'
import api from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Calendar, Clock, Video, Plus, Trash2, ExternalLink, Loader2 } from 'lucide-react'


export default function LiveClassesAdminPage() {
    interface Course {
        id: string
        title: string
    }
    interface LiveClass {
        id: string
        title: string
        platform: string
        meetingLink?: string
        scheduledAt: string
        duration: number
        course?: Course
    }
    const [classes, setClasses] = useState<LiveClass[]>([])
    const [courses, setCourses] = useState<Course[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isPostLoading, setIsPostLoading] = useState(false)
    const [showModal, setShowModal] = useState(false)

    // Form Data
    const [formData, setFormData] = useState({
        courseId: '',
        title: '',
        platform: 'ZOOM',
        meetingLink: '',
        scheduledAt: '',
        duration: 60
    })

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            const [classesRes, coursesRes] = await Promise.all([
                api.get('/live-classes'),
                api.get('/courses') // Assuming GET /api/courses returns list
            ])
            setClasses(classesRes.data)
            // Handle pagination wrapper if necessary
            setCourses(coursesRes.data.courses || coursesRes.data)
        } catch (error) {
            console.error('Failed to load data', error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!formData.courseId || !formData.scheduledAt) {
            alert('Please select a course and schedule time')
            return
        }
        const scheduledAt = new Date(formData.scheduledAt)
        if (Number.isNaN(scheduledAt.getTime())) {
            alert('Please enter a valid schedule time')
            return
        }
        const scheduledAtIso = scheduledAt.toISOString()
        setIsPostLoading(true)
        try {
            await api.post('/live-classes', {
                ...formData,
                scheduledAt: scheduledAtIso
            })
            // toast.success('Class scheduled successfully')
            setShowModal(false)
            setFormData({
                courseId: '', title: '', platform: 'ZOOM', meetingLink: '', scheduledAt: '', duration: 60
            })
            fetchData() // Refresh list
        } catch (error) {
            console.error(error)
            alert('Failed to schedule class')
        } finally {
            setIsPostLoading(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to cancel this class?')) return
        try {
            await api.delete(`/live-classes/${id}`)
            setClasses(prev => prev.filter(c => c.id !== id))
        } catch (error) {
            console.error(error)
        }
    }

    if (isLoading) return (
        <div className="min-h-[400px] flex flex-col items-center justify-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm font-medium animate-pulse">Syncing Session Registry...</p>
        </div>
    )

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight">Live <span className="text-primary">Engagement</span></h1>
                    <p className="text-muted-foreground mt-1">Orchestrate real-time learning sessions and global workshops.</p>
                </div>
                <Dialog open={showModal} onOpenChange={setShowModal}>
                    <DialogTrigger asChild>
                        <Button className="rounded-xl h-11 px-6 shadow-lg shadow-primary/20 hover:scale-105 transition-all">
                            <Plus className="mr-2 h-4 w-4" /> Schedule Session
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="glass border-white/20 sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-bold">New Session</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-5 mt-4">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-bold uppercase tracking-widest opacity-70">Target Course</Label>
                                <Select
                                    value={formData.courseId}
                                    onValueChange={(val) => setFormData({ ...formData, courseId: val })}
                                >
                                    <SelectTrigger className="glass-input h-11 rounded-xl">
                                        <SelectValue placeholder="Select Course" />
                                    </SelectTrigger>
                                    <SelectContent className="glass">
                                        {courses.map((c: { id: string, title: string }) => (
                                            <SelectItem key={c.id} value={c.id} className="focus:bg-primary/10">{c.title}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-[10px] font-bold uppercase tracking-widest opacity-70">Workshop Title</Label>
                                <Input
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="e.g. Masterclass: Advanced Algorithms"
                                    className="glass-input h-11 rounded-xl"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-bold uppercase tracking-widest opacity-70">Broadcast Time</Label>
                                    <Input
                                        type="datetime-local"
                                        value={formData.scheduledAt}
                                        onChange={e => setFormData({ ...formData, scheduledAt: e.target.value })}
                                        className="glass-input h-11 rounded-xl"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-bold uppercase tracking-widest opacity-70">Duration</Label>
                                    <Input
                                        type="number"
                                        value={formData.duration}
                                        onChange={e => setFormData({ ...formData, duration: Number(e.target.value) })}
                                        min="15"
                                        className="glass-input h-11 rounded-xl"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-[10px] font-bold uppercase tracking-widest opacity-70">Broadcast Platform</Label>
                                <Select
                                    value={formData.platform}
                                    onValueChange={(val) => setFormData({ ...formData, platform: val })}
                                >
                                    <SelectTrigger className="glass-input h-11 rounded-xl">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="glass">
                                        <SelectItem value="ZOOM">Zoom Cloud Meetings</SelectItem>
                                        <SelectItem value="GOOGLE_MEET">Google Meet</SelectItem>
                                        <SelectItem value="MS_TEAMS">Microsoft Teams</SelectItem>
                                        <SelectItem value="CUSTOM">External Provider</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-[10px] font-bold uppercase tracking-widest opacity-70">Direct Access URI</Label>
                                <Input
                                    value={formData.meetingLink}
                                    onChange={e => setFormData({ ...formData, meetingLink: e.target.value })}
                                    placeholder="https://..."
                                    className="glass-input h-11 rounded-xl"
                                />
                            </div>

                            <DialogFooter className="mt-6">
                                <Button type="submit" className="w-full h-12 rounded-xl" disabled={isPostLoading}>
                                    {isPostLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                                    Finalize Schedule
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid grid-cols-1 gap-6">
                <div className="rounded-2xl border border-white/10 glass-card overflow-hidden">
                    <div className="p-6 border-b border-white/10 flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-bold">Broadcast Schedule</h3>
                            <p className="text-xs text-muted-foreground">Orchestrating live learning across nodes.</p>
                        </div>
                        <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
                            {classes.length} Total Sessions
                        </Badge>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-white/5 text-left border-b border-white/10">
                                    <th className="p-4 font-bold text-muted-foreground uppercase tracking-wider text-[10px]">Transmission Date</th>
                                    <th className="p-4 font-bold text-muted-foreground uppercase tracking-wider text-[10px]">Session Details</th>
                                    <th className="p-4 font-bold text-muted-foreground uppercase tracking-wider text-[10px]">Associated Curriculum</th>
                                    <th className="p-4 font-bold text-muted-foreground uppercase tracking-wider text-[10px]">Connectivity</th>
                                    <th className="p-4 font-bold text-muted-foreground uppercase tracking-wider text-[10px] text-right">Operations</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {classes.length > 0 ? classes.map((cls) => (
                                    <tr key={cls.id} className="hover:bg-white/5 transition-colors group">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-xl bg-muted/50 flex flex-col items-center justify-center border border-white/10">
                                                    <span className="text-[10px] font-black uppercase opacity-60">
                                                        {new Date(cls.scheduledAt).toLocaleString('en-US', { month: 'short' })}
                                                    </span>
                                                    <span className="text-lg font-black leading-tight">
                                                        {new Date(cls.scheduledAt).getDate()}
                                                    </span>
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-bold flex items-center gap-1.5">
                                                        <Clock className="h-3 w-3 text-primary" />
                                                        {new Date(cls.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                    <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-tighter">
                                                        {cls.duration} Minute Runtime
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-foreground line-clamp-1">{cls.title}</span>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <Badge variant="secondary" className="bg-blue-500/10 text-blue-600 border-transparent text-[8px] font-black py-0 px-1.5 h-4">
                                                        {cls.platform}
                                                    </Badge>
                                                    {new Date(cls.scheduledAt) < new Date() && new Date(new Date(cls.scheduledAt).getTime() + cls.duration * 60000) > new Date() && (
                                                        <div className="flex items-center gap-1">
                                                            <div className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
                                                            <span className="text-[8px] font-black text-red-500 uppercase">Live Now</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className="text-muted-foreground font-medium line-clamp-1 italic text-xs">
                                                {cls.course?.title || 'Unlinked Module'}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                <div className="p-2 rounded-lg bg-white/5 border border-white/10">
                                                    <Video className="h-4 w-4 text-primary" />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-bold text-muted-foreground">PLATFORM</span>
                                                    <span className="text-xs font-black uppercase tracking-tighter">{cls.platform === 'CUSTOM' ? 'External' : cls.platform}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                {cls.meetingLink && (
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-white/10 text-primary" asChild>
                                                        <a href={cls.meetingLink} target="_blank" rel="noopener noreferrer" title="Join Link">
                                                            <ExternalLink className="h-4 w-4" />
                                                        </a>
                                                    </Button>
                                                )}
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:bg-red-50" onClick={() => handleDelete(cls.id)} title="Cancel Class">
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={5} className="p-20 text-center text-muted-foreground">
                                            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-10" />
                                            <p className="font-medium">Curriculum queue empty. Schedule a new live engagement.</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    )
}

