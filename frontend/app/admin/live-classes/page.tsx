"use client"

import { useState, useEffect } from 'react'
import api from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Calendar, Clock, Video, Plus, Trash2, ExternalLink, Loader2, ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react'


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
        batch?: { id: string, name: string }
    }
    const [classes, setClasses] = useState<LiveClass[]>([])
    const [courses, setCourses] = useState<Course[]>([])
    const [batches, setBatches] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isPostLoading, setIsPostLoading] = useState(false)
    const [showModal, setShowModal] = useState(false)
    const [wizardStep, setWizardStep] = useState(1)

    // Form Data
    const [formData, setFormData] = useState({
        courseId: '',
        batchId: '',
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
            const [classesRes, coursesRes, batchesRes] = await Promise.all([
                api.get('/live-classes'),
                api.get('/courses'),
                api.get('/batches')
            ])
            setClasses(classesRes.data)
            setCourses(coursesRes.data.courses || coursesRes.data)
            setBatches(batchesRes.data)
        } catch (error) {
            console.error('Failed to load data', error)
        } finally {
            setIsLoading(false)
        }
    }

    const resetWizard = () => {
        setWizardStep(1)
        setFormData({
            courseId: '', batchId: '', title: '', platform: 'ZOOM', meetingLink: '', scheduledAt: '', duration: 60
        })
    }

    const handleModalChange = (open: boolean) => {
        setShowModal(open)
        if (!open) {
            setTimeout(resetWizard, 300)
        }
    }

    const handleNextStep = () => {
        if (wizardStep === 1 && (!formData.courseId || !formData.batchId)) {
            alert("Please select a Course and Batch.")
            return
        }
        if (wizardStep === 2 && (!formData.title || !formData.scheduledAt || !formData.duration)) {
            alert("Please fill out the session details.")
            return
        }
        setWizardStep(s => s + 1)
    }

    const handleSubmit = async () => {
        if (!formData.meetingLink) {
            alert('Please provide a meeting link or platform details.')
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
            setShowModal(false)
            resetWizard()
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
                <Dialog open={showModal} onOpenChange={handleModalChange}>
                    <DialogTrigger asChild>
                        <Button className="rounded-xl h-12 px-8 font-bold shadow-xl shadow-primary/30 hover:shadow-primary/50 hover:scale-105 transition-all bg-gradient-to-r from-primary to-indigo-600 text-white border-0">
                            <Plus className="mr-2 h-5 w-5" /> Schedule New Session
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[550px] p-0 overflow-hidden rounded-2xl border-0 shadow-2xl">
                        
                        {/* Wizard Header */}
                        <div className="bg-slate-50 dark:bg-slate-900 border-b p-6">
                            <DialogHeader>
                                <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                                    <Video className="h-6 w-6 text-primary" /> 
                                    Schedule Masterclass
                                </DialogTitle>
                            </DialogHeader>
                            
                            {/* Stepper Dots */}
                            <div className="flex items-center justify-center gap-3 mt-6">
                                {[1, 2, 3].map(step => (
                                    <div key={step} className="flex items-center">
                                        <div className={`flex items-center justify-center h-8 w-8 rounded-full text-sm font-bold transition-colors ${
                                            wizardStep === step ? 'bg-primary text-white ring-4 ring-primary/20' :
                                            wizardStep > step ? 'bg-green-500 text-white' : 'bg-slate-200 text-slate-500'
                                        }`}>
                                            {wizardStep > step ? <CheckCircle2 className="h-5 w-5" /> : step}
                                        </div>
                                        {step !== 3 && (
                                            <div className={`w-16 h-1 mx-1 rounded-full transition-colors ${wizardStep > step ? 'bg-green-500' : 'bg-slate-200'}`} />
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Wizard Body */}
                        <div className="p-6">
                            
                            {/* STEP 1: Target Audience */}
                            {wizardStep === 1 && (
                                <div className="space-y-6 animate-in slide-in-from-right-4">
                                    <div>
                                        <h3 className="text-lg font-semibold mb-1">Target Audience</h3>
                                        <p className="text-sm text-muted-foreground mb-4">Select which course and batch this session is for.</p>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label className="font-bold text-slate-700 dark:text-slate-300">Select Course</Label>
                                            <Select
                                                value={formData.courseId}
                                                onValueChange={(val) => setFormData({ ...formData, courseId: val, batchId: '' })}
                                            >
                                                <SelectTrigger className="h-12 rounded-xl border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950">
                                                    <SelectValue placeholder="-- Choose a Course --" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {courses.map((c: { id: string, title: string }) => (
                                                        <SelectItem key={c.id} value={c.id} className="py-3">{c.title}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="font-bold text-slate-700 dark:text-slate-300">Select Batch</Label>
                                            <Select
                                                value={formData.batchId}
                                                onValueChange={(val) => setFormData({ ...formData, batchId: val })}
                                                disabled={!formData.courseId}
                                            >
                                                <SelectTrigger className="h-12 rounded-xl border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950">
                                                    <SelectValue placeholder={formData.courseId ? "-- Choose a Batch --" : "Select Course First"} />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {batches.filter(b => b.courseId === formData.courseId).map((b: { id: string, name: string, batchCode?: string }) => (
                                                        <SelectItem key={b.id} value={b.id} className="py-3">{b.batchCode ? `${b.batchCode} - ` : ''}{b.name}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* STEP 2: Session Details */}
                            {wizardStep === 2 && (
                                <div className="space-y-6 animate-in slide-in-from-right-4">
                                    <div>
                                        <h3 className="text-lg font-semibold mb-1">Session Details</h3>
                                        <p className="text-sm text-muted-foreground mb-4">Set the topic, date, and duration.</p>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label className="font-bold text-slate-700 dark:text-slate-300">Workshop Title</Label>
                                            <Input
                                                value={formData.title}
                                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                                                placeholder="e.g. Masterclass: Advanced Algorithms & Data Structures"
                                                className="h-12 rounded-xl border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label className="font-bold text-slate-700 dark:text-slate-300">Broadcast Time</Label>
                                                <Input
                                                    type="datetime-local"
                                                    value={formData.scheduledAt}
                                                    onChange={e => setFormData({ ...formData, scheduledAt: e.target.value })}
                                                    className="h-12 rounded-xl border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="font-bold text-slate-700 dark:text-slate-300">Duration (Mins)</Label>
                                                <Input
                                                    type="number"
                                                    value={formData.duration}
                                                    onChange={e => setFormData({ ...formData, duration: Number(e.target.value) })}
                                                    min="15"
                                                    className="h-12 rounded-xl border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* STEP 3: Platform & Link */}
                            {wizardStep === 3 && (
                                <div className="space-y-6 animate-in slide-in-from-right-4">
                                    <div>
                                        <h3 className="text-lg font-semibold mb-1">Platform Connection</h3>
                                        <p className="text-sm text-muted-foreground mb-4">Where will this session be hosted?</p>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label className="font-bold text-slate-700 dark:text-slate-300">Streaming Platform</Label>
                                            <Select
                                                value={formData.platform}
                                                onValueChange={(val) => setFormData({ ...formData, platform: val })}
                                            >
                                                <SelectTrigger className="h-12 rounded-xl border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950">
                                                    <SelectValue placeholder="Select Platform" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="ZOOM" className="py-3">Zoom Meeting</SelectItem>
                                                    <SelectItem value="GOOGLE_MEET" className="py-3">Google Meet</SelectItem>
                                                    <SelectItem value="TEAMS" className="py-3">Microsoft Teams</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="font-bold text-slate-700 dark:text-slate-300">Meeting Join Link</Label>
                                            <Input
                                                value={formData.meetingLink}
                                                onChange={e => setFormData({ ...formData, meetingLink: e.target.value })}
                                                placeholder="https://zoom.us/j/123456789"
                                                className="h-12 rounded-xl border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Wizard Footer (Max CTAs) */}
                        <div className="bg-slate-50 dark:bg-slate-900 border-t p-6 flex justify-between items-center rounded-b-2xl">
                            <Button 
                                variant="outline" 
                                onClick={() => setWizardStep(s => s - 1)}
                                disabled={wizardStep === 1 || isPostLoading}
                                className="h-11 px-6 rounded-xl"
                            >
                                <ArrowLeft className="mr-2 h-4 w-4" /> Back
                            </Button>

                            {wizardStep < 3 ? (
                                <Button 
                                    onClick={handleNextStep}
                                    className="h-11 px-8 rounded-xl font-bold bg-primary hover:bg-primary/90 text-primary-foreground transition-all shadow-md"
                                >
                                    Next Step <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            ) : (
                                <Button 
                                    onClick={handleSubmit} 
                                    disabled={isPostLoading}
                                    className="h-11 px-8 rounded-xl font-bold bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg shadow-green-500/30 transition-all border-0"
                                >
                                    {isPostLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Video className="mr-2 h-5 w-5" />}
                                    Finalize & Broadcast
                                </Button>
                            )}
                        </div>
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
                                            <div className="flex flex-col">
                                                <span className="text-muted-foreground font-medium line-clamp-1 italic text-xs">
                                                    Course: {cls.course?.title || 'Unlinked Module'}
                                                </span>
                                                <span className="text-xs font-semibold mt-1">
                                                    Batch: {cls.batch ? `${(cls.batch as any).batchCode ? (cls.batch as any).batchCode + ' - ' : ''}${cls.batch.name}` : 'Unlinked Batch'}
                                                </span>
                                            </div>
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

