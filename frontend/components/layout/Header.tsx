"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Menu, User, LogOut } from "lucide-react"
import { useAuth } from "@/lib/auth-context"

import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import {
    Sheet,
    SheetContent,
    SheetTrigger,
} from "@/components/ui/sheet"
import { GlobalSearch } from "@/components/shared/GlobalSearch"

export function Header() {
    const [isOpen, setIsOpen] = React.useState(false)
    const { user, isAuthenticated, logout, isLoading } = useAuth()
    const router = useRouter()

    const navItems = [
        { name: "Courses", href: "/courses" },
        { name: "Projects", href: "/projects" },
        { name: "Interview Prep", href: "/interviews" },
        { name: "Jobs", href: "/jobs" },
        { name: "Pricing", href: "/pricing" },
    ]

    const handleLogout = () => {
        logout()
        router.push('/')
    }

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 items-center justify-between">
                <div className="flex items-center gap-2">
                    <Link href="/" className="flex items-center space-x-2">
                        <Image
                            src="/logo-light.png"
                            alt="TechWell"
                            width={280}
                            height={80}
                            className="dark:hidden h-10 w-auto"
                            priority
                            quality={100}
                        />
                        <Image
                            src="/logo-dark.png"
                            alt="TechWell"
                            width={280}
                            height={80}
                            className="hidden dark:block h-10 w-auto"
                            priority
                            quality={100}
                        />
                    </Link>
                    <GlobalSearch />
                </div>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
                    {navItems.map((item) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            className="transition-colors hover:text-primary text-foreground/80"
                        >
                            {item.name}
                        </Link>
                    ))}
                </nav>

                <div className="hidden md:flex items-center gap-2">
                    <ThemeToggle />
                    {isLoading ? (
                        <div className="h-9 w-20 bg-muted animate-pulse rounded" />
                    ) : isAuthenticated ? (
                        <>
                            {['SUPER_ADMIN', 'ADMIN'].includes(user?.role || '') && (
                                <Link href="/admin">
                                    <Button variant="outline" size="sm" className="hidden md:flex">
                                        Admin Panel
                                    </Button>
                                </Link>
                            )}
                            <Link href="/dashboard">
                                <Button variant="ghost" size="sm" className="gap-2">
                                    <User className="h-4 w-4" />
                                    {user?.name?.split(' ')[0]}
                                </Button>
                            </Link>
                            <Button variant="outline" size="sm" onClick={handleLogout}>
                                <LogOut className="h-4 w-4" />
                            </Button>
                        </>
                    ) : (
                        <>
                            <Link href="/login">
                                <Button variant="ghost" size="sm">
                                    Log in
                                </Button>
                            </Link>
                            <Link href="/register">
                                <Button size="sm">
                                    Sign up
                                </Button>
                            </Link>
                        </>
                    )}
                </div>

                {/* Mobile Navigation */}
                <div className="md:hidden">
                    <Sheet open={isOpen} onOpenChange={setIsOpen}>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <Menu className="h-5 w-5" />
                                <span className="sr-only">Toggle menu</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="right">
                            <div className="flex flex-col gap-4 mt-8">
                                {navItems.map((item) => (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        onClick={() => setIsOpen(false)}
                                        className="text-lg font-medium hover:text-primary transition-colors"
                                    >
                                        {item.name}
                                    </Link>
                                ))}
                                <div className="flex flex-col gap-2 mt-4">
                                    {isAuthenticated ? (
                                        <>
                                            <Link href="/dashboard" onClick={() => setIsOpen(false)}>
                                                <Button variant="outline" className="w-full">
                                                    Dashboard
                                                </Button>
                                            </Link>
                                            <Button className="w-full" onClick={() => { handleLogout(); setIsOpen(false); }}>
                                                Logout
                                            </Button>
                                        </>
                                    ) : (
                                        <>
                                            <Link href="/login" onClick={() => setIsOpen(false)}>
                                                <Button variant="outline" className="w-full">
                                                    Log in
                                                </Button>
                                            </Link>
                                            <Link href="/register" onClick={() => setIsOpen(false)}>
                                                <Button className="w-full">
                                                    Sign up
                                                </Button>
                                            </Link>
                                        </>
                                    )}
                                </div>
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
        </header>
    )
}
