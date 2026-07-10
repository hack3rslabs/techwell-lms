"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import api from "@/lib/api"
import { CalendarIcon, ArrowLeft, CheckCircle, Video, Bot, Edit, Search, Ban, Power } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"

export default function BatchDetailsPage() {
    const params = useParams()
    const router = useRouter()
    const { hasPermission } = useAuth()
    
    const [batch, setBatch] = useState<any>(null)
    const [students, setStudents] = useState<any[]>([])
    const [attendanceDate, setAttendanceDate] = useState<string>(format(new Date(), "yyyy-MM-dd"))
    const [attendanceRecords, setAttendanceRecords] = useState<any[]>([])
    const [notes, setNotes] = useState<any[]>([])
    const [noteContent, setNoteContent] = useState("")
    const [noteType, setNoteType] = useState("COMMENT")
    const [requestedEndDate, setRequestedEndDate] = useState("")
    const [loading, setLoading] = useState(true)
    const [savingAttendance, setSavingAttendance] = useState(false)
    const [submittingNote, setSubmittingNote] = useState(false)
    const [completingBatch, setCompletingBatch] = useState(false)

    // Quick Actions
    const [liveClassTitle, setLiveClassTitle] = useState("")
    const [liveClassDate, setLiveClassDate] = useState("")
    const [liveClassDuration, setLiveClassDuration] = useState("60")
    const [liveClassLink, setLiveClassLink] = useState("")
    const [schedulingClass, setSchedulingClass] = useState(false)
    const [classDialogOpen, setClassDialogOpen] = useState(false)

    const [interviewDomain, setInterviewDomain] = useState("")
    const [interviewRole, setInterviewRole] = useState("")
    const [interviewDifficulty, setInterviewDifficulty] = useState("INTERMEDIATE")
    const [schedulingInterview, setSchedulingInterview] = useState(false)
    const [interviewDialogOpen, setInterviewDialogOpen] = useState(false)

    // Edit Batch
    const [editDialogOpen, setEditDialogOpen] = useState(false)
    const [editBatchData, setEditBatchData] = useState<any>({})

    // Add Students
    const [addStudentsOpen, setAddStudentsOpen] = useState(false)
    const [allUsers, setAllUsers] = useState<any[]>([])
    const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([])
    const [addingStudents, setAddingStudents] = useState(false)
    const [studentSearch, setStudentSearch] = useState("")

    async function fetchBatchDetails() {
        try {
            const res = await api.get(`/batches/${params.id}`)
            setBatch(res.data)
        } catch (error) {
            console.error("Failed to fetch batch details", error)
        }
    }


    async function fetchStudents() {
        try {
            const res = await api.get(`/batches/${params.id}/students`)
            setStudents(res.data)
        } catch (error) {
            console.error("Failed to fetch students", error)
        } finally {
            setLoading(false)
        }
    }

    async function fetchNotes() {
        try {
            const res = await api.get(`/batches/${params.id}/notes`)
            setNotes(res.data)
        } catch (error) {
            console.error("Failed to fetch notes", error)
        }
    }

    async function fetchAttendance() {
        try {
            const res = await api.get(`/batches/${params.id}/attendance?date=${attendanceDate}`)
            const existingRecords = res.data
            
            // Map existing records or default to PRESENT
            const newRecords = students.map(enrollment => {
                const existing = existingRecords.find((r: any) => r.userId === enrollment.user.id)
                return {
                    userId: enrollment.user.id,
                    name: enrollment.user.name,
                    status: existing ? existing.status : 'PRESENT',
                    notes: existing ? existing.notes : ''
                }
            })
            setAttendanceRecords(newRecords)
        } catch (error) {
            console.error("Failed to fetch attendance", error)
        }
    }





    useEffect(() => {
        fetchBatchDetails()
        fetchStudents()
        fetchNotes()
    }, [params.id])

    useEffect(() => {
        if (attendanceDate) fetchAttendance()
    }, [attendanceDate, students.length]) // re-fetch if students change so we can map them


    const fetchAllUsersForEnrollment = async () => {
        try {
            // Fetch students enrolled in this course but not in this batch
            const res = await api.get(`/batches/${params.id}/available-students`)
            setAllUsers(res.data || [])
        } catch (err: any) {
            console.error('Failed to fetch available users', err)
            setAllUsers([])
        }
    }


    const handleAddNote = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            setSubmittingNote(true)
            await api.post(`/batches/${params.id}/notes`, {
                content: noteContent,
                type: noteType,
                requestedEndDate: noteType === 'EXTENSION_REQUEST' ? requestedEndDate : null
            })
            setNoteContent("")
            setRequestedEndDate("")
            setNoteType("COMMENT")
            fetchNotes()
            alert("Note added successfully!")
        } catch (error) {
            console.error("Failed to add note", error)
            alert("Failed to add note")
        } finally {
            setSubmittingNote(false)
        }
    }

    const handleUpdateNoteStatus = async (noteId: string, status: string) => {
        try {
            await api.patch(`/batches/${params.id}/notes/${noteId}/status`, { status })
            fetchNotes()
            if (status === 'APPROVED') {
                fetchBatchDetails() // Refresh end date
            }
            alert(`Request ${status.toLowerCase()} successfully!`)
        } catch (error) {
            console.error("Failed to update status", error)
            alert("Failed to update status")
        }
    }

    const handleCompleteBatch = async () => {
        if (!window.confirm("Are you sure you want to mark this batch as COMPLETED? This will process exams and immediately generate certificates for all active students.")) return
        try {
            setCompletingBatch(true)
            await api.patch(`/batches/${params.id}/complete`)
            fetchBatchDetails()
            alert("Batch completed successfully!")
        } catch (error) {
            console.error("Failed to complete batch", error)
            alert("Failed to complete batch")
        } finally {
            setCompletingBatch(false)
        }
    }

    const handleToggleActiveBatch = async () => {
        const action = batch.isActive ? 'disable' : 'activate'
        if (!window.confirm(`Are you sure you want to ${action} this batch?`)) return
        try {
            await api.put(`/batches/${params.id}`, { isActive: !batch.isActive })
            fetchBatchDetails()
            alert(`Batch ${action}d successfully!`)
        } catch (error) {
            console.error(`Failed to ${action} batch`, error)
            alert(`Failed to ${action} batch`)
        }
    }

    const handleScheduleLiveClass = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            setSchedulingClass(true)
            await api.post(`/batches/${params.id}/live-classes`, {
                title: liveClassTitle,
                scheduledAt: liveClassDate,
                duration: liveClassDuration,
                meetingLink: liveClassLink,
                platform: 'ZOOM'
            })
            alert("Live class scheduled successfully!")
            setClassDialogOpen(false)
            fetchBatchDetails()
        } catch (error) {
            console.error("Failed to schedule class", error)
            alert("Failed to schedule live class")
        } finally {
            setSchedulingClass(false)
        }
    }

    const handleScheduleInterview = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            setSchedulingInterview(true)
            await api.post(`/batches/${params.id}/ai-interviews`, {
                domain: interviewDomain,
                role: interviewRole,
                difficulty: interviewDifficulty,
                duration: 30
            })
            alert("AI Interviews scheduled successfully!")
            setInterviewDialogOpen(false)
            fetchBatchDetails()
        } catch (error) {
            console.error("Failed to schedule interview", error)
            alert("Failed to schedule interviews")
        } finally {
            setSchedulingInterview(false)
        }
    }


    const handleSaveAttendance = async () => {
        try {
            setSavingAttendance(true)
            await api.post(`/batches/${params.id}/attendance`, {
                date: attendanceDate,
                records: attendanceRecords
            })
            alert("Attendance saved successfully!")
        } catch (error) {
            console.error("Failed to save attendance", error)
            alert("Failed to save attendance")
        } finally {
            setSavingAttendance(false)
        }
    }

    const updateAttendanceStatus = (userId: string, status: string) => {
        setAttendanceRecords(prev => prev.map(r => r.userId === userId ? { ...r, status } : r))
    }

    const handleEditBatch = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            await api.put(`/batches/${params.id}`, {
                name: editBatchData.name,
                timings: editBatchData.timings,
                hasJobAssistance: editBatchData.hasJobAssistance,
                startDate: editBatchData.startDate,
                endDate: editBatchData.endDate,
                maxStudents: editBatchData.maxStudents,
                description: editBatchData.description
            })
            alert("Batch updated successfully!")
            setEditDialogOpen(false)
            fetchBatchDetails()
        } catch(error) {
            alert("Failed to update batch")
        }
    }

    const handleAddSelectedStudents = async () => {
        if(selectedStudentIds.length === 0) return
        setAddingStudents(true)
        try {
            await api.post(`/batches/${params.id}/students`, { studentIds: selectedStudentIds })
            alert("Students added to batch!")
            setAddStudentsOpen(false)
            setSelectedStudentIds([])
            fetchStudents()
            fetchBatchDetails()
        } catch(error) {
            alert("Failed to add students")
        } finally {
            setAddingStudents(false)
        }
    }

    if (loading) return <div className="p-8">Loading...</div>
    if (!batch) return <div className="p-8">Batch not found</div>

    return (
        <div className="p-8 space-y-6 max-w-6xl mx-auto">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.push('/admin/batches')}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div className="flex-1">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-bold tracking-tight">{batch.name}</h1>
                            <Badge variant="outline">{batch.batchCode}</Badge>
                            <Badge variant={batch.status === 'COMPLETED' ? 'default' : 'secondary'}>{batch.status || 'ONGOING'}</Badge>
                            {batch.hasJobAssistance && <Badge className="bg-green-500">Job Assistance</Badge>}
                            
                            <Button variant="ghost" size="icon" onClick={() => {
                                setEditBatchData({
                                    name: batch.name,
                                    timings: batch.timings || '',
                                    hasJobAssistance: batch.hasJobAssistance || false,
                                    startDate: batch.startDate ? format(new Date(batch.startDate), 'yyyy-MM-dd') : '',
                                    endDate: batch.endDate ? format(new Date(batch.endDate), 'yyyy-MM-dd') : '',
                                    maxStudents: batch.maxStudents || '',
                                    description: batch.description || ''
                                })
                                setEditDialogOpen(true)
                            }}>
                                <Edit className="h-4 w-4" />
                            </Button>
                        </div>
                        {hasPermission("COURSES") && batch.status !== 'COMPLETED' && (
                            <div className="flex items-center gap-2">
                                <Dialog open={classDialogOpen} onOpenChange={setClassDialogOpen}>
                                    <DialogTrigger asChild>
                                        <Button variant="outline" className="gap-2"><Video className="h-4 w-4"/> Schedule Live Class</Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Schedule Live Class</DialogTitle>
                                        </DialogHeader>
                                        <form onSubmit={handleScheduleLiveClass} className="space-y-4">
                                            <div>
                                                <Label>Topic</Label>
                                                <Input required value={liveClassTitle} onChange={e => setLiveClassTitle(e.target.value)} />
                                            </div>
                                            <div>
                                                <Label>Date & Time</Label>
                                                <Input type="datetime-local" required value={liveClassDate} onChange={e => setLiveClassDate(e.target.value)} />
                                            </div>
                                            <div>
                                                <Label>Duration (mins)</Label>
                                                <Input type="number" required value={liveClassDuration} onChange={e => setLiveClassDuration(e.target.value)} />
                                            </div>
                                            <div>
                                                <Label>Meeting Link</Label>
                                                <Input type="url" required value={liveClassLink} onChange={e => setLiveClassLink(e.target.value)} />
                                            </div>
                                            <Button type="submit" disabled={schedulingClass}>Schedule</Button>
                                        </form>
                                    </DialogContent>
                                </Dialog>

                                <Dialog open={interviewDialogOpen} onOpenChange={setInterviewDialogOpen}>
                                    <DialogTrigger asChild>
                                        <Button variant="outline" className="gap-2"><Bot className="h-4 w-4"/> Schedule AI Interview</Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Deploy AI Interview</DialogTitle>
                                        </DialogHeader>
                                        <form onSubmit={handleScheduleInterview} className="space-y-4">
                                            <div>
                                                <Label>Domain (e.g. Software Engineering)</Label>
                                                <Input required value={interviewDomain} onChange={e => setInterviewDomain(e.target.value)} />
                                            </div>
                                            <div>
                                                <Label>Role (e.g. Frontend Developer)</Label>
                                                <Input required value={interviewRole} onChange={e => setInterviewRole(e.target.value)} />
                                            </div>
                                            <div>
                                                <Label>Difficulty</Label>
                                                <Select value={interviewDifficulty} onValueChange={setInterviewDifficulty}>
                                                    <SelectTrigger><SelectValue/></SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="BEGINNER">Beginner</SelectItem>
                                                        <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
                                                        <SelectItem value="ADVANCED">Advanced</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <Button type="submit" disabled={schedulingInterview}>Deploy to All Students</Button>
                                        </form>
                                    </DialogContent>
                                </Dialog>

                                <Button onClick={handleCompleteBatch} disabled={completingBatch} variant="default" className="gap-2">
                                    <CheckCircle className="h-4 w-4" />
                                    Complete Batch
                                </Button>
                                
                                <Button onClick={handleToggleActiveBatch} variant={batch.isActive ? "destructive" : "secondary"} className="gap-2">
                                    {batch.isActive ? <Ban className="h-4 w-4" /> : <Power className="h-4 w-4" />}
                                    {batch.isActive ? "Disable Batch" : "Activate Batch"}
                                </Button>
                            </div>
                        )}
                    </div>
                    <p className="text-muted-foreground mt-1">
                        Course: {batch.course?.title} | Instructor: {batch.instructor?.name}
                    </p>
                </div>
            </div>

            <Tabs defaultValue="overview">
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="students">Students ({students.length})</TabsTrigger>
                    <TabsTrigger value="attendance">Attendance Tracking</TabsTrigger>
                    <TabsTrigger value="notes">Notes & Extensions</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Batch Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div>
                                    <p className="text-sm text-muted-foreground">Timings</p>
                                    <p className="font-medium">{batch.timings || 'Not Set'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Start Date</p>
                                    <p className="font-medium">{batch.startDate ? format(new Date(batch.startDate), 'PPP') : 'Not Set'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">End Date</p>
                                    <p className="font-medium">{batch.endDate ? format(new Date(batch.endDate), 'PPP') : 'Not Set'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Max Students</p>
                                    <p className="font-medium">{batch.maxStudents || 'Unlimited'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Status</p>
                                    <p className="font-medium">{batch.isActive ? 'Active' : 'Inactive'}</p>
                                </div>
                            </div>
                            {batch.description && (
                                <div className="pt-4 border-t">
                                    <p className="text-sm text-muted-foreground">Description</p>
                                    <p className="mt-1">{batch.description}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Schedule Section */}
                    <div className="grid md:grid-cols-2 gap-6 mt-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2"><Video className="h-5 w-5"/> Scheduled Live Classes</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {!batch.liveClasses || batch.liveClasses.length === 0 ? (
                                    <p className="text-sm text-muted-foreground">No live classes scheduled.</p>
                                ) : (
                                    <div className="space-y-4">
                                        {batch.liveClasses.map((lc: any) => (
                                            <div key={lc.id} className="border p-3 rounded-md">
                                                <div className="flex justify-between font-medium">
                                                    <span>{lc.title}</span>
                                                    <Badge variant="outline">{lc.platform}</Badge>
                                                </div>
                                                <p className="text-sm text-muted-foreground mt-1">
                                                    {format(new Date(lc.scheduledAt), "PPP p")} • {lc.duration} mins
                                                </p>
                                                {lc.meetingLink && (
                                                    <a href={lc.meetingLink} target="_blank" rel="noreferrer" className="text-sm text-blue-600 hover:underline mt-2 inline-block">Join Link</a>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2"><Bot className="h-5 w-5"/> Deployed AI Interviews</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {!batch.interviews || batch.interviews.length === 0 ? (
                                    <p className="text-sm text-muted-foreground">No AI interviews deployed for this batch.</p>
                                ) : (
                                    <div className="space-y-4">
                                        {batch.interviews.map((intv: any) => (
                                            <div key={intv.id} className="border p-3 rounded-md flex justify-between items-center">
                                                <div>
                                                    <p className="font-medium">{intv.role}</p>
                                                    <p className="text-sm text-muted-foreground">{intv.domain} • {intv.difficulty}</p>
                                                </div>
                                                <Badge>{intv.status}</Badge>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="students" className="mt-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Enrolled Students</CardTitle>
                            <div className="flex gap-2">
                                <Button onClick={() => router.push('/admin/students')} variant="outline">View All Students</Button>
                                <Dialog open={addStudentsOpen} onOpenChange={setAddStudentsOpen}>
                                    <DialogTrigger asChild>
                                        <Button onClick={fetchAllUsersForEnrollment}>Add Students</Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Add Students to Batch</DialogTitle>
                                        </DialogHeader>
                                        <DialogDescription className="text-muted-foreground text-sm">
                                            Select unassigned students enrolled in <b>{batch.course?.title}</b> to add them directly into this batch.
                                        </DialogDescription>
                                        
                                        <div className="relative">
                                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                placeholder="Search by name, email, or phone..."
                                                className="pl-8"
                                                value={studentSearch}
                                                onChange={(e) => setStudentSearch(e.target.value)}
                                            />
                                        </div>

                                        <div className="max-h-64 overflow-y-auto space-y-2 border rounded-md p-2">
                                            {allUsers
                                                .filter(u => 
                                                    !studentSearch || 
                                                    u.name?.toLowerCase().includes(studentSearch.toLowerCase()) || 
                                                    u.email?.toLowerCase().includes(studentSearch.toLowerCase()) || 
                                                    u.phone?.includes(studentSearch)
                                                )
                                                .map(user => (
                                                <div key={user.id} className="flex items-center gap-2 p-2 border-b last:border-0 rounded hover:bg-slate-50">
                                                    <input 
                                                        type="checkbox" 
                                                        checked={selectedStudentIds.includes(user.id)}
                                                        onChange={(e) => {
                                                            if (e.target.checked) setSelectedStudentIds([...selectedStudentIds, user.id])
                                                            else setSelectedStudentIds(selectedStudentIds.filter(id => id !== user.id))
                                                        }}
                                                    />
                                                    <div className="flex flex-col ml-2">
                                                        <Label className="font-semibold cursor-pointer">{user.name}</Label>
                                                        <span className="text-xs text-muted-foreground">{user.email} {user.phone ? `• ${user.phone}` : ''}</span>
                                                    </div>
                                                </div>
                                            ))}
                                            {allUsers.filter(u => 
                                                !studentSearch || 
                                                u.name?.toLowerCase().includes(studentSearch.toLowerCase()) || 
                                                u.email?.toLowerCase().includes(studentSearch.toLowerCase()) || 
                                                u.phone?.includes(studentSearch)
                                            ).length === 0 && (
                                                <div className="text-center py-4 text-muted-foreground text-sm">
                                                    No available students found.
                                                </div>
                                            )}
                                        </div>
                                        <DialogFooter>
                                            <Button onClick={handleAddSelectedStudents} disabled={addingStudents || selectedStudentIds.length === 0}>
                                                {addingStudents ? 'Adding...' : 'Add Selected'}
                                            </Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Phone</TableHead>
                                        <TableHead>Enrolled At</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {students.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                                                No students assigned to this batch yet.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        students.map(enrollment => (
                                            <TableRow key={enrollment.id}>
                                                <TableCell className="font-medium">{enrollment.user.name}</TableCell>
                                                <TableCell>{enrollment.user.email}</TableCell>
                                                <TableCell>{enrollment.user.phone || '-'}</TableCell>
                                                <TableCell>{format(new Date(enrollment.enrolledAt), 'MMM dd, yyyy')}</TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="attendance" className="mt-6">
                    <Card>
                        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div>
                                <CardTitle>Attendance Tracking</CardTitle>
                                <p className="text-sm text-muted-foreground mt-1">Mark student attendance for specific dates.</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <Label htmlFor="date">Date:</Label>
                                <Input 
                                    id="date" 
                                    type="date" 
                                    value={attendanceDate}
                                    onChange={(e) => setAttendanceDate(e.target.value)}
                                    className="w-auto"
                                />
                            </div>
                        </CardHeader>
                        <CardContent>
                            {students.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground border rounded-md">
                                    No students to mark attendance for.
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Student Name</TableHead>
                                                <TableHead>Status</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {attendanceRecords.map(record => (
                                                <TableRow key={record.userId}>
                                                    <TableCell className="font-medium">{record.name}</TableCell>
                                                    <TableCell>
                                                        <Select 
                                                            value={record.status} 
                                                            onValueChange={(val) => updateAttendanceStatus(record.userId, val)}
                                                        >
                                                            <SelectTrigger className="w-[180px]">
                                                                <SelectValue placeholder="Status" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="PRESENT">Present</SelectItem>
                                                                <SelectItem value="ABSENT">Absent</SelectItem>
                                                                <SelectItem value="LATE">Late</SelectItem>
                                                                <SelectItem value="EXCUSED">Excused</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                    <div className="flex justify-end pt-4">
                                        <Button onClick={handleSaveAttendance} disabled={savingAttendance}>
                                            {savingAttendance ? 'Saving...' : 'Save Attendance'}
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="notes" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Notes & Extensions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <form onSubmit={handleAddNote} className="space-y-4 border p-4 rounded-md">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Type</Label>
                                        <Select value={noteType} onValueChange={setNoteType}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="COMMENT">Comment / Note</SelectItem>
                                                <SelectItem value="EXTENSION_REQUEST">Extension Request</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    {noteType === 'EXTENSION_REQUEST' && (
                                        <div className="space-y-2">
                                            <Label>Requested End Date</Label>
                                            <Input 
                                                type="date" 
                                                required 
                                                value={requestedEndDate} 
                                                onChange={e => setRequestedEndDate(e.target.value)} 
                                            />
                                        </div>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label>Content / Reason</Label>
                                    <Input 
                                        required 
                                        placeholder="Add your note or explanation..." 
                                        value={noteContent} 
                                        onChange={e => setNoteContent(e.target.value)} 
                                    />
                                </div>
                                <Button type="submit" disabled={submittingNote}>Add Note</Button>
                            </form>

                            <div className="space-y-4">
                                <h3 className="font-medium">Previous Notes</h3>
                                {notes.length === 0 ? (
                                    <p className="text-muted-foreground text-sm">No notes added yet.</p>
                                ) : (
                                    notes.map(note => (
                                        <div key={note.id} className="border p-4 rounded-md space-y-2">
                                            <div className="flex justify-between items-start">
                                                <div className="flex gap-2 items-center">
                                                    <span className="font-semibold">{note.user.name}</span>
                                                    <Badge variant={note.type === 'COMMENT' ? 'secondary' : 'destructive'}>
                                                        {note.type.replace('_', ' ')}
                                                    </Badge>
                                                    <span className="text-xs text-muted-foreground">
                                                        {format(new Date(note.createdAt), 'PPP p')}
                                                    </span>
                                                </div>
                                                {note.type === 'EXTENSION_REQUEST' && (
                                                    <Badge variant={note.status === 'APPROVED' ? 'default' : note.status === 'REJECTED' ? 'destructive' : 'outline'}>
                                                        {note.status}
                                                    </Badge>
                                                )}
                                            </div>
                                            <p className="text-sm">{note.content}</p>
                                            {note.requestedEndDate && (
                                                <p className="text-sm text-muted-foreground mt-2">
                                                    <CalendarIcon className="inline h-4 w-4 mr-1" />
                                                    Requested New End Date: {format(new Date(note.requestedEndDate), 'PPP')}
                                                </p>
                                            )}
                                            {note.type === 'EXTENSION_REQUEST' && note.status === 'PENDING' && hasPermission("COURSES") && (
                                                <div className="flex gap-2 pt-2">
                                                    <Button size="sm" onClick={() => handleUpdateNoteStatus(note.id, 'APPROVED')}>Approve</Button>
                                                    <Button size="sm" variant="destructive" onClick={() => handleUpdateNoteStatus(note.id, 'REJECTED')}>Reject</Button>
                                                </div>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Edit Batch Dialog */}
            <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Batch</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleEditBatch} className="space-y-4">
                        <div>
                            <Label>Batch Name</Label>
                            <Input required value={editBatchData.name || ''} onChange={e => setEditBatchData({...editBatchData, name: e.target.value})} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Start Date</Label>
                                <Input type="date" value={editBatchData.startDate || ''} onChange={e => setEditBatchData({...editBatchData, startDate: e.target.value})} />
                            </div>
                            <div>
                                <Label>End Date</Label>
                                <Input type="date" value={editBatchData.endDate || ''} onChange={e => setEditBatchData({...editBatchData, endDate: e.target.value})} />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Timings</Label>
                                <Input placeholder="e.g. 10:00 AM - 12:00 PM" value={editBatchData.timings || ''} onChange={e => setEditBatchData({...editBatchData, timings: e.target.value})} />
                            </div>
                            <div>
                                <Label>Max Students</Label>
                                <Input type="number" value={editBatchData.maxStudents || ''} onChange={e => setEditBatchData({...editBatchData, maxStudents: e.target.value})} />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="submit">Save Changes</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Add Students Dialog */}
            <Dialog open={addStudentsOpen} onOpenChange={setAddStudentsOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Add Students to Batch</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 my-4 max-h-[60vh] overflow-y-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-12"></TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Email</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {allUsers
                                    .filter(u => 
                                        !studentSearch || 
                                        u.name?.toLowerCase().includes(studentSearch.toLowerCase()) || 
                                        u.email?.toLowerCase().includes(studentSearch.toLowerCase()) || 
                                        u.phone?.includes(studentSearch)
                                    )
                                    .map(user => (
                                    <TableRow key={user.id}>
                                        <TableCell>
                                            <input 
                                                type="checkbox" 
                                                className="w-4 h-4"
                                                checked={selectedStudentIds.includes(user.id)}
                                                onChange={(e) => {
                                                    if(e.target.checked) {
                                                        setSelectedStudentIds([...selectedStudentIds, user.id])
                                                    } else {
                                                        setSelectedStudentIds(selectedStudentIds.filter(id => id !== user.id))
                                                    }
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell>{user.name}</TableCell>
                                        <TableCell>{user.email}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setAddStudentsOpen(false)}>Cancel</Button>
                        <Button onClick={handleAddSelectedStudents} disabled={addingStudents || selectedStudentIds.length === 0}>
                            {addingStudents ? 'Adding...' : `Add ${selectedStudentIds.length} Students`}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
