"use client"

import { useState, useEffect } from "react"
import { storeApi } from "@/lib/api"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Package, ArrowLeft, Clock, CheckCircle2, Truck, XCircle } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"

export default function MyOrdersPage() {
    const [orders, setOrders] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const res = await storeApi.getMyOrders()
                setOrders(res.data?.data?.orders || [])
            } catch (error) {
                console.error("Failed to fetch orders:", error)
                toast.error("Please login to view your orders.")
            } finally {
                setIsLoading(false)
            }
        }
        fetchOrders()
    }, [])

    if (isLoading) {
        return <div className="min-h-screen pt-24 pb-12 flex items-center justify-center">Loading orders...</div>
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'PENDING': return <Clock className="w-4 h-4 text-emerald-500" />
            case 'PAID': return <CheckCircle2 className="w-4 h-4 text-blue-500" />
            case 'SHIPPED': return <Truck className="w-4 h-4 text-sky-500" />
            case 'DELIVERED': return <CheckCircle2 className="w-4 h-4 text-green-500" />
            case 'CANCELLED': return <XCircle className="w-4 h-4 text-red-500" />
            default: return <Package className="w-4 h-4" />
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PENDING': return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200"
            case 'PAID': return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200"
            case 'SHIPPED': return "bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-400 border-sky-200"
            case 'DELIVERED': return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200"
            case 'CANCELLED': return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200"
            default: return "bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-400"
        }
    }

    return (
        <div className="min-h-screen pt-24 pb-12 bg-zinc-50 dark:bg-zinc-950">
            <div className="container mx-auto px-4 md:px-6 max-w-4xl">
                
                <div className="flex items-center gap-4 mb-8">
                    <Link href="/shop" className="p-2 bg-white dark:bg-zinc-900 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors border border-zinc-200 dark:border-zinc-800">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                        My Orders
                    </h1>
                </div>

                {orders.length === 0 ? (
                    <div className="text-center py-20 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                        <Package className="w-12 h-12 text-zinc-300 mx-auto mb-4" />
                        <div className="text-muted-foreground mb-6">You haven't placed any orders yet.</div>
                        <Link href="/shop" className="text-primary font-medium hover:underline">
                            Start Shopping
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {orders.map((order) => (
                            <Card key={order.id} className="overflow-hidden border-zinc-200 dark:border-zinc-800 shadow-sm">
                                <CardHeader className="bg-zinc-100/50 dark:bg-zinc-900/50 border-b border-zinc-200 dark:border-zinc-800 pb-4">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                        <div>
                                            <CardTitle className="text-lg mb-1 flex items-center gap-2">
                                                Order #{order.orderId}
                                            </CardTitle>
                                            <p className="text-sm text-muted-foreground">
                                                Placed on {new Date(order.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div className="flex flex-col sm:items-end gap-2">
                                            <Badge variant="outline" className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold uppercase ${getStatusColor(order.status)}`}>
                                                {getStatusIcon(order.status)}
                                                {order.status}
                                            </Badge>
                                            <p className="text-sm font-bold">Total: ₹{order.totalAmount}</p>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <div className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
                                        {order.items?.map((item: any) => (
                                            <div key={item.id} className="flex items-center gap-4 p-4 sm:px-6">
                                                <div className="w-16 h-16 rounded-md bg-zinc-100 dark:bg-zinc-800 overflow-hidden flex-shrink-0 border border-zinc-200 dark:border-zinc-800">
                                                    {item.product?.images && item.product.images.length > 0 ? (
                                                        <img src={item.product.images[0]} alt={item.product?.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-zinc-400 text-[10px]">No Image</div>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <Link href={`/shop/${item.product?.slug}`} className="font-medium text-sm sm:text-base hover:text-primary transition-colors line-clamp-1">
                                                        {item.product?.name || "Unknown Product"}
                                                    </Link>
                                                    <p className="text-sm text-muted-foreground mt-1">Qty: {item.quantity}</p>
                                                </div>
                                                <div className="font-medium">
                                                    ₹{item.price * item.quantity}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
