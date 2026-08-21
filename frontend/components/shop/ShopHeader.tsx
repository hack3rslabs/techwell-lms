"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShoppingCart, Heart, User, Search, Menu, X, ChevronDown } from "lucide-react";
import Image from "next/image";
import { useAuth } from "@/lib/auth-context";
import { api, storeApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ShopHeader() {
    const router = useRouter();
    const { user, logout } = useAuth();
    const [searchQuery, setSearchQuery] = useState("");
    const [cartCount, setCartCount] = useState(0);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [categories, setCategories] = useState<any[]>([]);
    const [settings, setSettings] = useState<any>(null);

    useEffect(() => {
        fetchCartCount();
        fetchCategories();
        api.get('/settings/public').then(res => setSettings(res.data)).catch(console.error);
        // Setup event listener for cart updates
        const handleCartUpdate = () => fetchCartCount();
        window.addEventListener('cartUpdated', handleCartUpdate);
        return () => window.removeEventListener('cartUpdated', handleCartUpdate);
    }, [user]);

    const fetchCartCount = async () => {
        if (!user) return;
        try {
            const res = await storeApi.getCart();
            if (res.data?.data?.cart?.items) {
                const count = res.data.data.cart.items.reduce((acc: number, item: any) => acc + item.quantity, 0);
                setCartCount(count);
            }
        } catch (error) {
            console.error("Error fetching cart count:", error);
        }
    };

    const fetchCategories = async () => {
        try {
            const res = await storeApi.getCategories();
            if (res.data?.data?.categories) {
                setCategories(res.data.data.categories);
            }
        } catch (error) {
            console.error("Error fetching categories:", error);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/shop/search?search=${encodeURIComponent(searchQuery)}`);
            setIsMobileMenuOpen(false);
        }
    };

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-white dark:bg-zinc-950 shadow-sm">
            {/* Top Bar - Announcements or Offers */}
            <div className="bg-primary text-primary-foreground py-1 text-center text-xs sm:text-sm font-medium">
                Exclusive Student Discount: Get up to 50% off on premium laptops with Techwell Student ID!
            </div>

            {/* Main Header Container */}
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
                    
                    {/* Logo & Mobile Menu */}
                    <div className="flex items-center gap-4">
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="md:hidden"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        >
                            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </Button>
                        <Link href="/shop" className="relative flex h-10 w-[150px] lg:w-[180px] items-center shrink-0">
                            <Image
                                src="/logo-light.png"
                                alt="Techwell"
                                width={180}
                                height={50}
                                className="object-contain object-left dark:hidden"
                                priority
                            />
                            <Image
                                src="/logo-dark.png"
                                alt="Techwell"
                                width={180}
                                height={50}
                                className="hidden object-contain object-left dark:block"
                                priority
                            />
                        </Link>
                    </div>

                    {/* Desktop Search Bar */}
                    <div className="hidden md:flex flex-1 max-w-2xl mx-8">
                        <form onSubmit={handleSearch} className="relative w-full flex shadow-sm rounded-md overflow-hidden">
                            <Input 
                                type="text"
                                placeholder="Search products, brands and more..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full rounded-none border-r-0 focus-visible:ring-0 focus-visible:ring-offset-0 h-10 md:h-12 bg-zinc-100 dark:bg-zinc-900 border-none"
                            />
                            <Button type="submit" className="rounded-none px-6 h-10 md:h-12">
                                <Search className="h-5 w-5" />
                            </Button>
                        </form>
                    </div>

                    {/* Right Actions */}
                    <div className="flex items-center gap-2 sm:gap-6">
                        {/* Account */}
                        {user ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="flex items-center gap-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 h-10 md:h-12 px-2 md:px-4">
                                        <User className="h-5 w-5 md:h-6 md:w-6" />
                                        <div className="hidden lg:flex flex-col items-start text-left">
                                            <span className="text-[10px] leading-tight text-muted-foreground">Hello, {user.name.split(' ')[0]}</span>
                                            <span className="text-sm font-semibold leading-tight flex items-center gap-1">Account <ChevronDown className="h-3 w-3" /></span>
                                        </div>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56">
                                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => router.push('/shop/orders')}>
                                        My Orders
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => router.push('/shop/wishlist')}>
                                        Wishlist
                                    </DropdownMenuItem>
                                    {user.role === 'ADMIN' || user.role === 'SUPER_ADMIN' ? (
                                        <DropdownMenuItem onClick={() => router.push('/admin/store')}>
                                            Shop Admin
                                        </DropdownMenuItem>
                                    ) : null}
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={logout} className="text-red-600">
                                        Logout
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : (
                            <Button variant="ghost" onClick={() => router.push('/login?redirect=/shop')} className="hidden sm:flex h-10 md:h-12">
                                Login
                            </Button>
                        )}

                        {/* Wishlist */}
                        <Link href="/shop/wishlist" className="hidden sm:flex items-center gap-2 hover:text-primary transition-colors h-10 md:h-12 px-2">
                            <Heart className="h-6 w-6" />
                            <span className="text-sm font-semibold hidden lg:inline-block">Wishlist</span>
                        </Link>

                        {/* Cart */}
                        <Link href="/shop/cart" className="flex items-center gap-2 relative hover:text-primary transition-colors group h-10 md:h-12 px-2">
                            <div className="relative">
                                <ShoppingCart className="h-6 w-6 md:h-7 md:w-7" />
                                {cartCount > 0 && (
                                    <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-[10px] font-bold h-5 w-5 flex items-center justify-center rounded-full group-hover:scale-110 transition-transform">
                                        {cartCount > 99 ? '99+' : cartCount}
                                    </span>
                                )}
                            </div>
                            <span className="text-sm font-semibold hidden lg:inline-block">Cart</span>
                        </Link>
                    </div>
                </div>

                {/* Mobile Search */}
                <div className="md:hidden pb-4">
                    <form onSubmit={handleSearch} className="relative w-full flex shadow-sm rounded-md overflow-hidden">
                        <Input 
                            type="text"
                            placeholder="Search products..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full rounded-none focus-visible:ring-0 focus-visible:ring-offset-0 bg-zinc-100 dark:bg-zinc-900 border-none h-10"
                        />
                        <Button type="submit" className="rounded-none px-4 h-10">
                            <Search className="h-4 w-4" />
                        </Button>
                    </form>
                </div>
            </div>

            {/* Category Navigation Bar */}
            <div className="hidden md:block border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <nav className="flex items-center gap-8 overflow-x-auto py-2 no-scrollbar">
                        <Link href="/" className="text-sm font-bold text-blue-600 dark:text-blue-500 hover:text-blue-700 whitespace-nowrap flex items-center">
                            Main Website
                        </Link>
                        <div className="h-4 w-px bg-zinc-300 dark:bg-zinc-700"></div>
                        <Link href="/shop" className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 hover:text-primary whitespace-nowrap">
                            Shop Home
                        </Link>
                        <Link href="/shop/search" className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 hover:text-primary whitespace-nowrap">
                            <Menu className="h-4 w-4 inline-block mr-2 -mt-1"/>All Categories
                        </Link>
                        {categories.slice(0, 8).map(category => (
                            <Link 
                                key={category.id} 
                                href={`/shop/search?category=${category.slug}`}
                                className="text-sm font-medium text-zinc-600 dark:text-zinc-300 hover:text-primary transition-colors whitespace-nowrap"
                            >
                                {category.name}
                            </Link>
                        ))}
                    </nav>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div className="md:hidden absolute w-full top-full left-0 bg-white dark:bg-zinc-950 z-40 p-4 border-b shadow-xl max-h-[80vh] overflow-y-auto">
                    <nav className="flex flex-col gap-2">
                        {!user && (
                            <Button onClick={() => { router.push('/login?redirect=/shop'); setIsMobileMenuOpen(false); }} className="w-full mb-2">
                                Login / Sign Up
                            </Button>
                        )}
                        <Link href="/shop/wishlist" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 p-3 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900">
                            <Heart className="h-5 w-5" />
                            <span className="font-medium">My Wishlist</span>
                        </Link>
                        <Link href="/shop/orders" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 p-3 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900">
                            <ShoppingCart className="h-5 w-5" />
                            <span className="font-medium">My Orders</span>
                        </Link>
                        <hr className="my-2 border-zinc-200 dark:border-zinc-800" />
                        <h3 className="font-bold text-sm text-muted-foreground px-2 uppercase tracking-wider mb-2">Categories</h3>
                        {categories.map(category => (
                            <Link 
                                key={category.id}
                                href={`/shop/search?category=${category.slug}`}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="px-3 py-2 rounded-lg font-medium text-foreground hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
                            >
                                {category.name}
                            </Link>
                        ))}
                    </nav>
                </div>
            )}
        </header>
    );
}
