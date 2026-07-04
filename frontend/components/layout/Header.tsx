"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter, usePathname } from "next/navigation"
import { Menu, User, LogOut, ChevronDown, ArrowUpRight, GraduationCap, Laptop, Sparkles, Building2, Briefcase } from "lucide-react"
import { useAuth } from "@/lib/auth-context"

import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import {
    Sheet,
    SheetContent,
    SheetTrigger,
} from "@/components/ui/sheet"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { GlobalSearch } from "@/components/shared/GlobalSearch"

export function Header() {

    const [isOpen, setIsOpen] = React.useState(false)
    const { user, isAuthenticated, logout, isLoading } = useAuth()
    const router = useRouter()
    const pathname = usePathname()


    const navigationConfig = [
        {
            name: "Training",
            href: "/courses",
            icon: <GraduationCap className="h-4 w-4 text-indigo-500" />
        },
        {
            name: "Services",
            href: "/services",
            icon: <Laptop className="h-4 w-4 text-sky-500" />,
            items: [
                { name: "IT Solutions", href: "/services/it-infrastructure", desc: "IT Support & Asset management." },
                { name: "Software Solutions", href: "/services/software-development", desc: "Custom web development & ERP apps." },
                { name: "Cyber Security", href: "/services/cyber-security", desc: "Application & network security." },
                { name: "Digital Marketing", href: "/services/digital-marketing", desc: "SEO, SMM & Content Strategy." },
                { name: "AI Automation", href: "/services/ai-automation", desc: "RAG Pipelines & n8n Workflows." }
            ]
        },
        {
            name: "Products",
            href: "/products",
            icon: <Sparkles className="h-4 w-4 text-amber-500" />,
            items: [
                { name: "Ledger Book (Billing)", href: "https://ledger.twiis.in", desc: "GST-compliant invoicing app.", external: true }
            ]
        },
        {
            name: "Career Hub",
            href: "/interviews",
            icon: <Briefcase className="h-4 w-4 text-emerald-500" />,
            items: [
                { name: "Career Guide", href: "/career-guide", desc: "Central hub for career enquiries, placements & guidance." },
                { name: "AI Mock Interviews", href: "/interviews", desc: "AI, Resume & JD based voice mock interviews." },
                { name: "Resume Builder", href: "/resume-builder", desc: "AI builder, ATS checker & templates." },
                { name: "Apply Jobs", href: "/jobs", desc: "Placement assistance, openings & tracking." },
                { name: "Campus to Career", href: "https://elearnstack.com/", desc: "Aptitude prep & technical assessments.", external: true },
                { name: "MNC Assessments", href: "https://elearnstack.com/", desc: "Prep for TCS, Infosys, Accenture & Deloitte.", external: true },
                { name: "Test Series", href: "https://elearnstack.com/", desc: "Mock, practice & assessment tests.", external: true },
                { name: "Competitive Exams", href: "https://elearnstack.com/", desc: "Government, Banking, SSC & RRB prep.", external: true }
            ]
        }
    ]

    const handleLogout = () => {
        logout()
        router.push("/")
    }

    return (
        <>
            {/* FIXED NAVBAR */}
            <header className="fixed top-0 left-0 w-full z-[100] border-b border-border/60 bg-background/88 backdrop-blur-xl supports-[backdrop-filter]:bg-background/75">
                <div className="container flex h-18 min-h-[4.5rem] items-center justify-between gap-4">

                    {/* Logo + Search */}
                    <div className="flex min-w-0 items-center gap-2 lg:gap-3">

                        <Link href="/home" className="relative flex h-10 w-[150px] lg:w-[180px] items-center shrink-0">
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

                        {pathname.startsWith('/courses') && <GlobalSearch />}

                    </div>
                    {/* Desktop Navigation */}
                    <nav className="hidden lg:flex items-center gap-5 xl:gap-6 text-sm font-medium">

                        {navigationConfig.map((menu) => (
                            menu.items && menu.items.length > 0 ? (
                                <div 
                                    key={menu.name}
                                    className="relative group py-5"
                                >
                                    <button className="flex items-center gap-1 transition-colors hover:text-primary text-foreground/80 cursor-pointer font-semibold py-1 whitespace-nowrap">
                                        {menu.name}
                                        <ChevronDown className="h-3.5 w-3.5 opacity-70 group-hover:rotate-180 transition-transform duration-200" />
                                    </button>

                                    {/* Dropdown flyout */}
                                    <div className="absolute top-full left-1/2 -translate-x-1/2 w-[22rem] bg-white/98 dark:bg-zinc-950/98 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 p-4 grid gap-3 z-[100]">
                                        <div className="flex items-center gap-2 pb-2 border-b border-zinc-100 dark:border-zinc-900">
                                            {menu.icon}
                                            <Link href={menu.href} className="text-xs font-bold uppercase tracking-wider text-primary hover:underline flex items-center gap-0.5">
                                                Explore {menu.name}
                                                <ArrowUpRight className="h-3 w-3" />
                                            </Link>
                                        </div>
                                        <div className="grid gap-2">
                                            {menu.items.map((subItem) => (
                                                subItem.external ? (
                                                    <a 
                                                        key={subItem.name}
                                                        href={subItem.href}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex flex-col p-2 hover:bg-zinc-50 dark:hover:bg-zinc-900 rounded-lg transition-colors group/item"
                                                    >
                                                        <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1">
                                                            {subItem.name}
                                                            <ArrowUpRight className="h-3 w-3 opacity-0 group-hover/item:opacity-100 transition-opacity" />
                                                        </span>
                                                        <span className="text-[10px] text-zinc-500 mt-0.5">{subItem.desc}</span>
                                                    </a>
                                                ) : (
                                                    <Link 
                                                        key={subItem.name}
                                                        href={subItem.href}
                                                        className="flex flex-col p-2 hover:bg-zinc-50 dark:hover:bg-zinc-900 rounded-lg transition-colors group/item"
                                                    >
                                                        <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">{subItem.name}</span>
                                                        <span className="text-[10px] text-zinc-500 mt-0.5">{subItem.desc}</span>
                                                    </Link>
                                                )
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <Link 
                                    key={menu.name}
                                    href={menu.href}
                                    className="transition-colors hover:text-primary text-foreground/80 cursor-pointer font-semibold py-1"
                                >
                                    {menu.name}
                                </Link>
                            )
                        ))}

                    </nav>

                    {/* Right Section */}
                    <div className="hidden lg:flex items-center gap-2 shrink-0">

                        <ThemeToggle />

                        <Link href="/contact" className="hidden 2xl:block">
                            <Button variant="outline" size="sm" className="rounded-full border-border/70 bg-background/80 px-4">
                                Talk to Team
                            </Button>
                        </Link>

                        {isLoading ? (
                            <div className="h-9 w-20 bg-muted animate-pulse rounded" />
                        ) : isAuthenticated ? (
                            <>
                                <Link href="/dashboard">
                                    <Button variant="ghost" size="sm" className="gap-2">
                                        <User className="h-4 w-4" />
                                        {user?.name?.split(" ")[0]}
                                    </Button>
                                </Link>

                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleLogout}
                                >
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

                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button size="sm">
                                            Sign up <ChevronDown className="ml-1 h-3.5 w-3.5" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-48">
                                        <DropdownMenuItem asChild>
                                            <Link href="/register" className="cursor-pointer flex items-center">
                                                <GraduationCap className="mr-2 h-4 w-4" />
                                                Student / Learner
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild>
                                            <Link href="/employer-register" className="cursor-pointer flex items-center">
                                                <Building2 className="mr-2 h-4 w-4" />
                                                Company / Employer
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild>
                                            <Link href="/institute-register" className="cursor-pointer flex items-center">
                                                <Briefcase className="mr-2 h-4 w-4" />
                                                College / Institute
                                            </Link>
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </>
                        )}

                    </div>

                    {/* Mobile Menu */}
                    <div className="md:hidden">

                        <Sheet open={isOpen} onOpenChange={setIsOpen}>

                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon">
                                    <Menu className="h-5 w-5" />
                                </Button>
                            </SheetTrigger>

                            <SheetContent side="right" className="overflow-y-auto w-80">

                                <div className="flex flex-col gap-4 mt-8">

                                    {navigationConfig.map((menu) => (
                                        menu.items && menu.items.length > 0 ? (
                                            <div key={menu.name} className="grid gap-2 border-b border-zinc-100 dark:border-zinc-900 pb-3">
                                                <div className="flex items-center gap-1.5 font-bold text-sm text-foreground">
                                                    {menu.icon}
                                                    <span>{menu.name}</span>
                                                </div>
                                                <div className="grid gap-1.5 pl-6">
                                                    {menu.items.map((subItem) => (
                                                        subItem.external ? (
                                                            <a 
                                                                key={subItem.name}
                                                                href={subItem.href}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                onClick={() => setIsOpen(false)}
                                                                className="text-xs text-muted-foreground hover:text-primary flex items-center gap-0.5 py-0.5"
                                                            >
                                                                {subItem.name}
                                                                <ArrowUpRight className="h-3 w-3" />
                                                            </a>
                                                        ) : (
                                                            <Link
                                                                key={subItem.name}
                                                                href={subItem.href}
                                                                onClick={() => setIsOpen(false)}
                                                                className="text-xs text-muted-foreground hover:text-primary py-0.5"
                                                            >
                                                                {subItem.name}
                                                            </Link>
                                                        )
                                                    ))}
                                                </div>
                                            </div>
                                        ) : (
                                            <Link
                                                key={menu.name}
                                                href={menu.href}
                                                onClick={() => setIsOpen(false)}
                                                className="flex items-center gap-1.5 font-bold text-sm text-foreground border-b border-zinc-100 dark:border-zinc-900 pb-3 py-1"
                                            >
                                                {menu.icon}
                                                <span>{menu.name}</span>
                                            </Link>
                                        )
                                    ))}

                                    <div className="flex flex-col gap-2 mt-4">

                                        {isAuthenticated ? (
                                            <>
                                                <Link
                                                    href="/dashboard"
                                                    onClick={() => setIsOpen(false)}
                                                >
                                                    <Button variant="outline" className="w-full">
                                                        Dashboard
                                                    </Button>
                                                </Link>

                                                <Button
                                                    className="w-full"
                                                    onClick={() => {
                                                        handleLogout()
                                                        setIsOpen(false)
                                                    }}
                                                >
                                                    Logout
                                                </Button>
                                            </>
                                        ) : (
                                            <>
                                                <Link
                                                    href="/login"
                                                    onClick={() => setIsOpen(false)}
                                                >
                                                    <Button variant="outline" className="w-full">
                                                        Log in
                                                    </Button>
                                                </Link>

                                                <div className="pt-2 pb-1 border-t border-zinc-100 dark:border-zinc-800">
                                                    <p className="text-xs font-semibold text-muted-foreground mb-2 px-1">Register As:</p>
                                                    <div className="flex flex-col gap-2">
                                                        <Link href="/register" onClick={() => setIsOpen(false)}>
                                                            <Button className="w-full justify-start variant-outline" variant="outline" size="sm">
                                                                <GraduationCap className="mr-2 h-4 w-4" /> Student
                                                            </Button>
                                                        </Link>
                                                        <Link href="/employer-register" onClick={() => setIsOpen(false)}>
                                                            <Button className="w-full justify-start variant-outline" variant="outline" size="sm">
                                                                <Building2 className="mr-2 h-4 w-4" /> Employer
                                                            </Button>
                                                        </Link>
                                                        <Link href="/institute-register" onClick={() => setIsOpen(false)}>
                                                            <Button className="w-full justify-start variant-outline" variant="outline" size="sm">
                                                                <Briefcase className="mr-2 h-4 w-4" /> Institute
                                                            </Button>
                                                        </Link>
                                                    </div>
                                                </div>
                                            </>
                                        )}

                                    </div>

                                </div>

                            </SheetContent>

                        </Sheet>

                    </div>

                </div>
            </header>

            {/* NAVBAR SPACING */}
            <div className="h-16"></div>
        </>
    )
}
