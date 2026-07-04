"use client"

import { useState, useEffect, useRef, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import api, { uploadApi } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
    Sparkles, Loader2, Save, ArrowLeft, Eye, EyeOff, Type, ImageIcon, FileText, ChevronDown
} from 'lucide-react'
import { toast } from 'sonner'
import { getFullImageUrl } from '@/lib/image-utils'
import DOMPurify from 'isomorphic-dompurify'
import { RichTextEditor } from '@/components/editor/RichTextEditor'

const BLOG_CATEGORIES = [
    "AI & Future Tech", "IT Careers", "Non-IT Careers", "Freshers Guide",
    "Job Market & Economy", "Entrepreneurship", "Corporate & Laws",
    "Finance & Wealth", "Internships & Experience", "Skill Development"
]

function BlogEditorContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const blogId = searchParams.get('id')
    const isEdit = !!blogId

    const [isLoading, setIsLoading] = useState(isEdit)
    const [isSaving, setIsSaving] = useState(false)
    const [isUploadingCover, setIsUploadingCover] = useState(false)
    const [previewMode, setPreviewMode] = useState(false)
    const [wordCount, setWordCount] = useState(0)
    const [charCount, setCharCount] = useState(0)
    const [aiTopic, setAiTopic] = useState("")
    const [aiKeywords, setAiKeywords] = useState("")
    const [isGeneratingAi, setIsGeneratingAi] = useState(false)
    const [showAiPanel, setShowAiPanel] = useState(false)
    const [showMeta, setShowMeta] = useState(true)

    const [formData, setFormData] = useState({
        id: '',
        title: '',
        content: '',
        excerpt: '',
        status: 'DRAFT' as string,
        tags: '',
        coverImage: '',
        category: ''
    })

    // Load existing blog for editing
    useEffect(() => {
        if (isEdit && blogId) {
            setIsLoading(true)
            api.get(`/blogs/${blogId}`)
                .then(res => {
                    const blog = res.data
                    setFormData({
                        id: blog.id,
                        title: blog.title,
                        content: blog.content,
                        excerpt: blog.summary || '',
                        status: blog.status,
                        tags: blog.tags ? blog.tags.join(', ') : '',
                        coverImage: blog.coverImage || '',
                        category: blog.category || ''
                    })
                })
                .catch(() => toast.error("Failed to load blog post"))
                .finally(() => setIsLoading(false))
        }
    }, [blogId, isEdit])

    // Keep counts updated when content changes
    useEffect(() => {
        const text = formData.content.replace(/<[^>]+>/g, '') // Strip HTML for raw text
        const words = text.trim() ? text.trim().split(/\s+/).length : 0
        setWordCount(words)
        setCharCount(text.length)
    }, [formData.content])

    const handleAiGenerate = async () => {
        if (!aiTopic) { toast.error("Enter a topic"); return }
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
            toast.success("Blog content generated!")
        } catch {
            toast.error("AI generation failed")
        } finally {
            setIsGeneratingAi(false)
        }
    }

    const handleCoverImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file || !file.type.startsWith('image/')) { toast.error('Invalid image'); return }
        const fd = new FormData()
        fd.append('file', file)
        setIsUploadingCover(true)
        try {
            const res = await uploadApi.upload(fd)
            setFormData(prev => ({ ...prev, coverImage: res.data.url }))
            toast.success('Cover image uploaded')
        } catch {
            toast.error('Upload failed')
        } finally {
            setIsUploadingCover(false)
            e.target.value = ''
        }
    }

    const handleSave = async (statusOverride?: string) => {
        if (!formData.title) { toast.error("Title is required"); return }
        setIsSaving(true)
        try {
            const payload = {
                title: formData.title,
                content: formData.content,
                summary: formData.excerpt,
                status: statusOverride || formData.status,
                coverImage: formData.coverImage,
                category: formData.category,
                tags: formData.tags ? formData.tags.split(',').map(t => t.trim()) : []
            }
            if (formData.id) {
                await api.put(`/blogs/${formData.id}`, payload)
                toast.success('Blog updated successfully!')
            } else {
                const res = await api.post('/blogs', payload)
                setFormData(prev => ({ ...prev, id: res.data.id }))
                toast.success('Blog created successfully!')
            }
            if (statusOverride) {
                setFormData(prev => ({ ...prev, status: statusOverride }))
            }
        } catch {
            toast.error('Failed to save blog')
        } finally {
            setIsSaving(false)
        }
    }

    const readingTime = Math.max(1, Math.ceil(wordCount / 200))

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                    <p className="text-muted-foreground text-sm">Loading editor...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="fixed inset-0 z-[100] flex flex-col bg-white dark:bg-slate-950 overflow-hidden">
            {/* Top Toolbar */}
            <div className="sticky top-0 z-50 border-b bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm shadow-sm">
                <div className="flex items-center justify-between px-4 py-2 gap-3">
                    {/* Left: back + meta info */}
                    <div className="flex items-center gap-3 min-w-0">
                        <Button variant="ghost" size="sm" onClick={() => router.push('/admin/blogs')} className="shrink-0">
                            <ArrowLeft className="h-4 w-4 mr-1" />
                            Blogs
                        </Button>
                        <div className="h-4 w-px bg-slate-200 dark:bg-slate-700" />
                        <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                            <span className="flex items-center gap-1">
                                <FileText className="h-3 w-3" />
                                {wordCount} words
                            </span>
                            <span>·</span>
                            <span>{charCount} chars</span>
                            <span>·</span>
                            <span>~{readingTime} min read</span>
                        </div>
                        <Badge
                            variant={formData.status === 'PUBLISHED' ? 'default' : 'secondary'}
                            className="shrink-0 text-xs"
                        >
                            {formData.status}
                        </Badge>
                    </div>

                    {/* Right: actions */}
                    <div className="flex items-center gap-2 shrink-0">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPreviewMode(!previewMode)}
                            className="gap-1.5"
                        >
                            {previewMode ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                            {previewMode ? 'Edit' : 'Preview'}
                        </Button>

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSave('DRAFT')}
                            disabled={isSaving}
                            className="gap-1.5"
                        >
                            <Save className="h-3.5 w-3.5" />
                            Save Draft
                        </Button>

                        <Button
                            size="sm"
                            onClick={() => handleSave('PUBLISHED')}
                            disabled={isSaving}
                            className="bg-blue-600 hover:bg-blue-700 text-white gap-1.5"
                        >
                            {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
                            Publish
                        </Button>
                    </div>
                </div>

                {/* Formatting toolbar - only in edit mode */}
                {!previewMode && (
                    <div className="flex flex-wrap items-center gap-1 px-4 py-1.5 border-t bg-slate-50/80 dark:bg-slate-800/50">
                        {/* AI Toggle */}

                        {/* AI */}
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowAiPanel(!showAiPanel)}
                            className="h-7 px-2 gap-1.5 text-xs font-medium text-purple-700 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950"
                        >
                            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                            AI Write
                            <ChevronDown className={`w-3 h-3 transition-transform ${showAiPanel ? 'rotate-180' : ''}`} />
                        </Button>
                    </div>
                )}

                {/* AI Panel */}
                {showAiPanel && !previewMode && (
                    <div className="px-4 py-3 border-t bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/30 dark:to-indigo-950/30">
                        <div className="flex flex-wrap items-center gap-2">
                            <Input
                                placeholder="Topic: e.g. Breaking into DevOps in 2025"
                                value={aiTopic}
                                onChange={e => setAiTopic(e.target.value)}
                                className="bg-white dark:bg-slate-800 h-8 text-xs w-80"
                            />
                            <Input
                                placeholder="Keywords (comma separated)"
                                value={aiKeywords}
                                onChange={e => setAiKeywords(e.target.value)}
                                className="bg-white dark:bg-slate-800 h-8 text-xs w-64"
                            />
                            <Button
                                type="button"
                                onClick={handleAiGenerate}
                                disabled={isGeneratingAi}
                                size="sm"
                                className="bg-purple-600 hover:bg-purple-700 text-white h-8 text-xs"
                            >
                                {isGeneratingAi ? <><Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />Generating...</> : <><Sparkles className="w-3.5 h-3.5 mr-1.5" />Generate with AI</>}
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {/* Main content area */}
            <div className="flex flex-1 overflow-hidden">
                {/* Editor / Preview */}
                <div className="flex-1 overflow-y-auto">
                    <div className="max-w-4xl mx-auto px-6 py-10">
                        {/* Cover image */}
                        {formData.coverImage && (
                            <div className="mb-8 relative rounded-2xl overflow-hidden shadow-lg">
                                <Image
                                    src={getFullImageUrl(formData.coverImage)}
                                    alt="Cover"
                                    width={1200}
                                    height={400}
                                    className="w-full h-56 object-cover"
                                />
                                {!previewMode && (
                                    <button
                                        onClick={() => setFormData(prev => ({ ...prev, coverImage: '' }))}
                                        className="absolute top-3 right-3 bg-black/60 text-white text-xs px-3 py-1.5 rounded-lg hover:bg-black/80 transition-colors"
                                    >
                                        Remove
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Title */}
                        {previewMode ? (
                            <h1 className="text-4xl font-bold text-slate-900 dark:text-white leading-tight mb-4">
                                {formData.title || 'Untitled Post'}
                            </h1>
                        ) : (
                            <textarea
                                value={formData.title}
                                onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                placeholder="Write your compelling blog title here..."
                                className="w-full text-4xl font-bold text-slate-900 dark:text-white bg-transparent border-none outline-none resize-none leading-tight mb-4 placeholder:text-slate-300 dark:placeholder:text-slate-600"
                                rows={2}
                            />
                        )}

                        {/* Excerpt */}
                        {previewMode ? (
                            formData.excerpt && (
                                <p className="text-xl text-slate-500 dark:text-slate-400 leading-relaxed mb-8 border-l-4 border-blue-500 pl-4">
                                    {formData.excerpt}
                                </p>
                            )
                        ) : (
                            <textarea
                                value={formData.excerpt}
                                onChange={e => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                                placeholder="Write a short excerpt or summary (shown in blog listings)..."
                                className="w-full text-lg text-slate-500 dark:text-slate-400 bg-transparent border-none outline-none resize-none leading-relaxed mb-8 placeholder:text-slate-300 dark:placeholder:text-slate-600 border-l-4 border-blue-200 pl-4"
                                rows={2}
                            />
                        )}

                        <hr className="border-slate-200 dark:border-slate-700 mb-8" />

                        {/* Content Editor / Preview */}
                        {previewMode ? (
                            <div
                                className="prose prose-lg dark:prose-invert max-w-none leading-relaxed text-slate-800 dark:text-slate-200"
                                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(formData.content || '<p class="text-slate-400">No content yet...</p>') }}
                            />
                        ) : (
                            <RichTextEditor 
                                value={formData.content} 
                                onChange={(val) => setFormData(prev => ({ ...prev, content: val }))} 
                            />
                        )}
                    </div>
                </div>

                {/* Right Sidebar - Meta */}
                <div className={`w-72 border-l bg-slate-50/50 dark:bg-slate-900/50 overflow-y-auto shrink-0 transition-all duration-300 ${showMeta ? '' : 'hidden'}`}>
                    <div className="p-4 space-y-5">
                        {/* Sidebar header */}
                        <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-sm text-slate-700 dark:text-slate-300">Post Settings</h3>
                            <button onClick={() => setShowMeta(false)} className="text-xs text-muted-foreground hover:text-foreground">Hide</button>
                        </div>

                        {/* Status */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">Status</label>
                            <Select value={formData.status} onValueChange={v => setFormData(prev => ({ ...prev, status: v }))}>
                                <SelectTrigger className="h-9 text-sm">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="DRAFT">📝 Draft</SelectItem>
                                    <SelectItem value="PUBLISHED">✅ Published</SelectItem>
                                    <SelectItem value="ARCHIVED">📦 Archived</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Category */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">Category</label>
                            <Select value={formData.category} onValueChange={v => setFormData(prev => ({ ...prev, category: v }))}>
                                <SelectTrigger className="h-9 text-sm">
                                    <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {BLOG_CATEGORIES.map(cat => (
                                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Tags */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">Tags</label>
                            <Input
                                value={formData.tags}
                                onChange={e => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                                placeholder="Tech, Career, Interview..."
                                className="h-9 text-sm"
                            />
                            <p className="text-[11px] text-muted-foreground">Comma separated</p>
                        </div>

                        {/* Cover Image */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide flex items-center gap-1.5">
                                <ImageIcon className="h-3 w-3" />
                                Cover Image
                            </label>
                            <div className="space-y-2">
                                <label className="flex items-center justify-center h-20 w-full border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg cursor-pointer hover:border-blue-400 transition-colors text-xs text-muted-foreground hover:text-blue-500">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleCoverImageChange}
                                        disabled={isUploadingCover}
                                        className="hidden"
                                    />
                                    {isUploadingCover ? (
                                        <span className="flex items-center gap-1.5"><Loader2 className="h-4 w-4 animate-spin" />Uploading...</span>
                                    ) : (
                                        <span className="flex flex-col items-center gap-1">
                                            <ImageIcon className="h-5 w-5 text-slate-400" />
                                            Click to upload
                                        </span>
                                    )}
                                </label>
                                {formData.coverImage && (
                                    <div className="relative rounded-lg overflow-hidden">
                                        <Image
                                            src={getFullImageUrl(formData.coverImage)}
                                            alt="Cover"
                                            width={280}
                                            height={120}
                                            className="w-full h-28 object-cover"
                                        />
                                        <button
                                            onClick={() => setFormData(prev => ({ ...prev, coverImage: '' }))}
                                            className="absolute top-2 right-2 bg-red-500 text-white text-[10px] px-2 py-0.5 rounded font-medium"
                                        >Remove</button>
                                    </div>
                                )}
                                <p className="text-[10px] text-muted-foreground">Recommended: 1200×630px</p>
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="bg-white dark:bg-slate-800 rounded-xl p-3 space-y-2 border">
                            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">📊 Content Stats</p>
                            <div className="grid grid-cols-2 gap-2 text-center">
                                <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-2">
                                    <p className="text-lg font-bold text-blue-600">{wordCount}</p>
                                    <p className="text-[10px] text-muted-foreground">Words</p>
                                </div>
                                <div className="bg-green-50 dark:bg-green-950/30 rounded-lg p-2">
                                    <p className="text-lg font-bold text-green-600">{readingTime}m</p>
                                    <p className="text-[10px] text-muted-foreground">Read Time</p>
                                </div>
                            </div>
                        </div>

                        {/* Quick save */}
                        <div className="space-y-2 pt-2">
                            <Button
                                onClick={() => handleSave()}
                                disabled={isSaving}
                                className="w-full gap-2 bg-blue-600 hover:bg-blue-700 text-white"
                                size="sm"
                            >
                                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                Save Changes
                            </Button>
                            <Button
                                onClick={() => handleSave('PUBLISHED')}
                                disabled={isSaving || formData.status === 'PUBLISHED'}
                                variant="outline"
                                className="w-full gap-2 text-green-700 border-green-300 hover:bg-green-50"
                                size="sm"
                            >
                                Publish Now
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Show meta toggle if hidden */}
                {!showMeta && (
                    <button
                        onClick={() => setShowMeta(true)}
                        className="fixed right-0 top-1/2 -translate-y-1/2 bg-white dark:bg-slate-800 border border-l-0 rounded-l-lg px-2 py-4 text-xs text-muted-foreground hover:text-foreground shadow-md"
                    >
                        <Type className="h-4 w-4" />
                    </button>
                )}
            </div>

            {/* Editor placeholder style */}
            <style jsx global>{`
                [data-placeholder]:empty:before {
                    content: attr(data-placeholder);
                    color: #94a3b8;
                    pointer-events: none;
                    font-style: italic;
                }
            `}</style>
        </div>
    )
}



export default function BlogEditorPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        }>
            <BlogEditorContent />
        </Suspense>
    )
}
