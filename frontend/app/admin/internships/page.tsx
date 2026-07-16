"use client"
import * as React from "react"
import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Users, FileText, CheckCircle, Search, Loader2, X as XIcon, UserPlus } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { toast } from "@/components/ui/use-toast"
import api from "@/lib/api"

type InternUser = {
    name: string;
    email: string;
}

type InternProgram = {
    title: string;
}

type InternMentor = {
    name: string;
}

type Enrollment = {
    id: string;
    status: string;
    offerConverted: boolean;
    user: InternUser;
    program: InternProgram;
    mentor: InternMentor | null;
}

type MentorUser = {
    id: string;
    name: string;
    email: string;
}

export default function AdminInternshipsPortal() {
    const [enrollments, setEnrollments] = useState<Enrollment[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [statusFilter, setStatusFilter] = useState('ALL')
    
    // Mentor Assignment Modal State
    const [isMentorModalOpen, setIsMentorModalOpen] = useState(false)
    const [selectedInternId, setSelectedInternId] = useState<string | null>(null)
    const [mentors, setMentors] = useState<MentorUser[]>([])
    const [selectedMentorId, setSelectedMentorId] = useState('')
    const [assigningLoading, setAssigningLoading] = useState(false)
    const [mentorsLoading, setMentorsLoading] = useState(false)

    const fetchInterns = async () => {
        try {
            const res = await api.get('/internships');
            if (res.data?.success) {
                setEnrollments(res.data.data);
            }
        } catch (error) {
            console.error(error);
            toast({
                title: "Error fetching interns",
                description: "Could not load internship data.",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchInterns();
    }, [])

    const fetchMentors = async () => {
        setMentorsLoading(true)
        try {
            // Fetch users who could act as mentors (INSTRUCTOR, STAFF, ADMIN)
            const res = await api.get('/users?role=INSTRUCTOR,STAFF,ADMIN,SUPER_ADMIN&limit=50');
            if (res.data?.users) {
                setMentors(res.data.users);
            }
        } catch (error) {
            console.error("Error fetching mentors", error)
            toast({ title: "Failed to load mentors", variant: "destructive" })
        } finally {
            setMentorsLoading(false)
        }
    }

    const openMentorModal = (enrollmentId: string) => {
        setSelectedInternId(enrollmentId);
        setSelectedMentorId('');
        setIsMentorModalOpen(true);
        if (mentors.length === 0) {
            fetchMentors();
        }
    }

    const handleAssignMentor = async () => {
        if (!selectedInternId || !selectedMentorId) return;
        setAssigningLoading(true);

        try {
            const res = await api.put(`/internships/${selectedInternId}/mentor`, {
                mentorId: selectedMentorId
            });
            if (res.data?.success) {
                toast({ title: "Mentor successfully assigned!" });
                setIsMentorModalOpen(false);
                fetchInterns(); // Refresh the list
            }
        } catch (error) {
            console.error(error);
            toast({
                title: "Assignment Failed",
                description: "Could not assign mentor at this time.",
                variant: "destructive"
            });
        } finally {
            setAssigningLoading(false);
        }
    }

    const filteredEnrollments = enrollments.filter(e => {
        if (statusFilter !== 'ALL' && e.status !== statusFilter) return false;
        
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return (
            e.user?.name?.toLowerCase().includes(q) ||
            e.user?.email?.toLowerCase().includes(q) ||
            e.program?.title?.toLowerCase().includes(q)
        );
    });

    return (
        <div className="space-y-6 animate-in fade-in duration-500 p-2 md:p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tight italic uppercase">Internship <span className="text-primary">Management</span></h1>
                    <p className="text-muted-foreground text-sm">Manage intern applications, assign mentors, and review performance.</p>
                </div>
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">Create Program</Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card className="glass-card border-white/10">
                    <CardContent className="pt-6 flex items-center gap-4">
                        <div className="p-3 bg-primary/20 text-primary rounded-xl"><Users className="w-6 h-6" /></div>
                        <div>
                            <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Active Interns</p>
                            <p className="text-3xl font-black">{enrollments.filter(e => e.status === 'ACTIVE').length}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="glass-card border-white/10">
                    <CardContent className="pt-6 flex items-center gap-4">
                        <div className="p-3 bg-amber-500/20 text-amber-500 rounded-xl"><FileText className="w-6 h-6" /></div>
                        <div>
                            <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Pending Assignments</p>
                            <p className="text-3xl font-black">{enrollments.filter(e => e.status === 'PENDING').length}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="glass-card border-white/10">
                    <CardContent className="pt-6 flex items-center gap-4">
                        <div className="p-3 bg-emerald-500/20 text-emerald-500 rounded-xl"><CheckCircle className="w-6 h-6" /></div>
                        <div>
                            <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Offers Converted</p>
                            <p className="text-3xl font-black">{enrollments.filter(e => e.offerConverted).length}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card className="border-white/10 glass-card overflow-hidden">
                <div className="p-4 border-b border-white/10 flex flex-col md:flex-row gap-4 bg-white/5">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                            placeholder="Search by student name, email, or program..." 
                            className="pl-10 h-11 glass-input rounded-xl"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        {searchQuery && (
                            <button 
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                onClick={() => setSearchQuery('')}
                            >
                                <XIcon className="h-4 w-4" />
                            </button>
                        )}
                    </div>
                    <div className="w-full md:w-56">
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="h-11 glass-input rounded-xl border-white/10">
                                <SelectValue placeholder="Filter by status" />
                            </SelectTrigger>
                            <SelectContent className="bg-[#0a0a0b] border-white/10">
                                <SelectItem value="ALL">All Statuses</SelectItem>
                                <SelectItem value="PENDING">Pending Mentor</SelectItem>
                                <SelectItem value="ACTIVE">Active</SelectItem>
                                <SelectItem value="COMPLETED">Completed</SelectItem>
                                <SelectItem value="DROPPED">Dropped</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-black/20">
                            <tr>
                                <th className="p-4 font-bold text-muted-foreground uppercase text-[10px] tracking-wider">Student Profile</th>
                                <th className="p-4 font-bold text-muted-foreground uppercase text-[10px] tracking-wider">Program</th>
                                <th className="p-4 font-bold text-muted-foreground uppercase text-[10px] tracking-wider">Status</th>
                                <th className="p-4 font-bold text-muted-foreground uppercase text-[10px] tracking-wider">Assigned Mentor</th>
                                <th className="p-4 font-bold text-muted-foreground uppercase text-[10px] tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="p-16 text-center">
                                        <div className="flex flex-col items-center justify-center gap-3">
                                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                            <span className="text-xs font-bold animate-pulse uppercase tracking-widest text-muted-foreground">Loading interns...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredEnrollments.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-16 text-center opacity-60">
                                        <Users className="h-12 w-12 mx-auto mb-3 opacity-20" />
                                        <p className="text-sm font-bold">No interns found</p>
                                        <p className="text-xs text-muted-foreground mt-1">Try adjusting your filters or search query.</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredEnrollments.map((enroll) => (
                                    <tr key={enroll.id} className="hover:bg-white/5 transition-colors group">
                                        <td className="p-4 align-top">
                                            <div className="font-bold text-base text-foreground">{enroll.user?.name}</div>
                                            <div className="text-xs text-muted-foreground">{enroll.user?.email}</div>
                                        </td>
                                        <td className="p-4 align-top">
                                            <div className="font-semibold text-primary">{enroll.program?.title}</div>
                                        </td>
                                        <td className="p-4 align-top">
                                            <Badge className={`font-bold uppercase text-[10px] border-none ${
                                                enroll.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-500' : 
                                                enroll.status === 'PENDING' ? 'bg-amber-500/10 text-amber-500' :
                                                'bg-white/10 text-muted-foreground'
                                            }`}>
                                                {enroll.status}
                                            </Badge>
                                        </td>
                                        <td className="p-4 align-top">
                                            {enroll.mentor?.name ? (
                                                <div className="flex items-center gap-2">
                                                    <div className="h-6 w-6 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold text-[10px]">
                                                        {enroll.mentor.name.charAt(0)}
                                                    </div>
                                                    <span className="font-medium text-sm">{enroll.mentor.name}</span>
                                                </div>
                                            ) : (
                                                <Button 
                                                    variant="outline" 
                                                    size="sm" 
                                                    className="h-7 text-xs border-dashed border-primary/50 text-primary hover:bg-primary/10 rounded-full px-3"
                                                    onClick={() => openMentorModal(enroll.id)}
                                                >
                                                    <UserPlus className="h-3 w-3 mr-1" /> Assign Mentor
                                                </Button>
                                            )}
                                        </td>
                                        <td className="p-4 align-top text-right">
                                            <Button variant="ghost" size="sm" className="h-8 text-xs text-muted-foreground hover:text-foreground">
                                                View Logs
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            <Dialog open={isMentorModalOpen} onOpenChange={setIsMentorModalOpen}>
                <DialogContent className="bg-[#0a0a0b] border-white/10 text-foreground sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold">Assign Mentor</DialogTitle>
                        <DialogDescription className="text-muted-foreground">
                            Select an instructor or staff member to guide this intern through their program.
                        </DialogDescription>
                    </DialogHeader>
                    
                    <div className="py-6 space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider text-[11px]">Available Mentors</label>
                            {mentorsLoading ? (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground h-10 px-3 border border-white/10 rounded-xl bg-white/5">
                                    <Loader2 className="h-4 w-4 animate-spin" /> Loading mentors...
                                </div>
                            ) : (
                                <Select value={selectedMentorId} onValueChange={setSelectedMentorId}>
                                    <SelectTrigger className="h-11 glass-input rounded-xl border-white/10">
                                        <SelectValue placeholder="Select a mentor..." />
                                    </SelectTrigger>
                                    <SelectContent className="bg-[#121214] border-white/10 max-h-[250px]">
                                        {mentors.map(mentor => (
                                            <SelectItem key={mentor.id} value={mentor.id}>
                                                <div className="flex flex-col">
                                                    <span>{mentor.name}</span>
                                                    <span className="text-[10px] text-muted-foreground">{mentor.email}</span>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setIsMentorModalOpen(false)} className="hover:bg-white/5 rounded-xl">
                            Cancel
                        </Button>
                        <Button 
                            className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl"
                            onClick={handleAssignMentor}
                            disabled={!selectedMentorId || assigningLoading}
                        >
                            {assigningLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                            Assign Mentor
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
