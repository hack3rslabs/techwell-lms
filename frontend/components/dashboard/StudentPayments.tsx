'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, AlertCircle, CreditCard, Calendar, CheckCircle2, XCircle } from 'lucide-react'
import api from '@/lib/api'

interface Payment {
    id: string
    orderId: string
    amount: number
    currency: string
    status: string
    createdAt: string
    course?: {
        title: string
    }
}

export function StudentPayments() {
    const [payments, setPayments] = useState<Payment[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchPayments = async () => {
            try {
                // Note: Ensure your lib/api.ts has an endpoint for this, or call directly:
                const response = await api.get('/payments/my-payments')
                setPayments(response.data.data || [])
            } catch (err) {
                setError('Failed to load payment history. Please try again later.')
            } finally {
                setLoading(false)
            }
        }
        fetchPayments()
    }, [])

    const getStatusIcon = (status: string) => {
        switch (status.toUpperCase()) {
            case 'SUCCESS': return <CheckCircle2 className="w-5 h-5 text-green-500" />
            case 'FAILED': return <XCircle className="w-5 h-5 text-red-500" />
            default: return <AlertCircle className="w-5 h-5 text-yellow-500" />
        }
    }

    const getStatusBadge = (status: string) => {
        switch (status.toUpperCase()) {
            case 'SUCCESS': return <Badge className="bg-green-100 text-green-800 border-none">Success</Badge>
            case 'FAILED': return <Badge className="bg-red-100 text-red-800 border-none">Failed</Badge>
            default: return <Badge className="bg-yellow-100 text-yellow-800 border-none">Pending</Badge>
        }
    }

    return (
        <Card className="animate-in fade-in slide-in-from-bottom-4 duration-500 border-border">
            <CardHeader className="bg-muted/30 border-b border-border pb-6">
                <CardTitle className="text-2xl flex items-center gap-2">
                    <CreditCard className="w-6 h-6 text-primary" />
                    Payment History
                </CardTitle>
                <CardDescription>
                    Review your past transactions and course purchases.
                </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
                {error ? (
                    <div className="text-center py-12 px-4">
                        <AlertCircle className="mx-auto h-12 w-12 text-destructive mb-3 opacity-50" />
                        <p className="text-destructive font-medium">{error}</p>
                    </div>
                ) : loading ? (
                    <div className="flex items-center justify-center py-16">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : payments.length === 0 ? (
                    <div className="text-center py-16 px-4">
                        <CreditCard className="mx-auto h-12 w-12 text-muted-foreground/30 mb-4" />
                        <p className="text-muted-foreground font-medium text-lg">No payment history found</p>
                        <p className="text-muted-foreground/70 text-sm mt-1">When you purchase a course, the transaction will appear here.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-muted-foreground uppercase bg-muted/30">
                                <tr>
                                    <th className="px-6 py-4 font-medium">Transaction Date</th>
                                    <th className="px-6 py-4 font-medium">Item Details</th>
                                    <th className="px-6 py-4 font-medium">Amount</th>
                                    <th className="px-6 py-4 font-medium">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {payments.map((payment) => (
                                    <tr key={payment.id} className="hover:bg-muted/10 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-foreground">
                                                <Calendar className="w-4 h-4 text-muted-foreground" />
                                                {new Date(payment.createdAt).toLocaleDateString('en-US', {
                                                    year: 'numeric', month: 'short', day: 'numeric'
                                                })}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-foreground">
                                                {payment.course?.title || 'Techwell Course'}
                                            </div>
                                            <div className="text-xs text-muted-foreground mt-1 font-mono">
                                                Order ID: {payment.orderId}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-semibold text-foreground">
                                            {payment.currency === 'INR' ? '₹' : payment.currency} {payment.amount}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                {getStatusIcon(payment.status)}
                                                {getStatusBadge(payment.status)}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
