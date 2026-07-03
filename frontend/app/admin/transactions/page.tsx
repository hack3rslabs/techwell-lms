"use client"

import { useState, useEffect } from "react"
import { paymentApi } from "@/lib/api"
import { 
    Table, 
    TableBody, 
    TableCell, 
    TableHead, 
    TableHeader, 
    TableRow 
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, Search } from "lucide-react"
import { Input } from "@/components/ui/input"

interface PaymentTransaction {
    id: string
    orderId: string
    amount: number
    status: string
    paymentMethod?: string
    createdAt: string
    user?: {
        name?: string
        email?: string
    }
    course?: {
        title?: string
    }
    courses?: { id: string; title: string }[]
}

export default function TransactionsPage() {
    const [payments, setPayments] = useState<PaymentTransaction[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")

    useEffect(() => {
        const fetchPayments = async () => {
            try {
                const res = await paymentApi.getAll()
                setPayments(res.data)
            } catch (error) {
                console.error("Failed to fetch payments:", error)
            } finally {
                setLoading(false)
            }
        }
        fetchPayments()
    }, [])

    const filteredPayments = payments.filter(payment => 
        payment.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.course?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.paymentMethod?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.orderId?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR'
        }).format(amount)
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold">Transactions</h1>
                    <p className="text-muted-foreground text-sm">View and manage student payments and course purchases.</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex flex-col md:flex-row justify-between gap-4">
                        <CardTitle>Recent Payments</CardTitle>
                        <div className="relative w-full md:w-72">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input 
                                placeholder="Search student, course, or ID..." 
                                className="pl-9"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Student</TableHead>
                                    <TableHead>Course</TableHead>
                                    <TableHead>Amount</TableHead>
                                    <TableHead>Method</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Order ID</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredPayments.length > 0 ? (
                                    filteredPayments.map((payment) => (
                                        <TableRow key={payment.id}>
                                            <TableCell className="font-medium whitespace-nowrap">
                                                {new Date(payment.createdAt).toLocaleDateString('en-IN', {
                                                    day: '2-digit',
                                                    month: 'short',
                                                    year: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-medium">{payment.user?.name}</span>
                                                    <span className="text-xs text-muted-foreground">{payment.user?.email}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="max-w-[200px] truncate">
                                                {payment.courses && payment.courses.length > 0 ? payment.courses.map((c, idx) => c.title).join(", ") : payment.course?.title}
                                            </TableCell>
                                            <TableCell>
                                                {formatCurrency(payment.amount)}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="font-medium">
                                                    {payment.paymentMethod || 'ONLINE'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge 
                                                    variant={payment.status === 'SUCCESS' ? 'default' : 'secondary'}
                                                    className={
                                                        payment.status === 'SUCCESS' ? 'bg-green-100 text-green-700 hover:bg-green-100 border-green-200' : 
                                                        payment.status === 'FAILED' ? 'bg-red-100 text-red-700 hover:bg-red-100 border-red-200' :
                                                        'bg-yellow-100 text-yellow-700 hover:bg-yellow-100 border-yellow-200'
                                                    }
                                                >
                                                    {payment.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right font-mono text-xs text-muted-foreground">
                                                {payment.orderId}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={7} className="h-24 text-center">
                                            No transactions found.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
