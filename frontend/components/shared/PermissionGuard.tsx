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
        if (path.startsWith("/admin/roles") || path.startsWith("/admin/users") || path.startsWith("/admin/employers") || path.startsWith("/admin/employer-requests")) return "USERS"
        if (path.startsWith("/admin/students")) return "STUDENTS"
        if (path.startsWith("/admin/courses") || path.startsWith("/admin/training")) return "COURSES"
        if (path.startsWith("/admin/batches")) return "BATCHES"
        if (path.startsWith("/admin/live-classes")) return "LIVE_CLASSES"
        if (path.startsWith("/admin/certificates")) return "CERTIFICATES"
        if (path.startsWith("/admin/leads")) return "LEADS"
        if (path.startsWith("/admin/crm") || path.startsWith("/admin/campus-drives") || path.startsWith("/admin/companies") || path.startsWith("/admin/institutes")) return "CENTRAL_CRM"
        if (path.startsWith("/admin/finance")) return "FINANCE"
        if (path.startsWith("/admin/ai-interviews")) return "AI_INTERVIEWS"
        if (path.startsWith("/admin/meetings")) return "MEETINGS"
        if (path.startsWith("/admin/tasks")) return "TASKS"
        if (path.startsWith("/admin/messages")) return "MESSAGES"
        if (path.startsWith("/admin/blogs") || path.startsWith("/admin/posts")) return "BLOGS"
        if (path.startsWith("/admin/gallery")) return "GALLERY"
        if (path.startsWith("/admin/skillcasts")) return "SKILLCASTS"
        if (path.startsWith("/admin/reviews")) return "REVIEWS"
        if (path.startsWith("/admin/library")) return "LIBRARY"
        if (path.startsWith("/admin/events")) return "EVENTS"
        if (path.startsWith("/admin/automation")) return "AUTOMATION_STUDIO"
        if (path.startsWith("/admin/consultancy")) return "CONSULTANCY"
        if (path.startsWith("/admin/audit-logs") || path.startsWith("/admin/operations") || path.startsWith("/admin/documents")) return "SYSTEM_LOGS"
        if (path.startsWith("/admin/reports") || path.startsWith("/admin/analytics")) return "REPORTS"
        if (path.startsWith("/admin/support") || path.startsWith("/admin/help-center")) return "TICKETS"
        if (path.startsWith("/admin/settings")) return "SETTINGS"
        if (path.startsWith("/admin/team") || path.startsWith("/admin/staff")) return "TEAM_MANAGEMENT"
        if (path.startsWith("/admin/cms/pages")) return "PAGE_BUILDER"
        if (path.startsWith("/admin/cms")) return "CMS"
        if (path.startsWith("/admin/marketing/ads")) return "ADS_MANAGER"
        if (path.startsWith("/admin/marketing") || path.startsWith("/admin/seo") || path.startsWith("/admin/success-stories")) return "MARKETING_HUB"
        if (path.startsWith("/admin/franchise") || path.startsWith("/admin/partnerships")) return "PARTNERSHIPS"
        if (path.startsWith("/admin/global-data")) return "GLOBAL_DATA"
        if (path.startsWith("/admin/coupons")) return "COUPONS"
        if (path.startsWith("/admin/transactions")) return "TRANSACTIONS"
        if (path === "/admin") return "DASHBOARD"
        return "SYSTEM_LOGS" // Fallback: require an advanced permission rather than null bypass
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
