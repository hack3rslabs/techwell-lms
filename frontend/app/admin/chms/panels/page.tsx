"use client"

import { useEffect, useState } from "react"
import api from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import { Plus, Search, Users, Trash2, Mail, Phone, GraduationCap, Loader2 } from "lucide-react"
import { format } from "date-fns"
import { useToast } from "@/components/ui/use-toast"

interface PanelMember {
    id: string
    name: string
    email?: string
    phone?: string
    designation: string
    expertise: string
    company?: string
    availability: string
    createdAt: string
}

const AVAILABILITY = ["AVAILABLE", "BUSY", "UNAVAILABLE"]
const AVAIL_COLORS: Record<string, string> = {
    AVAILABLE: "bg-green-100 text-green-700",
    BUSY: "bg-yellow-100 text-yellow-700",
    UNAVAILABLE: "bg-red-100 text-red-700"
}

export default function CHMSPanelsPage() {
    const { toast } = useToast()
    const [panels, setPanels] = useState<PanelMember[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState("")
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [form, setForm] = useState({
        name: "", email: "", phone: "", designation: "",
        expertise: "", company: "", availability: "AVAILABLE", notes: ""
    })

    const fetchPanels = async () => {
        try {
            const res = await api.get('/campus-drives/panels')
            setPanels(res.data?.panels || res.data || [])
        } catch { setPanels([]) }
        finally { setLoading(false) }
    }

    useEffect(() => { fetchPanels() }, [])

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        try {
            await api.post('/campus-drives/panels', form)
            toast({ title: "Panel member added", description: "Interviewer has been added to the panel." })
            setIsModalOpen(false)
            setForm({ name: "", email: "", phone: "", designation: "", expertise: "", company: "", availability: "AVAILABLE", notes: "" })
            fetchPanels()
        } catch {
            toast({ title: "Error", description: "Failed to add panel member.", variant: "destructive" })
        } finally { setIsSubmitting(false) }
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Remove this panel member?")) return
        try {
            await api.delete(`/campus-drives/panels/${id}`)
            toast({ title: "Removed", description: "Panel member removed." })
            fetchPanels()
        } catch {
            toast({ title: "Error", description: "Failed to remove.", variant: "destructive" })
        }
    }

    const filtered = panels.filter(p =>
        p.name?.toLowerCase().includes(search.toLowerCase()) ||
        p.expertise?.toLowerCase().includes(search.toLowerCase()) ||
        p.company?.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Interview Panels</h1>
                    <p className="text-muted-foreground mt-1">Manage interviewers and subject matter experts for campus drives.</p>
                </div>
                <Button onClick={() => setIsModalOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" /> Add Panel Member
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
                {[
                    { label: "Total Panelists", value: panels.length, color: "text-blue-600 bg-blue-100" },
                    { label: "Available", value: panels.filter(p => p.availability === 'AVAILABLE').length, color: "text-green-600 bg-green-100" },
                    { label: "Busy", value: panels.filter(p => p.availability === 'BUSY').length, color: "text-yellow-600 bg-yellow-100" },
                ].map(s => (
                    <Card key={s.label} className="border-0 shadow-sm">
                        <CardContent className="p-4 flex items-center gap-3">
                            <div className={`p-2.5 rounded-xl ${s.color}`}><Users className="w-5 h-5" /></div>
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
                        <Input placeholder="Search panelists..." value={search} onChange={e => setSearch(e.target.value)} className="pl-8" />
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {loading ? (
                        <div className="flex items-center justify-center h-48"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Designation</TableHead>
                                    <TableHead>Expertise</TableHead>
                                    <TableHead>Company</TableHead>
                                    <TableHead>Availability</TableHead>
                                    <TableHead>Added</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filtered.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                                            <Users className="h-10 w-10 mx-auto mb-3 opacity-30" />
                                            <p className="font-medium">No panel members added yet</p>
                                            <p className="text-sm mt-1">Add interviewers to build your hiring panel.</p>
                                        </TableCell>
                                    </TableRow>
                                ) : filtered.map(p => (
                                    <TableRow key={p.id}>
                                        <TableCell>
                                            <div className="font-medium">{p.name}</div>
                                            {p.email && <div className="text-xs text-muted-foreground flex items-center gap-1"><Mail className="w-3 h-3" />{p.email}</div>}
                                            {p.phone && <div className="text-xs text-muted-foreground flex items-center gap-1"><Phone className="w-3 h-3" />{p.phone}</div>}
                                        </TableCell>
                                        <TableCell>{p.designation}</TableCell>
                                        <TableCell><Badge variant="outline">{p.expertise}</Badge></TableCell>
                                        <TableCell className="text-muted-foreground">{p.company || '-'}</TableCell>
                                        <TableCell>
                                            <span className={`text-xs font-semibold px-2 py-1 rounded-full ${AVAIL_COLORS[p.availability] || ''}`}>
                                                {p.availability}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                            {p.createdAt ? format(new Date(p.createdAt), 'MMM d, yyyy') : '-'}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => handleDelete(p.id)}>
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

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add Panel Member</DialogTitle>
                        <DialogDescription>Add an interviewer or subject matter expert to your hiring panel.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreate} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Full Name *</Label>
                                <Input required value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Dr. Ramesh Kumar" />
                            </div>
                            <div className="space-y-2">
                                <Label>Designation *</Label>
                                <Input required value={form.designation} onChange={e => setForm(p => ({ ...p, designation: e.target.value }))} placeholder="Senior Engineer" />
                            </div>
                            <div className="space-y-2">
                                <Label>Email</Label>
                                <Input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
                            </div>
                            <div className="space-y-2">
                                <Label>Phone</Label>
                                <Input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} />
                            </div>
                            <div className="space-y-2">
                                <Label>Area of Expertise *</Label>
                                <Input required value={form.expertise} onChange={e => setForm(p => ({ ...p, expertise: e.target.value }))} placeholder="Java, DSA, System Design" />
                            </div>
                            <div className="space-y-2">
                                <Label>Company (optional)</Label>
                                <Input value={form.company} onChange={e => setForm(p => ({ ...p, company: e.target.value }))} placeholder="TCS" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Notes</Label>
                            <Textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} rows={2} placeholder="Any additional information..." />
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                            <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Adding..." : "Add Member"}</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    )
}
