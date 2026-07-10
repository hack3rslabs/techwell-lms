"use client";
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Plus, Search, FileText, Trash2, Edit, Eye,
    MoreHorizontal, TrendingUp, BarChart2, MousePointerClick,
    Flame, Newspaper, Globe, PenLine, ArrowUpRight
} from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api';
import { useToast } from "@/components/ui/use-toast";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

interface Analytics {
    totalPosts: number;
    publishedPosts: number;
    draftPosts: number;
    totalViews: number;
    totalLeads: number;
    topPosts: any[];
    categoryBreakdown: { category: string; posts: number; views: number }[];
}

function StatCard({ icon: Icon, label, value, sub, color }: any) {
    return (
        <Card className="border-none shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-5 flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
                    <Icon className="h-6 w-6" />
                </div>
                <div>
                    <p className="text-sm text-muted-foreground">{label}</p>
                    <p className="text-2xl font-bold tracking-tight">{value?.toLocaleString()}</p>
                    {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
                </div>
            </CardContent>
        </Card>
    );
}

export default function PostsDashboard() {
    const [posts, setPosts] = useState<any[]>([]);
    const [analytics, setAnalytics] = useState<Analytics | null>(null);
    const [loading, setLoading] = useState(true);
    const [analyticsLoading, setAnalyticsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('ALL');
    const { toast } = useToast();

    useEffect(() => {
        fetchPosts();
        fetchAnalytics();
    }, []);

    const fetchPosts = async () => {
        try {
            setLoading(true);
            // Fetch all posts for admin (no status filter)
            const res = await api.get('/blogs?limit=100');
            setPosts(res.data.blogs || res.data || []);
        } catch (error) {
            console.error("Failed to fetch posts", error);
            toast({ title: "Error", description: "Failed to load posts.", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const fetchAnalytics = async () => {
        try {
            setAnalyticsLoading(true);
            const res = await api.get('/blogs/analytics/summary');
            setAnalytics(res.data);
        } catch (error) {
            console.error("Failed to fetch analytics", error);
        } finally {
            setAnalyticsLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this post?")) return;
        try {
            await api.delete(`/blogs/${id}`);
            toast({ title: "Success", description: "Post deleted." });
            fetchPosts();
            fetchAnalytics();
        } catch (error) {
            console.error("Failed to delete", error);
            toast({ title: "Error", description: "Failed to delete post.", variant: "destructive" });
        }
    };

    const filteredPosts = posts.filter((p: any) => {
        const matchesSearch =
            p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (p.category || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (p.author?.name || '').toLowerCase().includes(searchQuery.toLowerCase());
        const matchesTab = activeTab === 'ALL' || p.status === activeTab;
        return matchesSearch && matchesTab;
    });

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'PUBLISHED': return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-emerald-200 font-semibold text-[11px]">● Published</Badge>;
            case 'DRAFT': return <Badge className="bg-slate-100 text-slate-600 hover:bg-slate-100 border-slate-200 font-semibold text-[11px]">● Draft</Badge>;
            case 'SCHEDULED': return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-blue-200 font-semibold text-[11px]">● Scheduled</Badge>;
            default: return <Badge variant="outline" className="text-[11px]">{status}</Badge>;
        }
    };

    const maxViews = Math.max(...(analytics?.topPosts?.map(p => p.views) || [1]), 1);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                        <PenLine className="h-7 w-7 text-blue-600" /> Blog Posts
                    </h1>
                    <p className="text-muted-foreground mt-1">Manage articles, track performance & reach.</p>
                </div>
                <Link href="/admin/posts/create">
                    <Button className="bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-600/20">
                        <Plus className="mr-2 h-4 w-4" /> Add New Post
                    </Button>
                </Link>
            </div>

            {/* Analytics Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard
                    icon={Newspaper}
                    label="Total Posts"
                    value={analytics?.totalPosts ?? 0}
                    sub={`${analytics?.publishedPosts ?? 0} published · ${analytics?.draftPosts ?? 0} drafts`}
                    color="bg-blue-50 dark:bg-blue-950/30 text-blue-600"
                />
                <StatCard
                    icon={Eye}
                    label="Total Views"
                    value={analytics?.totalViews ?? 0}
                    sub="All-time page reads"
                    color="bg-violet-50 dark:bg-violet-950/30 text-violet-600"
                />
                <StatCard
                    icon={MousePointerClick}
                    label="Total Clicks (CTR)"
                    value={analytics?.topPosts?.reduce((sum: number, p: any) => sum + (p.ctr || 0), 0) ?? 0}
                    sub="Link & CTA clicks"
                    color="bg-amber-50 dark:bg-amber-950/30 text-amber-600"
                />
                <StatCard
                    icon={TrendingUp}
                    label="Leads Generated"
                    value={analytics?.totalLeads ?? 0}
                    sub="From blog content"
                    color="bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Top Performing Posts */}
                <Card className="border-none shadow-sm lg:col-span-2">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                            <Flame className="h-4 w-4 text-orange-500" /> Top Performing Posts
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {analyticsLoading ? (
                            <div className="flex justify-center py-8"><div className="animate-spin h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-full" /></div>
                        ) : analytics?.topPosts && analytics.topPosts.length > 0 ? (
                            analytics.topPosts.map((post, i) => (
                                <div key={post.id} className="flex items-center gap-3 group">
                                    <span className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold shrink-0 ${i === 0 ? 'bg-amber-400 text-white' : i === 1 ? 'bg-slate-300 text-slate-700' : i === 2 ? 'bg-orange-300 text-white' : 'bg-muted text-muted-foreground'}`}>
                                        {i + 1}
                                    </span>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-1">
                                            <p className="text-sm font-medium truncate">{post.title}</p>
                                            <span className="text-xs text-muted-foreground ml-2 shrink-0">{post.views?.toLocaleString()} views</span>
                                        </div>
                                        <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-blue-500 to-violet-500 rounded-full transition-all duration-500"
                                                style={{ width: `${Math.round((post.views / maxViews) * 100)}%` }}
                                            />
                                        </div>
                                    </div>
                                    <Link href={`/blog/${post.slug}`} target="_blank" className="opacity-0 group-hover:opacity-100 transition-opacity">
                                        <ArrowUpRight className="h-4 w-4 text-muted-foreground hover:text-blue-600" />
                                    </Link>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-muted-foreground text-center py-6">Publish posts to start tracking performance.</p>
                        )}
                    </CardContent>
                </Card>

                {/* Category Breakdown */}
                <Card className="border-none shadow-sm">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                            <BarChart2 className="h-4 w-4 text-blue-500" /> Views by Category
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {analyticsLoading ? (
                            <div className="flex justify-center py-8"><div className="animate-spin h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-full" /></div>
                        ) : analytics?.categoryBreakdown && analytics.categoryBreakdown.length > 0 ? (
                            analytics.categoryBreakdown.slice(0, 7).map((cat) => (
                                <div key={cat.category} className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2 min-w-0">
                                        <Globe className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                        <span className="truncate font-medium">{cat.category}</span>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0 ml-2">
                                        <span className="text-muted-foreground text-xs">{cat.posts}p</span>
                                        <Badge variant="secondary" className="text-[11px] font-semibold px-1.5">{cat.views.toLocaleString()} views</Badge>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-muted-foreground text-center py-6">No category data yet.</p>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Posts Table */}
            <Card className="border-none shadow-sm bg-white dark:bg-slate-950">
                <CardHeader className="pb-4">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full md:w-auto">
                            <TabsList>
                                <TabsTrigger value="ALL">All ({posts.length})</TabsTrigger>
                                <TabsTrigger value="PUBLISHED">Published ({posts.filter(p => p.status === 'PUBLISHED').length})</TabsTrigger>
                                <TabsTrigger value="DRAFT">Drafts ({posts.filter(p => p.status === 'DRAFT').length})</TabsTrigger>
                            </TabsList>
                        </Tabs>
                        <div className="relative w-full md:w-72">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by title, category, author..."
                                className="pl-8 h-9"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-muted/30 text-muted-foreground border-y">
                                <tr>
                                    <th className="px-4 py-3 font-medium">Title</th>
                                    <th className="px-4 py-3 font-medium">Category</th>
                                    <th className="px-4 py-3 font-medium text-center">
                                        <span className="flex items-center justify-center gap-1"><Eye className="h-3.5 w-3.5" /> Views</span>
                                    </th>
                                    <th className="px-4 py-3 font-medium text-center">
                                        <span className="flex items-center justify-center gap-1"><MousePointerClick className="h-3.5 w-3.5" /> Clicks</span>
                                    </th>
                                    <th className="px-4 py-3 font-medium text-center">
                                        <span className="flex items-center justify-center gap-1"><TrendingUp className="h-3.5 w-3.5" /> Leads</span>
                                    </th>
                                    <th className="px-4 py-3 font-medium">Date</th>
                                    <th className="px-4 py-3 font-medium text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan={7} className="text-center py-12">
                                            <div className="flex justify-center"><div className="animate-spin h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-full" /></div>
                                        </td>
                                    </tr>
                                ) : filteredPosts.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="text-center py-12 text-muted-foreground">
                                            <FileText className="h-10 w-10 mx-auto mb-2 opacity-30" />
                                            No posts found.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredPosts.map((post: any) => (
                                        <tr key={post.id} className="border-t group hover:bg-muted/20 transition-colors">
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-muted flex items-center justify-center shrink-0 border">
                                                        {post.coverImage ? (
                                                            <img src={post.coverImage} alt="" className="w-full h-full object-cover" />
                                                        ) : (
                                                            <FileText className="h-4 w-4 text-muted-foreground" />
                                                        )}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <div className="font-medium line-clamp-1 text-slate-900 dark:text-slate-100">{post.title}</div>
                                                        <div className="flex items-center gap-2 mt-0.5">
                                                            {getStatusBadge(post.status)}
                                                            {post.author?.name && (
                                                                <span className="text-xs text-muted-foreground">by {post.author.name}</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="inline-flex items-center rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-xs font-medium text-slate-700 dark:text-slate-300">
                                                    {post.category || 'Uncategorized'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <span className={`font-semibold text-sm ${(post.views || 0) > 100 ? 'text-violet-600' : 'text-slate-600 dark:text-slate-400'}`}>
                                                    {(post.views || 0).toLocaleString()}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <span className="font-semibold text-sm text-amber-600">
                                                    {Math.round(post.ctr || 0).toLocaleString()}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <span className="font-semibold text-sm text-emerald-600">
                                                    {(post.leadsGenerated || 0).toLocaleString()}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-muted-foreground text-xs">
                                                {post.status === 'PUBLISHED' && post.publishedAt
                                                    ? new Date(post.publishedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                                                    : new Date(post.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                                                }
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <div className="flex justify-end gap-1">
                                                    {post.status === 'PUBLISHED' && (
                                                        <Link href={`/blog/${post.slug}`} target="_blank">
                                                            <Button variant="ghost" size="icon" title="View Public" className="h-8 w-8 text-muted-foreground hover:text-blue-600">
                                                                <Eye className="h-4 w-4" />
                                                            </Button>
                                                        </Link>
                                                    )}
                                                    <Link href={`/admin/posts/edit?id=${post.id}`}>
                                                        <Button variant="ghost" size="icon" title="Edit" className="h-8 w-8 text-muted-foreground hover:text-slate-900">
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem onClick={() => handleDelete(post.id)} className="text-red-600 focus:text-red-700">
                                                                <Trash2 className="h-4 w-4 mr-2" /> Delete Post
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
