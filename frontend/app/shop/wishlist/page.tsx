"use client"

import { useState, useEffect } from "react"
import { storeApi } from "@/lib/api"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ShoppingCart, Trash2, ArrowLeft } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"

export default function WishlistPage() {
    const [wishlist, setWishlist] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true)

    const fetchWishlist = async () => {
        try {
            const res = await storeApi.getWishlist()
            setWishlist(res.data?.data?.wishlist || { items: [] })
        } catch (error) {
            console.error("Failed to fetch wishlist:", error)
            toast.error("Please login to view your wishlist.")
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchWishlist()
    }, [])

    const handleRemove = async (productId: string) => {
        try {
            await storeApi.toggleWishlist(productId)
            toast.success("Item removed from wishlist")
            fetchWishlist()
        } catch (error) {
            toast.error("Failed to remove item")
        }
    }

    const handleMoveToCart = async (productId: string) => {
        try {
            await storeApi.addToCart(productId, 1)
            await storeApi.toggleWishlist(productId) // Remove from wishlist
            toast.success("Moved to cart")
            window.dispatchEvent(new Event('cart-updated'))
            fetchWishlist()
        } catch (error) {
            toast.error("Failed to move to cart")
        }
    }

    if (isLoading) {
        return <div className="min-h-screen pt-24 pb-12 flex items-center justify-center">Loading wishlist...</div>
    }

    return (
        <div className="min-h-screen pt-24 pb-12 bg-zinc-50 dark:bg-zinc-950">
            <div className="container mx-auto px-4 md:px-6">
                
                <div className="flex items-center gap-4 mb-8">
                    <Link href="/shop" className="p-2 bg-white dark:bg-zinc-900 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors border border-zinc-200 dark:border-zinc-800">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                        My Wishlist
                    </h1>
                </div>

                {!wishlist || !wishlist.items || wishlist.items.length === 0 ? (
                    <div className="text-center py-20 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                        <div className="text-muted-foreground mb-6">Your wishlist is empty.</div>
                        <Button asChild>
                            <Link href="/shop">Explore Products</Link>
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {wishlist.items.map((item: any) => {
                            const product = item.product
                            return (
                                <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-all duration-300 group border-zinc-200 dark:border-zinc-800 flex flex-col">
                                    <div className="aspect-square relative bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                                        <Link href={`/shop/${product.slug}`} className="absolute inset-0">
                                            {product.images && product.images.length > 0 ? (
                                                <img 
                                                    src={product.images[0]} 
                                                    alt={product.name} 
                                                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-zinc-400">
                                                    No Image
                                                </div>
                                            )}
                                        </Link>
                                        <button 
                                            onClick={() => handleRemove(product.id)}
                                            className="absolute top-3 right-3 p-2 bg-white/90 dark:bg-black/90 backdrop-blur-sm rounded-full text-red-500 hover:bg-white dark:hover:bg-zinc-800 transition-colors shadow-sm z-10"
                                            title="Remove from wishlist"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                    
                                    <CardContent className="p-5 flex-1 flex flex-col">
                                        <Link href={`/shop/${product.slug}`}>
                                            <h3 className="font-semibold text-lg line-clamp-1 mb-1 hover:text-primary transition-colors" title={product.name}>
                                                {product.name}
                                            </h3>
                                        </Link>
                                        <div className="flex items-center gap-2 mt-auto pt-4">
                                            <span className="text-xl font-bold">₹{product.discountPrice || product.price}</span>
                                        </div>
                                    </CardContent>

                                    <CardFooter className="p-5 pt-0">
                                        {!product.isAffiliate && (
                                            <Button 
                                                className="w-full gap-2" 
                                                onClick={() => handleMoveToCart(product.id)}
                                                disabled={product.stock === 0}
                                            >
                                                <ShoppingCart className="w-4 h-4" />
                                                {product.stock > 0 ? "Move to Cart" : "Out of Stock"}
                                            </Button>
                                        )}
                                    </CardFooter>
                                </Card>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}
