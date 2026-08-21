"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { api, storeApi } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { ShoppingCart, Heart, ExternalLink, ArrowLeft, CheckCircle2, ShieldCheck, Tag, Star, Truck, Shield } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"

export default function ProductDetailsPage() {
    const params = useParams()
    const router = useRouter()
    const slug = params.slug as string

    const [product, setProduct] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [activeImage, setActiveImage] = useState(0)
    const [reviews, setReviews] = useState<any[]>([])

    useEffect(() => {
        const fetchProductData = async () => {
            try {
                const res = await storeApi.getProduct(slug)
                const prod = res.data?.data?.product
                setProduct(prod)
                
                if (prod) {
                    const reviewRes = await api.get(`/shop/reviews/${prod.id}`).catch(() => ({ data: { data: { reviews: [] } } }))
                    setReviews(reviewRes.data?.data?.reviews || [])
                }
            } catch (error) {
                console.error("Failed to fetch product:", error)
                toast.error("Product not found")
                router.push('/shop')
            } finally {
                setIsLoading(false)
            }
        }
        if (slug) fetchProductData()
    }, [slug, router])

    const handleAddToCart = async () => {
        try {
            await storeApi.addToCart(product.id, 1)
            toast.success("Added to cart!")
            window.dispatchEvent(new Event('cartUpdated'))
        } catch (error) {
            toast.error("Please login to add to cart.")
        }
    }

    const handleToggleWishlist = async () => {
        try {
            const res = await storeApi.toggleWishlist(product.id)
            toast.success(res.data.message)
        } catch (error) {
            toast.error("Please login to manage wishlist.")
        }
    }

    const handleBuyNow = async () => {
        try {
            await storeApi.addToCart(product.id, 1)
            window.dispatchEvent(new Event('cartUpdated'))
            router.push('/shop/checkout')
        } catch (error) {
            toast.error("Please login to buy.")
            router.push('/login?redirect=/shop/checkout')
        }
    }

    if (isLoading) {
        return <div className="min-h-screen pt-24 pb-12 flex items-center justify-center">Loading product...</div>
    }

    if (!product) return null

    // Calculate rating
    const avgRating = reviews.length > 0 ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) : "0.0"

    return (
        <div className="min-h-screen pt-8 pb-20 bg-white dark:bg-zinc-950">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
                
                {/* Breadcrumb */}
                <nav className="flex text-sm text-muted-foreground mb-6" aria-label="Breadcrumb">
                    <ol className="inline-flex items-center space-x-1 md:space-x-3">
                        <li className="inline-flex items-center">
                            <Link href="/shop" className="hover:text-primary transition-colors">Shop</Link>
                        </li>
                        <li>
                            <div className="flex items-center">
                                <span className="mx-2">/</span>
                                <Link href={`/shop/search?category=${product.category?.slug}`} className="hover:text-primary transition-colors">
                                    {product.category?.name || "Category"}
                                </Link>
                            </div>
                        </li>
                        <li aria-current="page">
                            <div className="flex items-center">
                                <span className="mx-2">/</span>
                                <span className="text-foreground font-medium line-clamp-1">{product.name}</span>
                            </div>
                        </li>
                    </ol>
                </nav>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
                    
                    {/* Image Gallery */}
                    <div className="flex flex-col-reverse md:flex-row gap-4">
                        {/* Thumbnails */}
                        {product.images && product.images.length > 1 && (
                            <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-y-auto md:w-24 pb-2 md:pb-0 hide-scrollbar">
                                {product.images.map((img: string, idx: number) => (
                                    <button 
                                        key={idx}
                                        onMouseEnter={() => setActiveImage(idx)}
                                        onClick={() => setActiveImage(idx)}
                                        className={`w-20 md:w-24 h-20 md:h-24 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all ${activeImage === idx ? 'border-primary ring-2 ring-primary/20 ring-offset-1' : 'border-transparent opacity-60 hover:opacity-100 hover:border-zinc-300 dark:hover:border-zinc-700'}`}
                                    >
                                        <img src={img} alt="" className="object-cover w-full h-full bg-zinc-100 dark:bg-zinc-900" />
                                    </button>
                                ))}
                            </div>
                        )}
                        {/* Main Image */}
                        <div className="flex-1 aspect-square relative rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                            {product.images && product.images.length > 0 ? (
                                <img 
                                    src={product.images[activeImage]} 
                                    alt={product.name} 
                                    className="object-contain w-full h-full p-4"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-zinc-400">
                                    No Image Available
                                </div>
                            )}
                            <button 
                                onClick={handleToggleWishlist}
                                className="absolute top-4 right-4 p-3 bg-white dark:bg-black rounded-full shadow-md text-zinc-400 hover:text-red-500 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all z-10 hover:scale-110"
                            >
                                <Heart className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Product Info */}
                    <div className="flex flex-col">
                        <div className="mb-6">
                            {product.brand && (
                                <Link href={`/shop/search?brand=${product.brand}`} className="text-primary font-bold tracking-wider uppercase text-sm hover:underline">
                                    {product.brand}
                                </Link>
                            )}
                            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-zinc-900 dark:text-zinc-50 mt-2 mb-4 leading-tight">
                                {product.name}
                            </h1>
                            
                            <div className="flex flex-wrap items-center gap-4 text-sm mb-4">
                                {reviews.length > 0 ? (
                                    <div className="flex items-center gap-1">
                                        <div className="flex items-center text-sky-400">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} className={`w-4 h-4 ${i < Math.round(Number(avgRating)) ? 'fill-current' : 'text-zinc-300 dark:text-zinc-700'}`} />
                                            ))}
                                        </div>
                                        <span className="font-medium ml-1">{avgRating}</span>
                                        <span className="text-muted-foreground ml-1">({reviews.length} reviews)</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center text-muted-foreground gap-1">
                                        <Star className="w-4 h-4 text-zinc-300 dark:text-zinc-700" />
                                        <span>No reviews yet</span>
                                    </div>
                                )}
                                
                                {product.sku && (
                                    <>
                                        <span className="text-zinc-300 dark:text-zinc-700">|</span>
                                        <span className="text-muted-foreground">SKU: <span className="font-mono">{product.sku}</span></span>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="mb-6 pb-6 border-b border-zinc-200 dark:border-zinc-800">
                            <div className="flex items-end gap-4 mb-2">
                                <span className="text-4xl font-extrabold text-zinc-900 dark:text-white">
                                    ₹{product.discountPrice || product.price}
                                </span>
                                {product.discountPrice && (
                                    <div className="flex flex-col mb-1">
                                        <span className="text-sm text-green-600 dark:text-green-400 font-bold mb-0.5">
                                            {Math.round(((product.price - product.discountPrice) / product.price) * 100)}% OFF
                                        </span>
                                        <span className="text-lg text-muted-foreground line-through decoration-red-500/50">
                                            ₹{product.price}
                                        </span>
                                    </div>
                                )}
                            </div>
                            <p className="text-sm text-muted-foreground">Inclusive of all taxes.</p>
                            
                            {/* Student Discount Badge */}
                            {product.studentDiscount && (
                                <div className="mt-4 inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-3 py-2 rounded-lg border border-blue-200 dark:border-blue-800">
                                    <ShieldCheck className="w-5 h-5" />
                                    <span className="text-sm font-semibold">
                                        Extra {product.studentDiscountType === 'PERCENTAGE' ? `${product.studentDiscount}%` : `₹${product.studentDiscount}`} OFF with Student ID
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Quick Features */}
                        <div className="grid grid-cols-2 gap-4 mb-8">
                            {product.condition && (
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                                        <Tag className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Condition</p>
                                        <p className="text-sm font-semibold capitalize">{product.condition}</p>
                                    </div>
                                </div>
                            )}
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                                    <Truck className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Delivery</p>
                                    <p className="text-sm font-semibold">Free Shipping</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                                    <Shield className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Warranty</p>
                                    <p className="text-sm font-semibold">6 Months</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Availability</p>
                                    <p className="text-sm font-semibold text-green-600 dark:text-green-500">
                                        {product.stock > 0 ? "In Stock" : "Out of Stock"}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="mt-auto space-y-4">
                            <div className="flex flex-col sm:flex-row gap-4">
                                {product.isAffiliate ? (
                                    <a href={product.affiliateUrl || "#"} target="_blank" rel="noopener noreferrer" className="w-full">
                                        <Button size="lg" className="w-full gap-2 text-base h-14 font-bold shadow-md hover:shadow-lg">
                                            Buy on {product.affiliateSource || 'Partner'} <ExternalLink className="w-5 h-5" />
                                        </Button>
                                    </a>
                                ) : (
                                    <>
                                        <Button 
                                            size="lg" 
                                            variant="outline"
                                            className="w-full sm:flex-1 gap-2 text-base h-14 border-2 hover:bg-zinc-50 dark:hover:bg-zinc-900 font-bold" 
                                            onClick={handleAddToCart}
                                            disabled={product.stock === 0}
                                        >
                                            <ShoppingCart className="w-5 h-5" />
                                            Add to Cart
                                        </Button>
                                        <Button 
                                            size="lg" 
                                            className="w-full sm:flex-1 gap-2 text-base h-14 shadow-md hover:shadow-lg font-bold" 
                                            onClick={handleBuyNow}
                                            disabled={product.stock === 0}
                                        >
                                            Buy Now
                                        </Button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Product Description Section */}
                <div className="mt-16 pt-16 border-t border-zinc-200 dark:border-zinc-800">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                        <div className="lg:col-span-2">
                            <h2 className="text-2xl font-bold mb-6">Product Description</h2>
                            <div className="prose prose-zinc dark:prose-invert max-w-none">
                                <p className="whitespace-pre-line text-zinc-600 dark:text-zinc-400 leading-relaxed">
                                    {product.description}
                                </p>
                            </div>
                        </div>
                        
                        {/* Specifications Card */}
                        <div>
                            <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6">
                                <h3 className="text-lg font-bold mb-4">Specifications</h3>
                                <dl className="space-y-4 text-sm">
                                    {product.brand && (
                                        <div className="flex justify-between pb-2 border-b border-zinc-200 dark:border-zinc-800">
                                            <dt className="text-muted-foreground">Brand</dt>
                                            <dd className="font-medium text-right">{product.brand}</dd>
                                        </div>
                                    )}
                                    {product.condition && (
                                        <div className="flex justify-between pb-2 border-b border-zinc-200 dark:border-zinc-800">
                                            <dt className="text-muted-foreground">Condition</dt>
                                            <dd className="font-medium text-right capitalize">{product.condition}</dd>
                                        </div>
                                    )}
                                    {product.sku && (
                                        <div className="flex justify-between pb-2 border-b border-zinc-200 dark:border-zinc-800">
                                            <dt className="text-muted-foreground">SKU</dt>
                                            <dd className="font-medium text-right">{product.sku}</dd>
                                        </div>
                                    )}
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Reviews Section */}
                <div className="mt-16 pt-16 border-t border-zinc-200 dark:border-zinc-800">
                    <h2 className="text-2xl font-bold mb-8">Customer Reviews</h2>
                    {reviews.length === 0 ? (
                        <div className="text-center py-12 bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
                            <Star className="w-12 h-12 text-zinc-300 dark:text-zinc-700 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">No reviews yet</h3>
                            <p className="text-muted-foreground mt-1">Be the first to review this product after purchase!</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {reviews.map((review) => (
                                <div key={review.id} className="p-6 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                                    <div className="flex items-center gap-1 text-sky-400 mb-3">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-current' : 'text-zinc-300 dark:text-zinc-700'}`} />
                                        ))}
                                    </div>
                                    <h4 className="font-semibold text-lg mb-2">{review.title}</h4>
                                    <p className="text-sm text-muted-foreground mb-4">{review.comment}</p>
                                    <p className="text-xs text-zinc-400 dark:text-zinc-500 font-medium">— {review.user?.name || "Verified Buyer"}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </div>
        </div>
    )
}
