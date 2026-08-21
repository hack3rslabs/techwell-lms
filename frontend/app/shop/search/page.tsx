"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { api, storeApi } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { ShoppingCart, Heart, ExternalLink, Filter, GraduationCap, ArrowLeft, Search } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"

function SearchContent() {
    const searchParams = useSearchParams()
    const router = useRouter()
    
    // Filters state
    const [products, setProducts] = useState<any[]>([])
    const [categories, setCategories] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false)

    // Current filter values
    const [query, setQuery] = useState(searchParams.get("search") || "")
    const [categorySlug, setCategorySlug] = useState(searchParams.get("category") || "")
    const [hasStudentOffer, setHasStudentOffer] = useState(searchParams.get("hasStudentOffer") === "true")
    const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") || "")
    const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "")
    const [brand, setBrand] = useState(searchParams.get("brand") || "")
    const [condition, setCondition] = useState(searchParams.get("condition") || "")
    const [sort, setSort] = useState(searchParams.get("sort") || "newest")

    useEffect(() => {
        fetchCategories()
    }, [])

    useEffect(() => {
        fetchProducts()
    }, [searchParams])

    const fetchCategories = async () => {
        try {
            const res = await storeApi.getCategories()
            setCategories(res.data?.data?.categories || [])
        } catch (error) {
            console.error("Failed to fetch categories:", error)
        }
    }

    const fetchProducts = async () => {
        setIsLoading(true)
        try {
            const params: any = {}
            if (searchParams.get("search")) params.search = searchParams.get("search")
            if (searchParams.get("category")) params.category = searchParams.get("category")
            if (searchParams.get("brand")) params.brand = searchParams.get("brand")
            if (searchParams.get("hasStudentOffer") === "true") params.hasStudentOffer = true
            if (searchParams.get("minPrice")) params.minPrice = searchParams.get("minPrice")
            if (searchParams.get("maxPrice")) params.maxPrice = searchParams.get("maxPrice")
            if (searchParams.get("brand")) params.brand = searchParams.get("brand")
            if (searchParams.get("condition")) params.condition = searchParams.get("condition")
            if (searchParams.get("sort")) params.sort = searchParams.get("sort")

            const res = await storeApi.getProducts(params)
            setProducts(res.data?.data?.products || [])
        } catch (error) {
            console.error("Failed to fetch products:", error)
        } finally {
            setIsLoading(false)
        }
    }

    const applyFilters = () => {
        const params = new URLSearchParams()
        if (query) params.set("search", query)
        if (categorySlug) params.set("category", categorySlug)
        if (hasStudentOffer) params.set("hasStudentOffer", "true")
        if (minPrice) params.set("minPrice", minPrice)
        if (maxPrice) params.set("maxPrice", maxPrice)
        if (brand) params.set("brand", brand)
        if (condition) params.set("condition", condition)
        if (sort && sort !== "newest") params.set("sort", sort)

        router.push(`/shop/search?${params.toString()}`)
        setIsMobileFiltersOpen(false)
    }

    const clearFilters = () => {
        setQuery("")
        setCategorySlug("")
        setHasStudentOffer(false)
        setMinPrice("")
        setMaxPrice("")
        setBrand("")
        setCondition("")
        setSort("newest")
        router.push(`/shop/search`)
        setIsMobileFiltersOpen(false)
    }

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

    return (
        <div className="container mx-auto px-4 md:px-6 py-8">
            <div className="flex flex-col md:flex-row gap-8">
                
                {/* Mobile Filters Toggle */}
                <div className="md:hidden flex items-center justify-between mb-4">
                    <h1 className="text-2xl font-bold">Search Results</h1>
                    <Button variant="outline" onClick={() => setIsMobileFiltersOpen(true)}>
                        <Filter className="w-4 h-4 mr-2" /> Filters
                    </Button>
                </div>

                {/* Sidebar Filters */}
                <div className={`w-full md:w-64 lg:w-72 shrink-0 ${isMobileFiltersOpen ? 'fixed inset-0 z-50 bg-white dark:bg-zinc-950 p-6 overflow-y-auto' : 'hidden md:block'}`}>
                    
                    {isMobileFiltersOpen && (
                        <div className="flex items-center gap-2 mb-6">
                            <Button variant="ghost" size="icon" onClick={() => setIsMobileFiltersOpen(false)}>
                                <ArrowLeft className="w-5 h-5" />
                            </Button>
                            <h2 className="text-xl font-bold">Filters</h2>
                        </div>
                    )}

                    <div className="bg-zinc-50 dark:bg-zinc-900/50 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-8 sticky top-24">
                        
                        <div className="hidden md:block">
                            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                                <Filter className="w-5 h-5" /> Filters
                            </h2>
                        </div>

                        {/* Search */}
                        <div className="space-y-3">
                            <Label className="text-base font-semibold">Search Keywords</Label>
                            <div className="relative">
                                <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                                <Input 
                                    placeholder="e.g., Thinkpad, Dell..." 
                                    className="pl-9"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Categories */}
                        <div className="space-y-3">
                            <Label className="text-base font-semibold">Category</Label>
                            <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                                <div className="flex items-center space-x-2">
                                    <Checkbox 
                                        id="cat-all" 
                                        checked={categorySlug === ""}
                                        onCheckedChange={() => setCategorySlug("")}
                                    />
                                    <label htmlFor="cat-all" className="text-sm font-medium leading-none cursor-pointer">
                                        All Categories
                                    </label>
                                </div>
                                {categories.map(cat => (
                                    <div key={cat.id} className="flex items-center space-x-2">
                                        <Checkbox 
                                            id={`cat-${cat.id}`} 
                                            checked={categorySlug === cat.slug}
                                            onCheckedChange={(checked) => checked ? setCategorySlug(cat.slug) : setCategorySlug("")}
                                        />
                                        <label htmlFor={`cat-${cat.id}`} className="text-sm font-medium leading-none cursor-pointer">
                                            {cat.name}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Student Offers */}
                        <div className="space-y-3 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                            <Label className="text-base font-semibold">Special Offers</Label>
                            <div className="flex items-center space-x-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-900/30">
                                <Checkbox 
                                    id="student-offer" 
                                    checked={hasStudentOffer}
                                    onCheckedChange={(c) => setHasStudentOffer(c as boolean)}
                                    className="border-blue-500 data-[state=checked]:bg-blue-600"
                                />
                                <label htmlFor="student-offer" className="text-sm font-semibold text-blue-800 dark:text-blue-300 flex items-center cursor-pointer">
                                    <GraduationCap className="w-4 h-4 mr-1.5" /> Student Discounts
                                </label>
                            </div>
                        </div>

                        {/* Brand */}
                        <div className="space-y-3 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                            <Label className="text-base font-semibold">Brand</Label>
                            <Input 
                                placeholder="e.g., Lenovo, Apple..." 
                                value={brand}
                                onChange={(e) => setBrand(e.target.value)}
                            />
                        </div>

                        {/* Condition */}
                        <div className="space-y-3 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                            <Label className="text-base font-semibold">Condition</Label>
                            <select
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                value={condition}
                                onChange={(e) => setCondition(e.target.value)}
                            >
                                <option value="">All Conditions</option>
                                <option value="New">New</option>
                                <option value="Refurbished - Excellent">Refurbished - Excellent</option>
                                <option value="Refurbished - Good">Refurbished - Good</option>
                                <option value="Used">Used</option>
                            </select>
                        </div>

                        {/* Price Range */}
                        <div className="space-y-3 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                            <Label className="text-base font-semibold">Price Range (₹)</Label>
                            <div className="flex items-center gap-2">
                                <Input 
                                    type="number" 
                                    placeholder="Min" 
                                    value={minPrice} 
                                    onChange={(e) => setMinPrice(e.target.value)}
                                    className="w-full"
                                />
                                <span>-</span>
                                <Input 
                                    type="number" 
                                    placeholder="Max" 
                                    value={maxPrice} 
                                    onChange={(e) => setMaxPrice(e.target.value)}
                                    className="w-full"
                                />
                            </div>
                        </div>

                        <div className="flex flex-col gap-2 pt-6">
                            <Button onClick={applyFilters} className="w-full">Apply Filters</Button>
                            <Button variant="outline" onClick={clearFilters} className="w-full">Clear All</Button>
                        </div>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="flex-1">
                    
                    <div className="hidden md:flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-2xl font-bold">
                                {searchParams.get("search") 
                                    ? `Search Results for "${searchParams.get("search")}"` 
                                    : categorySlug 
                                        ? `${categories.find(c => c.slug === categorySlug)?.name || 'Category'} Products` 
                                        : "All Products"
                                }
                            </h1>
                            <p className="text-muted-foreground">{products.length} products found</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Label className="text-sm font-medium whitespace-nowrap">Sort By:</Label>
                            <select 
                                className="flex h-10 w-[180px] rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                value={sort}
                                onChange={(e) => {
                                    setSort(e.target.value);
                                    // Auto-apply sort without waiting for "Apply Filters"
                                    const params = new URLSearchParams(searchParams.toString());
                                    if (e.target.value !== "newest") {
                                        params.set("sort", e.target.value);
                                    } else {
                                        params.delete("sort");
                                    }
                                    router.push(`/shop/search?${params.toString()}`);
                                }}
                            >
                                <option value="newest">Newest Arrivals</option>
                                <option value="price_asc">Price: Low to High</option>
                                <option value="price_desc">Price: High to Low</option>
                            </select>
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="py-20 text-center text-muted-foreground">Loading products...</div>
                    ) : products.length === 0 ? (
                        <div className="text-center py-20 text-muted-foreground bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                            <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">No products found</h3>
                            <p>Try adjusting your filters or search keywords.</p>
                            <Button variant="outline" className="mt-6" onClick={clearFilters}>Clear Filters</Button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
                            {products.map((product) => (
                                <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-all duration-300 group border-zinc-200 dark:border-zinc-800 flex flex-col bg-white dark:bg-zinc-900">
                                    <div className="aspect-square relative bg-zinc-100 dark:bg-zinc-800 overflow-hidden p-2">
                                        <Link href={`/shop/${product.slug}`} className="absolute inset-0 z-0">
                                            {product.images && product.images.length > 0 ? (
                                                <img 
                                                    src={product.images[0]} 
                                                    alt={product.name} 
                                                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500 rounded-md"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-zinc-400">
                                                    No Image
                                                </div>
                                            )}
                                        </Link>
                                        
                                        {product.studentDiscount && (
                                            <div className="absolute top-3 left-3 bg-blue-600 text-white text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded shadow-sm flex items-center gap-1 z-10">
                                                <GraduationCap className="w-3 h-3" /> Student Offer
                                            </div>
                                        )}
                                        {!product.studentDiscount && product.condition && (
                                            <div className="absolute top-3 left-3 bg-white/90 dark:bg-black/90 backdrop-blur-sm text-xs font-bold px-2.5 py-1 rounded-full shadow-sm text-zinc-800 dark:text-zinc-200 z-10">
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
                                    
                                    <CardContent className="p-5 flex-1 flex flex-col z-10 bg-white dark:bg-zinc-900">
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

                                    <CardFooter className="p-5 pt-0 border-t border-zinc-100 dark:border-zinc-800 mt-4 bg-zinc-50/50 dark:bg-zinc-900/50 z-10">
                                        {product.isAffiliate ? (
                                            <a href={product.affiliateUrl || "#"} target="_blank" rel="noopener noreferrer" className="w-full mt-4">
                                                <Button className="w-full gap-2" variant="outline">
                                                    Buy on {product.affiliateSource || 'Partner'} <ExternalLink className="w-4 h-4" />
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
            </div>
        </div>
    )
}

export default function SearchPage() {
    return (
        <Suspense fallback={<div className="min-h-screen pt-24 pb-12 flex items-center justify-center">Loading Search...</div>}>
            <SearchContent />
        </Suspense>
    )
}
