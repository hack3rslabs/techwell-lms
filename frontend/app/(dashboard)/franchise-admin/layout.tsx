"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"
import { FranchiseSidebar } from "@/components/franchise/FranchiseSidebar"
import { PermissionGuard } from "@/components/shared/PermissionGuard"

export default function FranchiseAdminLayout({
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

            // Only allow FRANCHISE_ADMIN or super roles
            if (user?.role !== 'FRANCHISE_ADMIN' && user?.role !== 'SUPER_ADMIN') {
                router.push('/dashboard')
                return
            }
        }
    }, [isLoading, isAuthenticated, user, router])

    if (isLoading) {
        return (
            <div className="h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    if (!isAuthenticated || (user?.role !== 'FRANCHISE_ADMIN' && user?.role !== 'SUPER_ADMIN')) {
        return null
    }

    return (
        <div className="flex min-h-screen no-scrollbar">
            <FranchiseSidebar 
                isCollapsed={isSidebarCollapsed} 
                onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)} 
            />

            <div className={`flex-1 p-8 bg-muted/10 transition-all duration-300 ${isSidebarCollapsed ? 'md:ml-20' : 'md:ml-64'}`}>
                {children}
            </div>
        </div>
    )
}
