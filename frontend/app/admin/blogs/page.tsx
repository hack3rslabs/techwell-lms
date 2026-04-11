"use client"

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table'
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Search, Edit, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'

interface Blog {
    id: string
    title: string
    content: string
    summary?: string
    slug: string
    category: string
    status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
    tags: string[]
    coverImage?: string
    author?: {
        name: string
    }
    createdAt: string
}

const BLOG_CATEGORIES = [
    "AI & Future Tech",
    "IT Careers",
    "Non-IT Careers",
    "Freshers Guide",
    "Job Market & Economy",
    "Entrepreneurship",
    "Corporate & Laws",
    "Finance & Wealth",
    "Internships & Experience",
    "Skill Development"
]

export default function BlogManagerPage() {

    const _router = useRouter()

    const [blogs, setBlogs] = useState<Blog[]>([])
    const [_isLoading, setIsLoading] = useState(true)

    const [showModal, setShowModal] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const [search, setSearch] = useState('')

    const [formData, setFormData] = useState({
        id: '',
        title: '',
        content: '',
        excerpt: '',
        status: 'DRAFT',
        tags: '',
        coverImage: '',
        category: ''
    })

    const fetchBlogs = useCallback(async () => {
        setIsLoading(true)
        try {
            const res = await api.get(`/blogs?search=${search}`)
            setBlogs(res.data.blogs || res.data)
        } catch {
            toast.error("Failed to load blogs")
        } finally {
            setIsLoading(false)
        }
    }, [search])

    useEffect(() => {
        fetchBlogs()
    }, [fetchBlogs])

    const handleCreateOpen = () => {
        setFormData({
            id: '',
            title: '',
            content: '',
            excerpt: '',
            status: 'DRAFT',
            tags: '',
            coverImage: '',
            category: ''
        })
        setShowModal(true)
    }

    const handleEditOpen = (blog: Blog) => {
        setFormData({
            id: blog.id,
            title: blog.title,
            content: blog.content,
            excerpt: blog.summary || '',
            status: blog.status,
            tags: blog.tags ? blog.tags.join(", ") : '',
            coverImage: blog.coverImage || '',
            category: blog.category || ''
        })
        setShowModal(true)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        setIsSubmitting(true)

        try {

            const payload = {
                title: formData.title,
                content: formData.content,
                summary: formData.excerpt,
                status: formData.status,
                coverImage: formData.coverImage,
                category: formData.category,
                tags: formData.tags
                    ? formData.tags.split(',').map(t => t.trim())
                    : []
            }

            if (formData.id) {

                await api.put(`/blogs/${formData.id}`, payload)

                toast.success('Blog updated successfully')

            } else {

                await api.post('/blogs', payload)

                toast.success('Blog created successfully')

            }

            setShowModal(false)

            fetchBlogs()

        } catch {

            toast.error('Failed to save blog')

        } finally {

            setIsSubmitting(false)

        }
    }

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

                    <h1 className="text-3xl font-bold tracking-tight">Blog Manager</h1>

                    <p className="text-muted-foreground">
                        Manage articles, news, and updates.
                    </p>

                </div>

                <Button onClick={handleCreateOpen}>

                    <Plus className="mr-2 h-4 w-4" />

                    Create Post

                </Button>

            </div>

            <Card>

                <CardHeader>

                    <div className="flex items-center justify-between">

                        <CardTitle>All Posts</CardTitle>

                        <div className="relative w-64">

                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />

                            <Input
                                placeholder="Search posts..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="pl-8"
                            />

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

                                <TableHead>Date</TableHead>

                                <TableHead className="text-right">Actions</TableHead>

                            </TableRow>

                        </TableHeader>

                        <TableBody>

                            {blogs.length > 0 ? blogs.map(blog => (

                                <TableRow key={blog.id}>

                                    <TableCell className="font-medium">

                                        <div className="flex flex-col">

                                            <span>{blog.title}</span>

                                            <span className="text-xs text-muted-foreground truncate max-w-xs">
                                                {blog.slug}
                                            </span>

                                        </div>

                                    </TableCell>

                                    <TableCell>

                                        <Badge variant="outline">
                                            {blog.category}
                                        </Badge>

                                    </TableCell>

                                    <TableCell>

                                        <Badge variant={blog.status === 'PUBLISHED' ? 'default' : 'secondary'}>
                                            {blog.status}
                                        </Badge>

                                    </TableCell>

                                    <TableCell>
                                        {blog.author?.name || 'Unknown'}
                                    </TableCell>

                                    <TableCell>

                                        {format(new Date(blog.createdAt), 'MMM d, yyyy')}

                                    </TableCell>

                                    <TableCell className="text-right">

                                        <div className="flex justify-end gap-2">

                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleEditOpen(blog)}
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>

                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDelete(blog.id)}
                                            >
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>

                                        </div>

                                    </TableCell>

                                </TableRow>

                            )) : (

                                <TableRow>

                                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                        No posts found.
                                    </TableCell>

                                </TableRow>

                            )}

                        </TableBody>

                    </Table>

                </CardContent>

            </Card>

            <Dialog open={showModal} onOpenChange={setShowModal}>

                <DialogContent className="max-w-3xl">

                    <DialogHeader>

                        <DialogTitle>
                            {formData.id ? 'Edit Post' : 'New Blog Post'}
                        </DialogTitle>

                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-4">

                        <div className="grid grid-cols-2 gap-4">

                            <div className="space-y-2 col-span-2">

                                <label className="text-sm font-medium">Title</label>

                                <Input
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    required
                                />

                            </div>

                            <div className="space-y-2">

                                <label className="text-sm font-medium">Category</label>

                                <Select
                                    value={formData.category}
                                    onValueChange={(v) => setFormData({ ...formData, category: v })}
                                >

                                    <SelectTrigger>
                                        <SelectValue placeholder="Select category" />
                                    </SelectTrigger>

                                    <SelectContent>

                                        {BLOG_CATEGORIES.map(cat => (

                                            <SelectItem key={cat} value={cat}>
                                                {cat}
                                            </SelectItem>

                                        ))}

                                    </SelectContent>

                                </Select>

                            </div>

                            <div className="space-y-2">

                                <label className="text-sm font-medium">Status</label>

                                <Select
                                    value={formData.status}
                                    onValueChange={v => setFormData({ ...formData, status: v })}
                                >

                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>

                                    <SelectContent>

                                        <SelectItem value="DRAFT">Draft</SelectItem>
                                        <SelectItem value="PUBLISHED">Published</SelectItem>
                                        <SelectItem value="ARCHIVED">Archived</SelectItem>

                                    </SelectContent>

                                </Select>

                            </div>

                            <div className="space-y-2 col-span-2">

                                <label className="text-sm font-medium">Overview / Excerpt</label>

                                <Input
                                    value={formData.excerpt}
                                    onChange={e => setFormData({ ...formData, excerpt: e.target.value })}
                                />

                            </div>

                            <div className="space-y-2 col-span-2">

                                <label className="text-sm font-medium">Content</label>

                                <Textarea
                                    value={formData.content}
                                    onChange={e => setFormData({ ...formData, content: e.target.value })}
                                    className="min-h-[200px]"
                                    required
                                />

                            </div>

                            <div className="space-y-2 col-span-2">

                                <label className="text-sm font-medium">Cover Image URL</label>

                                <Input
                                    value={formData.coverImage}
                                    onChange={e => setFormData({ ...formData, coverImage: e.target.value })}
                                />

                            </div>

                            <div className="space-y-2 col-span-2">

                                <label className="text-sm font-medium">Tags</label>

                                <Input
                                    value={formData.tags}
                                    onChange={e => setFormData({ ...formData, tags: e.target.value })}
                                    placeholder="Tech, Career, Interview"
                                />

                            </div>

                        </div>

                        <DialogFooter>

                            <Button type="submit" disabled={isSubmitting}>

                                {isSubmitting && <div className="mr-2 animate-spin">⚪</div>}

                                Save Post

                            </Button>

                        </DialogFooter>

                    </form>

                </DialogContent>

            </Dialog>

        </div>
    )
}