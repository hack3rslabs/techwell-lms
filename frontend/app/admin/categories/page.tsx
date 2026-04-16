'use client'

import * as React from 'react'
import { courseCategoryApi } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
    Plus, Pencil, Trash2, Loader2, X, Check,
    FolderOpen, ToggleLeft, ToggleRight, GripVertical
} from 'lucide-react'

interface CourseCategory {
    id: string
    name: string
    slug: string
    description: string | null
    icon: string | null
    color: string | null
    isActive: boolean
    orderIndex: number
    _count?: { courses: number }
}

const PRESET_COLORS = [
    '#6366f1', '#0ea5e9', '#8b5cf6', '#ef4444',
    '#10b981', '#f59e0b', '#f97316', '#ec4899', '#14b8a6'
]

function slugify(str: string) {
    return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

export default function AdminCategoriesPage() {
    const [categories, setCategories] = React.useState<CourseCategory[]>([])
    const [isLoading, setIsLoading] = React.useState(true)
    const [showForm, setShowForm] = React.useState(false)
    const [editingId, setEditingId] = React.useState<string | null>(null)
    const [isSaving, setIsSaving] = React.useState(false)
    const [deletingId, setDeletingId] = React.useState<string | null>(null)
    const [error, setError] = React.useState('')

    const emptyForm = { name: '', slug: '', description: '', icon: '', color: '#6366f1', isActive: true, orderIndex: 0 }
    const [form, setForm] = React.useState(emptyForm)

    const fetchCategories = async () => {
        setIsLoading(true)
        try {
            const res = await courseCategoryApi.getAllAdmin()
            setCategories(res.data.categories || [])
        } catch {
            setError('Failed to load categories')
        } finally {
            setIsLoading(false)
        }
    }

    React.useEffect(() => { fetchCategories() }, [])

    const openCreate = () => {
        setEditingId(null)
        setForm({ ...emptyForm, orderIndex: categories.length })
        setShowForm(true)
        setError('')
    }

    const openEdit = (cat: CourseCategory) => {
        setEditingId(cat.id)
        setForm({
            name: cat.name,
            slug: cat.slug,
            description: cat.description || '',
            icon: cat.icon || '',
            color: cat.color || '#6366f1',
            isActive: cat.isActive,
            orderIndex: cat.orderIndex,
        })
        setShowForm(true)
        setError('')
    }

    const handleNameChange = (name: string) => {
        setForm(f => ({ ...f, name, slug: editingId ? f.slug : slugify(name) }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!form.name.trim() || form.name.trim().length < 2) {
            setError('Name must be at least 2 characters')
            return
        }
        setIsSaving(true)
        setError('')
        try {
            if (editingId) {
                await courseCategoryApi.update(editingId, {
                    name: form.name.trim(),
                    slug: form.slug.trim(),
                    description: form.description.trim() || undefined,
                    icon: form.icon.trim() || undefined,
                    color: form.color,
                    isActive: form.isActive,
                    orderIndex: Number(form.orderIndex),
                })
            } else {
                await courseCategoryApi.create({
                    name: form.name.trim(),
                    slug: form.slug.trim(),
                    description: form.description.trim() || undefined,
                    icon: form.icon.trim() || undefined,
                    color: form.color,
                    isActive: form.isActive,
                    orderIndex: Number(form.orderIndex),
                })
            }
            setShowForm(false)
            setEditingId(null)
            setForm(emptyForm)
            await fetchCategories()
        } catch (err: unknown) {
            const e = err as { response?: { data?: { error?: string } } }
            setError(e.response?.data?.error || 'Failed to save category')
        } finally {
            setIsSaving(false)
        }
    }

    const handleDelete = async (cat: CourseCategory) => {
        if (!window.confirm(`Delete "${cat.name}"? This cannot be undone.`)) return
        setDeletingId(cat.id)
        try {
            await courseCategoryApi.delete(cat.id)
            await fetchCategories()
        } catch (err: unknown) {
            const e = err as { response?: { data?: { error?: string } } }
            alert(e.response?.data?.error || 'Failed to delete category')
        } finally {
            setDeletingId(null)
        }
    }

    const handleToggleActive = async (cat: CourseCategory) => {
        try {
            await courseCategoryApi.update(cat.id, { isActive: !cat.isActive })
            await fetchCategories()
        } catch {
            alert('Failed to update status')
        }
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Course Categories</h1>
                    <p className="text-muted-foreground mt-1">
                        Manage the categories that instructors can assign to courses.
                    </p>
                </div>
                <Button id="create-category-btn" onClick={openCreate} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Category
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Total', value: categories.length },
                    { label: 'Active', value: categories.filter(c => c.isActive).length },
                    { label: 'Inactive', value: categories.filter(c => !c.isActive).length },
                    { label: 'Total Courses', value: categories.reduce((acc, c) => acc + (c._count?.courses || 0), 0) },
                ].map(stat => (
                    <Card key={stat.label} className="text-center">
                        <CardContent className="pt-4 pb-4">
                            <p className="text-3xl font-black text-primary">{stat.value}</p>
                            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mt-1">{stat.label}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Create / Edit Form */}
            {showForm && (
                <Card className="border-primary/40 shadow-lg">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <div>
                            <CardTitle>{editingId ? 'Edit Category' : 'New Category'}</CardTitle>
                            <CardDescription>Fill in the details below and save.</CardDescription>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => { setShowForm(false); setEditingId(null); setError('') }}>
                            <X className="h-4 w-4" />
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {error && (
                                <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/40 rounded-lg">
                                    {error}
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-semibold">Category Name *</label>
                                    <Input
                                        id="cat-name"
                                        value={form.name}
                                        onChange={e => handleNameChange(e.target.value)}
                                        placeholder="e.g. Cloud & DevOps Engineering"
                                        required
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-semibold">Slug *</label>
                                    <Input
                                        id="cat-slug"
                                        value={form.slug}
                                        onChange={e => setForm(f => ({ ...f, slug: e.target.value }))}
                                        placeholder="e.g. cloud-devops-engineering"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold">Description</label>
                                <Input
                                    id="cat-description"
                                    value={form.description}
                                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                                    placeholder="Brief description of what this category covers"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-semibold">Icon (emoji)</label>
                                    <Input
                                        id="cat-icon"
                                        value={form.icon}
                                        onChange={e => setForm(f => ({ ...f, icon: e.target.value }))}
                                        placeholder="e.g. ☁️"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-semibold">Accent Color</label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="color"
                                            value={form.color}
                                            onChange={e => setForm(f => ({ ...f, color: e.target.value }))}
                                            className="h-9 w-9 rounded border cursor-pointer"
                                        />
                                        <div className="flex gap-1 flex-wrap">
                                            {PRESET_COLORS.map(c => (
                                                <button
                                                    key={c}
                                                    type="button"
                                                    onClick={() => setForm(f => ({ ...f, color: c }))}
                                                    className="w-5 h-5 rounded-full border-2 transition-transform hover:scale-110"
                                                    style={{ backgroundColor: c, borderColor: form.color === c ? '#000' : 'transparent' }}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-semibold">Display Order</label>
                                    <Input
                                        id="cat-order"
                                        type="number"
                                        min="0"
                                        value={form.orderIndex}
                                        onChange={e => setForm(f => ({ ...f, orderIndex: Number(e.target.value) }))}
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-2 border-t">
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <button
                                        type="button"
                                        onClick={() => setForm(f => ({ ...f, isActive: !f.isActive }))}
                                        className={`relative w-11 h-6 rounded-full transition-colors ${form.isActive ? 'bg-primary' : 'bg-muted'}`}
                                    >
                                        <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${form.isActive ? 'translate-x-6' : 'translate-x-1'}`} />
                                    </button>
                                    <span className="text-sm font-medium">{form.isActive ? 'Active' : 'Inactive'}</span>
                                </label>
                                <div className="flex gap-2">
                                    <Button type="button" variant="ghost" onClick={() => { setShowForm(false); setError('') }}>Cancel</Button>
                                    <Button id="save-category-btn" type="submit" disabled={isSaving} className="gap-2">
                                        {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                                        {editingId ? 'Update Category' : 'Create Category'}
                                    </Button>
                                </div>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            {/* Category List */}
            {isLoading ? (
                <div className="flex justify-center py-16">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : categories.length === 0 ? (
                <div className="text-center py-20 border-2 border-dashed rounded-2xl text-muted-foreground">
                    <FolderOpen className="h-12 w-12 mx-auto mb-4 opacity-20" />
                    <p className="font-medium">No categories yet.</p>
                    <p className="text-sm mt-1">Click &quot;Add Category&quot; to create the first one.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-3">
                    {categories.map(cat => (
                        <Card
                            key={cat.id}
                            className={`transition-all hover:shadow-md ${!cat.isActive ? 'opacity-60' : ''}`}
                        >
                            <CardContent className="p-4 flex items-center gap-4">
                                <GripVertical className="h-5 w-5 text-muted-foreground flex-shrink-0" />

                                {/* Color + Icon */}
                                <div
                                    className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                                    style={{ backgroundColor: `${cat.color}20`, border: `2px solid ${cat.color}40` }}
                                >
                                    {cat.icon || '📁'}
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="font-semibold text-sm truncate">{cat.name}</span>
                                        <Badge variant="outline" className="text-[10px] font-mono">{cat.slug}</Badge>
                                        {!cat.isActive && <Badge variant="secondary" className="text-[10px]">Inactive</Badge>}
                                    </div>
                                    {cat.description && (
                                        <p className="text-xs text-muted-foreground mt-0.5 truncate">{cat.description}</p>
                                    )}
                                </div>

                                {/* Course count pill */}
                                <div
                                    className="px-3 py-1 rounded-full text-xs font-bold flex-shrink-0"
                                    style={{ backgroundColor: `${cat.color}20`, color: cat.color || '#6366f1' }}
                                >
                                    {cat._count?.courses || 0} courses
                                </div>

                                {/* Color dot */}
                                <div
                                    className="w-3 h-3 rounded-full flex-shrink-0"
                                    style={{ backgroundColor: cat.color || '#6366f1' }}
                                />

                                {/* Actions */}
                                <div className="flex items-center gap-1 flex-shrink-0">
                                    <button
                                        title={cat.isActive ? 'Deactivate' : 'Activate'}
                                        onClick={() => handleToggleActive(cat)}
                                        className="p-1.5 rounded-lg hover:bg-muted transition-colors"
                                    >
                                        {cat.isActive
                                            ? <ToggleRight className="h-5 w-5 text-primary" />
                                            : <ToggleLeft className="h-5 w-5 text-muted-foreground" />
                                        }
                                    </button>
                                    <button
                                        title="Edit"
                                        onClick={() => openEdit(cat)}
                                        className="p-1.5 rounded-lg hover:bg-muted transition-colors"
                                    >
                                        <Pencil className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                                    </button>
                                    <button
                                        title="Delete"
                                        disabled={deletingId === cat.id}
                                        onClick={() => handleDelete(cat)}
                                        className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                                    >
                                        {deletingId === cat.id
                                            ? <Loader2 className="h-4 w-4 animate-spin text-red-500" />
                                            : <Trash2 className="h-4 w-4 text-muted-foreground hover:text-red-500" />
                                        }
                                    </button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
