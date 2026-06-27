"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"
import {
    Plus, Trash2, Tag, Calendar, Users, ToggleLeft, ToggleRight,
    TrendingDown, Copy, Search, Filter, ChevronDown, Sparkles,
    Clock, CheckCircle2, XCircle, AlertCircle, BarChart3, Ticket
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { couponApi, courseApi } from "@/lib/api"

type CouponStatus = "all" | "active" | "expired" | "inactive"

interface Coupon {
    id: string
    code: string
    discountPercent: number
    expiryDate: string
    isActive: boolean
    usageLimit?: number | null
    usedCount?: number
    startDate?: string | null
    courses?: { id: string; title: string }[]
    createdAt?: string
}

export default function AdminCouponsPage() {
    const [coupons, setCoupons] = useState<Coupon[]>([])
    const [courses, setCourses] = useState<{ id: string; title: string }[]>([])
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [search, setSearch] = useState("")
    const [statusFilter, setStatusFilter] = useState<CouponStatus>("all")

    const [formData, setFormData] = useState({
        code: "",
        discountPercent: "",
        startDate: "",
        expiryDate: "",
        usageLimit: "",
        courseIds: [] as string[]
    })
    const [courseSearch, setCourseSearch] = useState("")

    const loadData = async () => {
        try {
            setLoading(true)
            const [couponsRes, coursesRes] = await Promise.all([
                couponApi.getAll(),
                courseApi.getAll({ limit: 100 })
            ])
            setCoupons(couponsRes.data || [])
            setCourses(coursesRes.data?.courses || coursesRes.data || [])
        } catch (error: unknown) {
            const e = error as { response?: { data?: { error?: string } } }
            toast.error(e.response?.data?.error || "Failed to load data")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { loadData() }, [])

    const handleCreateCoupon = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!formData.code || !formData.discountPercent || !formData.expiryDate) {
            toast.error("Please fill all required fields")
            return
        }
        try {
            setSubmitting(true)
            await couponApi.create({
                code: formData.code,
                discountPercent: parseFloat(formData.discountPercent),
                startDate: formData.startDate ? new Date(formData.startDate).toISOString() : null,
                expiryDate: new Date(formData.expiryDate).toISOString(),
                usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : null,
                courseIds: formData.courseIds
            } as Parameters<typeof couponApi.create>[0])
            toast.success("Coupon created successfully!")
            setFormData({ code: "", discountPercent: "", startDate: "", expiryDate: "", usageLimit: "", courseIds: [] })
            loadData()
        } catch (error: unknown) {
            const e = error as { response?: { data?: { error?: string } } }
            toast.error(e.response?.data?.error || "Failed to create coupon")
        } finally {
            setSubmitting(false)
        }
    }

    const handleDeleteCoupon = async (id: string) => {
        if (!confirm("Are you sure you want to delete this coupon?")) return
        try {
            await couponApi.delete(id)
            toast.success("Coupon deleted")
            loadData()
        } catch (error: unknown) {
            const e = error as { response?: { data?: { error?: string } } }
            toast.error(e.response?.data?.error || "Failed to delete coupon")
        }
    }

    const handleCopyCode = (code: string) => {
        navigator.clipboard.writeText(code)
        toast.success(`Copied: ${code}`)
    }

    const toggleCourseSelection = (courseId: string) => {
        setFormData(prev => ({
            ...prev,
            courseIds: prev.courseIds.includes(courseId)
                ? prev.courseIds.filter(id => id !== courseId)
                : [...prev.courseIds, courseId]
        }))
    }

    const generateRandomCode = () => {
        const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
        const code = Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join("")
        setFormData(prev => ({ ...prev, code }))
    }

    const isExpired = (expiryDate: string) => new Date(expiryDate) < new Date()
    const daysUntilExpiry = (expiryDate: string) => {
        const diff = new Date(expiryDate).getTime() - new Date().getTime()
        return Math.ceil(diff / (1000 * 60 * 60 * 24))
    }

    const getCouponStatus = (coupon: Coupon) => {
        if (!coupon.isActive) return "inactive"
        if (isExpired(coupon.expiryDate)) return "expired"
        if (coupon.usageLimit && (coupon.usedCount ?? 0) >= coupon.usageLimit) return "exhausted"
        return "active"
    }

    // Filter coupons
    const filteredCoupons = coupons.filter(coupon => {
        const matchSearch = coupon.code.toLowerCase().includes(search.toLowerCase())
        if (!matchSearch) return false
        if (statusFilter === "all") return true
        const status = getCouponStatus(coupon)
        if (statusFilter === "active") return status === "active"
        if (statusFilter === "expired") return status === "expired" || status === "exhausted"
        if (statusFilter === "inactive") return status === "inactive"
        return true
    })

    const filteredCoursesList = courses.filter(c => c.title.toLowerCase().includes(courseSearch.toLowerCase()))

    const handleSelectAllCourses = () => {
        if (formData.courseIds.length === courses.length) {
            setFormData(prev => ({ ...prev, courseIds: [] }))
        } else {
            setFormData(prev => ({ ...prev, courseIds: courses.map(c => c.id) }))
        }
    }

    // Stats
    const stats = {
        total: coupons.length,
        active: coupons.filter(c => getCouponStatus(c) === "active").length,
        expired: coupons.filter(c => getCouponStatus(c) === "expired" || getCouponStatus(c) === "exhausted").length,
        inactive: coupons.filter(c => !c.isActive).length
    }

    const statusColors: Record<string, string> = {
        active: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-200",
        expired: "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400 border-red-200",
        exhausted: "bg-orange-100 text-orange-700 dark:bg-orange-950/40 dark:text-orange-400 border-orange-200",
        inactive: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-slate-200"
    }
    const statusIcons: Record<string, React.ReactNode> = {
        active: <CheckCircle2 className="h-3 w-3" />,
        expired: <XCircle className="h-3 w-3" />,
        exhausted: <AlertCircle className="h-3 w-3" />,
        inactive: <ToggleLeft className="h-3 w-3" />
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                        <Ticket className="h-6 w-6 text-blue-600" />
                        Coupon Management
                    </h1>
                    <p className="text-sm text-muted-foreground mt-0.5">Create and manage discount coupons for your courses</p>
                </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                    { label: "Total Coupons", value: stats.total, icon: <Tag className="h-4 w-4" />, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-950/30" },
                    { label: "Active", value: stats.active, icon: <CheckCircle2 className="h-4 w-4" />, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-950/30" },
                    { label: "Expired/Used Up", value: stats.expired, icon: <XCircle className="h-4 w-4" />, color: "text-red-600", bg: "bg-red-50 dark:bg-red-950/30" },
                    { label: "Inactive", value: stats.inactive, icon: <ToggleLeft className="h-4 w-4" />, color: "text-slate-500", bg: "bg-slate-50 dark:bg-slate-800" },
                ].map(stat => (
                    <div key={stat.label} className={`${stat.bg} rounded-xl p-4 flex items-center gap-3 border`}>
                        <div className={`${stat.color} shrink-0`}>{stat.icon}</div>
                        <div>
                            <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
                            <p className="text-xs text-muted-foreground">{stat.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Create Coupon Form */}
                <Card className="xl:col-span-1 h-fit shadow-sm border">
                    <CardHeader className="pb-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-t-xl">
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Plus className="h-4 w-4 text-blue-600" />
                            Create New Coupon
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-5">
                        <form onSubmit={handleCreateCoupon} className="space-y-4">
                            {/* Code */}
                            <div className="space-y-1.5">
                                <Label htmlFor="code" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                    Coupon Code *
                                </Label>
                                <div className="flex gap-2">
                                    <Input
                                        id="code"
                                        placeholder="e.g. SUMMER25"
                                        value={formData.code}
                                        onChange={e => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                                        required
                                        className="font-mono font-bold tracking-wider text-blue-700 dark:text-blue-400"
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="icon"
                                        onClick={generateRandomCode}
                                        title="Generate random code"
                                        className="shrink-0"
                                    >
                                        <Sparkles className="h-4 w-4" />
                                    </Button>
                                </div>
                                <p className="text-[11px] text-muted-foreground">Or click ✨ to auto-generate</p>
                            </div>

                            {/* Discount + Expiry */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <Label htmlFor="discount" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                        Discount % *
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            id="discount"
                                            type="number"
                                            min="1"
                                            max="100"
                                            placeholder="25"
                                            value={formData.discountPercent}
                                            onChange={e => setFormData(prev => ({ ...prev, discountPercent: e.target.value }))}
                                            required
                                            className="pr-8"
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">%</span>
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="startDate" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
                                        Start Date 
                                        <span className="font-normal text-muted-foreground lowercase">(optional)</span>
                                    </Label>
                                    <Input
                                        id="startDate"
                                        type="date"
                                        value={formData.startDate}
                                        onChange={e => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                                    />
                                </div>
                                <div className="space-y-1.5 col-span-2">
                                    <Label htmlFor="expiry" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                        Expiry Date *
                                    </Label>
                                    <Input
                                        id="expiry"
                                        type="date"
                                        value={formData.expiryDate}
                                        min={new Date().toISOString().split('T')[0]}
                                        onChange={e => setFormData(prev => ({ ...prev, expiryDate: e.target.value }))}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Usage Limit */}
                            <div className="space-y-1.5">
                                <Label htmlFor="usageLimit" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
                                    <Users className="h-3 w-3" />
                                    Max Usage Limit
                                    <span className="font-normal text-muted-foreground lowercase">(optional)</span>
                                </Label>
                                <Input
                                    id="usageLimit"
                                    type="number"
                                    min="1"
                                    placeholder="e.g. 100 (leave empty = unlimited)"
                                    value={formData.usageLimit}
                                    onChange={e => setFormData(prev => ({ ...prev, usageLimit: e.target.value }))}
                                />
                                <p className="text-[11px] text-muted-foreground">Total number of times this coupon can be used across all users</p>
                            </div>

                            {/* Quick presets */}
                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Quick Presets</Label>
                                <div className="flex flex-wrap gap-1.5">
                                    {[
                                        { label: "10% Off", discount: "10" },
                                        { label: "20% Off", discount: "20" },
                                        { label: "25% Off", discount: "25" },
                                        { label: "50% Off", discount: "50" }
                                    ].map(p => (
                                        <button
                                            key={p.label}
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, discountPercent: p.discount }))}
                                            className={`text-xs px-2.5 py-1 rounded-full border font-medium transition-colors ${formData.discountPercent === p.discount
                                                ? 'bg-blue-600 text-white border-blue-600'
                                                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-blue-400'
                                                }`}
                                        >
                                            {p.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Applicable Courses */}
                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                    Applicable Courses
                                    <span className="ml-1 font-normal lowercase">(empty = all courses)</span>
                                </Label>
                                <div className="border rounded-lg overflow-hidden flex flex-col">
                                    <div className="bg-slate-50 dark:bg-slate-800/50 px-3 py-2 border-b flex flex-col gap-2">
                                        <div className="relative">
                                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                                            <Input 
                                                placeholder="Search courses..." 
                                                value={courseSearch}
                                                onChange={e => setCourseSearch(e.target.value)}
                                                className="h-8 pl-8 text-xs"
                                            />
                                        </div>
                                        <div className="flex items-center justify-between text-[11px]">
                                            <span className="text-muted-foreground">
                                                {formData.courseIds.length === 0 ? "No courses selected → applies to all" : `${formData.courseIds.length} selected`}
                                            </span>
                                            <button 
                                                type="button" 
                                                onClick={handleSelectAllCourses}
                                                className="text-blue-600 font-medium hover:underline"
                                            >
                                                {formData.courseIds.length === courses.length ? "Deselect All" : "Select All"}
                                            </button>
                                        </div>
                                    </div>
                                    <div className="h-40 overflow-y-auto p-2 space-y-1">
                                        {filteredCoursesList.map(course => (
                                            <label key={course.id} className="flex items-center gap-2.5 px-2 py-1.5 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={formData.courseIds.includes(course.id)}
                                                    onChange={() => toggleCourseSelection(course.id)}
                                                    className="rounded text-blue-600"
                                                />
                                                <span className="text-xs text-slate-700 dark:text-slate-300 leading-tight">{course.title}</span>
                                            </label>
                                        ))}
                                        {filteredCoursesList.length === 0 && (
                                            <p className="text-xs text-muted-foreground text-center py-4">No matching courses found</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <Button
                                type="submit"
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold gap-2"
                                disabled={submitting}
                            >
                                <Tag className="h-4 w-4" />
                                {submitting ? "Creating..." : "Create Coupon"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Coupons List */}
                <div className="xl:col-span-2 space-y-4">
                    {/* Search + Filter bar */}
                    <div className="flex items-center gap-3 flex-wrap">
                        <div className="relative flex-1 min-w-48">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by coupon code..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                        <Select value={statusFilter} onValueChange={v => setStatusFilter(v as CouponStatus)}>
                            <SelectTrigger className="w-44 gap-2">
                                <Filter className="h-4 w-4 text-muted-foreground" />
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Coupons</SelectItem>
                                <SelectItem value="active">✅ Active</SelectItem>
                                <SelectItem value="expired">❌ Expired/Used</SelectItem>
                                <SelectItem value="inactive">⏸ Inactive</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* List */}
                    {loading ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="flex flex-col items-center gap-3 text-muted-foreground">
                                <div className="h-8 w-8 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
                                <span className="text-sm">Loading coupons...</span>
                            </div>
                        </div>
                    ) : filteredCoupons.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-64 gap-3 text-muted-foreground border-2 border-dashed rounded-2xl">
                            <Ticket className="h-10 w-10 opacity-30" />
                            <p className="font-medium">
                                {search || statusFilter !== 'all' ? 'No coupons match your filters' : 'No coupons created yet'}
                            </p>
                            <p className="text-sm">Use the form on the left to create your first coupon</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {filteredCoupons.map(coupon => {
                                const status = getCouponStatus(coupon)
                                const days = daysUntilExpiry(coupon.expiryDate)
                                const usagePct = coupon.usageLimit
                                    ? Math.min(100, ((coupon.usedCount ?? 0) / coupon.usageLimit) * 100)
                                    : null

                                return (
                                    <div
                                        key={coupon.id}
                                        className="border rounded-xl bg-white dark:bg-slate-900 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                                    >
                                        <div className="p-4">
                                            <div className="flex items-start justify-between gap-4">
                                                {/* Left: code + info */}
                                                <div className="flex items-start gap-3 min-w-0">
                                                    {/* Discount badge */}
                                                    <div className="shrink-0 w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex flex-col items-center justify-center text-white shadow">
                                                        <span className="text-lg font-extrabold leading-none">{coupon.discountPercent}%</span>
                                                        <span className="text-[9px] uppercase tracking-wide opacity-80">OFF</span>
                                                    </div>

                                                    <div className="min-w-0">
                                                        {/* Code */}
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            <h3 className="font-mono font-extrabold text-xl text-slate-900 dark:text-white tracking-wider">
                                                                {coupon.code}
                                                            </h3>
                                                            <button
                                                                onClick={() => handleCopyCode(coupon.code)}
                                                                className="text-slate-400 hover:text-blue-600 transition-colors"
                                                                title="Copy code"
                                                            >
                                                                <Copy className="h-3.5 w-3.5" />
                                                            </button>
                                                            {/* Status badge */}
                                                            <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border ${statusColors[status]}`}>
                                                                {statusIcons[status]}
                                                                {status.charAt(0).toUpperCase() + status.slice(1)}
                                                            </span>
                                                        </div>

                                                        {/* Meta info */}
                                                        <div className="flex items-center gap-3 mt-1.5 flex-wrap text-xs text-muted-foreground">
                                                            <span className="flex items-center gap-1">
                                                                <Calendar className="h-3 w-3" />
                                                                Expires {new Date(coupon.expiryDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                            </span>
                                                            {coupon.startDate && (
                                                                <span className="flex items-center gap-1 text-indigo-600">
                                                                    <Clock className="h-3 w-3" />
                                                                    Starts {new Date(coupon.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                                                </span>
                                                            )}
                                                            {!isExpired(coupon.expiryDate) && coupon.isActive && (
                                                                <span className={`flex items-center gap-1 font-medium ${days <= 7 ? 'text-orange-600' : days <= 30 ? 'text-yellow-600' : 'text-emerald-600'}`}>
                                                                    <Clock className="h-3 w-3" />
                                                                    {days > 0 ? `${days}d left` : 'Expires today'}
                                                                </span>
                                                            )}
                                                            <span className="flex items-center gap-1">
                                                                <Users className="h-3 w-3" />
                                                                {coupon.usedCount ?? 0} used
                                                                {coupon.usageLimit ? ` / ${coupon.usageLimit} limit` : ' (unlimited)'}
                                                            </span>
                                                        </div>

                                                        {/* Courses */}
                                                        <div className="mt-2 flex flex-wrap gap-1">
                                                            {coupon.courses && coupon.courses.length > 0 ? (
                                                                <>
                                                                    {coupon.courses.slice(0, 3).map(c => (
                                                                        <Badge key={c.id} variant="outline" className="text-[10px] py-0 h-5">
                                                                            {c.title}
                                                                        </Badge>
                                                                    ))}
                                                                    {coupon.courses.length > 3 && (
                                                                        <Badge variant="outline" className="text-[10px] py-0 h-5">
                                                                            +{coupon.courses.length - 3} more
                                                                        </Badge>
                                                                    )}
                                                                </>
                                                            ) : (
                                                                <span className="text-[11px] text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30 px-2 py-0.5 rounded-full border border-blue-200 dark:border-blue-800 font-medium">
                                                                    🌐 All Courses
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Right: actions */}
                                                <div className="flex flex-col items-end gap-2 shrink-0">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleDeleteCoupon(coupon.id)}
                                                        className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                                                        title="Delete coupon"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>

                                            {/* Usage progress bar */}
                                            {usagePct !== null && (
                                                <div className="mt-3 pt-3 border-t">
                                                    <div className="flex items-center justify-between text-[11px] text-muted-foreground mb-1">
                                                        <span className="flex items-center gap-1">
                                                            <BarChart3 className="h-3 w-3" />
                                                            Usage: {coupon.usedCount ?? 0} / {coupon.usageLimit}
                                                        </span>
                                                        <span className={`font-semibold ${usagePct >= 90 ? 'text-red-600' : usagePct >= 70 ? 'text-orange-600' : 'text-emerald-600'}`}>
                                                            {Math.round(usagePct)}%
                                                        </span>
                                                    </div>
                                                    <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full rounded-full transition-all ${usagePct >= 90 ? 'bg-red-500' : usagePct >= 70 ? 'bg-orange-400' : 'bg-emerald-500'}`}
                                                            style={{ width: `${usagePct}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
