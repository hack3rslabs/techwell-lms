"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ShoppingCart, Heart, ExternalLink, ArrowRight, Tag, GraduationCap, Zap } from "lucide-react"
import { api, storeApi } from "@/lib/api"
import { toast } from "sonner"
import Link from "next/link"

export default function ShopHomePage() {
    const [products, setProducts] = useState<any[]>([])
    const [banners, setBanners] = useState<any[]>([])
    const [categories, setCategories] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchHomeData = async () => {
            try {
                const [prodRes, bannerRes, catRes] = await Promise.all([
                    storeApi.getProducts(),
                    api.get('/shop/banners').catch(() => ({ data: { data: { banners: [] } } })),
                    storeApi.getCategories()
                ])
                setProducts(prodRes.data?.data?.products || [])
                setCategories(catRes.data?.data?.categories || [])
                const fetchedBanners = bannerRes.data?.data?.banners || []
                if (fetchedBanners.length > 0) {
                    setBanners(fetchedBanners)
                } else {
                    setBanners([
                        { id: 1, title: "Laptops for Students", description: "Up to 50% off on refurbished business laptops.", imageUrl: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?q=80&w=2071&auto=format&fit=crop", ctaText: "Shop Now", targetUrl: "/shop/search?category=laptops" },
                        { id: 2, title: "Premium Accessories", description: "Upgrade your workstation today.", imageUrl: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?q=80&w=2067&auto=format&fit=crop", ctaText: "Explore", targetUrl: "/shop/search?category=accessories" }
                    ])
                }
            } catch (error) {
                console.error("Failed to fetch shop data:", error)
            } finally {
                setIsLoading(false)
            }
        }
        fetchHomeData()
    }, [])

    const handleAddToCart = async (productId: string) => {
        try {
            await storeApi.addToCart(productId, 1)
            toast.success("Added to cart!")
            window.dispatchEvent(new Event('cartUpdated'))
        } catch (error) {
            toast.error("Please login to add to cart.")
        }
    }

    const handleToggleWishlist = async (productId: string) => {
        try {
            const res = await storeApi.toggleWishlist(productId)
            toast.success(res.data.message)
        } catch (error) {
            toast.error("Please login to manage wishlist.")
        }
    }

    if (isLoading) {
        return <div className="min-h-screen pt-24 pb-12 flex items-center justify-center">Loading marketplace...</div>
    }

    const featuredProducts = products.filter(p => p.isFeatured).slice(0, 4)
    const displayProducts = featuredProducts.length > 0 ? featuredProducts : products.slice(0, 8)

    return (
        <div className="min-h-screen pb-12 bg-white dark:bg-zinc-950">
            {/* HERO SECTION */}
            <section className="bg-zinc-100 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-16">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                        <div className="space-y-6">
                            <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-semibold tracking-wide uppercase">
                                Techwell Exclusive
                            </span>
                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-zinc-900 dark:text-white leading-tight">
                                Upgrade Your <br className="hidden md:block"/> Tech Stack
                            </h1>
                            <p className="text-lg text-muted-foreground max-w-lg">
                                Premium refurbished laptops, desktop setups, and tech accessories with verified quality and student discounts.
                            </p>
                            <div className="flex flex-wrap gap-4 pt-4">
                                <Button size="lg" asChild>
                                    <Link href="/shop/search">Shop All Products</Link>
                                </Button>
                                <Button size="lg" variant="outline" asChild>
                                    <Link href="/shop/search?hasStudentOffer=true">View Student Offers</Link>
                                </Button>
                            </div>
                        </div>
                        <div className="relative rounded-2xl overflow-hidden aspect-video lg:aspect-square max-h-[400px] shadow-2xl">
                            <img src={banners[0]?.imageUrl} alt="Hero" className="object-cover w-full h-full hover:scale-105 transition-transform duration-700" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-8">
                                <h3 className="text-white text-2xl font-bold mb-2">{banners[0]?.title}</h3>
                                <p className="text-zinc-200 mb-4">{banners[0]?.description}</p>
                                <Button variant="secondary" className="w-fit" asChild>
                                    <Link href={banners[0]?.targetUrl || '/shop'}>{banners[0]?.ctaText}</Link>
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* QUICK CATEGORIES */}
            <section className="py-12 border-b">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl font-bold">Shop by Category</h2>
                        <Link href="/shop/search" className="text-primary font-medium hover:underline flex items-center">
                            View All <ArrowRight className="w-4 h-4 ml-1"/>
                        </Link>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {categories.slice(0, 6).map(category => (
                            <Link key={category.id} href={`/shop/search?category=${category.slug}`}>
                                <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 text-center hover:shadow-md hover:border-primary/50 transition-all cursor-pointer group">
                                    <div className="w-12 h-12 bg-white dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm group-hover:scale-110 transition-transform">
                                        <Tag className="w-6 h-6 text-zinc-500 group-hover:text-primary" />
                                    </div>
                                    <h3 className="font-semibold text-sm">{category.name}</h3>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* FEATURED PRODUCTS */}
            <section className="py-16 bg-zinc-50 dark:bg-zinc-950/50">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-3xl font-bold flex items-center gap-2">
                                <Zap className="w-8 h-8 text-sky-500 fill-sky-500" /> 
                                Featured Tech
                            </h2>
                            <p className="text-muted-foreground mt-2">Hand-picked gear for top performance.</p>
                        </div>
                    </div>

                    {displayProducts.length === 0 ? (
                        <div className="text-center py-20 text-muted-foreground bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                            No products available at the moment.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {displayProducts.map((product) => (
                                <Card key={product.id} className="overflow-hidden hover:shadow-xl transition-all duration-300 group border-zinc-200 dark:border-zinc-800 flex flex-col bg-white dark:bg-zinc-900">
                                    <div className="aspect-square relative bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                                        <Link href={`/shop/${product.slug}`} className="absolute inset-0">
                                            {product.images && product.images.length > 0 ? (
                                                <img 
                                                    src={product.images[0]} 
                                                    alt={product.name} 
                                                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-zinc-400">
                                                    No Image
                                                </div>
                                            )}
                                        </Link>
                                        
                                        {product.studentDiscount && (
                                            <div className="absolute top-3 left-3 bg-blue-600 text-white text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded shadow-sm flex items-center gap-1">
                                                <GraduationCap className="w-3 h-3" /> Student Offer
                                            </div>
                                        )}
                                        {!product.studentDiscount && product.condition && (
                                            <div className="absolute top-3 left-3 bg-white/90 dark:bg-black/90 backdrop-blur-sm text-xs font-bold px-2.5 py-1 rounded-full shadow-sm pointer-events-none text-zinc-800 dark:text-zinc-200">
                                                {product.condition}
                                            </div>
                                        )}
                                        
                                        <button 
                                            onClick={(e) => {
                                                e.preventDefault()
                                                handleToggleWishlist(product.id)
                                            }}
                                            className="absolute top-3 right-3 p-2 bg-white/90 dark:bg-black/90 backdrop-blur-sm rounded-full text-zinc-600 dark:text-zinc-400 hover:text-red-500 hover:bg-white dark:hover:bg-zinc-800 transition-colors shadow-sm z-10"
                                        >
                                            <Heart className="w-4 h-4" />
                                        </button>
                                    </div>
                                    
                                    <CardContent className="p-5 flex-1 flex flex-col">
                                        {product.brand && <span className="text-xs text-muted-foreground uppercase tracking-wider mb-1 font-semibold">{product.brand}</span>}
                                        <Link href={`/shop/${product.slug}`}>
                                            <h3 className="font-semibold text-lg line-clamp-2 mb-2 hover:text-primary transition-colors leading-tight" title={product.name}>
                                                {product.name}
                                            </h3>
                                        </Link>
                                        <div className="mt-auto flex items-end gap-2 pt-4">
                                            <span className="text-2xl font-bold">₹{product.discountPrice || product.price}</span>
                                            {product.discountPrice && (
                                                <span className="text-sm text-muted-foreground line-through mb-1">₹{product.price}</span>
                                            )}
                                        </div>
                                    </CardContent>
    
                                    <CardFooter className="p-5 pt-0 border-t border-zinc-100 dark:border-zinc-800 mt-4 bg-zinc-50/50 dark:bg-zinc-900/50">
                                        {product.isAffiliate ? (
                                            <a href={product.affiliateUrl || "#"} target="_blank" rel="noopener noreferrer" className="w-full mt-4">
                                                <Button className="w-full gap-2" variant="outline">
                                                    View on {product.affiliateSource || 'Partner'} <ExternalLink className="w-4 h-4" />
                                                </Button>
                                            </a>
                                        ) : (
                                            <Button 
                                                className="w-full gap-2 mt-4 shadow-sm" 
                                                onClick={() => handleAddToCart(product.id)}
                                                disabled={product.stock === 0}
                                            >
                                                <ShoppingCart className="w-4 h-4" />
                                                {product.stock > 0 ? "Add to Cart" : "Out of Stock"}
                                            </Button>
                                        )}
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </div>
    )
}
