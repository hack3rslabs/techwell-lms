"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { MessageSquare, MessagesSquare } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface SidebarNavProps extends React.HTMLAttributes<HTMLElement> {
    items: {
        href: string
        title: string
        icon: React.ComponentType<{ className?: string }>
    }[]
}

export function SidebarNav({ className, items, ...props }: SidebarNavProps) {
    const pathname = usePathname()

    return (
        <nav
            className={cn(
                "flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1",
                className
            )}
            {...props}
        >
            {items.map((item) => (
                <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                        "justify-start text-sm font-medium transition-colors hover:text-primary",
                        pathname === item.href
                            ? "bg-muted hover:bg-muted"
                            : "hover:bg-transparent hover:underline",
                    )}
                >
                    <Button
                        variant={pathname === item.href ? "secondary" : "ghost"}
                        className="w-full justify-start"
                    >
                        <item.icon className="mr-2 h-4 w-4" />
                        {item.title}
                    </Button>
                </Link>
            ))}
        </nav>
    )
}

export default function CommunityLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const sidebarNavItems = [
        {
            title: "Forum Discussions",
            href: "/community/forum",
            icon: MessageSquare,
        },
        {
            title: "Real-time Chat",
            href: "/community/chat",
            icon: MessagesSquare,
        }
    ]

    return (
        <div className="container py-8 space-y-6">
            <div className="space-y-0.5">
                <h2 className="text-2xl font-bold tracking-tight">Community & Collaboration</h2>
                <p className="text-muted-foreground">
                    Connect with peers, mentors, and the wider TechWell community.
                </p>
            </div>
            <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
                <aside className="-mx-4 lg:w-1/5">
                    <SidebarNav items={sidebarNavItems} />
                </aside>
                <div className="flex-1 lg:max-w-4xl">{children}</div>
            </div>
        </div>
    )
}
