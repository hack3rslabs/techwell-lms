"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"
import { AdminSidebar } from "@/components/admin/AdminSidebar"

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const { user, isAuthenticated, isLoading } = useAuth()
    const router = useRouter()
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    useEffect(() => {
        if (!isLoading && mounted) {
            if (!isAuthenticated || !['SUPER_ADMIN', 'ADMIN', 'INSTITUTE_ADMIN', 'STAFF'].includes(user?.role || '')) {
                router.push('/dashboard')
            }
        }
    }, [isLoading, isAuthenticated, user, router, mounted])

    if (isLoading || !mounted) {
        return (
            <div className="h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    if (!isAuthenticated || !['SUPER_ADMIN', 'ADMIN', 'INSTITUTE_ADMIN', 'STAFF'].includes(user?.role || '')) {
        return null
    }

    return (
        <div className="flex min-h-screen">

            {/* Sidebar */}
            <AdminSidebar className="w-64 fixed left-0 top-0 h-screen hidden md:block" />

            {/* Main Content */}
            <div className="flex flex-col flex-1 md:ml-64 min-h-screen">

                {/* Page Content */}
                <main className="flex-1 p-8 bg-muted/10">
                    {children}
                </main>

            </div>

        </div>
    )
}
