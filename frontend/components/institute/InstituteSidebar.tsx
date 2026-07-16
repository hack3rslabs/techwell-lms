"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
    LayoutDashboard,
    Briefcase,
    Building2,
    Users,
    LogOut,
    GraduationCap,
    CheckSquare
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"

const sidebarItems = [
    {
        title: "Dashboard",
        href: "/institute/dashboard",
        icon: LayoutDashboard,
    },
    {
        title: "Campus Drives",
        href: "/institute/approvals",
        icon: Briefcase,
    },
    {
        title: "Students",
        href: "/institute/students",
        icon: Users,
    },
    {
        title: "Branding",
        href: "/institute/branding",
        icon: Building2,
    }
]

export function InstituteSidebar() {
    const pathname = usePathname()
    const { logout } = useAuth()

    const isActive = (href: string) =>
        pathname === href || pathname.startsWith(href + '/')

    return (
        <div className="flex h-screen w-64 flex-col fixed left-0 top-0 bg-white border-r border-gray-200 z-50">
            {/* Brand Header */}
            <div className="flex h-16 items-center px-6 border-b border-gray-100">
                <Link href="/" className="flex items-center gap-3 group">
                    <div className="h-9 w-9 rounded-lg bg-indigo-600 flex items-center justify-center shadow-sm group-hover:bg-indigo-700 transition-colors">
                        <GraduationCap className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-lg font-bold text-gray-900 leading-none tracking-tight">
                            Techwell
                        </span>
                        <span className="text-[11px] font-semibold text-indigo-600 uppercase tracking-widest mt-0.5">
                            Institute
                        </span>
                    </div>
                </Link>
            </div>

            {/* Navigation */}
            <div className="flex-1 min-h-0 py-6 overflow-y-auto px-4">
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
                                        ? "bg-indigo-600 text-white shadow-md shadow-indigo-200"
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

            </div>
        </div>
    )
}
