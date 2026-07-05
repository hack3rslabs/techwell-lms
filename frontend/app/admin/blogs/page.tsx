"use client"

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Plus, Search, Edit, Trash2, Eye, TrendingUp, Users, FileText } from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'

interface Blog {
    id: string
    title: string
    slug: string
    category: string
    status: string
    views: number
    leadsGenerated: number
    author?: { name: string }
    createdAt: string
}

export default function BlogManagerPage() {
    const router = useRouter()
    const [blogs, setBlogs] = useState<Blog[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [search, setSearch] = useState('')
    
    // Stats
    const [stats, setStats] = useState({ total: 0, published: 0, views: 0, leads: 0 })

    const fetchBlogs = useCallback(async () => {
        setIsLoading(true)
        try {
            const res = await api.get(`/blogs?search=${search}`)
            const data = res.data.blogs || res.data
            setBlogs(data)
            
            // Calculate mock stats from data (in prod, fetch from an analytics endpoint)
            const pub = data.filter((b: any) => b.status === 'PUBLISHED').length
            const totalViews = data.reduce((acc: number, b: any) => acc + (b.views || 0), 0)
            const totalLeads = data.reduce((acc: number, b: any) => acc + (b.leadsGenerated || 0), 0)
            
            setStats({ total: data.length, published: pub, views: totalViews, leads: totalLeads })
        } catch {
            toast.error("Failed to load blogs")
        } finally {
            setIsLoading(false)
        }
    }, [search])

    useEffect(() => { fetchBlogs() }, [fetchBlogs])

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this post?')) return
        try {
            await api.delete(`/blogs/${id}`)
            setBlogs(prev => prev.filter(b => b.id !== id))
            toast.success('Blog deleted')
        } catch {
            toast.error('Failed to delete')
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Blog CMS</h1>
                    <p className="text-muted-foreground">Manage AI-powered articles, leads, and SEO.</p>
                </div>
                <Button onClick={() => router.push('/admin/blogs/editor')} className="bg-blue-600 hover:bg-blue-700 text-white">
                    <Plus className="mr-2 h-4 w-4" /> Create Post
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.total}</div>
                        <p className="text-xs text-muted-foreground">{stats.published} Published</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Views</CardTitle>
                        <Eye className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.views.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">+12% from last month</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Leads Generated</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.leads.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">Via CTA clicks</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Avg CTR</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {stats.views > 0 ? ((stats.leads / stats.views) * 100).toFixed(1) : 0}%
                        </div>
                        <p className="text-xs text-muted-foreground">Conversion rate</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Content Library</CardTitle>
                        <div className="relative w-64">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Search posts..." value={search} onChange={e => setSearch(e.target.value)} className="pl-8" />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Title</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Author</TableHead>
                                <TableHead className="text-right">Metrics (V/L)</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow><TableCell colSpan={6} className="text-center py-8">Loading...</TableCell></TableRow>
                            ) : blogs.length > 0 ? blogs.map(blog => (
                                <TableRow key={blog.id}>
                                    <TableCell className="font-medium">
                                        <div className="flex flex-col">
                                            <span>{blog.title}</span>
                                            <span className="text-xs text-muted-foreground truncate max-w-xs">{blog.slug}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell><Badge variant="outline">{blog.category || 'Uncategorized'}</Badge></TableCell>
                                    <TableCell>
                                        <Badge variant={
                                            blog.status === 'PUBLISHED' ? 'default' : 
                                            blog.status === 'SCHEDULED' ? 'outline' : 
                                            blog.status === 'REVIEW' ? 'secondary' : 'destructive'
                                        }>
                                            {blog.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{blog.author?.name || 'Unknown'}</TableCell>
                                    <TableCell className="text-right text-sm">
                                        {blog.views || 0} / {blog.leadsGenerated || 0}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="ghost" size="sm" onClick={() => router.push(`/admin/blogs/editor?id=${blog.id}`)}>
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="sm" onClick={() => handleDelete(blog.id)}>
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )) : (
                                <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No posts found.</TableCell></TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
