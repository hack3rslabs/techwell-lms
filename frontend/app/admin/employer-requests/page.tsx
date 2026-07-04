"use client"

import React, { useCallback, useEffect, useMemo, useState } from "react"
import {
    Building2,
    Calendar,
    CheckCircle,
    Clock,
    ExternalLink,
    Loader2,
    Mail,
    MapPin,
    Phone,
    RotateCcw,
    XCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { employerRequestApi } from "@/lib/api"

type RequestStatus = "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED_APPROVAL"
type FilterStatus = "ALL" | RequestStatus

interface EmployerRequest {
    id: string
    employerName: string
    companyName: string
    email: string
    phone: string
    website?: string
    address: string
    status: RequestStatus
    adminNotes?: string
    rejectionReason?: string
    createdAt: string
    updatedAt: string
}

const filters: FilterStatus[] = ["ALL", "PENDING", "APPROVED", "REJECTED", "CANCELLED_APPROVAL"]

export default function EmployerRequestsPage() {
    const { toast } = useToast()
    const [requests, setRequests] = useState<EmployerRequest[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [filterStatus, setFilterStatus] = useState<FilterStatus>("ALL")
    const [actionLoading, setActionLoading] = useState<string | null>(null)
    const [approveRequest, setApproveRequest] = useState<EmployerRequest | null>(null)
    const [rejectRequest, setRejectRequest] = useState<EmployerRequest | null>(null)
    const [adminNotes, setAdminNotes] = useState("")
    const [rejectionReason, setRejectionReason] = useState("")

    const fetchRequests = useCallback(async () => {
        setIsLoading(true)
        try {
            const response = await employerRequestApi.getAll()
            setRequests(response.data.data || [])
        } catch {
            toast({
                title: "Error",
                description: "Failed to fetch employer requests.",
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }, [toast])

    useEffect(() => {
        void fetchRequests()
    }, [fetchRequests])

    const counts = useMemo(() => Object.fromEntries(
        filters.map(status => [
            status,
            status === "ALL" ? requests.length : requests.filter(request => request.status === status).length,
        ])
    ), [requests])

    const filteredRequests = useMemo(
        () => filterStatus === "ALL" ? requests : requests.filter(request => request.status === filterStatus),
        [filterStatus, requests]
    )

    const handleApprove = async () => {
        if (!approveRequest) return
        setActionLoading(approveRequest.id)
        try {
            await employerRequestApi.approve(approveRequest.id, { adminNotes: adminNotes || undefined })
            toast({ title: "Approved", description: "Employer login access is now enabled." })
            setApproveRequest(null)
            setAdminNotes("")
            await fetchRequests()
        } catch (error: unknown) {
            toast({
                title: "Approval failed",
                description: getApiMessage(error, "Failed to approve employer request."),
                variant: "destructive",
            })
        } finally {
            setActionLoading(null)
        }
    }

    const handleReject = async () => {
        if (!rejectRequest || !rejectionReason.trim()) return
        setActionLoading(rejectRequest.id)
        try {
            await employerRequestApi.reject(rejectRequest.id, { rejectionReason: rejectionReason.trim() })
            toast({ title: "Rejected", description: "No employer login account was enabled." })
            setRejectRequest(null)
            setRejectionReason("")
            await fetchRequests()
        } catch (error: unknown) {
            toast({
                title: "Rejection failed",
                description: getApiMessage(error, "Failed to reject employer request."),
                variant: "destructive",
            })
        } finally {
            setActionLoading(null)
        }
    }

    const handleCancelApproval = async (request: EmployerRequest) => {
        if (!window.confirm(`Cancel approval for ${request.companyName}? Their login and job-posting access will be disabled.`)) {
            return
        }

        setActionLoading(request.id)
        try {
            await employerRequestApi.cancelApproval(request.id)
            toast({ title: "Approval cancelled", description: "Employer login access has been disabled." })
            await fetchRequests()
        } catch (error: unknown) {
            toast({
                title: "Cancellation failed",
                description: getApiMessage(error, "Failed to cancel employer approval."),
                variant: "destructive",
            })
        } finally {
            setActionLoading(null)
        }
    }

    return (
        <div className="mx-auto max-w-7xl space-y-6 p-6">
            <div>
                <h1 className="text-3xl font-bold">Employer Requests</h1>
                <p className="mt-2 text-muted-foreground">
                    Review company access requests. Historical approved, rejected, and cancelled requests remain visible.
                </p>
            </div>

            <div className="flex flex-wrap gap-2 border-b pb-3">
                {filters.map(status => (
                    <Button
                        key={status}
                        variant={filterStatus === status ? "default" : "ghost"}
                        onClick={() => setFilterStatus(status)}
                    >
                        {formatStatus(status)}
                        <span className="ml-2 opacity-70">{counts[status] || 0}</span>
                    </Button>
                ))}
            </div>

            {isLoading ? (
                <div className="flex justify-center py-16">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            ) : filteredRequests.length === 0 ? (
                <Card>
                    <CardContent className="py-14 text-center">
                        <Building2 className="mx-auto mb-4 h-12 w-12 text-muted-foreground/40" />
                        <h2 className="text-lg font-semibold">No employer requests</h2>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4">
                    {filteredRequests.map(request => (
                        <Card key={request.id}>
                            <CardContent className="p-6">
                                <div className="flex flex-col justify-between gap-4 md:flex-row">
                                    <div>
                                        <div className="flex flex-wrap items-center gap-3">
                                            <h2 className="text-xl font-bold">{request.companyName}</h2>
                                            <StatusBadge status={request.status} />
                                        </div>
                                        <p className="mt-1 text-sm text-muted-foreground">{request.employerName}</p>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <Calendar className="h-4 w-4" />
                                        {new Date(request.createdAt).toLocaleString()}
                                    </div>
                                </div>

                                <Separator className="my-5" />

                                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                                    <Info icon={Mail} label="Business email" value={request.email} />
                                    <Info icon={Phone} label="Phone" value={request.phone} />
                                    <Info icon={MapPin} label="Address" value={request.address} />
                                    <div className="flex gap-3">
                                        <ExternalLink className="mt-1 h-4 w-4 shrink-0 text-muted-foreground" />
                                        <div>
                                            <p className="text-xs text-muted-foreground">Website</p>
                                            {request.website ? (
                                                <a className="break-all font-medium text-primary hover:underline" href={request.website} target="_blank" rel="noreferrer">
                                                    {request.website}
                                                </a>
                                            ) : <p className="font-medium">Not provided</p>}
                                        </div>
                                    </div>
                                </div>

                                {request.adminNotes && (
                                    <div className="mt-5 rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-900">
                                        <strong>Admin notes:</strong> {request.adminNotes}
                                    </div>
                                )}
                                {request.rejectionReason && (
                                    <div className="mt-5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-900">
                                        <strong>Rejection reason:</strong> {request.rejectionReason}
                                    </div>
                                )}

                                <div className="mt-5 flex flex-wrap gap-3">
                                    {(request.status === "PENDING" || request.status === "CANCELLED_APPROVAL") && (
                                        <>
                                            <Button size="sm" onClick={() => setApproveRequest(request)}>
                                                <CheckCircle className="mr-2 h-4 w-4" /> Approve
                                            </Button>
                                            <Button size="sm" variant="destructive" onClick={() => setRejectRequest(request)}>
                                                <XCircle className="mr-2 h-4 w-4" /> Reject
                                            </Button>
                                        </>
                                    )}
                                    {request.status === "APPROVED" && (
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            disabled={actionLoading === request.id}
                                            onClick={() => handleCancelApproval(request)}
                                        >
                                            {actionLoading === request.id
                                                ? <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                : <RotateCcw className="mr-2 h-4 w-4" />}
                                            Cancel Approval
                                        </Button>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            <Dialog open={!!approveRequest} onOpenChange={open => !open && setApproveRequest(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Approve employer request</DialogTitle>
                        <DialogDescription>
                            This enables login and job-posting access for {approveRequest?.companyName}.
                        </DialogDescription>
                    </DialogHeader>
                    <Textarea
                        placeholder="Admin notes (optional)"
                        value={adminNotes}
                        onChange={event => setAdminNotes(event.target.value)}
                    />
                    <div className="flex justify-end gap-3">
                        <Button variant="outline" onClick={() => setApproveRequest(null)}>Cancel</Button>
                        <Button onClick={handleApprove} disabled={actionLoading === approveRequest?.id}>
                            {actionLoading === approveRequest?.id && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Approve
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={!!rejectRequest} onOpenChange={open => !open && setRejectRequest(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Reject employer request</DialogTitle>
                        <DialogDescription>
                            Provide a reason for rejecting {rejectRequest?.companyName}.
                        </DialogDescription>
                    </DialogHeader>
                    <Textarea
                        placeholder="Rejection reason"
                        value={rejectionReason}
                        onChange={event => setRejectionReason(event.target.value)}
                    />
                    <div className="flex justify-end gap-3">
                        <Button variant="outline" onClick={() => setRejectRequest(null)}>Cancel</Button>
                        <Button
                            variant="destructive"
                            onClick={handleReject}
                            disabled={actionLoading === rejectRequest?.id || !rejectionReason.trim()}
                        >
                            {actionLoading === rejectRequest?.id && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Reject
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}

function getApiMessage(error: unknown, fallback: string) {
    return (error as { response?: { data?: { message?: string; error?: string } } })?.response?.data?.message
        || (error as { response?: { data?: { error?: string } } })?.response?.data?.error
        || fallback
}

function formatStatus(status: FilterStatus) {
    if (status === "ALL") return "All"
    return status.split("_").map(part => part[0] + part.slice(1).toLowerCase()).join(" ")
}

function StatusBadge({ status }: { status: RequestStatus }) {
    const styles: Record<RequestStatus, string> = {
        PENDING: "border-yellow-300 bg-yellow-50 text-yellow-800",
        APPROVED: "border-green-300 bg-green-50 text-green-800",
        REJECTED: "border-red-300 bg-red-50 text-red-800",
        CANCELLED_APPROVAL: "border-slate-300 bg-slate-100 text-slate-700",
    }
    const Icon = status === "APPROVED"
        ? CheckCircle
        : status === "REJECTED"
            ? XCircle
            : status === "CANCELLED_APPROVAL"
                ? RotateCcw
                : Clock

    return (
        <Badge variant="outline" className={styles[status]}>
            <Icon className="mr-1 h-3 w-3" />
            {formatStatus(status)}
        </Badge>
    )
}

function Info({
    icon: Icon,
    label,
    value,
}: {
    icon: React.ComponentType<{ className?: string }>
    label: string
    value: string
}) {
    return (
        <div className="flex gap-3">
            <Icon className="mt-1 h-4 w-4 shrink-0 text-muted-foreground" />
            <div>
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="break-words font-medium">{value}</p>
            </div>
        </div>
    )
}
