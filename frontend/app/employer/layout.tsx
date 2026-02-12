"use client"

import { EmployerSidebar } from "@/components/employer/EmployerSidebar"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Loader2 } from "lucide-react"

export default function EmployerLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const { user, isLoading, isAuthenticated } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (!isLoading) {
            if (!isAuthenticated) {
                router.push("/login")
            } else if (user?.role !== "EMPLOYER") {
                router.push("/dashboard")
            }
        }
    }, [isLoading, isAuthenticated, user, router])

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center bg-white">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        )
    }

    if (!isAuthenticated || user?.role !== "EMPLOYER") {
        return null
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <EmployerSidebar />
            <div className="pl-64">
                <main className="min-h-screen py-8 px-8">
                    {children}
                </main>
            </div>
        </div>
    )
}
