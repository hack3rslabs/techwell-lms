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
        category: '',
        metaTitle: '',
        metaDescription: '',
        canonicalUrl: '',
        scheduledPublishAt: '',
        autoArchiveAt: ''
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
                        tags: Array.isArray(blog.tags) ? blog.tags.join(', ') : (typeof blog.tags === 'string' ? blog.tags : ''),
                        coverImage: blog.coverImage || '',
                        category: blog.category || '',
                        metaTitle: blog.metaTitle || '',
                        metaDescription: blog.metaDescription || '',
                        canonicalUrl: blog.canonicalUrl || '',
                        scheduledPublishAt: blog.scheduledPublishAt ? new Date(blog.scheduledPublishAt).toISOString().slice(0, 16) : '',
                        autoArchiveAt: blog.autoArchiveAt ? new Date(blog.autoArchiveAt).toISOString().slice(0, 16) : ''
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
                tags: formData.tags ? formData.tags.split(',').map(t => t.trim()) : [],
                metaTitle: formData.metaTitle,
                metaDescription: formData.metaDescription,
                canonicalUrl: formData.canonicalUrl,
                scheduledPublishAt: formData.scheduledPublishAt ? new Date(formData.scheduledPublishAt).toISOString() : null,
                autoArchiveAt: formData.autoArchiveAt ? new Date(formData.autoArchiveAt).toISOString() : null
            }
            if (formData.id) {
                await api.put(`/blogs/${formData.id}`, payload)
                toast.success('Blog updated successfully!')
            } else {
                const res = await api.post('/blogs', payload)
                setFormData(prev => ({ ...prev, id: res.data.id }))
                toast.success('Blog created successfully!')
                router.replace(`/admin/blogs/editor?id=${res.data.id}`)
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
        <div className="fixed inset-0 z-[100] flex flex-col bg-[#f8fafc] dark:bg-[#0f172a] overflow-hidden selection:bg-blue-200 dark:selection:bg-blue-900 font-sans">
            {/* Top Toolbar */}
            <div className="sticky top-0 z-50 border-b border-white/20 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl shadow-[0_2px_20px_rgba(0,0,0,0.03)]">
                <div className="flex flex-col sm:flex-row items-center justify-between px-4 sm:px-6 py-3 gap-3 sm:gap-3">
                    {/* Left: back + meta info */}
                    <div className="flex items-center gap-2 sm:gap-4 min-w-0 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
                        <Button variant="ghost" size="sm" onClick={() => router.push('/admin/blogs')} className="shrink-0 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 rounded-full transition-all">
                            <ArrowLeft className="h-4 w-4 mr-1.5" />
                            Back
                        </Button>
                        <div className="h-5 w-px bg-slate-300 dark:bg-slate-700" />
                        <div className="flex items-center gap-3 text-[13px] font-medium text-slate-500 dark:text-slate-400 flex-wrap">
                            <span className="flex items-center gap-1.5 bg-white dark:bg-slate-800 px-2.5 py-1 rounded-full shadow-sm border border-slate-200 dark:border-slate-700">
                                <FileText className="h-3.5 w-3.5 text-blue-500" />
                                {wordCount} words
                            </span>
                            <span className="flex items-center gap-1.5 bg-white dark:bg-slate-800 px-2.5 py-1 rounded-full shadow-sm border border-slate-200 dark:border-slate-700">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                ~{readingTime} min read
                            </span>
                        </div>
                        <Badge
                            className={`shrink-0 text-[11px] uppercase tracking-wider px-2 py-0.5 shadow-sm ${formData.status === 'PUBLISHED' ? 'bg-gradient-to-r from-emerald-400 to-emerald-500 text-white border-none' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-none'}`}
                        >
                            {formData.status}
                        </Badge>
                    </div>

                    {/* Right: actions */}
                    <div className="flex items-center gap-2 sm:gap-3 shrink-0 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPreviewMode(!previewMode)}
                            className="gap-1.5 rounded-full border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all"
                        >
                            {previewMode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            {previewMode ? 'Edit Mode' : 'Preview'}
                        </Button>

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSave('DRAFT')}
                            disabled={isSaving}
                            className="gap-1.5 rounded-full border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all"
                        >
                            <Save className="h-4 w-4" />
                            Save Draft
                        </Button>

                        <Button
                            size="sm"
                            onClick={() => handleSave('PUBLISHED')}
                            disabled={isSaving}
                            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white gap-1.5 rounded-full shadow-[0_4px_14px_0_rgba(79,70,229,0.39)] hover:shadow-[0_6px_20px_rgba(79,70,229,0.23)] transition-all hover:-translate-y-0.5 px-6"
                        >
                            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                            Publish Post
                        </Button>
                    </div>
                </div>

                {/* Formatting toolbar - only in edit mode */}
                {!previewMode && (
                    <div className="flex flex-wrap items-center gap-1 px-6 py-2 border-t border-slate-200/60 dark:border-slate-700/60 bg-white/40 dark:bg-slate-900/40">
                        {/* AI Toggle */}
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowAiPanel(!showAiPanel)}
                            className="h-8 px-4 gap-2 text-[13px] font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-500 hover:bg-purple-50 dark:hover:bg-purple-950/50 rounded-full border border-purple-200 dark:border-purple-800/30 transition-all shadow-sm"
                        >
                            <Sparkles className="w-4 h-4 text-purple-500 animate-pulse" />
                            AI Assistant
                            <ChevronDown className={`w-3.5 h-3.5 text-purple-500 transition-transform duration-300 ${showAiPanel ? 'rotate-180' : ''}`} />
                        </Button>
                    </div>
                )}

                {/* AI Panel */}
                {showAiPanel && !previewMode && (
                    <div className="px-6 py-4 border-t border-purple-100 dark:border-purple-900/50 bg-gradient-to-b from-purple-50/80 to-white/90 dark:from-purple-950/40 dark:to-slate-900/90 backdrop-blur-md shadow-inner transition-all duration-500">
                        <div className="flex flex-wrap items-center gap-3">
                            <div className="relative">
                                <Sparkles className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400" />
                                <Input
                                    placeholder="Topic: e.g. Breaking into DevOps in 2025"
                                    value={aiTopic}
                                    onChange={e => setAiTopic(e.target.value)}
                                    className="bg-white/80 dark:bg-slate-800/80 backdrop-blur border-purple-200 dark:border-purple-800 focus:border-purple-400 focus:ring-purple-400/20 pl-9 h-10 text-sm w-96 rounded-xl shadow-sm transition-all hover:shadow-md"
                                />
                            </div>
                            <Input
                                placeholder="Keywords (comma separated)"
                                value={aiKeywords}
                                onChange={e => setAiKeywords(e.target.value)}
                                className="bg-white/80 dark:bg-slate-800/80 backdrop-blur border-purple-200 dark:border-purple-800 focus:border-purple-400 focus:ring-purple-400/20 h-10 text-sm w-72 rounded-xl shadow-sm transition-all hover:shadow-md"
                            />
                            <Button
                                type="button"
                                onClick={handleAiGenerate}
                                disabled={isGeneratingAi}
                                size="sm"
                                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white h-10 px-6 rounded-xl shadow-[0_4px_14px_0_rgba(168,85,247,0.39)] hover:shadow-[0_6px_20px_rgba(168,85,247,0.23)] transition-all hover:-translate-y-0.5"
                            >
                                {isGeneratingAi ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Generating Magic...</> : <><Sparkles className="w-4 h-4 mr-2" />Generate Article</>}
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {/* Main content area */}
            <div className="flex flex-1 overflow-hidden relative">
                {/* Editor / Preview */}
                <div className="flex-1 overflow-y-auto scroll-smooth">
                    <div className="max-w-4xl mx-auto px-6 py-12">
                        {/* Cover image */}
                        {formData.coverImage && (
                            <div className="mb-10 relative rounded-3xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.12)] group transition-all duration-300 hover:shadow-[0_8px_40px_rgb(0,0,0,0.16)] border border-slate-100 dark:border-slate-800">
                                <Image
                                    src={getFullImageUrl(formData.coverImage)}
                                    alt="Cover"
                                    width={1200}
                                    height={400}
                                    className="w-full h-72 object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                                {!previewMode && (
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                        <button
                                            onClick={() => setFormData(prev => ({ ...prev, coverImage: '' }))}
                                            className="bg-white/20 hover:bg-red-500 backdrop-blur-md text-white text-sm font-semibold px-6 py-2.5 rounded-full transition-all duration-300 shadow-xl"
                                        >
                                            Remove Cover
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Title */}
                        {previewMode ? (
                            <h1 className="text-5xl font-extrabold text-slate-900 dark:text-white leading-[1.1] mb-6 tracking-tight">
                                {formData.title || 'Untitled Post'}
                            </h1>
                        ) : (
                            <textarea
                                value={formData.title}
                                onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                placeholder="Post Title..."
                                className="w-full text-5xl font-extrabold text-slate-900 dark:text-white bg-transparent border-none outline-none resize-none leading-[1.1] mb-6 tracking-tight placeholder:text-slate-300 dark:placeholder:text-slate-700 transition-all focus:placeholder:opacity-50"
                                rows={2}
                            />
                        )}

                        {/* Excerpt */}
                        {previewMode ? (
                            formData.excerpt && (
                                <p className="text-xl text-slate-600 dark:text-slate-400 leading-relaxed mb-10 border-l-4 border-indigo-500 pl-6 py-2 bg-gradient-to-r from-indigo-50/50 to-transparent dark:from-indigo-900/10 rounded-r-2xl">
                                    {formData.excerpt}
                                </p>
                            )
                        ) : (
                            <textarea
                                value={formData.excerpt}
                                onChange={e => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                                placeholder="Add a captivating summary..."
                                className="w-full text-xl text-slate-600 dark:text-slate-400 bg-transparent border-none outline-none resize-none leading-relaxed mb-10 placeholder:text-slate-400/60 dark:placeholder:text-slate-600 border-l-4 border-indigo-200 focus:border-indigo-500 pl-6 py-2 transition-all"
                                rows={2}
                            />
                        )}

                        <hr className="border-slate-200 dark:border-slate-800/60 mb-10" />

                        {/* Content Editor / Preview */}
                        {previewMode ? (
                            <div
                                className="prose prose-xl prose-slate dark:prose-invert max-w-none leading-loose text-slate-800 dark:text-slate-200 prose-headings:font-bold prose-headings:tracking-tight prose-a:text-indigo-600 dark:prose-a:text-indigo-400 prose-img:rounded-2xl prose-img:shadow-lg"
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

                
                {/* Mobile overlay */}
                {showMeta && (
                    <div 
                        className="fixed inset-0 bg-black/20 dark:bg-black/40 z-40 md:hidden"
                        onClick={() => setShowMeta(false)}
                    />
                )}
                {/* Right Sidebar - Meta */}

                <div className={`w-full md:w-80 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-l border-slate-200/50 dark:border-slate-700/50 overflow-y-auto shrink-0 transition-all duration-300 shadow-[[-10px_0_30px_rgba(0,0,0,0.1)]] z-50 ${showMeta ? 'translate-x-0 absolute md:relative right-0 inset-y-0' : 'translate-x-full absolute right-0 inset-y-0'}`}>
                    <div className="p-6 space-y-8">
                        {/* Sidebar header */}
                        <div className="flex items-center justify-between pb-4 border-b border-slate-200/60 dark:border-slate-700/60">
                            <h3 className="font-bold text-base bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-500 dark:from-white dark:to-slate-400">Settings & SEO</h3>
                            <button onClick={() => setShowMeta(false)} className="text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors bg-slate-100 dark:bg-slate-800 p-1.5 rounded-full">
                                <ArrowLeft className="h-4 w-4 rotate-180" />
                            </button>
                        </div>

                        {/* Status */}
                        <div className="space-y-2">
                            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Status</label>
                            <Select value={formData.status} onValueChange={v => setFormData(prev => ({ ...prev, status: v }))}>
                                <SelectTrigger className="h-10 text-sm bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl shadow-sm focus:ring-indigo-500/20">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl shadow-xl border-slate-100 dark:border-slate-700">
                                    <SelectItem value="DRAFT">📝 Draft</SelectItem>
                                    <SelectItem value="REVIEW">👀 In Review</SelectItem>
                                    <SelectItem value="PUBLISHED">✅ Published</SelectItem>
                                    <SelectItem value="SCHEDULED">⏰ Scheduled</SelectItem>
                                    <SelectItem value="ARCHIVED">📦 Archived</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Category */}
                        <div className="space-y-2">
                            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Category</label>
                            <Select value={formData.category} onValueChange={v => setFormData(prev => ({ ...prev, category: v }))}>
                                <SelectTrigger className="h-10 text-sm bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl shadow-sm focus:ring-indigo-500/20">
                                    <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl shadow-xl border-slate-100 dark:border-slate-700">
                                    {BLOG_CATEGORIES.map(cat => (
                                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Tags */}
                        <div className="space-y-2">
                            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Tags</label>
                            <Input
                                value={formData.tags}
                                onChange={e => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                                placeholder="Tech, Career, Interview..."
                                className="h-10 text-sm bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl shadow-sm focus:ring-indigo-500/20"
                            />
                            <p className="text-[10px] text-slate-400">Comma separated for better discovery</p>
                        </div>

                        {/* Cover Image */}
                        <div className="space-y-2">
                            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                                <ImageIcon className="h-3.5 w-3.5" />
                                Cover Image
                            </label>
                            <div className="space-y-3">
                                <label className="flex items-center justify-center h-24 w-full border-2 border-dashed border-indigo-200 dark:border-indigo-900/50 bg-indigo-50/50 dark:bg-indigo-950/20 rounded-xl cursor-pointer hover:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/40 transition-all duration-300 text-sm text-indigo-500 hover:text-indigo-600 font-medium shadow-inner">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleCoverImageChange}
                                        disabled={isUploadingCover}
                                        className="hidden"
                                    />
                                    {isUploadingCover ? (
                                        <span className="flex items-center gap-2"><Loader2 className="h-5 w-5 animate-spin" />Uploading...</span>
                                    ) : (
                                        <span className="flex flex-col items-center gap-1.5">
                                            <ImageIcon className="h-6 w-6 opacity-60" />
                                            Upload High-Res Cover
                                        </span>
                                    )}
                                </label>
                                {formData.coverImage && (
                                    <div className="relative rounded-xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-700 group">
                                        <Image
                                            src={getFullImageUrl(formData.coverImage)}
                                            alt="Cover"
                                            width={280}
                                            height={120}
                                            className="w-full h-32 object-cover"
                                        />
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <button
                                                onClick={() => setFormData(prev => ({ ...prev, coverImage: '' }))}
                                                className="bg-red-500 text-white text-[11px] font-bold px-3 py-1.5 rounded-full shadow-lg hover:bg-red-600 transform hover:scale-105 transition-all"
                                            >Remove</button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <hr className="my-6 border-slate-200/60 dark:border-slate-700/60" />

                        {/* SEO Optimization */}
                        <div className="space-y-4">
                            <label className="text-[11px] font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 to-teal-500 uppercase tracking-widest flex items-center gap-1.5">
                                <Sparkles className="h-3.5 w-3.5 text-emerald-500" /> SEO Magic
                            </label>
                            <div className="space-y-2">
                                <label className="text-[11px] font-medium text-slate-500">Meta Title</label>
                                <Input value={formData.metaTitle} onChange={e => setFormData(prev => ({...prev, metaTitle: e.target.value}))} placeholder="60 chars max" className="h-10 text-sm bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl shadow-sm focus:ring-emerald-500/20" />
                                <p className={`text-[10px] text-right ${formData.metaTitle.length > 60 ? 'text-red-500 font-bold' : 'text-slate-400'}`}>{formData.metaTitle.length}/60 chars</p>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[11px] font-medium text-slate-500">Meta Description</label>
                                <textarea value={formData.metaDescription} onChange={e => setFormData(prev => ({...prev, metaDescription: e.target.value}))} placeholder="155 chars max" className="w-full text-sm p-3 border border-slate-200 dark:border-slate-700 rounded-xl h-24 bg-white dark:bg-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 transition-all resize-none" />
                                <p className={`text-[10px] text-right ${formData.metaDescription.length > 155 ? 'text-red-500 font-bold' : 'text-slate-400'}`}>{formData.metaDescription.length}/155 chars</p>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[11px] font-medium text-slate-500">Canonical URL</label>
                                <Input value={formData.canonicalUrl} onChange={e => setFormData(prev => ({...prev, canonicalUrl: e.target.value}))} placeholder="https://techwell.com/..." className="h-10 text-sm bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl shadow-sm focus:ring-emerald-500/20" />
                            </div>
                        </div>

                        <hr className="my-6 border-slate-200/60 dark:border-slate-700/60" />

                        {/* Scheduling */}
                        <div className="space-y-4">
                            <label className="text-[11px] font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-indigo-500 uppercase tracking-widest">Publishing Timeline</label>
                            <div className="space-y-2">
                                <label className="text-[11px] font-medium text-slate-500">Schedule Publish</label>
                                <Input type="datetime-local" value={formData.scheduledPublishAt} onChange={e => setFormData(prev => ({...prev, scheduledPublishAt: e.target.value}))} className="h-10 text-sm bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl shadow-sm focus:ring-blue-500/20" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[11px] font-medium text-slate-500">Auto Archive</label>
                                <Input type="datetime-local" value={formData.autoArchiveAt} onChange={e => setFormData(prev => ({...prev, autoArchiveAt: e.target.value}))} className="h-10 text-sm bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl shadow-sm focus:ring-blue-500/20" />
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="bg-gradient-to-br from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-900 rounded-2xl p-4 shadow-inner border border-slate-200 dark:border-slate-700/50 mt-8">
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Live Stats</p>
                            <div className="grid grid-cols-2 gap-3 text-center">
                                <div className="bg-white dark:bg-slate-800 rounded-xl p-3 shadow-sm border border-slate-100 dark:border-slate-700">
                                    <p className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-br from-blue-600 to-indigo-600">{wordCount}</p>
                                    <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest mt-1">Words</p>
                                </div>
                                <div className="bg-white dark:bg-slate-800 rounded-xl p-3 shadow-sm border border-slate-100 dark:border-slate-700">
                                    <p className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-br from-emerald-500 to-teal-500">{readingTime}m</p>
                                    <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest mt-1">Read Time</p>
                                </div>
                            </div>
                        </div>

                        {/* Quick save */}
                        <div className="space-y-3 pt-4 pb-20">
                            <Button
                                onClick={() => handleSave()}
                                disabled={isSaving}
                                className="w-full gap-2 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white dark:text-slate-900 text-white rounded-xl h-11 shadow-md hover:shadow-lg transition-all"
                            >
                                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                Save Draft
                            </Button>
                            <Button
                                onClick={() => handleSave('PUBLISHED')}
                                disabled={isSaving || formData.status === 'PUBLISHED'}
                                className="w-full gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl h-11 shadow-[0_4px_14px_0_rgba(16,185,129,0.39)] hover:shadow-[0_6px_20px_rgba(16,185,129,0.23)] transition-all hover:-translate-y-0.5 border-none"
                            >
                                Publish Post
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Show meta toggle if hidden */}
                {!showMeta && (
                    <button
                        onClick={() => setShowMeta(true)}
                        className="fixed right-4 bottom-8 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200 dark:border-slate-700 rounded-full p-4 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_8px_40px_rgb(0,0,0,0.16)] transform hover:-translate-y-1 transition-all duration-300 group"
                    >
                        <Type className="h-5 w-5 group-hover:scale-110 transition-transform" />
                        <span className="sr-only">Open Settings</span>
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
