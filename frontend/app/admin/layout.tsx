"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"
import { AdminSidebar } from "@/components/admin/AdminSidebar"
import { PermissionGuard } from "@/components/shared/PermissionGuard"
import { AdminTopBar } from "@/components/admin/AdminTopBar"

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const { user, isAuthenticated, isLoading } = useAuth()
    const router = useRouter()
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

    useEffect(() => {
        if (!isLoading) {
            if (!isAuthenticated) {
                router.push('/login')
                return
            }
            if (user?.role === 'STUDENT') {
                router.push('/dashboard')
                return
            }
        }
    }, [isLoading, isAuthenticated, user, router])

    if (isLoading) {
        return (
            <div className="h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                    <p className="text-sm text-muted-foreground">Loading workspace...</p>
                </div>
            </div>
        )
    }

    if (!isAuthenticated || user?.role === 'STUDENT') {
        return null
    }

    return (
        <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
            {/* Fixed Sidebar */}
            <AdminSidebar
                isCollapsed={isSidebarCollapsed}
                onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            />

            {/* Main workspace — scrollable */}
            <div className={`flex flex-col flex-1 min-w-0 transition-all duration-300 ${isSidebarCollapsed ? 'md:ml-20' : 'md:ml-64'}`}>
                {/* Sticky Top Bar */}
                <AdminTopBar isSidebarCollapsed={isSidebarCollapsed} />

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto">
                    <div className="p-6 md:p-8">
                        <PermissionGuard>
                            {children}
                        </PermissionGuard>
                    </div>
                </main>
            </div>
        </div>
    )
}