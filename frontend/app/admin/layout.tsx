"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter, usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"
import { AdminSidebar } from "@/components/admin/AdminSidebar"
import { PermissionGuard } from "@/components/shared/PermissionGuard"

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const { user, isAuthenticated, isLoading } = useAuth()
    const router = useRouter()
    const pathname = usePathname()
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    useEffect(() => {
        if (!isLoading && mounted) {
            // If not logged in, go to login
            if (!isAuthenticated) {
                router.push('/login')
                return
            }

            // Students are never allowed in Admin
            if (user?.role === 'STUDENT') {
                router.push('/dashboard')
                return
            }

            // All other roles (SUPER_ADMIN, ADMIN, STAFF, INSTRUCTOR, etc.)
            // are allowed in — the sidebar filters features by permission
        }
    }, [isLoading, isAuthenticated, user, router, mounted])

    // Show nothing while loading or before mounted to prevent blinking
    if (isLoading || !mounted) {
        return (
            <div className="h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    // Safety check for final render — only block students and unauthenticated users
    const isStudent = user?.role === 'STUDENT';

    if (!isAuthenticated || isStudent) {
        return null
    }

    return (
        <div className="flex min-h-screen no-scrollbar">

            {/* Sidebar */}
            <AdminSidebar />

            {/* Main Content */}
            <div className="flex-1 md:ml-64 p-8 bg-muted/10">
                <PermissionGuard>
                    {children}
                </PermissionGuard>
            </div>

        </div>
    )
}