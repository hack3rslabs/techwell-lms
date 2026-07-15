"use client"
import React, { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { usePathname } from 'next/navigation'
import { Wrench } from 'lucide-react'

export function SystemStatusManager() {
    const [status, setStatus] = useState({ isTestMode: false, isMaintenanceMode: false })
    const [loading, setLoading] = useState(true)
    const pathname = usePathname()

    useEffect(() => {
        api.get('/settings/public')
            .then(res => {
                if (res.data) {
                    setStatus({
                        isTestMode: !!res.data.isTestMode,
                        isMaintenanceMode: !!res.data.isMaintenanceMode
                    })
                }
            })
            .catch(() => {})
            .finally(() => setLoading(false))
    }, [])

    if (loading) return null

    const isAdminRoute = pathname?.startsWith('/admin') || pathname?.startsWith('/login')

    // If maintenance mode is ON and user is on a public page, block the screen
    if (status.isMaintenanceMode && !isAdminRoute) {
        return (
            <div className="fixed inset-0 z-[99999] bg-slate-50 flex flex-col items-center justify-center p-4">
                <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center space-y-6 border border-slate-200">
                    <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto">
                        <Wrench className="w-10 h-10 text-indigo-600" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">We'll be back soon!</h1>
                        <p className="mt-4 text-slate-600 leading-relaxed">
                            Techwell is currently undergoing scheduled maintenance to improve our platform. We expect to be back online shortly. Thank you for your patience!
                        </p>
                    </div>
                </div>
            </div>
        )
    }

    // If test mode is ON, show the banner at the top
    if (status.isTestMode) {
        return (
            <div className="bg-destructive text-destructive-foreground text-center py-2 font-bold text-sm z-[9999] relative flex items-center justify-center gap-2">
                <span className="animate-pulse">⚠️</span>
                THIS SITE IS IN TEST MODE. PLEASE BE AWARE AND DO NOT MAKE ONLINE PAYMENTS.
                <span className="animate-pulse">⚠️</span>
            </div>
        )
    }

    return null
}
