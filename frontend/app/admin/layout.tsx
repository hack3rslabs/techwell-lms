"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter, usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { Loader2, Menu, ChevronRight, Bell } from "lucide-react"
import { AdminSidebar } from "@/components/admin/AdminSidebar"
import { PermissionGuard } from "@/components/shared/PermissionGuard"
import { Button } from "@/components/ui/button"

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const { user, isAuthenticated, isLoading } = useAuth()
    const router = useRouter()
    const pathname = usePathname()
    const [mounted, setMounted] = useState(false)
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

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
        <div className="flex min-h-screen no-scrollbar bg-slate-50/50 dark:bg-zinc-950">
            {/* Sidebar */}
            <AdminSidebar 
                isCollapsed={isSidebarCollapsed} 
                onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)} 
            />

            {/* Main Content Area */}
            <div className={`flex flex-col flex-1 transition-all duration-300 ${isSidebarCollapsed ? "md:ml-20" : "md:ml-64"} w-full`}>
                
                {/* Global Top Header / App Bar */}
                <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b bg-background/80 px-4 backdrop-blur-md shadow-sm">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                            className="hidden md:flex hover:bg-primary/10 hover:text-primary transition-colors"
                        >
                            <Menu className="h-5 w-5" />
                        </Button>
                        <div className="hidden sm:flex items-center text-sm text-muted-foreground">
                            <span className="font-medium text-foreground">Admin Portal</span>
                            <ChevronRight className="h-4 w-4 mx-1 opacity-50" />
                            <span className="capitalize">{pathname.split('/').pop()?.replace(/-/g, ' ') || 'Dashboard'}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Premium CTA Button globally available if needed, or just standard actions */}
                        <Button variant="outline" size="icon" className="rounded-full relative">
                            <Bell className="h-4 w-4" />
                            <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>
                        </Button>
                    </div>
                </header>

                <main className="flex-1 p-4 md:p-8 overflow-x-hidden">
                    <PermissionGuard>
                        {children}
                    </PermissionGuard>
                </main>
            </div>
        </div>
    )
}