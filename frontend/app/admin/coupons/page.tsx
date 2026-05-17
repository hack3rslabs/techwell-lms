"use client"

import * as React from 'react'
import { couponApi, courseApi } from '@/lib/api'
import {
    Tag, Plus, Pencil, Trash2, Loader2, CheckCircle2,
    XCircle, Calendar, Percent, BookOpen, Search, X
} from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Course {
    id: string
    title: string
}

interface Coupon {
    id: string
    couponName: string
    discountPercentage: number
    expiryDate: string
    courseIds: string[]
    courses: { id: string; title: string }[]
    isActive: boolean
    status: 'ACTIVE' | 'EXPIRED' | 'INACTIVE'
    createdAt: string
}

const EMPTY_FORM = {
    couponName: '',
    discountPercentage: '',
    expiryDate: '',
    courseIds: [] as string[]
}

export default function CouponsAdminPage() {
    const [coupons, setCoupons] = React.useState<Coupon[]>([])
    const [courses, setCourses] = React.useState<Course[]>([])
    const [isLoading, setIsLoading] = React.useState(true)
    const [search, setSearch] = React.useState('')
    const [showForm, setShowForm] = React.useState(false)
    const [editingId, setEditingId] = React.useState<string | null>(null)
    const [form, setForm] = React.useState(EMPTY_FORM)
    const [formLoading, setFormLoading] = React.useState(false)
    const [formError, setFormError] = React.useState<string | null>(null)
    const [toast, setToast] = React.useState<{ msg: string; type: 'success' | 'error' } | null>(null)
    const [deletingId, setDeletingId] = React.useState<string | null>(null)
    const [courseSearch, setCourseSearch] = React.useState('')
    const [showCourseDropdown, setShowCourseDropdown] = React.useState(false)
    const dropdownRef = React.useRef<HTMLDivElement>(null)

    const showToast = (msg: string, type: 'success' | 'error') => {
        setToast({ msg, type })
        setTimeout(() => setToast(null), 3500)
    }

    const loadData = async () => {
        setIsLoading(true)
        try {
            const [cRes, courseRes] = await Promise.all([
                couponApi.getAll(),
                courseApi.getAll({ page: 1 })
            ])
            setCoupons(cRes.data.coupons || [])
            const allCourses = courseRes.data.courses || courseRes.data || []
            setCourses(Array.isArray(allCourses) ? allCourses : [])
        } catch {
            showToast('Failed to load data', 'error')
        } finally {
            setIsLoading(false)
        }
    }

    React.useEffect(() => { loadData() }, [])

    // Close dropdown on outside click
    React.useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setShowCourseDropdown(false)
            }
        }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [])

    const openCreate = () => {
        setEditingId(null)
        setForm(EMPTY_FORM)
        setFormError(null)
        setShowForm(true)
    }

    const openEdit = (c: Coupon) => {
        setEditingId(c.id)
        setForm({
            couponName: c.couponName,
            discountPercentage: String(c.discountPercentage),
            expiryDate: c.expiryDate.split('T')[0],
            courseIds: c.courseIds || []
        })
        setFormError(null)
        setShowForm(true)
    }

    const closeForm = () => {
        setShowForm(false)
        setEditingId(null)
        setForm(EMPTY_FORM)
        setFormError(null)
        setCourseSearch('')
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setFormError(null)

        const disc = parseInt(form.discountPercentage)
        if (!form.couponName.trim()) return setFormError('Coupon name is required')
        if (isNaN(disc) || disc < 1 || disc > 100) return setFormError('Discount must be 1–100')
        if (!form.expiryDate) return setFormError('Expiry date is required')
        if (form.courseIds.length === 0) return setFormError('Select at least one course')

        setFormLoading(true)
        try {
            const payload = {
                couponName: form.couponName.trim().toUpperCase(),
                discountPercentage: disc,
                expiryDate: new Date(form.expiryDate).toISOString(),
                courseIds: form.courseIds
            }
            if (editingId) {
                await couponApi.update(editingId, payload)
                showToast('Coupon updated successfully!', 'success')
            } else {
                await couponApi.create(payload)
                showToast('Coupon created successfully!', 'success')
            }
            closeForm()
            loadData()
        } catch (err: unknown) {
            const e = err as { response?: { data?: { error?: string } } }
            setFormError(e?.response?.data?.error || 'Operation failed. Please try again.')
        } finally {
            setFormLoading(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this coupon? This action cannot be undone.')) return
        setDeletingId(id)
        try {
            await couponApi.delete(id)
            showToast('Coupon deleted', 'success')
            loadData()
        } catch {
            showToast('Failed to delete coupon', 'error')
        } finally {
            setDeletingId(null)
        }
    }

    const toggleCourse = (id: string) => {
        setForm(prev => ({
            ...prev,
            courseIds: prev.courseIds.includes(id)
                ? prev.courseIds.filter(c => c !== id)
                : [...prev.courseIds, id]
        }))
    }

    const filteredCoupons = coupons.filter(c =>
        c.couponName.toLowerCase().includes(search.toLowerCase())
    )

    const filteredCourses = courses.filter(c =>
        c.title.toLowerCase().includes(courseSearch.toLowerCase())
    )

    const statusBadge = (status: string) => {
        if (status === 'ACTIVE') return (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                <span className="h-1.5 w-1.5 rounded-full bg-green-500 inline-block" />Active
            </span>
        )
        if (status === 'EXPIRED') return (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                <span className="h-1.5 w-1.5 rounded-full bg-red-500 inline-block" />Expired
            </span>
        )
        return (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                <span className="h-1.5 w-1.5 rounded-full bg-gray-400 inline-block" />Inactive
            </span>
        )
    }

    return (
        <div className="p-6 space-y-6 max-w-7xl mx-auto">
            {/* Toast */}
            {toast && (
                <div className={`fixed top-6 right-6 z-[9999] flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-2xl border text-sm font-semibold transition-all animate-in slide-in-from-top-2 duration-300 ${toast.type === 'success' ? 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/80 dark:border-green-700 dark:text-green-200' : 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/80 dark:border-red-700 dark:text-red-200'}`}>
                    {toast.type === 'success' ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <XCircle className="h-4 w-4 shrink-0" />}
                    {toast.msg}
                </div>
            )}

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <div className="p-2 rounded-xl bg-primary/10">
                            <Tag className="h-5 w-5 text-primary" />
                        </div>
                        Coupon Management
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">Create and manage discount coupons for your courses</p>
                </div>
                <Button
                    id="create-coupon-btn"
                    onClick={openCreate}
                    className="flex items-center gap-2 shadow-lg shadow-primary/20 rounded-xl"
                >
                    <Plus className="h-4 w-4" />
                    Create Coupon
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                    { label: 'Total Coupons', value: coupons.length, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
                    { label: 'Active', value: coupons.filter(c => c.status === 'ACTIVE').length, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20' },
                    { label: 'Expired', value: coupons.filter(c => c.status === 'EXPIRED').length, color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-900/20' },
                    { label: 'Avg Discount', value: coupons.length ? `${Math.round(coupons.reduce((a, c) => a + c.discountPercentage, 0) / coupons.length)}%` : '—', color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20' }
                ].map(s => (
                    <div key={s.label} className={`rounded-xl p-4 border ${s.bg}`}>
                        <p className="text-xs text-muted-foreground font-medium">{s.label}</p>
                        <p className={`text-2xl font-black mt-1 ${s.color}`}>{s.value}</p>
                    </div>
                ))}
            </div>

            {/* Search */}
            <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search coupons..."
                    className="w-full h-10 pl-9 pr-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
                />
            </div>

            {/* Table */}
            <div className="border rounded-xl overflow-hidden shadow-sm">
                {isLoading ? (
                    <div className="flex items-center justify-center h-48">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : filteredCoupons.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-48 gap-3 text-muted-foreground">
                        <Tag className="h-10 w-10 opacity-30" />
                        <p className="text-sm font-medium">No coupons found</p>
                        <Button variant="outline" size="sm" onClick={openCreate}>Create your first coupon</Button>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-muted/50 border-b">
                                <tr>
                                    {['Coupon Name', 'Discount', 'Expiry Date', 'Applicable Courses', 'Status', 'Actions'].map(h => (
                                        <th key={h} className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider whitespace-nowrap">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {filteredCoupons.map(coupon => (
                                    <tr key={coupon.id} className="hover:bg-muted/30 transition-colors group">
                                        <td className="px-4 py-3.5">
                                            <div className="flex items-center gap-2">
                                                <div className="p-1.5 rounded-lg bg-primary/10">
                                                    <Tag className="h-3.5 w-3.5 text-primary" />
                                                </div>
                                                <span className="font-bold tracking-wide">{coupon.couponName}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3.5">
                                            <span className="inline-flex items-center gap-1 font-bold text-purple-600 dark:text-purple-400">
                                                <Percent className="h-3.5 w-3.5" />
                                                {coupon.discountPercentage}%
                                            </span>
                                        </td>
                                        <td className="px-4 py-3.5">
                                            <div className="flex items-center gap-1.5 text-muted-foreground">
                                                <Calendar className="h-3.5 w-3.5 shrink-0" />
                                                <span>{new Date(coupon.expiryDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3.5 max-w-[220px]">
                                            <div className="flex flex-wrap gap-1">
                                                {coupon.courses && coupon.courses.length > 0 ? (
                                                    <>
                                                        {coupon.courses.slice(0, 2).map(c => (
                                                            <span key={c.id} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-muted text-xs font-medium truncate max-w-[120px]">
                                                                <BookOpen className="h-3 w-3 shrink-0" />
                                                                <span className="truncate">{c.title}</span>
                                                            </span>
                                                        ))}
                                                        {coupon.courses.length > 2 && (
                                                            <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-bold">+{coupon.courses.length - 2} more</span>
                                                        )}
                                                    </>
                                                ) : (
                                                    <span className="text-muted-foreground text-xs">All Courses</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3.5">{statusBadge(coupon.status)}</td>
                                        <td className="px-4 py-3.5">
                                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => openEdit(coupon)}
                                                    className="p-1.5 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors"
                                                    title="Edit"
                                                >
                                                    <Pencil className="h-3.5 w-3.5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(coupon.id)}
                                                    disabled={deletingId === coupon.id}
                                                    className="p-1.5 rounded-lg hover:bg-destructive/10 hover:text-destructive transition-colors"
                                                    title="Delete"
                                                >
                                                    {deletingId === coupon.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Create / Edit Modal */}
            {showForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-background border rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between px-6 py-4 border-b">
                            <div>
                                <h2 className="text-lg font-bold">{editingId ? 'Edit Coupon' : 'Create Coupon'}</h2>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    {editingId ? 'Update the coupon details below' : 'Fill in the details to create a new discount coupon'}
                                </p>
                            </div>
                            <button onClick={closeForm} className="p-2 rounded-lg hover:bg-muted transition-colors">
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-5">
                            {/* Coupon Name */}
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold flex items-center gap-1.5">
                                    <Tag className="h-3.5 w-3.5 text-muted-foreground" />
                                    Coupon Name <span className="text-destructive">*</span>
                                </label>
                                <input
                                    id="form-coupon-name"
                                    type="text"
                                    value={form.couponName}
                                    onChange={e => setForm(p => ({ ...p, couponName: e.target.value.toUpperCase() }))}
                                    placeholder="e.g. JAVA50"
                                    required
                                    className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm uppercase font-mono focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
                                />
                                <p className="text-xs text-muted-foreground">Coupon names are automatically uppercased and must be unique.</p>
                            </div>

                            {/* Discount Percentage */}
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold flex items-center gap-1.5">
                                    <Percent className="h-3.5 w-3.5 text-muted-foreground" />
                                    Discount Percentage <span className="text-destructive">*</span>
                                </label>
                                <div className="relative">
                                    <input
                                        id="form-discount"
                                        type="number"
                                        min={1}
                                        max={100}
                                        value={form.discountPercentage}
                                        onChange={e => setForm(p => ({ ...p, discountPercentage: e.target.value }))}
                                        placeholder="e.g. 50"
                                        required
                                        className="w-full h-10 pl-3 pr-10 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-bold text-muted-foreground">%</span>
                                </div>
                                <p className="text-xs text-muted-foreground">Enter a value between 1 and 100.</p>
                            </div>

                            {/* Expiry Date */}
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold flex items-center gap-1.5">
                                    <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                                    Expiry Date <span className="text-destructive">*</span>
                                </label>
                                <input
                                    id="form-expiry"
                                    type="date"
                                    value={form.expiryDate}
                                    min={new Date().toISOString().split('T')[0]}
                                    onChange={e => setForm(p => ({ ...p, expiryDate: e.target.value }))}
                                    required
                                    className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
                                />
                                <p className="text-xs text-muted-foreground">Coupon automatically becomes invalid after this date.</p>
                            </div>

                            {/* Courses Multi-select */}
                            <div className="space-y-1.5" ref={dropdownRef}>
                                <label className="text-sm font-semibold flex items-center gap-1.5">
                                    <BookOpen className="h-3.5 w-3.5 text-muted-foreground" />
                                    Applicable Courses <span className="text-destructive">*</span>
                                </label>

                                {/* Selected chips */}
                                {form.courseIds.length > 0 && (
                                    <div className="flex flex-wrap gap-1.5 p-2 bg-muted/30 rounded-lg border">
                                        {form.courseIds.map(id => {
                                            const c = courses.find(c => c.id === id)
                                            return c ? (
                                                <span key={id} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                                                    {c.title}
                                                    <button type="button" onClick={() => toggleCourse(id)} className="hover:text-destructive transition-colors ml-0.5">
                                                        <X className="h-3 w-3" />
                                                    </button>
                                                </span>
                                            ) : null
                                        })}
                                    </div>
                                )}

                                <div className="relative">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                                        <input
                                            type="text"
                                            value={courseSearch}
                                            onChange={e => { setCourseSearch(e.target.value); setShowCourseDropdown(true) }}
                                            onFocus={() => setShowCourseDropdown(true)}
                                            placeholder="Search and select courses..."
                                            className="w-full h-10 pl-8 pr-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
                                        />
                                    </div>
                                    {showCourseDropdown && (
                                        <div className="absolute z-20 w-full mt-1 bg-background border rounded-xl shadow-xl max-h-52 overflow-y-auto">
                                            {filteredCourses.length === 0 ? (
                                                <p className="text-sm text-muted-foreground p-3 text-center">No courses found</p>
                                            ) : filteredCourses.map(c => (
                                                <button
                                                    key={c.id}
                                                    type="button"
                                                    onClick={() => { toggleCourse(c.id); setCourseSearch('') }}
                                                    className={`w-full flex items-center justify-between px-3 py-2.5 text-sm hover:bg-muted/50 transition-colors ${form.courseIds.includes(c.id) ? 'bg-primary/5 text-primary font-medium' : ''}`}
                                                >
                                                    <span className="truncate text-left">{c.title}</span>
                                                    {form.courseIds.includes(c.id) && <CheckCircle2 className="h-4 w-4 text-primary shrink-0 ml-2" />}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <p className="text-xs text-muted-foreground">Coupon will only work for the selected courses.</p>
                            </div>

                            {formError && (
                                <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium">
                                    <XCircle className="h-4 w-4 shrink-0" />
                                    {formError}
                                </div>
                            )}

                            <div className="flex gap-3 pt-2">
                                <Button type="button" variant="outline" onClick={closeForm} className="flex-1">
                                    Cancel
                                </Button>
                                <Button
                                    id="submit-coupon-btn"
                                    type="submit"
                                    disabled={formLoading}
                                    className="flex-1 shadow-lg shadow-primary/20"
                                >
                                    {formLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                    {editingId ? 'Update Coupon' : 'Create Coupon'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
