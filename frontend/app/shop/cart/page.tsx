"use client"

import { useState, useEffect } from "react"
import { storeApi } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Trash2, Minus, Plus, ArrowLeft } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function CartPage() {
    const [cart, setCart] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true)
    const router = useRouter()

    const fetchCart = async () => {
        try {
            const res = await storeApi.getCart()
            setCart(res.data?.data?.cart || { items: [] })
        } catch (error) {
            console.error("Failed to fetch cart:", error)
            toast.error("Please login to view your cart.")
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchCart()
    }, [])

    const handleUpdateQuantity = async (itemId: string, currentQuantity: number, change: number) => {
        const newQuantity = currentQuantity + change
        if (newQuantity < 1) return

        try {
            await storeApi.updateCartItem(itemId, newQuantity)
            fetchCart()
        } catch (error) {
            toast.error("Failed to update quantity")
        }
    }

    const handleRemoveItem = async (itemId: string) => {
        try {
            await storeApi.removeFromCart(itemId)
            toast.success("Item removed from cart")
            fetchCart()
            window.dispatchEvent(new Event('cart-updated'))
        } catch (error) {
            toast.error("Failed to remove item")
        }
    }

    if (isLoading) {
        return <div className="min-h-screen pt-24 pb-12 flex items-center justify-center">Loading cart...</div>
    }

    const subtotal = cart?.items?.reduce((total: number, item: any) => {
        const price = item.product.discountPrice || item.product.price
        return total + (price * item.quantity)
    }, 0) || 0

    return (
        <div className="min-h-screen pt-24 pb-12 bg-zinc-50 dark:bg-zinc-950">
            <div className="container mx-auto px-4 md:px-6 max-w-5xl">
                
                <div className="flex items-center gap-4 mb-8">
                    <Link href="/shop" className="p-2 bg-white dark:bg-zinc-900 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors border border-zinc-200 dark:border-zinc-800">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                        Shopping Cart
                    </h1>
                </div>

                {!cart || !cart.items || cart.items.length === 0 ? (
                    <div className="text-center py-20 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                        <div className="text-muted-foreground mb-6">Your cart is empty.</div>
                        <Button asChild>
                            <Link href="/shop">Continue Shopping</Link>
                        </Button>
                    </div>
                ) : (
                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* Cart Items */}
                        <div className="w-full lg:w-2/3 space-y-4">
                            {cart.items.map((item: any) => {
                                const price = item.product.discountPrice || item.product.price
                                return (
                                    <div key={item.id} className="flex flex-col sm:flex-row items-center gap-4 p-4 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
                                        <div className="w-24 h-24 rounded-lg bg-zinc-100 dark:bg-zinc-800 overflow-hidden flex-shrink-0">
                                            {item.product.images && item.product.images.length > 0 ? (
                                                <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-zinc-400 text-xs">No Image</div>
                                            )}
                                        </div>
                                        
                                        <div className="flex-1 flex flex-col items-center sm:items-start text-center sm:text-left">
                                            <Link href={`/shop/${item.product.slug}`} className="font-semibold text-lg hover:text-primary transition-colors">
                                                {item.product.name}
                                            </Link>
                                            <div className="text-primary font-bold mt-1">₹{price}</div>
                                        </div>

                                        <div className="flex items-center gap-4 mt-4 sm:mt-0">
                                            <div className="flex items-center border border-zinc-200 dark:border-zinc-700 rounded-lg overflow-hidden">
                                                <button 
                                                    className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                                                    onClick={() => handleUpdateQuantity(item.id, item.quantity, -1)}
                                                >
                                                    <Minus className="w-4 h-4" />
                                                </button>
                                                <span className="w-10 text-center font-medium">{item.quantity}</span>
                                                <button 
                                                    className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                                                    onClick={() => handleUpdateQuantity(item.id, item.quantity, 1)}
                                                    disabled={item.quantity >= item.product.stock}
                                                >
                                                    <Plus className="w-4 h-4" />
                                                </button>
                                            </div>
                                            
                                            <button 
                                                className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950 rounded-lg transition-colors"
                                                onClick={() => handleRemoveItem(item.id)}
                                                title="Remove item"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>

                        {/* Order Summary */}
                        <div className="w-full lg:w-1/3">
                            <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 sticky top-24">
                                <h2 className="text-xl font-bold mb-6">Order Summary</h2>
                                
                                <div className="space-y-3 mb-6 pb-6 border-b border-zinc-200 dark:border-zinc-800">
                                    <div className="flex justify-between text-muted-foreground">
                                        <span>Subtotal ({cart.items.length} items)</span>
                                        <span>₹{subtotal}</span>
                                    </div>
                                    <div className="flex justify-between text-muted-foreground">
                                        <span>Shipping</span>
                                        <span>Free</span>
                                    </div>
                                </div>
                                
                                <div className="flex justify-between items-end mb-8">
                                    <span className="font-semibold text-lg">Total</span>
                                    <span className="font-bold text-2xl text-primary">₹{subtotal}</span>
                                </div>
                                
                                <Button size="lg" className="w-full" onClick={() => router.push('/shop/checkout')}>
                                    Proceed to Checkout
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
