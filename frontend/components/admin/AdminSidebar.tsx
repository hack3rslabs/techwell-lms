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
    CreditCard,
    Settings,
    MessageSquare,
    Calendar,
    Menu,
    X,
    LogOut,
    BrainCircuit,
    Sparkles,
    VideoIcon,
    ChevronDown,
    ChevronRight,
    Magnet,
    GraduationCap,
    Bot,
    Briefcase
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useAuth } from "@/lib/auth-context"
import { useState, useEffect } from "react"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
    isCollapsed?: boolean // Added member to avoid empty interface warning
}

export function AdminSidebar({ className }: SidebarProps) {
    const pathname = usePathname()
    const { logout, hasPermission } = useAuth()
    const [isMobileOpen, setIsMobileOpen] = useState(false)
    const [expandedMenus, setExpandedMenus] = useState<string[]>([])

    // Close mobile menu on route change
    useEffect(() => {
        if (isMobileOpen) {
            // Defer to avoid cascading render lint
            setTimeout(() => setIsMobileOpen(false), 0)
        }
    }, [pathname, isMobileOpen])

    // Auto-expand active parent menu
    useEffect(() => {
        function getRoutesInternal() {
            const routesList = [
                {
                    label: 'Dashboard',
                    href: '/admin',
                    icon: LayoutDashboard
                },
                {
                    label: 'User Management',
                    icon: Users,
                    subItems: [
                        { label: 'All Users', href: '/admin/users' },
                        { label: 'Courses', href: '/admin/courses' },
                        { label: 'Certificates', href: '/admin/certificates' },
                    ]
                },
                {
                    label: 'Leads & CRM',
                    icon: Magnet,
                    subItems: [
                        { label: 'All Leads', href: '/admin/leads' },
                        { label: 'Meetings', href: '/admin/meetings' },
                        { label: 'Tasks', href: '/admin/tasks' },
                    ]
                },
                {
                    label: 'Learning CMS',
                    icon: GraduationCap,
                    subItems: [
                        { label: 'Blogs', href: '/admin/blogs' },
                        { label: 'Reviews', href: '/admin/reviews' },
                    ]
                },
                {
                    label: 'AI Agents',
                    icon: Bot,
                    subItems: [
                        { label: 'Configurations', href: '/admin/ai' },
                        { label: 'Training Data', href: '/admin/ai/training' },
                    ]
                },
                {
                    label: 'Finance',
                    icon: CreditCard,
                    subItems: [
                        { label: 'Payments', href: '/admin/payments' },
                    ]
                },
                {
                    label: 'Operations',
                    icon: Briefcase,
                    subItems: [
                        { label: 'Job Board', href: '/admin/jobs' },
                    ]
                },
                {
                    label: 'Technical',
                    icon: Settings,
                    subItems: [
                        { label: 'Video Settings', href: '/admin/video-settings' },
                        { label: 'System Logs', href: '/admin/logs' },
                    ]
                }
            ]
            return routesList
        }

        const routes = getRoutesInternal()
        routes.forEach(route => {
            if (route.subItems && route.subItems.some(sub => pathname.startsWith(sub.href))) {
                if (!expandedMenus.includes(route.label)) {
                    setExpandedMenus(prev => [...prev, route.label])
                }
            }
        })
    }, [pathname, expandedMenus])

    const toggleMenu = (label: string) => {
        setExpandedMenus(prev =>
            prev.includes(label)
                ? prev.filter(l => l !== label)
                : [...prev, label]
        )
    }

    const getRoutes = () => {
        const routes = [
            {
                label: "Dashboard",
                icon: LayoutDashboard,
                href: "/admin",
                active: pathname === "/admin",
                // Dashboard is always visible to staff, but maybe limited widgets
            },
            {
                label: "Leads & CRM",
                icon: MessageSquare,
                href: "/admin/leads",
                active: pathname.startsWith("/admin/leads"),
                permission: 'VIEW_LEADS'
            },
            {
                label: "Tasks",
                icon: Calendar,
                href: "/admin/tasks",
                active: pathname.startsWith("/admin/tasks"),
                permission: 'VIEW_TASKS'
            },
            {
                label: "Courses",
                icon: BookOpen,
                href: "/admin/courses",
                active: pathname.startsWith("/admin/courses"),
                permission: 'MANAGE_COURSES',
                subItems: [
                    { label: "All Courses", href: "/admin/courses" },
                    { label: "Create New", href: "/admin/courses/new" },
                    { label: "Review Queue", href: "/admin/courses/review" },
                    { label: "Live Classes", href: "/admin/courses/live" },
                ]
            },
            {
                label: "Blog Manager",
                icon: FileText,
                href: "/admin/blogs",
                active: pathname.startsWith("/admin/blogs"),
                permission: 'MANAGE_CONTENT'
            },
            {
                label: "AI Settings",
                icon: Sparkles,
                href: "/admin/ai",
                active: pathname.startsWith("/admin/ai"),
                permission: 'MANAGE_SETTINGS',
                subItems: [
                    { label: "API Configuration", href: "/admin/ai" },
                    { label: "Knowledge Base", href: "/admin/ai/knowledge-base" },
                    { label: "Q&A Training", href: "/admin/ai/training" },
                ]
            },
            {
                label: "AI Interviews",
                icon: BrainCircuit,
                href: "/admin/ai-interviews",
                active: pathname.startsWith("/admin/ai-interviews"),
                permission: 'MANAGE_SETTINGS'
            },
            {
                label: "Video Integration",
                icon: VideoIcon,
                href: "/admin/video-settings",
                active: pathname.startsWith("/admin/video-settings"),
                permission: 'MANAGE_SETTINGS'
            },
            {
                label: "Interviews",
                icon: Video,
                href: "/admin/interviews",
                active: pathname.startsWith("/admin/interviews"),
                permission: 'VIEW_INTERVIEWS'
            },
            {
                label: "Users & Roles",
                icon: Users,
                href: "/admin/users",
                active: pathname.startsWith("/admin/users"),
                permission: 'MANAGE_USERS'
            },
            {
                label: "Certificates",
                icon: Award,
                href: "/admin/certificates",
                active: pathname.startsWith("/admin/certificates"),
                permission: 'MANAGE_CERTIFICATES'
            },
            {
                label: "Pricing & Plans",
                icon: CreditCard,
                href: "/admin/pricing",
                active: pathname.startsWith("/admin/pricing"),
                permission: 'VIEW_FINANCE'
            },
            {
                label: "System Settings",
                icon: Settings,
                href: "/admin/settings",
                active: pathname.startsWith("/admin/settings"),
                permission: 'MANAGE_SETTINGS',
                subItems: [
                    { label: "General Settings", href: "/admin/settings" },
                    { label: "Email Services", href: "/admin/email-settings" },
                    { label: "Video Integration", href: "/admin/video-settings" },
                    { label: "Lead Integrations", href: "/admin/leads/integrations" },
                ]
            },
            {
                label: "Support Tickets",
                icon: MessageSquare,
                href: "/admin/support",
                active: pathname.startsWith("/admin/support"),
                permission: 'VIEW_SUPPORT'
            },
            {
                label: "Employer Requests",
                icon: Users,
                href: "/admin/employers",
                active: pathname.startsWith("/admin/employers"),
                permission: 'MANAGE_USERS'
            },
        ]

        // Filter routes based on permissions
        return routes.filter(route => {
            if (!route.permission) return true
            return hasPermission(route.permission)
        })
    }

    const routes = getRoutes()

    return (
        <>
            {/* Mobile Trigger */}
            <div className="md:hidden fixed top-4 right-4 z-[9999]">
                <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setIsMobileOpen(!isMobileOpen)}
                    title={isMobileOpen ? "Close menu" : "Open menu"}
                >
                    {isMobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
                </Button>
            </div>

            <div className={cn(
                "h-screen border-r bg-background fixed left-0 top-0 bottom-0 z-40 w-64 transition-transform duration-300 md:translate-x-0 flex flex-col overflow-hidden",
                isMobileOpen ? "translate-x-0" : "-translate-x-full",
                className
            )}>
                {/* Header - Fixed */}
                <div className="px-6 py-4 border-b flex-shrink-0">
                    <h2 className="text-2xl font-bold tracking-tight text-primary">Admin Panel</h2>
                    <p className="text-xs text-muted-foreground mt-1">Super Admin Console</p>
                </div>

                {/* Scrollable Menu Area */}
                <ScrollArea className="flex-1 min-h-0 py-4 px-3 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-muted-foreground/10 hover:[&::-webkit-scrollbar-thumb]:bg-muted-foreground/30 transition-colors">
                    <nav className="space-y-1">
                        {routes.map((route) => (
                            <div key={route.href}>
                                {route.subItems ? (
                                    <>
                                        <button
                                            onClick={() => toggleMenu(route.label)}
                                            className={cn(
                                                "text-sm group flex p-3 w-full justify-between items-center font-medium cursor-pointer hover:text-primary hover:bg-primary/10 rounded-lg transition",
                                                route.active ? "text-primary bg-primary/10" : "text-muted-foreground"
                                            )}
                                        >
                                            <div className="flex items-center">
                                                <route.icon className={cn("h-5 w-5 mr-3", route.active ? "text-primary" : "text-muted-foreground")} />
                                                {route.label}
                                            </div>
                                            {expandedMenus.includes(route.label) ? (
                                                <ChevronDown className="h-4 w-4" />
                                            ) : (
                                                <ChevronRight className="h-4 w-4" />
                                            )}
                                        </button>
                                        {expandedMenus.includes(route.label) && (
                                            <div className="ml-8 mt-1 space-y-1">
                                                {route.subItems.map((sub) => (
                                                    <Link
                                                        key={sub.href}
                                                        href={sub.href}
                                                        className={cn(
                                                            "text-sm flex p-2 rounded-md transition hover:bg-primary/5",
                                                            pathname === sub.href ? "text-primary font-medium" : "text-muted-foreground"
                                                        )}
                                                    >
                                                        {sub.label}
                                                    </Link>
                                                ))}
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <Link
                                        href={route.href}
                                        className={cn(
                                            "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-primary hover:bg-primary/10 rounded-lg transition",
                                            route.active ? "text-primary bg-primary/10" : "text-muted-foreground"
                                        )}
                                    >
                                        <div className="flex items-center flex-1">
                                            <route.icon className={cn("h-5 w-5 mr-3", route.active ? "text-primary" : "text-muted-foreground")} />
                                            {route.label}
                                        </div>
                                    </Link>
                                )}
                            </div>
                        ))}
                    </nav>
                </ScrollArea>

                {/* Bottom Actions - Fixed */}
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
