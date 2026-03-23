'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/use-toast'
import api from '@/lib/api'
import { Mail, Phone, Building2, Calendar, CheckCircle, XCircle, Clock, Loader2 } from 'lucide-react'

interface EmployerRequest {
  id: string
  name: string
  designation: string
  email: string
  phone?: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  adminNotes?: string
  rejectionReason?: string
  createdAt: string
  updatedAt: string
}

export default function EmployerRequestsPage() {
  const { toast } = useToast()
  const [requests, setRequests] = useState<EmployerRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING')
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [selectedRequest, setSelectedRequest] = useState<EmployerRequest | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [adminNotes, setAdminNotes] = useState('')

  useEffect(() => {
    fetchRequests()
  }, [filterStatus])

  const fetchRequests = async () => {
    setIsLoading(true)
    try {
      const params = filterStatus === 'ALL' ? {} : { status: filterStatus }
      const response = await api.get('/employer-requests', { params })
      setRequests(response.data.data || [])
    } catch (error) {
      console.error('Failed to fetch employer requests:', error)
      toast({
        title: 'Error',
        description: 'Failed to fetch employer requests',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleApprove = async (request: EmployerRequest) => {
    setActionLoading(request.id)
    try {
      const response = await api.put(`/employer-requests/${request.id}/approve`, {
        adminNotes: adminNotes || null,
      })

      toast({
        title: 'Success',
        description: 'Employer request approved successfully',
      })

      // Refresh the list
      await fetchRequests()
      setAdminNotes('')
    } catch (error: any) {
      console.error('Failed to approve request:', error)
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to approve request',
        variant: 'destructive',
      })
    } finally {
      setActionLoading(null)
    }
  }

  const handleReject = async (request: EmployerRequest) => {
    if (!rejectionReason.trim()) {
      toast({
        title: 'Error',
        description: 'Rejection reason is required',
        variant: 'destructive',
      })
      return
    }

    setActionLoading(request.id)
    try {
      const response = await api.put(`/employer-requests/${request.id}/reject`, {
        rejectionReason: rejectionReason.trim(),
      })

      toast({
        title: 'Success',
        description: 'Employer request rejected',
      })

      // Refresh the list
      await fetchRequests()
      setRejectionReason('')
      setSelectedRequest(null)
    } catch (error: any) {
      console.error('Failed to reject request:', error)
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to reject request',
        variant: 'destructive',
      })
    } finally {
      setActionLoading(null)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300"><Clock className="h-3 w-3 mr-1" /> Pending</Badge>
      case 'APPROVED':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300"><CheckCircle className="h-3 w-3 mr-1" /> Approved</Badge>
      case 'REJECTED':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300"><XCircle className="h-3 w-3 mr-1" /> Rejected</Badge>
      default:
        return null
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const filteredRequests = requests.filter(req =>
    filterStatus === 'ALL' || req.status === filterStatus
  )

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Employer Requests</h1>
        <p className="text-muted-foreground mt-2">
          Manage and approve employer requests to post jobs on TechWell
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-4 border-b">
        {(['PENDING', 'APPROVED', 'REJECTED', 'ALL'] as const).map(status => (
          <Button
            key={status}
            variant={filterStatus === status ? 'default' : 'ghost'}
            onClick={() => setFilterStatus(status)}
            className="text-base"
          >
            {status === 'ALL' ? 'All' : status.charAt(0) + status.slice(1).toLowerCase()}
            <span className="ml-2 text-sm opacity-70">
              {status === 'ALL'
                ? requests.length
                : requests.filter(r => r.status === status).length}
            </span>
          </Button>
        ))}
      </div>

      {/* Requests List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : filteredRequests.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-40" />
            <h3 className="text-lg font-semibold mb-2">No employer requests</h3>
            <p className="text-muted-foreground">
              {filterStatus === 'PENDING'
                ? 'No pending employer requests at this time'
                : `No ${filterStatus.toLowerCase()} employer requests`}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredRequests.map(request => (
            <Card key={request.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold">{request.name}</h3>
                      {getStatusBadge(request.status)}
                    </div>
                    <p className="text-sm text-muted-foreground">{request.designation}</p>
                  </div>
                  <div className="text-right text-xs text-muted-foreground">
                    <div className="flex items-center gap-1 mb-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(request.createdAt)}
                    </div>
                  </div>
                </div>

                <Separator className="my-4" />

                {/* Contact Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Email</p>
                      <p className="font-medium break-all">{request.email}</p>
                    </div>
                  </div>
                  {request.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Phone</p>
                        <p className="font-medium">{request.phone}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Admin Notes (if approved) */}
                {request.status === 'APPROVED' && request.adminNotes && (
                  <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded p-3 mb-4">
                    <p className="text-xs font-semibold text-blue-900 dark:text-blue-200 mb-1">Admin Notes</p>
                    <p className="text-sm text-blue-800 dark:text-blue-300">{request.adminNotes}</p>
                  </div>
                )}

                {/* Rejection Reason (if rejected) */}
                {request.status === 'REJECTED' && request.rejectionReason && (
                  <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded p-3 mb-4">
                    <p className="text-xs font-semibold text-red-900 dark:text-red-200 mb-1">Rejection Reason</p>
                    <p className="text-sm text-red-800 dark:text-red-300">{request.rejectionReason}</p>
                  </div>
                )}

                {/* Action Buttons */}
                {request.status === 'PENDING' && (
                  <div className="flex gap-3 mt-4">
                    {/* Approve Dialog */}
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="default"
                          size="sm"
                          className="gap-2"
                        >
                          <CheckCircle className="h-4 w-4" />
                          Approve
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Approve Employer Request</DialogTitle>
                          <DialogDescription>
                            Approve the request from {request.name} to enable job posting
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <p className="text-sm font-medium mb-2">Admin Notes (Optional)</p>
                            <Textarea
                              placeholder="Add any notes for your records..."
                              value={adminNotes}
                              onChange={(e) => setAdminNotes(e.target.value)}
                              className="min-h-24"
                            />
                          </div>
                          <div className="flex justify-end gap-3">
                            <Button variant="outline" onClick={() => {
                              setAdminNotes('')
                            }}>
                              Cancel
                            </Button>
                            <Button
                              onClick={() => handleApprove(request)}
                              disabled={actionLoading === request.id}
                            >
                              {actionLoading === request.id ? 'Approving...' : 'Approve Request'}
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>

                    {/* Reject Dialog */}
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="destructive"
                          size="sm"
                          className="gap-2"
                        >
                          <XCircle className="h-4 w-4" />
                          Reject
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Reject Employer Request</DialogTitle>
                          <DialogDescription>
                            Provide a reason for rejecting {request.name}'s request
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <p className="text-sm font-medium mb-2">Rejection Reason *</p>
                            <Textarea
                              placeholder="Please explain why this request is being rejected..."
                              value={rejectionReason}
                              onChange={(e) => setRejectionReason(e.target.value)}
                              className="min-h-24"
                            />
                          </div>
                          <div className="flex justify-end gap-3">
                            <Button variant="outline" onClick={() => {
                              setRejectionReason('')
                            }}>
                              Cancel
                            </Button>
                            <Button
                              variant="destructive"
                              onClick={() => handleReject(request)}
                              disabled={actionLoading === request.id || !rejectionReason.trim()}
                            >
                              {actionLoading === request.id ? 'Rejecting...' : 'Confirm Rejection'}
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
