"use client"

import * as React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Plus, Edit2, Trash2, Link as LinkIcon, Loader2 } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { Textarea } from '@/components/ui/textarea'

export default function LandingPages() {
    const [pages, setPages] = React.useState<any[]>([])
    const [isOpen, setIsOpen] = React.useState(false)
    const [isLoading, setIsLoading] = React.useState(false)
    const { toast } = useToast()

    // Form State
    const [title, setTitle] = React.useState('')
    const [slug, setSlug] = React.useState('')
    const [content, setContent] = React.useState('')
    const [status, setStatus] = React.useState('DRAFT')
    const [seoTitle, setSeoTitle] = React.useState('')
    const [seoDesc, setSeoDesc] = React.useState('')

    const fetchPages = () => {
        fetch('/api/admin/marketing/landing-pages', {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }).then(res => res.json()).then(data => {
            if (data.success) setPages(data.pages || [])
        }).catch(console.error)
    }

    React.useEffect(() => {
        fetchPages()
    }, [])

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        try {
            const res = await fetch('/api/admin/marketing/landing-pages', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}` 
                },
                body: JSON.stringify({ title, slug, content: { html: content }, status, seoTitle, seoDesc })
            })
            const data = await res.json()
            if (data.success) {
                toast({ title: 'Success', description: 'Landing page created successfully' })
                setIsOpen(false)
                fetchPages()
                setTitle('')
                setSlug('')
                setContent('')
                setSeoTitle('')
                setSeoDesc('')
            } else {
                toast({ title: 'Error', description: data.error || data.message, variant: 'destructive' })
            }
        } catch (error: any) {
            toast({ title: 'Error', description: error.message, variant: 'destructive' })
        } finally {
            setIsLoading(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this page?')) return
        try {
            const res = await fetch(`/api/admin/marketing/landing-pages/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            })
            if (res.ok) fetchPages()
        } catch (error) {
            console.error(error)
        }
    }

    const copyLink = (slug: string) => {
        const url = `${window.location.origin}/p/${slug}`
        navigator.clipboard.writeText(url)
        toast({ title: 'Copied', description: 'Page URL copied to clipboard!' })
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Landing Pages</h1>
                    <p className="text-muted-foreground">Manage your promotional landing pages.</p>
                </div>
                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <DialogTrigger asChild>
                        <Button><Plus className="mr-2 h-4 w-4" /> Create Page</Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Create Landing Page</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Page Title</Label>
                                    <Input required value={title} onChange={e => {
                                        setTitle(e.target.value)
                                        setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''))
                                    }} placeholder="e.g. Summer Course 2026" />
                                </div>
                                <div className="space-y-2">
                                    <Label>URL Slug</Label>
                                    <Input required value={slug} onChange={e => setSlug(e.target.value)} placeholder="summer-course-2026" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Status</Label>
                                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    value={status} onChange={e => setStatus(e.target.value)}>
                                    <option value="DRAFT">Draft</option>
                                    <option value="PUBLISHED">Published</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <Label>Page Content (HTML/Markdown)</Label>
                                <Textarea required value={content} onChange={e => setContent(e.target.value)} placeholder="<h2>Welcome to our Summer Course</h2><p>Sign up below...</p>" className="min-h-[200px] font-mono text-sm" />
                                <p className="text-xs text-muted-foreground">You can use basic HTML tags for structure and styling.</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>SEO Title</Label>
                                    <Input value={seoTitle} onChange={e => setSeoTitle(e.target.value)} placeholder="SEO optimized title" />
                                </div>
                                <div className="space-y-2">
                                    <Label>SEO Description</Label>
                                    <Input value={seoDesc} onChange={e => setSeoDesc(e.target.value)} placeholder="SEO optimized description" />
                                </div>
                            </div>

                            <div className="pt-4 flex justify-end">
                                <Button type="submit" disabled={isLoading}>
                                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Save Page
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Published Pages</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Title</TableHead>
                                <TableHead>Slug</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {pages.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center text-muted-foreground py-8">No landing pages found. Create one!</TableCell>
                                </TableRow>
                            ) : (
                                pages.map((page: any) => (
                                    <TableRow key={page.id}>
                                        <TableCell className="font-medium">{page.title}</TableCell>
                                        <TableCell>/{page.slug}</TableCell>
                                        <TableCell>
                                            <Badge variant={page.status === 'PUBLISHED' ? 'default' : 'secondary'}>{page.status}</Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="icon" onClick={() => copyLink(page.slug)} title="Copy Link">
                                                <LinkIcon className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(page.id)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
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
