"use client"

import * as React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
    Globe, Plus, Edit, Trash2, Eye, EyeOff, Copy, ExternalLink,
    CheckCircle, FileCode, Palette, Zap, Search, Loader2, Code,
    BarChart2, Lock, Unlock, RefreshCw
} from 'lucide-react'
import { toast } from 'sonner'
import api from '@/lib/api'
import dynamic from 'next/dynamic'

const GrapesJsEditor = dynamic(() => import('@/components/admin/GrapesJsEditor'), { ssr: false, loading: () => <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-indigo-500" /></div> })

interface LandingPage {
    id: string
    title: string
    slug: string
    status: string
    htmlContent?: string
    customCss?: string
    customJs?: string
    headerCode?: string
    seoTitle?: string
    seoDesc?: string
    ogImage?: string
    pagePassword?: string
    views: number
    createdAt: string
    updatedAt: string
}

const defaultHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>My Custom Page</title>
</head>
<body>
  <section style="font-family:sans-serif; max-width:900px; margin:80px auto; padding:0 20px; text-align:center;">
    <h1 style="font-size:2.5rem; color:#1e293b; margin-bottom:16px;">Welcome to Our Page</h1>
    <p style="font-size:1.125rem; color:#64748b; margin-bottom:32px;">
      Edit this content from the admin panel. No coding knowledge required!
    </p>
    <a href="#" style="background:#6366f1; color:#fff; padding:14px 32px; border-radius:8px; text-decoration:none; font-weight:600; font-size:1rem;">
      Get Started
    </a>
  </section>
</body>
</html>`

export default function CMSPagesBuilderPage() {
    const [pages, setPages] = React.useState<LandingPage[]>([])
    const [isLoading, setIsLoading] = React.useState(true)
    const [search, setSearch] = React.useState('')
    const [isSaving, setIsSaving] = React.useState(false)
    const [editingPage, setEditingPage] = React.useState<Partial<LandingPage> | null>(null)
    const [activeEditorTab, setActiveEditorTab] = React.useState('builder')

    const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
    const getHeaders = () => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : ''
        return { headers: { Authorization: `Bearer ${token}` } }
    }

    const fetchPages = React.useCallback(async () => {
        setIsLoading(true)
        try {
            const res = await api.get('/admin/marketing/landing-pages')
            setPages(res.data.pages || [])
        } catch (e) {
            toast.error('Failed to load pages')
        } finally {
            setIsLoading(false)
        }
    }, [])

    React.useEffect(() => { fetchPages() }, [fetchPages])

    const handleNewPage = () => {
        setEditingPage({
            title: 'New Page',
            slug: 'new-page-' + Date.now(),
            htmlContent: '',
            customCss: '',
            customJs: '',
            headerCode: '',
            seoTitle: '',
            seoDesc: '',
            ogImage: '',
            pagePassword: '',
            status: 'DRAFT'
        })
        setActiveEditorTab('builder')
    }

    const handleEditPage = (page: LandingPage) => {
        setEditingPage({ ...page })
        setActiveEditorTab('builder')
    }

    const handleSave = async () => {
        if (!editingPage?.title || !editingPage?.slug) {
            toast.error('Title and slug are required')
            return
        }
        setIsSaving(true)
        try {
            if (editingPage.id) {
                await api.put(`/admin/marketing/landing-pages/${editingPage.id}`, editingPage)
                toast.success('Page updated successfully')
            } else {
                await api.post('/admin/marketing/landing-pages', editingPage)
                toast.success('Page created successfully')
            }
            setEditingPage(null)
            fetchPages()
        } catch (e: any) {
            toast.error(e.response?.data?.message || 'Failed to save page')
        } finally {
            setIsSaving(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this page permanently?')) return
        try {
            await api.delete(`/admin/marketing/landing-pages/${id}`)
            toast.success('Page deleted')
            fetchPages()
        } catch {
            toast.error('Failed to delete page')
        }
    }

    const handlePublishToggle = async (page: LandingPage) => {
        const newStatus = page.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED'
        try {
            await api.put(`/admin/marketing/landing-pages/${page.id}`, { status: newStatus })
            toast.success(newStatus === 'PUBLISHED' ? '🚀 Page is now LIVE!' : '📝 Page set to Draft')
            fetchPages()
        } catch {
            toast.error('Failed to update status')
        }
    }

    const handleDuplicate = async (page: LandingPage) => {
        try {
            const newSlug = page.slug + '-copy-' + Date.now().toString().slice(-4)
            await api.post('/admin/marketing/landing-pages', {
                ...page,
                id: undefined,
                title: page.title + ' (Copy)',
                slug: newSlug,
                status: 'DRAFT',
                views: 0
            })
            toast.success('Page duplicated as draft')
            fetchPages()
        } catch {
            toast.error('Failed to duplicate page')
        }
    }

    const handleSaveVisual = async (html: string, css: string) => {
        setEditingPage(prev => prev ? { ...prev, htmlContent: html, customCss: css } : null)
        // Auto trigger full save
        setIsSaving(true)
        try {
            const payload = { ...editingPage, htmlContent: html, customCss: css }
            if (payload.id) {
                await api.put(`/admin/marketing/landing-pages/${payload.id}`, payload)
                toast.success('Visual design updated')
            } else {
                const res = await api.post('/admin/marketing/landing-pages', payload)
                setEditingPage(res.data.page)
                toast.success('Page created from design')
            }
            fetchPages()
        } catch (e: any) {
            toast.error(e.response?.data?.message || 'Failed to save visual design')
        } finally {
            setIsSaving(false)
        }
    }

    const copyUrl = (slug: string) => {
        const url = `${window.location.origin}/p/${slug}`
        navigator.clipboard.writeText(url)
        toast.success('URL copied to clipboard!')
    }

    const slugify = (text: string) =>
        text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

    const filteredPages = pages.filter(p =>
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.slug.toLowerCase().includes(search.toLowerCase())
    )

    if (editingPage) {
        return (
            <div className="h-screen flex flex-col bg-slate-950 text-slate-100">
                {/* Top Bar */}
                <div className="flex items-center justify-between px-4 py-3 bg-slate-900 border-b border-slate-800 shrink-0">
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="sm" onClick={() => setEditingPage(null)} className="text-slate-400 hover:text-white">
                            ← Back
                        </Button>
                        <div className="flex items-center gap-2">
                            <FileCode className="h-4 w-4 text-indigo-400" />
                            <span className="font-semibold text-sm">{editingPage.id ? 'Edit Page' : 'New Page'}</span>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                            <Input
                                value={editingPage.title || ''}
                                onChange={e => setEditingPage({ ...editingPage, title: e.target.value })}
                                placeholder="Page Title"
                                className="h-7 text-sm bg-slate-800 border-slate-700 text-white w-48"
                            />
                            <span className="text-slate-500 text-xs">/p/</span>
                            <Input
                                value={editingPage.slug || ''}
                                onChange={e => setEditingPage({ ...editingPage, slug: slugify(e.target.value) })}
                                placeholder="page-slug"
                                className="h-7 text-sm bg-slate-800 border-slate-700 text-slate-300 font-mono w-40"
                            />
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <select
                            value={editingPage.status || 'DRAFT'}
                            onChange={e => setEditingPage({ ...editingPage, status: e.target.value })}
                            className="h-7 text-xs bg-slate-800 border border-slate-700 rounded px-2 text-slate-300"
                        >
                            <option value="DRAFT">📝 Draft</option>
                            <option value="PUBLISHED">🌐 Published</option>
                        </select>
                        <Button size="sm" onClick={handleSave} disabled={isSaving} className="h-7 text-xs bg-indigo-600 hover:bg-indigo-500">
                            {isSaving ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <CheckCircle className="h-3 w-3 mr-1" />}
                            Save Settings
                        </Button>
                    </div>
                </div>

                {/* Editor Area */}
                <div className="flex flex-1 overflow-hidden">
                    {/* Code Editor Panel */}
                    <div className="flex flex-col w-full border-r border-slate-800">
                        <div className="flex items-center gap-1 px-2 py-1.5 bg-slate-900 border-b border-slate-800">
                            {[
                                { id: 'builder', label: 'Visual Builder', icon: <Palette className="h-3 w-3" />, color: 'text-indigo-400' },
                                { id: 'js', label: 'Custom Scripts', icon: <Zap className="h-3 w-3" />, color: 'text-yellow-400' },
                                { id: 'seo', label: 'SEO & Meta', icon: <Search className="h-3 w-3" />, color: 'text-green-400' },
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveEditorTab(tab.id)}
                                    className={`flex items-center gap-1 px-3 py-1 rounded text-xs font-medium transition-colors ${activeEditorTab === tab.id
                                        ? 'bg-slate-700 text-white'
                                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'}`}
                                >
                                    <span className={tab.color}>{tab.icon}</span>
                                    {tab.label}
                                </button>
                            ))}
                            <div className="ml-auto text-xs text-slate-500">
                                {activeEditorTab === 'builder' && 'Drag and drop blocks to design your page'}
                                {activeEditorTab === 'js' && 'JavaScript injected before </body>'}
                                {activeEditorTab === 'seo' && 'SEO & page settings'}
                            </div>
                        </div>

                        <div className="flex-1 overflow-hidden relative">
                            {activeEditorTab === 'builder' && (
                                <GrapesJsEditor 
                                    initialHtml={editingPage.htmlContent}
                                    initialCss={editingPage.customCss}
                                    onSave={handleSaveVisual}
                                />
                            )}
                            {activeEditorTab === 'js' && (
                                <textarea
                                    value={editingPage.customJs || ''}
                                    onChange={e => setEditingPage({ ...editingPage, customJs: e.target.value })}
                                    className="w-full h-full p-4 bg-slate-950 text-slate-200 font-mono text-sm resize-none outline-none border-none leading-relaxed"
                                    placeholder={`// JavaScript injected before </body>\nconsole.log('Page loaded!');`}
                                    spellCheck={false}
                                />
                            )}
                            {activeEditorTab === 'seo' && (
                                <div className="p-6 space-y-5 overflow-y-auto h-full max-w-3xl mx-auto">
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">SEO Title</label>
                                        <Input
                                            value={editingPage.seoTitle || ''}
                                            onChange={e => setEditingPage({ ...editingPage, seoTitle: e.target.value })}
                                            placeholder="Page title for search engines"
                                            className="bg-slate-800 border-slate-700 text-white"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Meta Description</label>
                                        <textarea
                                            value={editingPage.seoDesc || ''}
                                            onChange={e => setEditingPage({ ...editingPage, seoDesc: e.target.value })}
                                            rows={3}
                                            placeholder="Short description shown in Google search results..."
                                            className="w-full p-3 rounded-md bg-slate-800 border border-slate-700 text-white text-sm resize-none outline-none"
                                        />
                                        <p className="text-xs text-slate-500">{(editingPage.seoDesc || '').length}/160 characters</p>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">OG Image URL (Social Share)</label>
                                        <Input
                                            value={editingPage.ogImage || ''}
                                            onChange={e => setEditingPage({ ...editingPage, ogImage: e.target.value })}
                                            placeholder="https://..."
                                            className="bg-slate-800 border-slate-700 text-white"
                                        />
                                    </div>
                                    <div className="space-y-2 pt-4 border-t border-slate-800">
                                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                                            <Lock className="h-3 w-3" /> Page Password (optional)
                                        </label>
                                        <Input
                                            value={editingPage.pagePassword || ''}
                                            onChange={e => setEditingPage({ ...editingPage, pagePassword: e.target.value })}
                                            placeholder="Leave blank for public access"
                                            type="password"
                                            className="bg-slate-800 border-slate-700 text-white"
                                        />
                                        <p className="text-xs text-slate-500">If set, visitors must enter this password to view the page.</p>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Extra Header Code</label>
                                        <textarea
                                            value={editingPage.headerCode || ''}
                                            onChange={e => setEditingPage({ ...editingPage, headerCode: e.target.value })}
                                            rows={5}
                                            placeholder="<!-- Scripts/pixels injected in <head> (e.g. Google Analytics, FB Pixel) -->"
                                            className="w-full p-3 rounded-md bg-slate-800 border border-slate-700 text-white font-mono text-xs resize-none outline-none"
                                            spellCheck={false}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-10">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                            <Globe className="h-4 w-4 text-white" />
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight">CMS Page Builder</h1>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        Create custom pages at <code className="bg-muted px-1.5 py-0.5 rounded text-xs">yoursite.com/p/slug</code> — no deployment needed. Paste HTML, publish instantly.
                    </p>
                </div>
                <Button onClick={handleNewPage} className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2 shrink-0">
                    <Plus className="h-4 w-4" /> New Page
                </Button>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                    { label: 'Total Pages', value: pages.length, icon: <FileCode className="h-4 w-4" />, color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-950/30' },
                    { label: 'Published', value: pages.filter(p => p.status === 'PUBLISHED').length, icon: <Globe className="h-4 w-4" />, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-950/30' },
                    { label: 'Drafts', value: pages.filter(p => p.status === 'DRAFT').length, icon: <Edit className="h-4 w-4" />, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-950/30' },
                    { label: 'Total Views', value: pages.reduce((a, p) => a + (p.views || 0), 0).toLocaleString(), icon: <BarChart2 className="h-4 w-4" />, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-950/30' },
                ].map(stat => (
                    <Card key={stat.label} className="border-0 shadow-sm">
                        <CardContent className="p-4">
                            <div className={`inline-flex p-2 rounded-lg ${stat.bg} ${stat.color} mb-2`}>{stat.icon}</div>
                            <p className="text-2xl font-bold">{stat.value}</p>
                            <p className="text-xs text-muted-foreground">{stat.label}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Search */}
            <div className="relative max-w-sm">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search pages..."
                    className="pl-9"
                />
            </div>

            {/* Pages list */}
            {isLoading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : filteredPages.length === 0 ? (
                <Card className="border-dashed border-2">
                    <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="h-16 w-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/30 flex items-center justify-center mb-4">
                            <Globe className="h-8 w-8 text-indigo-400" />
                        </div>
                        <h3 className="font-semibold text-lg mb-1">No pages yet</h3>
                        <p className="text-sm text-muted-foreground mb-4">Create your first custom page — no CICD deployment needed!</p>
                        <Button onClick={handleNewPage} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                            <Plus className="h-4 w-4 mr-2" /> Create First Page
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-3">
                    {filteredPages.map(page => (
                        <Card key={page.id} className="border border-border shadow-sm hover:shadow-md transition-shadow">
                            <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="flex items-start gap-3 flex-1 min-w-0">
                                    <div className={`mt-0.5 h-2.5 w-2.5 rounded-full shrink-0 ${page.status === 'PUBLISHED' ? 'bg-green-500 animate-pulse' : 'bg-amber-400'}`} />
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="font-semibold text-sm">{page.title}</span>
                                            <Badge variant={page.status === 'PUBLISHED' ? 'default' : 'secondary'} className="text-[10px] px-1.5 py-0">
                                                {page.status === 'PUBLISHED' ? '🟢 Live' : '📝 Draft'}
                                            </Badge>
                                            {page.pagePassword && (
                                                <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                                                    <Lock className="h-2.5 w-2.5 mr-1" /> Protected
                                                </Badge>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2 mt-1">
                                            <code className="text-xs text-muted-foreground font-mono bg-muted px-1.5 py-0.5 rounded">/p/{page.slug}</code>
                                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                <BarChart2 className="h-3 w-3" /> {page.views || 0} views
                                            </span>
                                            <span className="text-xs text-muted-foreground">
                                                Updated {new Date(page.updatedAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1 shrink-0 flex-wrap">
                                    {/* Copy URL */}
                                    <Button
                                        variant="ghost" size="icon"
                                        className="h-8 w-8 text-slate-500 hover:text-indigo-600"
                                        onClick={() => copyUrl(page.slug)}
                                        title="Copy URL"
                                    >
                                        <Copy className="h-3.5 w-3.5" />
                                    </Button>
                                    {/* Open in new tab */}
                                    {page.status === 'PUBLISHED' && (
                                        <Button
                                            variant="ghost" size="icon"
                                            className="h-8 w-8 text-slate-500 hover:text-green-600"
                                            onClick={() => window.open(`/p/${page.slug}`, '_blank')}
                                            title="View live"
                                        >
                                            <ExternalLink className="h-3.5 w-3.5" />
                                        </Button>
                                    )}
                                    {/* Duplicate */}
                                    <Button
                                        variant="ghost" size="icon"
                                        className="h-8 w-8 text-slate-500 hover:text-purple-600"
                                        onClick={() => handleDuplicate(page)}
                                        title="Duplicate page"
                                    >
                                        <RefreshCw className="h-3.5 w-3.5" />
                                    </Button>
                                    {/* Publish Toggle */}
                                    <Button
                                        variant="ghost" size="sm"
                                        className={`h-8 text-xs px-2 ${page.status === 'PUBLISHED' ? 'text-amber-600 hover:bg-amber-50' : 'text-green-600 hover:bg-green-50'}`}
                                        onClick={() => handlePublishToggle(page)}
                                        title={page.status === 'PUBLISHED' ? 'Unpublish' : 'Publish'}
                                    >
                                        {page.status === 'PUBLISHED' ? <EyeOff className="h-3.5 w-3.5 mr-1" /> : <Globe className="h-3.5 w-3.5 mr-1" />}
                                        {page.status === 'PUBLISHED' ? 'Unpublish' : 'Publish'}
                                    </Button>
                                    {/* Edit */}
                                    <Button
                                        variant="ghost" size="icon"
                                        className="h-8 w-8 text-slate-500 hover:text-blue-600"
                                        onClick={() => handleEditPage(page)}
                                        title="Edit page"
                                    >
                                        <Edit className="h-3.5 w-3.5" />
                                    </Button>
                                    {/* Delete */}
                                    <Button
                                        variant="ghost" size="icon"
                                        className="h-8 w-8 text-slate-400 hover:text-red-600"
                                        onClick={() => handleDelete(page.id)}
                                        title="Delete page"
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Info card */}
            <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/20 border-indigo-100 dark:border-indigo-900">
                <CardContent className="p-5">
                    <h3 className="font-semibold text-sm text-indigo-900 dark:text-indigo-300 mb-3 flex items-center gap-2">
                        <Zap className="h-4 w-4" /> How to use the Page Builder
                    </h3>
                    <div className="grid sm:grid-cols-3 gap-4 text-xs text-indigo-800 dark:text-indigo-300">
                        <div className="flex gap-2">
                            <span className="font-bold text-indigo-500 shrink-0">1.</span>
                            <span>Click <strong>New Page</strong>, set a title and slug (e.g., <code>campus-drive</code>)</span>
                        </div>
                        <div className="flex gap-2">
                            <span className="font-bold text-indigo-500 shrink-0">2.</span>
                            <span>Design your page using the drag-and-drop <strong>Visual Builder</strong>. Add images and text blocks visually!</span>
                        </div>
                        <div className="flex gap-2">
                            <span className="font-bold text-indigo-500 shrink-0">3.</span>
                            <span>Hit <strong>Publish</strong> — instantly live at <code>yoursite.com/p/campus-drive</code></span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
