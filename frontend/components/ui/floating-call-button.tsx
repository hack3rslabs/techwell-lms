"use client"

import * as React from 'react'
import { Phone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function FloatingCallButton() {
    const [isVisible, setIsVisible] = React.useState(true)

    // Optional: Hide on scroll down, show on scroll up? Or just always visible?
    // User asked for "easyly on webpage", so always visible is best.

    return (
        <a
            href="tel:+917997473473"
            className={cn(
                "fixed z-50 bottom-24 right-6 md:bottom-24 md:right-8 transition-all duration-300 hover:scale-110 shadow-lg",
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
            )}
            aria-label="Call Us"
        >
            <Button
                size="icon"
                className="h-12 w-12 rounded-full bg-green-600 hover:bg-green-700 text-white shadow-xl animate-pulse"
            >
                <Phone className="h-6 w-6" />
                <span className="sr-only">Call Us</span>
            </Button>
        </a>
    )
}
