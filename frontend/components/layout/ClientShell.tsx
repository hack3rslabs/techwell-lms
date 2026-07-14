"use client"

import { usePathname } from "next/navigation"
import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
import { ScrollButton } from "@/components/ui/scroll-button"
import { FloatingCallButton } from "@/components/ui/floating-call-button"

// Routes that should NOT show public Header/Footer
const DASHBOARD_PREFIXES = [
    '/admin',
    '/dashboard',
    '/franchise-admin',
]

export function ClientShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()

    const isDashboard = DASHBOARD_PREFIXES.some(prefix =>
        pathname === prefix || pathname.startsWith(prefix + '/')
    )

    if (isDashboard) {
        // Authenticated workspace — no public chrome
        return <>{children}</>
    }

    // Public website — full chrome
    return (
        <>
            <div className="print:hidden">
                <Header />
            </div>
            <main className="flex-1 w-full">
                {children}
            </main>
            <div className="print:hidden">
                <Footer />
            </div>
            <div className="print:hidden">
                <ScrollButton />
            </div>
            <div className="print:hidden">
                <FloatingCallButton />
            </div>
        </>
    )
}
