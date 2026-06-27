"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
    LayoutDashboard,
    Users,
    BookOpen,
    FileText,
    Video,
    Award,
    Settings,
    MessageSquare,
    Calendar,
    Menu,
    X,
    LogOut,
    VideoIcon,
    Magnet,
    Briefcase,
    GraduationCap,
    Star,
    Image as ImageIcon,
    CreditCard,
    Ticket,
    Globe,
    Megaphone,
    Database,
    FileCode2,
    type LucideIcon
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"
import { leadApi } from "@/lib/api"
import { useState, useEffect } from "react"

interface RouteConfig {
    label: string
    icon: LucideIcon
    href: string
    permission?: string
    showLeadCounts?: boolean
}

type SidebarProps = React.HTMLAttributes<HTMLDivElement> & {
    isCollapsed?: boolean
    onToggleCollapse?: () => void
}

export function AdminSidebar({ className, isCollapsed = false, onToggleCollapse }: SidebarProps) {

    const pathname = usePathname()
    const { logout, hasPermission, user } = useAuth()
    const [isMobileOpen, setIsMobileOpen] = useState(false)
    const [leadCounts, setLeadCounts] = useState({ totalCount: 0, unreadCount: 0 })

    const canViewLeads = hasPermission("VIEW_LEADS")
    const isViewingLeads =
        pathname === "/admin/leads" ||
        pathname.startsWith("/admin/leads/")

    const routes: RouteConfig[] = [
         { label: "Dashboard", icon: LayoutDashboard, href: "/admin", permission: "DASHBOARD" },
         { label: "Users & Roles", icon: Users, href: "/admin/roles", permission: "USERS" },
         { label: "Courses", icon: BookOpen, href: "/admin/courses", permission: "COURSES" },
         { label: "Coupons", icon: Ticket, href: "/admin/coupons", permission: "COURSES" },
         { label: "Batches", icon: Users, href: "/admin/batches", permission: "COURSES" },
         { label: "Staff Portal", icon: LayoutDashboard, href: "/admin/staff/dashboard", permission: "DASHBOARD" },
         { label: "Central CRM", icon: Magnet, href: "/admin/leads", permission: "LEADS", showLeadCounts: true },
         { label: "Global Data", icon: Database, href: "/admin/global-data", permission: "LEADS" },
         { label: "Marketing Hub", icon: Megaphone, href: "/admin/marketing", permission: "LEADS" },
         { label: "Ads Manager", icon: Megaphone, href: "/admin/marketing/ads", permission: "LEADS" },
         { label: "Events & Webinars", icon: Calendar, href: "/admin/events", permission: "LEADS" },
         { label: "Students", icon: GraduationCap, href: "/admin/students", permission: "USERS" },
         { label: "Transactions", icon: CreditCard, href: "/admin/transactions", permission: "FINANCE" },
         { label: "Messages", icon: MessageSquare, href: "/admin/messages", permission: "USERS" },
         { label: "Blogs", icon: FileText, href: "/admin/blogs", permission: "BLOGS" },
         { label: "CMS Manager", icon: Globe, href: "/admin/cms", permission: "CMS" },
         { label: "Page Builder", icon: FileCode2, href: "/admin/cms/pages", permission: "CMS" },

         { label: "Gallery", icon: ImageIcon, href: "/admin/gallery", permission: "COURSES" },
         { label: "Library", icon: BookOpen, href: "/admin/library", permission: "COURSES" },
         { label: "Certificates", icon: Award, href: "/admin/certificates", permission: "CERTIFICATES" },
         { label: "Meetings", icon: Calendar, href: "/admin/meetings", permission: "USERS" },
         { label: "AI Interviews", icon: Video, href: "/admin/ai-interviews", permission: "COURSES" },
         { label: "Live Classes", icon: VideoIcon, href: "/admin/live-classes", permission: "COURSES" },
         { label: "Tasks", icon: MessageSquare, href: "/admin/tasks", permission: "USERS" },
         { label: "Skillcasts", icon: VideoIcon, href: "/admin/skillcasts", permission: "COURSES" },
         { label: "Reviews", icon: MessageSquare, href: "/admin/reviews", permission: "COURSES" },
         { label: "Employer Requests", icon: Briefcase, href: "/admin/employer-requests", permission: "USERS" }, 
         { label: "System Settings", icon: Settings, href: "/admin/settings", permission: "SETTINGS" },
         { label: "Reports & Analytics", icon: LayoutDashboard, href: "/admin/reports", permission: "REPORTS" },
         { label: "System Logs", icon: FileText, href: "/admin/audit-logs", permission: "SYSTEM_LOGS" },
    ]

    const availableRoutes = routes.filter(route => {
        if (!route.permission) return true
        return hasPermission(route.permission)
    })

    useEffect(() => {
        if (isMobileOpen) {
            setTimeout(() => setIsMobileOpen(false), 0)
        }
    }, [isMobileOpen, pathname])

    useEffect(() => {
        if (!canViewLeads) return

        let isMounted = true

        const loadLeadCounts = async () => {
            try {
                const res = await leadApi.getCounts()

                if (!isMounted) return

                setLeadCounts({
                    totalCount: res.data.totalCount ?? 0,
                    unreadCount: isViewingLeads ? 0 : (res.data.unreadCount ?? 0)
                })
            } catch (error) {
                if (!isMounted) return
                console.error("Failed to load lead counts:", error)
            }
        }

        loadLeadCounts()

        const intervalId = window.setInterval(loadLeadCounts, 30000)
        window.addEventListener("lead-counts:refresh", loadLeadCounts)

        return () => {
            isMounted = false
            window.clearInterval(intervalId)
            window.removeEventListener("lead-counts:refresh", loadLeadCounts)
        }
    }, [canViewLeads, isViewingLeads])

    return (
        <>
            {/* Mobile Toggle */}
            <div className="md:hidden fixed top-4 right-4 z-[9999]">
                <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setIsMobileOpen(!isMobileOpen)}
                >
                    {isMobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
                </Button>
            </div>

            {/* Sidebar */}
            <div
                className={cn(
                    "fixed left-0 top-0 z-40 h-screen border-r bg-background overflow-y-auto transition-all duration-300 md:translate-x-0",
                    isCollapsed ? "w-20" : "w-64",
                    isMobileOpen ? "translate-x-0 w-64" : "-translate-x-full",
                    className
                )}
            >

                {/* Header */}
                <div className="px-6 py-5 border-b flex items-center justify-between flex-shrink-0 h-16">
                    {!isCollapsed && (
                        <div>
                            <h2 className="text-xl font-bold text-primary">Admin Panel</h2>
                            <p className="text-xs text-muted-foreground">
                                {user?.systemRole?.name ?? user?.role?.replace(/_/g, ' ')}
                            </p>
                        </div>
                    )}
                </div>

                {/* Scrollable Menu ✅ */}
                <div className="p-3">
                    <nav className="space-y-1 pb-6">
                        {availableRoutes.map((route) => {

                            const isActive =
                                pathname === route.href ||
                                pathname.startsWith(route.href + "/")

                            return (
                                <div key={route.href}>
                                    <Link
                                        href={route.href}
                                        className={cn(
                                            "text-sm flex items-center justify-between gap-3 p-3 rounded-lg transition",
                                            isActive
                                                ? "text-primary bg-primary/10"
                                                : "text-muted-foreground hover:text-primary hover:bg-primary/10"
                                        )}
                                    >
                                        <span className="flex min-w-0 items-center">
                                            <route.icon className={cn("h-5 w-5 flex-shrink-0", isCollapsed ? "mx-auto" : "mr-3")} />
                                            {!isCollapsed && <span className="truncate">{route.label}</span>}
                                        </span>

                                        {route.showLeadCounts && canViewLeads && !isCollapsed && (
                                            <span className="ml-auto flex items-center gap-2">
                                                <span className="inline-flex min-w-5 items-center justify-center rounded-full px-1.5 py-0.5 text-[11px] font-semibold bg-muted">
                                                    {leadCounts.totalCount}
                                                </span>

                                                {leadCounts.unreadCount > 0 && (
                                                    <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 py-0.5 text-[11px] font-semibold text-white">
                                                        {leadCounts.unreadCount > 99 ? "99+" : leadCounts.unreadCount}
                                                    </span>
                                                )}
                                            </span>
                                        )}
                                    </Link>
                                    
                                    {route.label === "Central CRM" && !isCollapsed && (
                                        <div className="ml-8 mt-1 space-y-1 border-l pl-3 border-slate-200 dark:border-slate-800">
                                            {[
                                                { label: "Job Enquiries", type: "JOB_ENQUIRY" },
                                                { label: "Training", type: "TRAINING" },
                                                { label: "Service Requests", type: "SERVICE_REQUEST" },
                                                { label: "Software Requests", type: "SOFTWARE_REQUEST" }
                                            ].map((subRoute) => (
                                                <Link
                                                    key={subRoute.type}
                                                    href={`/admin/leads?type=${subRoute.type}`}
                                                    className="block text-xs text-muted-foreground hover:text-primary hover:bg-primary/5 p-2 rounded-md transition"
                                                >
                                                    {subRoute.label}
                                                </Link>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </nav>
                </div>

                {/* Footer */}
                <div className="border-t p-3 flex-shrink-0">
                    <Button
                        variant="ghost"
                        className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50"
                        onClick={logout}
                    >
                        <LogOut className="h-5 w-5 mr-3" />
                        Sign Out
                    </Button>
                </div>

            </div>

            {/* Mobile Overlay */}
            {isMobileOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-30 md:hidden"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}
        </>
    )
}