"use client"

import * as React from "react"
import { ArrowUp, ArrowDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function ScrollButton() {
    const [direction, setDirection] = React.useState<'up' | 'down'>('down')
    const [_isVisible, _setIsVisible] = React.useState(true)

    React.useEffect(() => {
        const toggleVisibility = () => {
            if (window.scrollY > 300) {
                setDirection('up')
            } else {
                setDirection('down')
            }
        }

        window.addEventListener("scroll", toggleVisibility)
        return () => window.removeEventListener("scroll", toggleVisibility)
    }, [])

    const scrollTo = () => {
        if (direction === 'up') {
            window.scrollTo({
                top: 0,
                behavior: "smooth",
            })
        } else {
            window.scrollTo({
                top: document.body.scrollHeight,
                behavior: "smooth",
            })
        }
    }

    return (
        <div className="fixed bottom-8 right-8 z-[100]">
            <Button
                size="icon"
                variant="outline"
                onClick={scrollTo}
                className={cn(
                    "rounded-full h-12 w-12 shadow-lg backdrop-blur-sm bg-background/50 hover:bg-background/80 transition-all duration-300 border-primary/20",
                    direction === 'up' ? "bg-primary/10 hover:bg-primary/20" : ""
                )}
                aria-label={direction === 'up' ? "Scroll to top" : "Scroll to bottom"}
            >
                {direction === 'up' ? (
                    <ArrowUp className="h-6 w-6 text-primary animate-bounce" />
                ) : (
                    <ArrowDown className="h-6 w-6 text-primary animate-bounce" />
                )}
            </Button>
        </div>
    )
}
