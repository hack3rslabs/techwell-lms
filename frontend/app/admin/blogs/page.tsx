"use client"

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { toast } from 'sonner'
import { Loader2, Plus, Edit, Trash2, Eye, MousePointerClick, Globe, FileText, CheckCircle, Clock, Archive } from 'lucide-react'
import { blogApi } from '@/lib/api'

export default function BlogsAdminPage() {
    const router = useRouter()
    const [blogs, setBlogs] = React.useState<any[]>([])
    const [isLoading, setIsLoading] = React.useState(true)
    const [statusFilter, setStatusFilter] = React.useState('')

    const fetchBlogs = React.useCallback(async () => {
        setIsLoading(true)
        try {
            const res = await blogApi.getAll({ status: statusFilter || undefined, limit: 100 })
            setBlogs(res.data?.blogs || [])
        } catch (error) {
            console.error('Failed to fetch blogs:', error)
            toast.error('Failed to load blogs')
        } finally {
            setIsLoading(false)
        }
    }, [statusFilter])

    React.useEffect(() => {
        // Read status from URL if present
        const params = new URLSearchParams(window.location.search)
        const status = params.get('status')
        if (status) {
            setStatusFilter(status)
        } else {
            setStatusFilter('')
        }
    }, [])

    // Re-fetch when status filter changes
    React.useEffect(() => {
        fetchBlogs()
    }, [fetchBlogs])

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this blog post?')) return
        try {
            await blogApi.delete(id)
            toast.success('Blog deleted successfully')
            fetchBlogs()
        } catch (error) {
            console.error('Delete error', error)
            toast.error('Failed to delete blog')
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PUBLISHED': return 'bg-emerald-500 hover:bg-emerald-600 text-white'
            case 'DRAFT': return 'bg-slate-500 hover:bg-slate-600 text-white'
            case 'REVIEW': return 'bg-amber-500 hover:bg-amber-600 text-white'
            case 'SCHEDULED': return 'bg-indigo-500 hover:bg-indigo-600 text-white'
            case 'ARCHIVED': return 'bg-red-500 hover:bg-red-600 text-white'
            default: return 'bg-slate-500 text-white'
        }
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'PUBLISHED': return <Globe className="w-3 h-3 mr-1" />
            case 'DRAFT': return <FileText className="w-3 h-3 mr-1" />
            case 'REVIEW': return <CheckCircle className="w-3 h-3 mr-1" />
            case 'SCHEDULED': return <Clock className="w-3 h-3 mr-1" />
            case 'ARCHIVED': return <Archive className="w-3 h-3 mr-1" />
            default: return null
        }
    }

    return (
        <div className="p-6 md:p-8 space-y-6 bg-slate-50 dark:bg-slate-950 min-h-screen">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Blog Management</h1>
                    <p className="text-slate-500 mt-1">Manage all your articles, drafts, and published content.</p>
                </div>
                <Button onClick={() => router.push('/admin/blogs/editor')} className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Blog
                </Button>
            </div>

            <div className="flex gap-2 flex-wrap mb-4">
                <Button variant={statusFilter === '' ? 'default' : 'outline'} size="sm" onClick={() => setStatusFilter('')}>All</Button>
                <Button variant={statusFilter === 'PUBLISHED' ? 'default' : 'outline'} size="sm" onClick={() => setStatusFilter('PUBLISHED')}>Published</Button>
                <Button variant={statusFilter === 'DRAFT' ? 'default' : 'outline'} size="sm" onClick={() => setStatusFilter('DRAFT')}>Drafts</Button>
                <Button variant={statusFilter === 'REVIEW' ? 'default' : 'outline'} size="sm" onClick={() => setStatusFilter('REVIEW')}>Review</Button>
                <Button variant={statusFilter === 'SCHEDULED' ? 'default' : 'outline'} size="sm" onClick={() => setStatusFilter('SCHEDULED')}>Scheduled</Button>
                <Button variant={statusFilter === 'ARCHIVED' ? 'default' : 'outline'} size="sm" onClick={() => setStatusFilter('ARCHIVED')}>Archived</Button>
            </div>

            <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
                <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-4">
                    <CardTitle className="text-lg">All Articles</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-slate-50/50 dark:bg-slate-900/50">
                            <TableRow className="border-slate-200 dark:border-slate-800 hover:bg-transparent">
                                <TableHead className="font-semibold text-slate-600 dark:text-slate-400">Article Details</TableHead>
                                <TableHead className="font-semibold text-slate-600 dark:text-slate-400">Status</TableHead>
                                <TableHead className="font-semibold text-slate-600 dark:text-slate-400">Performance</TableHead>
                                <TableHead className="font-semibold text-slate-600 dark:text-slate-400">Date</TableHead>
                                <TableHead className="text-right font-semibold text-slate-600 dark:text-slate-400">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-32 text-center">
                                        <Loader2 className="h-6 w-6 animate-spin mx-auto text-indigo-500 mb-2" />
                                        <span className="text-sm text-slate-500">Loading blogs...</span>
                                    </TableCell>
                                </TableRow>
                            ) : blogs.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-32 text-center text-slate-500 text-sm">
                                        No blogs found. Create one to get started.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                blogs.map((blog) => (
                                    <TableRow key={blog.id} className="border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                {blog.coverImage ? (
                                                    <div className="w-16 h-12 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 flex-shrink-0 bg-slate-100 dark:bg-slate-800">
                                                        <img src={blog.coverImage.startsWith('http') ? blog.coverImage : `${process.env.NEXT_PUBLIC_API_URL}${blog.coverImage}`} alt={blog.title} className="w-full h-full object-cover" />
                                                    </div>
                                                ) : (
                                                    <div className="w-16 h-12 rounded-lg border border-dashed border-slate-200 dark:border-slate-700 flex-shrink-0 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center">
                                                        <FileText className="w-4 h-4 text-slate-400" />
                                                    </div>
                                                )}
                                                <div>
                                                    <div className="font-bold text-sm text-slate-900 dark:text-white line-clamp-1">{blog.title}</div>
                                                    <div className="text-xs text-slate-500 flex items-center gap-2 mt-1">
                                                        <span className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-[10px] font-medium tracking-wider uppercase">{blog.category || 'Uncategorized'}</span>
                                                        <span>By {blog.author?.name || 'Unknown'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={`${getStatusColor(blog.status)} border-0 font-medium px-2.5 py-0.5 flex w-max items-center`}>
                                                {getStatusIcon(blog.status)}
                                                {blog.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col gap-1 text-xs text-slate-600 dark:text-slate-400">
                                                <div className="flex items-center gap-1.5">
                                                    <Eye className="w-3.5 h-3.5" /> 
                                                    <span className="font-medium text-slate-900 dark:text-slate-200">{blog.views || 0}</span> views
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <MousePointerClick className="w-3.5 h-3.5" /> 
                                                    <span className="font-medium text-slate-900 dark:text-slate-200">{blog.ctr || 0}%</span> CTR
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-sm font-medium text-slate-900 dark:text-slate-200">
                                                {blog.publishedAt ? format(new Date(blog.publishedAt), 'MMM d, yyyy') : format(new Date(blog.createdAt), 'MMM d, yyyy')}
                                            </div>
                                            <div className="text-xs text-slate-500 mt-0.5">
                                                {blog.publishedAt ? 'Published' : 'Created'}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-1">
                                                <Button variant="ghost" size="icon" onClick={() => router.push(`/admin/blogs/editor?id=${blog.id}`)} className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-900/20">
                                                    <Edit className="w-4 h-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" onClick={() => handleDelete(blog.id)} className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
