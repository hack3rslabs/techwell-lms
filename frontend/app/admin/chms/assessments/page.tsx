"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import api from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription
} from "@/components/ui/dialog"
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table"
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select"
import { Plus, Search, PenLine, Trash2, Eye, Clock, CheckCircle, XCircle, Loader2 } from "lucide-react"
import { format } from "date-fns"
import { useToast } from "@/components/ui/use-toast"

interface Assessment {
    id: string
    title: string
    domain: string
    difficulty: string
    duration: number
    totalQuestions: number
    status: string
    createdAt: string
    _count?: { questions: number; submissions: number }
}

export default function CHMSAssessmentsPage() {
    const { hasPermission } = useAuth()
    const { toast } = useToast()
    const [assessments, setAssessments] = useState<Assessment[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState("")
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [form, setForm] = useState({
        title: "",
        domain: "IT",
        difficulty: "INTERMEDIATE",
        duration: 60,
        description: ""
    })

    const fetchAssessments = async () => {
        try {
            const res = await api.get('/assessments?type=campus')
            setAssessments(res.data?.assessments || res.data || [])
        } catch {
            // Show empty state
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { fetchAssessments() }, [])

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        try {
            await api.post('/assessments', { ...form, type: 'CAMPUS' })
            toast({ title: "Assessment created", description: "New campus assessment has been added." })
            setIsModalOpen(false)
            setForm({ title: "", domain: "IT", difficulty: "INTERMEDIATE", duration: 60, description: "" })
            fetchAssessments()
        } catch {
            toast({ title: "Error", description: "Failed to create assessment", variant: "destructive" })
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this assessment? This cannot be undone.")) return
        try {
            await api.delete(`/assessments/${id}`)
            toast({ title: "Deleted", description: "Assessment removed." })
            fetchAssessments()
        } catch {
            toast({ title: "Error", description: "Failed to delete.", variant: "destructive" })
        }
    }

    const filtered = assessments.filter(a =>
        a.title?.toLowerCase().includes(search.toLowerCase()) ||
        a.domain?.toLowerCase().includes(search.toLowerCase())
    )

    const difficultyColor: Record<string, string> = {
        EASY: "bg-green-100 text-green-700",
        INTERMEDIATE: "bg-yellow-100 text-yellow-700",
        HARD: "bg-red-100 text-red-700"
    }
    const statusColor: Record<string, string> = {
        PUBLISHED: "bg-emerald-100 text-emerald-700",
        DRAFT: "bg-slate-100 text-slate-700",
        ARCHIVED: "bg-orange-100 text-orange-700"
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Campus Assessments</h1>
                    <p className="text-muted-foreground mt-1">Manage technical and aptitude tests for campus hiring drives.</p>
                </div>
                <Button onClick={() => setIsModalOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" /> New Assessment
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: "Total", value: assessments.length, icon: PenLine, color: "text-blue-600 bg-blue-100" },
                    { label: "Published", value: assessments.filter(a => a.status === 'PUBLISHED').length, icon: CheckCircle, color: "text-emerald-600 bg-emerald-100" },
                    { label: "Drafts", value: assessments.filter(a => a.status === 'DRAFT').length, icon: Clock, color: "text-orange-600 bg-orange-100" },
                    { label: "Archived", value: assessments.filter(a => a.status === 'ARCHIVED').length, icon: XCircle, color: "text-slate-600 bg-slate-100" },
                ].map(s => (
                    <Card key={s.label} className="border-0 shadow-sm">
                        <CardContent className="p-4 flex items-center gap-3">
                            <div className={`p-2.5 rounded-xl ${s.color}`}><s.icon className="w-5 h-5" /></div>
                            <div>
                                <p className="text-2xl font-bold">{s.value}</p>
                                <p className="text-xs text-muted-foreground">{s.label}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Card>
                <CardHeader className="pb-4">
                    <div className="relative w-full md:w-72">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Search assessments..." value={search} onChange={e => setSearch(e.target.value)} className="pl-8" />
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {loading ? (
                        <div className="flex items-center justify-center h-48">
                            <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Assessment</TableHead>
                                    <TableHead>Domain</TableHead>
                                    <TableHead>Difficulty</TableHead>
                                    <TableHead>Duration</TableHead>
                                    <TableHead>Questions</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Created</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filtered.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                                            <PenLine className="h-10 w-10 mx-auto mb-3 opacity-30" />
                                            <p className="font-medium">No assessments found</p>
                                            <p className="text-sm mt-1">Create your first campus assessment to get started.</p>
                                        </TableCell>
                                    </TableRow>
                                ) : filtered.map(a => (
                                    <TableRow key={a.id}>
                                        <TableCell className="font-medium">{a.title}</TableCell>
                                        <TableCell><Badge variant="outline">{a.domain}</Badge></TableCell>
                                        <TableCell>
                                            <span className={`text-xs font-semibold px-2 py-1 rounded-full ${difficultyColor[a.difficulty] || ''}`}>
                                                {a.difficulty}
                                            </span>
                                        </TableCell>
                                        <TableCell>{a.duration} min</TableCell>
                                        <TableCell>{a._count?.questions ?? a.totalQuestions ?? 0}</TableCell>
                                        <TableCell>
                                            <span className={`text-xs font-semibold px-2 py-1 rounded-full ${statusColor[a.status] || ''}`}>
                                                {a.status}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground text-sm">
                                            {a.createdAt ? format(new Date(a.createdAt), 'MMM d, yyyy') : '-'}
                                        </TableCell>
                                        <TableCell className="text-right space-x-1">
                                            <Button variant="ghost" size="icon" title="View"><Eye className="w-4 h-4" /></Button>
                                            <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => handleDelete(a.id)}>
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {/* Create Modal */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create Campus Assessment</DialogTitle>
                        <DialogDescription>Add a new test for campus placement drives.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreate} className="space-y-4">
                        <div className="space-y-2">
                            <Label>Assessment Title</Label>
                            <Input required value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="e.g. Core Java Assessment" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Domain</Label>
                                <Select value={form.domain} onValueChange={v => setForm(p => ({ ...p, domain: v }))}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {["IT", "Finance", "Marketing", "Operations", "HR", "General"].map(d => (
                                            <SelectItem key={d} value={d}>{d}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Difficulty</Label>
                                <Select value={form.difficulty} onValueChange={v => setForm(p => ({ ...p, difficulty: v }))}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="EASY">Easy</SelectItem>
                                        <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
                                        <SelectItem value="HARD">Hard</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Duration (minutes)</Label>
                            <Input type="number" min={10} max={180} value={form.duration} onChange={e => setForm(p => ({ ...p, duration: parseInt(e.target.value) || 60 }))} />
                        </div>
                        <div className="space-y-2">
                            <Label>Description (optional)</Label>
                            <Textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Brief description..." rows={3} />
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                            <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Creating..." : "Create Assessment"}</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    )
}
