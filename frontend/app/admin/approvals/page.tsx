"use client"
import * as React from "react"
import { useState, useEffect, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { toast } from "@/components/ui/use-toast"
import {
    CheckCircle, XCircle, Clock, Search, RefreshCcw, Users, Building2,
    GraduationCap, Briefcase, UserCog, Filter, Eye, AlertCircle, Loader2
} from "lucide-react"
import api from "@/lib/api"

type ApprovalRequest = {
    id: string
    entityType: string
    requesterName: string
    requesterEmail: string
    requesterPhone: string
    payload: Record<string, unknown>
    status: string
    adminNotes: string | null
    rejectionReason: string | null
    createdAt: string
}

const ENTITY_CONFIG: Record<string, { label: string; icon: React.ElementType; color: string }> = {
    EMPLOYER: { label: "Employer", icon: Briefcase, color: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
    COMPANY: { label: "Company", icon: Building2, color: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20" },
    COLLEGE: { label: "College", icon: GraduationCap, color: "bg-purple-500/10 text-purple-400 border-purple-500/20" },
    INSTITUTE: { label: "Institute", icon: GraduationCap, color: "bg-violet-500/10 text-violet-400 border-violet-500/20" },
    FRANCHISE: { label: "Franchise", icon: Building2, color: "bg-orange-500/10 text-orange-400 border-orange-500/20" },
    STAFF: { label: "Staff", icon: UserCog, color: "bg-teal-500/10 text-teal-400 border-teal-500/20" },
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
    PENDING: { label: "Pending", color: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
    APPROVED: { label: "Approved", color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
    REJECTED: { label: "Rejected", color: "bg-red-500/10 text-red-400 border-red-500/20" },
}

export default function ApprovalCenterPage() {
    const [requests, setRequests] = useState<ApprovalRequest[]>([])
    const [loading, setLoading] = useState(true)
    const [statusFilter, setStatusFilter] = useState("PENDING")
    const [typeFilter, setTypeFilter] = useState("ALL")
    const [searchQuery, setSearchQuery] = useState("")

    // Detail / Action Modal
    const [selectedReq, setSelectedReq] = useState<ApprovalRequest | null>(null)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [adminNotes, setAdminNotes] = useState("")
    const [rejectionReason, setRejectionReason] = useState("")
    const [actionLoading, setActionLoading] = useState(false)

    const fetchRequests = useCallback(async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams()
            if (statusFilter !== "ALL") params.append("status", statusFilter)
            if (typeFilter !== "ALL") params.append("type", typeFilter)
            const res = await api.get(`/approvals?${params.toString()}`)
            setRequests(res.data.requests || [])
        } catch (err) {
            console.error(err)
            toast({ title: "Failed to load requests", variant: "destructive" })
        } finally {
            setLoading(false)
        }
    }, [statusFilter, typeFilter])

    useEffect(() => { fetchRequests() }, [fetchRequests])

    const openModal = (req: ApprovalRequest) => {
        setSelectedReq(req)
        setAdminNotes(req.adminNotes || "")
        setRejectionReason(req.rejectionReason || "")
        setIsModalOpen(true)
    }

    const handleAction = async (status: "APPROVED" | "REJECTED") => {
        if (!selectedReq) return
        setActionLoading(true)
        try {
            await api.patch(`/approvals/${selectedReq.id}/status`, {
                status,
                adminNotes,
                rejectionReason: status === "REJECTED" ? rejectionReason : undefined
            })
            toast({
                title: status === "APPROVED" ? "✅ Request Approved!" : "❌ Request Rejected",
                description: `${selectedReq.requesterName}'s ${selectedReq.entityType} access has been ${status.toLowerCase()}.`
            })
            setIsModalOpen(false)
            fetchRequests()
        } catch (err) {
            console.error(err)
            toast({ title: "Action failed", variant: "destructive" })
        } finally {
            setActionLoading(false)
        }
    }

    const filtered = requests.filter(r => {
        if (!searchQuery) return true
        const q = searchQuery.toLowerCase()
        return r.requesterName.toLowerCase().includes(q) ||
            r.requesterEmail.toLowerCase().includes(q) ||
            r.entityType.toLowerCase().includes(q)
    })

    const counts = {
        all: requests.length,
        pending: requests.filter(r => r.status === "PENDING").length,
        approved: requests.filter(r => r.status === "APPROVED").length,
        rejected: requests.filter(r => r.status === "REJECTED").length,
    }

    return (
        <div className="space-y-6 p-2 md:p-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tight">
                        Approval <span className="text-primary">Center</span>
                    </h1>
                    <p className="text-muted-foreground text-sm mt-1">
                        Manage all access requests — Employers, Franchises, Colleges, Staff, and more.
                    </p>
                </div>
                <Button variant="outline" size="sm" onClick={fetchRequests} disabled={loading}>
                    <RefreshCcw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                </Button>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: "Total", count: counts.all, icon: Users, color: "text-blue-400", bg: "bg-blue-500/10" },
                    { label: "Pending", count: counts.pending, icon: Clock, color: "text-amber-400", bg: "bg-amber-500/10" },
                    { label: "Approved", count: counts.approved, icon: CheckCircle, color: "text-emerald-400", bg: "bg-emerald-500/10" },
                    { label: "Rejected", count: counts.rejected, icon: XCircle, color: "text-red-400", bg: "bg-red-500/10" },
                ].map(({ label, count, icon: Icon, color, bg }) => (
                    <Card key={label} className="glass-card border-white/10">
                        <CardContent className="pt-6 flex items-center gap-3">
                            <div className={`p-2.5 rounded-xl ${bg} ${color}`}>
                                <Icon className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-2xl font-black">{count}</p>
                                <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">{label}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Filters */}
            <Card className="glass-card border-white/10">
                <CardContent className="pt-4 pb-4 flex flex-col md:flex-row gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by name, email, or type..."
                            className="pl-10 glass-input rounded-xl"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-full md:w-44 glass-input rounded-xl border-white/10">
                            <Filter className="h-4 w-4 mr-2" /><SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#111] border-white/10">
                            <SelectItem value="ALL">All Statuses</SelectItem>
                            <SelectItem value="PENDING">Pending</SelectItem>
                            <SelectItem value="APPROVED">Approved</SelectItem>
                            <SelectItem value="REJECTED">Rejected</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                        <SelectTrigger className="w-full md:w-44 glass-input rounded-xl border-white/10">
                            <SelectValue placeholder="All Types" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#111] border-white/10">
                            <SelectItem value="ALL">All Types</SelectItem>
                            <SelectItem value="EMPLOYER">Employer</SelectItem>
                            <SelectItem value="COMPANY">Company</SelectItem>
                            <SelectItem value="COLLEGE">College</SelectItem>
                            <SelectItem value="INSTITUTE">Institute</SelectItem>
                            <SelectItem value="FRANCHISE">Franchise</SelectItem>
                            <SelectItem value="STAFF">Staff</SelectItem>
                        </SelectContent>
                    </Select>
                </CardContent>
            </Card>

            {/* Requests Table */}
            <Card className="glass-card border-white/10 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-white/5 text-muted-foreground">
                            <tr>
                                <th className="p-4 text-left text-[10px] font-bold uppercase tracking-wider">Requester</th>
                                <th className="p-4 text-left text-[10px] font-bold uppercase tracking-wider">Type</th>
                                <th className="p-4 text-left text-[10px] font-bold uppercase tracking-wider">Contact</th>
                                <th className="p-4 text-left text-[10px] font-bold uppercase tracking-wider">Status</th>
                                <th className="p-4 text-left text-[10px] font-bold uppercase tracking-wider">Submitted</th>
                                <th className="p-4 text-right text-[10px] font-bold uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="p-16 text-center">
                                        <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
                                        <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold animate-pulse">Loading requests...</p>
                                    </td>
                                </tr>
                            ) : filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="p-16 text-center opacity-50">
                                        <AlertCircle className="h-12 w-12 mx-auto mb-3 opacity-30" />
                                        <p className="font-bold text-sm">No requests found</p>
                                        <p className="text-xs text-muted-foreground mt-1">Try adjusting your filters.</p>
                                    </td>
                                </tr>
                            ) : filtered.map(req => {
                                const entityConf = ENTITY_CONFIG[req.entityType] || { label: req.entityType, icon: Users, color: "bg-white/10 text-white" }
                                const statusConf = STATUS_CONFIG[req.status] || { label: req.status, color: "bg-white/10 text-white" }
                                const EntityIcon = entityConf.icon
                                return (
                                    <tr key={req.id} className="hover:bg-white/5 transition-colors group">
                                        <td className="p-4">
                                            <div className="font-bold text-sm">{req.requesterName}</div>
                                            <div className="text-xs text-muted-foreground">{req.requesterEmail}</div>
                                        </td>
                                        <td className="p-4">
                                            <Badge className={`${entityConf.color} border text-[10px] font-bold uppercase gap-1`}>
                                                <EntityIcon className="h-3 w-3" />
                                                {entityConf.label}
                                            </Badge>
                                        </td>
                                        <td className="p-4 text-sm text-muted-foreground">{req.requesterPhone}</td>
                                        <td className="p-4">
                                            <Badge className={`${statusConf.color} border text-[10px] font-bold uppercase`}>
                                                {statusConf.label}
                                            </Badge>
                                        </td>
                                        <td className="p-4 text-xs text-muted-foreground">
                                            {new Date(req.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex items-center gap-2 justify-end">
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    className="h-8 text-xs hover:bg-white/10"
                                                    onClick={() => openModal(req)}
                                                >
                                                    <Eye className="h-3.5 w-3.5 mr-1" /> Review
                                                </Button>
                                                {req.status === "PENDING" && (
                                                    <>
                                                        <Button
                                                            size="sm"
                                                            className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                                                            onClick={() => openModal(req)}
                                                        >
                                                            <CheckCircle className="h-3.5 w-3.5 mr-1" /> Approve
                                                        </Button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Review Modal */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="bg-[#0d0d0f] border-white/10 text-foreground max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-black flex items-center gap-2">
                            <span>Review Request</span>
                            {selectedReq && (
                                <Badge className={`${(ENTITY_CONFIG[selectedReq.entityType] || { color: '' }).color} border text-[10px]`}>
                                    {selectedReq.entityType}
                                </Badge>
                            )}
                        </DialogTitle>
                        <DialogDescription className="text-muted-foreground">
                            Carefully review the submission before granting access permissions.
                        </DialogDescription>
                    </DialogHeader>

                    {selectedReq && (
                        <div className="space-y-5 py-4">
                            {/* Requester Info */}
                            <div className="grid grid-cols-2 gap-4 bg-white/5 p-4 rounded-xl">
                                <div>
                                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Name</p>
                                    <p className="font-bold mt-0.5">{selectedReq.requesterName}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Email</p>
                                    <p className="font-bold mt-0.5 text-primary">{selectedReq.requesterEmail}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Phone</p>
                                    <p className="font-bold mt-0.5">{selectedReq.requesterPhone}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Submitted</p>
                                    <p className="font-bold mt-0.5">{new Date(selectedReq.createdAt).toLocaleString()}</p>
                                </div>
                            </div>

                            {/* Payload Data */}
                            {selectedReq.payload && Object.keys(selectedReq.payload).length > 0 && (
                                <div>
                                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-2">Additional Details</p>
                                    <div className="grid grid-cols-2 gap-3 bg-white/5 p-4 rounded-xl">
                                        {Object.entries(selectedReq.payload).map(([key, val]) => (
                                            key !== 'passwordHash' && key !== 'password' && (
                                                <div key={key}>
                                                    <p className="text-[10px] text-muted-foreground capitalize">{key.replace(/([A-Z])/g, ' $1')}</p>
                                                    <p className="text-sm font-medium mt-0.5 truncate">{String(val)}</p>
                                                </div>
                                            )
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Admin Notes */}
                            <div className="space-y-2">
                                <label className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Admin Notes (optional)</label>
                                <Textarea
                                    placeholder="Add any internal notes about this approval..."
                                    value={adminNotes}
                                    onChange={e => setAdminNotes(e.target.value)}
                                    className="glass-input border-white/10 rounded-xl text-sm"
                                    rows={2}
                                />
                            </div>

                            {/* Rejection Reason (shown when rejecting) */}
                            <div className="space-y-2">
                                <label className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Rejection Reason (if rejecting)</label>
                                <Textarea
                                    placeholder="Explain why this request is being rejected..."
                                    value={rejectionReason}
                                    onChange={e => setRejectionReason(e.target.value)}
                                    className="glass-input border-white/10 rounded-xl text-sm"
                                    rows={2}
                                />
                            </div>
                        </div>
                    )}

                    <DialogFooter className="flex gap-3">
                        <Button variant="ghost" onClick={() => setIsModalOpen(false)} className="rounded-xl hover:bg-white/5">
                            Cancel
                        </Button>
                        {selectedReq?.status === "PENDING" && (
                            <>
                                <Button
                                    variant="destructive"
                                    className="rounded-xl"
                                    onClick={() => handleAction("REJECTED")}
                                    disabled={actionLoading}
                                >
                                    {actionLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <XCircle className="h-4 w-4 mr-2" />}
                                    Reject
                                </Button>
                                <Button
                                    className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white"
                                    onClick={() => handleAction("APPROVED")}
                                    disabled={actionLoading}
                                >
                                    {actionLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle className="h-4 w-4 mr-2" />}
                                    Approve & Grant Access
                                </Button>
                            </>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

