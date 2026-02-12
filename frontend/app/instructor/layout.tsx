"use client"

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    LayoutDashboard,
    BookOpen,
    Users,
    MessageSquare,
    Settings,
    LogOut,
    Menu,
    X,
    Bell,
    UserCircle,
    PlusCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/auth-context'

interface SidebarItemProps {
    href: string
    icon: React.ElementType
    label: string
    active: boolean
}

const SidebarItem = ({ href, icon: Icon, label, active }: SidebarItemProps) => (
    <Link href={href}>
        <div className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${active
            ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
            : 'hover:bg-muted text-muted-foreground hover:text-foreground'
            }`}>
            <Icon className={`h-5 w-5 ${active ? '' : 'group-hover:scale-110 transition-transform'}`} />
            <span className="font-semibold text-sm">{label}</span>
        </div>
    </Link>
)

export default function InstructorLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    const { logout, user } = useAuth()
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(false)

    const sidebarItems = [
        { href: '/instructor', icon: LayoutDashboard, label: 'Overview' },
        { href: '/instructor/courses', icon: BookOpen, label: 'My Courses' },
        { href: '/instructor/batches', icon: Users, label: 'Batches' },
        { href: '/instructor/students', icon: Users, label: 'Students' },
        { href: '/instructor/assessments', icon: MessageSquare, label: 'Assessments' },
        { href: '/instructor/announcements', icon: Bell, label: 'Announcements' },
        { href: '/instructor/feedback', icon: MessageSquare, label: 'Feedback' },
        { href: '/instructor/settings', icon: Settings, label: 'Settings' },
    ]

    return (
        <div className="min-h-screen bg-[#F8FAFC]">
            {/* Mobile Header */}
            <div className="lg:hidden h-16 border-b bg-white/80 backdrop-blur-md flex items-center justify-between px-4 sticky top-0 z-50">
                <div className="flex items-center gap-2">
                    <div className="bg-primary h-8 w-8 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-xl">T</span>
                    </div>
                    <span className="font-bold text-xl tracking-tight">TechWell</span>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
                    {isSidebarOpen ? <X /> : <Menu />}
                </Button>
            </div>

            <div className="flex">
                {/* Sidebar */}
                <aside className={`
                    fixed inset-y-0 left-0 z-40 w-72 bg-white/80 backdrop-blur-xl border-r p-6 transform transition-transform duration-300 lg:translate-x-0 lg:static
                    ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                `}>
                    <div className="flex flex-col h-full">
                        <div className="flex items-center gap-3 mb-10 px-2">
                            <div className="bg-primary h-10 w-10 rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                                <span className="text-white font-bold text-2xl">T</span>
                            </div>
                            <div>
                                <h1 className="font-bold text-xl tracking-tight leading-none">TechWell</h1>
                                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-1 italic">Instructor</p>
                            </div>
                        </div>

                        <nav className="flex-1 min-h-0 space-y-2 overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-muted-foreground/10 hover:[&::-webkit-scrollbar-thumb]:bg-muted-foreground/30 transition-colors">
                            {sidebarItems.map((item) => (
                                <SidebarItem
                                    key={item.href}
                                    {...item}
                                    active={pathname === item.href}
                                />
                            ))}
                        </nav>

                        <div className="mt-auto space-y-4">
                            <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10">
                                <h3 className="text-sm font-bold mb-1">Need help?</h3>
                                <p className="text-xs text-muted-foreground mb-3">Check our documentation for instructors.</p>
                                <Button variant="outline" size="sm" className="w-full text-xs font-bold rounded-xl h-8">
                                    View Guide
                                </Button>
                            </div>

                            <Button
                                variant="ghost"
                                className="w-full justify-start gap-3 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-xl px-4 py-3 h-auto"
                                onClick={logout}
                            >
                                <LogOut className="h-5 w-5" />
                                <span className="font-semibold text-sm">Logout</span>
                            </Button>
                        </div>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 min-h-screen">
                    {/* Top Header */}
                    <div className="hidden lg:flex h-20 items-center justify-between px-10 bg-white/50 backdrop-blur-sm sticky top-0 z-30 border-b">
                        <div className="relative w-96">
                            <h2 className="text-xl font-bold text-slate-800">
                                Welcome back, {user?.name?.split(' ')[0] || 'Instructor'}! 👋
                            </h2>
                            <p className="text-xs text-muted-foreground font-medium">Here&apos;s what&apos;s happening today.</p>
                        </div>

                        <div className="flex items-center gap-6">
                            <Button variant="outline" className="rounded-xl font-bold bg-white shadow-sm border-slate-200">
                                <PlusCircle className="h-4 w-4 mr-2" />
                                Create New Course
                            </Button>

                            <div className="h-8 w-px bg-slate-200" />

                            <div className="flex items-center gap-4">
                                <div className="relative">
                                    <Button variant="ghost" size="icon" className="rounded-xl hover:bg-white shadow-sm">
                                        <Bell className="h-5 w-5 text-slate-600" />
                                    </Button>
                                    <div className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full border-2 border-white" />
                                </div>

                                <div className="flex items-center gap-3 pl-2">
                                    <div className="text-right">
                                        <p className="text-sm font-bold leading-none">{user?.name || 'Instructor'}</p>
                                        <p className="text-[10px] text-muted-foreground font-bold mt-1">Verified Instructor</p>
                                    </div>
                                    <div className="h-10 w-10 rounded-xl bg-slate-200 flex items-center justify-center overflow-hidden border-2 border-white shadow-md">
                                        <UserCircle className="h-8 w-8 text-slate-400" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Page Content */}
                    <div className="p-6 lg:p-10">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    )
}
