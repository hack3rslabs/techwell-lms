"use client"

import { ShieldAlert, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export function AccessDenied() {
    const router = useRouter()

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] p-4 text-center">
            <div className="bg-red-100 p-4 rounded-full mb-6">
                <ShieldAlert className="h-12 w-12 text-red-600" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">Access Denied</h1>
            <p className="text-muted-foreground text-lg max-w-md mb-8">
                You do not have permission to access this feature. Please contact your administrator if you believe this is an error.
            </p>
            <div className="flex gap-4">
                <Button variant="outline" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Go Back
                </Button>
                <Button onClick={() => router.push("/admin")}>
                    Dashboard Home
                </Button>
            </div>
        </div>
    )
}
