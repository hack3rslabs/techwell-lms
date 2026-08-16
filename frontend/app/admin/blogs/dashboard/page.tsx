"use client"

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  BarChart3, Eye, MousePointerClick, MessageSquare, 
  Users, UserPlus, TrendingUp, Sparkles, FileText
} from 'lucide-react'
import { blogApi } from '@/lib/api'
import { useAuth } from '@/lib/auth-context'

export default function BlogDashboardPage() {
    const { user } = useAuth()
    const [stats, setStats] = React.useState({
        totalViews: 0,
        uniqueVisitors: 0,
        avgReadingTime: 0,
        ctr: 0,
        totalShares: 0,
        totalComments: 0,
        leadsGenerated: 0,
        totalPublished: 0
    })
    const [topPosts, setTopPosts] = React.useState([])
    const [isLoading, setIsLoading] = React.useState(true)

    React.useEffect(() => {
        blogApi.getAnalyticsSummary()
            .then(res => {
                const data = res.data;
                setStats({
                    totalViews: data.totalViews || 0,
                    uniqueVisitors: Math.floor((data.totalViews || 0) * 0.7), // rough estimate for now
                    avgReadingTime: 3, // mock
                    ctr: 2.4, // mock
                    totalShares: Math.floor((data.totalViews || 0) * 0.1), // mock
                    totalComments: 0, // mock
                    leadsGenerated: data.totalLeads || 0,
                    totalPublished: data.publishedPosts || 0
                });
                setTopPosts(data.topPosts || []);
            })
            .catch(console.error)
            .finally(() => setIsLoading(false))
    }, [])

    const STAT_CARDS = [
        { title: 'Total Views', value: stats.totalViews.toLocaleString(), icon: Eye, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
        { title: 'Unique Visitors', value: stats.uniqueVisitors.toLocaleString(), icon: Users, color: 'text-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
        { title: 'Avg Reading Time', value: `${stats.avgReadingTime}m`, icon: BarChart3, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
        { title: 'Click-Through Rate', value: `${stats.ctr}%`, icon: MousePointerClick, color: 'text-violet-500', bg: 'bg-violet-50 dark:bg-violet-900/20' },
        { title: 'Leads Generated', value: stats.leadsGenerated, icon: UserPlus, color: 'text-rose-500', bg: 'bg-rose-50 dark:bg-rose-900/20' },
        { title: 'Total Comments', value: stats.totalComments, icon: MessageSquare, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20' },
        { title: 'Published Articles', value: stats.totalPublished, icon: FileText, color: 'text-slate-500', bg: 'bg-slate-50 dark:bg-slate-900/20' },
        { title: 'Growth (MoM)', value: '+14%', icon: TrendingUp, color: 'text-teal-500', bg: 'bg-teal-50 dark:bg-teal-900/20' },
    ]

    return (
        <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8">
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight">Welcome back, {user?.name || 'Admin'}</h1>
                    <p className="text-slate-500 mt-1">Here's how your content marketing is performing today.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 px-4 py-2 rounded-xl font-medium text-sm">
                        <Sparkles className="h-4 w-4" /> AI Insights
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                {STAT_CARDS.map((stat, idx) => {
                    const Icon = stat.icon
                    return (
                        <Card key={idx} className="border-none shadow-sm bg-white dark:bg-slate-900">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className={`p-3 rounded-xl ${stat.bg}`}>
                                        <Icon className={`h-5 w-5 ${stat.color}`} />
                                    </div>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-slate-500">{stat.title}</p>
                                    <h3 className="text-3xl font-black mt-1">{isLoading ? '...' : stat.value}</h3>
                                </div>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>

            {/* Quick Actions & Recent */}
            <div className="grid lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2 border-none shadow-sm bg-white dark:bg-slate-900">
                    <CardHeader>
                        <CardTitle>Top Performing Articles</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {topPosts.length === 0 ? (
                                <p className="text-sm text-slate-500">No data available.</p>
                            ) : (
                                <div className="space-y-3">
                                    {topPosts.map((post: any) => (
                                        <div key={post.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                                            <div className="flex flex-col">
                                                <span className="font-semibold text-sm line-clamp-1">{post.title}</span>
                                                <span className="text-xs text-slate-500 mt-0.5">{post.category || 'Uncategorized'}</span>
                                            </div>
                                            <div className="flex items-center gap-4 text-xs font-medium text-slate-600 dark:text-slate-400">
                                                <span className="flex items-center gap-1"><Eye className="h-3 w-3" /> {post.views}</span>
                                                <span className="flex items-center gap-1 text-emerald-600"><MousePointerClick className="h-3 w-3" /> {post.ctr}%</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
                
                <Card className="border-none shadow-sm bg-white dark:bg-slate-900">
                    <CardHeader>
                        <CardTitle>Content Strategy</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg">
                                <Sparkles className="h-6 w-6 mb-3 text-indigo-200" />
                                <h4 className="font-bold mb-1">AI Recommendation</h4>
                                <p className="text-sm text-indigo-100 mb-4 opacity-90">Articles about "AI in Healthcare" are trending. Consider writing a piece targeting this keyword.</p>
                                <button className="w-full bg-white text-indigo-600 font-bold text-sm py-2 rounded-lg hover:bg-slate-50 transition-colors">Generate Outline</button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

        </div>
    )
}
