"use client"

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  FileText, PenTool, LayoutDashboard, CheckCircle, 
  Clock, Archive, Tags, Users, Image as ImageIcon, 
  Search, Sparkles, Settings, MessageSquare, BarChart3,
  Globe
} from 'lucide-react'

const MENU_ITEMS = [
  { group: 'Overview', items: [
    { label: 'Blog Dashboard', href: '/admin/blogs/dashboard', icon: LayoutDashboard },
    { label: 'All Articles', href: '/admin/blogs', icon: Globe },
    { label: 'Create Blog', href: '/admin/blogs/editor', icon: PenTool, highlight: true },
  ]},
  { group: 'Content Workflow', items: [
    { label: 'Drafts', href: '/admin/blogs?status=DRAFT', icon: FileText },
    { label: 'Pending Review', href: '/admin/blogs?status=REVIEW', icon: CheckCircle },
    { label: 'Published', href: '/admin/blogs?status=PUBLISHED', icon: Globe },
    { label: 'Scheduled', href: '/admin/blogs?status=SCHEDULED', icon: Clock },
    { label: 'Archived', href: '/admin/blogs?status=ARCHIVED', icon: Archive },
  ]}
]

export default function BlogsAdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  // If we are strictly in the full-bleed editor, we might not want the sidebar to show
  // to maintain distraction-free mode.
  const isEditor = pathname.includes('/admin/blogs/editor')

  if (isEditor) {
      return <>{children}</>
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
      
      {/* CMS Sidebar */}
      <aside className="w-72 flex-shrink-0 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col h-full overflow-y-auto hidden md:flex">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800">
            <h1 className="text-xl font-black tracking-tight flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                    <PenTool className="h-4 w-4" />
                </div>
                Techwell CMS
            </h1>
        </div>
        
        <div className="flex-1 py-6 px-4 space-y-8">
            {MENU_ITEMS.map((group, idx) => (
                <div key={idx} className="space-y-2">
                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-3 mb-3">{group.group}</h3>
                    <div className="space-y-1">
                        {group.items.map(item => {
                            const Icon = item.icon
                            const isActive = pathname === item.href || (item.href !== '/admin/blogs' && pathname.startsWith(item.href))
                            
                            return (
                                <Link 
                                    key={item.href} 
                                    href={item.href}
                                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                                        isActive 
                                            ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400' 
                                            : item.highlight 
                                                ? 'bg-gradient-to-r from-purple-500/10 to-pink-500/10 text-purple-700 dark:text-purple-400 hover:from-purple-500/20 hover:to-pink-500/20'
                                                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white'
                                    }`}
                                >
                                    <Icon className={`h-4 w-4 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : ''}`} />
                                    {item.label}
                                </Link>
                            )
                        })}
                    </div>
                </div>
            ))}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
