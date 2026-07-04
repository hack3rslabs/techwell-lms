"use client"

import { useAuth } from "@/lib/auth-context"
import { usePathname } from "next/navigation"
import { AccessDenied } from "./AccessDenied"
import { Loader2 } from "lucide-react"

interface PermissionGuardProps {
    children: React.ReactNode
    featureCode?: string
}

export function PermissionGuard({ children, featureCode }: PermissionGuardProps) {
    const { hasPermission, isLoading } = useAuth()
    const pathname = usePathname()

    // Map pathname to feature code if not provided
    const getFeatureFromPath = (path: string) => {
        if (path.startsWith("/admin/roles") || path.startsWith("/admin/users")) return "USERS"
        if (path.startsWith("/admin/courses")) return "COURSES"
        if (path.startsWith("/admin/certificates")) return "CERTIFICATES"
        if (path.startsWith("/admin/students")) return "USERS"
        if (path.startsWith("/admin/employer-requests")) return "USERS"
        if (path.startsWith("/admin/employers")) return "USERS"
        if (path.startsWith("/admin/leads")) return "LEADS"
        if (path.startsWith("/admin/finance")) return "FINANCE"
        if (path.startsWith("/admin/ai-interviews")) return "COURSES"
        if (path.startsWith("/admin/live-classes")) return "COURSES"
        if (path.startsWith("/admin/meetings")) return "USERS"
        if (path.startsWith("/admin/tasks")) return "USERS"
        if (path.startsWith("/admin/messages")) return "USERS"
        if (path.startsWith("/admin/blogs")) return "BLOGS"
        if (path.startsWith("/admin/gallery")) return "COURSES"
        if (path.startsWith("/admin/skillcasts")) return "COURSES"
        if (path.startsWith("/admin/reviews")) return "COURSES"
        if (path.startsWith("/admin/library")) return "COURSES"
        if (path.startsWith("/admin/audit-logs")) return "SYSTEM_LOGS"
        if (path.startsWith("/admin/reports")) return "REPORTS"
        if (path.startsWith("/admin/support") || path.startsWith("/admin/help-center")) return "TICKETS"
        if (path.startsWith("/admin/settings")) return "SETTINGS"
        if (path === "/admin") return "DASHBOARD"
        return null
    }

    const code = featureCode || getFeatureFromPath(pathname)

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    if (code && !hasPermission(code)) {
        return <AccessDenied />
    }

    return <>{children}</>
}
