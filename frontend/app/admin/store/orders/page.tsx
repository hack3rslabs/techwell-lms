"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ShoppingCart, Package } from "lucide-react"
import api from "@/lib/api"
import { toast } from "sonner"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [selectedOrder, setSelectedOrder] = useState<any>(null)

    useEffect(() => {
        fetchOrders()
    }, [])

    const fetchOrders = async () => {
        try {
            const res = await api.get('/shop/admin/orders')
            setOrders(res.data?.data?.orders || [])
        } catch (error) {
            toast.error("Failed to fetch orders")
        } finally {
            setIsLoading(false)
        }
    }

    const handleUpdateStatus = async (orderId: string, newStatus: string) => {
        try {
            await api.put(`/shop/admin/orders/${orderId}/status`, { status: newStatus })
            toast.success("Order status updated")
            if (selectedOrder && selectedOrder.id === orderId) {
                setSelectedOrder({ ...selectedOrder, status: newStatus })
            }
            fetchOrders()
        } catch (error) {
            toast.error("Failed to update status")
        }
    }

    const getStatusColor = (status: string) => {
        switch(status) {
            case 'PENDING': return 'outline'
            case 'PAID': return 'default'
            case 'SHIPPED': return 'secondary'
            case 'DELIVERED': return 'success'
            case 'CANCELLED': return 'destructive'
            default: return 'outline'
        }
    }

    return (
        <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-emerald-500/10 via-emerald-500/10 to-transparent p-6 rounded-2xl border border-emerald-500/20">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                        <ShoppingCart className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                        Store Orders
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">View and manage customer purchases and order fulfillment.</p>
                </div>
            </div>

            {isLoading ? (
                <div className="p-8 text-center text-muted-foreground">Loading...</div>
            ) : (
                <div className="border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
                    <Table>
                        <TableHeader className="bg-slate-50 dark:bg-slate-900/50">
                            <TableRow>
                                <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Order ID</TableHead>
                                <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Date</TableHead>
                                <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Customer</TableHead>
                                <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Amount</TableHead>
                                <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Status</TableHead>
                                <TableHead className="text-right font-semibold text-slate-700 dark:text-slate-300">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {orders.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                                        <div className="flex flex-col items-center justify-center space-y-3">
                                            <ShoppingCart className="w-10 h-10 text-slate-300" />
                                            <p>No orders found yet.</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                orders.map((order) => (
                                    <TableRow key={order.id} className="group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                        <TableCell className="font-medium font-mono text-xs text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/50 rounded px-2 py-1 mx-2 my-2 inline-block">
                                            {order.orderId}
                                        </TableCell>
                                        <TableCell className="text-slate-600 dark:text-slate-300">
                                            {new Date(order.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-medium text-slate-900 dark:text-slate-100">{order.user?.name || "Guest"}</div>
                                            {order.user?.email && <div className="text-xs text-slate-500">{order.user.email}</div>}
                                        </TableCell>
                                        <TableCell className="font-semibold text-slate-900 dark:text-slate-100">
                                            ₹{order.totalAmount}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={getStatusColor(order.status) as any} className={`
                                                ${order.status === 'PENDING' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 hover:bg-emerald-200' : ''}
                                                ${order.status === 'PAID' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 hover:bg-blue-200' : ''}
                                                ${order.status === 'SHIPPED' ? 'bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-300 hover:bg-sky-200' : ''}
                                                ${order.status === 'DELIVERED' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 hover:bg-emerald-200' : ''}
                                                ${order.status === 'CANCELLED' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 hover:bg-red-200' : ''}
                                            `}>
                                                {order.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="outline" size="sm" onClick={() => setSelectedOrder(order)} className="opacity-0 group-hover:opacity-100 transition-opacity border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800">
                                                View Details
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            )}

            <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
                <DialogContent className="max-w-3xl border-slate-200 dark:border-slate-800 shadow-xl">
                    <DialogHeader className="border-b border-slate-100 dark:border-slate-800 pb-4">
                        <DialogTitle className="flex items-center gap-2 text-xl">
                            Order <span className="font-mono text-sm bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-slate-600 dark:text-slate-300">{selectedOrder?.orderId}</span>
                        </DialogTitle>
                    </DialogHeader>
                    {selectedOrder && (
                        <div className="space-y-6 py-2">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                                    <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600">👤</div>
                                        Customer Info
                                    </h3>
                                    <div className="space-y-1 text-sm pl-10">
                                        <p className="font-medium text-slate-800 dark:text-slate-200">{selectedOrder.user?.name || "Guest"}</p>
                                        <p className="text-slate-500">{selectedOrder.user?.email || "No email provided"}</p>
                                        {selectedOrder.shippingAddress && (
                                            <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                                                <p className="font-medium text-slate-700 dark:text-slate-300 mb-1">Shipping To:</p>
                                                <p className="text-slate-500">{selectedOrder.shippingAddress.fullName} ({selectedOrder.shippingAddress.phone})</p>
                                                <p className="text-slate-500">{selectedOrder.shippingAddress.street}, {selectedOrder.shippingAddress.city}</p>
                                                <p className="text-slate-500">{selectedOrder.shippingAddress.state} - {selectedOrder.shippingAddress.zipCode}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                                    <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600">💳</div>
                                        Order Summary
                                    </h3>
                                    <div className="space-y-2 text-sm pl-10">
                                        <div className="flex justify-between">
                                            <span className="text-slate-500">Method:</span>
                                            <span className="font-medium">{selectedOrder.paymentMethod}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-500">Date:</span>
                                            <span className="font-medium">{new Date(selectedOrder.createdAt).toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between pt-2 mt-2 border-t border-slate-200 dark:border-slate-800">
                                            <span className="text-slate-700 dark:text-slate-300 font-semibold">Total Amount:</span>
                                            <span className="font-bold text-emerald-600 dark:text-emerald-400 text-lg">₹{selectedOrder.totalAmount}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div>
                                <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2">
                                    <Package className="w-5 h-5 text-sky-500" /> Order Items
                                </h3>
                                <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                                    <Table>
                                        <TableHeader className="bg-slate-50 dark:bg-slate-900/50">
                                            <TableRow>
                                                <TableHead>Product</TableHead>
                                                <TableHead>Price</TableHead>
                                                <TableHead>Qty</TableHead>
                                                <TableHead className="text-right">Subtotal</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {selectedOrder.items?.map((item: any) => (
                                                <TableRow key={item.id}>
                                                    <TableCell className="font-medium text-slate-800 dark:text-slate-200">{item.product?.name || "Unknown Product"}</TableCell>
                                                    <TableCell>₹{item.price}</TableCell>
                                                    <TableCell>{item.quantity}</TableCell>
                                                    <TableCell className="text-right font-medium">₹{item.price * item.quantity}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-6 border-t border-slate-100 dark:border-slate-800 mt-6">
                                <div className="flex items-center gap-3">
                                    <span className="font-medium text-slate-700 dark:text-slate-300">Update Status:</span>
                                    <select 
                                        className="flex h-10 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-1 text-sm font-medium shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                                        value={selectedOrder.status} 
                                        onChange={(e) => handleUpdateStatus(selectedOrder.id, e.target.value)}
                                    >
                                        <option value="PENDING">🕒 PENDING</option>
                                        <option value="PAID">✅ PAID</option>
                                        <option value="SHIPPED">🚚 SHIPPED</option>
                                        <option value="DELIVERED">📦 DELIVERED</option>
                                        <option value="CANCELLED">❌ CANCELLED</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}
