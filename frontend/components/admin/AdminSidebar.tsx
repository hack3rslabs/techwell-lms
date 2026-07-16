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
        // 1. Overview
        { label: "Dashboard", icon: LayoutDashboard, href: "/admin", permission: "DASHBOARD", group: "Overview" },

        // 2. Consulting Hub
        { label: "Consulting Hub", icon: Briefcase, href: "/admin/consulting", permission: "CENTRAL_CRM", group: "Consulting Hub" },
        { label: "Consultancy", icon: Briefcase, href: "/admin/consultancy", permission: "CONSULTANCY", group: "Consulting Hub" },
        { label: "Client Agreements", icon: FileText, href: "/admin/crm/agreements", permission: "CENTRAL_CRM", group: "Consulting Hub" },

        // 3. Leads & CRM
        {
            label: "Lead Management", icon: Magnet, href: "/admin/leads", permission: "CENTRAL_CRM", group: "Leads & CRM", showLeadCounts: true, subRoutes: [
                { label: "Overview", href: "/admin/leads" },
                { label: "Newsletters", href: "/admin/leads/newsletters" }
            ]
        },
        { label: "CRM Dashboard", icon: LayoutDashboard, href: "/admin/crm/dashboard", permission: "CENTRAL_CRM", group: "Leads & CRM" },
        { label: "Sales Pipelines", icon: Briefcase, href: "/admin/crm/pipelines", permission: "CENTRAL_CRM", group: "Leads & CRM" },
        { label: "Referrals", icon: Users, href: "/admin/referrals", permission: "ADMIN", group: "Leads & CRM" },

        // 4. Training & Courses
        { label: "Training Manager", icon: BookOpen, href: "/admin/training", permission: "COURSES", group: "Training & Courses" },
        { label: "Courses", icon: BookOpen, href: "/admin/courses", permission: "COURSES", group: "Training & Courses" },
        { label: "Projects", icon: BookOpen, href: "/admin/projects", permission: "COURSES", group: "Training & Courses" },
        { label: "Batches", icon: Users, href: "/admin/batches", permission: "BATCHES", group: "Training & Courses" },
        { label: "Live Classes", icon: VideoIcon, href: "/admin/live-classes", permission: "LIVE_CLASSES", group: "Training & Courses" },
        { label: "Skillcasts", icon: VideoIcon, href: "/admin/skillcasts", permission: "SKILLCASTS", group: "Training & Courses" },
        { label: "Assessments", icon: PenLine, href: "/admin/assessments", permission: "TRAINING", group: "Training & Courses" },
        { label: "Library", icon: BookOpen, href: "/admin/library", permission: "LIBRARY", group: "Training & Courses" },

        // 5. Operations
        { label: "Operations Center", icon: ListTodo, href: "/admin/operations", permission: "ADMIN", group: "Operations" },
        { label: "Tasks", icon: ListTodo, href: "/admin/tasks", permission: "TASKS", group: "Operations" },
        { label: "Meetings", icon: Calendar, href: "/admin/meetings", permission: "MEETINGS", group: "Operations" },
        { label: "System Logs", icon: FileText, href: "/admin/audit-logs", permission: "SYSTEM_LOGS", group: "Operations" },
        { label: "Support Tickets", icon: Inbox, href: "/admin/support", permission: "TICKETS", group: "Operations" },
        {
            label: "Automation Studio", icon: Bot, href: "/admin/automation-studio", group: "Operations", customContent: (
                <div className="space-y-1 mt-2">
                    <Link
                        href="/admin/automation-studio"
                        className={cn("flex items-center space-x-3 px-3 py-2 rounded-xl transition-all duration-200 group", pathname === "/admin/automation-studio" ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md" : "text-gray-600 hover:bg-blue-50/50 hover:text-blue-600")}
                    >
                        <div className={cn("p-1.5 rounded-lg", pathname === "/admin/automation-studio" ? "bg-white/20" : "bg-blue-100 text-blue-600 group-hover:bg-blue-200")}>
                            <Workflow className="w-4 h-4" />
                        </div>
                        <span className="font-medium text-sm">Workflows</span>
                    </Link>
                    <Link
                        href="/admin/automation-studio/knowledge"
                        className={cn("flex items-center space-x-3 px-3 py-2 rounded-xl transition-all duration-200 group", pathname === "/admin/automation-studio/knowledge" ? "bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-md" : "text-gray-600 hover:bg-purple-50/50 hover:text-purple-600")}
                    >
                        <div className={cn("p-1.5 rounded-lg", pathname === "/admin/automation-studio/knowledge" ? "bg-white/20" : "bg-purple-100 text-purple-600 group-hover:bg-purple-200")}>
                            <Database className="w-4 h-4" />
                        </div>
                        <span className="font-medium text-sm">AI Knowledge</span>
                    </Link>
                    <Link
                        href="/admin/automation-studio/integrations"
                        className={cn("flex items-center space-x-3 px-3 py-2 rounded-xl transition-all duration-200 group", pathname === "/admin/automation-studio/integrations" ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md" : "text-gray-600 hover:bg-emerald-50/50 hover:text-emerald-600")}
                    >
                        <div className={cn("p-1.5 rounded-lg", pathname === "/admin/automation-studio/integrations" ? "bg-white/20" : "bg-emerald-100 text-emerald-600 group-hover:bg-emerald-200")}>
                            <Key className="w-4 h-4" />
                        </div>
                        <span className="font-medium text-sm">Integrations</span>
                    </Link>
                </div>
            ), permission: "AUTOMATION_STUDIO"
        },

        // 6. Campus & Recruiting
        { label: "Job Board", icon: Briefcase, href: "/admin/jobs", group: "Campus & Recruiting" },
        { label: "Master Drives", icon: Briefcase, href: "/admin/campus-drives", group: "Campus & Recruiting" },
        { label: "CHMS Dashboard", icon: LayoutDashboard, href: "/admin/chms/dashboard", group: "Campus & Recruiting" },
        { label: "Companies", icon: Building2, href: "/admin/companies", group: "Campus & Recruiting" },
        { label: "Institutes", icon: GraduationCap, href: "/admin/institutes", group: "Campus & Recruiting" },
        { label: "Internships", icon: Briefcase, href: "/admin/internships", group: "Campus & Recruiting" },
        { label: "Interviews", icon: Users, href: "/admin/interviews", group: "Campus & Recruiting" },
        { label: "Employer Requests", icon: Inbox, href: "/admin/employer-requests", permission: "MANAGE_EMPLOYER_REQUESTS", group: "Campus & Recruiting" },
        { label: "AI Interviews", icon: Video, href: "/admin/ai-interviews", permission: "AI_INTERVIEWS", group: "Campus & Recruiting" },

        // 7. Approve & Manage
        { label: "Reviews", icon: Star, href: "/admin/reviews", permission: "REVIEWS", group: "Approve & Manage" },
        { label: "Certificates", icon: Award, href: "/admin/certificates", permission: "CERTIFICATES", group: "Approve & Manage" },
        { label: "Messages", icon: MessageSquare, href: "/admin/messages", permission: "MESSAGES", group: "Approve & Manage" },
        { label: "Coupons", icon: Ticket, href: "/admin/coupons", permission: "COUPONS", group: "Approve & Manage" },
        { label: "Transactions", icon: CreditCard, href: "/admin/transactions", permission: "TRANSACTIONS", group: "Approve & Manage" },

        // 8. Reporting & Analytics
        { label: "Reports & Analytics", icon: LayoutDashboard, href: "/admin/reports", permission: "REPORTS", group: "Reporting & Analytics" },
        { label: "Consulting Revenue", icon: CreditCard, href: "/admin/consultancy-revenue", group: "Reporting & Analytics" },
        // { label: "Global Data", icon: Database, href: "/admin/global-data", permission: "GLOBAL_DATA", group: "Reporting & Analytics" },

        // 9. Deployments & Marketing
        { label: "SEO Manager", icon: Globe, href: "/admin/seo", permission: "ADMIN", group: "Deployments & Marketing" },
        { label: "Blog Posts", icon: PenLine, href: "/admin/posts", permission: "ADMIN", group: "Deployments & Marketing" },
        { label: "Marketing Hub", icon: Megaphone, href: "/admin/marketing", permission: "MARKETING_HUB", group: "Deployments & Marketing" },
        { label: "Ads Manager", icon: Megaphone, href: "/admin/marketing/ads", permission: "ADS_MANAGER", group: "Deployments & Marketing" },
        { label: "CMS Manager", icon: Globe, href: "/admin/cms", permission: "CMS_MANAGER", group: "Deployments & Marketing" },
        { label: "Page Builder", icon: FileCode2, href: "/admin/cms/pages", permission: "PAGE_BUILDER", group: "Deployments & Marketing" },
        { label: "Gallery", icon: ImageIcon, href: "/admin/gallery", permission: "GALLERY", group: "Deployments & Marketing" },
        { label: "Success Stories", icon: Star, href: "/admin/success-stories", permission: "ADMIN", group: "Deployments & Marketing" },
        { label: "Events & Webinars", icon: Calendar, href: "/admin/events", permission: "EVENTS", group: "Deployments & Marketing" },

        // 10. Administration & Partnerships
        { label: "Users & Roles", icon: Users, href: "/admin/roles", permission: "USERS_ROLES", group: "Administration & Partnerships" },
        { label: "All Users", icon: Users, href: "/admin/users", permission: "ADMIN", group: "Administration & Partnerships" },
        { label: "Students", icon: GraduationCap, href: "/admin/students", permission: "STUDENTS", group: "Administration & Partnerships" },
        { label: "Staff Portal", icon: LayoutDashboard, href: "/admin/staff/dashboard", permission: "STAFF_PORTAL", group: "Administration & Partnerships" },
        { 
            label: "Franchise Management", 
            icon: Building2, 
            href: user?.role === 'FRANCHISE_ADMIN' && user?.instituteId 
                ? `/admin/franchise/${user.instituteId}` 
                : (user as any)?.franchiseId ? `/admin/franchise/${(user as any).franchiseId}` : "/admin/franchise", 
            permission: "ADMIN", 
            group: "Administration & Partnerships" 
        },
        { label: "Franchise Resources", icon: Megaphone, href: "/admin/franchise/resources", permission: "ADMIN", group: "Administration & Partnerships" },
        { label: "GDPR & Compliance", icon: ShieldCheck, href: "/admin/compliance", permission: "ADMIN", group: "Administration & Partnerships" },
        { label: "System Settings", icon: Settings, href: "/admin/settings", permission: "SETTINGS", group: "Administration & Partnerships" },
        { label: "Documents", icon: FileText, href: "/admin/documents", permission: "ADMIN", group: "Administration & Partnerships" },
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
                    "fixed left-0 top-0 z-40 h-screen border-r bg-background flex flex-col transition-all duration-300 md:translate-x-0",
                    isCollapsed ? "w-20" : "w-64",
                    isMobileOpen ? "translate-x-0 w-64" : "-translate-x-full",
                    className
                )}
            >

                {/* Header */}
                <div className={cn("px-4 py-4 border-b flex flex-shrink-0 items-center h-16", isCollapsed ? "justify-center" : "justify-between")}>
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
                    <div className="p-3 border-b flex-shrink-0 bg-muted/20">
                        <div className="relative">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Search menus..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="h-9 w-full rounded-md border border-input bg-background pl-9 pr-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                            />
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
                            <div key={group} className="mb-4">
                                {!isCollapsed && (
                                    <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                                        {group}
                                    </h3>
                                )}
                                {groupRoutes.map((route) => {
                                    const isActive =
                                        pathname === route.href ||
                                        (route.href !== "/admin" && pathname.startsWith(route.href + "/"))

                                    return (
                                        <div key={route.href}>
                                            <Link
                                                href={route.href}
                                                className={cn(
                                                    "text-sm flex items-center justify-between gap-3 p-3 rounded-lg transition",
                                                    isActive && !route.customContent
                                                        ? "text-primary bg-primary/10"
                                                        : "text-muted-foreground hover:text-primary hover:bg-primary/10"
                                                )}
                                            >
                                                <span className="flex min-w-0 items-center">
                                                    {route.icon && <route.icon className={cn("h-5 w-5 flex-shrink-0", isCollapsed ? "mx-auto" : "mr-3")} />}
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
                    <div className="border-t p-3 flex-shrink-0 bg-background hidden md:block">
                        <Button 
                            variant="outline" 
                            className={cn("w-full flex items-center text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-all shadow-sm", isCollapsed ? "justify-center px-0" : "justify-start px-2")}
                            onClick={onToggleCollapse} 
                            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
                        >
                            {isCollapsed ? (
                                <ChevronRight className="h-5 w-5" />
                            ) : (
                                <>
                                    <ChevronLeft className="h-5 w-5 mr-2" />
                                    <span className="font-medium">Collapse Menu</span>
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