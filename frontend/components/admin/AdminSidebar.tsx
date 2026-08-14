"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
    LayoutDashboard, BarChart3,
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
    ShieldCheck,
    Bot,
    Workflow,
    Key,
    ListTodo,
    Building2,
    Search,
    ChevronLeft,
    ChevronRight,
    UserCheck,
    Inbox,
    PenLine,
    type LucideIcon
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"
import { leadApi } from "@/lib/api"
import { useState, useEffect } from "react"

interface RouteConfig {
    label: string
    icon?: LucideIcon
    href: string
    permission?: string
    showLeadCounts?: boolean
    customContent?: React.ReactNode
    group?: string
    subRoutes?: { label: string; href: string }[]
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
    const [searchQuery, setSearchQuery] = useState("")

    const canViewLeads = hasPermission("VIEW_LEADS")
    const isViewingLeads =
        pathname === "/admin/leads" ||
        pathname.startsWith("/admin/leads/")

    const routes: RouteConfig[] = [
        // --- 1. Sales & Revenue (CRM) ---
        { label: "Dashboard", icon: LayoutDashboard, href: "/admin", permission: "DASHBOARD", group: "Sales & Revenue (CRM)" },
        { 
            label: "CRM & Leads", icon: Magnet, href: "/admin/leads", permission: "CENTRAL_CRM", group: "Sales & Revenue (CRM)", showLeadCounts: true, subRoutes: [
                { label: "Lead Management", href: "/admin/leads" },
                { label: "Client Agreements", href: "/admin/crm/agreements" },
                { label: "Referrals", href: "/admin/referrals" }
            ]
        },
        { 
            label: "Consulting", icon: Briefcase, href: "/admin/consulting", permission: "CENTRAL_CRM", group: "Sales & Revenue (CRM)", subRoutes: [
                { label: "Consulting Hub", href: "/admin/consulting" },
                { label: "Consultancy", href: "/admin/consultancy" }
            ]
        },
        { 
            label: "Marketing & SEO", icon: Megaphone, href: "/admin/marketing", permission: "MARKETING_HUB", group: "Sales & Revenue (CRM)", subRoutes: [
                { label: "Marketing Hub", href: "/admin/marketing" },
                { label: "Ads Manager", href: "/admin/marketing/ads" },
                { label: "SEO Manager", href: "/admin/seo" }
            ]
        },

        // --- 2. Academics & Training (LMS) ---
        { 
            label: "Courses & Training", icon: BookOpen, href: "/admin/courses", permission: "COURSES", group: "Academics & Training (LMS)", subRoutes: [
                { label: "All Courses", href: "/admin/courses" },
                { label: "Training Manager", href: "/admin/training" }
            ]
        },
        { 
            label: "Batches & Live Sessions", icon: VideoIcon, href: "/admin/batches", permission: "BATCHES", group: "Academics & Training (LMS)", subRoutes: [
                { label: "Batches", href: "/admin/batches" },
                { label: "Live Classes", href: "/admin/live-classes" },
                { label: "Skillcasts", href: "/admin/skillcasts" }
            ]
        },
        { 
            label: "Projects & Assessments", icon: PenLine, href: "/admin/projects", permission: "COURSES", group: "Academics & Training (LMS)", subRoutes: [
                { label: "Projects Manager", href: "/admin/projects" },
                { label: "Assessments", href: "/admin/assessments" }
            ]
        },
        { 
            label: "Student Resources", icon: Award, href: "/admin/library", permission: "LIBRARY", group: "Academics & Training (LMS)", subRoutes: [
                { label: "Library", href: "/admin/library" },
                { label: "Certificates", href: "/admin/certificates" },
                { label: "Reviews", href: "/admin/reviews" }
            ]
        },

        // --- 3. Campus & Careers (Placements) ---
        { 
            label: "Placement Dashboard", icon: LayoutDashboard, href: "/admin/chms/dashboard", permission: "CHMS", group: "Campus & Careers (Placements)", subRoutes: [
                { label: "CHMS Dashboard", href: "/admin/chms/dashboard" },
                { label: "Master Drives", href: "/admin/campus-drives" }
            ]
        },
        { label: "Jobs & Opportunities", icon: Briefcase, href: "/admin/jobs", permission: "JOBS", group: "Campus & Careers (Placements)" },
        { 
            label: "Partners", icon: Building2, href: "/admin/companies", permission: "COMPANIES", group: "Campus & Careers (Placements)", subRoutes: [
                { label: "Companies", href: "/admin/companies" },
                { label: "Institutes", href: "/admin/institutes" }
            ]
        },
        { 
            label: "Interviews", icon: Users, href: "/admin/interviews", permission: "INTERVIEWS", group: "Campus & Careers (Placements)", subRoutes: [
                { label: "Standard Interviews", href: "/admin/interviews" },
                { label: "AI Interviews", href: "/admin/ai-interviews" }
            ]
        },

        // --- 4. Operations & Automations ---
        { 
            label: "Operations Center", icon: ListTodo, href: "/admin/operations", permission: "ADMIN", group: "Operations & Automations", subRoutes: [
                { label: "Operations Center", href: "/admin/operations" },
                { label: "Approval Center", href: "/admin/approvals" },
                { label: "Tasks", href: "/admin/tasks" },
                { label: "Meetings", href: "/admin/meetings" }
            ]
        },
        { 
            label: "Support & Comms", icon: Inbox, href: "/admin/support", permission: "TICKETS", group: "Operations & Automations", subRoutes: [
                { label: "Support Tickets", href: "/admin/support" },
                { label: "Messages", href: "/admin/messages" }
            ]
        },
        { label: "System Logs", icon: FileText, href: "/admin/audit-logs", permission: "SYSTEM_LOGS", group: "Operations & Automations" },
        {
            label: "Automation Studio", icon: Bot, href: "/admin/automation-studio", group: "Operations & Automations", customContent: (
                <div className="space-y-1 mt-2">
                    <Link
                        href="/admin/automation-studio"
                        className={cn("flex items-center space-x-3 px-3 py-2 rounded-xl transition-all duration-200 group", pathname === "/admin/automation-studio" ? "bg-primary/10 text-primary shadow-sm font-medium" : "text-muted-foreground hover:bg-muted/60 hover:text-foreground")}
                    >
                        <div className={cn("p-1.5 rounded-lg", pathname === "/admin/automation-studio" ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground group-hover:text-primary")}>
                            <Workflow className="w-4 h-4" />
                        </div>
                        <span className="font-medium text-sm">Workflows</span>
                    </Link>
                    <Link
                        href="/admin/automation-studio/knowledge"
                        className={cn("flex items-center space-x-3 px-3 py-2 rounded-xl transition-all duration-200 group", pathname === "/admin/automation-studio/knowledge" ? "bg-primary/10 text-primary shadow-sm font-medium" : "text-muted-foreground hover:bg-muted/60 hover:text-foreground")}
                    >
                        <div className={cn("p-1.5 rounded-lg", pathname === "/admin/automation-studio/knowledge" ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground group-hover:text-primary")}>
                            <Database className="w-4 h-4" />
                        </div>
                        <span className="font-medium text-sm">AI Knowledge</span>
                    </Link>
                    <Link
                        href="/admin/automation-studio/integrations"
                        className={cn("flex items-center space-x-3 px-3 py-2 rounded-xl transition-all duration-200 group", pathname === "/admin/automation-studio/integrations" ? "bg-primary/10 text-primary shadow-sm font-medium" : "text-muted-foreground hover:bg-muted/60 hover:text-foreground")}
                    >
                        <div className={cn("p-1.5 rounded-lg", pathname === "/admin/automation-studio/integrations" ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground group-hover:text-primary")}>
                            <Key className="w-4 h-4" />
                        </div>
                        <span className="font-medium text-sm">Integrations</span>
                    </Link>
                </div>
            ), permission: "AUTOMATION_STUDIO"
        },

        // --- 5. Finance & Administration ---
        { 
            label: "Finance & Revenue", icon: CreditCard, href: "/admin/transactions", permission: "FINANCE", group: "Finance & Administration", subRoutes: [
                { label: "Transactions", href: "/admin/transactions" },
                { label: "Revenue Center", href: "/admin/revenue" },
                { label: "Coupons", href: "/admin/coupons" }
            ]
        },
        { 
            label: "User Management", icon: Users, href: "/admin/users", permission: "ADMIN", group: "Finance & Administration", subRoutes: [
                { label: "All Users", href: "/admin/users" },
                { label: "Students", href: "/admin/students" },
                { label: "Users & Roles", href: "/admin/roles" }
            ]
        },
        { 
            label: "Franchise Network", 
            icon: Building2, 
            href: user?.role === 'FRANCHISE_ADMIN' && user?.instituteId 
                ? `/admin/franchise/${user.instituteId}` 
                : (user as any)?.franchiseId ? `/admin/franchise/${(user as any).franchiseId}` : "/admin/franchise", 
            permission: "ADMIN", 
            group: "Finance & Administration",
            subRoutes: [
                { label: "Franchise Management", href: user?.role === 'FRANCHISE_ADMIN' && user?.instituteId ? `/admin/franchise/${user.instituteId}` : (user as any)?.franchiseId ? `/admin/franchise/${(user as any).franchiseId}` : "/admin/franchise" },
                { label: "Franchise Resources", href: "/admin/franchise/resources" }
            ]
        },
        { 
            label: "CMS & Website Builder", icon: Globe, href: "/admin/cms", permission: "CMS_MANAGER", group: "Finance & Administration", subRoutes: [
                { label: "CMS Manager", href: "/admin/cms" },
                { label: "Page Builder", href: "/admin/cms/pages" },
                { label: "Blogs", href: "/admin/blogs/dashboard" },
                { label: "Events & Webinars", href: "/admin/events" },
                { label: "Gallery", href: "/admin/gallery" },
                { label: "Success Stories", href: "/admin/success-stories" }
            ]
        },
        { 
            label: "Settings & Compliance", icon: Settings, href: "/admin/settings", permission: "SETTINGS", group: "Finance & Administration", subRoutes: [
                { label: "System Settings", href: "/admin/settings" },
                { label: "Documents", href: "/admin/documents" },
                { label: "GDPR & Compliance", href: "/admin/compliance" }
            ]
        }
    ]

    const availableRoutes = routes.filter(route => {
        if (route.permission && !hasPermission(route.permission)) return false
        if (searchQuery) {
            return route.label.toLowerCase().includes(searchQuery.toLowerCase())
        }
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

            {/* Sidebar */}
            <div
                className={cn(
                    "fixed left-0 top-0 z-40 h-screen border-r bg-background/95 backdrop-blur-xl flex flex-col transition-all duration-300 md:translate-x-0 shadow-[4px_0_24px_rgba(0,0,0,0.02)] dark:shadow-[4px_0_24px_rgba(0,0,0,0.2)]",
                    isCollapsed ? "w-20" : "w-64",
                    isMobileOpen ? "translate-x-0 w-64" : "-translate-x-full",
                    className
                )}
            >
                {/* Header */}
                <div className={cn("px-4 py-4 border-b border-border flex flex-shrink-0 items-center h-16 bg-card", isCollapsed ? "justify-center" : "justify-between")}>
                    {!isCollapsed && (
                        <div className="overflow-hidden">
                            <h2 className="text-xl font-bold text-primary truncate">Admin Panel</h2>
                            <p className="text-xs text-muted-foreground truncate">
                                {user?.systemRole?.name ?? user?.role?.replace(/_/g, ' ')}
                            </p>
                        </div>
                    )}
                    {onToggleCollapse && (
                        <Button 
                            variant="outline" 
                            size="icon" 
                            onClick={onToggleCollapse} 
                            className="shrink-0 hidden md:flex h-8 w-8 ml-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700" 
                            title="Toggle Sidebar"
                        >
                            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                        </Button>
                    )}
                </div>

                {/* Search Bar - Frozen at Top */}
                {!isCollapsed && (
                    <div className="p-3 flex-shrink-0 bg-card border-b border-border/50">
                        <div className="relative">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search menus..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="h-9 w-full rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 pl-9 pr-8 py-1 text-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary placeholder:text-slate-500"
                            />
                            {searchQuery && (
                                <button 
                                    onClick={() => setSearchQuery("")}
                                    className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted p-0.5 transition-colors"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {/* Scrollable Menu ✅ */}
                <div className="p-3 flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700">
                    <nav className="space-y-1 pb-6">
                        {Object.entries(
                            availableRoutes.reduce((acc, route) => {
                                const group = route.group || 'Overview'
                                if (!acc[group]) acc[group] = []
                                acc[group].push(route)
                                return acc
                            }, {} as Record<string, RouteConfig[]>)
                        ).map(([group, groupRoutes]) => (
                            <div key={group} className="mb-5">
                                {!isCollapsed && (
                                    <h3 className="px-3 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2.5">
                                        {group}
                                    </h3>
                                )}
                                {groupRoutes.map((route) => {
                                    const isActive =
                                        pathname === route.href ||
                                        (route.href !== "/admin" && pathname.startsWith(route.href + "/")) ||
                                        (route.subRoutes && route.subRoutes.some(subRoute => pathname === subRoute.href || pathname.startsWith(subRoute.href + "/")))

                                    return (
                                        <div key={route.href}>
                                            <Link
                                                href={route.href}
                                                className={cn(
                                                    "text-sm flex items-center justify-between gap-3 px-3 py-2.5 rounded-md transition-all duration-200 group relative",
                                                    isActive && !route.customContent
                                                        ? "text-primary bg-primary/10 font-semibold"
                                                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800"
                                                )}
                                            >
                                                <span className="flex min-w-0 items-center relative z-10">
                                                    {route.icon && <route.icon className={cn("h-4 w-4 flex-shrink-0 transition-colors duration-200", isCollapsed ? "mx-auto" : "mr-3", isActive && !route.customContent ? "text-primary" : "text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300")} />}
                                                    {!isCollapsed && <span className="truncate tracking-tight">{route.label}</span>}
                                                </span>

                                                {route.showLeadCounts && canViewLeads && !isCollapsed && leadCounts.unreadCount > 0 && (
                                                    <span className="ml-auto flex items-center gap-2">
                                                        <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 py-0.5 text-[11px] font-semibold text-white">
                                                            {leadCounts.unreadCount > 99 ? "99+" : leadCounts.unreadCount}
                                                        </span>
                                                    </span>
                                                )}
                                            </Link>



                                            {/* Sub Routes Rendering */}
                                            {route.subRoutes && route.subRoutes.length > 0 && isActive && !isCollapsed && (
                                                <div className="ml-8 mt-1 mb-3 space-y-0.5 border-l border-slate-200 dark:border-slate-800 pl-3 py-1">
                                                    {route.subRoutes.map(subRoute => (
                                                        <Link
                                                            key={subRoute.href}
                                                            href={subRoute.href}
                                                            className={cn(
                                                                "block text-[13px] py-1.5 px-2 rounded-md transition-colors duration-200",
                                                                pathname === subRoute.href 
                                                                    ? "text-primary font-medium bg-primary/5" 
                                                                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800"
                                                            )}
                                                        >
                                                            {subRoute.label}
                                                        </Link>
                                                    ))}
                                                </div>
                                            )}

                                            {route.customContent && isActive && !isCollapsed && (
                                                <div className="ml-8 mt-1 space-y-1">
                                                    {route.customContent}
                                                </div>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                        ))}
                    </nav>
                </div>

                {/* Smart Footer Toggle */}
                {onToggleCollapse && (
                    <div className="border-t border-border p-3 flex-shrink-0 bg-card hidden md:block">
                        <Button 
                            variant="ghost" 
                            className={cn("w-full flex items-center text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-all dark:hover:bg-slate-800 dark:hover:text-slate-100", isCollapsed ? "justify-center px-0" : "justify-start px-2")}
                            onClick={onToggleCollapse} 
                            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
                        >
                            {isCollapsed ? (
                                <ChevronRight className="h-4 w-4" />
                            ) : (
                                <>
                                    <ChevronLeft className="h-4 w-4 mr-2" />
                                    <span className="font-medium text-sm">Collapse Sidebar</span>
                                </>
                            )}
                        </Button>
                    </div>
                )}
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