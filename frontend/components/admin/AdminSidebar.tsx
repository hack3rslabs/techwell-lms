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
    Briefcase,
    Image as ImageIcon
} from "lucide-react"
import { Button } from "@/components/ui/button"
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

    // Unified Routes Configuration
    const getRoutesConfig = () => [
        {
            label: "Dashboard",
            icon: LayoutDashboard,
            href: "/admin",
            active: pathname === "/admin",
        },
        {
            label: "User Management",
            icon: Users,
            subItems: [
                { label: "Users & Roles", href: "/admin/users", permission: 'MANAGE_USERS' },
                { label: "Courses", href: "/admin/courses", permission: 'MANAGE_COURSES' },
                { label: "Certificates", href: "/admin/certificates", permission: 'MANAGE_CERTIFICATES' },
                { label: "Enroll Requests", href: "/admin/enrolls", permission: 'MANAGE_USERS' },
                { label: "Employer Requests", href: "/admin/employers", permission: 'MANAGE_USERS' },
            ]
        },
        {
            label: "Leads & CRM",
            icon: Magnet,
            permission: 'VIEW_LEADS',
            subItems: [
                { label: "All Leads", href: "/admin/leads" },
                { label: "Meetings", href: "/admin/meetings" },
                { label: "Tasks", href: "/admin/tasks" },
            ]
        },
        {
            label: "Learning CMS",
            icon: GraduationCap,
            permission: 'MANAGE_CONTENT',
            subItems: [
                { label: "Blogs", href: "/admin/blogs" },
                { label: "Gallery", href: "/admin/gallery" },
                { label: "Skillcasts", href: "/admin/skillcasts" },
                { label: "Reviews", href: "/admin/reviews" },
                { label: "Library", href: "/admin/library" },
            ]
        },
        {
            label: "AI Subsystems",
            icon: Bot,
            permission: 'MANAGE_SETTINGS',
            subItems: [
                { label: "AI Configurations", href: "/admin/ai" },
                { label: "Training Data", href: "/admin/ai/training" },
                { label: "AI Interviews", href: "/admin/ai-interviews" },
            ]
        },
        {
            label: "Finance",
            icon: CreditCard,
            permission: 'VIEW_FINANCE',
            subItems: [
                { label: "Payments", href: "/admin/payments" },
                { label: "Pricing & Plans", href: "/admin/pricing" },
            ]
        },
        {
            label: "Operations",
            icon: Briefcase,
            subItems: [
                { label: "Job Board", href: "/admin/jobs" },
                { label: "Projects Market", href: "/admin/projects" },
                { label: "Support Tickets", href: "/admin/support", permission: 'VIEW_SUPPORT' },
            ]
        },
        {
            label: "Technical & Config",
            icon: Settings,
            permission: 'MANAGE_SETTINGS',
            subItems: [
                { label: "General Settings", href: "/admin/settings" },
                { label: "Video Integration", href: "/admin/video-settings" },
                { label: "System Logs", href: "/admin/logs" },
            ]
        }
    ]

    // Close mobile menu on route change
    useEffect(() => {
        if (isMobileOpen) {
            setTimeout(() => setIsMobileOpen(false), 0)
        }
    }, [pathname, isMobileOpen])

    // Auto-expand active parent menu dynamically based on current route
    useEffect(() => {
        const routes = getRoutesConfig()
        routes.forEach(route => {
            if (route.subItems && route.subItems.some(sub => pathname.startsWith(sub.href))) {
                setExpandedMenus(prev => {
                    if (!prev.includes(route.label)) {
                        return [...prev, route.label]
                    }
                    return prev
                })
            }
        })
    }, [pathname])

    const toggleMenu = (label: string) => {
        setExpandedMenus(prev =>
            prev.includes(label)
                ? prev.filter(l => l !== label)
                : [...prev, label]
        )
    }

    // Prepare routes depending on permissions
    const routesFilter = () => {
        const rawRoutes = getRoutesConfig()
        
        return rawRoutes.map(parent => {
            // First check if parent has a macro permission requirement
            if (parent.permission && !hasPermission(parent.permission)) {
                return null;
            }
            
            // Then filter subItems based on granular permissions if any
            let finalParent = { ...parent };
            
            if (parent.subItems) {
                const subItems = parent.subItems.filter(sub => {
                    if (sub.permission && !hasPermission(sub.permission)) return false;
                    return true;
                });
                
                // If all subItems were filtered out, hide parent
                if (subItems.length === 0) return null;
                
                finalParent.subItems = subItems;
            }
            
            // Inject active states dynamically if not explicitly defined
            if (finalParent.active === undefined) {
                if (finalParent.subItems) {
                    finalParent.active = finalParent.subItems.some(sub => pathname === sub.href || pathname.startsWith(sub.href + '/'));
                } else if (finalParent.href) {
                    finalParent.active = pathname === finalParent.href || pathname.startsWith(finalParent.href + '/');
                }
            }
            
            return finalParent;
        }).filter(Boolean) as ReturnType<typeof getRoutesConfig>;
    }

    const availableRoutes = routesFilter();

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
                <div className="px-6 py-4 border-b flex-shrink-0 bg-background z-10">
                    <h2 className="text-2xl font-bold tracking-tight text-primary">Admin Panel</h2>
                    <p className="text-xs text-muted-foreground mt-1">Super Admin Console</p>
                </div>

                {/* Scrollable Menu Area - Pure native scrolling */}
                <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 relative" style={{ overscrollBehavior: 'contain' }}>
                    <nav className="space-y-1 pb-6 w-full">
                        {availableRoutes.map((route) => (
                            <div key={route.href || route.label} className="w-full">
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
                                                <ChevronDown className="h-4 w-4 flex-shrink-0" />
                                            ) : (
                                                <ChevronRight className="h-4 w-4 flex-shrink-0" />
                                            )}
                                        </button>
                                        {expandedMenus.includes(route.label) && (
                                            <div className="ml-8 mt-1 space-y-1">
                                                {route.subItems.map((sub) => {
                                                    const isSubActive = pathname === sub.href || pathname.startsWith(sub.href + '/');
                                                    return (
                                                        <Link
                                                            key={sub.href}
                                                            href={sub.href}
                                                            className={cn(
                                                                "text-sm flex p-2 rounded-md transition hover:bg-primary/5 break-words whitespace-normal",
                                                                isSubActive ? "text-primary font-medium bg-primary/5" : "text-muted-foreground"
                                                            )}
                                                        >
                                                            {sub.label}
                                                        </Link>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <Link
                                        href={route.href!}
                                        className={cn(
                                            "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-primary hover:bg-primary/10 rounded-lg transition break-words whitespace-normal",
                                            route.active ? "text-primary bg-primary/10" : "text-muted-foreground"
                                        )}
                                    >
                                        <div className="flex items-center flex-1">
                                            <route.icon className={cn("h-5 w-5 mr-3 flex-shrink-0", route.active ? "text-primary" : "text-muted-foreground")} />
                                            {route.label}
                                        </div>
                                    </Link>
                                )}
                            </div>
                        ))}
                    </nav>
                </div>

                {/* Bottom Actions - Fixed */}
                <div className="border-t p-3 flex-shrink-0 bg-background mt-auto">
                    <Button
                        variant="ghost"
                        className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50"
                        onClick={logout}
                    >
                        <LogOut className="h-5 w-5 mr-3 flex-shrink-0" />
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
