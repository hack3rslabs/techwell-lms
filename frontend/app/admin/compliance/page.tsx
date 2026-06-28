"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Loader2, ShieldCheck, Trash2, Mail, XCircle } from 'lucide-react'
import { gdprAdminApi } from '@/lib/api'
import { toast } from 'sonner'
import { format } from 'date-fns'

interface GdprRequest {
    id: string
    name: string
    email: string
    deleteRequestDate: string
    subscribedToNewsletter: boolean
}

export default function CompliancePage() {
    const [requests, setRequests] = useState<GdprRequest[]>([])
    const [isLoading, setIsLoading] = useState(true)

    const fetchRequests = async () => {
        try {
            const res = await gdprAdminApi.getRequests()
            if (res.data.success) {
                setRequests(res.data.data)
            }
        } catch (error) {
            toast.error('Failed to load GDPR requests')
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchRequests()
    }, [])

    const handleProcess = async (id: string, action: 'PROCESS' | 'CANCEL') => {
        const confirmMsg = action === 'PROCESS' 
            ? 'Are you sure you want to process this deletion? The user will be anonymized and deactivated permanently.' 
            : 'Are you sure you want to cancel this deletion request?'
            
        if (!confirm(confirmMsg)) return

        try {
            await gdprAdminApi.processRequest(id, action)
            toast.success(`Request ${action === 'PROCESS' ? 'processed' : 'cancelled'} successfully.`)
            fetchRequests()
        } catch (error) {
            toast.error('Failed to process request')
        }
    }

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">GDPR & Compliance</h1>
                <p className="text-muted-foreground mt-2">Manage user data deletion requests and privacy preferences.</p>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <ShieldCheck className="h-5 w-5 text-primary" />
                        <CardTitle>Pending Data Deletion Requests</CardTitle>
                    </div>
                    <CardDescription>
                        Users who have requested permanent account deletion. By policy, these must be processed within 3 business days.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {requests.length === 0 ? (
                        <div className="text-center p-6 text-muted-foreground border rounded-lg bg-muted/20">
                            No pending deletion requests.
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {requests.map(req => (
                                <div key={req.id} className="flex flex-col md:flex-row md:items-center justify-between p-4 border rounded-lg gap-4">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-semibold text-lg">{req.name}</h3>
                                            {!req.subscribedToNewsletter && (
                                                <Badge variant="outline" className="text-xs">
                                                    <Mail className="h-3 w-3 mr-1" /> Unsubscribed
                                                </Badge>
                                            )}
                                        </div>
                                        <p className="text-sm text-muted-foreground">{req.email}</p>
                                        <p className="text-xs font-medium text-destructive mt-1">
                                            Requested on: {format(new Date(req.deleteRequestDate), 'PPP')}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button 
                                            variant="outline" 
                                            size="sm"
                                            onClick={() => handleProcess(req.id, 'CANCEL')}
                                        >
                                            <XCircle className="h-4 w-4 mr-2" />
                                            Cancel Request
                                        </Button>
                                        <Button 
                                            variant="destructive" 
                                            size="sm"
                                            onClick={() => handleProcess(req.id, 'PROCESS')}
                                        >
                                            <Trash2 className="h-4 w-4 mr-2" />
                                            Process Deletion
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
