"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { ShoppingCart, Package, DollarSign } from "lucide-react"
import api from "@/lib/api"
import { toast } from "sonner"

export default function AdminStoreDashboard() {
    const [stats, setStats] = useState({
        totalProducts: 0,
        totalOrders: 0,
        totalRevenue: 0
    })
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [prodRes, orderRes] = await Promise.all([
                    api.get('/shop/products'),
                    api.get('/shop/admin/orders')
                ])
                
                const products = prodRes.data?.data?.products || []
                const orders = orderRes.data?.data?.orders || []
                
                let revenue = 0;
                orders.forEach((o: any) => {
                    if (o.status !== 'CANCELLED') revenue += o.totalAmount
                })

                setStats({
                    totalProducts: products.length,
                    totalOrders: orders.length,
                    totalRevenue: revenue
                })
            } catch (error) {
                console.error("Failed to fetch store stats")
            } finally {
                setIsLoading(false)
            }
        }
        
        fetchStats()
    }, [])

    if (isLoading) return <div className="p-8 text-muted-foreground">Loading dashboard...</div>

    return (
        <div className="p-8 space-y-6">
            <h1 className="text-2xl font-bold tracking-tight">Store Dashboard</h1>

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Total Products</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalProducts}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                        <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalOrders}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Total Revenue (Gross)</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">₹{stats.totalRevenue.toLocaleString()}</div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
