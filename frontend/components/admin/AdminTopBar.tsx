"use client"

import { useAuth } from "@/lib/auth-context"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import {
    Bell,
    ChevronRight,
    LogOut,
    Settings,
    User,
    Home,
    ArrowLeft
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface AdminTopBarProps {
    isSidebarCollapsed: boolean
}

export function AdminTopBar({ isSidebarCollapsed }: AdminTopBarProps) {
    const { user, logout } = useAuth()
    const pathname = usePathname()
    const router = useRouter()

    // Build breadcrumb from pathname
    const segments = pathname
        .replace(/^\/admin\/?/, "")
        .split("/")
        .filter(Boolean)

    const breadcrumbs = segments.map((seg) =>
        seg
            .replace(/-/g, " ")
            .replace(/\b\w/g, (c) => c.toUpperCase())
    )

    const initials = user?.name
        ? user.name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2)
        : "U"

    return (
        <header
            className={cn(
                "sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background/80 backdrop-blur-sm px-4 md:px-6"
            )}
        >
            <div className="flex items-center gap-4">
                {/* Back and Home Actions */}
                <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" onClick={() => router.push('/')} title="Go to Website Home">
                        <Home className="h-4 w-4" />
                    </Button>
                    {segments.length > 0 && (
                        <Button variant="ghost" size="icon" onClick={() => router.back()} title="Go Back">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    )}
                </div>

                {/* Breadcrumb */}
                <nav className="hidden sm:flex items-center gap-1 text-sm text-muted-foreground">
                    <span className="font-semibold text-foreground">Admin</span>
                {breadcrumbs.map((crumb, idx) => (
                    <span key={idx} className="flex items-center gap-1">
                        <ChevronRight className="h-3.5 w-3.5" />
                        <span
                            className={cn(
                                idx === breadcrumbs.length - 1
                                    ? "font-medium text-foreground"
                                    : ""
                            )}
                        >
                            {crumb}
                        </span>
                    </span>
                ))}
            </nav>
            </div>

            {/* Right side actions */}
            <div className="flex items-center gap-2">
                {/* User menu */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            className="relative h-9 w-9 rounded-full"
                        >
                            <Avatar className="h-9 w-9">
                                <AvatarImage
                                    src={user?.avatar || ""}
                                    alt={user?.name || "User"}
                                />
                                <AvatarFallback className="bg-indigo-100 text-indigo-700 text-sm font-semibold">
                                    {initials}
                                </AvatarFallback>
                            </Avatar>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel className="font-normal">
                            <div className="flex flex-col space-y-1">
                                <p className="text-sm font-semibold leading-none">
                                    {user?.name || "User"}
                                </p>
                                <p className="text-xs leading-none text-muted-foreground">
                                    {user?.email}
                                </p>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => router.push("/admin/settings")}>
                            <Settings className="mr-2 h-4 w-4" />
                            Settings
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            onClick={logout}
                            className="text-red-600 focus:text-red-600"
                        >
                            <LogOut className="mr-2 h-4 w-4" />
                            Sign Out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    )
}
