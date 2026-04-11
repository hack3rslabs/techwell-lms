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
    Image as ImageIcon,
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

type SidebarProps = React.HTMLAttributes<HTMLDivElement>

export function AdminSidebar({ className }: SidebarProps) {

    const pathname = usePathname()
    const { logout, hasPermission } = useAuth()
    const [isMobileOpen, setIsMobileOpen] = useState(false)
    const [leadCounts, setLeadCounts] = useState({ totalCount: 0, unreadCount: 0 })
    const canViewLeads = hasPermission("VIEW_LEADS")
    const isViewingLeads =
        pathname === "/admin/leads" ||
        pathname.startsWith("/admin/leads/")

    const routes: RouteConfig[] = [
        { label: "Dashboard", icon: LayoutDashboard, href: "/admin" },

        { label: "Users & Roles", icon: Users, href: "/admin/users", permission: "MANAGE_USERS" },
        { label: "Courses", icon: BookOpen, href: "/admin/courses", permission: "MANAGE_COURSES" },
        { label: "Certificates", icon: Award, href: "/admin/certificates", permission: "MANAGE_CERTIFICATES" },
       // { label: "Enroll Requests", icon: FileText, href: "/admin/enrolls", permission: "MANAGE_USERS" },
        { label: "Students", icon: GraduationCap, href: "/admin/students", permission: "MANAGE_USERS" },
        { label: "Employer Requests", icon: Briefcase, href: "/admin/employers", permission: "MANAGE_USERS" },

        { label: "All Leads", icon: Magnet, href: "/admin/leads", permission: "VIEW_LEADS", showLeadCounts: true },
        { label: "Meetings", icon: Calendar, href: "/admin/meetings", permission: "VIEW_LEADS" },
        { label: "Tasks", icon: MessageSquare, href: "/admin/tasks", permission: "VIEW_LEADS" },
        { label: "Messages", icon: MessageSquare, href: "/admin/messages", permission: "VIEW_LEADS" },
        { label: "Blogs", icon: FileText, href: "/admin/blogs", permission: "MANAGE_CONTENT" },
        { label: "Gallery", icon: ImageIcon, href: "/admin/gallery", permission: "MANAGE_CONTENT" },
        { label: "Skillcasts", icon: VideoIcon, href: "/admin/skillcasts", permission: "MANAGE_CONTENT" },
        { label: "Reviews", icon: MessageSquare, href: "/admin/reviews", permission: "MANAGE_CONTENT" },
        { label: "Library", icon: BookOpen, href: "/admin/library", permission: "MANAGE_CONTENT" },

      //  { label: "AI Configurations", icon: Bot, href: "/admin/ai", permission: "MANAGE_SETTINGS" },
    //    { label: "Training Data", icon: BrainCircuit, href: "/admin/ai/training", permission: "MANAGE_SETTINGS" },
       // { label: "AI Interviews", icon: Sparkles, href: "/admin/ai-interviews", permission: "MANAGE_SETTINGS" },

       // { label: "Payments", icon: CreditCard, href: "/admin/payments", permission: "VIEW_FINANCE" },
      //  { label: "Pricing & Plans", icon: CreditCard, href: "/admin/pricing", permission: "VIEW_FINANCE" },

        { label: "Job Board", icon: Briefcase, href: "/admin/jobs" },
        { label: "Projects Market", icon: Briefcase, href: "/admin/projects" },
        { label: "Support Tickets", icon: MessageSquare, href: "/admin/support", permission: "VIEW_SUPPORT" },

        { label: "General Settings", icon: Settings, href: "/admin/settings", permission: "MANAGE_SETTINGS" },
        { label: "Video Integration", icon: Video, href: "/admin/video-settings", permission: "MANAGE_SETTINGS" },
        { label: "System Logs", icon: FileText, href: "/admin/logs", permission: "MANAGE_SETTINGS" },
    ]

    const availableRoutes = routes.filter(route => {
        if (route.permission && !hasPermission(route.permission)) return false
        return true
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

            <div
                className={cn(
                    "fixed left-0 top-0 z-40 h-screen w-64 border-r bg-background flex flex-col overflow-hidden transition-transform duration-300 md:translate-x-0",
                    isMobileOpen ? "translate-x-0" : "-translate-x-full",
                    className
                )}
            >

                {/* Sidebar Header (TOP of sidebar) */}
                <div className="px-6 py-5 border-b flex-shrink-0">
                    <h2 className="text-xl font-bold text-primary">Admin Panel</h2>
                    <p className="text-xs text-muted-foreground">
                        Super Admin Console
                    </p>
                </div>

                {/* Scrollable Menu */}
                <div className="flex-1 min-h-0 sidebar-scroll p-3">
                    <nav className="space-y-1 pb-6">

                        {availableRoutes.map((route) => {

                            const isActive =
                                pathname === route.href ||
                                pathname.startsWith(route.href + "/")

                            return (
                                <Link
                                    key={route.href}
                                    href={route.href}
                                    className={cn(
                                        "text-sm flex items-center justify-between gap-3 p-3 rounded-lg transition",
                                        isActive
                                            ? "text-primary bg-primary/10"
                                            : "text-muted-foreground hover:text-primary hover:bg-primary/10"
                                    )}
                                >
                                    <span className="flex min-w-0 items-center">
                                        <route.icon className="h-5 w-5 mr-3 flex-shrink-0" />
                                        <span className="truncate">{route.label}</span>
                                    </span>

                                    {route.showLeadCounts && canViewLeads && (
                                        <span className="ml-auto flex items-center gap-2">
                                            <span
                                                className={cn(
                                                    "inline-flex min-w-5 items-center justify-center rounded-full px-1.5 py-0.5 text-[11px] font-semibold",
                                                    isActive
                                                        ? "bg-primary/15 text-primary"
                                                        : "bg-muted text-foreground/80"
                                                )}
                                            >
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
                            )
                        })}

                    </nav>
                </div>

                {/* Logout Bottom */}
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
