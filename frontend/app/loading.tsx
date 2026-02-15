import { Loader2 } from "lucide-react"

export default function Loading() {
    return (
        <div className="min-h-[calc(100vh-4rem)] w-full flex flex-col items-center justify-center bg-background/50 backdrop-blur-sm z-50">
            <div className="relative">
                <div className="h-16 w-16 rounded-full border-4 border-primary/20 animate-pulse" />
                <Loader2 className="h-8 w-8 animate-spin text-primary absolute inset-0 m-auto" />
            </div>
            <h2 className="mt-4 text-sm font-medium text-muted-foreground animate-pulse">Loading TechWell Experience...</h2>
        </div>
    )
}
