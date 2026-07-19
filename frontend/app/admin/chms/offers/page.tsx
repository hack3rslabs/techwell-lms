"use client"

import { useEffect, useState } from "react"
import api from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription
} from "@/components/ui/dialog"
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select"
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table"
import { Plus, Search, Award, CheckCircle, XCircle, Clock, Loader2, Mail, Phone } from "lucide-react"
import { format } from "date-fns"
import { useToast } from "@/components/ui/use-toast"

interface Offer {
    id: string
    studentName: string
    studentEmail?: string
    studentPhone?: string
    company: string
    role: string
    package: string
    status: string
    offerDate: string
    joiningDate?: string
    driveId?: string
    driveTitle?: string
}

const OFFER_STATUS = ["PENDING", "ACCEPTED", "DECLINED", "JOINED", "WITHDRAWN"]
const STATUS_COLORS: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-700",
    ACCEPTED: "bg-emerald-100 text-emerald-700",
    DECLINED: "bg-red-100 text-red-700",
    JOINED: "bg-blue-100 text-blue-700",
    WITHDRAWN: "bg-slate-100 text-slate-700"
}

export default function CHMSOffersPage() {
    const { toast } = useToast()
    const [offers, setOffers] = useState<Offer[]>([])
    const [drives, setDrives] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState("")
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [form, setForm] = useState({
        studentName: "", studentEmail: "", studentPhone: "",
        company: "", role: "", package: "",
        status: "PENDING", offerDate: "", joiningDate: "", driveId: ""
    })

    const fetchData = async () => {
        try {
            const [offersRes, drivesRes] = await Promise.allSettled([
                api.get('/campus-drives/offers'),
                api.get('/campus-drives')
            ])
            if (offersRes.status === 'fulfilled') setOffers(offersRes.value.data?.offers || offersRes.value.data || [])
            if (drivesRes.status === 'fulfilled') setDrives(drivesRes.value.data || [])
        } catch { setOffers([]) }
        finally { setLoading(false) }
    }

    useEffect(() => { fetchData() }, [])

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        try {
            await api.post('/campus-drives/offers', form)
            toast({ title: "Offer recorded", description: "Placement offer has been added." })
            setIsModalOpen(false)
            resetForm()
            fetchData()
        } catch {
            toast({ title: "Error", description: "Failed to record offer.", variant: "destructive" })
        } finally { setIsSubmitting(false) }
    }

    const handleStatusUpdate = async (id: string, status: string) => {
        try {
            await api.patch(`/campus-drives/offers/${id}`, { status })
            toast({ title: "Updated", description: `Offer status changed to ${status}.` })
            fetchData()
        } catch {
            toast({ title: "Error", description: "Failed to update status.", variant: "destructive" })
        }
    }

    const resetForm = () => setForm({
        studentName: "", studentEmail: "", studentPhone: "",
        company: "", role: "", package: "",
        status: "PENDING", offerDate: "", joiningDate: "", driveId: ""
    })

    const filtered = offers.filter(o =>
        o.studentName?.toLowerCase().includes(search.toLowerCase()) ||
        o.company?.toLowerCase().includes(search.toLowerCase()) ||
        o.role?.toLowerCase().includes(search.toLowerCase())
    )

    const stats = {
        total: offers.length,
        accepted: offers.filter(o => o.status === 'ACCEPTED').length,
        joined: offers.filter(o => o.status === 'JOINED').length,
        pending: offers.filter(o => o.status === 'PENDING').length,
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Offers Management</h1>
                    <p className="text-muted-foreground mt-1">Track placement offers, acceptances, and joining status.</p>
                </div>
                <Button onClick={() => setIsModalOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" /> Record Offer
                </Button>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: "Total Offers", value: stats.total, icon: Award, color: "text-purple-600 bg-purple-100" },
                    { label: "Accepted", value: stats.accepted, icon: CheckCircle, color: "text-emerald-600 bg-emerald-100" },
                    { label: "Joined", value: stats.joined, icon: CheckCircle, color: "text-blue-600 bg-blue-100" },
                    { label: "Pending", value: stats.pending, icon: Clock, color: "text-yellow-600 bg-yellow-100" },
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
                        <Input placeholder="Search offers..." value={search} onChange={e => setSearch(e.target.value)} className="pl-8" />
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {loading ? (
                        <div className="flex items-center justify-center h-48"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Student</TableHead>
                                    <TableHead>Company & Role</TableHead>
                                    <TableHead>Package</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Offer Date</TableHead>
                                    <TableHead>Joining Date</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filtered.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                                            <Award className="h-10 w-10 mx-auto mb-3 opacity-30" />
                                            <p className="font-medium">No offers recorded yet</p>
                                            <p className="text-sm mt-1">Record placement offers from campus drives here.</p>
                                        </TableCell>
                                    </TableRow>
                                ) : filtered.map(o => (
                                    <TableRow key={o.id}>
                                        <TableCell>
                                            <div className="font-medium">{o.studentName}</div>
                                            {o.studentEmail && <div className="text-xs text-muted-foreground flex items-center gap-1"><Mail className="w-3 h-3" />{o.studentEmail}</div>}
                                            {o.studentPhone && <div className="text-xs text-muted-foreground flex items-center gap-1"><Phone className="w-3 h-3" />{o.studentPhone}</div>}
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-medium">{o.company}</div>
                                            <div className="text-xs text-muted-foreground">{o.role}</div>
                                        </TableCell>
                                        <TableCell className="font-semibold text-emerald-700">{o.package}</TableCell>
                                        <TableCell>
                                            <span className={`text-xs font-semibold px-2 py-1 rounded-full ${STATUS_COLORS[o.status] || ''}`}>
                                                {o.status}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                            {o.offerDate ? format(new Date(o.offerDate), 'MMM d, yyyy') : '-'}
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                            {o.joiningDate ? format(new Date(o.joiningDate), 'MMM d, yyyy') : '-'}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Select value={o.status} onValueChange={v => handleStatusUpdate(o.id, v)}>
                                                <SelectTrigger className="w-28 h-7 text-xs">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {OFFER_STATUS.map(s => <SelectItem key={s} value={s} className="text-xs">{s}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Record Placement Offer</DialogTitle>
                        <DialogDescription>Add a new offer letter record for a campus placed student.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreate} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Student Name *</Label>
                                <Input required value={form.studentName} onChange={e => setForm(p => ({ ...p, studentName: e.target.value }))} placeholder="John Doe" />
                            </div>
                            <div className="space-y-2">
                                <Label>Email</Label>
                                <Input type="email" value={form.studentEmail} onChange={e => setForm(p => ({ ...p, studentEmail: e.target.value }))} placeholder="john@example.com" />
                            </div>
                            <div className="space-y-2">
                                <Label>Phone</Label>
                                <Input value={form.studentPhone} onChange={e => setForm(p => ({ ...p, studentPhone: e.target.value }))} placeholder="+91 9876543210" />
                            </div>
                            <div className="space-y-2">
                                <Label>Company *</Label>
                                <Input required value={form.company} onChange={e => setForm(p => ({ ...p, company: e.target.value }))} placeholder="TCS" />
                            </div>
                            <div className="space-y-2">
                                <Label>Role *</Label>
                                <Input required value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))} placeholder="Software Engineer" />
                            </div>
                            <div className="space-y-2">
                                <Label>Package (CTC) *</Label>
                                <Input required value={form.package} onChange={e => setForm(p => ({ ...p, package: e.target.value }))} placeholder="4.5 LPA" />
                            </div>
                            <div className="space-y-2">
                                <Label>Offer Date</Label>
                                <Input type="date" value={form.offerDate} onChange={e => setForm(p => ({ ...p, offerDate: e.target.value }))} />
                            </div>
                            <div className="space-y-2">
                                <Label>Joining Date</Label>
                                <Input type="date" value={form.joiningDate} onChange={e => setForm(p => ({ ...p, joiningDate: e.target.value }))} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Campus Drive (Optional)</Label>
                            <Select value={form.driveId} onValueChange={v => setForm(p => ({ ...p, driveId: v }))}>
                                <SelectTrigger><SelectValue placeholder="Link to a drive..." /></SelectTrigger>
                                <SelectContent>
                                    {drives.map(d => <SelectItem key={d.id} value={d.id}>{d.title}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                            <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Saving..." : "Record Offer"}</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    )
}
