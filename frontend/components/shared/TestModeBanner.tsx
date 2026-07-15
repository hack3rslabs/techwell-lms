"use client"
import React, { useEffect, useState } from 'react'
import { api } from '@/lib/api'

export function TestModeBanner() {
    const [isTestMode, setIsTestMode] = useState(false)

    useEffect(() => {
        api.get('/settings/public')
            .then(res => {
                if (res.data?.isTestMode) {
                    setIsTestMode(true)
                }
            })
            .catch(() => {})
    }, [])

    if (!isTestMode) return null

    return (
        <div className="bg-destructive text-destructive-foreground text-center py-2 font-bold text-sm z-[9999] relative flex items-center justify-center gap-2">
            <span className="animate-pulse">⚠️</span>
            THIS SITE IS IN TEST MODE. PLEASE BE AWARE AND DO NOT MAKE ONLINE PAYMENTS.
            <span className="animate-pulse">⚠️</span>
        </div>
    )
}
