'use client'

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
    LayoutDashboard,
    Users,
    Magnet,
    BookOpen,
    Award,
    Briefcase,
    Video,
    FileText,
    Menu,
    X,
    ChevronLeft,
    ChevronRight,
    IndianRupee,
    Megaphone,
    LogOut
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"
import { useState, useEffect } from "react"

interface RouteConfig {
    label: string
    icon?: any
    href: string
    group?: string
}

type SidebarProps = React.HTMLAttributes<HTMLDivElement> & {
    isCollapsed?: boolean
    onToggleCollapse?: () => void
}

export function FranchiseSidebar({ className, isCollapsed = false, onToggleCollapse }: SidebarProps) {
    const pathname = usePathname()
    const { logout, user } = useAuth()
    const [isMobileOpen, setIsMobileOpen] = useState(false)

    // Franchise Admin specific routes
    const routes: RouteConfig[] = [
        { label: "Dashboard", icon: LayoutDashboard, href: "/franchise-admin", group: "Overview" },
        { label: "Lead Management", icon: Magnet, href: "/franchise-admin/leads", group: "Operations" },
        { label: "My Students", icon: Users, href: "/franchise-admin/students", group: "Operations" },
        { label: "Batches & Courses", icon: BookOpen, href: "/franchise-admin/batches", group: "Operations" },
        { label: "Certificates", icon: Award, href: "/franchise-admin/certificates", group: "Operations" },
        { label: "Certificate Templates", icon: FileText, href: "/franchise-admin/certificates/templates", group: "Operations" },
        { label: "Projects Assignment", icon: Briefcase, href: "/franchise-admin/projects", group: "Placements" },
        { label: "Interview Tracking", icon: Video, href: "/franchise-admin/interviews", group: "Placements" },
        { label: "Ledger & Invoices", icon: IndianRupee, href: "/franchise-admin/finance", group: "Resources" },
        { label: "Staff Management", icon: Users, href: "/franchise-admin/staff", group: "Resources" },
        { label: "Compliance & KYC", icon: FileText, href: "/franchise-admin/compliance", group: "Resources" },
        { label: "Marketing Material", icon: Megaphone, href: "/franchise-admin/marketing", group: "Resources" }
    ]

    useEffect(() => {
        if (isMobileOpen) {
            setTimeout(() => setIsMobileOpen(false), 0)
        }
    }, [isMobileOpen, pathname])

    return (
        <>
            <div className="md:hidden fixed top-4 right-4 z-[9999]">
                <Button variant="outline" size="icon" onClick={() => setIsMobileOpen(!isMobileOpen)}>
                    {isMobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
                </Button>
            </div>

            <div
                className={cn(
                    "fixed left-0 top-0 z-40 h-screen border-r bg-background flex flex-col transition-all duration-300 md:translate-x-0",
                    isCollapsed ? "w-20" : "w-64",
                    isMobileOpen ? "translate-x-0 w-64" : "-translate-x-full",
                    className
                )}
            >
                <div className={cn("px-4 py-4 border-b flex flex-shrink-0 items-center h-16", isCollapsed ? "justify-center" : "justify-between")}>
                    {!isCollapsed && (
                        <div className="overflow-hidden">
                            <h2 className="text-xl font-bold text-primary truncate">Franchise Admin</h2>
                            <p className="text-xs text-muted-foreground truncate">
                                {user?.name || 'Administrator'}
                            </p>
                        </div>
                    )}
                    {onToggleCollapse && (
                        <Button 
                            variant="outline" 
                            size="icon" 
                            onClick={onToggleCollapse} 
                            className="shrink-0 hidden md:flex h-8 w-8 ml-2" 
                        >
                            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                        </Button>
                    )}
                </div>

                <div className="p-3 flex-1 overflow-y-auto no-scrollbar">
                    <nav className="space-y-1 pb-6">
                        {Object.entries(
                            routes.reduce((acc, route) => {
                                const group = route.group || "General"
                                if (!acc[group]) acc[group] = []
                                acc[group].push(route)
                                return acc
                            }, {} as Record<string, typeof routes>)
                        ).map(([group, groupRoutes]) => (
                            <div key={group} className="mb-6">
                                {!isCollapsed && (
                                    <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                                        {group}
                                    </h3>
                                )}
                                <div className="space-y-1">
                                    {groupRoutes.map((route) => {
                                        const isActive = pathname === route.href || pathname.startsWith(route.href + '/')
                                        const Icon = route.icon
                                        return (
                                            <Link
                                                key={route.href}
                                                href={route.href}
                                                className={cn(
                                                    "flex items-center space-x-3 px-3 py-2 rounded-xl transition-all duration-200 group",
                                                    isActive
                                                        ? "bg-primary/10 text-primary font-medium"
                                                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                                                    isCollapsed && "justify-center px-0 py-2.5"
                                                )}
                                                title={isCollapsed ? route.label : undefined}
                                            >
                                                {Icon && (
                                                    <Icon className={cn(
                                                        "flex-shrink-0",
                                                        isCollapsed ? "w-5 h-5" : "w-4 h-4"
                                                    )} />
                                                )}
                                                {!isCollapsed && <span className="text-sm">{route.label}</span>}
                                            </Link>
                                        )
                                    })}
                                </div>
                            </div>
                        ))}
                    </nav>
                </div>


            </div>

            {isMobileOpen && (
                <div
                    className="fixed inset-0 bg-background/80 backdrop-blur-sm z-30 md:hidden"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}
        </>
    )
}
