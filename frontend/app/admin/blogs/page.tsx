"use client"

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import api, { uploadApi } from '@/lib/api'
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Search, Edit, Trash2, Sparkles, Loader2, Bold, Italic, Underline, Palette, Strikethrough, AlignLeft, AlignCenter, AlignRight, AlignJustify, List, ListOrdered, Link as LinkIcon, Link2Off, Undo2, Redo2, Eraser, Highlighter, Indent, Outdent } from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { getFullImageUrl } from '@/lib/image-utils'

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
    const [isUploadingCover, setIsUploadingCover] = useState(false)
    const [aiTopic, setAiTopic] = useState("")
    const [aiKeywords, setAiKeywords] = useState("")
    const [isGeneratingAi, setIsGeneratingAi] = useState(false)

    // Rich Text Editor Ref
    const editorRef = useRef<HTMLDivElement>(null)

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

    const handleEditorChange = () => {
        if (editorRef.current) {
            setFormData(prev => ({
                ...prev,
                content: editorRef.current?.innerHTML || ""
            }))
        }
    }

    // Load content in rich editor when dialog opens or forms data changes
    useEffect(() => {
        if (showModal) {
            const timer = setTimeout(() => {
                if (editorRef.current) {
                    editorRef.current.innerHTML = formData.content || ""
                }
            }, 150)
            return () => clearTimeout(timer)
        }
    }, [showModal, formData.id])

    const handleAiGenerate = async () => {
        if (!aiTopic) {
            toast.error("Please enter a topic for AI generation")
            return
        }
        setIsGeneratingAi(true)
        try {
            const res = await api.post("/blogs/generate", {
                topic: aiTopic,
                keywords: aiKeywords ? aiKeywords.split(",").map(k => k.trim()) : []
            })
            const textContent = res.data.content || ""
            setFormData(prev => ({
                ...prev,
                title: res.data.title || prev.title,
                excerpt: res.data.summary || prev.excerpt,
                content: textContent
            }))
            if (editorRef.current) {
                editorRef.current.innerHTML = textContent
            }
            toast.success("Blog content generated successfully!")
        } catch (err: any) {
            console.error("AI Generation Error:", err)
            toast.error("Failed to generate blog content")
        } finally {
            setIsGeneratingAi(false)
        }
    }

    const [search, setSearch] = useState('')

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
        if (editorRef.current) {
            editorRef.current.innerHTML = ""
        }
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

    const handleCoverImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        if (!file.type.startsWith('image/')) {
            toast.error('Please select an image file')
            return
        }

        const uploadFormData = new FormData()
        uploadFormData.append('file', file)

        setIsUploadingCover(true)
        try {
            const res = await uploadApi.upload(uploadFormData)
            setFormData(prev => ({ ...prev, coverImage: res.data.url }))
            toast.success('Cover image uploaded')
        } catch {
            toast.error('Failed to upload cover image')
        } finally {
            setIsUploadingCover(false)
            e.target.value = ''
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

                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={handleCreateOpen} className="gap-2">
                        <Plus className="h-4 w-4" />
                        Quick Create
                    </Button>
                    <Link href="/admin/blogs/editor">
                        <Button className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
                            <Plus className="h-4 w-4" />
                            New Post (Full Editor)
                        </Button>
                    </Link>
                </div>

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

                                            <Link href={`/admin/blogs/editor?id=${blog.id}`}>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    title="Open Full Editor"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                            </Link>

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
                <DialogContent className="sm:max-w-4xl max-w-[95vw] max-h-[90vh] flex flex-col p-6">
                    <DialogHeader>
                        <DialogTitle>
                            {formData.id ? 'Edit Post' : 'New Blog Post'}
                        </DialogTitle>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="flex flex-col space-y-4 overflow-hidden mt-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto pr-2 pb-2">
                            {/* AI writing panel */}
                            <div className="bg-gradient-to-br from-purple-50 to-indigo-50/50 p-4 rounded-xl border border-purple-100/50 md:col-span-2 mb-2 space-y-3">
                                <div className="flex items-center gap-2 text-purple-800 font-bold text-sm">
                                    <Sparkles className="w-4 h-4 text-purple-600 animate-pulse" />
                                    <span>AI Blog Writing Assistant</span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                    <Input
                                        placeholder="Topic: e.g. How to break into DevOps"
                                        value={aiTopic}
                                        onChange={e => setAiTopic(e.target.value)}
                                        className="bg-white md:col-span-2 text-xs"
                                    />
                                    <Input
                                        placeholder="Keywords (comma separated)"
                                        value={aiKeywords}
                                        onChange={e => setAiKeywords(e.target.value)}
                                        className="bg-white text-xs"
                                    />
                                </div>
                                <Button
                                    type="button"
                                    onClick={handleAiGenerate}
                                    disabled={isGeneratingAi}
                                    className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs h-9"
                                >
                                    {isGeneratingAi ? (
                                        <>
                                            <Loader2 className="w-3.5 h-3.5 animate-spin mr-2" />
                                            Generating blog with Gemini AI...
                                        </>
                                    ) : (
                                        "Generate Title, Summary & Content"
                                    )}
                                </Button>
                            </div>

                            <div className="space-y-2 md:col-span-2">
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

                            <div className="space-y-2 md:col-span-2">
                                <label className="text-sm font-medium">Overview / Excerpt</label>
                                <Input
                                    value={formData.excerpt}
                                    onChange={e => setFormData({ ...formData, excerpt: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2 md:col-span-2">
                                 <label className="text-sm font-medium">Content (Rich Text Editor)</label>
                                 
                                 {/* Advanced Mail/Docs Style Rich Toolbar */}
                                 <div className="flex flex-wrap items-center gap-1.5 p-2 bg-slate-50 border rounded-t-xl border-slate-200">
                                     {/* History Actions */}
                                     <div className="flex items-center gap-0.5">
                                         <Button
                                             type="button"
                                             variant="ghost"
                                             size="sm"
                                             onClick={() => {
                                                 document.execCommand('undo')
                                                 handleEditorChange()
                                             }}
                                             className="h-8 w-8 p-0 hover:bg-slate-200"
                                             title="Undo (Ctrl+Z)"
                                         >
                                             <Undo2 className="w-3.5 h-3.5 text-slate-700" />
                                         </Button>
                                         <Button
                                             type="button"
                                             variant="ghost"
                                             size="sm"
                                             onClick={() => {
                                                 document.execCommand('redo')
                                                 handleEditorChange()
                                             }}
                                             className="h-8 w-8 p-0 hover:bg-slate-200"
                                             title="Redo (Ctrl+Y)"
                                         >
                                             <Redo2 className="w-3.5 h-3.5 text-slate-700" />
                                         </Button>
                                     </div>

                                     <div className="h-4 w-px bg-slate-300 mx-1"></div>

                                     {/* Headings / Block Types */}
                                     <select
                                         onChange={e => {
                                             document.execCommand('formatBlock', false, e.target.value)
                                             handleEditorChange()
                                         }}
                                         defaultValue="<p>"
                                         className="text-xs bg-white border border-slate-200 rounded px-2 py-1 outline-none cursor-pointer h-8 font-medium text-slate-700"
                                         title="Formatting Style"
                                     >
                                         <option value="<p>">Normal Paragraph</option>
                                         <option value="<h1>">Large Heading H1</option>
                                         <option value="<h2>">Medium Heading H2</option>
                                         <option value="<h3>">Small Heading H3</option>
                                         <option value="<h4>">Subheading H4</option>
                                         <option value="<pre>">Code Block</option>
                                         <option value="<blockquote>">Quote Block</option>
                                     </select>

                                     {/* Font Family Selector */}
                                     <select
                                         onChange={e => {
                                             document.execCommand('fontName', false, e.target.value)
                                             handleEditorChange()
                                         }}
                                         defaultValue="Inter, sans-serif"
                                         className="text-xs bg-white border border-slate-200 rounded px-2 py-1 outline-none cursor-pointer h-8 font-medium text-slate-700 w-32"
                                         title="Font Family"
                                     >
                                         <option value="Inter, sans-serif">Default Inter</option>
                                         <option value="Arial, sans-serif">Arial</option>
                                         <option value="Georgia, serif">Georgia</option>
                                         <option value="Courier New, monospace">Courier New</option>
                                         <option value="Times New Roman, serif">Times New Roman</option>
                                         <option value="Verdana, sans-serif">Verdana</option>
                                         <option value="Trebuchet MS, sans-serif">Trebuchet MS</option>
                                         <option value="Impact, Charcoal, sans-serif">Impact</option>
                                     </select>

                                     {/* Font Size Selector */}
                                     <select
                                         onChange={e => {
                                             document.execCommand('fontSize', false, e.target.value)
                                             handleEditorChange()
                                         }}
                                         defaultValue="3"
                                         className="text-xs bg-white border border-slate-200 rounded px-2 py-1 outline-none cursor-pointer h-8 font-medium text-slate-700"
                                         title="Font Size"
                                     >
                                         <option value="1">Smallest (10px)</option>
                                         <option value="2">Small (12px)</option>
                                         <option value="3">Normal (14px)</option>
                                         <option value="4">Medium (16px)</option>
                                         <option value="5">Large (18px)</option>
                                         <option value="6">Extra Large (24px)</option>
                                         <option value="7">Huge (32px)</option>
                                     </select>

                                     <div className="h-4 w-px bg-slate-300 mx-1"></div>

                                     {/* Text Style formats */}
                                     <div className="flex items-center gap-0.5">
                                         <Button
                                             type="button"
                                             variant="ghost"
                                             size="sm"
                                             onClick={() => {
                                                 document.execCommand('bold')
                                                 handleEditorChange()
                                             }}
                                             className="h-8 w-8 p-0 hover:bg-slate-200"
                                             title="Bold (Ctrl+B)"
                                         >
                                             <Bold className="w-3.5 h-3.5 text-slate-700" />
                                         </Button>

                                         <Button
                                             type="button"
                                             variant="ghost"
                                             size="sm"
                                             onClick={() => {
                                                 document.execCommand('italic')
                                                 handleEditorChange()
                                             }}
                                             className="h-8 w-8 p-0 hover:bg-slate-200"
                                             title="Italic (Ctrl+I)"
                                         >
                                             <Italic className="w-3.5 h-3.5 text-slate-700" />
                                         </Button>

                                         <Button
                                             type="button"
                                             variant="ghost"
                                             size="sm"
                                             onClick={() => {
                                                 document.execCommand('underline')
                                                 handleEditorChange()
                                             }}
                                             className="h-8 w-8 p-0 hover:bg-slate-200"
                                             title="Underline (Ctrl+U)"
                                         >
                                             <Underline className="w-3.5 h-3.5 text-slate-700" />
                                         </Button>

                                         <Button
                                             type="button"
                                             variant="ghost"
                                             size="sm"
                                             onClick={() => {
                                                 document.execCommand('strikeThrough')
                                                 handleEditorChange()
                                             }}
                                             className="h-8 w-8 p-0 hover:bg-slate-200"
                                             title="Strikethrough"
                                         >
                                             <Strikethrough className="w-3.5 h-3.5 text-slate-700" />
                                         </Button>
                                     </div>

                                     <div className="h-4 w-px bg-slate-300 mx-1"></div>

                                     {/* Color Selectors */}
                                     <div className="flex items-center gap-2">
                                         <div className="flex items-center gap-1" title="Text Color">
                                             <Palette className="w-3.5 h-3.5 text-slate-500" />
                                             <input
                                                 type="color"
                                                 onChange={e => {
                                                     document.execCommand('foreColor', false, e.target.value)
                                                     handleEditorChange()
                                                 }}
                                                 className="w-6 h-6 p-0 border-0 rounded cursor-pointer bg-transparent"
                                             />
                                         </div>

                                         <div className="flex items-center gap-1" title="Highlight Color">
                                             <Highlighter className="w-3.5 h-3.5 text-slate-500" />
                                             <input
                                                 type="color"
                                                 defaultValue="#ffff00"
                                                 onChange={e => {
                                                     document.execCommand('hiliteColor', false, e.target.value)
                                                     handleEditorChange()
                                                 }}
                                                 className="w-6 h-6 p-0 border-0 rounded cursor-pointer bg-transparent"
                                             />
                                         </div>
                                     </div>

                                     <div className="h-4 w-px bg-slate-300 mx-1"></div>

                                     {/* Alignment Actions */}
                                     <div className="flex items-center gap-0.5">
                                         <Button
                                             type="button"
                                             variant="ghost"
                                             size="sm"
                                             onClick={() => {
                                                 document.execCommand('justifyLeft')
                                                 handleEditorChange()
                                             }}
                                             className="h-8 w-8 p-0 hover:bg-slate-200"
                                             title="Align Left"
                                         >
                                             <AlignLeft className="w-3.5 h-3.5 text-slate-700" />
                                         </Button>
                                         <Button
                                             type="button"
                                             variant="ghost"
                                             size="sm"
                                             onClick={() => {
                                                 document.execCommand('justifyCenter')
                                                 handleEditorChange()
                                             }}
                                             className="h-8 w-8 p-0 hover:bg-slate-200"
                                             title="Align Center"
                                         >
                                             <AlignCenter className="w-3.5 h-3.5 text-slate-700" />
                                         </Button>
                                         <Button
                                             type="button"
                                             variant="ghost"
                                             size="sm"
                                             onClick={() => {
                                                 document.execCommand('justifyRight')
                                                 handleEditorChange()
                                             }}
                                             className="h-8 w-8 p-0 hover:bg-slate-200"
                                             title="Align Right"
                                         >
                                             <AlignRight className="w-3.5 h-3.5 text-slate-700" />
                                         </Button>
                                         <Button
                                             type="button"
                                             variant="ghost"
                                             size="sm"
                                             onClick={() => {
                                                 document.execCommand('justifyFull')
                                                 handleEditorChange()
                                             }}
                                             className="h-8 w-8 p-0 hover:bg-slate-200"
                                             title="Justify"
                                         >
                                             <AlignJustify className="w-3.5 h-3.5 text-slate-700" />
                                         </Button>
                                     </div>

                                     <div className="h-4 w-px bg-slate-300 mx-1"></div>

                                     {/* Lists Actions */}
                                     <div className="flex items-center gap-0.5">
                                         <Button
                                             type="button"
                                             variant="ghost"
                                             size="sm"
                                             onClick={() => {
                                                 document.execCommand('insertUnorderedList')
                                                 handleEditorChange()
                                             }}
                                             className="h-8 w-8 p-0 hover:bg-slate-200"
                                             title="Bulleted List"
                                         >
                                             <List className="w-3.5 h-3.5 text-slate-700" />
                                         </Button>
                                         <Button
                                             type="button"
                                             variant="ghost"
                                             size="sm"
                                             onClick={() => {
                                                 document.execCommand('insertOrderedList')
                                                 handleEditorChange()
                                             }}
                                             className="h-8 w-8 p-0 hover:bg-slate-200"
                                             title="Numbered List"
                                         >
                                             <ListOrdered className="w-3.5 h-3.5 text-slate-700" />
                                         </Button>
                                     </div>

                                     <div className="h-4 w-px bg-slate-300 mx-1"></div>

                                     {/* Indentation */}
                                     <div className="flex items-center gap-0.5">
                                         <Button
                                             type="button"
                                             variant="ghost"
                                             size="sm"
                                             onClick={() => {
                                                 document.execCommand('outdent')
                                                 handleEditorChange()
                                             }}
                                             className="h-8 w-8 p-0 hover:bg-slate-200"
                                             title="Decrease Indent"
                                         >
                                             <Outdent className="w-3.5 h-3.5 text-slate-700" />
                                         </Button>
                                         <Button
                                             type="button"
                                             variant="ghost"
                                             size="sm"
                                             onClick={() => {
                                                 document.execCommand('indent')
                                                 handleEditorChange()
                                             }}
                                             className="h-8 w-8 p-0 hover:bg-slate-200"
                                             title="Increase Indent"
                                         >
                                             <Indent className="w-3.5 h-3.5 text-slate-700" />
                                         </Button>
                                     </div>

                                     <div className="h-4 w-px bg-slate-300 mx-1"></div>

                                     {/* Links & Clear formatting */}
                                     <div className="flex items-center gap-0.5">
                                         <Button
                                             type="button"
                                             variant="ghost"
                                             size="sm"
                                             onClick={() => {
                                                 const url = window.prompt("Enter the link URL:")
                                                 if (url) {
                                                     document.execCommand('createLink', false, url)
                                                 }
                                                 handleEditorChange()
                                             }}
                                             className="h-8 w-8 p-0 hover:bg-slate-200"
                                             title="Insert Link"
                                         >
                                             <LinkIcon className="w-3.5 h-3.5 text-slate-700" />
                                         </Button>
                                         <Button
                                             type="button"
                                             variant="ghost"
                                             size="sm"
                                             onClick={() => {
                                                 document.execCommand('unlink')
                                                 handleEditorChange()
                                             }}
                                             className="h-8 w-8 p-0 hover:bg-slate-200"
                                             title="Remove Link"
                                         >
                                             <Link2Off className="w-3.5 h-3.5 text-slate-700" />
                                         </Button>
                                         <Button
                                             type="button"
                                             variant="ghost"
                                             size="sm"
                                             onClick={() => {
                                                 document.execCommand('removeFormat')
                                                 handleEditorChange()
                                             }}
                                             className="h-8 w-8 p-0 hover:bg-slate-200"
                                             title="Clear Formatting"
                                         >
                                             <Eraser className="w-3.5 h-3.5 text-slate-700" />
                                         </Button>
                                     </div>
                                 </div>

                                 {/* contentEditable Workspace */}
                                 <div
                                     ref={editorRef}
                                     contentEditable
                                     onInput={handleEditorChange}
                                     onBlur={handleEditorChange}
                                     className="min-h-[300px] max-h-[450px] overflow-y-auto p-4 border border-t-0 rounded-b-xl border-slate-200 outline-none bg-white prose max-w-none text-sm leading-relaxed"
                                     style={{ direction: 'ltr' }}
                                 />
                            </div>

                            <div className="space-y-2 md:col-span-2">
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-medium">Banner Image</label>
                                    <span className="text-[11px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                                        Recommended: 1200 × 630px (16:9 Aspect Ratio)
                                    </span>
                                </div>
                                <Input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleCoverImageChange}
                                    disabled={isUploadingCover}
                                />
                                {isUploadingCover && (
                                    <p className="text-xs text-muted-foreground">Uploading image...</p>
                                )}
                                {formData.coverImage && (
                                    <div className="space-y-2">
                                        <Image
                                            src={getFullImageUrl(formData.coverImage)}
                                            alt="Selected blog banner"
                                            width={960}
                                            height={320}
                                            className="h-40 w-full rounded-md border object-cover"
                                        />
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setFormData({ ...formData, coverImage: '' })}
                                        >
                                            Remove Image
                                        </Button>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-2 md:col-span-2">
                                <label className="text-sm font-medium">Tags (comma separated)</label>
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
