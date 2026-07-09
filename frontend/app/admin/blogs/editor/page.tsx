"use client"

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import api, { uploadApi } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
    Sparkles, Loader2, Save, ArrowLeft, Type, ImageIcon, FileText, Settings, Clock, BarChart3, Layout, Trash2
} from 'lucide-react'
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import { toast } from 'sonner'
import { getFullImageUrl } from '@/lib/image-utils'
import { RichTextEditor } from '@/components/editor/RichTextEditor'

function BlogEditorContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const blogId = searchParams.get('id')
    const isEdit = !!blogId

    const [isLoading, setIsLoading] = useState(isEdit)
    const [isSaving, setIsSaving] = useState(false)
    const [isUploadingCover, setIsUploadingCover] = useState(false)
    const [wordCount, setWordCount] = useState(0)
    
    const [aiTopic, setAiTopic] = useState("")
    const [aiKeywords, setAiKeywords] = useState("")
    const [isGeneratingAi, setIsGeneratingAi] = useState(false)
    const [showAiPanel, setShowAiPanel] = useState(false)
    
    const [availableCategories, setAvailableCategories] = useState<string[]>([])

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

        api.get('/blogs/categories')
            .then(res => setAvailableCategories(res.data))
            .catch(console.error)
    }, [blogId, isEdit])

    useEffect(() => {
        const text = formData.content.replace(/<[^>]+>/g, '') 
        const words = text.trim() ? text.trim().split(/\s+/).length : 0
        setWordCount(words)
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
                autoArchiveAt: formData.autoArchiveAt ? new Date(formData.autoArchiveAt).toISOString() : null,
            }

            if (isEdit) {
                await api.put(`/blogs/${formData.id}`, payload)
                toast.success("Blog post updated!")
            } else {
                const res = await api.post('/blogs', payload)
                toast.success("Blog post created!")
                router.replace(`/admin/blogs/editor?id=${res.data.id}`)
            }
            if (statusOverride) {
                setFormData(prev => ({ ...prev, status: statusOverride }))
            }
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Failed to save post")
        } finally {
            setIsSaving(false)
        }
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
        )
    }

    const readingTime = Math.ceil(wordCount / 200) || 1

    return (
        <div className="min-h-screen bg-[#fcfcfc] dark:bg-slate-950 pb-20">
            {/* Top Navigation & Status Bar */}
            <div className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" onClick={() => router.back()} className="text-slate-500 hover:text-slate-900 dark:hover:text-white">
                        <ArrowLeft className="h-4 w-4 mr-2" /> Back
                    </Button>
                    <div className="h-4 w-px bg-slate-200 dark:bg-slate-800" />
                    <div className="flex items-center gap-3 text-xs font-medium text-slate-500">
                        <span className="flex items-center gap-1"><FileText className="h-3.5 w-3.5" /> {wordCount} words</span>
                        <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {readingTime} min read</span>
                        <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded-full">
                            <BarChart3 className="h-3.5 w-3.5" /> SEO Good
                        </span>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="outline" size="sm" className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                                <Settings className="h-4 w-4 mr-2" /> Settings
                            </Button>
                        </SheetTrigger>
                        <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto bg-slate-50 dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 p-0">
                            <SheetHeader className="p-6 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10">
                                <SheetTitle className="flex items-center gap-2">
                                    <Layout className="h-5 w-5 text-indigo-600" /> Post Settings
                                </SheetTitle>
                                <SheetDescription>
                                    Manage SEO, category, and metadata for this post.
                                </SheetDescription>
                            </SheetHeader>
                            <div className="p-6 space-y-8">
                                
                                {/* Status */}
                                <div className="space-y-4 bg-white dark:bg-slate-950 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                                    <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                        <Settings className="h-4 w-4 text-slate-400" /> Publishing Status
                                    </h3>
                                    <Select value={formData.status} onValueChange={v => setFormData(prev => ({ ...prev, status: v }))}>
                                        <SelectTrigger className="h-10 text-sm bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="DRAFT">Draft</SelectItem>
                                            <SelectItem value="REVIEW">Pending Review</SelectItem>
                                            <SelectItem value="SEO_OPTIMIZATION">SEO Optimization</SelectItem>
                                            <SelectItem value="APPROVED">Approved</SelectItem>
                                            <SelectItem value="SCHEDULED">Scheduled</SelectItem>
                                            <SelectItem value="PUBLISHED">Published</SelectItem>
                                            <SelectItem value="ARCHIVED">Archived</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Cover Image */}
                                <div className="space-y-4 bg-white dark:bg-slate-950 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                                    <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                        <ImageIcon className="h-4 w-4 text-slate-400" /> Cover Image
                                    </h3>
                                    {formData.coverImage ? (
                                        <div className="relative aspect-video w-full rounded-xl overflow-hidden group border border-slate-200 dark:border-slate-800">
                                            <Image src={getFullImageUrl(formData.coverImage)} alt="Cover" fill className="object-cover transition-transform group-hover:scale-105" />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <Button variant="destructive" size="sm" onClick={() => setFormData(p => ({ ...p, coverImage: '' }))}><Trash2 className="h-4 w-4 mr-2"/> Remove</Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <label className="flex flex-col items-center justify-center aspect-video w-full border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors">
                                            {isUploadingCover ? <Loader2 className="h-6 w-6 animate-spin text-slate-400" /> : (
                                                <>
                                                    <div className="h-10 w-10 rounded-full bg-white dark:bg-slate-950 flex items-center justify-center shadow-sm mb-2 border border-slate-100 dark:border-slate-800">
                                                        <ImageIcon className="h-5 w-5 text-slate-400" />
                                                    </div>
                                                    <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Click to upload</span>
                                                    <span className="text-xs text-slate-400 mt-1">1200 x 630px recommended</span>
                                                </>
                                            )}
                                            <input type="file" className="hidden" accept="image/*" onChange={handleCoverImageChange} disabled={isUploadingCover} />
                                        </label>
                                    )}
                                </div>

                                {/* Classification */}
                                <div className="space-y-4 bg-white dark:bg-slate-950 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                                    <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                        <Type className="h-4 w-4 text-slate-400" /> Classification
                                    </h3>
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Category</label>
                                            <Input
                                                list="blog-categories"
                                                value={formData.category}
                                                onChange={e => setFormData(prev => ({ ...prev, category: e.target.value }))}
                                                placeholder="E.g., Software Development"
                                                className="h-10 text-sm bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700"
                                            />
                                            <datalist id="blog-categories">
                                                {availableCategories.map(cat => (
                                                    <option key={cat} value={cat} />
                                                ))}
                                            </datalist>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Tags (Comma separated)</label>
                                            <Input 
                                                value={formData.tags} 
                                                onChange={e => setFormData(prev => ({ ...prev, tags: e.target.value }))} 
                                                placeholder="react, typescript, tutorial" 
                                                className="h-10 text-sm bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700" 
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Summary / Excerpt</label>
                                            <textarea 
                                                className="w-full min-h-[100px] p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                                                placeholder="Brief summary for cards and feeds..."
                                                value={formData.excerpt}
                                                onChange={e => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* SEO Metadata */}
                                <div className="space-y-4 bg-white dark:bg-slate-950 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                                    <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center justify-between w-full">
                                        <span className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-emerald-500" /> Search Engine Optimization</span>
                                        <Button 
                                            size="sm" 
                                            variant="ghost" 
                                            className="h-7 text-[10px] uppercase tracking-widest text-emerald-600 bg-emerald-50 hover:bg-emerald-100"
                                            onClick={async () => {
                                                if (!formData.content) return toast.error("Write some content first!");
                                                try {
                                                    toast.loading("AI is generating SEO metadata...");
                                                    const res = await api.post('/ai/blog/seo', { title: formData.title, content: formData.content });
                                                    setFormData(p => ({ ...p, metaTitle: res.data.metaTitle, metaDescription: res.data.metaDescription }));
                                                    toast.dismiss();
                                                    toast.success("SEO Metadata generated!");
                                                } catch (e) {
                                                    toast.dismiss();
                                                    toast.error("Failed to generate SEO");
                                                }
                                            }}
                                        >
                                            Auto AI
                                        </Button>
                                    </h3>
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Meta Title</label>
                                            <Input value={formData.metaTitle} onChange={e => setFormData(prev => ({ ...prev, metaTitle: e.target.value }))} placeholder="SEO Title" className="h-10 text-sm bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Meta Description</label>
                                            <textarea className="w-full min-h-[80px] p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/20" value={formData.metaDescription} onChange={e => setFormData(prev => ({ ...prev, metaDescription: e.target.value }))} placeholder="SEO Description" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </SheetContent>
                    </Sheet>

                    <Button variant="outline" size="sm" onClick={() => handleSave('DRAFT')} disabled={isSaving} className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                        {isSaving && formData.status === 'DRAFT' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                        Save Draft
                    </Button>
                    <Button size="sm" onClick={() => handleSave('PUBLISHED')} disabled={isSaving} className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm font-medium">
                        {isSaving && formData.status === 'PUBLISHED' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Publish Now"}
                    </Button>
                </div>
            </div>

            {/* Distraction-Free Editor Area */}
            <div className="max-w-3xl mx-auto mt-16 px-6">
                
                {/* AI Assistant Banner */}
                {showAiPanel && (
                    <div className="mb-12 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-2xl p-6 border border-indigo-100 dark:border-indigo-900/30">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/50">
                                <Sparkles className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <h3 className="font-bold text-indigo-900 dark:text-indigo-200">AI Assistant</h3>
                            <Button variant="ghost" size="sm" className="ml-auto text-indigo-600/50 hover:text-indigo-600" onClick={() => setShowAiPanel(false)}>Dismiss</Button>
                        </div>
                        <div className="grid gap-4 md:grid-cols-[1fr_1fr_auto]">
                            <Input placeholder="What do you want to write about?" value={aiTopic} onChange={e => setAiTopic(e.target.value)} className="bg-white dark:bg-slate-950 border-0 shadow-sm" />
                            <Input placeholder="Keywords (optional)" value={aiKeywords} onChange={e => setAiKeywords(e.target.value)} className="bg-white dark:bg-slate-950 border-0 shadow-sm" />
                            <Button onClick={handleAiGenerate} disabled={isGeneratingAi} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                                {isGeneratingAi ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...</> : "Generate Draft"}
                            </Button>
                        </div>
                    </div>
                )}
                {!showAiPanel && (
                    <div className="mb-12">
                        <Button variant="ghost" size="sm" onClick={() => setShowAiPanel(true)} className="text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-full">
                            <Sparkles className="h-4 w-4 mr-2" /> Use AI Assistant
                        </Button>
                    </div>
                )}

                {/* Massive Title Input */}
                <textarea
                    placeholder="Article Title"
                    value={formData.title}
                    onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full text-5xl md:text-6xl font-extrabold text-slate-900 dark:text-white bg-transparent border-none outline-none resize-none focus:ring-0 placeholder:text-slate-200 dark:placeholder:text-slate-800 mb-8 tracking-tight leading-[1.1] min-h-[80px]"
                    rows={1}
                    onInput={(e) => {
                        const target = e.target as HTMLTextAreaElement;
                        target.style.height = 'auto';
                        target.style.height = `${target.scrollHeight}px`;
                    }}
                />

                {/* Rich Text Area */}
                <div className="prose prose-xl prose-slate dark:prose-invert max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-a:text-indigo-600 dark:prose-a:text-indigo-400">
                    <RichTextEditor
                        value={formData.content}
                        onChange={(content) => setFormData(prev => ({ ...prev, content }))}
                        placeholder="Start typing your story..."
                    />
                </div>
                
            </div>
            
            <style jsx global>{`
                .quill > .ql-container {
                    font-family: inherit !important;
                    font-size: 1.125rem !important;
                }
                .quill > .ql-toolbar {
                    position: sticky;
                    top: 73px;
                    z-index: 30;
                    background: rgba(255, 255, 255, 0.9) !important;
                    backdrop-filter: blur(8px);
                    border-radius: 0.5rem;
                    margin-bottom: 2rem;
                    border: 1px solid #e2e8f0 !important;
                }
                .dark .quill > .ql-toolbar {
                    background: rgba(15, 23, 42, 0.9) !important;
                    border-color: #1e293b !important;
                }
                .ql-editor {
                    padding: 0 !important;
                    min-height: 50vh !important;
                }
                .ql-editor.ql-blank::before {
                    left: 0 !important;
                    font-style: normal !important;
                    color: #cbd5e1 !important;
                }
            `}</style>
        </div>
    )
}

export default function BlogEditorPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
        }>
            <BlogEditorContent />
        </Suspense>
    )
}
