"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
    LayoutDashboard,
    Briefcase,
    Video,
    BarChart3,
    LogOut,
    PlusCircle,
    Building2,
    Users
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"

const sidebarItems = [
    {
        title: "Dashboard",
        href: "/employer/dashboard",
        icon: LayoutDashboard,
    },
    {
        title: "Jobs",
        href: "/employer/jobs",
        icon: Briefcase,
    },
    {
        title: "Candidates",
        href: "/employer/candidates",
        icon: Users,
    },
    {
        title: "Interviews",
        href: "/employer/interviews",
        icon: Video,
    },
    {
        title: "Analytics",
        href: "/employer/reports",
        icon: BarChart3,
    },
    {
        title: "Company Profile",
        href: "/employer/profile",
        icon: Building2,
    },
]

export function EmployerSidebar() {
    const pathname = usePathname()
    const { logout } = useAuth()

    const isActive = (href: string) =>
        pathname === href || pathname.startsWith(href + '/')

    return (
        <div className="flex h-screen w-64 flex-col fixed left-0 top-0 bg-white border-r border-gray-200 z-50">
            {/* Brand Header */}
            <div className="flex h-16 items-center px-6 border-b border-gray-100">
                <Link href="/" className="flex items-center gap-3 group">
                    <div className="h-9 w-9 rounded-lg bg-blue-600 flex items-center justify-center shadow-sm group-hover:bg-blue-700 transition-colors">
                        <Briefcase className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-lg font-bold text-gray-900 leading-none tracking-tight">
                            TechWell
                        </span>
                        <span className="text-[11px] font-semibold text-blue-600 uppercase tracking-widest mt-0.5">
                            Recruiter
                        </span>
                    </div>
                </Link>
            </div>

            {/* Navigation */}
            <div className="flex-1 min-h-0 py-6 overflow-y-auto px-4 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-200 hover:[&::-webkit-scrollbar-thumb]:bg-gray-300 transition-colors">
                <nav className="space-y-1.5">
                    {sidebarItems.map((item) => {
                        const active = isActive(item.href)
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 group",
                                    active
                                        ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                                )}
                            >
                                <item.icon className={cn(
                                    "h-5 w-5",
                                    active ? "text-white" : "text-gray-400 group-hover:text-gray-600"
                                )} />
                                {item.title}
                            </Link>
                        )
                    })}
                </nav>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-100 bg-gray-50/50 space-y-3">
                <Link href="/employer/jobs/new">
                    <Button className="w-full justify-center bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-sm">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Post Job
                    </Button>
                </Link>
                <Button
                    variant="ghost"
                    className="w-full justify-start gap-2 text-gray-500 hover:text-red-600 hover:bg-red-50"
                    onClick={logout}
                >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                </Button>
            </div>
        </div>
    )
}
