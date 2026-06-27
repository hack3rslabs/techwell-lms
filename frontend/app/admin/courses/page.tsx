"use client"

import * as React from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
    Loader2, Plus, BookOpen, Users, Trash2, GraduationCap,
    Search, Filter, Eye, EyeOff, PencilLine, TrendingUp,
    ChevronLeft, ChevronRight, RefreshCw, Download
} from 'lucide-react'
import * as XLSX from 'xlsx'
import { courseApi } from '@/lib/api'
import { useAuth } from '@/lib/auth-context'
import Image from 'next/image'
import { getFullImageUrl } from '@/lib/image-utils'
import { toast } from 'sonner'

interface Course {
    id: string
    title: string
    category: string
    isPublished: boolean
    difficulty: string
    price: number
    discountPrice?: number
    bannerUrl?: string
    thumbnail?: string
    courseType?: string
    createdAt?: string
    _count?: { enrollments: number; modules: number }
}

const DIFFICULTY_OPTIONS = [
    { value: '', label: 'All Levels' },
    { value: 'BEGINNER', label: 'Beginner' },
    { value: 'INTERMEDIATE', label: 'Intermediate' },
    { value: 'ADVANCED', label: 'Advanced' },
]

const STATUS_OPTIONS = [
    { value: '', label: 'All Status' },
    { value: 'published', label: 'Published' },
    { value: 'draft', label: 'Draft' },
]

const PAGE_SIZE = 12

