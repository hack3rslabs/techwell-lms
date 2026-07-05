"use client"

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { ArrowLeft, FileText, Send, Edit, Download, CheckCircle, Clock } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import api from '@/lib/api'
import { toast } from 'react-hot-toast'
import DOMPurify from 'isomorphic-dompurify'

export default function ViewAgreement() {
    const params = useParams()
    const router = useRouter()
    const agreementId = params.id as string

    const [agreement, setAgreement] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (agreementId) fetchAgreement()
    }, [agreementId])

    const fetchAgreement = async () => {
        try {
            setLoading(true)
            const res = await api.get(`/crm/agreements/${agreementId}`)
            setAgreement(res.data)
        } catch (error) {
            toast.error("Failed to load agreement")
        } finally {
            setLoading(false)
        }
    }

    const handleSend = async () => {
        try {
            await api.put(`/crm/agreements/${agreementId}`, { ...agreement, status: 'SENT' })
            setAgreement((prev: any) => prev ? { ...prev, status: 'SENT' } : null)
            toast.success("Agreement sent to client successfully!")
            fetchAgreement()
        } catch (error) {
            toast.error("Failed to send agreement")
        }
    }

    if (loading) return <div className="p-10 text-center">Loading Agreement...</div>
    if (!agreement) return <div className="p-10 text-center text-red-500">Agreement not found</div>

    return (
        <div className="space-y-6 pb-20 max-w-5xl mx-auto">
            {/* Header Actions */}
            <div className="flex items-center justify-between border-b pb-4">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.push('/admin/crm/agreements')}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">{agreement.title}</h1>
                        <p className="text-muted-foreground">Client: {agreement.customer?.name} ({agreement.customer?.companyName})</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Badge variant={agreement.status === 'DRAFT' ? 'secondary' : (agreement.status === 'SENT' ? 'default' : 'default')} className="text-sm px-3 py-1 mr-2">
                        {agreement.status}
                    </Badge>
                    
                    <Button variant="outline" onClick={() => router.push(`/admin/crm/agreements/builder?id=${agreement.id}`)}>
                        <Edit className="mr-2 h-4 w-4" /> Edit
                    </Button>
                    
                    {agreement.status === 'DRAFT' && (
                        <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleSend}>
                            <Send className="mr-2 h-4 w-4" /> Send to Client
                        </Button>
                    )}
                </div>
            </div>

            {/* Document Preview */}
            <Card className="shadow-lg border-t-4 border-t-primary">
                <CardHeader className="bg-slate-50 border-b">
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle className="text-xl flex items-center gap-2">
                                <FileText className="h-5 w-5 text-primary" /> 
                                Agreement Document Preview
                            </CardTitle>
                            <CardDescription className="mt-2 text-sm space-y-1">
                                <p><strong>Vertical:</strong> {agreement.vertical}</p>
                                <p><strong>Total Value:</strong> ₹{agreement.totalValue?.toLocaleString()}</p>
                                <p><strong>Tax:</strong> {agreement.taxPercentage}%</p>
                            </CardDescription>
                        </div>
                        <Button variant="outline" size="sm">
                            <Download className="mr-2 h-4 w-4" /> Export PDF
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="p-10 bg-white min-h-[600px]">
                    <div 
                        className="prose prose-slate max-w-none"
                        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(agreement.content) }}
                    />
                </CardContent>
            </Card>
        </div>
    )
}