export default function AdminCoursesPage() {
    const router = useRouter()
    const { canWrite } = useAuth()

    const [courses, setCourses] = React.useState<Course[]>([])
    const [allCourses, setAllCourses] = React.useState<Course[]>([])
    const [isLoading, setIsLoading] = React.useState(true)
    const [isDeleting, setIsDeleting] = React.useState<string | null>(null)
    const [isTogglingPublish, setIsTogglingPublish] = React.useState<string | null>(null)

    // Filters
    const [search, setSearch] = React.useState('')
    const [debouncedSearch, setDebouncedSearch] = React.useState('')
    const [categoryFilter, setCategoryFilter] = React.useState('')
    const [difficultyFilter, setDifficultyFilter] = React.useState('')
    const [statusFilter, setStatusFilter] = React.useState('')
    const [currentPage, setCurrentPage] = React.useState(1)

    // Debounce search
    React.useEffect(() => {
        const t = setTimeout(() => setDebouncedSearch(search), 300)
        return () => clearTimeout(t)
    }, [search])

    // Fetch all courses (admin sees all including drafts)
    const fetchCourses = React.useCallback(async () => {
        setIsLoading(true)
        try {
            const res = await api.get('/courses', { params: { limit: 1000 } })
            const data: Course[] = res.data.courses || []
            setAllCourses(data)
        } catch (error) {
            console.error(error)
            toast.error('Failed to fetch courses')
        } finally {
            setIsLoading(false)
        }
    }, [])

    React.useEffect(() => { fetchCourses() }, [fetchCourses])

    // Derive unique categories from fetched courses
    const categories = React.useMemo(() => {
        const cats = Array.from(new Set(allCourses.map(c => c.category).filter(Boolean)))
        return cats.sort()
    }, [allCourses])

    // Apply all filters client-side
    const filtered = React.useMemo(() => {
        let result = allCourses
        if (debouncedSearch) {
            const q = debouncedSearch.toLowerCase()
            result = result.filter(c =>
                c.title.toLowerCase().includes(q) ||
                c.category?.toLowerCase().includes(q)
            )
        }
        if (categoryFilter) result = result.filter(c => c.category === categoryFilter)
        if (difficultyFilter) result = result.filter(c => c.difficulty === difficultyFilter)
        if (statusFilter === 'published') result = result.filter(c => c.isPublished)
        if (statusFilter === 'draft') result = result.filter(c => !c.isPublished)
        return result
    }, [allCourses, debouncedSearch, categoryFilter, difficultyFilter, statusFilter])

    // Pagination
    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
    const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

    React.useEffect(() => { setCurrentPage(1) }, [debouncedSearch, categoryFilter, difficultyFilter, statusFilter])

    // Stats
    const stats = React.useMemo(() => ({
        total: allCourses.length,
        published: allCourses.filter(c => c.isPublished).length,
        drafts: allCourses.filter(c => !c.isPublished).length,
        totalEnrollments: allCourses.reduce((sum, c) => sum + (c._count?.enrollments || 0), 0),
    }), [allCourses])

    const handleDelete = async (courseId: string, title: string) => {
        if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return
        setIsDeleting(courseId)
        try {
            await courseApi.delete(courseId)
            setAllCourses(prev => prev.filter(c => c.id !== courseId))
            toast.success('Course deleted successfully')
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Failed to delete course')
        } finally {
            setIsDeleting(null)
        }
    }

    const handleTogglePublish = async (course: Course) => {
        setIsTogglingPublish(course.id)
        try {
            const newStatus = course.isPublished ? 'DRAFT' : 'PUBLISHED'
            await api.patch(`/courses/${course.id}/status`, { status: newStatus })
            setAllCourses(prev => prev.map(c =>
                c.id === course.id ? { ...c, isPublished: !c.isPublished } : c
            ))
            toast.success(course.isPublished ? 'Course unpublished' : 'Course published!')
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Failed to update status')
        } finally {
            setIsTogglingPublish(null)
        }
    }

    const getDifficultyColor = (diff: string) => {
        switch (diff) {
            case 'BEGINNER': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
            case 'INTERMEDIATE': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
            case 'ADVANCED': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
            default: return 'bg-gray-100 text-gray-600'
        }
    }

    const clearFilters = () => {
        setSearch('')
        setCategoryFilter('')
        setDifficultyFilter('')
        setStatusFilter('')
    }

    const handleExportExcel = () => {
        try {
            const dataToExport = filtered.map(c => ({
                Title: c.title,
                Category: c.category,
                Difficulty: c.difficulty,
                Status: c.isPublished ? 'Published' : 'Draft',
                Price: c.price,
                DiscountPrice: c.discountPrice || '',
                CourseType: c.courseType || '',
                Enrollments: c._count?.enrollments || 0,
                Modules: c._count?.modules || 0
            }))
            const ws = XLSX.utils.json_to_sheet(dataToExport)
            const wb = XLSX.utils.book_new()
            XLSX.utils.book_append_sheet(wb, ws, "Courses")
            XLSX.writeFile(wb, `Courses_Export_${new Date().toISOString().split('T')[0]}.xlsx`)
            toast.success("Exported to Excel successfully")
        } catch (error) {
            toast.error("Failed to export to Excel")
        }
    }

    const hasActiveFilters = search || categoryFilter || difficultyFilter || statusFilter

    return (
        <div className="space-y-6">

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Courses</h1>
                    <p className="text-muted-foreground mt-1">
                        Manage your curriculum — {stats.total} courses total
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={handleExportExcel} disabled={isLoading || filtered.length === 0}>
                        <Download className="h-4 w-4 mr-2" />
                        Export Excel
                    </Button>
                    <Button variant="outline" size="sm" onClick={fetchCourses} disabled={isLoading}>
                        <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                    <Button onClick={() => router.push('/admin/courses/new')}>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Course
                    </Button>
                </div>
            </div>

            {/* Stats Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Total Courses', value: stats.total, icon: BookOpen, color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/30' },
                    { label: 'Published', value: stats.published, icon: Eye, color: 'text-green-600 bg-green-50 dark:bg-green-950/30' },
                    { label: 'Drafts', value: stats.drafts, icon: EyeOff, color: 'text-yellow-600 bg-yellow-50 dark:bg-yellow-950/30' },
                    { label: 'Total Enrollments', value: stats.totalEnrollments, icon: Users, color: 'text-purple-600 bg-purple-50 dark:bg-purple-950/30' },
                ].map((s) => (
                    <Card key={s.label} className="border-border/50">
                        <CardContent className="p-4 flex items-center gap-4">
                            <div className={`h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0 ${s.color}`}>
                                <s.icon className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{s.value}</p>
                                <p className="text-xs text-muted-foreground">{s.label}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Search & Filters */}
            <Card className="border-border/50">
                <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row gap-3">
                        {/* Search */}
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="admin-course-search"
                                placeholder="Search by title or category..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="pl-10"
                            />
                        </div>

                        {/* Category */}
                        <select
                            value={categoryFilter}
                            onChange={e => setCategoryFilter(e.target.value)}
                            className="h-10 px-3 rounded-md border border-input bg-background text-sm min-w-[160px]"
                        >
                            <option value="">All Categories</option>
                            {categories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>

                        {/* Difficulty */}
                        <select
                            value={difficultyFilter}
                            onChange={e => setDifficultyFilter(e.target.value)}
                            className="h-10 px-3 rounded-md border border-input bg-background text-sm min-w-[130px]"
                        >
                            {DIFFICULTY_OPTIONS.map(d => (
                                <option key={d.value} value={d.value}>{d.label}</option>
                            ))}
                        </select>

                        {/* Status */}
                        <select
                            value={statusFilter}
                            onChange={e => setStatusFilter(e.target.value)}
                            className="h-10 px-3 rounded-md border border-input bg-background text-sm min-w-[120px]"
                        >
                            {STATUS_OPTIONS.map(s => (
                                <option key={s.value} value={s.value}>{s.label}</option>
                            ))}
                        </select>

                        {hasActiveFilters && (
                            <Button variant="ghost" size="sm" onClick={clearFilters} className="whitespace-nowrap">
                                <Filter className="h-4 w-4 mr-1" /> Clear
                            </Button>
                        )}
                    </div>

                    {/* Results count */}
                    <div className="flex items-center justify-between mt-3 text-sm text-muted-foreground">
                        <span>
                            Showing <strong className="text-foreground">{paginated.length}</strong> of{' '}
                            <strong className="text-foreground">{filtered.length}</strong> courses
                            {hasActiveFilters && ' (filtered)'}
                        </span>
                        {filtered.length > PAGE_SIZE && (
                            <span>Page {currentPage} of {totalPages}</span>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Course Grid */}
            {isLoading ? (
                <div className="flex justify-center py-20">
                    <div className="text-center">
                        <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-3" />
                        <p className="text-muted-foreground text-sm">Loading courses...</p>
                    </div>
                </div>
            ) : paginated.length === 0 ? (
                <div className="text-center py-20 bg-muted/20 rounded-2xl border border-dashed border-border">
                    <GraduationCap className="h-14 w-14 mx-auto text-muted-foreground/30 mb-4" />
                    <h3 className="text-lg font-semibold mb-1">
                        {hasActiveFilters ? 'No courses match your filters' : 'No courses yet'}
                    </h3>
                    <p className="text-muted-foreground text-sm mb-4">
                        {hasActiveFilters
                            ? 'Try adjusting your search or filter criteria.'
                            : 'Create your first course to get started.'}
                    </p>
                    {hasActiveFilters ? (
                        <Button variant="outline" onClick={clearFilters}>Clear Filters</Button>
                    ) : (
                        <Button onClick={() => router.push('/admin/courses/new')}>
                            <Plus className="h-4 w-4 mr-2" /> Create First Course
                        </Button>
                    )}
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                        {paginated.map((course) => (
                            <Card
                                key={course.id}
                                className="group overflow-hidden flex flex-col hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 border-border/50"
                            >
                                {/* Thumbnail */}
                                <div className="h-36 relative bg-gradient-to-br from-primary/10 to-purple-500/10 overflow-hidden">
                                    {(course.bannerUrl || course.thumbnail) ? (
                                        <Image
                                            src={getFullImageUrl(course.bannerUrl || course.thumbnail)}
                                            alt={course.title}
                                            fill
                                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).style.display = 'none'
                                            }}
                                        />
                                    ) : (
                                        <GraduationCap className="absolute inset-0 m-auto h-10 w-10 text-primary/20" />
                                    )}
                                    {/* Status badge overlay */}
                                    <div className="absolute top-2 right-2">
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                            course.isPublished
                                                ? 'bg-green-500 text-white'
                                                : 'bg-yellow-500 text-white'
                                        }`}>
                                            {course.isPublished ? 'Live' : 'Draft'}
                                        </span>
                                    </div>
                                    {/* Course type */}
                                    {course.courseType && (
                                        <div className="absolute bottom-2 left-2">
                                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-black/60 text-white">
                                                {course.courseType}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                <CardContent className="p-4 flex flex-col flex-1">
                                    {/* Category + Difficulty */}
                                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                                        <Badge variant="outline" className="text-[10px] truncate max-w-[110px]">
                                            {course.category}
                                        </Badge>
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${getDifficultyColor(course.difficulty)}`}>
                                            {course.difficulty}
                                        </span>
                                    </div>

                                    {/* Title */}
                                    <h3 className="font-semibold text-sm mb-1 line-clamp-2 min-h-[40px] group-hover:text-primary transition-colors">
                                        {course.title}
                                    </h3>

                                    {/* Stats */}
                                    <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3 mt-auto">
                                        <span className="flex items-center gap-1">
                                            <BookOpen className="h-3 w-3" />
                                            {course._count?.modules || 0} modules
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Users className="h-3 w-3" />
                                            {course._count?.enrollments || 0} enrolled
                                        </span>
                                    </div>

                                    {/* Price + Actions */}
                                    <div className="pt-3 border-t border-border/50 flex items-center justify-between">
                                        <div>
                                            <span className="font-bold text-base">
                                                {course.price === 0 ? 'Free' : `₹${course.discountPrice || course.price}`}
                                            </span>
                                            {course.discountPrice && course.price > 0 && (
                                                <span className="text-xs text-muted-foreground line-through ml-1">₹{course.price}</span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            {/* Publish/Unpublish toggle */}
                                            {canWrite('COURSES') && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    title={course.isPublished ? 'Unpublish' : 'Publish'}
                                                    className={`p-1.5 h-7 w-7 ${course.isPublished ? 'text-green-600 hover:text-yellow-600' : 'text-muted-foreground hover:text-green-600'}`}
                                                    onClick={() => handleTogglePublish(course)}
                                                    disabled={isTogglingPublish === course.id}
                                                >
                                                    {isTogglingPublish === course.id
                                                        ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                        : course.isPublished
                                                            ? <Eye className="h-3.5 w-3.5" />
                                                            : <EyeOff className="h-3.5 w-3.5" />
                                                    }
                                                </Button>
                                            )}
                                            {/* Delete */}
                                            {canWrite('COURSES') && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 p-1.5 h-7 w-7"
                                                    onClick={() => handleDelete(course.id, course.title)}
                                                    disabled={isDeleting === course.id}
                                                >
                                                    {isDeleting === course.id
                                                        ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                        : <Trash2 className="h-3.5 w-3.5" />
                                                    }
                                                </Button>
                                            )}
                                            {/* Manage */}
                                            <Button
                                                size="sm"
                                                variant="secondary"
                                                className="h-7 text-xs px-2.5"
                                                onClick={() => router.push(`/admin/courses/${course.id}/edit`)}
                                            >
                                                <PencilLine className="h-3 w-3 mr-1" />
                                                {canWrite('COURSES') ? 'Manage' : 'View'}
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-center gap-2 pt-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <div className="flex gap-1">
                                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                                    let page = i + 1
                                    if (totalPages > 7) {
                                        if (currentPage <= 4) page = i + 1
                                        else if (currentPage >= totalPages - 3) page = totalPages - 6 + i
                                        else page = currentPage - 3 + i
                                    }
                                    return (
                                        <Button
                                            key={page}
                                            variant={currentPage === page ? 'default' : 'outline'}
                                            size="sm"
                                            className="h-8 w-8 p-0"
                                            onClick={() => setCurrentPage(page)}
                                        >
                                            {page}
                                        </Button>
                                    )
                                })}
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    )}
                </>
            )}
        </div>
    )
}
